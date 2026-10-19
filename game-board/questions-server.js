// 21 Questions, the server half. Loaded by server.js, which owns the socket
// and hands over every message from a player on the 21 Questions page.
//
// The server keeps the one secret: only the answerer is told what it is,
// until the round's over.
//
// A round: the answerer types a secret (secret); the askers take turns, one
// question or guess each (ask), and the answerer replies (answer). A right
// guess, or 21 questions gone, ends it (reveal). The host deals the next
// round, with the next player answering, or ends the game (final).
//
// Protocol, client -> server, on top of server.js's hello/leave:
//   {t:"create"} {t:"join", code} {t:"quick"} {t:"leave"} {t:"name", name}
//   {t:"start"}                 host: the first round
//   {t:"secret", text, hint}    the answerer's secret, and an optional hint
//   {t:"ask", text, guess}      on my turn: a yes/no question, or a guess
//   {t:"answer", a}             the answerer: yes|no|sometimes|unsure, or right|wrong for a guess
//   {t:"next"}                  host: the next round
//   {t:"end"}                   host: to the final standings
//   {t:"again"}                 host: from the final standings, back to the lobby
//   {t:"addbot"} {t:"clearbots"} host, in the lobby, on localhost only
"use strict";

const crypto = require("crypto");

const QUICK_START_MS = 6000;
const QUICK_MAX = 8;
const EMPTY_ROOM_MS = 10 * 60 * 1000;

module.exports = function questions({ send, cleanText, cleanName, newCode, R }) {
  const rooms = new Map();

  const pick = (a) => a[crypto.randomInt(0, a.length)];
  const online = (p) => !!p.peer;
  const playerOf = (room, id) => room.players.find((p) => p.id === id);

  function makeRoom(host, quick) {
    const room = {
      code: newCode(),
      game: "questions",
      host: host.id,
      quick: !!quick,
      startAt: 0, startTimer: null,
      players: [],        // { id, name, color, peer, score, stats, bot }
      phase: "lobby",     // lobby | secret | ask | answer | reveal | final
      round: 0,
      answerer: null,
      lastAnswerer: -1,   // index into players, so it goes round
      secret: null, hint: "",
      order: [], turn: 0, // the askers, and whose turn it is
      pending: null,      // { by, text, guess } - waiting on the answerer
      log: [],            // [{ n, by, text, guess, answer }]
      result: null,       // { winner: "asker" | "answerer" | null, by, secret, why }
      history: [],
      deadline: 0, timer: null,
      emptySince: 0,
    };
    rooms.set(room.code, room);
    return room;
  }
  const newStats = () => ({ answered: 0, stumped: 0, guessed: 0, asked: 0 });
  function addPlayer(room, peer) {
    const p = { id: peer.id, name: peer.name, color: peer.color, peer: null, score: 0, stats: newStats() };
    room.players.push(p);
    return p;
  }

  /* ---------- what each player is told ---------- */
  function viewFor(room, viewer) {
    const over = room.phase === "reveal" || room.phase === "final";
    return {
      t: "state",
      game: "questions",
      code: room.code,
      you: viewer ? viewer.id : null,
      host: room.host,
      quick: room.quick,
      dev: !!(viewer && viewer.peer && viewer.peer.dev),
      startsIn: room.startAt ? Math.max(0, room.startAt - Date.now()) : 0,
      players: room.players.map((p) => ({ id: p.id, name: p.name, color: p.color, online: online(p), score: p.score, bot: !!p.bot })),
      phase: room.phase,
      round: room.round,
      answerer: room.answerer,
      // only the answerer knows it, until the round's over
      secret: room.secret && (over || (viewer && viewer.id === room.answerer)) ? room.secret : null,
      hint: room.hint,
      order: room.order,
      turn: room.turn,
      asker: room.phase === "ask" || room.phase === "answer" ? room.order[room.turn] : null,
      pending: room.pending,
      log: room.log,
      result: room.result,
      msLeft: room.deadline ? Math.max(0, room.deadline - Date.now()) : 0,
      history: room.phase === "final" ? room.history : [],
      stats: room.phase === "final" ? room.players.map((p) => ({ id: p.id, ...p.stats })) : null,
    };
  }
  function pushState(room) {
    for (const p of room.players) if (p.peer) send(p.peer, viewFor(room, p));
    botsLook(room);
  }

  function setTimer(room, secs, fn) {
    clearTimeout(room.timer);
    room.deadline = secs ? Date.now() + secs * 1000 : 0;
    room.timer = secs ? setTimeout(() => { room.timer = null; room.deadline = 0; if (rooms.get(room.code) === room) fn(); }, secs * 1000) : null;
  }
  const stopTimer = (room) => setTimer(room, 0);

  /* ---------- a round ---------- */
  function canStart(room) {
    return room.players.filter(online).length >= R.MIN_PLAYERS ? null : `You need at least ${R.MIN_PLAYERS} players.`;
  }

  // The next player round the table who's here answers.
  function startRound(room) {
    stopCountdown(room);
    if (canStart(room)) return toLobby(room);
    const n = room.players.length;
    let k = room.lastAnswerer;
    for (let i = 0; i < n; i++) {
      k = (k + 1) % n;
      if (online(room.players[k])) break;
    }
    room.lastAnswerer = k;
    room.round++;
    room.answerer = room.players[k].id;
    room.secret = null; room.hint = "";
    room.order = []; room.turn = 0;
    room.pending = null; room.log = []; room.result = null;
    room.phase = "secret";
    // no secret in time: the next player answers instead
    setTimer(room, R.SECRET_SECS, () => { room.round--; startRound(room); });
    pushState(room);
  }

  function setSecret(room, text, hint) {
    room.secret = text;
    room.hint = hint;
    // the askers, starting just after the answerer
    const n = room.players.length, k = room.players.findIndex((p) => p.id === room.answerer);
    room.order = [];
    for (let i = 1; i < n; i++) { const p = room.players[(k + i) % n]; if (online(p)) room.order.push(p.id); }
    room.turn = 0;
    beginAsk(room);
  }

  // Whoever's next and still here asks. Nobody left to ask: the round's off.
  function beginAsk(room) {
    room.pending = null;
    for (let i = 0; i < room.order.length; i++) {
      const p = playerOf(room, room.order[room.turn]);
      if (p && online(p)) {
        room.phase = "ask";
        setTimer(room, R.ASK_SECS, () => { room.turn = (room.turn + 1) % room.order.length; beginAsk(room); });
        return pushState(room);
      }
      room.turn = (room.turn + 1) % room.order.length;
    }
    finish(room, null, null, "empty");
  }

  function ask(room, p, text, guess) {
    room.pending = { by: p.id, text, guess };
    p.stats.asked++;
    if (guess && R.sameThing(text, room.secret)) return answer(room, "right");
    room.phase = "answer";
    setTimer(room, R.ANSWER_SECS, () => answer(room, guess ? "wrong" : "unsure"));
    pushState(room);
  }

  function answer(room, a) {
    const q = room.pending;
    room.log.push({ n: room.log.length + 1, by: q.by, text: q.text, guess: q.guess, answer: a });
    room.pending = null;
    if (q.guess && a === "right") return finish(room, "asker", q.by, "guessed");
    if (room.log.length >= R.QUESTIONS) return finish(room, "answerer", room.answerer, "stumped");
    room.turn = (room.turn + 1) % room.order.length;
    beginAsk(room);
  }

  function finish(room, winner, by, why) {
    stopTimer(room);
    const p = by ? playerOf(room, by) : null;
    const ans = playerOf(room, room.answerer);
    if (ans) ans.stats.answered++;
    if (winner === "asker" && p) { p.score += R.POINTS.guess; p.stats.guessed++; }
    if (winner === "answerer" && p) { p.score += R.POINTS.stump; p.stats.stumped++; }
    room.result = { winner, by, why, secret: room.secret, used: room.log.length };
    room.history.push({ round: room.round, answerer: room.answerer, answererName: ans ? ans.name : "someone",
      secret: room.secret, winner, by, byName: p ? p.name : null, used: room.log.length });
    room.phase = "reveal";
    pushState(room);
  }

  function toLobby(room) {
    stopTimer(room);
    room.phase = "lobby";
    room.secret = null; room.pending = null; room.order = [];
    quickCheck(room);
    pushState(room);
  }

  /* ---------- quick games ---------- */
  function quickCheck(room) {
    if (!room.quick) return;
    const ready = room.phase === "lobby" && room.players.filter(online).length >= R.MIN_PLAYERS;
    if (ready && !room.startAt) {
      room.startAt = Date.now() + QUICK_START_MS;
      room.startTimer = setTimeout(() => {
        room.startAt = 0;
        if (rooms.get(room.code) === room && room.phase === "lobby" && !canStart(room)) startRound(room);
        else pushState(room);
      }, QUICK_START_MS);
    } else if (!ready) stopCountdown(room);
  }
  function stopCountdown(room) { clearTimeout(room.startTimer); room.startTimer = null; room.startAt = 0; }

  /* ---------- joining and leaving ---------- */
  // Arriving mid-round: you're an asker, last in the order.
  function dealIn(room, p) {
    if (!["ask", "answer"].includes(room.phase) || p.id === room.answerer || room.order.includes(p.id)) return;
    room.order.push(p.id);
  }
  function attach(peer, room, p) {
    p.peer = peer;
    p.name = peer.name;
    if (peer.color) p.color = peer.color;
    peer.room = room.code;
    room.emptySince = 0;
  }

  function join(peer, code) {
    const room = rooms.get(String(code || "").toUpperCase().trim());
    if (!room) return send(peer, { t: "error", msg: "No 21 Questions room with that code." });
    leave(peer);
    let p = playerOf(room, peer.id);
    if (!p) {
      if (room.players.length >= R.MAX_PLAYERS) return send(peer, { t: "error", msg: "That room is full." });
      p = addPlayer(room, peer);
    }
    attach(peer, room, p);
    dealIn(room, p);
    quickCheck(room);
    pushState(room);
  }

  function create(peer) {
    leave(peer);
    const room = makeRoom(peer, false);
    attach(peer, room, addPlayer(room, peer));
    pushState(room);
  }

  function quick(peer) {
    leave(peer);
    let best = null;
    for (const room of rooms.values()) {
      if (!room.quick || room.phase === "final") continue;
      const here = room.players.filter(online).length;
      if (!here || room.players.length >= QUICK_MAX) continue;
      if (!best || here > best.players.filter(online).length) best = room;
    }
    if (best) return join(peer, best.code);
    const room = makeRoom(peer, true);
    attach(peer, room, addPlayer(room, peer));
    pushState(room);
  }

  function leave(peer) {
    const room = peer.room ? rooms.get(peer.room) : null;
    peer.room = null;
    if (!room) return;
    const i = room.players.findIndex((p) => p.id === peer.id);
    if (i < 0) return;
    room.players.splice(i, 1);
    if (i <= room.lastAnswerer) room.lastAnswerer--;
    departed(room, peer.id, true);
  }

  function dropped(peer) {
    const room = peer.room ? rooms.get(peer.room) : null;
    if (!room) return;
    const p = playerOf(room, peer.id);
    if (p && p.peer === peer) { p.peer = null; departed(room, peer.id, false); }
  }

  // Someone went: for good (left) or for now (lost connection).
  function departed(room, id, forGood) {
    if (room.host === id) {
      const next = room.players.find((p) => online(p) && !p.bot) || room.players.find(online) || room.players[0];
      if (next) room.host = next.id;
    }
    if (!room.players.some((p) => !p.bot)) { stopTimer(room); stopCountdown(room); rooms.delete(room.code); return; }
    if (!room.players.some((p) => online(p) && !p.bot)) room.emptySince = Date.now();
    const live = ["secret", "ask", "answer"].includes(room.phase);
    if (live && room.answerer === id) {
      // no answerer, no round
      if (room.phase === "secret") { room.round--; return startRound(room); }
      return finish(room, null, null, "left");
    }
    if (live && room.players.filter(online).length < R.MIN_PLAYERS) return toLobby(room);
    if (room.phase === "ask" && room.order[room.turn] === id) { room.turn = (room.turn + 1) % room.order.length; return beginAsk(room); }
    if (room.phase === "answer" && room.pending && room.pending.by === id && forGood) return answer(room, room.pending.guess ? "wrong" : "unsure");
    quickCheck(room);
    pushState(room);
  }

  setInterval(() => {
    const now = Date.now();
    for (const room of rooms.values()) {
      if (room.emptySince && now - room.emptySince > EMPTY_ROOM_MS) { stopTimer(room); stopCountdown(room); rooms.delete(room.code); }
    }
  }, 60000);

  /* ---------- bots (localhost only: see server.js peer.dev) ----------
     A bot plays by sending itself the same messages a person's page would,
     a beat after anything changes. It's not clever - it's there so one
     person can test every part of a round. */
  const BOT_NAMES = ["Botty", "Robo Rita", "Beep", "Clanky", "Sir Bolt", "Unit 7", "Gizmo", "Chip", "Widget"];
  const BOT_COLORS = ["#4f8cff", "#2fe08a", "#ffb02e", "#c86bff", "#29c7d8", "#ff7a59"];
  const BOT_SECRETS = [["Pizza", "a food"], ["Giraffe", "an animal"], ["Paris", "a place"], ["Toothbrush", "a thing"], ["Batman", "a character"], ["Basketball", "a thing"], ["Pineapple", "a food"], ["Taylor Swift", "a person"]];
  const BOT_QUESTIONS = ["Is it alive?", "Is it bigger than a microwave?", "Can you eat it?", "Is it a person?", "Is it a place?", "Would I find it at home?", "Is it famous?", "Is it older than 100 years?", "Is it soft?", "Does it use electricity?", "Can you hold it in one hand?", "Is it found outdoors?"];
  const BOT_GUESSES = ["A cat", "Pizza", "The moon", "A car", "Paris", "A phone", "Batman"];
  function addBot(room) {
    const taken = new Set(room.players.map((p) => p.name));
    const name = BOT_NAMES.find((n) => !taken.has(n)) || `Bot ${room.players.length + 1}`;
    const id = "bot-" + crypto.randomUUID().slice(0, 8);
    const color = BOT_COLORS[room.players.filter((p) => p.bot).length % BOT_COLORS.length];
    const p = { id, name, color, peer: null, score: 0, stats: newStats(), bot: true, botKey: "", botTimer: null };
    p.peer = { id, name, color, room: room.code, socket: null, bot: true };   // send() skips it: no socket
    room.players.push(p);
  }
  function botsLook(room) {
    for (const b of room.players) {
      if (!b.bot) continue;
      const key = [room.phase, room.round, room.turn, room.log.length, !!room.pending].join(":");
      if (key === b.botKey) continue;
      b.botKey = key;
      clearTimeout(b.botTimer);
      b.botTimer = setTimeout(() => { if (rooms.get(room.code) === room && room.players.includes(b)) botAct(room, b); }, 900 + Math.random() * 1600);
    }
  }
  function botAct(room, b) {
    const say = (m) => handle(b.peer, m);
    if (room.phase === "secret" && room.answerer === b.id) {
      const [text, hint] = pick(BOT_SECRETS);
      return say({ t: "secret", text, hint });
    }
    if (room.phase === "ask" && room.order[room.turn] === b.id) {
      const guess = room.log.length >= 6 && Math.random() < 0.3;
      return say({ t: "ask", text: guess ? pick(BOT_GUESSES) : pick(BOT_QUESTIONS), guess });
    }
    if (room.phase === "answer" && room.answerer === b.id && room.pending) {
      return say({ t: "answer", a: room.pending.guess ? "wrong" : pick(["yes", "no", "no", "sometimes", "unsure"]) });
    }
  }

  /* ---------- messages ---------- */
  function hello(peer) {
    for (const room of rooms.values()) {
      const p = playerOf(room, peer.id);
      if (p) {
        if (p.peer && p.peer !== peer) send(p.peer, { t: "idle" });
        attach(peer, room, p);
        dealIn(room, p);
        quickCheck(room);
        return pushState(room);
      }
    }
    send(peer, { t: "idle" });
  }

  function handle(peer, m) {
    if (m.t === "create") return create(peer);
    if (m.t === "join") return join(peer, m.code);
    if (m.t === "quick") return quick(peer);
    if (m.t === "leave") { leave(peer); return send(peer, { t: "idle" }); }
    // a name typed on the home screen arrives before there's a room to be in
    if (m.t === "name" && !peer.room) {
      peer.name = cleanName(m.name);
      if (m.color && /^#[0-9a-f]{6}$/i.test(m.color)) peer.color = m.color;
      return;
    }

    const room = peer.room ? rooms.get(peer.room) : null;
    const me = room && playerOf(room, peer.id);
    if (!me) return;
    const isHost = room.host === me.id;

    switch (m.t) {
      case "name":
        peer.name = me.name = cleanName(m.name);
        if (m.color && /^#[0-9a-f]{6}$/i.test(m.color)) peer.color = me.color = m.color;
        return pushState(room);
      case "start": {
        if (!isHost || room.phase !== "lobby") return;
        const why = canStart(room);
        if (why) return send(peer, { t: "error", msg: why });
        return startRound(room);
      }
      case "secret": {
        if (room.phase !== "secret" || room.answerer !== me.id) return;
        const text = cleanText(m.text, 40);
        if (!text) return send(peer, { t: "error", msg: "Type your secret first." });
        return setSecret(room, text, cleanText(m.hint, 30));
      }
      case "ask": {
        if (room.phase !== "ask" || room.order[room.turn] !== me.id) return;
        const text = cleanText(m.text, 120);
        if (!text) return;
        return ask(room, me, text, !!m.guess);
      }
      case "answer": {
        if (room.phase !== "answer" || room.answerer !== me.id || !room.pending) return;
        const ok = room.pending.guess ? ["right", "wrong"].includes(m.a) : R.ANSWERS.includes(m.a);
        if (!ok) return;
        return answer(room, m.a);
      }
      case "next":
        if (!(isHost || room.quick) || room.phase !== "reveal") return;
        return startRound(room);
      case "end":
        if (!isHost || room.phase !== "reveal") return;
        room.phase = "final";
        return pushState(room);
      case "again":
        if (!isHost || room.phase !== "final") return;
        for (const p of room.players) { p.score = 0; p.stats = newStats(); }
        room.history = []; room.round = 0; room.lastAnswerer = -1;
        return toLobby(room);
      case "addbot":
        if (!isHost || room.phase !== "lobby" || !peer.dev) return;
        if (room.players.length >= R.MAX_PLAYERS) return send(peer, { t: "error", msg: "The room is full." });
        addBot(room);
        return pushState(room);
      case "clearbots":
        if (!isHost || room.phase !== "lobby" || !peer.dev) return;
        for (const b of room.players.filter((x) => x.bot)) clearTimeout(b.botTimer);
        room.players = room.players.filter((x) => !x.bot);
        return pushState(room);
    }
  }

  return { rooms, hello, handle, dropped, leave };
};
