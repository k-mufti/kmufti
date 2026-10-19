// Imposter, the server half. Loaded by server.js, which owns the socket and
// hands over every message from a player on the Imposter page.
//
// The server keeps the secrets: who the imposter is and what the word is.
// Each player is told only their own word (or that they're the imposter);
// everything comes out at the end of the round.
//
// A round: a reel picks the category (spin) and a majority keeps it or
// spins again (landed); then everyone peeks at their card (reveal) - the word,
// or "you're the imposter" plus the category - and takes turns typing a
// one-word clue, three times round (clues), argues it out (talk), votes (vote), and watches the
// votes come in (verdict). A caught imposter gets one guess at the word
// (guess) to steal the round. Then the points (result), and again - until
// the host ends it (final).
//
// Protocol, client -> server, on top of server.js's hello/leave:
//   {t:"create"} {t:"join", code} {t:"quick"} {t:"leave"} {t:"name", name}
//   {t:"start"}                 host: spin for the first round
//   {t:"respin"} {t:"keep"}     after the reel lands: my vote
//   {t:"seen"}                  I've looked at my card
//   {t:"begin"}                 host: start the clues without waiting
//   {t:"clue", text}            my clue, on my turn (typed games)
//   {t:"sus", id}               point at someone while talking (id null: stop)
//   {t:"readyvote", off}        I want to vote now (off: changed my mind) -
//                               during clues or talk; at 75% of the round, it's voting time
//   {t:"addbot"} {t:"clearbots"} host, in the lobby, on localhost only: test players
//   {t:"vote", id}              my vote: a player id
//   {t:"guess", text}           the caught imposter's one guess
//   {t:"next"}                  host: deal the next round
//   {t:"end"}                   host: finish, to the final standings
//   {t:"again"}                 host: from the final standings, back to the lobby
"use strict";

const crypto = require("crypto");

const QUICK_START_MS = 8000;      // a quick game's countdown, once three are in
const QUICK_MAX = 10;
const VERDICT_BASE_MS = 3200;     // the verdict plays out on the page; the
const VERDICT_PER_VOTE_MS = 650;  // server waits for it before moving on
const EMPTY_ROOM_MS = 10 * 60 * 1000;

module.exports = function imposter({ send, cleanText, cleanName, newCode, W, R }) {
  const rooms = new Map();

  const shuffle = (a) => {
    a = a.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = crypto.randomInt(0, i + 1); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  };
  const pick = (a) => a[crypto.randomInt(0, a.length)];
  const online = (p) => !!p.peer;
  const playerOf = (room, id) => room.players.find((p) => p.id === id);
  const inRound = (room, p) => !!room.deal && room.deal.players.includes(p.id);
  const roundPlayers = (room) => room.players.filter((p) => inRound(room, p));

  function makeRoom(host, quick) {
    const room = {
      code: newCode(),
      game: "imposter",
      host: host.id,
      quick: !!quick,
      startAt: 0, startTimer: null,
      players: [],        // { id, name, color, peer, score, stats }
      phase: "lobby",
      round: 0,
      cat: null,          // the category the reel landed on (one of W.CATEGORIES)
      spinVotes: {},      // after it lands: id -> "respin" | "keep"
      spinEnds: 0,
      deal: null,         // { players, word, catName, imposter }
      seen: new Set(),
      order: [], turn: 0, clueRound: 0,
      clues: {},          // id -> [clue, ...]; null for a turn that ran out
      sus: {},            // id -> id they're pointing at
      readyVote: new Set(),
      votes: {},          // id -> id
      verdict: null,      // { out, tally, votes }
      guess: null,        // { text, right }
      result: null,       // { winner, why, gains }
      history: [],
      deadline: 0, timer: null,
      usedPairs: new Set(),
      emptySince: 0,
    };
    rooms.set(room.code, room);
    return room;
  }

  const newStats = () => ({ imposter: 0, escaped: 0, stole: 0, caught: 0, sharp: 0, votedOut: 0, susVotes: 0 });
  function addPlayer(room, peer) {
    const p = { id: peer.id, name: peer.name, color: peer.color, peer: null, score: 0, stats: newStats() };
    room.players.push(p);
    return p;
  }

  /* ---------- what each player is told ---------- */
  function viewFor(room, viewer) {
    const d = room.deal;
    const over = room.phase === "result" || room.phase === "final";
    let you = null;
    if (viewer && d && inRound(room, viewer)) {
      // the imposter gets no word, only the category everyone saw land
      const isIn = viewer.id === d.imposter;
      you = { word: isIn ? null : d.word, imposter: isIn, cat: d.catName };
    }
    const voted = Object.keys(room.votes);
    return {
      t: "state",
      game: "imposter",
      code: room.code,
      you: viewer ? viewer.id : null,
      me: you,
      host: room.host,
      quick: room.quick,
      startsIn: room.startAt ? Math.max(0, room.startAt - Date.now()) : 0,
      rounds: R.ROUNDS,
      talk: R.TALK_SECS,
      cat: room.cat ? { name: room.cat.name } : null,
      cats: W.CATEGORIES.map((c) => ({ name: c.name })),   // for the reel
      spinVotes: room.spinVotes,
      spinLeft: room.phase === "landed" ? Math.max(0, room.spinEnds - Date.now()) : 0,
      players: room.players.map((p) => ({
        id: p.id, name: p.name, color: p.color, online: online(p), score: p.score,
        inRound: inRound(room, p), seen: room.seen.has(p.id), readyVote: room.readyVote.has(p.id),
        voted: voted.includes(p.id), bot: !!p.bot,
      })),
      voteNeed: R.voteNeed(roundPlayers(room).filter(online).length),
      dev: !!(viewer && viewer.peer && viewer.peer.dev),
      phase: room.phase,
      round: room.round,
      order: room.order,
      turn: room.turn,
      clueRound: room.clueRound,
      clues: room.clues,
      sus: room.sus,
      msLeft: room.deadline ? Math.max(0, room.deadline - Date.now()) : 0,
      verdict: room.verdict,
      guessing: room.phase === "guess" ? d.imposter : null,
      // the secrets, once the round's over
      reveal: over && d ? { word: d.word, cat: d.catName, imposter: d.imposter, guess: room.guess } : null,
      result: room.result,
      history: room.phase === "final" ? room.history : room.history.slice(-1),
      stats: room.phase === "final" ? room.players.map((p) => ({ id: p.id, ...p.stats })) : null,
    };
  }
  function pushState(room) {
    for (const p of room.players) if (p.peer) send(p.peer, viewFor(room, p));
    botsLook(room);
  }
  function broadcast(room, obj) {
    for (const p of room.players) if (p.peer) send(p.peer, obj);
  }

  /* ---------- timers ---------- */
  function setTimer(room, ms, fn) {
    clearTimeout(room.timer);
    room.deadline = ms ? Date.now() + ms : 0;
    room.timer = ms ? setTimeout(() => { room.timer = null; room.deadline = 0; if (rooms.get(room.code) === room) fn(); }, ms) : null;
  }
  const stopTimer = (room) => setTimer(room, 0);

  /* ---------- a round ---------- */
  function canStart(room) {
    const here = room.players.filter(online).length;
    return here >= R.MIN_PLAYERS ? null : `You need at least ${R.MIN_PLAYERS} players.`;
  }

  // A word from the category the reel landed on, one not used this game if
  // there's one left. (Each entry in words.js is a pair of close cousins;
  // either half makes a good secret word.)
  function deal(room) {
    const c = room.cat;
    const pool = [];
    c.pairs.forEach((pair, i) => pair.forEach((word, k) => pool.push({ word, key: `${c.id}:${i}:${k}` })));
    let fresh = pool.filter((x) => !room.usedPairs.has(x.key));
    if (!fresh.length) { for (const x of pool) room.usedPairs.delete(x.key); fresh = pool; }
    const { word, key } = pick(fresh);
    room.usedPairs.add(key);
    const players = room.players.filter(online).map((p) => p.id);
    room.deal = { players, word, catName: c.name, imposter: pick(players) };
  }

  // A new round starts with the reel: everyone watches the category land.
  function startRound(room) {
    stopCountdown(room);
    room.deal = null;
    spin(room, null);
  }
  function spin(room, not) {
    room.cat = pick(W.CATEGORIES.filter((c) => c.id !== not));
    room.spinVotes = {};
    room.phase = "spin";
    setTimer(room, R.SPIN_MS, () => landed(room));
    pushState(room);
  }
  function landed(room) {
    room.phase = "landed";
    room.spinVotes = {};
    room.spinEnds = Date.now() + R.RESPIN_MS;
    setTimer(room, R.RESPIN_MS, () => decideSpin(room, true));
    pushState(room);
  }
  // Keep or respin, by majority of the players here. A vote can be changed
  // until it's decided.
  function spinVote(room, p, v) {
    if (room.phase !== "landed") return;
    room.spinVotes[p.id] = v;
    if (!decideSpin(room, false)) pushState(room);
  }
  function decideSpin(room, timeUp) {
    const here = room.players.filter(online);
    const out = R.spinOutcome(here.map((x) => room.spinVotes[x.id]), here.length, timeUp);
    if (out === "respin") { spin(room, room.cat.id); return true; }
    if (out === "keep") { dealRound(room); return true; }
    return false;
  }

  function dealRound(room) {
    if (canStart(room)) { stopTimer(room); room.phase = "lobby"; room.deal = null; quickCheck(room); return pushState(room); }
    room.round++;
    deal(room);
    room.seen = new Set();
    room.order = [];
    room.turn = 0;
    room.clueRound = 0;
    room.clues = {};
    room.sus = {};
    room.readyVote = new Set();
    room.votes = {};
    room.verdict = null;
    room.guess = null;
    room.result = null;
    room.phase = "reveal";
    stopTimer(room);
    pushState(room);
  }

  function maybeBeginClues(room) {
    if (room.phase !== "reveal") return;
    const waiting = roundPlayers(room).filter((p) => online(p) && !room.seen.has(p.id));
    if (!waiting.length) beginClues(room);
  }

  function beginClues(room) {
    const d = room.deal;
    let order = shuffle(d.players);
    // the imposter never has to go first, with nothing to go on
    if (order[0] === d.imposter && order.length > 1) [order[0], order[1]] = [order[1], order[0]];
    room.order = order;
    room.clueRound = 1;
    room.turn = 0;
    room.clues = {};
    room.phase = "clues";
    startTurn(room);
  }

  function startTurn(room) {
    // skip anyone who's gone
    while (room.turn < room.order.length) {
      const p = playerOf(room, room.order[room.turn]);
      if (p && online(p)) break;
      if (p) (room.clues[p.id] = room.clues[p.id] || []).push(null);
      room.turn++;
    }
    if (room.turn >= room.order.length) {
      if (room.clueRound >= R.ROUNDS) return beginTalk(room);
      room.clueRound++;
      room.turn = 0;
      return startTurn(room);
    }
    setTimer(room, R.TURN_SECS * 1000, () => giveClue(room, room.order[room.turn], null));
    pushState(room);
  }

  function giveClue(room, id, text) {
    if (room.phase !== "clues" || room.order[room.turn] !== id) return;
    (room.clues[id] = room.clues[id] || []).push(text);
    room.turn++;
    startTurn(room);
  }

  function beginTalk(room) {
    room.phase = "talk";
    room.sus = {};
    setTimer(room, R.TALK_SECS * 1000, () => beginVote(room));
    pushState(room);
  }
  // Enough of the round wants to vote: 75% of the players still here.
  function maybeVoteNow(room) {
    if (room.phase !== "talk" && room.phase !== "clues") return false;
    const here = roundPlayers(room).filter(online);
    const ready = here.filter((p) => room.readyVote.has(p.id)).length;
    if (here.length && ready >= R.voteNeed(here.length)) { beginVote(room); return true; }
    return false;
  }

  function beginVote(room) {
    room.phase = "vote";
    room.votes = {};
    setTimer(room, R.VOTE_SECS * 1000, () => tally(room));
    pushState(room);
  }
  function maybeTally(room) {
    if (room.phase !== "vote") return;
    const waiting = roundPlayers(room).filter((p) => online(p) && !(p.id in room.votes));
    if (!waiting.length) tally(room);
  }

  function tally(room) {
    const counts = {};
    for (const v of Object.values(room.votes)) counts[v] = (counts[v] || 0) + 1;
    let top = 0, out = null;
    for (const [id, n] of Object.entries(counts)) {
      if (n > top) { top = n; out = id; } else if (n === top) out = null;   // a tie: nobody goes
    }
    for (const [id, n] of Object.entries(counts)) {
      const p = playerOf(room, id);
      if (p) p.stats.susVotes += n;
    }
    room.verdict = { out, tally: counts, votes: { ...room.votes }, tie: !out && top > 0 };
    room.phase = "verdict";
    const ms = VERDICT_BASE_MS + VERDICT_PER_VOTE_MS * Object.keys(room.votes).length;
    setTimer(room, ms, () => afterVerdict(room));
    pushState(room);
  }

  function afterVerdict(room) {
    const d = room.deal;
    const out = room.verdict.out;
    const outP = out ? playerOf(room, out) : null;
    if (outP) outP.stats.votedOut++;
    if (d.imposter && out === d.imposter) {
      room.phase = "guess";
      setTimer(room, R.GUESS_SECS * 1000, () => finish(room, null));
      return pushState(room);
    }
    finish(room, null);
  }

  // The round's over: who won, and the points.
  function finish(room, guessText) {
    stopTimer(room);
    const d = room.deal;
    const out = room.verdict ? room.verdict.out : null;
    const votes = room.verdict ? room.verdict.votes : {};
    const gains = {};
    const add = (id, n) => { if (n) gains[id] = (gains[id] || 0) + n; };
    let winner, why;
    const inP = d.imposter ? playerOf(room, d.imposter) : null;
    if (inP) inP.stats.imposter++;

    if (room.fled) {
      winner = "crew"; why = "fled";
      for (const id of d.players) if (id !== d.imposter) add(id, R.POINTS.crewCatch);
    } else if (out === d.imposter) {
      room.guess = guessText === null ? { text: null, right: false } : { text: guessText, right: R.sameWord(guessText, d.word) };
      if (room.guess.right) {
        winner = "imposter"; why = "stole";
        add(d.imposter, R.POINTS.imposterSteal);
        if (inP) inP.stats.stole++;
      } else {
        winner = "crew"; why = "caught";
        if (inP) inP.stats.caught++;
        for (const id of d.players) {
          if (id === d.imposter) continue;
          add(id, R.POINTS.crewCatch);
          if (votes[id] === d.imposter) add(id, R.POINTS.crewSharp);
        }
      }
    } else {
      winner = "imposter"; why = out ? "wrong" : "tie";
      add(d.imposter, R.POINTS.imposterEscape);
      if (inP) inP.stats.escaped++;
    }
    for (const [id, v] of Object.entries(votes)) {
      const p = playerOf(room, id);
      if (p && d.imposter && v === d.imposter) p.stats.sharp++;
    }
    for (const [id, n] of Object.entries(gains)) { const p = playerOf(room, id); if (p) p.score += n; }
    room.result = { winner, why, gains };
    room.fled = false;
    room.history.push({
      round: room.round, word: d.word, cat: d.catName,
      imposter: d.imposter, imposterName: inP ? inP.name : null,
      out, outName: out ? playerOf(room, out)?.name || "someone" : null,
      winner, why, guess: room.guess,
    });
    room.phase = "result";
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
  // Arriving mid-round (or coming back after dropping out of it): you're in,
  // as crew - you get the word, and a turn at the end of the clue order. Only
  // once the votes are being counted is it too late for this round.
  function dealIn(room, p) {
    const d = room.deal;
    if (!d || d.players.includes(p.id) || !["reveal", "clues", "talk", "vote"].includes(room.phase)) return;
    d.players.push(p.id);
    if (room.order.length) room.order.push(p.id);
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
    if (!room) return send(peer, { t: "error", msg: "No Imposter room with that code." });
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
    const d = room.deal;
    const live = ["reveal", "clues", "talk", "vote", "verdict", "guess"].includes(room.phase);
    if (live && d && d.players.includes(id)) {
      if (forGood) {
        d.players = d.players.filter((x) => x !== id);
        room.order = room.order.filter((x, k) => { if (x === id && k < room.turn) room.turn--; return x !== id; });
        delete room.sus[id];
        delete room.votes[id];
        room.readyVote.delete(id);
        if (d.imposter === id) { room.fled = true; quickCheck(room); return finish(room, null); }
      }
      if (d.players.filter((x) => playerOf(room, x) && online(playerOf(room, x))).length < 2) {
        stopTimer(room);
        room.phase = "lobby";
        room.deal = null;
      } else if (room.phase === "reveal") maybeBeginClues(room);
      else if (room.phase === "clues" && room.order[room.turn] === id) return startTurn(room);
      else if (room.phase === "clues" && forGood) return startTurn(room);
      else if (room.phase === "talk") maybeVoteNow(room);
      else if (room.phase === "vote") maybeTally(room);
      else if (room.phase === "guess" && d.imposter === id && forGood) finish(room, null);
    }
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
     A bot is a player whose "connection" goes nowhere. It plays by sending
     itself the same messages a person's page would, a beat after anything
     changes, so every rule it follows is the real one. */
  const BOT_NAMES = ["Botty", "Robo Rita", "Beep", "Clanky", "Sir Bolt", "Unit 7", "Gizmo", "Chip", "Widget", "Sprocket", "Dial-up", "Bleep"];
  const BOT_COLORS = ["#4f8cff", "#2fe08a", "#ffb02e", "#c86bff", "#29c7d8", "#ff7a59"];
  const BOT_CLUES = ["classic", "everyday", "popular", "big", "small", "fun", "famous", "old", "colorful", "fast", "loud", "soft", "tasty", "fancy", "simple", "rare", "hmm", "vibes", "cozy", "wild"];
  function addBot(room) {
    const taken = new Set(room.players.map((p) => p.name));
    const name = BOT_NAMES.find((n) => !taken.has(n)) || `Bot ${room.players.length + 1}`;
    const id = "bot-" + crypto.randomUUID().slice(0, 8);
    const color = BOT_COLORS[room.players.filter((p) => p.bot).length % BOT_COLORS.length];
    const p = { id, name, color, peer: null, score: 0, stats: newStats(), bot: true, botKey: "", botTimer: null };
    p.peer = { id, name, color, room: room.code, socket: null, bot: true };   // send() skips it: no socket
    room.players.push(p);
  }
  // After every change: anything for a bot to do? Schedule it once per moment.
  function botsLook(room) {
    for (const b of room.players) {
      if (!b.bot) continue;
      const key = [room.phase, room.round, room.clueRound, room.turn, room.order[room.turn], !!room.guess,
        room.cat && room.cat.id, Object.values(room.spinVotes).join()].join(":");
      if (key === b.botKey) continue;
      b.botKey = key;
      clearTimeout(b.botTimer);
      const wait = room.phase === "talk" ? 6000 + Math.random() * 6000 : 900 + Math.random() * 1800;
      b.botTimer = setTimeout(() => { if (rooms.get(room.code) === room && room.players.includes(b)) botAct(room, b); }, wait);
    }
  }
  function botAct(room, b) {
    const say = (m) => handle(b.peer, m);
    // the category: bots go along with any person who wants a respin
    if (room.phase === "landed") {
      if (room.spinVotes[b.id]) return;
      const people = Object.entries(room.spinVotes).filter(([id]) => !playerOf(room, id)?.bot).map(([, v]) => v);
      if (people.includes("respin")) return say({ t: "respin" });
      if (people.includes("keep") || Math.random() < 0.5) return say({ t: "keep" });
      return;
    }
    const d = room.deal;
    if (!d || !d.players.includes(b.id)) return;
    switch (room.phase) {
      case "reveal":
        if (!room.seen.has(b.id)) say({ t: "seen" });
        return;
      case "clues": {
        if (room.order[room.turn] !== b.id) return;
        const mine = b.id === d.imposter ? null : d.word;
        const ok = BOT_CLUES.filter((c) => !mine || !R.givesItAway(c, mine));
        return say({ t: "clue", text: pick(ok.length ? ok : ["hmm"]) });
      }
      case "talk":
        if (!room.readyVote.has(b.id)) say({ t: "readyvote" });
        return;
      case "vote": {
        if (b.id in room.votes) return;
        const others = d.players.filter((x) => x !== b.id);
        return say({ t: "vote", id: pick(others) });
      }
      case "guess": {
        if (d.imposter !== b.id) return;
        const cat = W.CATEGORIES.find((c) => c.name === d.catName);
        const words = cat ? cat.pairs.flat() : ["no idea"];
        return say({ t: "guess", text: pick(words) });
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
    const d = room.deal;

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
      case "seen":
        if (room.phase !== "reveal" || !inRound(room, me)) return;
        room.seen.add(me.id);
        pushState(room);
        return maybeBeginClues(room);
      case "begin":
        if (!isHost || room.phase !== "reveal") return;
        return beginClues(room);
      case "clue": {
        if (room.phase !== "clues" || room.order[room.turn] !== me.id) return;
        const text = cleanText(m.text, 32);
        if (!text) return;
        if (text.split(" ").length > 3) return send(peer, { t: "error", msg: "Keep it short: three words at most." });
        const mine = me.id === d.imposter ? null : d.word;
        if (mine && R.givesItAway(text, mine)) return send(peer, { t: "error", msg: "No saying the word!" });
        broadcast(room, { t: "clued", by: me.id });
        return giveClue(room, me.id, text);
      }
      case "respin":
      case "keep":
        return spinVote(room, me, m.t);
      case "sus": {
        if (room.phase !== "talk" || !inRound(room, me)) return;
        const target = m.id ? playerOf(room, m.id) : null;
        if (target && target.id !== me.id && inRound(room, target)) room.sus[me.id] = target.id;
        else delete room.sus[me.id];
        return pushState(room);
      }
      case "readyvote":
        if ((room.phase !== "talk" && room.phase !== "clues") || !inRound(room, me)) return;
        if (m.off) room.readyVote.delete(me.id); else room.readyVote.add(me.id);
        if (!maybeVoteNow(room)) pushState(room);
        return;
      case "addbot": {
        if (!isHost || room.phase !== "lobby" || !peer.dev) return;
        if (room.players.length >= R.MAX_PLAYERS) return send(peer, { t: "error", msg: "The room is full." });
        addBot(room);
        return pushState(room);
      }
      case "clearbots":
        if (!isHost || room.phase !== "lobby" || !peer.dev) return;
        for (const b of room.players.filter((x) => x.bot)) clearTimeout(b.botTimer);
        room.players = room.players.filter((x) => !x.bot);
        return pushState(room);
      case "vote": {
        if (room.phase !== "vote" || !inRound(room, me) || me.id in room.votes) return;
        if (m.id === me.id || !d.players.includes(m.id)) return;
        room.votes[me.id] = m.id;
        broadcast(room, { t: "voted", by: me.id });
        pushState(room);
        return maybeTally(room);
      }
      case "guess": {
        if (room.phase !== "guess" || me.id !== d.imposter) return;
        const text = cleanText(m.text, 40);
        if (!text) return;
        return finish(room, text);
      }
      case "next":
        if (!(isHost || room.quick) || room.phase !== "result") return;
        if (canStart(room)) { room.phase = "lobby"; room.deal = null; quickCheck(room); return pushState(room); }
        return startRound(room);
      case "end":
        if (!isHost || room.phase !== "result") return;
        room.phase = "final";
        return pushState(room);
      case "again":
        if (!isHost || room.phase !== "final") return;
        for (const p of room.players) { p.score = 0; p.stats = newStats(); }
        room.history = [];
        room.round = 0;
        room.deal = null;
        room.phase = "lobby";
        quickCheck(room);
        return pushState(room);
    }
  }

  return { rooms, hello, handle, dropped, leave };
};
