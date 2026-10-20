// Stop the Clock - the page. The server (../clock-server.js) runs the turns;
// this draws the stopwatch and times YOUR turn on this device, between your
// Start and Stop taps, so the connection can't cost you anything.
//
// The clock never shows digits while it runs - not to you, not to anyone
// watching. When it stops, the time counts up to where it landed.
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
const myColor = () => (window.KmuftiYou ? window.KmuftiYou.color() : "#22e06b");

let ws = null, ready = false, outbox = [], retry = 0;
function connect() {
  ws = new WebSocket(socketURL());
  ws.addEventListener("open", () => {
    ready = true; retry = 0;
    send({ t: "hello", game: "clock", id: identity(), name: myName(), color: myColor() });
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
let stateAt = 0, lastPhase = null, lastShown = "";
let t0 = 0;                      // when I tapped Start, on this device
const playerOf = (id) => S.players.find((p) => p.id === id);
const nameOf = (id) => (id === S.you ? "You" : playerOf(id)?.name || "someone");
const isHost = () => !!S && S.host === S.you;
const myTurn = () => !!S && S.current === S.you && (S.phase === "ready" || S.phase === "running");

function onMessage(m) {
  if (m.t === "welcome") return;
  if (m.t === "idle") { S = null; show("home"); setStatus(""); return; }
  if (m.t === "error") { snd.side(false); return toast(m.msg); }
  if (m.t !== "state" || m.game !== "clock") return;
  const prev = S;
  S = m;
  stateAt = performance.now();
  if (S.phase !== lastPhase || (prev && prev.turn !== S.turn)) enterPhase(S.phase, prev);
  render();
}
function enterPhase(phase, prev) {
  lastPhase = phase;
  if (phase === "intro") { snd.swoosh(0.8); snd.buzz(40); }
  if (phase === "ready" && S.current === S.you) { snd.yourTurn(); snd.buzz([60, 40, 60]); }
  if (phase === "running") snd.tick();
  if (phase === "standings" || phase === "final") snd.fanfare();
  void prev;
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
const avatar = (p, cls = "") => `<span class="av ${cls}" style="--c:${esc(p?.color || "#22e06b")}">${esc(initial(p?.name))}</span>`;

function render() {
  if (!S) return;
  $("codeChip").textContent = S.code;
  if (S.phase === "lobby") return renderLobby();
  if (S.phase === "final") return renderFinal();
  show("game");
  renderGame();
}

/* ---------- the lobby ---------- */
let countdownTimer = null;
function renderLobby() {
  show("lobby");
  $("lobbyCode").textContent = S.code;
  $("roomLine").textContent = S.quick ? "Quick game · room code" : "Room code";
  $("roomHint").textContent = S.quick ? "Share the code to bring friends." : "Everyone opens Stop the Clock and types the code.";
  $("lobbyPlayers").innerHTML = S.players.map((p) =>
    `<div class="mate${p.online ? "" : " away"}">${avatar(p)}<span class="mn">${esc(p.name)}</span>` +
    `<small>${[p.bot ? "bot" : "", p.id === S.you ? "you" : "", p.id === S.host && !S.quick ? "host" : "", p.online ? "" : "away"].filter(Boolean).join(" · ")}</small></div>`).join("");
  const host = isHost() && !S.quick;
  $("startBtn").hidden = !host;
  $("botRow").hidden = !(S.dev && isHost());
  clearInterval(countdownTimer);
  if (S.quick && S.startsIn) {
    const ends = Date.now() + S.startsIn;
    const tickDown = () => setStatus(`Starting in ${Math.max(1, Math.ceil((ends - Date.now()) / 1000))}…`);
    tickDown();
    countdownTimer = setInterval(tickDown, 250);
  } else setStatus(host || S.quick ? "" : `Waiting for ${nameOf(S.host)} to start.`);
}

/* ---------- the game ---------- */
// The unlit segments behind the digits, like a real LED clock: every lit
// digit sits on top of a dim "8".
new MutationObserver(() => { $("ghost").textContent = $("digits").textContent.replace(/[0-9-]/g, "8"); })
  .observe(document.getElementById("digits"), { childList: true, characterData: true, subtree: true });

let countUp = null;              // the result's time, counting up
function renderGame() {
  const tgt = R.fmt(S.target * 1000);
  $("roundLine").textContent = `Round ${S.round}/${S.rounds}`;
  $("targetLine").innerHTML = `Stop at <b>${tgt}s</b>`;
  const w = $("watch"), d = $("digits"), u = $("under"), act = $("act");
  const who = S.current ? nameOf(S.current) : "";
  const key = `${S.round}:${S.phase}:${S.turn}`;
  if (w.dataset.key !== key) { w.dataset.key = key; w.className = "watch " + S.phase; }   // keeps "perfect" etc. once set

  if (S.phase === "intro") {
    d.textContent = tgt;
    u.textContent = "";
    act.innerHTML = "";
  } else if (S.phase === "ready") {
    d.textContent = "0.00";
    u.textContent = myTurn() ? "Your turn" : `${who}'s turn`;
    act.innerHTML = myTurn() ? `<button class="go" id="goBtn">Start<small>space</small></button>` : "";
  } else if (S.phase === "running") {
    d.textContent = "--.--";
    u.textContent = myTurn() ? "" : `${who}…`;
    act.innerHTML = myTurn() ? `<button class="go stop" id="stopBtn">Stop<small>space</small></button>` : "";
  } else if (S.phase === "result") {
    const l = S.last;
    act.innerHTML = "";
    if (lastShown !== key) {
      lastShown = key;
      if (!l || l.ms === null) { d.textContent = "-.--"; u.textContent = `${nameOf(l ? l.id : S.current)} skipped`; }
      else showStop(l);
    }
  } else if (S.phase === "standings") {
    d.textContent = tgt;
    const win = roundWinner();
    u.innerHTML = win ? `<span class="wl">Round winner</span><span class="win${win.perfect ? " pf" : ""}">${esc(nameOf(win.id))}</span>` : "";
    act.innerHTML = `<div class="ranking">${rankingHTML(S.times)}</div>` +
      (isHost() || S.quick ? `<button class="btn big" id="nextBtn">Next round</button>` : "");
  }
  if (S.phase !== "result") { cancelAnimationFrame(countUp); lastShown = ""; }
  renderLineup();
}

// The stop, counting up from zero to where it landed, then how far off.
function showStop(l) {
  const d = $("digits"), u = $("under"), w = $("watch");
  const dur = 1500, start = performance.now();
  u.textContent = nameOf(l.id);
  cancelAnimationFrame(countUp);
  const step = (now) => {
    const k = Math.min(1, (now - start) / dur);
    const eased = 1 - (1 - k) ** 3;
    d.textContent = R.fmt(l.ms * eased);
    if (k < 1) { countUp = requestAnimationFrame(step); return; }
    d.textContent = R.fmt(l.ms);
    w.classList.add(l.perfect ? "perfect" : Math.abs(l.off) <= 150 ? "close" : "far");
    u.innerHTML = `${esc(nameOf(l.id))} · <b class="${l.perfect ? "pf" : ""}">${l.perfect ? "PERFECT" : R.fmtOff(l.off)}</b>`;
    if (l.perfect) { snd.fanfare(); snd.buzz([100, 60, 100, 60, 240]); } else snd.points(Math.abs(l.off) <= 150 ? 3 : 1);
  };
  countUp = requestAnimationFrame(step);
}

// This round's times, closest first.
function rankedTimes(times) {
  const target = S.target * 1000;
  return Object.entries(times).sort((a, b) =>
    (a[1] === null) - (b[1] === null) || Math.abs(a[1] - target) - Math.abs(b[1] - target));
}
function roundWinner() {
  const [top] = rankedTimes(S.times || {});
  if (!top || top[1] === null) return null;
  return { id: top[0], perfect: Math.abs(top[1] - S.target * 1000) <= R.PERFECT_MS };
}
function rankingHTML(times) {
  const target = S.target * 1000;
  const rows = rankedTimes(times);
  return `<ol>${rows.map(([id, ms], i) => {
    const p = playerOf(id);
    const off = ms === null ? null : ms - target;
    const cls = [i === 0 && ms !== null ? "win" : "", off !== null && Math.abs(off) <= R.PERFECT_MS ? "pf" : ""].join(" ").trim();
    return `<li class="${cls}"><span class="rk">${ms === null ? "–" : i + 1}</span>${avatar(p)}<span class="nm">${esc(nameOf(id))}</span>` +
      `<span class="tm">${ms === null ? "skipped" : R.fmt(ms)}</span><span class="of">${off === null ? "" : Math.abs(off) <= R.PERFECT_MS ? "PERFECT" : R.fmtOff(off)}</span></li>`;
  }).join("")}</ol>`;
}

// Everyone in this round's order: done (with their time), up now, or waiting.
function renderLineup() {
  $("lineup").innerHTML = S.order.map((id, i) => {
    const p = playerOf(id);
    const done = id in S.times;
    const now = i === S.turn && (S.phase === "ready" || S.phase === "running");
    const ms = S.times[id];
    const off = done && ms !== null ? ms - S.target * 1000 : null;
    return `<li class="${now ? "now" : done ? "done" : ""}" style="--c:${esc(p?.color || "#22e06b")}">${avatar(p)}<span class="nm">${esc(nameOf(id))}</span>` +
      `<span class="tm">${done ? (ms === null ? "skipped" : (S.phase === "result" && i === S.turn - 1 ? "…" : R.fmtOff(off))) : ""}</span>` +
      `<b class="sc">${p ? p.score : 0}</b></li>`;
  }).join("");
}

/* ---------- the end ---------- */
function renderFinal() {
  show("final");
  const ranked = S.players.slice().sort((a, b) => b.score - a.score);
  const awards = [];
  const sharp = S.players.filter((p) => p.best !== null).sort((a, b) => Math.abs(a.best) - Math.abs(b.best))[0];
  if (sharp) awards.push(["Closest stop", nameOf(sharp.id), Math.abs(sharp.best) <= R.PERFECT_MS ? "perfect" : `${R.fmtOff(sharp.best)} off`]);
  const pf = S.players.filter((p) => p.perfects).sort((a, b) => b.perfects - a.perfects)[0];
  if (pf) awards.push(["Most perfects", nameOf(pf.id), `${pf.perfects} perfect stop${pf.perfects === 1 ? "" : "s"}`]);
  $("final").innerHTML =
    `<div class="final"><p class="round">Final standings</p><h1 class="final-head">${esc(ranked[0]?.name || "")} wins</h1>` +
    (awards.length ? `<div class="awards">${awards.map(([t, who, v]) => `<div class="award"><span class="at">${t}</span><b>${esc(who)}</b><small>${esc(v)}</small></div>`).join("")}</div>` : "") +
    `<ol class="standings">${ranked.map((p, i) => `<li><span class="rk">${i + 1}</span>${avatar(p)}<span class="nm">${esc(p.name)}</span><b>${p.score}</b></li>`).join("")}</ol>` +
    `<h3>Every round</h3><ol class="rounds">${S.history.map((h) => {
      const t = h.target * 1000;
      const best = Object.entries(h.times).filter(([, ms]) => ms !== null).sort((a, b) => Math.abs(a[1] - t) - Math.abs(b[1] - t))[0];
      return `<li><b>${R.fmt(t)}s</b><span>${best ? `${esc(h.names[best[0]] || "someone")} · ${Math.abs(best[1] - t) <= R.PERFECT_MS ? "PERFECT" : R.fmtOff(best[1] - t)}` : "nobody stopped"}</span></li>`;
    }).join("")}</ol>` +
    `<div class="row">${isHost() ? `<button class="btn big" id="againBtn">Play again</button>` : `<p class="wait">Waiting for ${esc(nameOf(S.host))}…</p>`}<button class="btn big alt" id="leaveFinalBtn">Leave</button></div></div>`;
}

/* ========================================================================
   Taps (and the spacebar, on your turn)
   ======================================================================== */
function goNow() {
  if (!S || S.phase !== "ready" || S.current !== S.you) return;
  t0 = performance.now();
  snd.lock(); snd.buzz(30);
  send({ t: "go" });
}
function stopNow() {
  if (!S || S.phase !== "running" || S.current !== S.you) return;
  const ms = t0 ? Math.round(performance.now() - t0) : null;   // a reload mid-run: the server's own clock
  t0 = 0;
  snd.lock(); snd.buzz(60);
  send({ t: "stop", ms });
}
document.addEventListener("keydown", (e) => {
  if (e.code !== "Space" && e.code !== "Enter") return;
  if (document.activeElement && ["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) return;
  if (!myTurn()) return;
  e.preventDefault();
  if (e.repeat) return;
  if (S.phase === "ready") goNow(); else stopNow();
});
// a press, not a release, so the stop lands when your finger does
document.addEventListener("pointerdown", (e) => {
  if (e.target.closest("#goBtn")) { e.preventDefault(); goNow(); }
  if (e.target.closest("#stopBtn")) { e.preventDefault(); stopNow(); }
});
document.addEventListener("click", (e) => {
  if (!e.target.closest("#exitBtn") && exitArmed) armExit(false);
  const b = e.target.closest("button");
  if (!b) return;
  switch (b.id) {
    case "nextBtn": return send({ t: "next" });
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
