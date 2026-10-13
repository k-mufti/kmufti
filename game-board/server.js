// Zero-dependency Node backend for Game Board, the shelf of board-game
// spin-offs. For now it runs one game: Wavelenght.
//
// The server keeps the secret. The target's position is chosen here when
// the psychic spins, and it's only ever sent to the psychic - everyone else
// learns it at the reveal. Scores are kept here too.
//
//   GET  /api/health        counts, for a quick look
//   WS   /api/socket        everything else
//
// Protocol, client -> server (JSON text frames):
//   {t:"hello", id, name}   introduce yourself (and rejoin your room, if
//                           you were in one); server replies "welcome"
//   {t:"create"}            open a room, get a code back
//   {t:"join", code}        join a room
//   {t:"leave"}             leave your room
//   {t:"name", name}        change your name
//   {t:"team", team}        switch to team 0 or 1
//   {t:"mode", mode}        host: "teams" or "coop"
//   {t:"start"}             host: deal the first card
//   {t:"pick", i}           psychic: choose card 0 or 1 of the two drawn
//   {t:"spin"}              psychic: spin the target, screen closed
//   {t:"clue", text}        psychic: give the clue (only after spinning)
//   {t:"needle", a}         a guesser turns the dial to a (0-180)
//   {t:"lock"}              a guesser locks the dial in
//   {t:"side", side}        the other team calls "left" or "right"
//   {t:"next"}              after a reveal: on to the next round
//   {t:"skip"}              the psychic has gone: skip to the next one
//   {t:"again"}             after the game: back to the lobby
//
// Protocol, server -> client:
//   {t:"welcome", id}
//   {t:"state", ...}        the whole room as you're allowed to see it,
//                           after every change
//   {t:"needle", a, by}     someone turned the dial
//   {t:"spun", by}          the psychic spun the target (for the sound)
//   {t:"idle"}              you're not in a room
//   {t:"error", msg}
//
// Production: nginx proxies /game-board/api/* here (with Upgrade headers
// for the socket). A leading "/game-board" is stripped below so the same
// routes work proxied or direct.
"use strict";

const http = require("http");
const crypto = require("crypto");

const PORT = process.env.PORT || 8028;
const EMPTY_ROOM_MS = 10 * 60 * 1000;   // a room nobody's in goes after this

let R = null, CARDS = null;            // loaded below (ES modules)

/* ========================================================================
   WebSocket, hand-rolled. Same codec as yahtzee/server.js - text frames,
   ping/pong, close, continuation.
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
const peers = new Set();   // { socket, id, name, room }

function send(peer, obj) {
  if (!peer || !peer.socket) return;
  try { peer.socket.write(encodeFrame(0x1, Buffer.from(JSON.stringify(obj)))); } catch { /* gone */ }
}

// Strip control characters and angle brackets out of anything a player types.
const CONTROL_CHARS = /[\u0000-\u001f\u007f<>]/g;
const cleanText = (s, max) => String(s || "").replace(CONTROL_CHARS, "").replace(/\s+/g, " ").trim().slice(0, max);
const cleanName = (s) => cleanText(s, 18) || "someone";

setInterval(() => {
  const ping = encodeFrame(0x9, Buffer.alloc(0));
  for (const p of peers) { try { p.socket.write(ping); } catch { /* gone */ } }
}, 25000);

/* ========================================================================
   Rooms
   ======================================================================== */
const rooms = new Map();     // code -> room

// No I/O/0/1 - these get read aloud and typed in by hand.
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function newCode() {
  for (;;) {
    let c = "";
    for (let i = 0; i < 4; i++) c += CODE_ALPHABET[crypto.randomInt(0, CODE_ALPHABET.length)];
    if (!rooms.has(c)) return c;
  }
}

function shuffled(n) {
  const a = [...Array(n).keys()];
  for (let i = n - 1; i > 0; i--) { const j = crypto.randomInt(0, i + 1); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

function makeRoom(host) {
  const room = {
    code: newCode(),
    host: host.id,
    mode: "teams",
    players: [],             // { id, name, team, peer } - peer null while away
    phase: "lobby",          // lobby, pick, clue, guess, side, reveal
    scores: [0, 0],
    coop: { score: 0, cardsLeft: 0 },
    activeTeam: 0,
    turnOf: [0, 0],          // per team: whose turn it is to be psychic
    psychic: null,           // a player id
    deck: [],
    choices: null,           // the two cards the psychic picks between
    card: null,
    spun: false,
    target: null,
    clue: "",
    needle: 90,
    side: null,
    result: null,
    winner: null,            // 0, 1, or "coop" once the game's over
    round: 0,
    emptySince: 0,
  };
  rooms.set(room.code, room);
  return room;
}

const playerOf = (room, id) => room.players.find((p) => p.id === id);
const online = (p) => !!p.peer;
const teamOf = (room, t) => room.players.filter((p) => p.team === t);

/* ---------- what each player is told ---------- */
function viewFor(room, viewer) {
  const isPsychic = viewer && viewer.id === room.psychic;
  const showTarget = room.phase === "reveal" || (isPsychic && room.spun);
  return {
    t: "state",
    code: room.code,
    you: viewer ? viewer.id : null,
    host: room.host,
    mode: room.mode,
    players: room.players.map((p) => ({ id: p.id, name: p.name, team: p.team, online: online(p) })),
    phase: room.phase,
    scores: room.scores,
    coop: room.coop,
    activeTeam: room.activeTeam,
    psychic: room.psychic,
    choices: isPsychic && room.phase === "pick" ? room.choices : null,
    card: room.card,
    spun: room.spun,
    target: showTarget ? room.target : null,
    clue: room.clue,
    needle: room.needle,
    side: room.side,
    result: room.result,
    winner: room.winner,
    round: room.round,
    win: R.WIN,
  };
}

function pushState(room) {
  for (const p of room.players) if (p.peer) send(p.peer, viewFor(room, p));
}

/* ========================================================================
   The game
   ======================================================================== */
// Who guesses this round: the active team (everyone, in co-op), minus the
// psychic.
function isGuesser(room, p) {
  if (!p || p.id === room.psychic) return false;
  return room.mode === "coop" || p.team === room.activeTeam;
}
// Who calls left or right: the team that isn't guessing (teams game only).
const isCaller = (room, p) => !!p && room.mode === "teams" && p.team !== room.activeTeam;

function canStart(room) {
  if (room.mode === "coop") return room.players.length >= 2 ? null : "Co-op needs at least 2 players.";
  if (teamOf(room, 0).length < 2 || teamOf(room, 1).length < 2) return "Each team needs at least 2 players.";
  return null;
}

function startGame(room) {
  room.scores = [0, 1];       // the team that goes second starts on 1
  room.coop = { score: 0, cardsLeft: R.COOP_CARDS };
  room.activeTeam = 0;
  room.turnOf = [0, 0];
  room.deck = shuffled(CARDS.length);
  room.winner = null;
  room.round = 0;
  beginRound(room);
}

function draw(room) {
  if (!room.deck.length) room.deck = shuffled(CARDS.length);
  return CARDS[room.deck.pop()];
}

function beginRound(room) {
  // the psychic: next in line on the active team (on anyone, in co-op),
  // skipping people who are away
  const pool = room.mode === "coop" ? room.players : teamOf(room, room.activeTeam);
  const t = room.mode === "coop" ? 0 : room.activeTeam;
  let pick = null;
  for (let k = 0; k < pool.length && !pick; k++) {
    const p = pool[(room.turnOf[t] + k) % pool.length];
    if (online(p)) { pick = p; room.turnOf[t] = (room.turnOf[t] + k + 1) % pool.length; }
  }
  if (!pick) pick = pool[room.turnOf[t]++ % pool.length];
  room.psychic = pick.id;
  room.round++;
  room.phase = "pick";
  room.choices = [draw(room), draw(room)];
  room.card = null;
  room.spun = false;
  room.target = null;
  room.clue = "";
  room.needle = 90;
  room.side = null;
  room.result = null;
  pushState(room);
}

function reveal(room) {
  const points = R.score(room.needle, room.target);
  const truth = R.sideOf(room.needle, room.target);
  const result = { points, truth, sidePoint: 0, again: false };
  if (room.mode === "coop") {
    room.coop.score += points;
    room.coop.cardsLeft -= 1;
    if (points === 4) { room.coop.cardsLeft += 1; result.bonusCard = true; }
    if (room.coop.cardsLeft <= 0) {
      room.winner = "coop";
      result.rating = R.coopRating(room.coop.score);
    }
  } else {
    const me = room.activeTeam, them = 1 - me;
    room.scores[me] += points;
    if (room.side && room.side === truth) { room.scores[them] += 1; result.sidePoint = 1; }
    const [a, b] = room.scores;
    if ((a >= R.WIN || b >= R.WIN) && a !== b) room.winner = a > b ? 0 : 1;
    // Catch-up: a bullseye by the team that's still behind earns another go.
    result.again = !room.winner && points === 4 && room.scores[me] < room.scores[them];
  }
  room.result = result;
  room.phase = "reveal";
  pushState(room);
}

function nextRound(room) {
  if (room.winner !== null) return;
  if (room.mode === "teams" && !room.result.again) room.activeTeam = 1 - room.activeTeam;
  beginRound(room);
}

/* ---------- joining and leaving ---------- */
function attach(peer, room, p) {
  p.peer = peer;
  p.name = peer.name;
  peer.room = room.code;
  room.emptySince = 0;
}

function joinRoom(peer, code) {
  const room = rooms.get(String(code || "").toUpperCase().trim());
  if (!room) return send(peer, { t: "error", msg: "No room with that code." });
  leaveRoom(peer);
  let p = playerOf(room, peer.id);
  if (!p) {
    if (room.players.length >= 16) return send(peer, { t: "error", msg: "That room is full." });
    // the smaller team (the one with fewer people, then team 0)
    const team = teamOf(room, 1).length < teamOf(room, 0).length ? 1 : 0;
    p = { id: peer.id, name: peer.name, team, peer: null };
    room.players.push(p);
  }
  attach(peer, room, p);
  pushState(room);
}

function leaveRoom(peer) {
  const room = peer.room ? rooms.get(peer.room) : null;
  peer.room = null;
  if (!room) return;
  const i = room.players.findIndex((p) => p.id === peer.id);
  if (i < 0) return;
  room.players.splice(i, 1);
  afterDeparture(room, peer.id);
}

// Someone went away, for good (leave) or for now (dropped connection).
function afterDeparture(room, id) {
  if (room.host === id) {
    const next = room.players.find(online) || room.players[0];
    if (next) room.host = next.id;
  }
  if (!room.players.some(online)) room.emptySince = Date.now();
  if (!room.players.length) { rooms.delete(room.code); return; }
  // A psychic who left outright before giving their clue: skip to the next.
  if (room.phase !== "lobby" && room.psychic === id && !playerOf(room, id) &&
      (room.phase === "pick" || room.phase === "clue")) return beginRound(room);
  if (room.phase !== "lobby" && room.mode === "teams" && (!teamOf(room, 0).length || !teamOf(room, 1).length)) {
    room.phase = "lobby";
  }
  pushState(room);
}

function dropped(peer) {
  const room = peer.room ? rooms.get(peer.room) : null;
  if (!room) return;
  const p = playerOf(room, peer.id);
  if (p && p.peer === peer) { p.peer = null; afterDeparture(room, peer.id); }
}

setInterval(() => {
  const now = Date.now();
  for (const room of rooms.values()) if (room.emptySince && now - room.emptySince > EMPTY_ROOM_MS) rooms.delete(room.code);
}, 60000);

/* ---------- messages ---------- */
function onMessage(peer, raw) {
  let m;
  try { m = JSON.parse(raw); } catch { return; }
  if (!m || typeof m.t !== "string") return;

  if (m.t === "hello") {
    peer.id = cleanText(m.id, 40) || crypto.randomUUID();
    peer.name = cleanName(m.name);
    send(peer, { t: "welcome", id: peer.id });
    // back from a dropped connection: straight back into your room
    for (const room of rooms.values()) {
      const p = playerOf(room, peer.id);
      if (p) {
        if (p.peer && p.peer !== peer) send(p.peer, { t: "idle" });
        attach(peer, room, p);
        return pushState(room);
      }
    }
    return send(peer, { t: "idle" });
  }
  if (!peer.id) return;

  if (m.t === "create") {
    leaveRoom(peer);
    const room = makeRoom(peer);
    const p = { id: peer.id, name: peer.name, team: 0, peer: null };
    room.players.push(p);
    attach(peer, room, p);
    return pushState(room);
  }
  if (m.t === "join") return joinRoom(peer, m.code);
  if (m.t === "leave") { leaveRoom(peer); return send(peer, { t: "idle" }); }

  const room = peer.room ? rooms.get(peer.room) : null;
  const me = room && playerOf(room, peer.id);
  if (!me) return;
  const isHost = room.host === me.id;
  const isPsychic = room.psychic === me.id;

  switch (m.t) {
    case "name":
      peer.name = me.name = cleanName(m.name);
      return pushState(room);
    case "team":
      if (m.team !== 0 && m.team !== 1) return;
      // mid-game you can still switch, but not while it's your team's go and
      // you're the psychic
      if (isPsychic && room.phase !== "lobby" && room.phase !== "reveal") return;
      me.team = m.team;
      return pushState(room);
    case "mode":
      if (!isHost || room.phase !== "lobby" || (m.mode !== "teams" && m.mode !== "coop")) return;
      room.mode = m.mode;
      return pushState(room);
    case "start": {
      if (!isHost || room.phase !== "lobby") return;
      const why = canStart(room);
      if (why) return send(peer, { t: "error", msg: why });
      return startGame(room);
    }
    case "pick":
      if (!isPsychic || room.phase !== "pick" || (m.i !== 0 && m.i !== 1)) return;
      room.card = room.choices[m.i];
      room.choices = null;
      room.phase = "clue";
      return pushState(room);
    case "spin":
      if (!isPsychic || room.phase !== "clue" || room.spun) return;
      // anywhere on the dial, edges included - a target can hang half off
      // either end, as it can on the real wheel
      room.target = Math.round(crypto.randomInt(0, 1801)) / 10;
      room.spun = true;
      for (const p of room.players) if (p.peer) send(p.peer, { t: "spun", by: me.id });
      return pushState(room);
    case "clue": {
      if (!isPsychic || room.phase !== "clue" || !room.spun) return;
      const text = cleanText(m.text, 60);
      if (!text) return;
      room.clue = text;
      room.phase = "guess";
      return pushState(room);
    }
    case "needle": {
      if (room.phase !== "guess" || !isGuesser(room, me)) return;
      const a = R.clampAngle(m.a);
      if (a === null) return;
      room.needle = Math.round(a * 10) / 10;
      for (const p of room.players) if (p.peer && p !== me) send(p.peer, { t: "needle", a: room.needle, by: me.id });
      return;
    }
    case "lock":
      if (room.phase !== "guess" || !isGuesser(room, me)) return;
      if (room.mode === "coop") return reveal(room);
      room.phase = "side";
      return pushState(room);
    case "side":
      if (room.phase !== "side" || !isCaller(room, me) || (m.side !== "left" && m.side !== "right")) return;
      room.side = m.side;
      return reveal(room);
    case "next":
      if (room.phase !== "reveal") return;
      return nextRound(room);
    case "skip": {
      // only when the psychic really has gone quiet
      const psy = playerOf(room, room.psychic);
      if ((room.phase !== "pick" && room.phase !== "clue") || (psy && online(psy))) return;
      return beginRound(room);
    }
    case "again":
      if (room.winner === null) return;
      room.phase = "lobby";
      room.winner = null;
      room.result = null;
      room.psychic = null;
      room.card = null;
      room.clue = "";
      room.target = null;
      return pushState(room);
  }
}

/* ========================================================================
   HTTP + upgrade
   ======================================================================== */
const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://x");
  const route = url.pathname.replace(/^\/game-board/, "");
  if (route === "/api/health") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ ok: true, peers: peers.size, rooms: rooms.size }));
    return;
  }
  res.writeHead(404).end();
});

server.on("upgrade", (req, socket) => {
  const url = new URL(req.url, "http://x");
  const route = url.pathname.replace(/^\/game-board/, "");
  const key = req.headers["sec-websocket-key"];
  if (route !== "/api/socket" || !key ||
      (req.headers.upgrade || "").toLowerCase() !== "websocket") {
    socket.destroy();
    return;
  }
  socket.write(
    "HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\n" +
    `Sec-WebSocket-Accept: ${wsAccept(key)}\r\n\r\n`
  );
  socket.setNoDelay(true);

  const peer = { socket, id: null, name: "someone", room: null };
  peers.add(peer);

  const bye = () => {
    if (!peers.has(peer)) return;
    peers.delete(peer);
    dropped(peer);
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

(async () => {
  R = await import("./wavelenght/rules.js");
  ({ CARDS } = await import("./wavelenght/cards.js"));
  server.listen(PORT, () => console.log(`game-board server on :${PORT}`));
})();
