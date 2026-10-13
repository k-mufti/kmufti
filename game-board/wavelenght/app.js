// Wavelenght - the page. The server (../server.js) runs the room and keeps
// the target secret; this draws the dial and turns what you do into
// messages.
//
// The dial is the real one, flat: a navy face with a scalloped white rim, a
// hidden wheel with the 2-3-4-3-2 target on it, a screen that swings over
// it (pulled round by its two teal handles), and a red needle turned by the
// red knob in the middle.
import { BAND, POINTS } from "./rules.js";

const $ = (id) => document.getElementById(id);
const NS = "http://www.w3.org/2000/svg";
const mk = (n, a = {}, parent) => {
  const e = document.createElementNS(NS, n);
  for (const k in a) e.setAttribute(k, a[k]);
  if (parent) parent.appendChild(e);
  return e;
};
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

const TEAM_NAMES = ["Left Brain", "Right Brain"];

/* ========================================================================
   The connection
   ======================================================================== */
function socketURL() {
  const proto = location.protocol === "https:" ? "wss:" : "ws:";
  // A local static server doesn't proxy the socket, so in dev go straight
  // at the node process on its own port.
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

let ws = null, ready = false, outbox = [], retry = 0;
function connect() {
  ws = new WebSocket(socketURL());
  ws.addEventListener("open", () => {
    ready = true; retry = 0;
    send({ t: "hello", id: identity(), name: myName() });
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
   The dial
   ======================================================================== */
const R = 180;                     // the face
const dial = $("dial");
let wheel, screen, needleG, handles = [];
const pt = (deg, r) => {
  const a = (deg * Math.PI) / 180;
  return [-r * Math.cos(a), -r * Math.sin(a)];
};

function buildDial() {
  const defs = mk("defs", {}, dial);
  // the navy's speckle, like the flocked finish on the real thing
  const f = mk("filter", { id: "speck", x: "0", y: "0", width: "100%", height: "100%" }, defs);
  mk("feTurbulence", { type: "fractalNoise", baseFrequency: "0.9", numOctaves: "2", seed: "4", result: "n" }, f);
  mk("feColorMatrix", { in: "n", type: "matrix", result: "dots",
    values: "0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 -2.6 1.55" }, f);
  mk("feComposite", { in: "dots", in2: "SourceGraphic", operator: "in", result: "d" }, f);
  mk("feComponentTransfer", { in: "d", result: "faint" }, f).appendChild(mk("feFuncA", { type: "linear", slope: "0.16" }));
  const m = mk("feMerge", {}, f);
  mk("feMergeNode", { in: "SourceGraphic" }, m);
  mk("feMergeNode", { in: "faint" }, m);
  const clip = mk("clipPath", { id: "face" }, defs);
  mk("circle", { r: R }, clip);

  // the scalloped white rim
  const rim = mk("g", { class: "rim" }, dial);
  mk("circle", { r: 199 }, rim);
  for (let d = 0; d < 360; d += 7.5) {
    const [x, y] = pt(d, 200);
    mk("circle", { cx: x.toFixed(1), cy: y.toFixed(1), r: 8.4 }, rim);
  }
  mk("circle", { r: 192, class: "navy", filter: "url(#speck)" }, dial);
  mk("circle", { r: R, class: "cream" }, dial);

  // the wheel with the target on it, drawn round the top and turned into place
  const wg = mk("g", { "clip-path": "url(#face)" }, dial);
  wheel = mk("g", { class: "wheel" }, wg);
  const colors = ["band-2", "band-3", "band-4", "band-3", "band-2"];
  POINTS.forEach((p, i) => {
    const a1 = 90 - 2.5 * BAND + i * BAND, a2 = a1 + BAND;
    const [x1, y1] = pt(a1, R + 4), [x2, y2] = pt(a2, R + 4);
    mk("path", { d: `M0 0L${x1} ${y1}A${R + 4} ${R + 4} 0 0 1 ${x2} ${y2}Z`, class: colors[i] }, wheel);
    const [tx, ty] = pt(a1 + BAND / 2, R - 22);
    const t = mk("text", { x: tx, y: ty, class: "band-num", transform: `rotate(${a1 + BAND / 2 - 90} ${tx} ${ty})` }, wheel);
    t.textContent = p;
  });

  // the body below, and the screen that swings over the top
  mk("path", { d: `M${-R - 1} 0A${R + 1} ${R + 1} 0 0 0 ${R + 1} 0Z`, class: "navy", filter: "url(#speck)" }, dial);
  screen = mk("g", { class: "screen" }, dial);
  mk("path", { d: `M${-R - 1} 0A${R + 1} ${R + 1} 0 0 1 ${R + 1} 0Z`, class: "navy", filter: "url(#speck)" }, screen);
  for (const s of [-1, 1]) {
    const h = mk("rect", { x: s < 0 ? -226 : 176, y: -6, width: 50, height: 12, rx: 6, class: "handle" }, screen);
    handles.push(h);
  }

  // the box it stands in
  mk("rect", { x: -150, y: 60, width: 300, height: 40, rx: 8, class: "base" }, dial);

  // the needle and the knob that turns it
  needleG = mk("g", { class: "needle" }, dial);
  mk("path", { d: "M-4.5 0L-2.4 -168L0 -174L2.4 -168L4.5 0Z", class: "needle-arm" }, needleG);
  mk("circle", { r: 30, class: "knob-shadow", cy: 3 }, dial);
  const knob = mk("g", { class: "knob" }, dial);
  mk("circle", { r: 29, class: "knob-rim" }, knob);
  mk("circle", { r: 22, class: "knob-top" }, knob);
  mk("circle", { r: 15, class: "knob-dimple" }, knob);
}

let wheelTurn = 0;     // where the wheel is drawn, in degrees (keeps growing)
function setWheel(target, spin) {
  // the band group is drawn centred at the top (90), so turn by target - 90;
  // a spin adds whole turns first, so it visibly whirls
  let to = target - 90;
  if (spin) {
    const base = wheelTurn - (((wheelTurn % 360) + 360) % 360);
    to += base + 360 * 3;
  } else {
    to += wheelTurn - (((wheelTurn % 360) + 360) % 360);
  }
  wheel.classList.toggle("spinning", !!spin);
  wheelTurn = to;
  wheel.style.transform = `rotate(${to}deg)`;
}
function spinBlind() {
  // the target's secret here: it whirls to somewhere random under the screen
  setWheel(Math.random() * 180, true);
}

let screenOpen = false;
function setScreen(open) {
  screenOpen = open;
  screen.style.transform = `rotate(${open ? 180 : 0}deg)`;
}

let needleAt = 90;
function setNeedle(a, smooth) {
  needleAt = a;
  needleG.classList.toggle("smooth", !!smooth);
  needleG.style.transform = `rotate(${a - 90}deg)`;
}

/* ---------- turning the needle ---------- */
function angleFromEvent(e) {
  const p = dial.createSVGPoint();
  p.x = e.clientX; p.y = e.clientY;
  const q = p.matrixTransform(dial.getScreenCTM().inverse());
  if (q.y > 0) return q.x < 0 ? 0 : 180;           // below the line: pinned to the nearest end
  const a = (Math.atan2(-q.y, -q.x) * 180) / Math.PI;
  return Math.min(180, Math.max(0, a));
}
let dragging = false, lastSent = 0, sendTimer = null;
function sendNeedle() {
  clearTimeout(sendTimer);
  const now = performance.now();
  if (now - lastSent >= 45) { lastSent = now; send({ t: "needle", a: +needleAt.toFixed(1) }); }
  else sendTimer = setTimeout(sendNeedle, 45 - (now - lastSent));
}
dial.addEventListener("pointerdown", (e) => {
  if (e.target.classList.contains("handle")) return;     // that's the screen
  if (!canTurn()) return;
  dragging = true;
  dial.setPointerCapture(e.pointerId);
  setNeedle(angleFromEvent(e));
  sendNeedle();
});
dial.addEventListener("pointermove", (e) => {
  if (!dragging) return;
  setNeedle(angleFromEvent(e));
  sendNeedle();
});
const endDrag = () => { if (dragging) { dragging = false; sendNeedle(); } };
dial.addEventListener("pointerup", endDrag);
dial.addEventListener("pointercancel", endDrag);

// The handles swing the screen. Only the psychic may peek, and only once
// they've spun.
dial.addEventListener("click", (e) => {
  if (!e.target.classList.contains("handle")) return;
  if (S && S.phase === "clue" && isPsychic() && S.spun) { setScreen(!screenOpen); render(); }
});

/* ========================================================================
   State and roles
   ======================================================================== */
let S = null;          // the room, as the server last described it
let lastPhase = null, lastRound = null;
const me = () => S && S.players.find((p) => p.id === S.you);
const nameOf = (id) => S.players.find((p) => p.id === id)?.name || "someone";
const isPsychic = () => S && S.psychic === S.you;
const isHost = () => S && S.host === S.you;
function isGuesser() {
  const m = me();
  if (!m || isPsychic()) return false;
  return S.mode === "coop" || m.team === S.activeTeam;
}
const isCaller = () => S && S.mode === "teams" && me() && me().team !== S.activeTeam;
const canTurn = () => S && S.phase === "guess" && isGuesser();

function onMessage(m) {
  if (m.t === "welcome") return;
  if (m.t === "idle") { S = null; show("home"); setStatus(""); return; }
  if (m.t === "error") return toast(m.msg);
  if (m.t === "needle") { if (!dragging) setNeedle(m.a, true); return; }
  if (m.t === "spun") { if (!isPsychic()) spinBlind(); return; }
  if (m.t === "state") {
    const prev = S;
    S = m;
    if (!dragging) setNeedle(S.needle, true);
    // a new round: wheel parked, screen shut
    if (S.round !== lastRound) { setScreen(false); lastRound = S.round; }
    if (S.phase !== lastPhase) {
      if (S.phase === "reveal") {
        setWheel(S.target, false);
        // let the wheel settle under the screen, then swing it open
        requestAnimationFrame(() => requestAnimationFrame(() => setScreen(true)));
      } else if (S.phase === "guess" || S.phase === "pick" || S.phase === "lobby") {
        setScreen(false);
      }
      lastPhase = S.phase;
    }
    // the psychic's own spin: whirl to the real target
    if (isPsychic() && S.phase === "clue" && S.target !== null && (!prev || prev.target === null)) setWheel(S.target, true);
    render();
  }
}

/* ========================================================================
   Drawing the page
   ======================================================================== */
function show(id) {
  for (const s of ["home", "lobby", "game"]) $(s).hidden = s !== id;
  $("codeChip").hidden = id === "home";
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

// Each card gets two colours, the same two every time it comes up.
const CARD_COLORS = [["#4fb8b0", "#e2533f"], ["#f2b631", "#6a4fa3"], ["#ee7d35", "#3f74c4"], ["#e86fa3", "#4fa564"], ["#8fc7e3", "#d9573b"], ["#f4d35e", "#2f8f8a"]];
function cardColors(card) {
  let h = 0;
  for (const c of card.join("|")) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return CARD_COLORS[h % CARD_COLORS.length];
}
function cardHTML(card) {
  const [a, b] = cardColors(card);
  return `<span class="card-end l" style="background:${a}"><i>&larr;</i>${esc(card[0])}</span>` +
         `<span class="card-end r" style="background:${b}">${esc(card[1])}<i>&rarr;</i></span>`;
}

function render() {
  if (!S) return;
  $("codeChip").textContent = S.code;
  if (S.phase === "lobby") return renderLobby();
  show("game");
  renderScore();
  renderTable();
  renderWho();
}

function teamList(t, inGame) {
  const people = S.players.filter((p) => S.mode === "coop" || p.team === t);
  return people.map((p) => {
    const tags = [];
    if (p.id === S.you) tags.push("you");
    if (p.id === S.host) tags.push("host");
    if (inGame && p.id === S.psychic) tags.push("psychic");
    return `<li class="${p.online ? "" : "away"}${inGame && p.id === S.psychic ? " psy" : ""}">${esc(p.name)}` +
      (tags.length ? ` <small>${tags.join(" · ")}</small>` : "") + (p.online ? "" : " <small>away</small>") + `</li>`;
  }).join("") || `<li class="empty">nobody yet</li>`;
}

function renderLobby() {
  show("lobby");
  $("lobbyCode").textContent = S.code;
  for (const b of document.querySelectorAll(".mode-btn")) {
    b.classList.toggle("on", b.dataset.mode === S.mode);
    b.disabled = !isHost();
  }
  $("modeHint").textContent = S.mode === "teams"
    ? `Two teams take turns. First to ${S.win} wins. Needs 2+ on each team.`
    : "Everyone on one team, seven cards, one total score. Needs 2+ players.";
  const mine = me()?.team;
  $("lobbyTeams").innerHTML = S.mode === "coop"
    ? `<div class="team"><h3>Everyone</h3><ul>${teamList(0, false)}</ul></div>`
    : [0, 1].map((t) => `<div class="team t${t}"><h3>${TEAM_NAMES[t]}</h3><ul>${teamList(t, false)}</ul>` +
        (mine === t ? "" : `<button class="btn small ghost" data-team="${t}">Join ${TEAM_NAMES[t]}</button>`) + `</div>`).join("");
  $("startBtn").hidden = !isHost();
  if (!isHost()) setStatus(`Waiting for ${nameOf(S.host)} to start.`);
  else setStatus("");
}

function renderScore() {
  const el = $("scoreBoard");
  if (S.mode === "coop") {
    el.innerHTML = `<div class="coop"><b>${S.coop.score}</b> points<span>·</span><b>${S.coop.cardsLeft}</b> card${S.coop.cardsLeft === 1 ? "" : "s"} left</div>`;
    return;
  }
  el.innerHTML = [0, 1].map((t) => {
    let dots = "";
    for (let i = 1; i <= Math.max(S.win, S.scores[t]); i++) dots += `<i class="${i <= S.scores[t] ? "on" : ""}"></i>`;
    return `<div class="track t${t}${S.activeTeam === t && S.phase !== "reveal" ? " active" : ""}"><span class="tn">${TEAM_NAMES[t]}</span><span class="dots">${dots}</span><b>${S.scores[t]}</b></div>`;
  }).join("");
}

function renderWho() {
  if (S.mode === "coop") {
    $("who").innerHTML = `<div class="team"><ul>${teamList(0, true)}</ul></div>`;
    return;
  }
  const mine = me()?.team;
  $("who").innerHTML = [0, 1].map((t) => `<div class="team t${t}"><h3>${TEAM_NAMES[t]}</h3><ul>${teamList(t, true)}</ul>` +
    (mine === t || (isPsychic() && S.phase !== "reveal") ? "" : `<button class="btn small ghost" data-team="${t}">Switch here</button>`) + `</div>`).join("");
}

function renderTable() {
  const psy = nameOf(S.psychic);
  const actions = $("actions");
  const bits = [];
  let banner = "";

  // the spectrum card under the dial
  $("spectrum").hidden = !S.card;
  if (S.card) {
    const [a, b] = cardColors(S.card);
    $("endL").innerHTML = `<i>&larr;</i>${esc(S.card[0])}`;
    $("endR").innerHTML = `${esc(S.card[1])}<i>&rarr;</i>`;
    $("endL").style.background = a;
    $("endR").style.background = b;
  }
  $("clue").hidden = !S.clue;
  $("clue").innerHTML = S.clue ? `<small>${esc(psy)}'s clue</small>${esc(S.clue)}` : "";

  dial.classList.toggle("turnable", canTurn());
  dial.classList.toggle("peekable", S.phase === "clue" && isPsychic() && S.spun);
  $("leftBtn").hidden = $("rightBtn").hidden = !(S.phase === "side" && isCaller());

  const offlinePsy = !S.players.find((p) => p.id === S.psychic)?.online;
  const team = S.mode === "teams" ? TEAM_NAMES[S.activeTeam] : "Your team";

  switch (S.phase) {
    case "pick":
      if (isPsychic()) {
        banner = "You're the psychic. Pick a card.";
        bits.push(`<div class="pick">${S.choices.map((c, i) => `<button class="card-btn" data-pick="${i}">${cardHTML(c)}</button>`).join("")}</div>`);
      } else banner = `${psy} is the psychic and is picking a card.`;
      break;
    case "clue":
      if (isPsychic()) {
        if (!S.spun) {
          banner = "Spin the wheel. The screen stays shut, so nobody sees where it lands.";
          bits.push(`<button class="btn big" id="spinBtn">Spin</button>`);
        } else {
          banner = screenOpen
            ? "Only you can see it. Give a clue that points your team to the target."
            : "Pull a teal handle to peek at the target.";
          bits.push(`<button class="btn ghost" id="peekBtn">${screenOpen ? "Close the screen" : "Peek"}</button>`);
          bits.push(`<form class="clue-form" id="clueForm"><input id="clueInput" maxlength="60" placeholder="Your clue" autocomplete="off" spellcheck="false" /><button class="btn" type="submit">Give clue</button></form>`);
        }
      } else banner = S.spun ? `${psy} is thinking of a clue…` : `${psy} is spinning the wheel…`;
      break;
    case "guess":
      if (isPsychic()) banner = "Your team is turning the dial. No hints, no faces!";
      else if (isGuesser()) {
        banner = "Talk it over, turn the red knob to where you think the target is, then lock it in.";
        bits.push(`<button class="btn big" id="lockBtn">Lock it in</button>`);
      } else banner = `${team} is turning the dial. You'll call left or right next.`;
      break;
    case "side":
      if (isCaller()) banner = "Is the target to the left or the right of their needle? Call it right for a point.";
      else banner = `${TEAM_NAMES[1 - S.activeTeam]} is calling left or right…`;
      break;
    case "reveal": {
      const r = S.result;
      const pts = r.points ? `<b class="pts p${r.points}">+${r.points}</b>` : `<b class="pts p0">0</b>`;
      if (S.mode === "coop") {
        banner = r.points ? `${pts} ${r.points === 4 ? "Bullseye!" : "Nice."}${r.bonusCard ? " A bullseye earns an extra card." : ""}` : `${pts} Missed it.`;
      } else {
        const other = TEAM_NAMES[1 - S.activeTeam];
        const side = S.side ? (r.sidePoint ? `${other} called ${S.side}: +1.` : `${other} called ${S.side}: no point.`) : "";
        banner = `${pts} for ${TEAM_NAMES[S.activeTeam]}${r.points === 4 ? " - bullseye!" : "."} ${side}`;
        if (r.again) banner += ` Still behind, so ${TEAM_NAMES[S.activeTeam]} goes again.`;
      }
      if (S.winner !== null) {
        banner += S.mode === "coop"
          ? `<br><span class="final">Final score: ${S.coop.score}. ${esc(r.rating || "")}</span>`
          : `<br><span class="final">${TEAM_NAMES[S.winner]} win${S.scores[S.winner] >= 0 ? "" : ""}, ${S.scores[S.winner]} to ${S.scores[1 - S.winner]}!</span>`;
        bits.push(`<button class="btn big" id="againBtn">Play again</button>`);
      } else bits.push(`<button class="btn big" id="nextBtn">Next round</button>`);
      break;
    }
  }
  if (offlinePsy && (S.phase === "pick" || S.phase === "clue")) {
    bits.push(`<button class="btn ghost" id="skipBtn">${esc(psy)} has gone. Skip them</button>`);
  }
  $("banner").innerHTML = banner;
  // keep a half-typed clue through re-renders
  const typed = $("clueInput")?.value;
  actions.innerHTML = bits.join("");
  if (typed && $("clueInput")) $("clueInput").value = typed;
}

/* ========================================================================
   Wiring
   ======================================================================== */
document.addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  if (b.dataset.team !== undefined) return send({ t: "team", team: +b.dataset.team });
  if (b.dataset.pick !== undefined) return send({ t: "pick", i: +b.dataset.pick });
  if (b.dataset.mode) return send({ t: "mode", mode: b.dataset.mode });
  switch (b.id) {
    case "spinBtn": return send({ t: "spin" });
    case "peekBtn": setScreen(!screenOpen); return render();
    case "lockBtn": return send({ t: "lock" });
    case "leftBtn": return send({ t: "side", side: "left" });
    case "rightBtn": return send({ t: "side", side: "right" });
    case "nextBtn": return send({ t: "next" });
    case "againBtn": return send({ t: "again" });
    case "skipBtn": return send({ t: "skip" });
    case "startBtn": return send({ t: "start" });
    case "leaveBtn": return send({ t: "leave" });
  }
});
document.addEventListener("submit", (e) => {
  e.preventDefault();
  if (e.target.id === "clueForm") {
    const text = $("clueInput").value.trim();
    if (!text) return;
    setScreen(false);
    send({ t: "clue", text });
  }
  if (e.target.id === "joinForm") {
    const code = $("codeInput").value.trim().toUpperCase();
    if (code.length === 4) { saveName(); send({ t: "join", code }); }
  }
});
$("createBtn").addEventListener("click", () => { saveName(); send({ t: "create" }); });
$("codeInput").addEventListener("input", (e) => { e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""); });

function saveName() {
  const n = $("nameInput").value.trim();
  if (n && window.KmuftiYou && n !== window.KmuftiYou.name()) {
    window.KmuftiYou.setName(n);
    send({ t: "name", name: window.KmuftiYou.name() });
  }
}
$("nameInput").value = myName();
// a link with ?room=CODE drops you straight in
const linkCode = new URLSearchParams(location.search).get("room");
if (linkCode) $("codeInput").value = linkCode.toUpperCase().slice(0, 4);

buildDial();
setWheel(90, false);
setNeedle(90);
show("home");
setStatus("Connecting…");
connect();
// once connected and still not in a room, the link's code joins it
const joinFromLink = setInterval(() => {
  if (!ready) return;
  clearInterval(joinFromLink);
  setStatus("");
  if (linkCode && !S) send({ t: "join", code: linkCode });
}, 200);
