// Zero-dependency Node backend for 1v1 Yahtzee.
//
// The server owns the dice. A client never generates a number: it asks to
// roll, and the server answers with five values and a throw seed. The seed is
// what the tray animates, so both players watch the same throw land on the
// same faces. (The physics itself runs locally on each machine, so a stray
// float could in principle nudge a die to a different resting SPOT on one
// screen -- but never to a different number, because every client relabels the
// faces to the values below. The score is authoritative; only the scatter is
// local.)
//
//   GET  /api/health        counts, for a quick look
//   WS   /api/socket        everything else
//
// Protocol, client -> server (JSON text frames):
//   {t:"hello", id, name}        introduce yourself; server replies "welcome"
//   {t:"quick"}                  join the 1v1 queue
//   {t:"create"}                 open a private room, get a code back
//   {t:"join", code}             join someone's private room
//   {t:"leave"}                  back out of a queue, room or game
//   {t:"roll"}                   roll the dice you are not holding
//   {t:"hold", held:[b,b,b,b,b]} keep these between rolls
//   {t:"score", cat}             write this roll into a box; ends your turn
//   {t:"again"}                  offer a rematch
//
// Protocol, server -> client:
//   {t:"welcome", id}
//   {t:"queued"} / {t:"room", code, names}
//   {t:"start", seat, names}     a match begins; you are players[seat]
//   {t:"state", ...}             the whole board, after every change
//   {t:"rolled", by, values, seed, held}
//   {t:"scored", seat, cat, pts, yahtzeeBonus}
//   {t:"over", totals, winner}
//   {t:"peer", status}           "left" | "bot" - your opponent went away
//   {t:"error", msg}
//
// A match is always exactly two players. If one leaves, the bot finishes their
// game rather than stranding the other person mid-scorecard.
//
// Production: nginx proxies /yahtzee/api/* here (with Upgrade headers for the
// socket). A leading "/yahtzee" is stripped below so the same routes work
// proxied or direct.
"use strict";

const http = require("http");
const crypto = require("crypto");

const PORT = process.env.PORT || 8024;

/* rules and bot are ES modules (the browser loads the very same files), so
   they come in through a dynamic import rather than require(). */
let R = null, BOT = null;

/* ---------- tunables ---------- */
// Overridable so the timings can be tuned in the unit file, and so tests do
// not have to sit through a real 45-second turn.
const TURN_MS = +process.env.TURN_MS || 45000;       // before the bot plays for you
const BOT_THINK_MS = +process.env.BOT_THINK_MS || 800;   // pause between a bot's rolls
const ROLL_WATCH_MS = +process.env.ROLL_WATCH_MS || 2200; // time for a throw to animate
const QUEUE_SWEEP_MS = 1000;

/* ========================================================================
   WebSocket, hand-rolled. Same codec as puzzle/server.js -- text frames,
   ping/pong, close, continuation. That is all this app speaks.
   ======================================================================== */
const WS_GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
const MAX_FRAME = 64 * 1024;

const wsAccept = (key) =>
  crypto.createHash("sha1").update(key + WS_GUID).digest("base64");

function encodeFrame(opcode, payload) {
  const len = payload.length;
  let header;
  if (len < 126) { header = Buffer.alloc(2); header[1] = len; }
  else if (len < 65536) { header = Buffer.alloc(4); header[1] = 126; header.writeUInt16BE(len, 2); }
  else {
    header = Buffer.alloc(10); header[1] = 127;
    header.writeUInt32BE(Math.floor(len / 4294967296), 2);
    header.writeUInt32BE(len >>> 0, 6);
  }
  header[0] = 0x80 | opcode;
  return Buffer.concat([header, payload]);
}

function makeParser(onMessage, onClose, onPing) {
  let buf = Buffer.alloc(0);
  let fragOp = 0, frags = [];
  return function feed(chunk) {
    buf = buf.length ? Buffer.concat([buf, chunk]) : chunk;
    for (;;) {
      if (buf.length < 2) return true;
      const b0 = buf[0], b1 = buf[1];
      const fin = (b0 & 0x80) !== 0;
      const opcode = b0 & 0x0f;
      const masked = (b1 & 0x80) !== 0;
      let len = b1 & 0x7f;
      let off = 2;
      if (len === 126) {
        if (buf.length < off + 2) return true;
        len = buf.readUInt16BE(off); off += 2;
      } else if (len === 127) {
        if (buf.length < off + 8) return true;
        len = buf.readUInt32BE(off) * 4294967296 + buf.readUInt32BE(off + 4); off += 8;
      }
      if (len > MAX_FRAME) return false;
      if (!masked) return false;                    // clients MUST mask
      if (buf.length < off + 4) return true;
      const mask = buf.slice(off, off + 4); off += 4;
      if (buf.length < off + len) return true;
      const payload = Buffer.allocUnsafe(len);
      for (let i = 0; i < len; i++) payload[i] = buf[off + i] ^ mask[i & 3];
      buf = buf.slice(off + len);

      if (opcode === 0x8) { onClose(); return true; }
      if (opcode === 0x9) { onPing(payload); continue; }
      if (opcode === 0xa) continue;                 // pong - liveness only
      if (opcode === 0x0) {                         // continuation
        if (!fragOp) return false;
        frags.push(payload);
        if (fin) {
          const full = Buffer.concat(frags);
          frags = []; const op = fragOp; fragOp = 0;
          if (op === 0x1) onMessage(full.toString("utf8"));
        }
        continue;
      }
      if (opcode === 0x1 || opcode === 0x2) {
        if (!fin) { fragOp = opcode; frags = [payload]; continue; }
        if (opcode === 0x1) onMessage(payload.toString("utf8"));
        continue;
      }
      return false;                                 // unknown opcode
    }
  };
}

/* ========================================================================
   People
   ======================================================================== */
const peers = new Set();   // { socket, id, name, room, seat }

function send(peer, obj) {
  if (!peer || !peer.socket) return;
  try { peer.socket.write(encodeFrame(0x1, Buffer.from(JSON.stringify(obj)))); } catch { /* gone */ }
}

// Strip control characters and angle brackets out of a display name.
const CONTROL_CHARS = /[\u0000-\u001f\u007f<>]/g;
const cleanName = (s) =>
  String(s || "").replace(CONTROL_CHARS, "").trim().slice(0, 18) || "someone";

setInterval(() => {
  const ping = encodeFrame(0x9, Buffer.alloc(0));
  for (const p of peers) { try { p.socket.write(ping); } catch { /* gone */ } }
}, 25000);

/* ========================================================================
   Rooms
   ======================================================================== */
const rooms = new Map();     // code -> room
let queue = [];              // peers waiting for a quick match

// No I/O/0/1 -- these get read aloud and typed in by hand.
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function newCode() {
  for (;;) {
    let c = "";
    for (let i = 0; i < 4; i++) c += CODE_ALPHABET[crypto.randomInt(0, CODE_ALPHABET.length)];
    if (!rooms.has(c)) return c;
  }
}

function makeRoom(isPrivate) {
  const room = {
    code: newCode(),
    private: !!isPrivate,
    seats: [null, null],       // peers, or null once someone leaves
    names: ["", ""],
    isBot: [false, false],
    cards: null,
    turn: 0,
    rollsLeft: 3,
    dice: [1, 1, 1, 1, 1],
    held: [false, false, false, false, false],
    rolledThisTurn: false,
    started: false,
    over: false,
    deadline: 0,
    timer: null,
    rematch: [false, false],
  };
  rooms.set(room.code, room);
  return room;
}

const roomPeers = (room) => room.seats.filter(Boolean);

function dropRoom(room) {
  clearTimeout(room.timer);
  rooms.delete(room.code);
}

/* ---------- what a client is told the world looks like ---------- */
function stateOf(room) {
  return {
    t: "state",
    code: room.code,
    names: room.names,
    isBot: room.isBot,
    cards: room.cards,
    turn: room.turn,
    rollsLeft: room.rollsLeft,
    dice: room.dice,
    held: room.held,
    rolledThisTurn: room.rolledThisTurn,
    started: room.started,
    over: room.over,
    rematch: room.rematch,
    msLeft: room.deadline ? Math.max(0, room.deadline - Date.now()) : 0,
  };
}

function broadcastRoom(room, obj) {
  for (const p of roomPeers(room)) send(p, obj);
}
const pushState = (room) => broadcastRoom(room, stateOf(room));

/* ========================================================================
   The game
   ======================================================================== */
function startGame(room) {
  room.cards = [R.emptyCard(), R.emptyCard()];
  room.turn = 0;
  room.dice = [1, 1, 1, 1, 1];
  room.started = true;
  room.over = false;
  room.rematch = [false, false];

  room.seats.forEach((p, seat) => {
    if (p) send(p, { t: "start", seat, names: room.names, code: room.code });
  });
  beginTurn(room);
}

function beginTurn(room) {
  room.rollsLeft = 3;
  room.held = [false, false, false, false, false];
  room.rolledThisTurn = false;
  armTimer(room);
  pushState(room);
  if (room.isBot[room.turn]) setTimeout(() => botPlay(room, room.turn), BOT_THINK_MS);
}

function armTimer(room) {
  clearTimeout(room.timer);
  if (room.over) return;
  // A bot is not on the clock; it plays on its own schedule.
  if (room.isBot[room.turn]) { room.deadline = 0; return; }
  room.deadline = Date.now() + TURN_MS;
  room.timer = setTimeout(() => {
    // Out of time: play the turn for them rather than letting the match rot.
    if (room.over) return;
    const seat = room.turn;
    if (!room.rolledThisTurn) doRoll(room, seat, true);
    setTimeout(() => {
      if (room.over || room.turn !== seat) return;
      doScore(room, seat, BOT.chooseCategory(room.dice, room.cards[seat]), true);
    }, ROLL_WATCH_MS);
  }, TURN_MS);
}

// The only place dice numbers come from.
function doRoll(room, seat, auto = false) {
  if (room.over || room.turn !== seat || room.rollsLeft <= 0) return;
  const values = room.dice.map((v, i) =>
    room.rolledThisTurn && room.held[i] ? v : crypto.randomInt(1, 7)
  );
  const seed = crypto.randomInt(0, 2147483647);
  room.dice = values;
  room.rollsLeft--;
  room.rolledThisTurn = true;
  broadcastRoom(room, { t: "rolled", by: seat, values, seed, held: room.held.slice(), auto });
  armTimer(room);
  pushState(room);
}

function doScore(room, seat, cat, auto = false) {
  if (room.over || room.turn !== seat || !room.rolledThisTurn) return;
  const card = room.cards[seat];
  if (!R.CATEGORIES.includes(cat)) return;
  if (!R.legalCategories(room.dice, card).includes(cat)) return;

  const gotBonus = R.earnsYahtzeeBonus(room.dice, card);
  room.cards[seat] = R.applyScore(card, cat, room.dice);
  broadcastRoom(room, {
    t: "scored", seat, cat, auto,
    pts: room.cards[seat][cat],
    yahtzeeBonus: gotBonus,
  });

  if (R.isComplete(room.cards[0]) && R.isComplete(room.cards[1])) return endGame(room);

  room.turn = seat === 0 ? 1 : 0;
  beginTurn(room);
}

function endGame(room) {
  room.over = true;
  clearTimeout(room.timer);
  room.deadline = 0;
  const totals = room.cards.map((c) => R.totals(c).grand);
  const winner = totals[0] === totals[1] ? -1 : totals[0] > totals[1] ? 0 : 1;
  pushState(room);
  broadcastRoom(room, { t: "over", totals, winner });
}

/* ---------- the bot, playing a seat ---------- */
function botPlay(room, seat) {
  if (room.over || room.turn !== seat || !room.isBot[seat]) return;

  const finish = () => {
    if (room.over || room.turn !== seat) return;
    doScore(room, seat, BOT.chooseCategory(room.dice, room.cards[seat]));
  };

  const step = () => {
    if (room.over || room.turn !== seat) return;
    doRoll(room, seat);
    if (room.rollsLeft === 0) return setTimeout(finish, ROLL_WATCH_MS);
    setTimeout(() => {
      if (room.over || room.turn !== seat) return;
      const hold = BOT.chooseHolds(room.dice, room.rollsLeft, room.cards[seat]);
      room.held = hold;
      pushState(room);
      // Happy with all five? Stop rolling and write it down.
      setTimeout(hold.every(Boolean) ? finish : step, BOT_THINK_MS);
    }, ROLL_WATCH_MS);
  };
  step();
}

/* ========================================================================
   Matchmaking -- two players, never more
   ======================================================================== */
function enterQueue(peer) {
  leaveEverything(peer);
  if (queue.includes(peer)) return;
  queue.push(peer);
  send(peer, { t: "queued" });
  drainQueue();
}

function drainQueue() {
  queue = queue.filter((p) => peers.has(p));
  while (queue.length >= 2) {
    const a = queue.shift(), b = queue.shift();
    if (!peers.has(a)) { if (peers.has(b)) queue.unshift(b); continue; }
    if (!peers.has(b)) { queue.unshift(a); continue; }
    const room = makeRoom(false);
    seat(room, a, 0);
    seat(room, b, 1);
    startGame(room);
  }
}

function seat(room, peer, i) {
  room.seats[i] = peer;
  room.names[i] = peer.name;
  room.isBot[i] = false;
  peer.room = room.code;
  peer.seat = i;
}

function createPrivate(peer) {
  leaveEverything(peer);
  const room = makeRoom(true);
  seat(room, peer, 0);
  send(peer, { t: "room", code: room.code, names: room.names });
}

function joinPrivate(peer, code) {
  const room = rooms.get(String(code || "").toUpperCase().trim());
  if (!room) return send(peer, { t: "error", msg: "No room with that code." });
  if (room.started) return send(peer, { t: "error", msg: "That game has already started." });
  if (room.seats[0] && room.seats[1])
    return send(peer, { t: "error", msg: "That room is full." });

  leaveEverything(peer);
  seat(room, peer, room.seats[0] ? 1 : 0);
  if (room.seats[0] && room.seats[1]) startGame(room);
  else send(peer, { t: "room", code: room.code, names: room.names });
}

// Leaving mid-game hands your seat to the bot, so your opponent still gets to
// finish their scorecard. Leaving before the game starts just closes the room.
function leaveEverything(peer) {
  queue = queue.filter((p) => p !== peer);
  const room = peer.room ? rooms.get(peer.room) : null;
  peer.room = null;
  if (!room) return;

  const i = room.seats.indexOf(peer);
  if (i < 0) return;
  room.seats[i] = null;

  if (!room.started || room.over) {
    if (!roomPeers(room).length) dropRoom(room);
    else broadcastRoom(room, { t: "peer", status: "left", seat: i });
    return;
  }

  room.isBot[i] = true;
  room.names[i] = room.names[i] + " (bot)";
  if (!roomPeers(room).length) { dropRoom(room); return; }   // nobody left to watch

  broadcastRoom(room, { t: "peer", status: "bot", seat: i });
  pushState(room);
  if (room.turn === i) {
    clearTimeout(room.timer);
    setTimeout(() => botPlay(room, i), BOT_THINK_MS);
  }
}

function offerRematch(peer) {
  const room = peer.room ? rooms.get(peer.room) : null;
  if (!room || !room.over) return;
  room.rematch[peer.seat] = true;
  // Only two humans need to agree; a bot seat always says yes.
  const ready = room.seats.every((p, i) => room.isBot[i] || !p || room.rematch[i]);
  if (ready && roomPeers(room).length) startGame(room);
  else pushState(room);
}

/* ========================================================================
   Wiring
   ======================================================================== */
function onMessage(peer, raw) {
  let m;
  try { m = JSON.parse(raw); } catch { return; }
  if (!m || typeof m.t !== "string") return;

  if (m.t === "hello") {
    peer.id = String(m.id || "").slice(0, 40) || crypto.randomUUID();
    peer.name = cleanName(m.name);
    send(peer, { t: "welcome", id: peer.id });
    return;
  }
  if (!peer.id) return;                     // must say hello first

  const room = peer.room ? rooms.get(peer.room) : null;

  switch (m.t) {
    case "quick":  return enterQueue(peer);
    case "create": return createPrivate(peer);
    case "join":   return joinPrivate(peer, m.code);
    case "leave":  leaveEverything(peer); return send(peer, { t: "idle" });
    case "roll":
      if (room && !room.isBot[peer.seat]) doRoll(room, peer.seat);
      return;
    case "hold":
      if (!room || room.over || room.turn !== peer.seat) return;
      if (!room.rolledThisTurn || room.rollsLeft === 0) return;
      if (!Array.isArray(m.held) || m.held.length !== 5) return;
      room.held = m.held.map(Boolean);
      pushState(room);
      return;
    case "score":
      if (room && !room.isBot[peer.seat]) doScore(room, peer.seat, m.cat);
      return;
    case "again":  return offerRematch(peer);
  }
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://x");
  const path = url.pathname.replace(/^\/yahtzee/, "");
  if (path === "/api/health") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({
      ok: true, peers: peers.size, rooms: rooms.size, queued: queue.length,
    }));
    return;
  }
  res.writeHead(404).end();
});

server.on("upgrade", (req, socket) => {
  const url = new URL(req.url, "http://x");
  const path = url.pathname.replace(/^\/yahtzee/, "");
  const key = req.headers["sec-websocket-key"];
  if (path !== "/api/socket" || !key ||
      (req.headers.upgrade || "").toLowerCase() !== "websocket") {
    socket.destroy();
    return;
  }
  socket.write(
    "HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\n" +
    `Sec-WebSocket-Accept: ${wsAccept(key)}\r\n\r\n`
  );
  socket.setNoDelay(true);

  const peer = { socket, id: null, name: "someone", room: null, seat: -1 };
  peers.add(peer);

  const bye = () => {
    if (!peers.has(peer)) return;
    peers.delete(peer);
    leaveEverything(peer);
    try { socket.destroy(); } catch { /* gone */ }
  };
  const feed = makeParser(
    (text) => { try { onMessage(peer, text); } catch (e) { console.error("msg:", e.message); } },
    bye,
    (payload) => { try { socket.write(encodeFrame(0xa, payload)); } catch { /* gone */ } }
  );

  socket.on("data", (chunk) => { if (!feed(chunk)) bye(); });
  socket.on("error", bye);
  socket.on("close", bye);
});

setInterval(drainQueue, QUEUE_SWEEP_MS);

(async () => {
  R = await import("./rules.js");
  BOT = await import("./bot.js");
  server.listen(PORT, () => console.log(`yahtzee server on :${PORT}`));
})();
