// Wavelength - the page. The server (../server.js) runs the room and keeps
// the target secret; this draws the dial and turns what you do into
// messages.
//
// The dial is the real one, flat: a navy face with a scalloped white rim, a
// hidden wheel with the 2-3-4-3-2 target on it, a screen that swings over
// it (pulled round by its two teal handles), and a red needle turned by the
// red knob in the middle.
//
// The same page is the TV: open it with ?tv=CODE and it watches that room,
// big, with no buttons, and never sees the target before everyone does.
import { BAND, POINTS, tier } from "./rules.js?v=2";
import * as snd from "./sound.js?v=1";
import { goTheme } from "../theme.js?v=1";

const $ = (id) => document.getElementById(id);
const NS = "http://www.w3.org/2000/svg";
const mk = (n, a = {}, parent) => {
  const e = document.createElementNS(NS, n);
  for (const k in a) e.setAttribute(k, a[k]);
  if (parent) parent.appendChild(e);
  return e;
};
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const TEAM_NAMES = ["Left Brain", "Right Brain"];
const PARK = 270;      // a wheel turned to here sits under the body, out of sight

const params = new URLSearchParams(location.search);
const tvCode = (params.get("tv") || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4);
const TV = !!tvCode;
if (TV) document.body.classList.add("tv");

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
  // A TV gets a throwaway id of its own, so a TV tab on your laptop doesn't
  // pull you out of the game as a player.
  if (TV) return "tv-" + (crypto.randomUUID?.() || String(Math.random()).slice(2)).slice(0, 30);
  let id = null;
  try { id = localStorage.getItem("game-board-id"); } catch { /* private mode */ }
  if (!id) {
    id = (crypto.randomUUID?.() || String(Math.random()).slice(2)).slice(0, 36);
    try { localStorage.setItem("game-board-id", id); } catch { /* fine */ }
  }
  return id;
}
const myId = identity();
const myName = () => (window.KmuftiYou ? window.KmuftiYou.name() : "someone");

let ws = null, ready = false, outbox = [], retry = 0;
function connect() {
  ws = new WebSocket(socketURL());
  ws.addEventListener("open", () => {
    ready = true; retry = 0;
    send({ t: "hello", id: myId, name: TV ? "TV" : myName() });
    if (TV) send({ t: "watch", code: tvCode });
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
let wheel, screen, needleG, popG, popText;
const bandEls = [];
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
    bandEls.push(mk("path", { d: `M0 0L${x1} ${y1}A${R + 4} ${R + 4} 0 0 1 ${x2} ${y2}Z`, class: colors[i] }, wheel));
    const [tx, ty] = pt(a1 + BAND / 2, R - 22);
    const t = mk("text", { x: tx, y: ty, class: "band-num", transform: `rotate(${a1 + BAND / 2 - 90} ${tx} ${ty})` }, wheel);
    t.textContent = p;
  });

  // the body below, and the screen that swings over the top
  mk("path", { d: `M${-R - 1} 0A${R + 1} ${R + 1} 0 0 0 ${R + 1} 0Z`, class: "navy", filter: "url(#speck)" }, dial);
  screen = mk("g", { class: "screen" }, dial);
  mk("path", { d: `M${-R - 1} 0A${R + 1} ${R + 1} 0 0 1 ${R + 1} 0Z`, class: "navy", filter: "url(#speck)" }, screen);
  for (const s of [-1, 1]) mk("rect", { x: s < 0 ? -226 : 176, y: -6, width: 50, height: 12, rx: 6, class: "handle" }, screen);

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

  // the points, popping out of the face where the needle landed
  popG = mk("g", { class: "pop" }, dial);
  const inner = mk("g", { class: "pop-in" }, popG);
  mk("circle", { r: 36, class: "pop-bg" }, inner);
  popText = mk("text", { class: "pop-num" }, inner);
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
function setScreen(open, slow) {
  if (open === screenOpen) return;
  screenOpen = open;
  screen.classList.toggle("slow", !!slow);
  screen.style.transform = `rotate(${open ? 180 : 0}deg)`;
  snd.swoosh(slow ? 1.8 : 0.9);
}

// The psychic sees the wheel the whole round, from picking the card to the
// reveal - unless they've hidden it, for a phone that's up on a big screen.
// Hiding is remembered on this device.
let hideTarget = false;
try { hideTarget = localStorage.getItem("wavelenght-hide") === "1"; } catch { /* private mode */ }
function setHide(h) {
  hideTarget = h;
  try { localStorage.setItem("wavelenght-hide", h ? "1" : "0"); } catch { /* fine */ }
  syncScreen();
  render();
}
const psychicSees = () => !!S && isPsychic() && ["pick", "clue", "guess", "side"].includes(S.phase);
function syncScreen() {
  if (!S || S.phase === "reveal") return;          // the reveal opens it itself
  setScreen(psychicSees() && !hideTarget);
}

let needleAt = 90;
function setNeedle(a, smooth) {
  // a click of the ratchet every 3 degrees it passes
  if (Math.floor(a / 3) !== Math.floor(needleAt / 3)) snd.tick(smooth);
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

// The handles swing the screen too: the psychic's own hide and show.
dial.addEventListener("click", (e) => {
  if (!e.target.classList.contains("handle")) return;
  if (psychicSees()) setHide(!hideTarget);
});

/* ========================================================================
   State and roles
   ======================================================================== */
let S = null;          // the room, as the server last described it
let lastPhase = null, lastRound = null;
const me = () => S && S.players.find((p) => p.id === S.you);
const nameOf = (id) => S.players.find((p) => p.id === id)?.name || "someone";
const isPsychic = () => !!S && !TV && S.psychic === S.you;
const isHost = () => !!S && !TV && S.host === S.you;
function isGuesser() {
  const m = me();
  if (TV || !m || isPsychic()) return false;
  return S.mode === "coop" || m.team === S.activeTeam;
}
const isCaller = () => !!S && !TV && S.mode === "teams" && !!me() && me().team !== S.activeTeam;
const canTurn = () => !!S && S.phase === "guess" && isGuesser();

function onMessage(m) {
  if (m.t === "welcome") return;
  if (m.t === "idle") {
    if (TV) return;                    // a TV is never in a room as a player
    S = null; show("home"); setStatus("");
    return;
  }
  if (m.t === "error") { if (TV) setStatus(m.msg); return toast(m.msg); }
  if (m.t === "needle") { if (!dragging) setNeedle(m.a, true); return; }
  if (m.t === "spun") {
    if (!isPsychic()) spinBlind();
    snd.spin(2.4);
    return;
  }
  if (m.t === "locked") { snd.lock(); snd.buzz(40); return; }
  if (m.t === "state") {
    const prev = S;
    S = m;
    if (!dragging) setNeedle(S.needle, true);
    // a new round: the wheel parked out of sight, ready to be spun up
    if (S.round !== lastRound) {
      if (S.phase !== "reveal") setWheel(PARK, false);
      if (S.phase === "pick" && isPsychic() && prev) { snd.yourTurn(); snd.buzz([60, 40, 60]); }
      lastRound = S.round;
    }
    if (S.phase !== lastPhase) {
      if (S.phase !== "reveal") { revealing = false; clearPop(); }
      if (S.phase === "reveal") {
        // seen live (not on rejoining): play it out slowly
        if (prev && prev.phase !== "reveal" && prev.round === S.round) startReveal(prev);
        else { setWheel(S.target, false); setScreen(true); }
      } else if (S.phase === "guess" && lastPhase === "clue" && !isPsychic()) {
        snd.clue();
        if (isGuesser()) snd.buzz(30);
      }
      if (S.phase === "lobby") stopCountdownTick();
      lastPhase = S.phase;
    }
    // the psychic's own spin: whirl to the real target
    if (isPsychic() && S.phase === "clue" && S.target !== null && (!prev || prev.target === null)) setWheel(S.target, true);
    syncScreen();
    // came back to a finished game: straight to the results
    if (S.winner !== null && S.phase === "reveal" && !revealing && !overShown(S)) showOver(S, false);
    render();
  }
}

/* ========================================================================
   The reveal, slowly: a beat, a drumroll while the screen swings open, then
   the points pop out where the needle landed and the score moves
   ======================================================================== */
let revealing = false;     // mid-reveal: hold the scores back until it lands
let before = null;         // the scores before this reveal
async function startReveal(prev) {
  revealing = true;
  before = { scores: prev.scores, coop: prev.coop };
  const st = S;
  const r = st.result;
  // the wheel goes where it really is - under the shut screen, for most
  setWheel(st.target, false);
  const opening = !screenOpen;
  await wait(opening ? 700 : 300);
  if (S.round !== st.round) return;
  if (opening) {
    snd.drumroll(1.9);
    setScreen(true, true);
    await wait(2000);
  } else {
    snd.drumroll(0.9);
    await wait(1000);
  }
  if (S.round !== st.round) return;
  showPop(st.needle, st.target, r.points);
  snd.points(tier(r.points));
  snd.buzz(tier(r.points) === 4 ? [80, 50, 80, 50, 180] : r.points ? [70] : [220]);
  revealing = false;
  render();
  if (st.mode === "teams" && st.side) {
    await wait(700);
    snd.side(!!r.sidePoint);
  }
  if (st.winner !== null) {
    await wait(1800);
    if (S.round === st.round && !overShown(st)) showOver(st, true);
  }
}

function showPop(needle, target, points) {
  const [x, y] = pt(needle, 112);
  popG.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
  popG.setAttribute("class", `pop show p${tier(points)}`);
  popText.textContent = points ? `+${points}` : "0";
  // light up the band the needle's in
  const d = Math.abs(needle - target);
  const i = d <= BAND / 2 ? 2 : d <= BAND * 1.5 ? (needle < target ? 1 : 3) : d <= BAND * 2.5 ? (needle < target ? 0 : 4) : -1;
  bandEls.forEach((b, k) => b.classList.toggle("hit", k === i));
}
function clearPop() {
  popG.setAttribute("class", "pop");
  bandEls.forEach((b) => b.classList.remove("hit"));
}

/* ========================================================================
   Drawing the page
   ======================================================================== */
function show(id) {
  for (const s of ["home", "lobby", "game"]) $(s).hidden = s !== id;
  if (id !== "game") document.body.classList.remove("split");
  $("exitBtn").hidden = id !== "game" || TV;
  if (id !== "game") armExit(false);
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
  $("tvJoin").innerHTML = `Play along: <b>${esc(location.host + location.pathname)}</b> &nbsp;·&nbsp; code <b class="tv-code">${esc(S.code)}</b>`;
  if (S.phase === "lobby") return renderLobby();
  stopCountdownTick();
  show("game");
  renderScore();
  renderTable();
}

function teamList(t, inGame) {
  const people = S.players.filter((p) => S.mode === "coop" || p.team === t);
  return people.map((p) => {
    const tags = [];
    if (p.id === S.you) tags.push("you");
    if (p.id === S.host && !S.quick) tags.push("host");
    if (inGame && p.id === S.psychic) tags.push("psychic");
    return `<li class="${p.online ? "" : "away"}${inGame && p.id === S.psychic ? " psy" : ""}">${esc(p.name)}` +
      (tags.length ? ` <small>${tags.join(" · ")}</small>` : "") + (p.online ? "" : " <small>away</small>") + `</li>`;
  }).join("") || `<li class="empty">nobody yet</li>`;
}

/* ---------- the lobby ---------- */
let countdownTimer = null;
function stopCountdownTick() { clearInterval(countdownTimer); countdownTimer = null; }
function renderLobby() {
  show("lobby");
  $("lobbyCode").textContent = S.code;
  $("roomLine").textContent = S.quick ? "Quick game · room code" : "Room code";
  $("roomHint").textContent = TV
    ? "Grab your phone, open the game and type the code."
    : S.quick
      ? "Anyone who taps Quick game lands here too. Share the code to bring a friend."
      : "Everyone opens this page on their own phone and types the code.";
  $("modeRow").hidden = S.quick;
  for (const b of document.querySelectorAll(".mode-btn")) {
    b.classList.toggle("on", b.dataset.mode === S.mode);
    b.disabled = !isHost();
  }
  $("modeHint").textContent = S.mode === "teams"
    ? `Two teams take turns. First to ${S.win} wins. Needs 2+ on each team.`
    : S.quick
      ? "All on one team: seven cards, one score. It starts by itself once two of you are here."
      : "Everyone on one team, seven cards, one total score. Needs 2+ players.";
  const mine = me()?.team;
  $("lobbyTeams").innerHTML = S.mode === "coop"
    ? `<div class="team"><h3>Everyone</h3><ul>${teamList(0, false)}</ul></div>`
    : [0, 1].map((t) => `<div class="team t${t}"><h3>${TEAM_NAMES[t]}</h3><ul>${teamList(t, false)}</ul>` +
        (mine === t || TV ? "" : `<button class="btn small ghost" data-team="${t}">Join ${TEAM_NAMES[t]}</button>`) + `</div>`).join("");
  $("startBtn").hidden = !isHost() || S.quick;
  $("leaveBtn").hidden = TV;
  $("tvRow").hidden = TV;
  $("tvLink").href = `?tv=${S.code}`;
  $("tvOn").textContent = S.watchers ? `${S.watchers === 1 ? "A TV is" : `${S.watchers} TVs are`} showing this room.` : "";

  stopCountdownTick();
  if (S.quick && S.startsIn) {
    const ends = Date.now() + S.startsIn;
    const tickDown = () => setStatus(`Starting in ${Math.max(1, Math.ceil((ends - Date.now()) / 1000))}…`);
    tickDown();
    countdownTimer = setInterval(tickDown, 250);
  } else if (S.quick) setStatus("Waiting for someone else to show up…");
  else if (TV) setStatus(`Waiting for ${nameOf(S.host)} to start.`);
  else if (!isHost()) setStatus(`Waiting for ${nameOf(S.host)} to start.`);
  else setStatus("");
}

function renderScore() {
  const el = $("scoreBoard");
  const sc = revealing && before ? before : S;
  if (S.mode === "coop") {
    el.innerHTML = `<div class="coop"><b>${sc.coop.score}</b> points<span>·</span><b>${sc.coop.cardsLeft}</b> card${sc.coop.cardsLeft === 1 ? "" : "s"} left</div>`;
    return;
  }
  el.innerHTML = [0, 1].map((t) => {
    let dots = "";
    for (let i = 1; i <= Math.max(S.win, sc.scores[t]); i++) dots += `<i class="${i <= sc.scores[t] ? "on" : ""}"></i>`;
    const bumped = !revealing && S.phase === "reveal" && before && before.scores[t] !== S.scores[t];
    return `<div class="track t${t}${S.activeTeam === t && S.phase !== "reveal" ? " active" : ""}${bumped ? " bumped" : ""}"><span class="tn">${TEAM_NAMES[t]}</span><span class="dots">${dots}</span><b>${sc.scores[t]}</b></div>`;
  }).join("");
}

let cardShown = "";     // the card whose colours are on the page
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
    // on a big screen the whole page splits into the card's two colours
    document.body.style.setProperty("--left", a);
    document.body.style.setProperty("--right", b);
  }
  document.body.classList.toggle("split", !!S.card);
  // a new card: its two colours sweep in from the edges and meet in the middle
  const key = S.card ? S.card.join("|") + S.round : "";
  if (key !== cardShown) {
    cardShown = key;
    document.body.classList.remove("split-in");
    if (key) {
      void document.body.offsetWidth;            // restart the sweep
      document.body.classList.add("split-in");
      if (matchMedia("(min-width: 900px)").matches) snd.swoosh(0.8);
    }
  }
  $("clue").hidden = !S.clue;
  $("clue").innerHTML = S.clue ? `<small>${esc(psy)}'s clue</small>${esc(S.clue)}` : "";

  dial.classList.toggle("turnable", canTurn());
  dial.classList.toggle("peekable", psychicSees());
  $("leftBtn").hidden = $("rightBtn").hidden = !(S.phase === "side" && isCaller());

  const offlinePsy = !S.players.find((p) => p.id === S.psychic)?.online;
  const team = S.mode === "teams" ? TEAM_NAMES[S.activeTeam] : "The team";
  const hideBtn = () => bits.push(`<button class="btn small ghost" id="hideBtn">${hideTarget ? "Show the target" : "Hide the target"}</button>`);

  switch (S.phase) {
    case "pick":
      if (isPsychic()) {
        banner = "You're the psychic. Pick a card.";
        bits.push(`<div class="pick">${S.choices.map((c, i) => `<button class="card-btn" data-pick="${i}" style="background:linear-gradient(90deg, ${cardColors(c)[0]} 50%, ${cardColors(c)[1]} 50%)">${cardHTML(c)}</button>`).join("")}</div>`);
      } else banner = `${psy} is the psychic and is picking a card.`;
      break;
    case "clue":
      if (isPsychic()) {
        if (!S.spun) {
          banner = hideTarget
            ? "Spin the wheel. The screen's shut, so the room can't see where it lands."
            : "Spin the wheel and watch where it lands. Only you can see it.";
          bits.push(`<button class="btn big" id="spinBtn">Spin</button>`);
        } else {
          banner = hideTarget
            ? "The target's hidden. Show it when nobody else is looking."
            : "Only you can see it. Give a clue that points your team to the target.";
          bits.push(`<form class="clue-form" id="clueForm"><input id="clueInput" maxlength="60" placeholder="Your clue" autocomplete="off" spellcheck="false" /><button class="btn" type="submit">Give clue</button></form>`);
        }
        hideBtn();
      } else banner = S.spun ? `${psy} is thinking of a clue…` : `${psy} is spinning the wheel…`;
      break;
    case "guess":
      if (isPsychic()) { banner = "Your team is turning the dial. No hints, no faces!"; hideBtn(); }
      else if (isGuesser()) {
        banner = "Talk it over, turn the red knob to where you think the target is, then lock it in.";
        bits.push(`<button class="btn big" id="lockBtn">Lock it in</button>`);
      } else banner = `${team} is turning the dial.${TV || S.mode === "coop" ? "" : " You'll call left or right next."}`;
      break;
    case "side":
      if (isCaller()) banner = "Is the target to the left or the right of their needle? Call it right for a point.";
      else banner = `${TEAM_NAMES[1 - S.activeTeam]} is calling left or right…`;
      if (isPsychic()) hideBtn();
      break;
    case "reveal": {
      if (revealing) { banner = `<span class="drum">The moment of truth…</span>`; break; }
      const r = S.result;
      const pts = r.points ? `<b class="pts p${tier(r.points)}">+${r.points}</b>` : `<b class="pts p0">0</b>`;
      if (S.mode === "coop") {
        banner = r.points ? `${pts} ${tier(r.points) === 4 ? "Bullseye!" : "Nice."}${r.bonusCard ? " A bullseye earns an extra card." : ""}` : `${pts} Missed it.`;
      } else {
        const other = TEAM_NAMES[1 - S.activeTeam];
        const side = S.side ? (r.sidePoint ? `${other} called ${S.side}: +1.` : `${other} called ${S.side}: no point.`) : "";
        banner = `${pts} for ${TEAM_NAMES[S.activeTeam]}${tier(r.points) === 4 ? " - bullseye!" : "."} ${side}`;
        if (r.again) banner += ` Still behind, so ${TEAM_NAMES[S.activeTeam]} goes again.`;
      }
      if (S.winner !== null) bits.push(`<button class="btn big" id="resultsBtn">See the results</button>`);
      else bits.push(`<button class="btn big" id="nextBtn">Next round</button>`);
      break;
    }
  }
  if (offlinePsy && (S.phase === "pick" || S.phase === "clue")) {
    bits.push(`<button class="btn ghost" id="skipBtn">${esc(psy)} has gone. Skip them</button>`);
  }
  $("banner").innerHTML = banner;
  // keep a half-typed clue through re-renders
  const typed = $("clueInput")?.value;
  actions.innerHTML = TV ? "" : bits.join("");
  if (typed && $("clueInput")) $("clueInput").value = typed;
}

/* ========================================================================
   The end of the game: who won, the awards, and every round
   ======================================================================== */
let overFor = null;        // which game the results are up for
const gameKey = (st) => `${st.code}:${st.history.length}:${st.history[0]?.clue || ""}`;
const overShown = (st) => overFor === gameKey(st);

function showOver(st, loud) {
  overFor = gameKey(st);
  if (!TV) recordStats(st);
  if (loud) { snd.fanfare(); snd.buzz([100, 60, 100, 60, 300]); }
  const h = st.history;
  const name = (id) => st.players.find((p) => p.id === id)?.name;
  let head, sub;
  if (st.mode === "coop") {
    head = `${st.coop.score} points`;
    sub = st.result?.rating || "";
  } else {
    head = `${TEAM_NAMES[st.winner]} win!`;
    sub = `${st.scores[st.winner]} to ${st.scores[1 - st.winner]}`;
    const mine = st.players.find((p) => p.id === st.you)?.team;
    if (!TV && mine !== undefined) sub += mine === st.winner ? " · that's you!" : " · next time";
  }

  // the awards
  const awards = [];
  const bulls = h.filter((r) => tier(r.points) === 4).length;
  awards.push(["Bullseyes", `${bulls} of ${h.length} round${h.length === 1 ? "" : "s"}`]);
  const byPsy = new Map();
  for (const r of h) {
    const e = byPsy.get(r.psychic) || { name: name(r.psychic) || r.psychicName, pts: 0, n: 0 };
    e.pts += r.points; e.n++;
    byPsy.set(r.psychic, e);
  }
  const best = [...byPsy.values()].sort((a, b) => b.pts / b.n - a.pts / a.n || b.n - a.n)[0];
  if (best) awards.push(["Best psychic", `${esc(best.name)} · ${(best.pts / best.n).toFixed(1)} a round`]);
  if (h.length) {
    const off = (r) => Math.abs(r.needle - r.target);
    const close = h.reduce((a, b) => (off(b) < off(a) ? b : a));
    const wild = h.reduce((a, b) => (off(b) > off(a) ? b : a));
    awards.push(["Closest call", `“${esc(close.clue)}” · ${off(close).toFixed(1)}° off`]);
    if (wild !== close) awards.push(["Wildest miss", `“${esc(wild.clue)}” · ${off(wild).toFixed(0)}° off`]);
  }
  if (st.mode === "teams") {
    for (const t of [0, 1]) {
      const calls = h.filter((r) => r.team === 1 - t && r.side);
      if (calls.length) awards.push([`${TEAM_NAMES[t]}'s calls`, `${calls.filter((r) => r.sidePoint).length} of ${calls.length} right`]);
    }
  }

  // every round: the card, the clue, and a little strip with the target
  // (the band) and where the needle landed (the red line)
  const rows = h.map((r) => {
    const who = st.mode === "teams" ? `<span class="dot t${r.team}"></span>` : "";
    return `<li>${who}<span class="rc"><b>${esc(r.card[0])} – ${esc(r.card[1])}</b><span>“${esc(r.clue)}” · ${esc(name(r.psychic) || r.psychicName)}</span></span>` +
      `<span class="mini"><i class="t" style="left:${((r.target / 180) * 100).toFixed(1)}%"></i><i class="n" style="left:${((r.needle / 180) * 100).toFixed(1)}%"></i></span>` +
      `<b class="pts p${tier(r.points)}">${r.points ? `+${r.points}` : "0"}</b></li>`;
  }).join("");

  $("over").innerHTML =
    `<div class="over-card">` +
      (loud ? `<div class="confetti" aria-hidden="true">${confetti()}</div>` : "") +
      `<p class="over-kicker">${st.mode === "coop" ? "Final score" : "Game over"}</p>` +
      `<h2 class="over-head">${esc(head)}</h2>` +
      `<p class="over-sub">${esc(sub)}</p>` +
      `<div class="awards">${awards.map(([t, v]) => `<div class="award"><span class="at">${esc(t)}</span><span class="av">${v}</span></div>`).join("")}</div>` +
      `<h3 class="over-h3">Every round</h3>` +
      `<ol class="rounds">${rows}</ol>` +
      (TV ? "" : `<div class="lifetime">${lifetimeHTML()}</div>`) +
      (TV ? "" : `<div class="over-actions"><button class="btn big" id="againBtn">Play again</button><button class="btn ghost" id="closeOverBtn">Close</button></div>`) +
    `</div>`;
  $("over").hidden = false;
  $("over").scrollTop = 0;
}
function hideOver() { $("over").hidden = true; }
function confetti() {
  const colors = ["#f3b52f", "#ee7a33", "#a8d4e6", "#d8342b", "#7fd8c3", "#1d3d5c"];
  let s = "";
  for (let i = 0; i < 46; i++) {
    s += `<i style="left:${(Math.random() * 100).toFixed(1)}%;background:${colors[i % colors.length]};animation-delay:${(Math.random() * 0.9).toFixed(2)}s;animation-duration:${(2.2 + Math.random() * 1.6).toFixed(2)}s"></i>`;
  }
  return s;
}

/* ---------- your stats, kept on this device ---------- */
const STATS_KEY = "wavelenght-stats";
function loadStats() {
  let s = null;
  try { s = JSON.parse(localStorage.getItem(STATS_KEY) || "null"); } catch { /* fine */ }
  return Object.assign({ games: 0, wins: 0, losses: 0, coopGames: 0, coopBest: 0, rounds: 0, bullseyes: 0, psyRounds: 0, psyPoints: 0, done: [] }, s || {});
}
function recordStats(st) {
  const s = loadStats();
  const key = gameKey(st);
  if (s.done.includes(key)) return;
  s.done = [...s.done, key].slice(-20);
  const mine = st.players.find((p) => p.id === st.you);
  s.games++;
  if (st.mode === "coop") { s.coopGames++; s.coopBest = Math.max(s.coopBest, st.coop.score); }
  else if (mine) { if (mine.team === st.winner) s.wins++; else s.losses++; }
  for (const r of st.history) {
    if (r.psychic === st.you) { s.psyRounds++; s.psyPoints = Math.round((s.psyPoints + r.points) * 10) / 10; continue; }
    if (st.mode === "coop" || (mine && r.team === mine.team)) { s.rounds++; if (tier(r.points) === 4) s.bullseyes++; }
  }
  try { localStorage.setItem(STATS_KEY, JSON.stringify(s)); } catch { /* fine */ }
  renderHomeStats();
}
function lifetimeHTML() {
  const s = loadStats();
  if (!s.games) return "";
  const cell = (v, l) => `<span><b>${v}</b>${l}</span>`;
  return `<p class="life-h">Your stats, every game</p><div class="life">` +
    cell(s.games, s.games === 1 ? "game" : "games") +
    (s.wins + s.losses ? cell(`${s.wins}–${s.losses}`, "won–lost") : "") +
    (s.coopGames ? cell(s.coopBest, "best co-op") : "") +
    cell(s.bullseyes, s.bullseyes === 1 ? "bullseye" : "bullseyes") +
    (s.psyRounds ? cell((s.psyPoints / s.psyRounds).toFixed(1), "pts as psychic") : "") +
    `</div>`;
}
function renderHomeStats() { $("homeStats").innerHTML = lifetimeHTML(); }

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
    case "hideBtn": return setHide(!hideTarget);
    case "lockBtn": return send({ t: "lock" });
    case "leftBtn": return send({ t: "side", side: "left" });
    case "rightBtn": return send({ t: "side", side: "right" });
    case "nextBtn": return send({ t: "next" });
    case "resultsBtn": if (S) showOver(S, false); return;
    case "againBtn": hideOver(); if (S && S.winner !== null) send({ t: "again" }); return;
    case "closeOverBtn": return hideOver();
    case "skipBtn": return send({ t: "skip" });
    case "startBtn": return send({ t: "start" });
    case "leaveBtn": hideOver(); return send({ t: "leave" });
    case "exitBtn":
      if (!exitArmed) return armExit(true);
      armExit(false); hideOver();
      return send({ t: "leave" });
    case "quickBtn": saveName(); setStatus("Finding a game…"); return send({ t: "quick" });
    case "themeBtn": return goTheme("new");
    case "muteBtn": snd.setMuted(!snd.isMuted()); return paintMute();
    case "tvBtn": {
      const code = $("codeInput").value.trim().toUpperCase();
      if (code.length !== 4) return toast("Type the room's code first.");
      location.search = `?tv=${code}`;
      return;
    }
  }
});
document.addEventListener("submit", (e) => {
  e.preventDefault();
  if (e.target.id === "clueForm") {
    const text = $("clueInput").value.trim();
    if (!text) return;
    send({ t: "clue", text });
  }
  if (e.target.id === "joinForm") {
    const code = $("codeInput").value.trim().toUpperCase();
    if (code.length === 4) { saveName(); send({ t: "join", code }); }
  }
});
$("createBtn").addEventListener("click", () => { saveName(); send({ t: "create" }); });
$("codeInput").addEventListener("input", (e) => { e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""); });

// The first tap asks "Sure?"; a second within a few seconds leaves.
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
    send({ t: "name", name: window.KmuftiYou.name() });
  }
}
$("nameInput").value = myName();
// a link with ?room=CODE drops you straight in
const linkCode = params.get("room");
if (linkCode) $("codeInput").value = linkCode.toUpperCase().slice(0, 4);

buildDial();
setWheel(PARK, false);
setNeedle(90);
paintMute();
renderHomeStats();
show("home");
setStatus(TV ? `Connecting to room ${tvCode}…` : "Connecting…");
connect();
// once connected and still not in a room, the link's code joins it
const joinFromLink = setInterval(() => {
  if (!ready) return;
  clearInterval(joinFromLink);
  if (!TV) setStatus("");
  if (linkCode && !S && !TV) send({ t: "join", code: linkCode });
}, 200);
