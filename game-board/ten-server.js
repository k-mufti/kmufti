// Out of Ten, the server half. Loaded by server.js, which owns the socket
// and hands over every message from a player on the Out of Ten page.
//
// The server keeps the one secret: the number (0-10). Everyone in the ring
// is told it; the one in the middle isn't, until the round's over.
//
// A round: the number goes round (deal); the one in the middle picks a
// prompt card and who to throw it at (throw); they answer in 30s (answer);
// the one in the middle says where they're at now (read). Every player in
// the ring gets one card, then the last read is the final guess (reveal).
// Everyone sits in the middle once, then it's the final standings.
//
// Protocol, client -> server, on top of server.js's hello/leave:
//   {t:"create"} {t:"join", code} {t:"quick"} {t:"leave"} {t:"name", name}
//   {t:"start"}                 host: the first round
//   {t:"throw", i, text, to}    the middle: card i of the offer (or text: my own), at player `to`
//   {t:"answer", text}          whoever caught the card
//   {t:"read", n}               the middle: I'm at an n (0-10)
//   {t:"next"}                  host: the next round (or the standings, once everyone's sat in the middle)
//   {t:"end"}                   host: to the final standings now
//   {t:"again"}                 host: from the final standings, back to the lobby
//   {t:"addbot"} {t:"clearbots"} host, in the lobby, on localhost only
"use strict";

const crypto = require("crypto");

const QUICK_START_MS = 6000;
const QUICK_MAX = 8;
const EMPTY_ROOM_MS = 10 * 60 * 1000;

module.exports = function ten({ send, cleanText, cleanName, newCode, P, R }) {
  const rooms = new Map();

  const pick = (a) => a[crypto.randomInt(0, a.length)];
  const online = (p) => !!p.peer;
  const playerOf = (room, id) => room.players.find((p) => p.id === id);
  function shuffled(n) {
    const a = [...Array(n).keys()];
    for (let i = n - 1; i > 0; i--) { const j = crypto.randomInt(0, i + 1); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }

  function makeRoom(host, quick) {
    const room = {
      code: newCode(),
      game: "ten",
      host: host.id,
      quick: !!quick,
      startAt: 0, startTimer: null,
      players: [],        // { id, name, color, peer, score, stats, bot }
      phase: "lobby",     // lobby | deal | throw | answer | read | reveal | final
      round: 0,
      guesser: null,      // who's in the middle
      lastGuesser: -1,    // index into players, so it goes round
      sat: new Set(),     // who's been in the middle this game
      number: null,
      deck: [], offer: [],
      thrown: null,       // { to, card: { text, low, high }, mine }
      done: new Set(),    // who's had a card this round
      turns: [],          // [{ to, card, answer, before, read, closer }]
      read: R.START_READ,
      result: null,       // { number, guess, exact, why }
      history: [],
      deadline: 0, timer: null,
      emptySince: 0,
    };
    rooms.set(room.code, room);
    return room;
  }
  const newStats = () => ({ sat: 0, exact: 0, answered: 0, closer: 0, missed: 0 });
  function addPlayer(room, peer) {
    const p = { id: peer.id, name: peer.name, color: peer.color, peer: null, score: 0, stats: newStats() };
    room.players.push(p);
    return p;
  }

  // Who's still to get a card this round (here or not), and who of them
  // can catch one right now.
  const waiting = (room) => room.players.filter((p) => p.id !== room.guesser && !room.done.has(p.id)).map((p) => p.id);
  const eligible = (room) => waiting(room).filter((id) => online(playerOf(room, id)));

  /* ---------- what each player is told ---------- */
  function viewFor(room, viewer) {
    const over = room.phase === "reveal" || room.phase === "final";
    const middle = !!viewer && viewer.id === room.guesser;
    const left = waiting(room);
    return {
      t: "state",
      game: "ten",
      code: room.code,
      you: viewer ? viewer.id : null,
      host: room.host,
      quick: room.quick,
      dev: !!(viewer && viewer.peer && viewer.peer.dev),
      startsIn: room.startAt ? Math.max(0, room.startAt - Date.now()) : 0,
      players: room.players.map((p) => ({ id: p.id, name: p.name, color: p.color, online: online(p), score: p.score, bot: !!p.bot, sat: room.sat.has(p.id) })),
      phase: room.phase,
      round: room.round,
      rounds: Math.max(room.round, room.players.filter(online).length),
      guesser: room.guesser,
      // everyone but the one in the middle knows it, until the round's over
      number: room.number != null && (over || !middle) ? room.number : null,
      offer: middle && room.phase === "throw" ? room.offer.map((i) => P.card(P.PROMPTS[i])) : [],
      eligible: eligible(room),
      toGo: left.length,      // still to get a card, here or not
      thrown: room.thrown,
      turns: room.turns,
      read: room.read,
      // reading after the last card: this one's the final guess
      last: room.phase === "read" && left.filter((id) => !room.thrown || id !== room.thrown.to).length === 0,
      result: room.result,
      gameOver: room.phase === "reveal" && gameOver(room),
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
  // Everyone here has had their go in the middle.
  const gameOver = (room) => room.players.filter(online).every((p) => room.sat.has(p.id));

  // The next player round the table who's here and hasn't been in the middle.
  function startRound(room) {
    stopCountdown(room);
    if (canStart(room)) return toLobby(room);
    const n = room.players.length;
    let k = room.lastGuesser, found = false;
    for (let pass = 0; pass < 2 && !found; pass++) {
      for (let i = 0; i < n; i++) {
        k = (k + 1) % n;
        const p = room.players[k];
        if (online(p) && (pass === 1 || !room.sat.has(p.id))) { found = true; break; }
      }
    }
    room.lastGuesser = k;
    room.round++;
    room.guesser = room.players[k].id;
    room.sat.add(room.guesser);
    room.players[k].stats.sat++;
    room.number = crypto.randomInt(R.LOW, R.HIGH + 1);
    room.thrown = null; room.offer = [];
    room.done = new Set(); room.turns = [];
    room.read = R.START_READ;
    room.result = null;
    room.phase = "deal";
    setTimer(room, R.DEAL_SECS, () => beginThrow(room));
    pushState(room);
  }

  function draw(room) {
    const out = [];
    while (out.length < R.DRAW) {
      if (!room.deck.length) room.deck = shuffled(P.PROMPTS.length);
      const i = room.deck.pop();
      if (!out.includes(i)) out.push(i);
    }
    return out;
  }

  // The one in the middle picks a card and who gets it. Nobody left: the
  // last read stands as the final guess.
  function beginThrow(room) {
    room.thrown = null;
    if (!waiting(room).length) return finish(room, room.turns.length ? "done" : "empty");
    room.offer = draw(room);
    room.phase = "throw";
    // too slow: a random card at a random player (someone who's here, if anyone is)
    setTimer(room, R.THROW_SECS, () => {
      const here = eligible(room);
      doThrow(room, P.card(P.PROMPTS[pick(room.offer)]), pick(here.length ? here : waiting(room)), false);
    });
    pushState(room);
  }

  function doThrow(room, card, to, mine) {
    if (!to) return beginThrow(room);
    room.thrown = { to, card, mine };
    room.offer = [];
    room.phase = "answer";
    setTimer(room, R.ANSWER_SECS, () => answer(room, null));
    pushState(room);
  }

  function answer(room, text) {
    const t = room.thrown;
    const p = playerOf(room, t.to);
    if (p) { if (text) p.stats.answered++; else p.stats.missed++; }
    room.turns.push({ to: t.to, card: t.card, answer: text || null, before: room.read, read: null, closer: false });
    room.phase = "read";
    // too slow: the read stays where it was
    setTimer(room, R.READ_SECS, () => doRead(room, room.read));
    pushState(room);
  }

  function doRead(room, n) {
    const turn = room.turns[room.turns.length - 1];
    turn.read = n;
    turn.closer = !!turn.answer && R.closer(turn.before, n, room.number);
    if (turn.closer) {
      const p = playerOf(room, turn.to);
      if (p) { p.score += R.POINTS.closer; p.stats.closer++; }
    }
    room.read = n;
    room.done.add(turn.to);
    beginThrow(room);
  }

  function finish(room, why) {
    stopTimer(room);
    room.thrown = null; room.offer = [];
    const g = playerOf(room, room.guesser);
    const exact = why === "done" && room.read === room.number;
    if (exact) {
      if (g) { g.score += R.POINTS.exact; g.stats.exact++; }
      for (const p of room.players) if (p.id !== room.guesser && room.turns.some((t) => t.to === p.id)) p.score += R.POINTS.everyone;
    }
    room.result = { number: room.number, guess: room.read, exact, why };
    room.history.push({ round: room.round, guesser: room.guesser, guesserName: g ? g.name : "someone",
      number: room.number, guess: room.read, exact, why, turns: room.turns.length });
    room.phase = "reveal";
    pushState(room);
  }

  function toLobby(room) {
    stopTimer(room);
    room.phase = "lobby";
    room.number = null; room.thrown = null; room.offer = []; room.turns = [];
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
  function attach(peer, room, p) {
    p.peer = peer;
    p.name = peer.name;
    if (peer.color) p.color = peer.color;
    peer.room = room.code;
    room.emptySince = 0;
  }

  function join(peer, code) {
    const room = rooms.get(String(code || "").toUpperCase().trim());
    if (!room) return send(peer, { t: "error", msg: "No Out of Ten room with that code." });
    leave(peer);
    let p = playerOf(room, peer.id);
    if (!p) {
      if (room.players.length >= R.MAX_PLAYERS) return send(peer, { t: "error", msg: "That room is full." });
      p = addPlayer(room, peer);
    }
    attach(peer, room, p);
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
    if (i <= room.lastGuesser) room.lastGuesser--;
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
    const live = ["deal", "throw", "answer", "read"].includes(room.phase);
    // A dropped connection (a phone locking, a reload) doesn't stop anything:
    // the timers carry the round on until they're back. Leaving for good does.
    if (live && forGood && room.guesser === id) return finish(room, "left");
    // fewer than two still in the room (here or coming back): no round
    if (live && room.players.length < 2) return toLobby(room);
    // the card's in the air at someone who's left: it comes back blank
    if (forGood && room.phase === "answer" && room.thrown && room.thrown.to === id) return answer(room, null);
    // the last one still to get a card left
    if (room.phase === "throw" && !waiting(room).length) return beginThrow(room);
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
  // what a bot says for each number: vague on purpose
  const BOT_SAYS = ["the worst one there is", "honestly awful", "pretty bad", "not great", "a bit meh",
    "right in the middle", "fine, I guess", "pretty good", "really good", "amazing", "the best one ever"];
  function addBot(room) {
    const used = new Set(room.players.map((p) => p.name));
    const name = BOT_NAMES.find((n) => !used.has(n)) || `Bot ${room.players.length + 1}`;
    const id = "bot-" + crypto.randomUUID().slice(0, 8);
    const p = { id, name, color: pick(BOT_COLORS), peer: null, score: 0, stats: newStats(), bot: true };
    p.peer = { id, name, color: p.color, room: room.code, socket: null, bot: true };   // send() skips it: no socket
    room.players.push(p);
  }
  function botsLook(room) {
    for (const b of room.players) {
      if (!b.bot) continue;
      const key = [room.phase, room.round, room.turns.length, room.thrown ? room.thrown.to : ""].join(":");
      if (key === b.botKey) continue;
      b.botKey = key;
      clearTimeout(b.botTimer);
      b.botTimer = setTimeout(() => { if (rooms.get(room.code) === room && room.players.includes(b)) botAct(room, b); }, 1200 + Math.random() * 1800);
    }
  }
  function botAct(room, b) {
    const say = (m) => handle(b.peer, m);
    if (room.phase === "throw" && room.guesser === b.id) {
      return say({ t: "throw", i: crypto.randomInt(0, room.offer.length), to: pick(eligible(room)) });
    }
    if (room.phase === "answer" && room.thrown && room.thrown.to === b.id) {
      return say({ t: "answer", text: BOT_SAYS[room.number] });
    }
    if (room.phase === "read" && room.guesser === b.id) {
      // a nudge towards the number, give or take
      const n = room.number + crypto.randomInt(-2, 3);
      return say({ t: "read", n: Math.max(R.LOW, Math.min(R.HIGH, n)) });
    }
  }

  /* ---------- messages ---------- */
  function hello(peer) {
    for (const room of rooms.values()) {
      const p = playerOf(room, peer.id);
      if (p) {
        if (p.peer && p.peer !== peer) send(p.peer, { t: "idle" });
        attach(peer, room, p);
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
      case "throw": {
        if (room.phase !== "throw" || room.guesser !== me.id) return;
        if (!eligible(room).includes(m.to)) return send(peer, { t: "error", msg: "Throw it at someone who hasn't had a card." });
        const own = cleanText(m.text, R.PROMPT_MAX);
        let card;
        if (own) card = { text: own, low: "worst", high: "best" };
        else if (Number.isInteger(m.i) && m.i >= 0 && m.i < room.offer.length) card = P.card(P.PROMPTS[room.offer[m.i]]);
        else return send(peer, { t: "error", msg: "Pick a card first." });
        return doThrow(room, card, m.to, !!own);
      }
      case "answer": {
        if (room.phase !== "answer" || !room.thrown || room.thrown.to !== me.id) return;
        const text = cleanText(m.text, R.ANSWER_MAX);
        if (!text) return send(peer, { t: "error", msg: "Type your answer first." });
        return answer(room, text);
      }
      case "read": {
        if (room.phase !== "read" || room.guesser !== me.id) return;
        const n = Number(m.n);
        if (!Number.isInteger(n) || n < R.LOW || n > R.HIGH) return;
        return doRead(room, n);
      }
      case "next":
        if (!(isHost || room.quick) || room.phase !== "reveal") return;
        if (gameOver(room)) { room.phase = "final"; return pushState(room); }
        return startRound(room);
      case "end":
        if (!isHost || room.phase !== "reveal") return;
        room.phase = "final";
        return pushState(room);
      case "again":
        if (!isHost || room.phase !== "final") return;
        for (const p of room.players) { p.score = 0; p.stats = newStats(); }
        room.history = []; room.round = 0; room.lastGuesser = -1; room.sat = new Set();
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
