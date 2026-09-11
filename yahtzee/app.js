// Yahtzee: you against the bot, on one tray.
//
// The flow is deliberately dumb and linear, because the interesting parts live
// elsewhere: dice3d.js owns the tray and guarantees the dice show what they are
// told to, rules.js owns scoring, bot.js owns the opponent. This file is the
// turn loop and the scorecard DOM.
//
// Everything a roll produces is decided HERE, up front, by rollValues() -- the
// dice are told what to land on. When this becomes 1v1 online, that single
// function is what moves to the server, and nothing else has to change.

import { DiceTable } from "./dice3d.js";
import * as R from "./rules.js";
import * as BOT from "./bot.js";

const YOU = 0, BOT_P = 1;
const NAMES = ["You", "Bot"];

const $ = (id) => document.getElementById(id);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const state = {
  cards: [R.emptyCard(), R.emptyCard()],
  turn: YOU,
  rollsLeft: 3,
  dice: [1, 1, 1, 1, 1],
  rolledThisTurn: false,
  busy: true,
  over: false,
};

let table;

// The only source of randomness in a roll. Server-side later.
const rollValues = (held) =>
  state.dice.map((v, i) => (held[i] ? v : 1 + Math.floor(Math.random() * 6)));

/* ---------------- the flat five ---------------- */

// Which cells of a 3x3 grid carry a pip, per face.
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
    if (!el || el.classList.contains("blank")) return;
    toggleHold(+el.dataset.i);
  });
}

function renderStrip() {
  const canHold =
    state.rolledThisTurn && state.turn === YOU && !state.busy && state.rollsLeft > 0;
  $("strip").classList.toggle("locked", !canHold);

  [...$("strip").children].forEach((el, i) => {
    const show = state.rolledThisTurn;
    el.classList.toggle("blank", !show);
    el.classList.toggle("held", show && table && table.held[i]);
    const want = show ? state.dice[i] : 0;
    if (el.dataset.face === String(want)) return;    // already drawn
    el.dataset.face = want;
    el.innerHTML = want
      ? PIPS[want].map((c) => `<i style="grid-area:${Math.ceil(c / 3)}/${((c - 1) % 3) + 1}"></i>`).join("")
      : "";
  });
}

// One place that flips a hold, so the tray and the strip never disagree.
function toggleHold(i) {
  if (state.busy || state.turn !== YOU || !state.rolledThisTurn || state.rollsLeft === 0) return;
  table.setHeld(i, !table.held[i]);
  renderStrip();
}

/* ---------------- scorecard DOM ---------------- */

function buildCard() {
  const row = (cat) => `
    <tr data-cat="${cat}">
      <td class="cat">${R.LABELS[cat]}<em>${R.HINTS[cat]}</em></td>
      <td class="val empty" data-p="0" data-cat="${cat}">—</td>
      <td class="val empty" data-p="1" data-cat="${cat}">—</td>
    </tr>`;
  $("upper").innerHTML = R.UPPER.map(row).join("");
  $("lower").innerHTML = R.LOWER.map(row).join("");
  $("upper").addEventListener("click", onPick);
  $("lower").addEventListener("click", onPick);
}

function render() {
  const legal =
    state.rolledThisTurn && state.turn === YOU && !state.busy
      ? R.legalCategories(state.dice, state.cards[YOU])
      : [];
  const forced = legal.length === 1 && R.jokerActive(state.dice, state.cards[YOU]);

  for (const cat of R.CATEGORIES) {
    for (const p of [YOU, BOT_P]) {
      const td = document.querySelector(`td[data-p="${p}"][data-cat="${cat}"]`);
      const v = state.cards[p][cat];
      td.classList.remove("pick", "zero", "forced");
      if (v !== null) {
        td.textContent = v;
        td.classList.remove("empty");
      } else if (p === YOU && legal.includes(cat)) {
        const pts = R.score(cat, state.dice, state.cards[YOU]);
        td.textContent = pts;
        td.classList.add("pick");
        if (pts === 0) td.classList.add("zero");
        if (forced) td.classList.add("forced");
        td.classList.remove("empty");
      } else {
        td.textContent = "—";
        td.classList.add("empty");
      }
    }
  }

  for (const p of [YOU, BOT_P]) {
    const t = R.totals(state.cards[p]);
    const key = p === YOU ? "you" : "bot";
    $(`bonus-${key}`).textContent = t.bonus ? `+${t.bonus}` : t.upper ? "0" : "—";
    $(`yb-${key}`).textContent = t.yahtzeeBonus ? `+${t.yahtzeeBonus}` : "—";
    $(`total-${key}`).textContent = t.grand;
  }
  $("bonus-note").textContent =
    R.totals(state.cards[YOU]).toBonus > 0
      ? `${R.totals(state.cards[YOU]).toBonus} to go`
      : "earned";

  $("th-you").classList.toggle("active", state.turn === YOU && !state.over);
  $("th-bot").classList.toggle("active", state.turn === BOT_P && !state.over);

  $("roll").disabled = state.busy || state.turn !== YOU || state.rollsLeft === 0;
  $("roll").textContent = state.rollsLeft === 3 ? "Roll" : "Roll again";
  $("rolls-left").textContent =
    state.turn === YOU ? `${state.rollsLeft} roll${state.rollsLeft === 1 ? "" : "s"} left` : "";

  if (table) renderStrip();
}

const say = (msg) => { $("note").textContent = msg; };

/* ---------------- your turn ---------------- */

$("roll").addEventListener("click", async () => {
  if (state.busy || state.turn !== YOU || state.rollsLeft === 0) return;
  state.busy = true;
  render();
  say("Rolling…");

  state.dice = rollValues(table.held);
  await table.roll({ values: state.dice });

  state.rollsLeft--;
  state.rolledThisTurn = true;
  state.busy = false;
  say(state.rollsLeft ? "Click dice to keep them, or pick a box." : "Pick a box.");
  render();
});

// Click a die to hold it.
$("tray").addEventListener("click", (e) => {
  const i = table.pick(e.clientX, e.clientY);
  if (i >= 0) toggleHold(i);
});

function onPick(e) {
  const td = e.target.closest("td.pick");
  if (!td || state.busy || state.turn !== YOU) return;
  commit(YOU, td.dataset.cat);
}

/* ---------------- scoring a box ---------------- */

async function commit(player, cat) {
  const before = state.cards[player];
  const gotBonus = R.earnsYahtzeeBonus(state.dice, before);
  state.cards[player] = R.applyScore(before, cat, state.dice);

  const tr = document.querySelector(`tr[data-cat="${cat}"]`);
  tr.classList.add("just-scored");
  setTimeout(() => tr.classList.remove("just-scored"), 900);

  const pts = state.cards[player][cat];
  say(
    `${NAMES[player]} scored ${pts} in ${R.LABELS[cat]}` +
      (gotBonus ? " — and another YAHTZEE, +100!" : "")
  );

  state.busy = true;
  render();
  await sleep(gotBonus ? 1400 : 700);

  if (R.isComplete(state.cards[YOU]) && R.isComplete(state.cards[BOT_P])) return finish();

  state.turn = player === YOU ? BOT_P : YOU;
  state.rollsLeft = 3;
  state.rolledThisTurn = false;
  table.clearHolds();
  table.setValues(state.dice);

  if (state.turn === BOT_P) botTurn();
  else {
    state.busy = false;
    say("Your turn. Roll.");
    render();
  }
}

/* ---------------- the bot's turn ---------------- */

async function botTurn() {
  state.busy = true;
  render();

  for (let roll = 3; roll > 0; roll--) {
    say(`Bot rolling…`);
    state.dice = rollValues(table.held);
    await table.roll({ values: state.dice });
    state.rollsLeft = roll - 1;
    render();
    if (state.rollsLeft === 0) break;

    await sleep(420);
    const hold = BOT.chooseHolds(state.dice, state.rollsLeft, state.cards[BOT_P]);
    if (hold.every((h) => h)) { say("Bot keeps all five."); await sleep(650); break; }
    hold.forEach((h, i) => table.setHeld(i, h));
    renderStrip();
    const kept = hold.filter(Boolean).length;
    say(kept ? `Bot keeps ${kept}, rolling again…` : "Bot re-rolls everything…");
    await sleep(750);
  }

  await sleep(350);
  commit(BOT_P, BOT.chooseCategory(state.dice, state.cards[BOT_P]));
}

/* ---------------- end ---------------- */

function finish() {
  state.over = true;
  state.busy = true;
  render();
  const a = R.totals(state.cards[YOU]).grand;
  const b = R.totals(state.cards[BOT_P]).grand;
  $("ov-title").textContent = a > b ? "You win" : a < b ? "Bot wins" : "A tie";
  $("ov-body").textContent = `${a} to ${b}.`;
  $("overlay").hidden = false;
  say("");
}

function newGame() {
  state.cards = [R.emptyCard(), R.emptyCard()];
  state.turn = YOU;
  state.rollsLeft = 3;
  state.dice = [1, 1, 1, 1, 1];
  state.rolledThisTurn = false;
  state.over = false;
  state.busy = false;
  $("overlay").hidden = true;
  table.clearHolds();
  table.setValues(state.dice);
  say("Your turn. Roll.");
  render();
}

$("new-game").addEventListener("click", newGame);
$("ov-again").addEventListener("click", newGame);

/* ---------------- boot ---------------- */

buildCard();
buildStrip();
render();
say("Loading dice…");
try {
  table = await DiceTable.create({ canvas: $("tray"), count: 5 });
  newGame();
} catch (e) {
  say("The dice failed to load: " + e.message);
  console.error(e);
}
