// 21 Questions - the page. The server (../questions-server.js) runs the
// rounds and keeps the secret; this draws them and turns taps into moves.
//
// The game screen: everyone along the top (who's answering, whose turn it
// is), the card in the middle (whatever you can do right now), and the
// notebook beside it - every question so far, numbered to 21, with the
// answer stamped next to it. The card is only rebuilt when the moment
// changes, so a question you're typing survives other people's moves.
import * as R from "./rules.js?v=3";
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
const myColor = () => (window.KmuftiYou ? window.KmuftiYou.color() : "#e4572e");

let ws = null, ready = false, outbox = [], retry = 0;
function connect() {
  ws = new WebSocket(socketURL());
  ws.addEventListener("open", () => {
    ready = true; retry = 0;
    send({ t: "hello", game: "questions", id: identity(), name: myName(), color: myColor() });
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
let finalMode = false;           // on my turn: I've opened the final guess card
let lastPhase = null, lastLog = 0, lastTurnKey = "";
const me = () => S && S.players.find((p) => p.id === S.you);
const playerOf = (id) => S.players.find((p) => p.id === id);
const nameOf = (id) => (id === S.you ? "You" : playerOf(id)?.name || "someone");
const isHost = () => !!S && S.host === S.you;
const answering = () => !!S && S.answerer === S.you;
const myTurn = () => !!S && S.phase === "ask" && S.asker === S.you;
// a guess reads as a question: "A phone" -> "Is it a phone?"
const asGuess = (t) => `Is it ${String(t).replace(/^(A|An|The)\b/, (w) => w.toLowerCase())}?`;

function onMessage(m) {
  if (m.t === "welcome") return;
  if (m.t === "idle") { S = null; show("home"); setStatus(""); return; }
  if (m.t === "error") { snd.side(false); return toast(m.msg); }
  if (m.t !== "state" || m.game !== "questions") return;
  const prev = S;
  S = m;
  stateAt = performance.now();
  if (S.phase !== lastPhase) enterPhase(S.phase, prev);
  if (S.log.length > lastLog && prev) snd.tick();
  if (S.phase === "answer" && S.pending && S.pending.guess && !(prev && prev.pending)) { snd.drumroll(1.6); snd.buzz([40, 30, 40, 30, 120]); }
  lastLog = S.log.length;
  const turnKey = `${S.round}:${S.phase}:${S.log.length}:${S.turn}`;
  if (turnKey !== lastTurnKey && (myTurn() || (S.phase === "answer" && answering()) || (S.phase === "secret" && answering()))) {
    snd.yourTurn(); snd.buzz([60, 40, 60]);
  }
  lastTurnKey = turnKey;
  render();
}
function enterPhase(phase, prev) {
  lastPhase = phase;
  if (phase === "reveal" && prev) {
    const r = S.result;
    if (r.by === S.you) { snd.fanfare(); snd.buzz([80, 50, 160]); } else snd.points(r.winner ? 2 : 0);
  }
  if (phase === "final") snd.fanfare();
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
const avatar = (p, cls = "") => `<span class="av ${cls}" style="--c:${esc(p?.color || "#e4572e")}">${esc(initial(p?.name))}</span>`;

function render() {
  if (!S) return;
  $("codeChip").textContent = S.code;
  if (S.phase === "lobby") return renderLobby();
  if (S.phase === "final") return renderFinal();
  show("game");
  renderPeople();
  renderCard();
  renderNotebook();
}

/* ---------- the lobby ---------- */
let countdownTimer = null;
function renderLobby() {
  show("lobby");
  $("lobbyCode").textContent = S.code;
  $("roomLine").textContent = S.quick ? "Quick game · room code" : "Room code";
  $("roomHint").textContent = S.quick ? "Share the code to bring friends." : "Everyone opens 21 Questions and types the code.";
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

/* ---------- everyone, along the top ---------- */
function renderPeople() {
  $("people").innerHTML = S.players.map((p) => {
    const tag = p.id === S.answerer ? "answering" : p.id === S.asker ? "asking" : S.guessed.includes(p.id) ? "guessed" : "";
    return `<div class="person${tag ? " " + tag : ""}${p.id === S.you ? " me" : ""}${p.online ? "" : " away"}" style="--c:${esc(p.color || "#e4572e")}">` +
      `${avatar(p)}<span class="pn">${esc(p.id === S.you ? "You" : p.name)}</span>` +
      `<span class="pt">${tag ? `<em>${tag}</em>` : ""}${p.score ? `<b>${p.score}</b>` : ""}</span></div>`;
  }).join("");
}

/* ---------- the card: what you can do right now ---------- */
let cardKey = "";
function renderCard() {
  if (!myTurn()) finalMode = false;
  const key = [S.phase, S.round, S.asker, S.log.length, !!S.pending, S.secret, finalMode].join("|");
  if (key === cardKey) return;
  cardKey = key;
  const c = $("card");
  const used = S.log.length;
  const hint = S.hint ? `<p class="hint">It's ${esc(S.hint)}</p>` : "";
  const mySecret = answering() && S.secret && S.phase !== "reveal" ? `<p class="mysecret">Your secret: <b>${esc(S.secret)}</b></p>` : "";
  let h = "";

  if (S.phase === "secret") {
    if (answering()) {
      h = `<p class="kicker">Round ${S.round}</p><h2 class="big">You're answering</h2>` +
        `<form class="stack" id="secretForm"><input id="secretInput" maxlength="40" placeholder="Your secret" autocomplete="off" spellcheck="false" />` +
        `<input id="hintInput" class="small" maxlength="30" placeholder="Hint, optional (e.g. an animal)" autocomplete="off" />` +
        `<button class="btn big" type="submit">Lock it in</button></form>`;
    } else {
      h = `<p class="kicker">Round ${S.round}</p><h2 class="big">${esc(nameOf(S.answerer))} is thinking of something</h2>`;
    }
  } else if (S.phase === "ask") {
    h = `<p class="kicker">Question ${used + 1} of ${R.QUESTIONS}</p>` + hint + mySecret;
    const spent = S.guessed.includes(S.you);
    if (myTurn() && finalMode) {
      h = `<p class="fg-banner">Final guess</p>` + hint +
        `<h2 class="big">You only get one</h2><p class="sub">Right, you win the round. Wrong, no more guessing for you.</p>` +
        `<form class="stack" id="finalForm"><input id="finalInput" maxlength="120" placeholder="It's…" autocomplete="off" />` +
        `<div class="two"><button class="btn big fg" type="submit">Lock it in</button><button class="btn big alt" type="button" id="backBtn">Back</button></div></form>`;
    } else if (myTurn()) {
      h += `<h2 class="big">Your turn</h2>` +
        `<form class="stack" id="askForm"><input id="askInput" maxlength="120" placeholder="Is it…?" autocomplete="off" />` +
        `<div class="two"><button class="btn big" type="submit">Ask</button>` +
        (spent ? "" : `<button class="btn big fg-open" type="button" id="finalBtn">Final guess</button>`) + `</div></form>` +
        (spent ? `<p class="sub">You've used your final guess</p>` : "");
    } else {
      h += `<h2 class="big">${esc(nameOf(S.asker))}'s turn</h2>`;
    }
  } else if (S.phase === "answer") {
    const q = S.pending;
    h = (q.guess ? `<p class="fg-banner">Final guess</p><p class="kicker light">${esc(nameOf(q.by))}</p>` : `<p class="kicker">Question ${used + 1} of ${R.QUESTIONS} · ${esc(nameOf(q.by))}</p>`) + mySecret +
      `<p class="asked${q.guess ? " guess" : ""}">${esc(q.guess ? asGuess(q.text) : q.text)}</p>`;
    if (answering()) {
      h += q.guess
        ? `<div class="answers two"><button class="ans right" data-a="right">Right</button><button class="ans wrong" data-a="wrong">Wrong</button></div>`
        : `<div class="answers">${R.ANSWERS.map((a) => `<button class="ans ${a}" data-a="${a}">${R.LABEL[a]}</button>`).join("")}</div>` +
          `<form class="custom" id="customForm"><input id="customInput" maxlength="${R.CUSTOM_MAX}" placeholder="Or say something else…" autocomplete="off" /><button class="btn" type="submit">Send</button></form>`;
    } else {
      h += `<p class="wait">${q.guess ? "Is it right…?" : `${esc(nameOf(S.answerer))} is answering…`}</p>`;
    }
  } else if (S.phase === "reveal") {
    const r = S.result;
    const head = r.why === "guessed" ? `${esc(nameOf(r.by))} got it` : r.why === "stumped" || r.why === "outguessed" ? `${esc(nameOf(r.by))} stumped everyone` : "Round's off";
    const sub = r.why === "guessed" ? `final guess, question ${r.used}` : r.why === "stumped" ? `all ${R.QUESTIONS} questions used` : r.why === "outguessed" ? "every final guess was wrong" : r.why === "left" ? "the answerer left" : "";
    h = `<p class="kicker">Round ${S.round}</p><p class="itwas">It was</p><p class="secret">${esc(r.secret || "?")}</p>` +
      `<h2 class="big">${head}</h2>${sub ? `<p class="sub">${sub}</p>` : ""}` +
      (isHost() || S.quick
        ? `<div class="two"><button class="btn big" id="nextBtn">Next round</button>${isHost() && !S.quick ? `<button class="btn big alt" id="endBtn">End game</button>` : ""}</div>`
        : `<p class="sub">Waiting for ${esc(nameOf(S.host))}…</p>`);
  }
  c.innerHTML = `<div class="timer"><i id="timerFill"></i></div>` + h;
  c.dataset.phase = S.phase;
  c.classList.toggle("final", (S.phase === "answer" && !!S.pending?.guess) || (myTurn() && finalMode));
  const focus = $("secretInput") || $("finalInput") || $("askInput");
  if (focus) focus.focus();
  tickTimer();
}

// The time left for whoever's up, as a bar across the top of the card.
const TOTALS = { secret: R.SECRET_SECS, ask: R.ASK_SECS, answer: R.ANSWER_SECS };
function tickTimer() {
  const f = $("timerFill");
  if (!f || !S) return;
  const total = TOTALS[S.phase];
  if (!total) { f.parentElement.hidden = true; return; }
  const left = Math.max(0, S.msLeft - (performance.now() - stateAt));
  f.style.transform = `scaleX(${(left / (total * 1000)).toFixed(4)})`;
  f.classList.toggle("low", left < 8000);
}
setInterval(tickTimer, 100);

/* ---------- the notebook: every question, numbered to 21 ---------- */
function renderNotebook() {
  const rows = [];
  for (let i = 0; i < R.QUESTIONS; i++) {
    const q = S.log[i];
    const now = !q && i === S.log.length && S.pending;
    if (q) {
      rows.push(`<li class="${q.guess ? "g" : ""}"><span class="n">${q.n}</span><span class="q">${q.guess ? `<i class="fg-tag">Final</i>` : ""}${esc(q.guess ? asGuess(q.text) : q.text)}</span>` +
        `<span class="by">${esc(nameOf(q.by))}</span><span class="stamp ${q.answer}"${q.said ? ` title="${esc(q.said)}"` : ""}>${esc(q.said || R.LABEL[q.answer])}</span></li>`);
    } else if (now) {
      rows.push(`<li class="now${S.pending.guess ? " g" : ""}"><span class="n">${i + 1}</span><span class="q">${S.pending.guess ? `<i class="fg-tag">Final</i>` : ""}${esc(S.pending.guess ? asGuess(S.pending.text) : S.pending.text)}</span><span class="by">${esc(nameOf(S.pending.by))}</span><span class="stamp wait">…</span></li>`);
    } else {
      rows.push(`<li class="empty"><span class="n">${i + 1}</span></li>`);
    }
  }
  const nb = $("notebook");
  nb.innerHTML = `<ol>${rows.join("")}</ol>`;
  // keep the latest question in view
  const last = nb.querySelector("li.now") || [...nb.querySelectorAll("li:not(.empty)")].pop();
  if (last && nb.scrollHeight > nb.clientHeight) last.scrollIntoView({ block: "nearest" });
}

/* ---------- the end ---------- */
function renderFinal() {
  show("final");
  const ranked = S.players.slice().sort((a, b) => b.score - a.score);
  const st = (id) => S.stats.find((s) => s.id === id) || {};
  const best = (key) => { let b = null; for (const s of S.stats) if (s[key] && (!b || s[key] > b[key])) b = s; return b; };
  const awards = [];
  const g = best("guessed");
  if (g) awards.push(["Best guesser", nameOf(g.id), `${g.guessed} right`]);
  const sp = best("stumped");
  if (sp) awards.push(["Toughest secret", nameOf(sp.id), `stumped you ${sp.stumped} time${sp.stumped === 1 ? "" : "s"}`]);
  const quick = S.history.filter((h) => h.winner === "asker").sort((a, b) => a.used - b.used)[0];
  if (quick) awards.push(["Fastest guess", quick.byName || "someone", `${quick.secret} in ${quick.used}`]);
  $("final").innerHTML =
    `<div class="final"><p class="kicker">Final standings</p><h1 class="final-head">${esc(ranked[0]?.name || "")} wins</h1>` +
    (awards.length ? `<div class="awards">${awards.map(([t, who, v]) => `<div class="award"><span class="at">${t}</span><b>${esc(who)}</b><small>${esc(v)}</small></div>`).join("")}</div>` : "") +
    `<div class="final-cols"><div><h3>Everyone</h3><ol class="standings">${ranked.map((p) => `<li>${avatar(p)}<span>${esc(p.name)}</span><small>${st(p.id).answered || 0}× answering</small><b>${p.score}</b></li>`).join("")}</ol></div>` +
    `<div><h3>Every round</h3><ol class="rounds">${S.history.map((h) => `<li><b>${esc(h.secret || "?")}</b><span>${esc(h.answererName)}'s secret</span><em>${h.winner === "asker" ? `${esc(h.byName)} got it in ${h.used}` : h.winner === "answerer" ? "nobody got it" : "round off"}</em></li>`).join("")}</ol></div></div>` +
    `<div class="two center">${isHost() ? `<button class="btn big" id="againBtn">Play again</button>` : `<p class="sub">Waiting for ${esc(nameOf(S.host))}…</p>`}<button class="btn big alt" id="leaveFinalBtn">Leave</button></div></div>`;
}

/* ========================================================================
   Taps
   ======================================================================== */
document.addEventListener("click", (e) => {
  if (!e.target.closest("#exitBtn") && exitArmed) armExit(false);
  const b = e.target.closest("button");
  if (!b) return;
  if (b.dataset.a) { snd.lock(); snd.buzz(30); return send({ t: "answer", a: b.dataset.a }); }
  switch (b.id) {
    case "finalBtn": finalMode = true; snd.swoosh(0.5); return renderCard();
    case "backBtn": finalMode = false; return renderCard();
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
document.addEventListener("submit", (e) => {
  e.preventDefault();
  const id = e.target.id;
  if (id === "secretForm") {
    const text = $("secretInput").value.trim();
    if (text) send({ t: "secret", text, hint: $("hintInput").value.trim() });
  }
  if (id === "customForm") {
    const text = $("customInput").value.trim();
    if (text) { snd.lock(); send({ t: "answer", a: "custom", text }); }
  }
  if (id === "askForm") {
    const text = $("askInput").value.trim();
    if (text) { snd.lock(); send({ t: "ask", text, guess: false }); }
  }
  if (id === "finalForm") {
    const text = $("finalInput").value.trim();
    if (text) { snd.lock(); finalMode = false; send({ t: "ask", text, guess: true }); }
  }
  if (id === "joinForm") {
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
