// Yahtzee: against the bot on this machine, or against a stranger over a
// socket. Both modes drive the same board.
//
// The split that keeps this honest: `state` is only ever a description of the
// board, never the authority for it. In solo mode this file fills it in; in
// online mode the server does, and every field below matches a field in the
// server's "state" message so applying one is a copy rather than a translation.
//
// dice3d.js owns the tray and guarantees the dice show what they are told to.
// rules.js owns scoring - the server imports that very same file, so a box is
// worth the same on both ends of the wire. bot.js is the local opponent.

// The ?v= on these is not decoration. index.html cache-busts app.js, but an
// ES module's imports carry no version of their own, and nginx hands out .js
// with max-age=3600 - so a new app.js would run against up-to-an-hour-old
// copies of these four. Bump every one of them, and app.js in index.html, in
// the same commit.
import { DiceTable } from "./dice3d.js?v=6";
import * as R from "./rules.js?v=6";
import * as BOT from "./bot.js?v=6";
import { Net, loadName, saveName } from "./net.js?v=6";

const $ = (id) => document.getElementById(id);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const state = {
  mode: "solo",           // "solo" | "online"
  mySeat: 0,              // which column is mine
  names: ["You", "Bot"],
  isBot: [false, true],
  cards: [R.emptyCard(), R.emptyCard()],
  turn: 0,
  rollsLeft: 3,
  dice: [1, 1, 1, 1, 1],
  held: [false, false, false, false, false],
  rolledThisTurn: false,
  over: false,
  busy: true,             // an animation or the opponent is mid-move
};

let table = null;
let net = null;
let animating = false;
let pendingState = null;   // a server state that arrived mid-throw
let clockTimer = null;

const myTurn = () => state.turn === state.mySeat && !state.over;
const oppSeat = () => (state.mySeat === 0 ? 1 : 0);

/* ---------------- the flat five ---------------- */

const PIPS = {
  1: [5], 2: [1, 9], 3: [1, 5, 9], 4: [1, 3, 7, 9],
  5: [1, 3, 5, 7, 9], 6: [1, 3, 4, 6, 7, 9],
};

function buildStrip() {
  $("strip").innerHTML = [0, 1, 2, 3, 4]
    .map((i) => `<div class="die2 blank" data-i="${i}"></div>`)
    .join("");
  $("strip").addEventListener("click", (e) => {
    const el = e.target.closest(".die2");
    if (el && !el.classList.contains("blank")) toggleHold(+el.dataset.i);
  });
}

function renderStrip() {
  const canHold = state.rolledThisTurn && myTurn() && !state.busy && state.rollsLeft > 0;
  $("strip").classList.toggle("locked", !canHold);
  [...$("strip").children].forEach((el, i) => {
    const show = state.rolledThisTurn;
    el.classList.toggle("blank", !show);
    el.classList.toggle("held", show && !!state.held[i]);
    const want = show ? state.dice[i] : 0;
    if (el.dataset.face === String(want)) return;
    el.dataset.face = want;
    el.innerHTML = want
      ? PIPS[want].map((c) => `<i style="grid-area:${Math.ceil(c / 3)}/${((c - 1) % 3) + 1}"></i>`).join("")
      : "";
  });
}

// One place that flips a hold, so the tray, the strip and the server agree.
function toggleHold(i) {
  if (state.busy || !myTurn() || !state.rolledThisTurn || state.rollsLeft === 0) return;
  state.held[i] = !state.held[i];
  table.setHeld(i, state.held[i]);
  if (state.mode === "online") net.send({ t: "hold", held: state.held.slice() });
  renderStrip();
}

function syncHolds() {
  for (let i = 0; i < 5; i++) table.setHeld(i, !!state.held[i]);
}

/* ---------------- scorecard ---------------- */

function buildCard() {
  const row = (cat) => `
    <tr data-cat="${cat}">
      <td class="cat">${R.LABELS[cat]}<em>${R.HINTS[cat]}</em></td>
      <td class="val empty" data-col="0" data-cat="${cat}">&mdash;</td>
      <td class="val empty" data-col="1" data-cat="${cat}">&mdash;</td>
    </tr>`;
  $("upper").innerHTML = R.UPPER.map(row).join("");
  $("lower").innerHTML = R.LOWER.map(row).join("");
  $("upper").addEventListener("click", onPick);
  $("lower").addEventListener("click", onPick);
}

// Column 0 is always mine, whichever seat the server gave me.
const seatOfCol = (col) => (col === 0 ? state.mySeat : oppSeat());

function render() {
  const legal =
    state.rolledThisTurn && myTurn() && !state.busy
      ? R.legalCategories(state.dice, state.cards[state.mySeat])
      : [];
  const forced = legal.length === 1 && R.jokerActive(state.dice, state.cards[state.mySeat]);

  for (const cat of R.CATEGORIES) {
    for (const col of [0, 1]) {
      const td = document.querySelector(`td[data-col="${col}"][data-cat="${cat}"]`);
      const v = state.cards[seatOfCol(col)][cat];
      td.classList.remove("pick", "zero", "forced");
      if (v !== null && v !== undefined) {
        td.textContent = v;
        td.classList.remove("empty");
      } else if (col === 0 && legal.includes(cat)) {
        const pts = R.score(cat, state.dice, state.cards[state.mySeat]);
        td.textContent = pts;
        td.classList.add("pick");
        if (pts === 0) td.classList.add("zero");
        if (forced) td.classList.add("forced");
        td.classList.remove("empty");
      } else {
        td.innerHTML = "&mdash;";
        td.classList.add("empty");
      }
    }
  }

  for (const col of [0, 1]) {
    const t = R.totals(state.cards[seatOfCol(col)]);
    const key = col === 0 ? "you" : "bot";
    $(`bonus-${key}`).textContent = t.bonus ? `+${t.bonus}` : t.upper ? "0" : "—";
    $(`yb-${key}`).textContent = t.yahtzeeBonus ? `+${t.yahtzeeBonus}` : "—";
    $(`total-${key}`).textContent = t.grand;
  }
  $("bonus-note").textContent =
    R.totals(state.cards[state.mySeat]).toBonus > 0
      ? `${R.totals(state.cards[state.mySeat]).toBonus} to go`
      : "earned";

  $("th-you").textContent = state.mode === "online" ? (state.names[state.mySeat] || "You") : "You";
  $("th-bot").textContent = state.mode === "online" ? (state.names[oppSeat()] || "Them") : "Bot";
  $("th-you").classList.toggle("active", myTurn());
  $("th-bot").classList.toggle("active", !myTurn() && !state.over);

  $("roll").disabled = state.busy || !myTurn() || state.rollsLeft === 0;
  $("roll").textContent = state.rollsLeft === 3 ? "Roll" : "Roll again";
  $("rolls-left").textContent =
    myTurn() ? `${state.rollsLeft} roll${state.rollsLeft === 1 ? "" : "s"} left` : "";

  if (table) renderStrip();
}

const say = (msg) => { $("note").textContent = msg; };

// A pick is worth calling out, but only for a moment -- the line underneath
// goes straight back to saying whose turn it is, and used to overwrite this
// before anyone could read it.
let toastTimer = null;
function toast(text, kind = "") {
  const el = $("toast");
  el.textContent = text;
  el.className = `toast show ${kind}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.className = `toast ${kind}`; }, 2600);
}

// "Kareem took Full house - 25", or "Kareem scratched Yahtzee".
function pickLine(who, cat, pts, bonus) {
  if (bonus) return `${who} rolled another YAHTZEE — +100`;
  return pts > 0 ? `${who} took ${R.LABELS[cat]} — ${pts}` : `${who} scratched ${R.LABELS[cat]}`;
}

function onPick(e) {
  const td = e.target.closest("td.pick");
  if (!td || state.busy || !myTurn()) return;
  if (state.mode === "online") net.send({ t: "score", cat: td.dataset.cat });
  else commitSolo(td.dataset.cat);
}

/* ---------------- shared actions ---------------- */

$("roll").addEventListener("click", () => {
  if (state.busy || !myTurn() || state.rollsLeft === 0) return;
  if (state.mode === "online") { net.send({ t: "roll" }); return; }
  soloRoll();
});

$("tray").addEventListener("click", (e) => {
  const i = table.pick(e.clientX, e.clientY);
  if (i >= 0) toggleHold(i);
});

// Play a throw the tray was handed. Any server state that lands mid-throw is
// held back until the dice stop, or the board would jump ahead of the picture.
async function playRoll(values, seed, fromSeat) {
  animating = true;
  state.busy = true;
  render();
  state.dice = values.slice();
  await table.roll({ values, seed, fromSeat });
  animating = false;
  if (pendingState) { const s = pendingState; pendingState = null; applyState(s); }
  else { state.busy = false; render(); }
}

/* ---------------- solo ---------------- */

const rollValues = (held) =>
  state.dice.map((v, i) => (state.rolledThisTurn && held[i] ? v : 1 + Math.floor(Math.random() * 6)));

async function soloRoll() {
  const values = rollValues(state.held);
  state.rollsLeft--;
  state.rolledThisTurn = true;
  await playRoll(values, (Math.random() * 1e9) | 0, 0);
  say(state.rollsLeft ? "Click dice to keep them, or pick a box." : "Pick a box.");
  render();
}

async function commitSolo(cat) {
  const seat = state.turn;
  const gotBonus = R.earnsYahtzeeBonus(state.dice, state.cards[seat]);
  state.cards[seat] = R.applyScore(state.cards[seat], cat, state.dice);
  flash(cat);
  const pts = state.cards[seat][cat];
  toast(pickLine(state.names[seat], cat, pts, gotBonus),
        gotBonus ? "big" : pts === 0 ? "zero" : "");
  state.busy = true;
  render();
  await sleep(gotBonus ? 1400 : 700);

  if (R.isComplete(state.cards[0]) && R.isComplete(state.cards[1])) return finish();

  state.turn = seat === 0 ? 1 : 0;
  state.rollsLeft = 3;
  state.rolledThisTurn = false;
  state.held = [false, false, false, false, false];
  table.clearHolds();
  table.setValues(state.dice);

  if (state.turn === state.mySeat) {
    state.busy = false;
    say("Your turn. Roll.");
    render();
  } else soloBotTurn();
}

async function soloBotTurn() {
  state.busy = true;
  render();
  for (let roll = 3; roll > 0; roll--) {
    say("Bot rolling…");
    const values = rollValues(state.held);
    state.rollsLeft = roll - 1;
    state.rolledThisTurn = true;
    await playRoll(values, (Math.random() * 1e9) | 0, 1);
    state.busy = true;
    if (state.rollsLeft === 0) break;
    await sleep(420);
    const hold = BOT.chooseHolds(state.dice, state.rollsLeft, state.cards[1]);
    if (hold.every(Boolean)) { say("Bot keeps all five."); await sleep(650); break; }
    state.held = hold.slice();
    syncHolds();
    renderStrip();
    const kept = hold.filter(Boolean).length;
    say(kept ? `Bot keeps ${kept}, rolling again…` : "Bot re-rolls everything…");
    await sleep(750);
  }
  await sleep(350);
  commitSolo(BOT.chooseCategory(state.dice, state.cards[1]));
}

/* ---------------- online ---------------- */

function applyState(s) {
  if (animating) { pendingState = s; return; }
  state.names = s.names;
  state.isBot = s.isBot;
  state.cards = s.cards;
  state.turn = s.turn;
  state.rollsLeft = s.rollsLeft;
  state.rolledThisTurn = s.rolledThisTurn;
  state.over = s.over;
  state.held = s.held.slice();

  // Between turns the dice go back to a tidy row; during one they stay put.
  if (!s.rolledThisTurn) {
    state.dice = s.dice.slice();
    table.clearHolds();
    table.setValues(state.dice);
  } else {
    state.dice = s.dice.slice();
    syncHolds();
  }

  state.busy = !myTurn();
  startClock(s.msLeft);
  if (!state.over) {
    say(myTurn()
      ? (s.rolledThisTurn ? "Click dice to keep them, or pick a box." : "Your turn. Roll.")
      : `${state.names[oppSeat()]}’s turn…`);
  }
  render();
}

function startClock(ms) {
  clearInterval(clockTimer);
  const el = $("clock");
  if (!ms || state.mode !== "online" || state.over) { el.hidden = true; return; }
  const until = Date.now() + ms;
  const tick = () => {
    const left = Math.max(0, Math.round((until - Date.now()) / 1000));
    el.hidden = false;
    el.textContent = `${left}s`;
    el.classList.toggle("urgent", left <= 10);
    if (left <= 0) clearInterval(clockTimer);
  };
  tick();
  clockTimer = setInterval(tick, 250);
}

function onNet(m) {
  switch (m.t) {
    case "welcome":
      return;
    case "queued":
      return lobbyNote("Looking for an opponent…");
    case "room":
      return lobbyNote(`Room <b>${m.code}</b> — send that code to whoever you want to play.`);
    case "start":
      state.mode = "online";
      state.mySeat = m.seat;
      state.names = m.names;
      table.setViewSeat(m.seat);        // watch from your own side of the table
      state.over = false;
      $("lobby").hidden = true;
      $("overlay").hidden = true;
      $("conn").hidden = false;
      $("conn").textContent = "online";
      say("Match on.");
      return;
    case "state":
      return applyState(m);
    case "rolled":
      state.held = m.held.slice();
      syncHolds();
      if (m.by !== state.mySeat) say(`${state.names[m.by]} rolls…`);
      return void playRoll(m.values, m.seed, m.by);
    case "scored": {
      flash(m.cat);
      const who = m.seat === state.mySeat ? "You" : state.names[m.seat];
      toast(pickLine(who, m.cat, m.pts, m.yahtzeeBonus) + (m.auto ? " (out of time)" : ""),
            m.yahtzeeBonus ? "big" : m.pts === 0 ? "zero" : "");
      return;
    }
    case "over": {
      state.over = true;
      clearInterval(clockTimer);
      $("clock").hidden = true;
      const mine = m.totals[state.mySeat], theirs = m.totals[oppSeat()];
      $("ov-title").textContent =
        m.winner === -1 ? "A tie" : m.winner === state.mySeat ? "You win" : "You lose";
      $("ov-body").textContent = `${mine} to ${theirs}.`;
      $("overlay").hidden = false;
      render();
      return;
    }
    case "peer":
      if (m.status === "bot") {
        state.isBot[m.seat] = true;
        say("Your opponent left — the bot is finishing their game.");
      } else {
        lobbyNote("They left before the game started.");
        $("lobby").hidden = false;
      }
      return;
    case "error":
      return lobbyNote(m.msg);
  }
}

function lobbyNote(html) { $("lobby-note").innerHTML = html; }

function ensureNet() {
  if (net) return net;
  net = new Net({
    onMessage: onNet,
    onStatus: (s, detail) => {
      if (s === "closed" || s === "error") {
        $("conn").textContent = "offline";
        $("conn").classList.add("bad");
        if (!state.over && state.mode === "online")
          say("Lost the connection to the table.");
        lobbyNote("Could not reach the table" + (detail ? ` (${detail})` : "") + ".");
      } else if (s === "open") {
        $("conn").classList.remove("bad");
        $("conn").textContent = "online";
      }
    },
  });
  net.connect(currentName());
  return net;
}

const currentName = () => ($("name").value || "").trim().slice(0, 18) || "anon";

/* ---------------- lobby ---------------- */

$("m-solo").addEventListener("click", () => {
  saveName(currentName());
  if (net) { net.send({ t: "leave" }); net.close(); net = null; }
  $("conn").hidden = true;
  $("lobby").hidden = true;
  newSoloGame();
});

$("m-quick").addEventListener("click", () => {
  saveName(currentName());
  ensureNet().send({ t: "quick" });
  lobbyNote("Looking for an opponent…");
});

$("m-create").addEventListener("click", () => {
  saveName(currentName());
  ensureNet().send({ t: "create" });
  lobbyNote("Opening a room…");
});

$("joinform").addEventListener("submit", (e) => {
  e.preventDefault();
  const code = ($("code").value || "").trim().toUpperCase();
  if (code.length !== 4) return lobbyNote("A room code is four characters.");
  saveName(currentName());
  ensureNet().send({ t: "join", code });
  lobbyNote("Knocking…");
});

function toLobby() {
  if (net) { net.send({ t: "leave" }); }
  clearInterval(clockTimer);
  $("clock").hidden = true;
  $("overlay").hidden = true;
  $("lobby").hidden = false;
  lobbyNote("");
}

$("new-game").addEventListener("click", toLobby);
$("ov-lobby").addEventListener("click", toLobby);
$("ov-again").addEventListener("click", () => {
  if (state.mode === "online") {
    net.send({ t: "again" });
    $("overlay").hidden = true;
    say("Waiting for them to accept a rematch…");
  } else newSoloGame();
});

/* ---------------- solo setup / end ---------------- */

function flash(cat) {
  const tr = document.querySelector(`tr[data-cat="${cat}"]`);
  if (!tr) return;
  tr.classList.add("just-scored");
  setTimeout(() => tr.classList.remove("just-scored"), 900);
}

function finish() {
  state.over = true;
  state.busy = true;
  render();
  const a = R.totals(state.cards[0]).grand, b = R.totals(state.cards[1]).grand;
  $("ov-title").textContent = a > b ? "You win" : a < b ? "Bot wins" : "A tie";
  $("ov-body").textContent = `${a} to ${b}.`;
  $("overlay").hidden = false;
  say("");
}

function newSoloGame() {
  state.mode = "solo";
  state.mySeat = 0;
  state.names = ["You", "Bot"];
  state.isBot = [false, true];
  state.cards = [R.emptyCard(), R.emptyCard()];
  state.turn = 0;
  state.rollsLeft = 3;
  state.dice = [1, 1, 1, 1, 1];
  state.held = [false, false, false, false, false];
  state.rolledThisTurn = false;
  state.over = false;
  state.busy = false;
  clearInterval(clockTimer);
  $("clock").hidden = true;
  $("overlay").hidden = true;
  table.setViewSeat(0);
  table.clearHolds();
  table.setValues(state.dice);
  say("Your turn. Roll.");
  render();
}

/* ---------------- boot ---------------- */

buildCard();
buildStrip();
render();
$("name").value = loadName();
say("Loading dice…");
try {
  table = await DiceTable.create({ canvas: $("tray"), count: 5 });
  newSoloGame();
  $("lobby").hidden = false;      // the board is ready behind the menu
} catch (e) {
  say("The dice failed to load: " + e.message);
  console.error(e);
}
