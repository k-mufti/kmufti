// Draft, the server half. Loaded by server.js, which owns the socket and
// hands over every message from a player on the Draft page.
//
// A 1v1 auction draft. Two players, $20 and five picks each. A reel spins
// and lands on a category (spin); then you both vote to keep it or spin
// again, as often as you like (landed). A random item from it comes up and one
// player names an opening price (open); the other raises or lets them have
// it, back and forth (bid), until someone lets it go and the high bidder
// pays (sold). Openers take turns. When both rosters are full it's over
// (done) - who drafted best is up to the two of you, for now.
//
// Nothing here is secret, so both players get the same state.
//
// Protocol, client -> server, on top of server.js's hello/leave:
//   {t:"create"} {t:"join", code} {t:"quick"} {t:"leave"} {t:"name", name}
//   {t:"start"}                 host, with two in the room: spin
//   {t:"bid", amount}           on my turn: open at, or raise to, this
//   {t:"pass"}                  on my turn: let them have it
//   {t:"respin"} {t:"keep"}     after the reel lands: my vote
//   {t:"again"}                 host, at the end: a new draft
"use strict";

const crypto = require("crypto");

const QUICK_START_MS = 4000;
const EMPTY_ROOM_MS = 10 * 60 * 1000;

module.exports = function draft({ send, cleanText, cleanName, newCode, C, R }) {
  const rooms = new Map();

  const pick = (a) => a[crypto.randomInt(0, a.length)];
  const online = (p) => !!p.peer;
  const playerOf = (room, id) => room.players.find((p) => p.id === id);
  const other = (room, id) => room.players.find((p) => p.id !== id);
  const open = (p) => R.PICKS - p.roster.length;
  const maxOf = (p) => R.maxBid(p.money, open(p));
  // still in the draft: a spot to fill and at least $1 to bid with
  const active = (p) => maxOf(p) >= 1;

  function makeRoom(host, quick) {
    const room = {
      code: newCode(),
      game: "draft",
      host: host.id,
      quick: !!quick,
      startAt: 0, startTimer: null,
      players: [],        // { id, name, color, peer, money, roster: [{ item, price }] }
      phase: "lobby",     // lobby | spin | open | bid | sold | done
      cat: null,          // { id, name }
      votes: {},          // after the reel lands: id -> "respin" | "keep"
      voteEnds: 0,
      pool: [],           // items not yet up
      opener: null,       // who opened the last item (openers alternate)
      lot: null,          // { item, high, leader, turn, bids: [{ id, amount }] }
      sold: null,         // { item, to, price, bids }
      log: [],
      timer: null,
      emptySince: 0,
    };
    rooms.set(room.code, room);
    return room;
  }

  /* ---------- what both players are told ---------- */
  function viewFor(room, viewer) {
    return {
      t: "state",
      game: "draft",
      code: room.code,
      you: viewer ? viewer.id : null,
      host: room.host,
      quick: room.quick,
      startsIn: room.startAt ? Math.max(0, room.startAt - Date.now()) : 0,
      players: room.players.map((p) => ({
        id: p.id, name: p.name, color: p.color, online: online(p),
        money: p.money, roster: p.roster, open: open(p), max: maxOf(p),
      })),
      phase: room.phase,
      cat: room.cat,
      cats: C.CATEGORIES.map((c) => ({ name: c.name })),   // for the reel
      votes: room.votes,
      voteLeft: room.phase === "landed" ? Math.max(0, room.voteEnds - Date.now()) : 0,
      lot: room.lot,
      sold: room.sold,
      log: room.log,
    };
  }
  function pushState(room) {
    for (const p of room.players) if (p.peer) send(p.peer, viewFor(room, p));
  }

  function later(room, ms, fn) {
    clearTimeout(room.timer);
    room.timer = setTimeout(() => { room.timer = null; if (rooms.get(room.code) === room) fn(); }, ms);
  }
  const stop = (room) => { clearTimeout(room.timer); room.timer = null; };

  /* ---------- the draft ---------- */
  function setCategory(room, c) {
    room.cat = { id: c.id, name: c.name };
    room.pool = c.items.slice();
  }

  function startDraft(room) {
    stopCountdown(room);
    setCategory(room, pick(C.CATEGORIES));
    room.votes = {};
    for (const p of room.players) { p.money = R.BUDGET; p.roster = []; }
    room.log = [];
    room.lot = null;
    room.sold = null;
    room.opener = null;
    room.phase = "spin";
    pushState(room);
    later(room, R.SPIN_MS, () => landed(room));
  }

  // The reel's stopped: keep it, or both vote to spin again.
  function landed(room) {
    room.phase = "landed";
    room.votes = {};
    room.voteEnds = Date.now() + R.VOTE_MS;
    pushState(room);
    later(room, R.VOTE_MS, () => decide(room, true));
  }

  // A vote (it can be changed until it's decided): both of you have to agree.
  function vote(room, p, v) {
    if (room.phase !== "landed") return;
    room.votes[p.id] = v;
    if (!decide(room, false)) pushState(room);
  }
  function decide(room, timeUp) {
    const out = R.spinOutcome(room.players.map((x) => room.votes[x.id]), room.players.length, timeUp);
    if (out === "keep") { nextItem(room); return true; }
    if (out === "respin") {
      setCategory(room, pick(C.CATEGORIES.filter((c) => c.id !== room.cat.id)));
      room.phase = "spin";
      pushState(room);
      later(room, R.SPIN_MS, () => landed(room));
      return true;
    }
    return false;
  }

  // A random item, opened by whoever didn't open the last one.
  function nextItem(room) {
    stop(room);                  // a "keep" vote can beat the vote timer here
    room.sold = null;
    const [a, b] = room.players;
    if (!a || !b || (!active(a) && !active(b)) || !room.pool.length) return finish(room);
    let opener;
    if (!room.opener) opener = pick(room.players);
    else opener = other(room, room.opener);
    // a full roster (or an empty wallet) can't open: the other one does
    if (!active(opener)) opener = other(room, opener.id);
    room.opener = opener.id;
    const item = room.pool.splice(crypto.randomInt(0, room.pool.length), 1)[0];
    room.lot = { item, high: 0, leader: null, turn: opener.id, bids: [] };
    room.phase = "open";
    pushState(room);
  }

  function bid(room, p, amount) {
    const lot = room.lot;
    if (!["open", "bid"].includes(room.phase) || !lot || lot.turn !== p.id) return "It's not your turn.";
    if (!Number.isInteger(amount) || amount < 1) return "Bid at least $1.";
    if (amount <= lot.high) return `Bid more than $${lot.high}.`;
    const max = maxOf(p);
    if (amount > max) return `The most you can bid is $${max}.`;
    lot.high = amount;
    lot.leader = p.id;
    lot.bids.push({ id: p.id, amount });
    room.phase = "bid";
    const them = other(room, p.id);
    // they can't go higher (or have no room left): it's yours
    if (!them || maxOf(them) <= amount) return sell(room);
    lot.turn = them.id;
    pushState(room);
    return null;
  }

  function sell(room) {
    const lot = room.lot;
    const p = playerOf(room, lot.leader);
    p.money -= lot.high;
    p.roster.push({ item: lot.item, price: lot.high });
    room.sold = { item: lot.item, to: p.id, price: lot.high, bids: lot.bids.length };
    room.log.push({ ...room.sold, toName: p.name });
    room.lot = null;
    room.phase = "sold";
    pushState(room);
    later(room, R.SOLD_MS, () => nextItem(room));
  }

  function finish(room) {
    stop(room);
    room.phase = "done";
    room.lot = null;
    pushState(room);
  }

  // Back to the lobby: someone left mid-draft.
  function abandon(room) {
    stop(room);
    room.phase = "lobby";
    room.lot = null;
    room.sold = null;
    room.cat = null;
    for (const p of room.players) { p.money = 0; p.roster = []; }
  }

  /* ---------- quick games ---------- */
  function quickCheck(room) {
    if (!room.quick) return;
    const ready = room.phase === "lobby" && room.players.length === R.PLAYERS && room.players.every(online);
    if (ready && !room.startAt) {
      room.startAt = Date.now() + QUICK_START_MS;
      room.startTimer = setTimeout(() => {
        room.startAt = 0;
        if (rooms.get(room.code) === room && room.phase === "lobby" && room.players.length === R.PLAYERS) startDraft(room);
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
  function addPlayer(room, peer) {
    const p = { id: peer.id, name: peer.name, color: peer.color, peer: null, money: 0, roster: [] };
    room.players.push(p);
    return p;
  }

  function join(peer, code) {
    const room = rooms.get(String(code || "").toUpperCase().trim());
    if (!room) return send(peer, { t: "error", msg: "No Draft room with that code." });
    leave(peer);
    let p = playerOf(room, peer.id);
    if (!p) {
      if (room.players.length >= R.PLAYERS) return send(peer, { t: "error", msg: "That room already has two players." });
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
    for (const room of rooms.values()) {
      if (room.quick && room.phase === "lobby" && room.players.length === 1 && room.players.every(online)) return join(peer, room.code);
    }
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
    if (room.host === peer.id && room.players[0]) room.host = room.players[0].id;
    if (!room.players.length) { stop(room); stopCountdown(room); rooms.delete(room.code); return; }
    if (room.phase !== "lobby" && room.phase !== "done") abandon(room);
    quickCheck(room);
    pushState(room);
  }

  // Lost connection: the draft waits for them (they rejoin by opening the
  // page again), since it's turn by turn and nothing times out.
  function dropped(peer) {
    const room = peer.room ? rooms.get(peer.room) : null;
    if (!room) return;
    const p = playerOf(room, peer.id);
    if (!p || p.peer !== peer) return;
    p.peer = null;
    if (!room.players.some(online)) room.emptySince = Date.now();
    quickCheck(room);
    pushState(room);
  }

  setInterval(() => {
    const now = Date.now();
    for (const room of rooms.values()) {
      if (room.emptySince && now - room.emptySince > EMPTY_ROOM_MS) { stop(room); stopCountdown(room); rooms.delete(room.code); }
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
      case "start":
      case "again":
        if (!isHost || !(room.phase === "lobby" || room.phase === "done")) return;
        if (room.players.length < R.PLAYERS) return send(peer, { t: "error", msg: "You need someone to play against." });
        return startDraft(room);
      case "bid": {
        const why = bid(room, me, Number(m.amount));
        if (why) send(peer, { t: "error", msg: why });
        return;
      }
      case "respin":
      case "keep":
        return vote(room, me, m.t);
      case "pass":
        if (room.phase !== "bid" || !room.lot || room.lot.turn !== me.id) return;
        return sell(room);
    }
  }

  return { rooms, hello, handle, dropped, leave };
};
