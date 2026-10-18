// Drafft - the page. The server (../drafft-server.js) runs the draft; this
// draws it and turns taps into bids.
//
// The game screen is you on the left, them on the right, and the stage in
// the middle: the category reel, then each item as it comes up, with the
// bid controls under it when it's your turn.
import * as R from "./rules.js?v=4";
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
const myColor = () => (window.KmuftiYou ? window.KmuftiYou.color() : "#ff5a1f");

let ws = null, ready = false, outbox = [], retry = 0;
function connect() {
  ws = new WebSocket(socketURL());
  ws.addEventListener("open", () => {
    ready = true; retry = 0;
    send({ t: "hello", game: "drafft", id: identity(), name: myName(), color: myColor() });
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
let lastPhase = null, lastTurn = "";
let amt = 1;                     // the bid on my stepper
const me = () => S && S.players.find((p) => p.id === S.you);
const them = () => S && S.players.find((p) => p.id !== S.you);
const playerOf = (id) => S.players.find((p) => p.id === id);
const who = (id) => (id === S.you ? "You" : playerOf(id)?.name || "someone");
const isHost = () => !!S && S.host === S.you;
const money = (n) => `$${n}`;
const myTurn = () => !!S && !!S.lot && S.lot.turn === S.you && (S.phase === "open" || S.phase === "bid");
const minBid = () => (S.lot ? S.lot.high + 1 : 1);

function onMessage(m) {
  if (m.t === "welcome") return;
  if (m.t === "idle") { S = null; show("home"); setStatus(""); return; }
  if (m.t === "error") { snd.side(false); return toast(m.msg); }
  if (m.t !== "state" || m.game !== "drafft") return;
  const prev = S;
  S = m;
  if (S.phase !== lastPhase) enterPhase(S.phase, prev);
  // my turn just came round: start the stepper at the lowest legal bid
  const turnKey = myTurn() ? `${S.log.length}:${S.lot.bids.length}` : "";
  if (turnKey && turnKey !== lastTurn) {
    amt = minBid();
    if (prev && prev.lot && prev.lot.bids.length < S.lot.bids.length) snd.tick();
    snd.yourTurn(); snd.buzz([50, 30, 50]);
  }
  lastTurn = turnKey;
  render();
}

function enterPhase(phase, prev) {
  lastPhase = phase;
  if (phase === "spin") spinStarted = false;
  if (phase === "open") snd.swoosh(0.5);
  if (phase === "landed") snd.buzz(40);
  if (phase === "sold" && S.sold) {
    if (S.sold.to === S.you) { snd.points(4); snd.buzz([80, 50, 160]); } else snd.points(1);
  }
  if (phase === "done" && prev) snd.fanfare();
}

/* ========================================================================
   Drawing
   ======================================================================== */
function show(id) {
  for (const s of ["home", "lobby", "game", "done"]) $(s).hidden = s !== id;
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
const avatar = (p, cls = "") => `<span class="av ${cls}" style="--c:${esc(p?.color || "#ff5a1f")}">${esc(initial(p?.name))}</span>`;

function render() {
  if (!S) return;
  $("codeChip").textContent = S.code;
  if (S.phase === "lobby") return renderLobby();
  if (S.phase === "done") return renderDone();
  show("game");
  $("sideMe").innerHTML = me() ? sideCard(me()) : "";
  $("sideThem").innerHTML = them() ? sideCard(them()) : "";
  renderStage();
}

/* ---------- the lobby ---------- */
let countdownTimer = null;
function renderLobby() {
  show("lobby");
  $("lobbyCode").textContent = S.code;
  $("roomLine").textContent = S.quick ? "Quick game · room code" : "Room code";
  const two = S.players.length === R.PLAYERS;
  $("roomHint").textContent = two ? "" : S.quick
    ? "Waiting for someone to tap Quick game. Or send a friend the code."
    : "Send the code to whoever you're playing. They open Drafft and type it in.";
  const seat = (p) => p
    ? `<div class="seat${p.online ? "" : " away"}">${avatar(p, "big")}<b>${esc(p.id === S.you ? "You" : p.name)}</b><small>${p.online ? "" : "away"}</small></div>`
    : `<div class="seat empty"><span class="av big ghost">?</span><b>Waiting…</b></div>`;
  $("lobbyPlayers").innerHTML = seat(me()) + `<span class="vs">vs</span>` + seat(them());
  const host = isHost() && !S.quick;
  $("startBtn").hidden = !host;
  $("startBtn").disabled = !two;
  clearInterval(countdownTimer);
  if (S.quick && S.startsIn) {
    const ends = Date.now() + S.startsIn;
    const tickDown = () => setStatus(`Starting in ${Math.max(1, Math.ceil((ends - Date.now()) / 1000))}…`);
    tickDown();
    countdownTimer = setInterval(tickDown, 250);
  } else if (!two) setStatus("");
  else setStatus(host ? "" : S.quick ? "" : `Waiting for ${who(S.host)} to start.`);
}

/* ---------- a player's side: money and picks ---------- */
function sideCard(p) {
  let picks = p.roster.map((x) => `<li><span>${esc(x.item)}</span><b>${money(x.price)}</b></li>`).join("");
  for (let i = p.roster.length; i < R.PICKS; i++) picks += `<li class="empty"><span>${i + 1}</span></li>`;
  const turn = S.lot && S.lot.turn === p.id && (S.phase === "open" || S.phase === "bid");
  return `<div class="player${p.id === S.you ? " me" : ""}${turn ? " turn" : ""}${p.online ? "" : " away"}" style="--c:${esc(p.color || "#ff5a1f")}">` +
    `<div class="ph">${avatar(p)}<span class="pn">${esc(p.id === S.you ? "You" : p.name)}</span></div>` +
    `<p class="pm">${money(p.money)}<small>left</small></p>` +
    `<ol>${picks}</ol></div>`;
}

/* ---------- the stage ---------- */
let stageKey = "", spinStarted = false, voteAt = 0;
// the vote's countdown bar
setInterval(() => {
  const f = document.getElementById("voteFill");
  if (!f || !S || S.phase !== "landed") return;
  const left = Math.max(0, S.voteLeft - (performance.now() - voteAt));
  f.style.transform = `scaleX(${(left / R.VOTE_MS).toFixed(4)})`;
}, 80);
function renderStage() {
  const key = [S.phase, S.cat?.id, S.log.length, S.lot?.bids.length, myTurn(), JSON.stringify(S.votes)].join("|");
  if (key === stageKey) return updateStepper();
  stageKey = key;
  const st = $("stage");
  const cat = S.cat ? `<p class="cat">${esc(S.cat.emoji)} ${esc(S.cat.name)}</p>` : "";

  if (S.phase === "spin") {
    st.className = "stage spin";
    st.innerHTML = `<p class="kicker">The category is…</p><div class="reel"><div class="strip" id="strip"></div></div>`;
    return spinReel();
  }

  if (S.phase === "landed") {
    const mine = S.votes[S.you], theirs = them() && S.votes[them().id];
    st.className = "stage landed";
    st.innerHTML = `<p class="kicker">The category is</p>` +
      `<h2 class="item cat-pick">${esc(S.cat.emoji)} ${esc(S.cat.name)}</h2>` +
      `<p class="ask">Keep it, or spin again? It only respins if you both want to.</p>` +
      `<div class="acts">` +
      `<button class="btn big" id="keepBtn">Keep it</button>` +
      `<button class="btn big alt${mine === "respin" ? " on" : ""}" id="respinBtn" ${mine === "respin" ? "disabled" : ""}>${mine === "respin" ? "Voted to respin" : "🔁 Respin"}</button>` +
      `</div>` +
      `<p class="vote-note">${theirs === "respin" ? `${esc(them().name)} wants to respin 👀` : mine === "respin" ? `Waiting on ${esc(them()?.name || "them")}…` : ""}</p>` +
      `<div class="clock"><i id="voteFill"></i></div>`;
    voteAt = performance.now();
    fitItem();
    return;
  }

  if (S.phase === "open" || S.phase === "bid") {
    const lot = S.lot;
    const last = lot.bids[lot.bids.length - 1];
    st.className = "stage lot" + (myTurn() ? " mine" : "");
    let html = cat + `<p class="kicker">Pick ${S.log.length + 1} of ${R.PICKS * 2}</p>` +
      `<h2 class="item" id="itemName">${esc(lot.item)}</h2>`;
    if (last) {
      html += `<p class="high">${avatar(playerOf(last.id), "sm")} <span>${esc(who(last.id))} ${last.id === S.you ? "are" : "is"} at</span> <b>${money(last.amount)}</b></p>`;
    } else html += `<p class="high quiet">No bids yet</p>`;
    if (myTurn()) {
      const opening = S.phase === "open";
      html += `<p class="ask">${opening ? "You open the bidding. How much?" : `Raise, or let ${esc(who(last.id))} have it?`}</p>` +
        `<div class="stepper"><button class="step" data-step="-1" aria-label="Less">−</button><span class="amt" id="amt"></span><button class="step" data-step="1" aria-label="More">+</button></div>` +
        `<p class="max" id="maxNote"></p>` +
        `<div class="acts">` +
        `<button class="btn big" id="bidBtn"></button>` +
        (opening ? "" : `<button class="btn big alt" id="passBtn">Let ${esc(who(last.id))} have it</button>`) +
        `</div>`;
    } else {
      html += `<p class="wait">${S.phase === "open" ? `${esc(who(lot.turn))} is opening the bidding…` : `${esc(who(lot.turn))} is deciding: raise, or let you have it…`}</p>`;
    }
    if (lot.bids.length > 1) {
      html += `<ol class="trail">${lot.bids.map((b) => `<li>${esc(who(b.id))} <b>${money(b.amount)}</b></li>`).join("")}</ol>`;
    }
    st.innerHTML = html;
    fitItem();
    return updateStepper();
  }

  if (S.phase === "sold" && S.sold) {
    st.className = "stage sold" + (S.sold.to === S.you ? " mine" : "");
    st.innerHTML = cat +
      `<p class="stamp">Sold!</p>` +
      `<h2 class="item">${esc(S.sold.item)}</h2>` +
      `<p class="sold-to">${avatar(playerOf(S.sold.to), "sm")} <b>${esc(who(S.sold.to))}</b> for <b class="price">${money(S.sold.price)}</b></p>`;
    fitItem();
  }
}

function fitItem() {
  const el = $("stage").querySelector(".item");
  if (!el) return;
  const n = el.textContent.length;
  el.style.fontSize = n > 24 ? "clamp(26px, 5.5vw, 44px)" : n > 14 ? "clamp(32px, 7vw, 58px)" : "";
}

function updateStepper() {
  if (!myTurn() || !$("amt")) return;
  const p = me(), lo = minBid(), hi = p.max;
  amt = Math.min(hi, Math.max(lo, amt));
  $("amt").textContent = money(amt);
  $("bidBtn").textContent = S.phase === "open" ? `Open at ${money(amt)}` : `Raise to ${money(amt)}`;
  $("bidBtn").disabled = hi < lo;
  for (const b of document.querySelectorAll(".step")) b.disabled = Number(b.dataset.step) < 0 ? amt <= lo : amt >= hi;
  $("maxNote").textContent = hi < lo ? `You don't have enough to go higher.` : hi === p.money ? `You can go up to ${money(hi)} - all in.` : `You can go up to ${money(hi)}.`;
}

// The reel: every category streams past and it lands on the one the server
// picked. Built once per spin.
function spinReel() {
  if (spinStarted) return;
  spinStarted = true;
  const strip = $("strip");
  // ~40 random categories stream past, then the real one
  const names = S.cats.map((c) => `${c.emoji} ${c.name}`).filter((n) => n !== `${S.cat.emoji} ${S.cat.name}`);
  const rows = names.sort(() => Math.random() - 0.5).slice(0, 40);
  rows.push(`${S.cat.emoji} ${S.cat.name}`);
  strip.innerHTML = rows.map((n) => `<div class="cell">${esc(n)}</div>`).join("");
  const cell = strip.firstElementChild.getBoundingClientRect().height;
  const dist = (rows.length - 1) * cell;
  const secs = (R.SPIN_MS - 1500) / 1000;
  strip.style.transform = "translateY(0)";
  requestAnimationFrame(() => requestAnimationFrame(() => {
    strip.style.transition = `transform ${secs}s cubic-bezier(.12, .7, .18, 1)`;
    strip.style.transform = `translateY(${-dist}px)`;
  }));
  snd.spin(secs);
  setTimeout(() => { strip.lastElementChild.classList.add("hit"); snd.lock(); snd.buzz(60); }, secs * 1000);
}

/* ---------- the end ---------- */
function renderDone() {
  show("done");
  const ps = [me(), them()].filter(Boolean);
  const log = S.log;
  const facts = [];
  if (log.length) {
    const top = log.reduce((a, x) => (x.price > a.price ? x : a));
    facts.push(["Priciest pick", top.item, `${who(top.to)} paid ${money(top.price)}`]);
    const war = log.reduce((a, x) => (x.bids > a.bids ? x : a));
    if (war.bids > 2) facts.push(["Biggest bidding war", war.item, `${war.bids} bids, went for ${money(war.price)}`]);
    const cheap = log.filter((x) => x.price === 1);
    if (cheap.length) facts.push(["Steal", cheap[0].item, `${who(cheap[0].to)} got it for $1`]);
  }
  $("done").innerHTML =
    `<div class="done">` +
    `<p class="cat">${esc(S.cat?.emoji || "")} ${esc(S.cat?.name || "")}</p>` +
    `<h1 class="title">Draft's done</h1>` +
    `<p class="tag">Who drafted better? Argue it out.</p>` +
    `<div class="final">${ps.map((p) => sideCard(p)).join(`<span class="vs">vs</span>`)}</div>` +
    (facts.length ? `<div class="facts">${facts.map(([k, v, s]) => `<div class="fact"><span class="fk">${k}</span><b>${esc(v)}</b><small>${esc(s)}</small></div>`).join("")}</div>` : "") +
    `<div class="done-btns">` +
    (isHost() ? `<button class="btn big" id="againBtn">Play again</button>` : `<p class="status">${esc(who(S.host))} can start another.</p>`) +
    `<button class="link" id="leaveDoneBtn">Leave room</button></div></div>`;
}

/* ========================================================================
   Taps
   ======================================================================== */
document.addEventListener("click", (e) => {
  if (!e.target.closest("#exitBtn") && exitArmed) armExit(false);
  const b = e.target.closest("button");
  if (!b) return;
  if (b.dataset.step) { amt += Number(b.dataset.step); snd.tick(true); return updateStepper(); }
  switch (b.id) {
    case "bidBtn": snd.lock(); snd.buzz(30); return send({ t: "bid", amount: amt });
    case "passBtn": return send({ t: "pass" });
    case "keepBtn": return send({ t: "keep" });
    case "respinBtn": snd.tick(); return send({ t: "respin" });
    case "againBtn": case "startBtn": return send({ t: "start" });
    case "leaveBtn": case "leaveDoneBtn": return send({ t: "leave" });
    case "quickBtn": saveName(); setStatus("Finding someone…"); return send({ t: "quick" });
    case "createBtn": saveName(); return send({ t: "create" });
    case "muteBtn": snd.setMuted(!snd.isMuted()); return paintMute();
    case "exitBtn":
      if (!exitArmed) return armExit(true);
      armExit(false);
      return send({ t: "leave" });
  }
});
// holding a stepper button keeps counting
let holdTimer = null;
document.addEventListener("pointerdown", (e) => {
  const b = e.target.closest(".step");
  if (!b) return;
  clearInterval(holdTimer);
  holdTimer = setTimeout(() => {
    holdTimer = setInterval(() => { if (b.disabled) return; amt += Number(b.dataset.step); updateStepper(); }, 90);
  }, 400);
});
for (const ev of ["pointerup", "pointercancel", "pointerleave"]) document.addEventListener(ev, () => { clearTimeout(holdTimer); clearInterval(holdTimer); });
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
