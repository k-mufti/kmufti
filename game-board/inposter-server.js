// Inposter, the server half. Loaded by server.js, which owns the socket and
// hands over every message from a player on the Inposter page.
//
// The server keeps the secrets: who the inposter is and what the word is.
// Each player is told only their own word (or that they're the inposter);
// everything comes out at the end of the round.
//
// A round: everyone peeks at their card (reveal), then takes turns giving a
// one-word clue (clues), argues it out (talk), votes (vote), and watches the
// votes come in (verdict). A caught inposter gets one guess at the word
// (guess) to steal the round. Then the points (result), and again - until
// the host ends it (final).
//
// Protocol, client -> server, on top of server.js's hello/leave:
//   {t:"create"} {t:"join", code} {t:"quick"} {t:"leave"} {t:"name", name}
//   {t:"settings", key, value}  host, in the lobby
//   {t:"start"}                 host: deal the first round
//   {t:"seen"}                  I've looked at my card
//   {t:"begin"}                 host: start the clues without waiting
//   {t:"clue", text}            my clue, on my turn (typed games)
//   {t:"done"}                  I've said my clue out loud (spoken games)
//   {t:"sus", id}               point at someone while talking (id null: stop)
//   {t:"readyvote"}             I'm ready to vote
//   {t:"vote", id}              my vote: a player id, or "nobody"
//   {t:"guess", text}           the caught inposter's one guess
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

module.exports = function inposter({ send, cleanText, cleanName, newCode, W, R }) {
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
    const settings = {};
    for (const k in R.SETTINGS) settings[k] = R.SETTINGS[k].def;
    if (quick) settings.clues = "typed";
    const room = {
      code: newCode(),
      game: "inposter",
      host: host.id,
      quick: !!quick,
      startAt: 0, startTimer: null,
      settings,
      players: [],        // { id, name, color, peer, score, stats }
      phase: "lobby",
      round: 0,
      deal: null,         // { players, word, odd, cat, inposter }
      seen: new Set(),
      order: [], turn: 0, clueRound: 0,
      clues: {},          // id -> [clue, ...]; null for a turn that ran out
      sus: {},            // id -> id they're pointing at
      readyVote: new Set(),
      votes: {},          // id -> id | "nobody"
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

  const newStats = () => ({ inposter: 0, escaped: 0, stole: 0, caught: 0, sharp: 0, votedOut: 0, susVotes: 0 });
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
      const isIn = viewer.id === d.inposter;
      const undercover = room.settings.mode === "undercover";
      you = {
        // classic: the inposter gets no word; undercover: the odd one out
        // gets the cousin word and isn't told
        word: isIn ? (undercover ? d.odd : null) : d.word,
        inposter: isIn && !undercover,
        cat: isIn && !undercover && room.settings.hint === "none" ? null : d.catName,
      };
    }
    const voted = Object.keys(room.votes);
    return {
      t: "state",
      game: "inposter",
      code: room.code,
      you: viewer ? viewer.id : null,
      me: you,
      host: room.host,
      quick: room.quick,
      startsIn: room.startAt ? Math.max(0, room.startAt - Date.now()) : 0,
      settings: room.settings,
      players: room.players.map((p) => ({
        id: p.id, name: p.name, color: p.color, online: online(p), score: p.score,
        inRound: inRound(room, p), seen: room.seen.has(p.id), readyVote: room.readyVote.has(p.id),
        voted: voted.includes(p.id),
      })),
      phase: room.phase,
      round: room.round,
      order: room.order,
      turn: room.turn,
      clueRound: room.clueRound,
      clues: room.clues,
      sus: room.sus,
      msLeft: room.deadline ? Math.max(0, room.deadline - Date.now()) : 0,
      verdict: room.verdict,
      guessing: room.phase === "guess" ? d.inposter : null,
      // the secrets, once the round's over
      reveal: over && d ? { word: d.word, odd: d.odd, cat: d.catName, inposter: d.inposter, guess: room.guess } : null,
      result: room.result,
      history: room.phase === "final" ? room.history : room.history.slice(-1),
      stats: room.phase === "final" ? room.players.map((p) => ({ id: p.id, ...p.stats })) : null,
    };
  }
  function pushState(room) {
    for (const p of room.players) if (p.peer) send(p.peer, viewFor(room, p));
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

  function deal(room) {
    const cats = W.CATEGORIES.filter((c) => !room.settings.cats.length || room.settings.cats.includes(c.id));
    const pool = [];
    for (const c of cats) c.pairs.forEach((pair, i) => pool.push({ c, pair, key: `${c.id}:${i}` }));
    let fresh = pool.filter((x) => !room.usedPairs.has(x.key));
    if (!fresh.length) { for (const x of pool) room.usedPairs.delete(x.key); fresh = pool; }
    const { c, pair, key } = pick(fresh);
    room.usedPairs.add(key);
    const flip = crypto.randomInt(0, 2);
    const players = room.players.filter(online).map((p) => p.id);
    const noOne = room.settings.chaos && Math.random() < R.CHAOS_ODDS;
    room.deal = {
      players,
      word: pair[flip],
      odd: pair[1 - flip],
      catName: c.name,
      catEmoji: c.emoji,
      inposter: noOne ? null : pick(players),
    };
  }

  function startRound(room) {
    stopCountdown(room);
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
    // the inposter never has to go first, with nothing to go on
    if (order[0] === d.inposter && order.length > 1) [order[0], order[1]] = [order[1], order[0]];
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
      if (room.clueRound >= room.settings.rounds) return beginTalk(room);
      room.clueRound++;
      room.turn = 0;
      return startTurn(room);
    }
    const secs = room.settings.clues === "spoken" ? R.TURN_SECS + 20 : R.TURN_SECS;
    setTimer(room, secs * 1000, () => giveClue(room, room.order[room.turn], null));
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
    room.readyVote = new Set();
    setTimer(room, room.settings.talk * 1000, () => beginVote(room));
    pushState(room);
  }
  function maybeVoteNow(room) {
    if (room.phase !== "talk") return;
    const waiting = roundPlayers(room).filter((p) => online(p) && !room.readyVote.has(p.id));
    if (!waiting.length) beginVote(room);
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
    const outP = out && out !== "nobody" ? playerOf(room, out) : null;
    if (outP) outP.stats.votedOut++;
    if (d.inposter && out === d.inposter) {
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
    const inP = d.inposter ? playerOf(room, d.inposter) : null;
    if (inP) inP.stats.inposter++;

    if (room.fled) {
      winner = "crew"; why = "fled";
      for (const id of d.players) if (id !== d.inposter) add(id, R.POINTS.crewCatch);
    } else if (!d.inposter) {
      // a chaos round: nobody was the inposter
      if (out === "nobody") {
        winner = "crew"; why = "nobody";
        for (const [id, v] of Object.entries(votes)) if (v === "nobody") add(id, R.POINTS.nobodyRight);
      } else { winner = "nobody"; why = out ? "framed" : "tie-nobody"; }
    } else if (out === d.inposter) {
      room.guess = guessText === null ? { text: null, right: false } : { text: guessText, right: R.sameWord(guessText, d.word) };
      if (room.guess.right) {
        winner = "inposter"; why = "stole";
        add(d.inposter, R.POINTS.inposterSteal);
        if (inP) inP.stats.stole++;
      } else {
        winner = "crew"; why = "caught";
        if (inP) inP.stats.caught++;
        for (const id of d.players) {
          if (id === d.inposter) continue;
          add(id, R.POINTS.crewCatch);
          if (votes[id] === d.inposter) add(id, R.POINTS.crewSharp);
        }
      }
    } else {
      winner = "inposter"; why = out ? "wrong" : "tie";
      add(d.inposter, R.POINTS.inposterEscape);
      if (inP) inP.stats.escaped++;
    }
    for (const [id, v] of Object.entries(votes)) {
      const p = playerOf(room, id);
      if (p && d.inposter && v === d.inposter) p.stats.sharp++;
    }
    for (const [id, n] of Object.entries(gains)) { const p = playerOf(room, id); if (p) p.score += n; }
    room.result = { winner, why, gains };
    room.fled = false;
    room.history.push({
      round: room.round, word: d.word, odd: d.odd, cat: d.catName, mode: room.settings.mode,
      inposter: d.inposter, inposterName: inP ? inP.name : null,
      out, outName: out && out !== "nobody" ? playerOf(room, out)?.name || "someone" : null,
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
  function attach(peer, room, p) {
    p.peer = peer;
    p.name = peer.name;
    if (peer.color) p.color = peer.color;
    peer.room = room.code;
    room.emptySince = 0;
  }

  function join(peer, code) {
    const room = rooms.get(String(code || "").toUpperCase().trim());
    if (!room) return send(peer, { t: "error", msg: "No Inposter room with that code." });
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
      const next = room.players.find(online) || room.players[0];
      if (next) room.host = next.id;
    }
    if (!room.players.length) { stopTimer(room); stopCountdown(room); rooms.delete(room.code); return; }
    if (!room.players.some(online)) room.emptySince = Date.now();
    const d = room.deal;
    const live = ["reveal", "clues", "talk", "vote", "verdict", "guess"].includes(room.phase);
    if (live && d && d.players.includes(id)) {
      if (forGood) {
        d.players = d.players.filter((x) => x !== id);
        room.order = room.order.filter((x, k) => { if (x === id && k < room.turn) room.turn--; return x !== id; });
        delete room.sus[id];
        delete room.votes[id];
        room.readyVote.delete(id);
        if (d.inposter === id) { room.fled = true; quickCheck(room); return finish(room, null); }
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
      else if (room.phase === "guess" && d.inposter === id && forGood) finish(room, null);
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
      case "settings": {
        if (!isHost || room.phase !== "lobby") return;
        const spec = R.SETTINGS[m.key];
        if (!spec) return;
        if (m.key === "cats") {
          const ids = Array.isArray(m.value) ? m.value.filter((id) => W.byId(id)) : [];
          room.settings.cats = [...new Set(ids)];
        } else {
          if (room.quick && m.key === "clues") return;
          if (!spec.choices.includes(m.value)) return;
          room.settings[m.key] = m.value;
        }
        return pushState(room);
      }
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
        if (room.phase !== "clues" || room.order[room.turn] !== me.id || room.settings.clues !== "typed") return;
        const text = cleanText(m.text, 32);
        if (!text) return;
        if (text.split(" ").length > 3) return send(peer, { t: "error", msg: "Keep it short: three words at most." });
        const mine = me.id === d.inposter ? (room.settings.mode === "undercover" ? d.odd : null) : d.word;
        if (mine && R.givesItAway(text, mine)) return send(peer, { t: "error", msg: "No saying the word!" });
        broadcast(room, { t: "clued", by: me.id });
        return giveClue(room, me.id, text);
      }
      case "done":
        if (room.phase !== "clues" || room.order[room.turn] !== me.id || room.settings.clues !== "spoken") return;
        broadcast(room, { t: "clued", by: me.id });
        return giveClue(room, me.id, "");
      case "sus": {
        if (room.phase !== "talk" || !inRound(room, me)) return;
        const target = m.id ? playerOf(room, m.id) : null;
        if (target && target.id !== me.id && inRound(room, target)) room.sus[me.id] = target.id;
        else delete room.sus[me.id];
        return pushState(room);
      }
      case "readyvote":
        if (room.phase !== "talk" || !inRound(room, me)) return;
        room.readyVote.add(me.id);
        pushState(room);
        return maybeVoteNow(room);
      case "vote": {
        if (room.phase !== "vote" || !inRound(room, me) || me.id in room.votes) return;
        const ok = (m.id === "nobody" && room.settings.chaos) ||
          (m.id !== me.id && d.players.includes(m.id));
        if (!ok) return;
        room.votes[me.id] = m.id;
        broadcast(room, { t: "voted", by: me.id });
        pushState(room);
        return maybeTally(room);
      }
      case "guess": {
        if (room.phase !== "guess" || me.id !== d.inposter) return;
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
