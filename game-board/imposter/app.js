// Imposter - the page. The server (../imposter-server.js) deals the words
// and keeps the secrets; this draws the table and turns taps into messages.
//
// On a big screen the players sit in a ring round the table, you at the
// bottom; the middle of the table shows whatever's happening. On a phone
// the table comes first and the players stack under it.
import { MIN_PLAYERS, SPIN_MS, RESPIN_MS, majority } from "./rules.js?v=4";
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
    send({ t: "hello", game: "imposter", id: identity(), name: myName(), color: myColor() });
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
  if (m.t !== "state" || m.game !== "imposter") return;
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
    const r = S.result, mine = S.reveal && S.reveal.imposter === S.you;
    const won = r.winner === "crew" ? !mine : r.winner === "imposter" ? mine : false;
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
  if (id !== "game") $("readyBtn").hidden = true;
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
function renderLobby() {
  show("lobby");
  $("lobbyCode").textContent = S.code;
  $("roomLine").textContent = S.quick ? "Quick game · room code" : "Room code";
  $("roomHint").textContent = S.quick
    ? "Anyone who taps Quick game lands here. Share the code to bring friends."
    : "Everyone opens Imposter on their own phone or laptop and types the code.";
  $("lobbyPlayers").innerHTML = S.players.map((p) =>
    `<div class="mate${p.online ? "" : " away"}">${avatar(p)}<span class="mn">${esc(p.name)}</span>` +
    `<small>${[p.bot ? "bot" : "", p.id === S.you ? "you" : "", p.id === S.host && !S.quick ? "host" : "", p.online ? "" : "away", p.score ? `${p.score} pts` : ""].filter(Boolean).join(" · ")}</small></div>`).join("");
  const host = isHost() && !S.quick;
  $("startBtn").hidden = !host;
  $("botRow").hidden = !(S.dev && isHost());
  const here = S.players.filter((p) => p.online).length;
  $("startBtn").disabled = here < MIN_PLAYERS;
  clearInterval(countdownTimer);
  if (S.quick && S.startsIn) {
    const ends = Date.now() + S.startsIn;
    const tickDown = () => setStatus(`Starting in ${Math.max(1, Math.ceil((ends - Date.now()) / 1000))}…`);
    tickDown();
    countdownTimer = setInterval(tickDown, 250);
  } else if (S.quick) setStatus(here < MIN_PLAYERS ? `Waiting for ${MIN_PLAYERS - here} more…` : "");
  else if (here < MIN_PLAYERS) setStatus(`You need ${MIN_PLAYERS - here} more player${MIN_PLAYERS - here === 1 ? "" : "s"}.`);
  else setStatus(host ? "" : `Waiting for ${nameOf(S.host)} to start.`);
}

/* ---------- the ring of players ---------- */
function seatOrder() {
  const inR = S.players.filter((p) => p.inRound);
  const ids = S.order.length ? S.order.slice() : (inR.length ? inR : S.players.filter((p) => p.online)).map((p) => p.id);
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
  const imposter = S.reveal ? S.reveal.imposter : S.guessing;
  const clickable = (S.phase === "talk" || (S.phase === "vote" && !me()?.voted)) && inRound();

  $("seats").innerHTML = ids.map((id, i) => {
    const p = playerOf(id);
    if (!p) return "";
    // round the table, starting at the bottom (you) and going clockwise
    const a = Math.PI / 2 + (2 * Math.PI * i) / n;
    const x = 50 + 44 * Math.cos(a), y = 50 + 41 * Math.sin(a);
    const turn = S.phase === "clues" && S.order[S.turn] === id;
    // this round's clue in a big chat bubble; earlier rounds as small
    // numbered chips under it
    const said = S.clues[id] || [];
    const cur = said.length === S.clueRound ? said[said.length - 1] : undefined;
    const older = cur === undefined ? said : said.slice(0, -1);
    const chip = (c, k) => c === null || c === ""
      ? `<span class="cl skip"><i>${k + 1}</i>—</span>`
      : `<span class="cl"><i>${k + 1}</i>${esc(c)}</span>`;
    const bubble = cur === undefined ? "" : cur === null || cur === ""
      ? `<span class="say skip">no clue</span>` : `<span class="say">${esc(cur)}</span>`;
    const cl = older.map(chip).join("");
    const tags = [];
    if (S.phase === "reveal") tags.push(p.seen ? `<em class="ok">✓ ready</em>` : `<em>peeking…</em>`);
    if ((S.phase === "talk" || S.phase === "clues") && p.readyVote) tags.push(`<em class="ok">wants to vote</em>`);
    if (S.phase === "landed" && S.spinVotes[id]) tags.push(S.spinVotes[id] === "respin" ? `<em class="ok">respin</em>` : `<em class="ok">✓ keep</em>`);
    if (S.phase === "vote") tags.push(p.voted ? `<em class="ok">✓ voted</em>` : `<em>deciding…</em>`);
    if (!p.online) tags.push(`<em class="away">away</em>`);
    const cls = ["seat",
      id === S.you ? "me" : "",
      turn ? "turn" : "",
      clickable && id !== S.you ? "pick" : "",
      S.sus[S.you] === id && S.phase === "talk" ? "pointing" : "",
      voteFor === id ? "chosen" : "",
      out === id ? "out" : "",
      imposter === id && (S.phase === "result" || S.phase === "guess") ? "imp" : "",
    ].filter(Boolean).join(" ");
    const badge = S.phase === "talk" && pointed[id] ? `<b class="fingers">${pointed[id]} pointing</b>`
      : (S.phase === "verdict" || S.phase === "guess" || S.phase === "result") && counts[id] ? `<b class="fingers vote">${counts[id]} vote${counts[id] === 1 ? "" : "s"}</b>` : "";
    const gain = S.phase === "result" && gains[id] ? `<b class="gain">+${gains[id]}</b>` : "";
    const stamp = imposter === id && (S.phase === "result" || S.phase === "guess") ? `<span class="stamp">Imposter</span>` : "";
    return `<div class="${cls}" data-seat="${esc(id)}" style="left:${x.toFixed(2)}%;top:${y.toFixed(2)}%;--c:${esc(p.color || "#ff4d6d")}">` +
      `<div class="seat-in">${avatar(p)}${badge}${gain}${stamp}` +
      `<span class="sn">${esc(p.name)}${id === S.you ? " <small>(you)</small>" : ""}</span>` +
      (p.score ? `<span class="ss">${p.score} pt${p.score === 1 ? "" : "s"}</span>` : "") + tags.join("") +
      bubble + (cl ? `<div class="cls">${cl}</div>` : "") + `</div></div>`;
  }).join("");
  // (before the deal nobody's in the round yet, so nobody is "waiting")
  const dealt = S.phase !== "spin" && S.phase !== "landed";
  const waiting = dealt ? S.players.filter((p) => !p.inRound && p.online) : [];
  $("seats").dataset.n = n;
  $("ring").dataset.waiting = waiting.length ? `Joining next round: ${waiting.map((p) => p.name).join(", ")}` : "";
}

/* ---------- the middle of the table ---------- */
// "Vote now": anyone can ask for the vote early; at 75% of the round it
// starts. A small pill at the bottom, not in the middle of the table.
function paintVoteNow() {
  const b = $("readyBtn");
  const on = !!S && (S.phase === "clues" || S.phase === "talk") && inRound();
  b.hidden = !on;
  if (!on) return;
  const ready = S.players.filter((x) => x.inRound && x.online && x.readyVote).length;
  const mine = !!me()?.readyVote;
  b.classList.toggle("on", mine);
  b.innerHTML = `${mine ? "✓ " : ""}Vote now <small>${ready}/${S.voteNeed}</small>`;
}
const secsLeft = () => Math.max(0, Math.ceil((S.msLeft - (performance.now() - stateAt)) / 1000));
// The countdown runs round the rim of the table (painted by paintTimers).
const timerHTML = (total) => `<svg class="tring" data-total="${total}" aria-hidden="true"><path class="track" pathLength="100"/><path class="run" pathLength="100"/></svg>`;

function renderTable() {
  const t = $("table");
  const m = S.me;
  const p = S.phase;
  let h = "";
  const word = m ? (m.imposter ? null : m.word) : null;

  if (p === "spin") {
    h = `<p class="kicker">Round ${S.round + 1}</p><div class="reel"><div class="strip" id="strip"></div></div>`;
  } else if (p === "landed") {
    const mine = S.spinVotes[S.you];
    const here = S.players.filter((x) => x.online);
    const count = (v) => here.filter((x) => S.spinVotes[x.id] === v).length;
    h = `<p class="kicker">Round ${S.round + 1}</p><h2 class="big cat-pick">${esc(S.cat.name)}</h2>` +
      `<div class="row spinvote"><button class="btn big ${mine === "keep" ? "hot" : "ghost"}" id="keepBtn">Keep <small>${count("keep")}/${majority(here.length)}</small></button>` +
      `<button class="btn big ${mine === "respin" ? "hot" : "ghost"}" id="respinBtn">Respin <small>${count("respin")}/${majority(here.length)}</small></button></div>` +
      `<div class="spinbar"><i id="spinFill"></i></div>`;
  } else if (!inRound() && p !== "result") {
    h = `<p class="kicker">Round ${S.round}</p><h2 class="big">You're in next round</h2>`;
  } else if (p === "reveal") {
    const back = m.imposter
      ? `<span class="cardk">You are the</span><span class="cardw imp">IMPOSTER</span><span class="cardh">${m.cat ? `The category is <b>${esc(m.cat)}</b>. Blend in.` : "No hints. Good luck."}</span>`
      : `<span class="cardk">The word is</span><span class="cardw">${esc(m.word)}</span><span class="cardh">${m.cat ? esc(m.cat) : ""}</span>`;
    const looked = S.players.filter((x) => x.inRound && x.seen).length, all = S.players.filter((x) => x.inRound).length;
    h = `<p class="kicker">Round ${S.round} · ${esc(m.cat)}</p>` +
      `<button class="card${flipped ? " flipped" : ""}" id="flipCard"><span class="face front"><span class="q">?</span><span class="cardh">Tap to look</span></span><span class="face back">${back}</span></button>` +
      (me().seen ? `<p class="sub">${looked}/${all} ready</p>` : `<button class="btn big" id="seenBtn" ${flipped ? "" : "disabled"}>Got it</button>`) +
      (isHost() && looked < all ? `<button class="link" id="beginBtn">Start without waiting</button>` : "");
  } else if (p === "clues") {
    const who = S.order[S.turn];
    h = `<p class="kicker">Clue ${S.clueRound}/${S.rounds}</p>`;
    if (myTurn()) {
      h += `<h2 class="big">Your turn</h2>` +
        `<form class="clue-form" id="clueForm"><input id="clueInput" maxlength="32" placeholder="Your clue" autocomplete="off" spellcheck="false" autofocus /><button class="btn hot" type="submit">Say it</button></form>`;
    } else {
      h += `<h2 class="big">${esc(nameOf(who))}'s turn</h2>`;
    }
    h += timerHTML(40);
  } else if (p === "talk") {
    h = `<p class="kicker">Talk</p><h2 class="big">Who's faking it?</h2>` +
      `<p class="sub">Tap someone to point</p>` + timerHTML(S.talk);
  } else if (p === "vote") {
    const voted = S.players.filter((x) => x.inRound && x.voted).length, all = S.players.filter((x) => x.inRound).length;
    h = `<p class="kicker">Vote</p>`;
    if (me().voted) h += `<h2 class="big">Vote's in</h2><p class="sub">${voted}/${all} voted</p>`;
    else if (voteFor) h += `<h2 class="big">Vote out ${esc(nameOf(voteFor))}?</h2><div class="row"><button class="btn big hot" id="voteBtn">Lock it in</button><button class="btn ghost" id="unvoteBtn">Change</button></div>`;
    else h += `<h2 class="big">Tap who's out</h2>`;
    h += timerHTML(40);
  } else if (p === "verdict") {
    const v = S.verdict;
    const all = Object.entries(v.votes);
    const shown = all.slice(0, verdictStep);
    h = `<p class="kicker">The votes</p><div class="votes">` +
      shown.map(([a, b]) => `<span class="vline">${esc(nameOf(a))} <i>→</i> ${esc(nameOf(b))}</span>`).join("") + `</div>`;
    if (verdictStep > all.length) {
      h += v.out ? `<h2 class="big">${esc(nameOf(v.out))} is out</h2>`
          : `<h2 class="big">Tie: nobody's out</h2>`;
    } else if (!all.length) h += `<h2 class="big">Nobody voted!</h2>`;
  } else if (p === "guess") {
    if (S.guessing === S.you) {
      h = `<p class="kicker">Caught!</p><h2 class="big">Guess the word</h2>` +
        `<form class="clue-form" id="guessForm"><input id="guessInput" maxlength="40" placeholder="The word is…" autocomplete="off" spellcheck="false" autofocus /><button class="btn hot" type="submit">Guess</button></form>`;
    } else {
      h = `<p class="kicker">Caught!</p><h2 class="big">${esc(nameOf(S.guessing))} was the imposter</h2><p class="sub">One guess to steal it…</p>`;
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
  paintVoteNow();
  paintTimers();
  if (p === "spin") spinReel();
}

function resultHTML() {
  const r = S.result, v = S.reveal;
  const imp = v.imposter ? esc(nameOf(v.imposter)) : null;
  const role = "imposter";
  const head = {
    crew: "The crew wins",
    imposter: `The ${role} wins`,
  }[r.winner];
  const whys = {
    caught: () => `${imp} was caught${v.guess && v.guess.text ? `, and guessed “${esc(v.guess.text)}”. Wrong!` : `, and couldn't guess the word.`}`,
    stole: () => `${imp} was caught, but guessed “${esc(v.guess.text)}” and stole it!`,
    wrong: () => `You voted out ${esc(nameOf(S.verdict.out))}. The ${role} was ${imp}.`,
    tie: () => `A tie, so nobody went. The ${role} was ${imp}.`,
    fled: () => `${imp || "The " + role} left the game. Coward.`,
  };
  const why = (whys[r.why] || (() => ""))();
  const words = `<div class="words"><span><small>The word was</small>${esc(v.word)}</span></div>`;
  const myGain = r.gains[S.you];
  return `<p class="kicker">Round ${S.round} · ${esc(v.cat)}</p><h2 class="big win-${r.winner}">${head}</h2><p class="sub">${why}</p>${words}` +
    (myGain ? `<p class="mygain">+${myGain} for you</p>` : "") +
    (isHost() || S.quick
      ? `<div class="row"><button class="btn big hot" id="nextBtn">Next round</button>${isHost() && !S.quick ? `<button class="btn ghost" id="endBtn">End game</button>` : ""}</div>`
      : `<p class="sub">Waiting for ${esc(nameOf(S.host))} to deal the next round…</p>`);
}

/* ---------- the category reel (the same one as Draft's) ---------- */
// Categories stream past and it lands on the one the server picked. Built
// once per spin, and the table isn't redrawn under it until it lands.
let spunFor = "";
function spinReel() {
  const strip = $("strip");
  const key = `${S.round}:${S.cat.name}`;
  if (!strip || spunFor === key && strip.childElementCount) return;
  spunFor = key;
  const target = S.cat.name;
  const names = S.cats.map((c) => c.name).filter((n) => n !== target);
  const rows = [];
  for (let k = 0; k < 3; k++) rows.push(...names.slice().sort(() => Math.random() - 0.5));
  rows.push(target);
  strip.innerHTML = rows.map((n) => `<div class="cell">${esc(n)}</div>`).join("");
  const cell = strip.firstElementChild.getBoundingClientRect().height;
  const secs = (SPIN_MS - 1500) / 1000;
  requestAnimationFrame(() => requestAnimationFrame(() => {
    strip.style.transition = `transform ${secs}s cubic-bezier(.12, .7, .18, 1)`;
    strip.style.transform = `translateY(${-(rows.length - 1) * cell}px)`;
  }));
  snd.spin(secs);
  setTimeout(() => { strip.lastElementChild.classList.add("hit"); snd.lock(); snd.buzz(60); }, secs * 1000);
}
// the respin vote's countdown bar
setInterval(() => {
  const f = document.getElementById("spinFill");
  if (!f || !S || S.phase !== "landed") return;
  f.style.transform = `scaleX(${(Math.max(0, S.spinLeft - (performance.now() - stateAt)) / RESPIN_MS).toFixed(4)})`;
}, 80);

/* ---------- countdowns ---------- */
function paintTimers() {
  for (const el of document.querySelectorAll(".tring")) {
    const total = (+el.dataset.total || 1) * 1000;
    const left = S ? Math.max(0, S.msLeft - (performance.now() - stateAt)) : 0;
    ringPath(el);
    el.querySelector(".run").style.strokeDasharray = `${Math.min(100, (left / total) * 100).toFixed(2)} 100`;
    el.classList.toggle("low", left <= 5000);
  }
}
// A path round the table's rim, starting at the top middle and going
// clockwise, sized to the table as it is right now (an oval on a laptop, a
// rounded box on a phone).
function ringPath(svg) {
  const t = svg.parentElement, w = t.offsetWidth, h = t.offsetHeight;
  const key = `${w}x${h}`;
  if (svg.dataset.size === key) return;
  svg.dataset.size = key;
  const cs = getComputedStyle(t);
  const rad = (v, size) => (String(v).trim().endsWith("%") ? (parseFloat(v) / 100) * size : parseFloat(v) || 0);
  const [rxs, rys] = cs.borderTopLeftRadius.split(" ");
  const o = -9;   // just outside the table, on its rim
  const x0 = o, y0 = o, x1 = w - o, y1 = h - o;
  const rx = Math.min(rad(rxs, w) - o, (x1 - x0) / 2), ry = Math.min(rad(rys || rxs, h) - o, (y1 - y0) / 2);
  const d = `M ${w / 2} ${y0} H ${x1 - rx} A ${rx} ${ry} 0 0 1 ${x1} ${y0 + ry} V ${y1 - ry} A ${rx} ${ry} 0 0 1 ${x1 - rx} ${y1}` +
    ` H ${x0 + rx} A ${rx} ${ry} 0 0 1 ${x0} ${y1 - ry} V ${y0 + ry} A ${rx} ${ry} 0 0 1 ${x0 + rx} ${y0} Z`;
  for (const p of svg.querySelectorAll("path")) p.setAttribute("d", d);
}
let lastBeep = -1;
setInterval(() => {
  if (!S || !document.querySelector(".tring")) return;
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
  el.textContent = peeking ? (m.imposter ? "You're the imposter" : m.word) : "hold to peek";
  $("myCard").classList.toggle("peek", peeking);
  $("myCard").classList.toggle("imp", peeking && m.imposter);
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
  if (det) awards.push(["Best detective", nameOf(det.id), `${det.sharp} right vote${det.sharp === 1 ? "" : "s"}`]);
  const liar = S.stats.slice().sort((a, b) => (b.escaped + b.stole) - (a.escaped + a.stole))[0];
  if (liar && liar.escaped + liar.stole) awards.push(["Master of disguise", nameOf(liar.id), `got away ${liar.escaped + liar.stole} time${liar.escaped + liar.stole === 1 ? "" : "s"}`]);
  const thief = most("stole");
  if (thief) awards.push(["Word thief", nameOf(thief.id), `stole ${thief.stole} round${thief.stole === 1 ? "" : "s"} with a guess`]);
  const sus = most("susVotes");
  if (sus) awards.push(["Most suspicious", nameOf(sus.id), `${sus.susVotes} vote${sus.susVotes === 1 ? "" : "s"} against them`]);
  const framed = S.stats.slice().sort((a, b) => b.votedOut - a.votedOut).find((s) => s.votedOut && s.imposter < s.votedOut);
  if (framed) awards.push(["Wrongly accused", nameOf(framed.id), "voted out while innocent"]);

  const podium = [ranked[1], ranked[0], ranked[2]].map((p, k) => p
    ? `<div class="pod p${[2, 1, 3][k]}">${avatar(p, "big")}<b>${esc(p.name)}</b><span>${p.score} pts</span><div class="block">${[2, 1, 3][k]}</div></div>` : `<div class="pod empty"></div>`).join("");
  const rounds = S.history.map((h) => {
    const res = { crew: "crew won", imposter: "imposter won" }[h.winner];
    return `<li><span class="rw"><b>${esc(h.word)}</b><small>${esc(h.cat)}</small></span>` +
      `<span class="ri">Imposter: ${esc(h.imposterName || "someone")}</span><span class="rr r-${h.winner}">${res}</span></li>`;
  }).join("");
  $("final").innerHTML =
    `<div class="final">` +
      `<p class="kicker">Final standings</p><h1 class="final-head">${esc(ranked[0]?.name || "")} wins!</h1>` +
      `<div class="podium">${podium}</div>` +
      (awards.length ? `<div class="awards">${awards.map(([t, who, v]) => `<div class="award"><span class="at">${t}</span><b>${esc(who)}</b><span class="av2">${esc(v)}</span></div>`).join("")}</div>` : "") +
      `<div class="final-cols"><div><h3>Everyone</h3><ol class="standings">${ranked.map((p) => `<li>${avatar(p)}<span>${esc(p.name)}</span><small>${stat(p.id).imposter || 0}× imposter</small><b>${p.score}</b></li>`).join("")}</ol></div>` +
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
  switch (b.id) {
    case "flipCard": flipped = !flipped; snd.swoosh(0.4); return render();
    case "seenBtn": return send({ t: "seen" });
    case "beginBtn": return send({ t: "begin" });
    case "keepBtn": return send({ t: "keep" });
    case "respinBtn": snd.tick(); return send({ t: "respin" });
    case "readyBtn": snd.tick(); return send({ t: "readyvote", off: !!me()?.readyVote });
    case "addBotBtn": return send({ t: "addbot" });
    case "clearBotsBtn": return send({ t: "clearbots" });
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
// the sound button's two drawings (no emoji)
const SOUND_ON = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4z" fill="currentColor"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg>`;
const SOUND_OFF = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4z" fill="currentColor"/><path d="m16 9 6 6M22 9l-6 6"/></svg>`;
function paintMute() {
  const m = snd.isMuted();
  $("muteBtn").innerHTML = m ? SOUND_OFF : SOUND_ON;
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
