// Inposter - the page. The server (../inposter-server.js) deals the words
// and keeps the secrets; this draws the table and turns taps into messages.
//
// On a big screen the players sit in a ring round the table, you at the
// bottom; the middle of the table shows whatever's happening. On a phone
// the table comes first and the players stack under it.
import { CATEGORIES } from "./words.js?v=1";
import { MIN_PLAYERS } from "./rules.js?v=1";
import * as snd from "../frequency/sound.js?v=1";

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

/* ========================================================================
   The connection
   ======================================================================== */
function socketURL() {
  const proto = location.protocol === "https:" ? "wss:" : "ws:";
  const dev = location.hostname === "localhost" || location.hostname === "127.0.0.1";
  return dev ? `${proto}//${location.hostname}:8028/api/socket` : `${proto}//${location.host}/game-board/api/socket`;
}
function identity() {
  let id = null;
  try { id = localStorage.getItem("game-board-id"); } catch { /* private mode */ }
  if (!id) {
    id = (crypto.randomUUID?.() || String(Math.random()).slice(2)).slice(0, 36);
    try { localStorage.setItem("game-board-id", id); } catch { /* fine */ }
  }
  return id;
}
const myName = () => (window.KmuftiYou ? window.KmuftiYou.name() : "someone");
const myColor = () => (window.KmuftiYou ? window.KmuftiYou.color() : "#ff4d6d");

let ws = null, ready = false, outbox = [], retry = 0;
function connect() {
  ws = new WebSocket(socketURL());
  ws.addEventListener("open", () => {
    ready = true; retry = 0;
    send({ t: "hello", game: "inposter", id: identity(), name: myName(), color: myColor() });
    for (const m of outbox.splice(0)) send(m);
  });
  ws.addEventListener("message", (e) => {
    let m; try { m = JSON.parse(e.data); } catch { return; }
    onMessage(m);
  });
  ws.addEventListener("close", () => {
    ready = false;
    setStatus("Reconnecting…");
    setTimeout(connect, Math.min(5000, 500 * 2 ** retry++));
  });
}
function send(m) {
  if (ready && ws.readyState === 1) ws.send(JSON.stringify(m));
  else outbox.push(m);
}

/* ========================================================================
   State
   ======================================================================== */
let S = null;
let lastPhase = null, lastTurnKey = null;
let stateAt = 0;                 // when S arrived, for the countdowns
const me = () => S && S.players.find((p) => p.id === S.you);
const nameOf = (id) => S.players.find((p) => p.id === id)?.name || "someone";
const playerOf = (id) => S.players.find((p) => p.id === id);
const isHost = () => !!S && S.host === S.you;
const inRound = () => !!me()?.inRound;
const myTurn = () => S && S.phase === "clues" && S.order[S.turn] === S.you;

let flipped = false;             // the reveal card, turned over
let voteFor = null;              // a vote picked but not yet sent
let verdictStep = 0, verdictTimer = null;

function onMessage(m) {
  if (m.t === "welcome") return;
  if (m.t === "idle") { S = null; show("home"); setStatus(""); return; }
  if (m.t === "error") { snd.side(false); return toast(m.msg); }
  if (m.t === "clued") { snd.clue(); return; }
  if (m.t === "voted") { snd.tick(); return; }
  if (m.t !== "state" || m.game !== "inposter") return;
  const prev = S;
  S = m;
  stateAt = performance.now();
  if (S.phase !== lastPhase) enterPhase(S.phase, prev);
  const turnKey = S.phase === "clues" ? `${S.round}:${S.clueRound}:${S.turn}` : "";
  if (turnKey && turnKey !== lastTurnKey && myTurn()) { snd.yourTurn(); snd.buzz([60, 40, 60]); }
  lastTurnKey = turnKey;
  render();
}

function enterPhase(phase, prev) {
  lastPhase = phase;
  if (phase !== "vote") voteFor = null;
  if (phase === "reveal") { flipped = false; snd.swoosh(0.8); }
  if (phase === "talk") snd.lock();
  if (phase === "vote") { snd.drumroll(0.6); snd.buzz(50); }
  if (phase === "verdict") startVerdict();
  else { clearInterval(verdictTimer); verdictTimer = null; }
  if (phase === "guess") { snd.points(4); if (S.guessing === S.you) snd.buzz([200, 80, 200]); }
  if (phase === "result" && prev) {
    const r = S.result, mine = S.reveal && S.reveal.inposter === S.you;
    const won = r.winner === "crew" ? !mine : r.winner === "inposter" ? mine : false;
    if (won) { snd.fanfare(); snd.buzz([80, 50, 80, 50, 200]); } else snd.points(0);
  }
  if (phase === "final") snd.fanfare();
}

// The votes come out one at a time, then who's out.
function startVerdict() {
  clearInterval(verdictTimer);
  verdictStep = 0;
  const n = Object.keys(S.verdict.votes).length;
  verdictTimer = setInterval(() => {
    verdictStep++;
    if (verdictStep <= n) snd.tick();
    if (verdictStep === n + 1) snd.drumroll(1.6);
    if (verdictStep > n + 1) { clearInterval(verdictTimer); verdictTimer = null; }
    if (S && S.phase === "verdict") render();
  }, 650);
}

/* ========================================================================
   Drawing
   ======================================================================== */
function show(id) {
  for (const s of ["home", "lobby", "game", "final"]) $(s).hidden = s !== id;
  $("codeChip").hidden = id === "home";
  $("exitBtn").hidden = id !== "game";
  $("myCard").hidden = !(id === "game" && S && S.me && S.phase !== "reveal" && S.phase !== "result");
  document.body.dataset.screen = id;
}
let toastTimer = null;
function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (t.hidden = true), 3200);
}
function setStatus(s) { $("homeStatus").textContent = s; $("lobbyStatus").textContent = s; }

const initial = (n) => (String(n || "?").trim()[0] || "?").toUpperCase();
const avatar = (p, cls = "") => `<span class="av ${cls}" style="--c:${esc(p.color || "#ff4d6d")}">${esc(initial(p.name))}</span>`;

function render() {
  if (!S) return;
  $("codeChip").textContent = S.code;
  if (S.phase === "lobby") return renderLobby();
  if (S.phase === "final") return renderFinal();
  show("game");
  renderSeats();
  renderTable();
}

/* ---------- the lobby ---------- */
let countdownTimer = null;
const RULE_ROWS = [
  ["mode", "Game", [["classic", "Classic", "The inposter knows they're the inposter, and has no word."], ["undercover", "Undercover", "The odd one out gets a close-but-wrong word, and doesn't know it."]]],
  ["clues", "Clues", [["typed", "Typed", "Clues are typed in and go up on the table."], ["spoken", "Out loud", "Everyone's in one room: say your clue, then tap done."]]],
  ["rounds", "Clue rounds", [[1, "1"], [2, "2"], [3, "3"]]],
  ["talk", "Talk time", [[45, "45s"], [90, "90s"], [150, "2½ min"]]],
  ["hint", "Inposter's hint", [["category", "Category", "The inposter is told the category."], ["none", "Nothing", "The inposter goes in completely blind."]]],
  ["chaos", "Chaos", [[false, "Off"], [true, "On", "Some rounds, nobody is the inposter. Can you tell?"]]],
];
function renderLobby() {
  show("lobby");
  $("lobbyCode").textContent = S.code;
  $("roomLine").textContent = S.quick ? "Quick game · room code" : "Room code";
  $("roomHint").textContent = S.quick
    ? "Anyone who taps Quick game lands here. Share the code to bring friends."
    : "Everyone opens Inposter on their own phone or laptop and types the code.";
  $("lobbyPlayers").innerHTML = S.players.map((p) =>
    `<div class="mate${p.online ? "" : " away"}">${avatar(p)}<span class="mn">${esc(p.name)}</span>` +
    `<small>${[p.id === S.you ? "you" : "", p.id === S.host && !S.quick ? "host" : "", p.online ? "" : "away", p.score ? `${p.score} pts` : ""].filter(Boolean).join(" · ")}</small></div>`).join("");
  const host = isHost() && !S.quick;
  $("startBtn").hidden = !host;
  const here = S.players.filter((p) => p.online).length;
  $("startBtn").disabled = here < MIN_PLAYERS;
  $("rulesNote").textContent = S.quick ? "Quick games play by the house rules." : host ? "You're the host: set it up how you like." : `${nameOf(S.host)} sets the rules.`;

  const st = S.settings;
  let html = "";
  for (const [key, label, opts] of RULE_ROWS) {
    if (S.quick && key === "clues") continue;
    const on = opts.find((o) => o[0] === st[key]);
    html += `<div class="rule"><span class="rl">${label}</span><div class="seg">` +
      opts.map(([v, txt]) => `<button data-set="${key}" data-val='${JSON.stringify(v)}' class="${v === st[key] ? "on" : ""}" ${host ? "" : "disabled"}>${txt}</button>`).join("") +
      `</div>${on && on[2] ? `<p class="rule-help">${on[2]}</p>` : ""}</div>`;
  }
  const all = !st.cats.length;
  html += `<div class="rule"><span class="rl">Words from</span><div class="cats">` +
    `<button data-cat="*" class="${all ? "on" : ""}" ${host ? "" : "disabled"}>🎲 Everything</button>` +
    CATEGORIES.map((c) => `<button data-cat="${c.id}" class="${!all && st.cats.includes(c.id) ? "on" : ""}" ${host ? "" : "disabled"}>${c.emoji} ${esc(c.name)}</button>`).join("") +
    `</div></div>`;
  $("rules").innerHTML = html;

  clearInterval(countdownTimer);
  if (S.quick && S.startsIn) {
    const ends = Date.now() + S.startsIn;
    const tickDown = () => setStatus(`Dealing in ${Math.max(1, Math.ceil((ends - Date.now()) / 1000))}…`);
    tickDown();
    countdownTimer = setInterval(tickDown, 250);
  } else if (S.quick) setStatus(here < MIN_PLAYERS ? `Waiting for ${MIN_PLAYERS - here} more…` : "");
  else if (here < MIN_PLAYERS) setStatus(`You need ${MIN_PLAYERS - here} more player${MIN_PLAYERS - here === 1 ? "" : "s"}.`);
  else setStatus(host ? "" : `Waiting for ${nameOf(S.host)} to deal.`);
}

/* ---------- the ring of players ---------- */
function seatOrder() {
  const ids = S.order.length ? S.order.slice() : S.players.filter((p) => p.inRound).map((p) => p.id);
  // turn the ring so you sit at the bottom, facing the table
  const k = ids.indexOf(S.you);
  return k > 0 ? ids.slice(k).concat(ids.slice(0, k)) : ids;
}
function votesShown() {
  // during the verdict, only the votes that have "come in" so far
  if (!S.verdict) return [];
  const all = Object.entries(S.verdict.votes);
  return S.phase === "verdict" ? all.slice(0, verdictStep) : all;
}
function renderSeats() {
  const ids = seatOrder();
  const n = ids.length;
  const shown = votesShown();
  const counts = {};
  for (const [, v] of shown) counts[v] = (counts[v] || 0) + 1;
  const pointed = {};
  for (const v of Object.values(S.sus)) pointed[v] = (pointed[v] || 0) + 1;
  const out = S.verdict && (S.phase !== "verdict" || verdictStep > shown.length) ? S.verdict.out : null;
  const gains = S.result ? S.result.gains : {};
  const inposter = S.reveal ? S.reveal.inposter : S.guessing;
  const clickable = (S.phase === "talk" || (S.phase === "vote" && !me()?.voted)) && inRound();

  $("seats").innerHTML = ids.map((id, i) => {
    const p = playerOf(id);
    if (!p) return "";
    // round the table, starting at the bottom (you) and going clockwise
    const a = Math.PI / 2 + (2 * Math.PI * i) / n;
    const x = 50 + 44 * Math.cos(a), y = 50 + 41 * Math.sin(a);
    const turn = S.phase === "clues" && S.order[S.turn] === id;
    const cl = (S.clues[id] || []).map((c) => c === null ? `<span class="cl skip">…</span>` : c === "" ? `<span class="cl said">🗣️</span>` : `<span class="cl">${esc(c)}</span>`).join("");
    const tags = [];
    if (S.phase === "reveal") tags.push(p.seen ? `<em class="ok">✓ ready</em>` : `<em>peeking…</em>`);
    if (S.phase === "talk" && p.readyVote) tags.push(`<em class="ok">✓ ready to vote</em>`);
    if (S.phase === "vote") tags.push(p.voted ? `<em class="ok">✓ voted</em>` : `<em>deciding…</em>`);
    if (!p.online) tags.push(`<em class="away">away</em>`);
    const cls = ["seat",
      id === S.you ? "me" : "",
      turn ? "turn" : "",
      clickable && id !== S.you ? "pick" : "",
      S.sus[S.you] === id && S.phase === "talk" ? "pointing" : "",
      voteFor === id ? "chosen" : "",
      out === id ? "out" : "",
      inposter === id && (S.phase === "result" || S.phase === "guess") ? "imp" : "",
    ].filter(Boolean).join(" ");
    const badge = S.phase === "talk" && pointed[id] ? `<b class="fingers">👉 ${pointed[id]}</b>`
      : (S.phase === "verdict" || S.phase === "guess" || S.phase === "result") && counts[id] ? `<b class="fingers vote">🗳 ${counts[id]}</b>` : "";
    const gain = S.phase === "result" && gains[id] ? `<b class="gain">+${gains[id]}</b>` : "";
    const stamp = inposter === id && (S.phase === "result" || S.phase === "guess") ? `<span class="stamp">${S.settings.mode === "undercover" ? "Undercover" : "Inposter"}</span>` : "";
    return `<div class="${cls}" data-seat="${esc(id)}" style="left:${x.toFixed(2)}%;top:${y.toFixed(2)}%">` +
      `<div class="seat-in">${avatar(p)}${badge}${gain}${stamp}` +
      `<span class="sn">${esc(p.name)}${id === S.you ? " <small>(you)</small>" : ""}</span>` +
      `<span class="ss">${p.score} pt${p.score === 1 ? "" : "s"}</span>${tags.join("")}` +
      `<div class="cls">${cl}</div></div></div>`;
  }).join("");
  const waiting = S.players.filter((p) => !p.inRound && p.online);
  $("seats").dataset.n = n;
  $("ring").dataset.waiting = waiting.length ? `Joining next round: ${waiting.map((p) => p.name).join(", ")}` : "";
}

/* ---------- the middle of the table ---------- */
const secsLeft = () => Math.max(0, Math.ceil((S.msLeft - (performance.now() - stateAt)) / 1000));
const timerHTML = (total) => `<div class="timer" data-total="${total}"><i></i><span></span></div>`;

function renderTable() {
  const t = $("table");
  const m = S.me;
  const p = S.phase;
  let h = "";
  const word = m ? (m.inposter ? null : m.word) : null;

  if (!inRound() && p !== "result") {
    h = `<p class="kicker">Round ${S.round}</p><h2 class="big">You're sitting this one out</h2><p class="sub">You joined mid-round. You're dealt in next round.</p>`;
  } else if (p === "reveal") {
    const back = m.inposter
      ? `<span class="cardk">You are the</span><span class="cardw imp">INPOSTER</span><span class="cardh">${m.cat ? `The category is <b>${esc(m.cat)}</b>. Blend in.` : "No hints. Good luck."}</span>`
      : `<span class="cardk">The word is</span><span class="cardw">${esc(m.word)}</span><span class="cardh">${m.cat ? esc(m.cat) : ""}</span>`;
    const looked = S.players.filter((x) => x.inRound && x.seen).length, all = S.players.filter((x) => x.inRound).length;
    h = `<p class="kicker">Round ${S.round}${S.settings.mode === "undercover" ? " · undercover" : ""}</p>` +
      `<button class="card${flipped ? " flipped" : ""}" id="flipCard"><span class="face front"><span class="q">?</span><span class="cardh">Tap to look. Keep it to yourself.</span></span><span class="face back">${back}</span></button>` +
      (me().seen ? `<p class="sub">${looked} of ${all} ready…</p>` : `<button class="btn big" id="seenBtn" ${flipped ? "" : "disabled"}>Got it</button>`) +
      (isHost() && looked < all ? `<button class="link" id="beginBtn">Start without waiting</button>` : "");
  } else if (p === "clues") {
    const who = S.order[S.turn];
    const typed = S.settings.clues === "typed";
    h = `<p class="kicker">Clue round ${S.clueRound} of ${S.settings.rounds}</p>`;
    if (myTurn()) {
      h += `<h2 class="big">Your turn</h2>` +
        (typed
          ? `<p class="sub">One word (three at most) that proves you know it${m.inposter ? " - or fakes it" : ""}.</p><form class="clue-form" id="clueForm"><input id="clueInput" maxlength="32" placeholder="Your clue" autocomplete="off" spellcheck="false" autofocus /><button class="btn hot" type="submit">Say it</button></form>`
          : `<p class="sub">Say your clue out loud, then tap done.</p><button class="btn big hot" id="doneBtn">I've said it</button>`);
    } else {
      h += `<h2 class="big">${esc(nameOf(who))}'s turn</h2><p class="sub">${typed ? "They're thinking of a clue…" : "Listen for their clue…"}</p>`;
    }
    h += timerHTML(typed ? 40 : 60);
  } else if (p === "talk") {
    h = `<p class="kicker">Talk it out</p><h2 class="big">Who's faking it?</h2>` +
      `<p class="sub">Point at whoever you think it is: tap them. Everyone sees the fingers.</p>` + timerHTML(S.settings.talk) +
      (me().readyVote ? `<p class="sub">${S.players.filter((x) => x.inRound && x.readyVote).length} of ${S.players.filter((x) => x.inRound).length} ready to vote…</p>` : `<button class="btn big hot" id="readyBtn">Ready to vote</button>`);
  } else if (p === "vote") {
    const voted = S.players.filter((x) => x.inRound && x.voted).length, all = S.players.filter((x) => x.inRound).length;
    h = `<p class="kicker">Vote</p>`;
    if (me().voted) h += `<h2 class="big">Vote's in</h2><p class="sub">${voted} of ${all} voted…</p>`;
    else if (voteFor) h += `<h2 class="big">Vote out ${voteFor === "nobody" ? "nobody" : esc(nameOf(voteFor))}?</h2><div class="row"><button class="btn big hot" id="voteBtn">Lock it in</button><button class="btn ghost" id="unvoteBtn">Change</button></div>`;
    else h += `<h2 class="big">Tap who to vote out</h2><p class="sub">Most votes is out. A tie means nobody goes.</p>` +
      (S.settings.chaos ? `<button class="btn ghost" data-vote="nobody">There's no inposter</button>` : "");
    h += timerHTML(40);
  } else if (p === "verdict") {
    const v = S.verdict;
    const all = Object.entries(v.votes);
    const shown = all.slice(0, verdictStep);
    h = `<p class="kicker">The votes</p><div class="votes">` +
      shown.map(([a, b]) => `<span class="vline">${esc(nameOf(a))} <i>→</i> ${b === "nobody" ? "nobody" : esc(nameOf(b))}</span>`).join("") + `</div>`;
    if (verdictStep > all.length) {
      h += v.out === "nobody" ? `<h2 class="big">You voted: no inposter.</h2><p class="sub">Were you right…?</p>`
        : v.out ? `<h2 class="big">${esc(nameOf(v.out))} is out.</h2><p class="sub">Were they the inposter…?</p>`
          : `<h2 class="big">It's a tie.</h2><p class="sub">Nobody's voted out…</p>`;
    } else if (!all.length) h += `<h2 class="big">Nobody voted!</h2>`;
  } else if (p === "guess") {
    if (S.guessing === S.you) {
      h = `<p class="kicker">Caught!</p><h2 class="big">One guess at the word</h2><p class="sub">Get it right and you steal the round.</p>` +
        `<form class="clue-form" id="guessForm"><input id="guessInput" maxlength="40" placeholder="The word is…" autocomplete="off" spellcheck="false" autofocus /><button class="btn hot" type="submit">Guess</button></form>`;
    } else {
      h = `<p class="kicker">Caught!</p><h2 class="big">${esc(nameOf(S.guessing))} was the ${S.settings.mode === "undercover" ? "undercover" : "inposter"}!</h2><p class="sub">But they get one guess at the word. If they get it, they steal the round…</p>`;
    }
    h += timerHTML(40);
  } else if (p === "result") {
    h = resultHTML();
  }
  // keep typing through re-renders
  const typed = $("clueInput")?.value, guessed = $("guessInput")?.value;
  const focused = document.activeElement && document.activeElement.id;
  t.innerHTML = h;
  t.dataset.phase = p;
  if (typed && $("clueInput")) $("clueInput").value = typed;
  if (guessed && $("guessInput")) $("guessInput").value = guessed;
  if ((focused === "clueInput" || myTurn()) && $("clueInput")) $("clueInput").focus();
  if ($("guessInput") && (focused === "guessInput" || S.guessing === S.you)) $("guessInput").focus();
  paintMyCard();
  show("game");
  paintTimers();
}

function resultHTML() {
  const r = S.result, v = S.reveal;
  const imp = v.inposter ? esc(nameOf(v.inposter)) : null;
  const role = S.settings.mode === "undercover" ? "undercover" : "inposter";
  const head = {
    crew: "The crew wins",
    inposter: `The ${role} wins`,
    nobody: "Everyone got played",
  }[r.winner];
  const whys = {
    caught: () => `${imp} was caught${v.guess && v.guess.text ? `, and guessed “${esc(v.guess.text)}”. Wrong!` : `, and couldn't guess the word.`}`,
    stole: () => `${imp} was caught, but guessed “${esc(v.guess.text)}” and stole it!`,
    wrong: () => `You voted out ${esc(nameOf(S.verdict.out))}. The ${role} was ${imp}.`,
    tie: () => `A tie, so nobody went. The ${role} was ${imp}.`,
    fled: () => `${imp || "The " + role} left the game. Coward.`,
    nobody: () => "There was no inposter this round, and you called it!",
    framed: () => `There was no inposter this round. ${S.verdict && S.verdict.out ? `You voted out ${esc(nameOf(S.verdict.out))} for nothing.` : ""}`,
    "tie-nobody": () => "There was no inposter this round. Nobody figured it out.",
  };
  const why = (whys[r.why] || (() => ""))();
  const words = v.odd && S.settings.mode === "undercover"
    ? `<div class="words"><span><small>The crew's word</small>${esc(v.word)}</span><span><small>The undercover's word</small>${esc(v.odd)}</span></div>`
    : `<div class="words"><span><small>The word was</small>${esc(v.word)}</span></div>`;
  const myGain = r.gains[S.you];
  return `<p class="kicker">Round ${S.round} · ${esc(v.cat)}</p><h2 class="big win-${r.winner}">${head}</h2><p class="sub">${why}</p>${words}` +
    (myGain ? `<p class="mygain">+${myGain} for you</p>` : "") +
    (isHost() || S.quick
      ? `<div class="row"><button class="btn big hot" id="nextBtn">Next round</button>${isHost() && !S.quick ? `<button class="btn ghost" id="endBtn">End game</button>` : ""}</div>`
      : `<p class="sub">Waiting for ${esc(nameOf(S.host))} to deal the next round…</p>`);
}

/* ---------- countdowns ---------- */
function paintTimers() {
  for (const el of document.querySelectorAll(".timer")) {
    const total = +el.dataset.total || 1;
    const left = S ? secsLeft() : 0;
    el.querySelector("span").textContent = left ? `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}` : "0:00";
    el.querySelector("i").style.width = `${Math.min(100, (left / total) * 100)}%`;
    el.classList.toggle("low", left <= 5);
  }
}
let lastBeep = -1;
setInterval(() => {
  if (!S || !document.querySelector(".timer")) return;
  paintTimers();
  const left = secsLeft();
  const urgent = myTurn() || (S.phase === "vote" && !me()?.voted) || (S.phase === "guess" && S.guessing === S.you);
  if (urgent && left > 0 && left <= 5 && left !== lastBeep) { lastBeep = left; snd.tick(); }
}, 200);

/* ---------- your card, peekable all round ---------- */
let peeking = false;
function paintMyCard() {
  const m = S && S.me;
  const el = $("myCardV");
  if (!m) return;
  el.textContent = peeking ? (m.inposter ? "You're the inposter" : m.word) : "hold to peek";
  $("myCard").classList.toggle("peek", peeking);
  $("myCard").classList.toggle("imp", peeking && m.inposter);
}
const peek = (on) => { peeking = on; paintMyCard(); };
$("myCard").addEventListener("pointerdown", (e) => { e.preventDefault(); peek(true); });
for (const ev of ["pointerup", "pointerleave", "pointercancel"]) $("myCard").addEventListener(ev, () => peek(false));

/* ========================================================================
   The final standings
   ======================================================================== */
function renderFinal() {
  show("final");
  const ranked = S.players.slice().sort((a, b) => b.score - a.score);
  const stat = (id) => S.stats.find((s) => s.id === id) || {};
  const most = (key, min = 1) => {
    let best = null;
    for (const s of S.stats) if ((s[key] || 0) >= min && (!best || s[key] > best[key])) best = s;
    return best;
  };
  const awards = [];
  const det = most("sharp");
  if (det) awards.push(["🔎", "Best detective", nameOf(det.id), `${det.sharp} right vote${det.sharp === 1 ? "" : "s"}`]);
  const liar = S.stats.slice().sort((a, b) => (b.escaped + b.stole) - (a.escaped + a.stole))[0];
  if (liar && liar.escaped + liar.stole) awards.push(["🎭", "Master of disguise", nameOf(liar.id), `got away ${liar.escaped + liar.stole} time${liar.escaped + liar.stole === 1 ? "" : "s"}`]);
  const thief = most("stole");
  if (thief) awards.push(["🧠", "Word thief", nameOf(thief.id), `stole ${thief.stole} round${thief.stole === 1 ? "" : "s"} with a guess`]);
  const sus = most("susVotes");
  if (sus) awards.push(["👀", "Most suspicious", nameOf(sus.id), `${sus.susVotes} vote${sus.susVotes === 1 ? "" : "s"} against them`]);
  const framed = S.stats.slice().sort((a, b) => b.votedOut - a.votedOut).find((s) => s.votedOut && s.inposter < s.votedOut);
  if (framed) awards.push(["🥲", "Wrongly accused", nameOf(framed.id), "voted out while innocent"]);

  const podium = [ranked[1], ranked[0], ranked[2]].map((p, k) => p
    ? `<div class="pod p${[2, 1, 3][k]}">${avatar(p, "big")}<b>${esc(p.name)}</b><span>${p.score} pts</span><div class="block">${[2, 1, 3][k]}</div></div>` : `<div class="pod empty"></div>`).join("");
  const rounds = S.history.map((h) => {
    const res = { crew: "crew won", inposter: `${h.mode === "undercover" ? "undercover" : "inposter"} won`, nobody: "nobody won" }[h.winner];
    return `<li><span class="rw"><b>${esc(h.word)}</b>${h.mode === "undercover" ? ` <small>vs ${esc(h.odd)}</small>` : ""}<small>${esc(h.cat)}</small></span>` +
      `<span class="ri">${h.inposterName ? `🕵️ ${esc(h.inposterName)}` : "no inposter"}</span><span class="rr r-${h.winner}">${res}</span></li>`;
  }).join("");
  $("final").innerHTML =
    `<div class="final">` +
      `<p class="kicker">Final standings</p><h1 class="final-head">${esc(ranked[0]?.name || "")} wins!</h1>` +
      `<div class="podium">${podium}</div>` +
      (awards.length ? `<div class="awards">${awards.map(([i, t, who, v]) => `<div class="award"><span class="ai">${i}</span><span class="at">${t}</span><b>${esc(who)}</b><span class="av2">${esc(v)}</span></div>`).join("")}</div>` : "") +
      `<div class="final-cols"><div><h3>Everyone</h3><ol class="standings">${ranked.map((p) => `<li>${avatar(p)}<span>${esc(p.name)}</span><small>${stat(p.id).inposter || 0}× inposter</small><b>${p.score}</b></li>`).join("")}</ol></div>` +
      `<div><h3>Every round</h3><ol class="rounds">${rounds}</ol></div></div>` +
      `<div class="row center">${isHost() ? `<button class="btn big hot" id="againBtn">Play again</button>` : `<p class="sub">Waiting for ${esc(nameOf(S.host))} to start a new game…</p>`}<button class="btn ghost" id="leaveFinalBtn">Leave</button></div>` +
    `</div>`;
}

/* ========================================================================
   Wiring
   ======================================================================== */
document.addEventListener("click", (e) => {
  const seat = e.target.closest("[data-seat]");
  if (seat && S && inRound()) {
    const id = seat.dataset.seat;
    if (id === S.you) return;
    if (S.phase === "talk") { send({ t: "sus", id: S.sus[S.you] === id ? null : id }); snd.tick(); return; }
    if (S.phase === "vote" && !me().voted) { voteFor = id; snd.tick(); return render(); }
    return;
  }
  const b = e.target.closest("button");
  if (!b) return;
  if (b.dataset.set) {
    let v; try { v = JSON.parse(b.dataset.val); } catch { return; }
    return send({ t: "settings", key: b.dataset.set, value: v });
  }
  if (b.dataset.cat) {
    const st = S.settings;
    let cats = b.dataset.cat === "*" ? [] : st.cats.includes(b.dataset.cat) ? st.cats.filter((c) => c !== b.dataset.cat) : [...st.cats, b.dataset.cat];
    if (cats.length === CATEGORIES.length) cats = [];
    return send({ t: "settings", key: "cats", value: cats });
  }
  if (b.dataset.vote) { voteFor = b.dataset.vote; return render(); }
  switch (b.id) {
    case "flipCard": flipped = !flipped; snd.swoosh(0.4); return render();
    case "seenBtn": return send({ t: "seen" });
    case "beginBtn": return send({ t: "begin" });
    case "doneBtn": return send({ t: "done" });
    case "readyBtn": return send({ t: "readyvote" });
    case "voteBtn": snd.lock(); snd.buzz(40); send({ t: "vote", id: voteFor }); voteFor = null; return;
    case "unvoteBtn": voteFor = null; return render();
    case "nextBtn": return send({ t: "next" });
    case "endBtn": return send({ t: "end" });
    case "againBtn": return send({ t: "again" });
    case "startBtn": return send({ t: "start" });
    case "leaveBtn": case "leaveFinalBtn": return send({ t: "leave" });
    case "quickBtn": saveName(); setStatus("Finding a game…"); return send({ t: "quick" });
    case "createBtn": saveName(); return send({ t: "create" });
    case "muteBtn": snd.setMuted(!snd.isMuted()); return paintMute();
    case "exitBtn":
      if (!exitArmed) return armExit(true);
      armExit(false);
      return send({ t: "leave" });
  }
});
document.addEventListener("submit", (e) => {
  e.preventDefault();
  if (e.target.id === "clueForm") {
    const text = $("clueInput").value.trim();
    if (text) send({ t: "clue", text });
  }
  if (e.target.id === "guessForm") {
    const text = $("guessInput").value.trim();
    if (text) send({ t: "guess", text });
  }
  if (e.target.id === "joinForm") {
    const code = $("codeInput").value.trim().toUpperCase();
    if (code.length === 4) { saveName(); send({ t: "join", code }); }
  }
});
$("codeInput").addEventListener("input", (e) => { e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""); });

let exitArmed = false, exitTimer = null;
function armExit(on) {
  exitArmed = on;
  clearTimeout(exitTimer);
  $("exitBtn").classList.toggle("armed", on);
  $("exitBtn").querySelector("b").textContent = on ? "Sure? Tap again" : "Leave game";
  if (on) exitTimer = setTimeout(() => armExit(false), 3000);
}
function paintMute() {
  const m = snd.isMuted();
  $("muteBtn").textContent = m ? "🔇" : "🔊";
  $("muteBtn").setAttribute("aria-label", m ? "Sound off" : "Sound on");
}
function saveName() {
  const n = $("nameInput").value.trim();
  if (n && window.KmuftiYou && n !== window.KmuftiYou.name()) {
    window.KmuftiYou.setName(n);
    send({ t: "name", name: window.KmuftiYou.name(), color: myColor() });
  }
}
$("nameInput").value = myName();
const linkCode = new URLSearchParams(location.search).get("room");
if (linkCode) $("codeInput").value = linkCode.toUpperCase().slice(0, 4);

paintMute();
show("home");
setStatus("Connecting…");
connect();
const joinFromLink = setInterval(() => {
  if (!ready) return;
  clearInterval(joinFromLink);
  setStatus("");
  if (linkCode && !S) send({ t: "join", code: linkCode });
}, 200);
