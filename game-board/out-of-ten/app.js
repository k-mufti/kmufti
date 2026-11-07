// Out of Ten - the page. The server (../ten-server.js) runs the rounds and
// keeps the number; this draws them and turns taps into moves.
//
// The game screen: the ring of players round the one in the middle (with
// their read on a 0-10 meter), the hand below it (whatever you can do right
// now), and the cards played so far this round. The hand is only rebuilt
// when the moment changes, so a card or answer you're typing survives
// other people's moves.
import * as R from "./rules.js?v=1";
import * as snd from "../frequency/sound.js?v=3";

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
const myColor = () => (window.KmuftiYou ? window.KmuftiYou.color() : "#e5322d");

let ws = null, ready = false, outbox = [], retry = 0;
function connect() {
  ws = new WebSocket(socketURL());
  ws.addEventListener("open", () => {
    ready = true; retry = 0;
    send({ t: "hello", game: "ten", id: identity(), name: myName(), color: myColor() });
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
let stateAt = 0;
// my picks while I'm in the middle, before I throw / lock
let selCard = null, readSel = null;
const me = () => S && S.players.find((p) => p.id === S.you);
const playerOf = (id) => S.players.find((p) => p.id === id);
const nameOf = (id) => (id === S.you ? "You" : playerOf(id)?.name || "someone");
const isHost = () => !!S && S.host === S.you;
const middle = () => !!S && S.guesser === S.you;
const catching = () => !!S && S.phase === "answer" && S.thrown && S.thrown.to === S.you;
const lastTurn = () => S.turns[S.turns.length - 1];

let lastPhase = null, lastBeat = "";
function onMessage(m) {
  if (m.t === "welcome") return;
  if (m.t === "idle") { S = null; show("home"); setStatus(""); return; }
  if (m.t === "error") { snd.side(false); return toast(m.msg); }
  if (m.t !== "state" || m.game !== "ten") return;
  const prev = S;
  S = m;
  stateAt = performance.now();
  if (S.phase !== lastPhase) { lastPhase = S.phase; selCard = null; readSel = null; }
  render();
  sounds(prev);
}

// One beat per moment, so a reconnect or someone joining stays quiet.
function sounds(prev) {
  const beat = [S.phase, S.round, S.turns.length, S.thrown?.to || ""].join(":");
  if (beat === lastBeat || !prev) { lastBeat = beat; return; }
  lastBeat = beat;
  if (S.phase === "deal") { snd.swoosh(0.7); if (!middle()) snd.buzz([40, 30, 40]); }
  if (S.phase === "throw") {
    if (lastTurn()) snd.tick(true);
    if (middle()) { snd.yourTurn(); snd.buzz([60, 40, 60]); }
  }
  if (S.phase === "answer") {
    snd.swoosh(0.4);
    flyCard();
    if (catching()) { snd.yourTurn(); snd.buzz([80, 40, 80]); }
  }
  if (S.phase === "read") { snd.tick(); if (middle()) snd.buzz(40); }
  if (S.phase === "guess") { snd.drumroll(0.8); if (middle()) { snd.yourTurn(); snd.buzz([60, 40, 60]); } }
  if (S.phase === "reveal") {
    snd.drumroll(1.1);
    setTimeout(() => (S.result?.exact ? (snd.fanfare(), snd.buzz([80, 50, 160])) : snd.points(0)), 1100);
  }
  if (S.phase === "final") snd.fanfare();
}

/* ========================================================================
   Drawing
   ======================================================================== */
function show(id) {
  for (const s of ["home", "lobby", "game", "final"]) $(s).hidden = s !== id;
  $("codeChip").hidden = id === "home";
  $("exitBtn").hidden = id !== "game";
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
const avatar = (p, cls = "") => `<span class="av ${cls}" style="--c:${esc(p?.color || "#e5322d")}">${esc(initial(p?.name))}</span>`;
// "a 7", "an 8"
const aN = (n) => `${n === 8 || n === 18 ? "an" : "a"} ${n}`;
// the scale, only when it's not the obvious one (0 worst, 10 best)
const scaleOf = (c) => (c.low === "worst" && c.high === "best" ? "" : `<span class="scale">0 ${esc(c.low)} · 10 ${esc(c.high)}</span>`);
// A prompt card, shaped like a playing card; `rank` is the number, for
// those who know it, in the corner.
const bcard = (c, cls = "", attrs = "", rank = null) => `<div class="bcard${rank != null ? " ranked" : ""} ${cls}" ${attrs}>` +
  (rank != null ? `<span class="rank">${rank}</span>` : "") + `<p>${esc(c.text)}</p>${scaleOf(c)}</div>`;
const dial = (was) => `<div class="dial" id="dial">${Array.from({ length: R.HIGH - R.LOW + 1 }, (_, i) =>
  `<button data-n="${R.LOW + i}" class="${R.LOW + i === was ? "was" : ""}">${R.LOW + i}</button>`).join("")}</div>`;

function render() {
  if (!S) return;
  $("codeChip").textContent = S.code;
  if (S.phase === "lobby") return renderLobby();
  if (S.phase === "final") return renderFinal();
  show("game");
  renderTable();
  renderHand();
  renderPlayed();
}

/* ---------- the lobby ---------- */
let countdownTimer = null;
function renderLobby() {
  show("lobby");
  $("lobbyCode").textContent = S.code;
  $("roomLine").textContent = S.quick ? "Quick game · room code" : "Room code";
  $("roomHint").textContent = S.quick ? "Share the code to bring friends." : "Everyone opens Out of Ten and types the code.";
  $("lobbyPlayers").innerHTML = S.players.map((p) =>
    `<div class="mate${p.online ? "" : " away"}">${avatar(p)}<span class="mn">${esc(p.name)}</span>` +
    `<small>${[p.bot ? "bot" : "", p.id === S.you ? "you" : "", p.id === S.host && !S.quick ? "host" : "", p.online ? "" : "away"].filter(Boolean).join(" · ")}</small></div>`).join("");
  const host = isHost() && !S.quick;
  $("startBtn").hidden = !host;
  $("botRow").hidden = !(S.dev && isHost());
  const here = S.players.filter((p) => p.online).length;
  $("startBtn").disabled = here < R.MIN_PLAYERS;
  clearInterval(countdownTimer);
  if (S.quick && S.startsIn) {
    const ends = Date.now() + S.startsIn;
    const tickDown = () => setStatus(`Starting in ${Math.max(1, Math.ceil((ends - Date.now()) / 1000))}…`);
    tickDown();
    countdownTimer = setInterval(tickDown, 250);
  } else if (here < R.MIN_PLAYERS) setStatus(`You need ${R.MIN_PLAYERS - here} more.`);
  else setStatus(host || S.quick ? "" : `Waiting for ${nameOf(S.host)} to start.`);
}

/* ---------- the table: the ring round the one in the middle ---------- */
// Everyone but the one in the middle, in seat order starting just after them.
function ringOrder() {
  const k = S.players.findIndex((p) => p.id === S.guesser);
  const out = [];
  for (let i = 1; i <= S.players.length; i++) {
    const p = S.players[(k + i) % S.players.length];
    if (p.id !== S.guesser) out.push(p);
  }
  return out;
}
function renderTable() {
  const ring = ringOrder();
  const n = ring.length || 1;
  const start = -Math.PI / 2 + Math.PI / n;
  $("ring").innerHTML = ring.map((p, i) => {
    const a = start + (i / n) * Math.PI * 2;
    const x = 50 + 41 * Math.cos(a), y = 50 + 40 * Math.sin(a);
    const turn = S.turns.find((t) => t.to === p.id);
    const done = turn && turn.read != null;
    const cls = ["seat",
      p.online ? "" : "away",
      done ? "done" : "",
      S.phase === "throw" && S.next === p.id ? "chosen" : "",
      S.phase === "answer" && S.thrown?.to === p.id ? "catching" : ""].filter(Boolean).join(" ");
    const status = `<b>${p.score}</b>`;
    return `<button class="${cls}" data-seat="${esc(p.id)}" style="left:${x.toFixed(1)}%;top:${y.toFixed(1)}%">` +
      `${avatar(p)}${done ? `<span class="tick${turn.closer ? " up" : ""}">${turn.read}</span>` : ""}` +
      `<span class="sn">${esc(p.id === S.you ? "You" : p.name)}</span><span class="ss">${status}</span></button>`;
  }).join("");

  const g = playerOf(S.guesser);
  const showRead = S.turns.some((t) => t.read != null) || S.phase === "reveal";
  const meter = Array.from({ length: R.HIGH - R.LOW + 1 }, (_, i) => {
    const v = R.LOW + i;
    return `<span class="${[v === S.read && showRead ? "at" : "", v === S.number ? "n" : ""].join(" ")}">${v}</span>`;
  }).join("");
  $("middle").innerHTML = (g ? avatar(g) : "") +
    `<span class="mn">${esc(nameOf(S.guesser))}</span>` +
    (S.phase === "throw" || S.phase === "deal" ? `<span class="deck" id="deck"><i></i><i></i><i></i></span>` : "") +
    `<div class="meter" id="meter">${meter}</div>`;
}

// The card flies from the middle to whoever it was thrown at.
function flyCard() {
  const to = document.querySelector(`.seat[data-seat="${CSS.escape(S.thrown?.to || "")}"] .av`);
  const from = $("deck") || document.querySelector(".middle .av");
  if (!to || !from) return;
  const a = from.getBoundingClientRect(), b = to.getBoundingClientRect();
  const f = document.createElement("div");
  f.className = "flyer";
  f.textContent = S.thrown.card.text;
  f.style.left = `${a.left + a.width / 2}px`;
  f.style.top = `${a.top + a.height / 2}px`;
  document.body.appendChild(f);
  const dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2);
  const spin = dx < 0 ? -340 : 340;
  const anim = f.animate([
    { transform: "translate(0,0) rotate(0) scale(1)" },
    { transform: `translate(${dx * 0.55}px, ${dy * 0.55 - 40}px) rotate(${spin * 0.6}deg) scale(1.1)`, offset: 0.55 },
    { transform: `translate(${dx}px, ${dy}px) rotate(${spin}deg) scale(0.55)`, opacity: 0.9 },
  ], { duration: 650, easing: "cubic-bezier(.3,.1,.3,1)" });
  anim.onfinish = () => f.remove();
}

/* ---------- the hand: what you can do right now ---------- */
let handKey = "";
function renderHand() {
  const key = [S.phase, S.round, S.turns.length, S.thrown?.to, S.offer.map((c) => c.text).join("/"), S.number, S.next].join("|");
  if (key === handKey) return paintPicks();
  handKey = key;
  const h = $("hand");
  const g = nameOf(S.guesser);
  const t = S.thrown;
  // the ring's number, as a small card
  const yours = S.number != null && !middle() && S.phase !== "reveal" ? `<span class="mini">${S.number}</span>` : "";
  const status = (text) => `<div class="status-row">${yours}<p class="say wait">${text}</p></div>`;
  let x = "";

  if (S.phase === "deal") {
    x = `<div class="deal">` + (middle()
      ? `<span class="big-num q">?</span><p class="say">You're guessing</p>`
      : `<span class="big-num">${S.number}</span><p class="say">Don't say it</p>`) + `</div>`;
  } else if (S.phase === "throw") {
    if (middle()) {
      x = `<p class="say">Pick a card for ${esc(nameOf(S.next))}</p>` +
        `<div class="offer">${S.offer.map((c, i) => bcard(c, "pick", `data-pick="${i}"`)).join("")}` +
        `<div class="bcard own pick" data-pick="own"><p>Your own</p><input id="ownInput" maxlength="${R.PROMPT_MAX}" placeholder="Type it" autocomplete="off" /></div></div>` +
        `<button class="btn big" id="throwBtn" disabled>Throw</button>`;
    } else {
      x = status(`${esc(g)} is picking a card for ${S.next === S.you ? "you" : esc(nameOf(S.next))}`);
    }
  } else if (S.phase === "answer") {
    if (catching()) {
      x = `<div class="catch">${bcard(t.card, "caught", "", S.number)}` +
        `<form class="answer-form" id="answerForm"><input id="answerInput" maxlength="${R.ANSWER_MAX}" placeholder="Your answer" autocomplete="off" /><button class="btn" type="submit">Play</button></form></div>`;
    } else {
      x = `<div class="inplay">${bcard(t.card, "caught", "", S.number)}<div class="wcard pending"><span class="wait">${esc(nameOf(t.to))}</span></div></div>`;
    }
  } else if (S.phase === "read") {
    const lt = lastTurn();
    const ans = lt.answer ? `<div class="wcard caught"><p>${esc(lt.answer)}</p></div>` : `<div class="wcard blank"><p>Out of time</p></div>`;
    if (middle()) {
      if (readSel == null) readSel = S.read;
      x = `<div class="inplay">${bcard(lt.card)}${ans}</div><p class="say">Where are you at?</p>` + dial(S.turns.length > 1 ? S.read : null) +
        `<button class="btn big" id="readBtn"></button>`;
    } else {
      x = `<div class="inplay">${bcard(lt.card, "", "", S.number)}${ans}</div>`;
    }
  } else if (S.phase === "guess") {
    if (middle()) {
      if (readSel == null) readSel = S.read;
      x = `<p class="say">Final guess</p>` + dial(S.read) + `<button class="btn big" id="readBtn"></button>`;
    } else {
      x = status(`${esc(g)}'s final guess`);
    }
  } else if (S.phase === "reveal") {
    const r = S.result;
    const off = Math.abs(r.guess - r.number);
    const head = r.why === "left" ? `${esc(g)} left` : r.why === "empty" ? "Round's off" : r.exact ? "Spot on" : `Off by ${off}`;
    x = `<div class="reveal"><div class="pair"><div><b>${r.number}</b>Number</div>` +
      (r.why === "done" ? `<div class="g${r.exact ? " hit" : ""}"><b>${r.guess}</b>Guess</div>` : "") + `</div>` +
      `<p class="say">${head}</p>` +
      (isHost() || S.quick
        ? `<div class="two"><button class="btn big" id="nextBtn">${S.gameOver ? "Standings" : "Next round"}</button>${isHost() && !S.quick && !S.gameOver ? `<button class="btn big alt" id="endBtn">End game</button>` : ""}</div>`
        : "") + `</div>`;
  }
  h.innerHTML = `<div class="timer"><i id="timerFill"></i></div>` + x;
  paintPicks();
  const focus = $("answerInput");
  if (focus) focus.focus({ preventScroll: true });
  // your move: bring the hand into view (the table can push it off a phone screen)
  if (catching() || (middle() && ["throw", "read", "guess"].includes(S.phase))) {
    requestAnimationFrame(() => h.scrollIntoView({ behavior: "smooth", block: h.offsetHeight > innerHeight ? "start" : "end" }));
  }
  tickTimer();
}

// My picks, without rebuilding the hand (and losing what I've typed).
function paintPicks() {
  if (S.phase === "throw" && middle()) {
    for (const el of document.querySelectorAll("[data-pick]")) el.classList.toggle("sel", el.dataset.pick === String(selCard));
    const own = $("ownInput");
    const okCard = selCard === "own" ? !!(own && own.value.trim()) : selCard != null;
    const b = $("throwBtn");
    if (b) {
      b.disabled = !okCard;
      b.textContent = "Throw";
    }
  }
  if ((S.phase === "read" || S.phase === "guess") && middle()) {
    for (const el of document.querySelectorAll("#dial button")) el.classList.toggle("sel", Number(el.dataset.n) === readSel);
    const b = $("readBtn");
    if (b) b.textContent = `Lock in ${readSel}`;
  }
}

// The time left for whoever's up, as a bar across the top of the hand.
const TOTALS = { deal: R.DEAL_SECS, throw: R.THROW_SECS, answer: R.ANSWER_SECS, read: R.READ_SECS, guess: R.GUESS_SECS };
function tickTimer() {
  const f = $("timerFill");
  if (!f || !S) return;
  const total = TOTALS[S.phase];
  if (!total) { f.parentElement.hidden = true; return; }
  const left = Math.max(0, S.msLeft - (performance.now() - stateAt));
  f.style.transform = `scaleX(${(left / (total * 1000)).toFixed(4)})`;
  f.classList.toggle("low", left < 8000 && S.phase !== "deal");
}
setInterval(tickTimer, 100);

/* ---------- the cards played this round ---------- */
function renderPlayed() {
  // the card being read right now is already in the hand, so not here too
  $("played").innerHTML = S.turns.filter((t) => t.read != null).map((t) => {
    const r = t.read == null ? `<span class="r">…</span>`
      : `<span class="r${t.closer ? " up" : ""}">${t.read}${t.closer ? ` +${R.POINTS.closer}` : ""}</span>`;
    return `<div class="pc"><div class="q">${esc(t.card.text)}</div>` +
      `<div class="a${t.answer ? "" : " blank"}">${esc(t.answer || "Out of time")}</div>` +
      `<div class="f"><span>${esc(nameOf(t.to))}</span>${r}</div></div>`;
  }).reverse().join("");
}

/* ---------- the end ---------- */
function renderFinal() {
  show("final");
  const ranked = S.players.slice().sort((a, b) => b.score - a.score);
  const st = (id) => S.stats.find((s) => s.id === id) || {};
  const best = (key) => { let b = null; for (const s of S.stats) if (s[key] && (!b || s[key] > b[key])) b = s; return b; };
  const awards = [];
  const ex = best("exact");
  if (ex) awards.push(["Mind reader", nameOf(ex.id), `spot on ${ex.exact} time${ex.exact === 1 ? "" : "s"}`]);
  const cl = best("closer");
  if (cl) awards.push(["Best answers", nameOf(cl.id), `moved the read closer ${cl.closer} time${cl.closer === 1 ? "" : "s"}`]);
  const mi = best("missed");
  if (mi) awards.push(["Slow hands", nameOf(mi.id), `ran out of time ${mi.missed} time${mi.missed === 1 ? "" : "s"}`]);
  const hist = S.history.filter((h) => h.why === "done");
  $("final").innerHTML =
    `<div class="final"><p class="kicker">Final standings</p><h1 class="final-head">${esc(ranked[0]?.name || "")} wins</h1>` +
    (awards.length ? `<div class="awards">${awards.map(([t, who, v]) => `<div class="award"><span class="at">${t}</span><b>${esc(who)}</b><small>${esc(v)}</small></div>`).join("")}</div>` : "") +
    `<div class="final-cols"><div><h3>Everyone</h3><ol class="standings">${ranked.map((p) => `<li>${avatar(p)}<span>${esc(p.name)}</span><small>${st(p.id).answered || 0} cards played</small><b>${p.score}</b></li>`).join("")}</ol></div>` +
    `<div><h3>Every round</h3><ol class="rounds">${(hist.length ? hist : S.history).map((h) => `<li><b>${esc(h.guesserName)} in the middle</b><span>the number was ${h.number}</span>` +
      `<em class="${h.exact ? "hit" : ""}">${h.why === "done" ? (h.exact ? `said ${h.guess}, spot on` : `said ${h.guess}`) : "round off"}</em></li>`).join("")}</ol></div></div>` +
    `<div class="two center">${isHost() ? `<button class="btn big" id="againBtn">Play again</button>` : `<p class="sub">Waiting for ${esc(nameOf(S.host))}…</p>`}<button class="btn big alt" id="leaveFinalBtn">Leave</button></div></div>`;
}

/* ========================================================================
   Taps
   ======================================================================== */
function pickCard(v) {
  selCard = v;
  snd.tick(true);
  if (v === "own") $("ownInput")?.focus();
  paintPicks();
}
function doThrow() {
  if (!S || S.phase !== "throw" || !middle() || selCard == null) return;
  const text = selCard === "own" ? ($("ownInput")?.value || "").trim() : "";
  if (selCard === "own" && !text) return;
  snd.lock();
  send(selCard === "own" ? { t: "throw", text } : { t: "throw", i: Number(selCard) });
}
function lockRead() {
  if (!S || !["read", "guess"].includes(S.phase) || !middle() || readSel == null) return;
  snd.lock(); snd.buzz(30);
  send({ t: S.phase, n: readSel });
}

document.addEventListener("click", (e) => {
  if (!e.target.closest("#exitBtn") && exitArmed) armExit(false);
  const pk = e.target.closest("[data-pick]");
  if (pk) return e.target.closest("input") ? (selCard !== "own" && pickCard("own")) : pickCard(pk.dataset.pick);
  const b = e.target.closest("button");
  if (!b) return;
  if (b.dataset.n != null) { readSel = Number(b.dataset.n); snd.tick(true); return paintPicks(); }
  switch (b.id) {
    case "throwBtn": return doThrow();
    case "readBtn": return lockRead();
    case "nextBtn": return send({ t: "next" });
    case "endBtn": return send({ t: "end" });
    case "againBtn": return send({ t: "again" });
    case "startBtn": return send({ t: "start" });
    case "addBotBtn": return send({ t: "addbot" });
    case "clearBotsBtn": return send({ t: "clearbots" });
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
document.addEventListener("focusin", (e) => { if (e.target.id === "ownInput" && selCard !== "own") pickCard("own"); });
document.addEventListener("input", (e) => {
  // typing your own card picks it
  if (e.target.id === "ownInput") { if (e.target.value.trim()) selCard = "own"; paintPicks(); }
  if (e.target.id === "codeInput") e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
});
document.addEventListener("submit", (e) => {
  e.preventDefault();
  const id = e.target.id;
  if (id === "answerForm") {
    const text = $("answerInput").value.trim();
    if (text) { snd.lock(); send({ t: "answer", text }); }
  }
  if (id === "joinForm") {
    const code = $("codeInput").value.trim().toUpperCase();
    if (code.length === 4) { saveName(); send({ t: "join", code }); }
  }
});
// In the middle, reading: number keys pick, Enter locks it in.
document.addEventListener("keydown", (e) => {
  if (!S || !["read", "guess"].includes(S.phase) || !middle() || e.target.closest("input")) return;
  if (/^[0-9]$/.test(e.key)) { readSel = Number(e.key); snd.tick(true); paintPicks(); }
  if (e.key === "Enter") lockRead();
});
document.addEventListener("keydown", (e) => { if (e.key === "Enter" && e.target.id === "ownInput") { e.preventDefault(); doThrow(); } });

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
