// Stop the Clock, the server half. Loaded by server.js, which owns the socket
// and hands over every message from a player on the Stop the Clock page.
//
// A round: the target shows (intro); players take turns (ready - waiting
// for them to tap Start, then running until they tap Stop); each stop is
// shown counting up (result); after everyone, the round's ranking
// (standings). Five rounds, then the final standings (final).
//
// The time itself is measured on the player's own device, between their
// Start and Stop taps, so a slow connection can't cost them. The server
// only checks it's possible: no longer than the clock has really been
// running here, give or take the trip.
//
// Protocol, client -> server, on top of server.js's hello/leave:
//   {t:"create"} {t:"join", code} {t:"quick"} {t:"leave"} {t:"name", name}
//   {t:"start"}                 host, in the lobby: the first round
//   {t:"go"}                    on my turn: I've started my clock
//   {t:"stop", ms}              on my turn: my clock read this when I stopped it
//   {t:"next"}                  host: the next round (from the standings)
//   {t:"again"}                 host: from the final standings, back to the lobby
//   {t:"addbot"} {t:"clearbots"} host, in the lobby, on localhost only
"use strict";

const crypto = require("crypto");

const QUICK_START_MS = 6000;
const QUICK_MAX = 8;
const EMPTY_ROOM_MS = 10 * 60 * 1000;
const SLACK_MS = 3000;            // network either way, for the plausibility check

module.exports = function clock({ send, cleanName, newCode, R }) {
  const rooms = new Map();

  const pick = (a) => a[crypto.randomInt(0, a.length)];
  const online = (p) => !!p.peer;
  const playerOf = (room, id) => room.players.find((p) => p.id === id);
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = crypto.randomInt(0, i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  function makeRoom(host, quick) {
    const room = {
      code: newCode(), game: "clock", host: host.id, quick: !!quick,
      startAt: 0, startTimer: null,
      players: [],        // { id, name, color, peer, score, perfects, best, bot }
      phase: "lobby",     // lobby | intro | ready | running | result | standings | final
      round: 0, target: 0, used: [],
      order: [], turn: 0,
      runningSince: 0,    // server time the current player started
      times: {},          // this round: id -> ms (or null: skipped)
      last: null,         // the stop just made: { id, ms, off, perfect }
      history: [],        // [{ round, target, times }]
      deadline: 0, timer: null, emptySince: 0,
    };
    rooms.set(room.code, room);
    return room;
  }
  function addPlayer(room, peer) {
    const p = { id: peer.id, name: peer.name, color: peer.color, peer: null, score: 0, perfects: 0, best: null };
    room.players.push(p);
    return p;
  }

  /* ---------- what everyone is told ---------- */
  function viewFor(room, viewer) {
    return {
      t: "state", game: "clock", code: room.code,
      you: viewer ? viewer.id : null,
      host: room.host, quick: room.quick,
      dev: !!(viewer && viewer.peer && viewer.peer.dev),
      startsIn: room.startAt ? Math.max(0, room.startAt - Date.now()) : 0,
      players: room.players.map((p) => ({ id: p.id, name: p.name, color: p.color, online: online(p), score: p.score, perfects: p.perfects, best: p.best, bot: !!p.bot })),
      phase: room.phase, round: room.round, rounds: R.ROUNDS, target: room.target,
      order: room.order, turn: room.turn, current: room.order[room.turn] || null,
      times: room.times, last: room.last,
      elapsed: room.phase === "running" ? Date.now() - room.runningSince : 0,   // so watchers can run the clock too
      history: room.phase === "final" ? room.history : [],
      msLeft: room.deadline ? Math.max(0, room.deadline - Date.now()) : 0,
    };
  }
  function pushState(room) {
    for (const p of room.players) if (p.peer) send(p.peer, viewFor(room, p));
    botsLook(room);
  }
  function setTimer(room, ms, fn) {
    clearTimeout(room.timer);
    room.deadline = ms ? Date.now() + ms : 0;
    room.timer = ms ? setTimeout(() => { room.timer = null; room.deadline = 0; if (rooms.get(room.code) === room) fn(); }, ms) : null;
  }
  const stopTimer = (room) => setTimer(room, 0);

  /* ---------- the game ---------- */
  function startRound(room) {
    stopCountdown(room);
    if (!room.players.some(online)) return toLobby(room);
    room.round++;
    // a target not used yet this game
    const fresh = R.TARGETS.filter((t) => !room.used.includes(t));
    room.target = pick(fresh.length ? fresh : R.TARGETS);
    room.used.push(room.target);
    // a new order each round, so nobody always goes first
    room.order = shuffle(room.players.filter(online).map((p) => p.id));
    room.turn = 0;
    room.times = {};
    room.last = null;
    room.phase = "intro";
    setTimer(room, R.INTRO_MS, () => beginTurn(room));
    pushState(room);
  }

  // Whoever's next and still here: their turn. Everyone's gone: the round's done.
  function beginTurn(room) {
    while (room.turn < room.order.length) {
      const p = playerOf(room, room.order[room.turn]);
      if (p && online(p)) break;
      room.times[room.order[room.turn]] = null;
      room.turn++;
    }
    if (room.turn >= room.order.length) return endRound(room);
    room.phase = "ready";
    room.last = null;
    setTimer(room, R.START_SECS * 1000, () => recordStop(room, null));   // never started: skipped
    pushState(room);
  }

  function go(room) {
    room.phase = "running";
    room.runningSince = Date.now();
    // left running far too long: stopped for them, a long way off
    setTimer(room, room.target * 1000 * 3 + 20000, () => recordStop(room, Date.now() - room.runningSince));
    pushState(room);
  }

  function recordStop(room, ms) {
    const id = room.order[room.turn];
    const p = playerOf(room, id);
    room.times[id] = ms;
    if (ms !== null) {
      const off = ms - room.target * 1000;
      const perfect = Math.abs(off) <= R.PERFECT_MS;
      room.last = { id, ms, off, perfect };
      if (p && (p.best === null || Math.abs(off) < Math.abs(p.best))) p.best = off;
    } else room.last = { id, ms: null, off: null, perfect: false };
    room.phase = "result";
    room.turn++;
    setTimer(room, R.RESULT_MS, () => beginTurn(room));
    pushState(room);
  }

  // Everyone's had a go: points for the round, then the ranking.
  function endRound(room) {
    stopTimer(room);
    const target = room.target * 1000;
    const ranked = Object.entries(room.times).filter(([, ms]) => ms !== null)
      .sort((a, b) => Math.abs(a[1] - target) - Math.abs(b[1] - target));
    ranked.forEach(([id, ms], i) => {
      const p = playerOf(room, id);
      if (!p) return;
      p.score += ranked.length - 1 - i;                       // one for every player you beat
      if (Math.abs(ms - target) <= R.PERFECT_MS) { p.score += R.PERFECT_BONUS; p.perfects++; }
    });
    room.history.push({ round: room.round, target: room.target, times: { ...room.times },
      names: Object.fromEntries(room.players.map((p) => [p.id, p.name])) });
    room.phase = room.round >= R.ROUNDS ? "final" : "standings";
    room.last = null;
    pushState(room);
  }

  function toLobby(room) {
    stopTimer(room);
    room.phase = "lobby";
    quickCheck(room);
    pushState(room);
  }

  /* ---------- quick games ---------- */
  function quickCheck(room) {
    if (!room.quick) return;
    const ready = room.phase === "lobby" && room.players.filter(online).length >= 2;
    if (ready && !room.startAt) {
      room.startAt = Date.now() + QUICK_START_MS;
      room.startTimer = setTimeout(() => {
        room.startAt = 0;
        if (rooms.get(room.code) === room && room.phase === "lobby") startRound(room);
        else pushState(room);
      }, QUICK_START_MS);
    } else if (!ready) stopCountdown(room);
  }
  function stopCountdown(room) { clearTimeout(room.startTimer); room.startTimer = null; room.startAt = 0; }

  /* ---------- joining and leaving ---------- */
  // Arriving mid-round: you get a turn at the end of this one.
  function dealIn(room, p) {
    if (!["intro", "ready", "running", "result"].includes(room.phase) || room.order.includes(p.id)) return;
    room.order.push(p.id);
  }
  function attach(peer, room, p) {
    p.peer = peer; p.name = peer.name;
    if (peer.color) p.color = peer.color;
    peer.room = room.code;
    room.emptySince = 0;
  }
  function join(peer, code) {
    const room = rooms.get(String(code || "").toUpperCase().trim());
    if (!room) return send(peer, { t: "error", msg: "No Stop the Clock room with that code." });
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
    departed(room, peer.id);
  }
  function dropped(peer) {
    const room = peer.room ? rooms.get(peer.room) : null;
    if (!room) return;
    const p = playerOf(room, peer.id);
    if (p && p.peer === peer) { p.peer = null; departed(room, peer.id); }
  }
  // Someone went. If it was their turn, it's skipped.
  function departed(room, id) {
    if (room.host === id) {
      const next = room.players.find((p) => online(p) && !p.bot) || room.players.find(online) || room.players[0];
      if (next) room.host = next.id;
    }
    if (!room.players.some((p) => !p.bot)) { stopTimer(room); stopCountdown(room); rooms.delete(room.code); return; }
    if (!room.players.some((p) => online(p) && !p.bot)) room.emptySince = Date.now();
    if ((room.phase === "ready" || room.phase === "running") && room.order[room.turn] === id) return recordStop(room, null);
    quickCheck(room);
    pushState(room);
  }
  setInterval(() => {
    const now = Date.now();
    for (const room of rooms.values()) {
      if (room.emptySince && now - room.emptySince > EMPTY_ROOM_MS) { stopTimer(room); stopCountdown(room); rooms.delete(room.code); }
    }
  }, 60000);

  /* ---------- bots (localhost only: see server.js peer.dev) ---------- */
  const BOT_NAMES = ["Botty", "Robo Rita", "Beep", "Clanky", "Sir Bolt", "Unit 7", "Gizmo", "Chip", "Widget"];
  const BOT_COLORS = ["#4f8cff", "#ff7a59", "#ffb02e", "#c86bff", "#29c7d8", "#ff4d8d"];
  function addBot(room) {
    const taken = new Set(room.players.map((p) => p.name));
    const name = BOT_NAMES.find((n) => !taken.has(n)) || `Bot ${room.players.length + 1}`;
    const id = "bot-" + crypto.randomUUID().slice(0, 8);
    const color = BOT_COLORS[room.players.filter((p) => p.bot).length % BOT_COLORS.length];
    const p = { id, name, color, peer: null, score: 0, perfects: 0, best: null, bot: true, botKey: "", botTimer: null };
    p.peer = { id, name, color, room: room.code, socket: null, bot: true };
    room.players.push(p);
  }
  function botsLook(room) {
    for (const b of room.players) {
      if (!b.bot) continue;
      const key = [room.phase, room.round, room.turn].join(":");
      if (key === b.botKey) continue;
      b.botKey = key;
      clearTimeout(b.botTimer);
      if (room.order[room.turn] !== b.id) continue;
      if (room.phase === "ready") {
        b.botTimer = setTimeout(() => { if (rooms.get(room.code) === room) handle(b.peer, { t: "go" }); }, 1000 + Math.random() * 1500);
      } else if (room.phase === "running") {
        // humans drift about 5% either way; so does the bot
        const ms = Math.max(50, Math.round(room.target * 1000 * (1 + (Math.random() - 0.5) * 0.12)));
        b.botTimer = setTimeout(() => { if (rooms.get(room.code) === room) handle(b.peer, { t: "stop", ms }); }, ms);
      }
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
    if (m.t === "name" && !peer.room) {
      peer.name = cleanName(m.name);
      if (m.color && /^#[0-9a-f]{6}$/i.test(m.color)) peer.color = m.color;
      return;
    }
    const room = peer.room ? rooms.get(peer.room) : null;
    const me = room && playerOf(room, peer.id);
    if (!me) return;
    const isHost = room.host === me.id;
    const mine = room.order[room.turn] === me.id;

    switch (m.t) {
      case "name":
        peer.name = me.name = cleanName(m.name);
        if (m.color && /^#[0-9a-f]{6}$/i.test(m.color)) peer.color = me.color = m.color;
        return pushState(room);
      case "start":
        if (!isHost || room.phase !== "lobby") return;
        return startRound(room);
      case "go":
        if (room.phase !== "ready" || !mine) return;
        return go(room);
      case "stop": {
        if (room.phase !== "running" || !mine) return;
        const ms = m.ms === null || m.ms === undefined ? NaN : Math.round(Number(m.ms));   // none sent: ours
        const real = Date.now() - room.runningSince;
        // their own clock, as long as it's possible
        const ok = Number.isFinite(ms) && ms >= 0 && ms <= real + SLACK_MS;
        return recordStop(room, ok ? ms : real);
      }
      case "next":
        if (!(isHost || room.quick) || room.phase !== "standings") return;
        return startRound(room);
      case "again":
        if (!isHost || room.phase !== "final") return;
        for (const p of room.players) { p.score = 0; p.perfects = 0; p.best = null; }
        room.round = 0; room.used = []; room.history = [];
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
