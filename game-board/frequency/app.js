// Frequency (once Wavelenght) - the page. The server (../server.js) runs the room and keeps
// the target secret; this draws the dial and turns what you do into
// messages.
//
// The dial is a radio: the broadcaster scans for a station only they can
// hear, sends a transmission (the clue), and the listeners tune the needle
// to where they think it is. Same rules as the board game it grew from.
//
// The same page is the TV: open it with ?tv=CODE and it watches that room,
// big, with no buttons, and never sees the target before everyone does.
import { SPREAD, tier } from "./rules.js?v=3";
import * as snd from "./sound.js?v=3";
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

const TEAM_NAMES = ["Team AM", "Team FM"];
const PARK = 999;      // a signal "here" is off the air: no station yet

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
   The radio
   ======================================================================== */
// The dial, built into a radio: a half-circle face with a spectrum of bars
// round its rim - a still noise floor, with a peak rising where the station
// is (the hidden target) - a sheet of static over it all that only the
// broadcaster sees through, and a glowing needle swinging from the tuning
// knob in the middle. It's the same 0-180 reading the server scores.
const R = 420;                                    // the face
const pt = (deg, r) => {
  const a = (deg * Math.PI) / 180;
  return [-r * Math.cos(a), -r * Math.sin(a)];
};
const HALF = (r) => `M${-r} 0A${r} ${r} 0 0 1 ${r} 0Z`;
const dial = $("dial");
let cover, needleG, popG, popText, knobG, wave, staticImg;

// a few tiles of TV static, swapped quickly so the noise crawls
const STATIC = [];
function makeStatic() {
  for (let k = 0; k < 4; k++) {
    const c = document.createElement("canvas");
    c.width = 200; c.height = 120;
    const g = c.getContext("2d"), img = g.createImageData(200, 120);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.random() * 255, tint = Math.random();
      img.data[i] = v * (tint < 0.08 ? 1 : 0.55) + 20;            // a little pink
      img.data[i + 1] = v * 0.5 + 10;
      img.data[i + 2] = v * (tint > 0.9 ? 1 : 0.75) + 40;         // and a little blue
      img.data[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    STATIC.push(c.toDataURL());
  }
}

// the peak's colour, `off` from its middle (0) to its edge (1): the heat
// word's colours, white-hot through gold, orange and pink out to blue
const HEAT = [[255, 250, 237], [255, 204, 115], [255, 128, 51], [250, 71, 189], [201, 58, 216], [41, 117, 250]];
function heat(off) {
  const t = Math.min(1, Math.max(0, off)) * (HEAT.length - 1), i = Math.min(HEAT.length - 2, Math.floor(t)), f = t - i;
  return `rgb(${HEAT[i].map((v, k) => Math.round(v + (HEAT[i + 1][k] - v) * f))})`;
}
const bars = [];
let barsG, wheel;      // the two looks: the spectrum (new) and the five-band wedge (classic)

// The new look draws the spectrum; the classic wedge stays built (it's
// what the drawing loop falls back to) but hidden.
const theme = "spectrum";
function paintTheme() {
  barsG.style.display = theme === "spectrum" ? "" : "none";
  wheel.style.display = theme === "classic" ? "" : "none";
}

function buildDial() {
  dial.setAttribute("viewBox", "-480 -462 960 524");
  const defs = mk("defs", {}, dial);
  // the cabinet's grain, like the deep blue of the heat word
  const f = mk("filter", { id: "speck", x: "0", y: "0", width: "100%", height: "100%" }, defs);
  mk("feTurbulence", { type: "fractalNoise", baseFrequency: "0.9", numOctaves: "2", seed: "4", result: "n" }, f);
  mk("feColorMatrix", { in: "n", type: "matrix", result: "dots",
    values: "0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 -2.6 1.55" }, f);
  mk("feComposite", { in: "dots", in2: "SourceGraphic", operator: "in", result: "d" }, f);
  mk("feComponentTransfer", { in: "d", result: "faint" }, f).appendChild(mk("feFuncA", { type: "linear", slope: "0.08" }));
  const m = mk("feMerge", {}, f);
  mk("feMergeNode", { in: "SourceGraphic" }, m);
  mk("feMergeNode", { in: "faint" }, m);
  const clip = mk("clipPath", { id: "face" }, defs);
  mk("path", { d: HALF(R) }, clip);
  const pat = mk("pattern", { id: "static", patternUnits: "userSpaceOnUse", width: 200, height: 120 }, defs);
  staticImg = mk("image", { width: 200, height: 120, preserveAspectRatio: "none" }, pat);

  // the cabinet, its pink trim, and the name on it
  mk("rect", { x: -474, y: -456, width: 948, height: 620, rx: 40, class: "cabinet", filter: "url(#speck)" }, dial);
  mk("rect", { x: -474, y: -456, width: 948, height: 620, rx: 40, class: "trim" }, dial);

  // the speaker, either side of the knob
  const grille = mk("g", { class: "grille" }, dial);
  for (const sx of [-1, 1]) for (let r = 0; r < 2; r++) for (let c = 0; c < 20; c++) {
    mk("circle", { cx: sx * (86 + c * 17), cy: 18 + r * 17, r: 4.4 }, grille);
  }

  // the face: dark glass, the band printed round the edge
  mk("path", { d: HALF(R + 16), class: "bezel" }, dial);
  const face = mk("g", { "clip-path": "url(#face)" }, dial);
  mk("path", { d: HALF(R), class: "glass" }, face);
  for (let k = 0; k <= 40; k++) {
    const a = (k / 40) * 180, major = k % 4 === 0;
    const [x1, y1] = pt(a, R - 4), [x2, y2] = pt(a, R - (major ? 22 : 13));
    mk("line", { x1, y1, x2, y2, class: major ? "tick major" : "tick" }, face);
  }

  // the spectrum: a bar every 3 degrees right round the face, pointing in
  // from the rim. Most sit low and still - the noise floor - and the ones
  // over the station rise into a peak, tallest at the 5, coloured hot to
  // cold from its middle out. Drawn fresh each frame (drawSpectrum).
  barsG = mk("g", {}, face);
  for (let a = 1.5; a < 180; a += 3) {
    bars.push({ a, el: mk("line", { class: "sbar" }, barsG), floor: 17 + 7 * Math.random(), ph: Math.random() * 9 });
  }

  // the classic look: five wedges, 1-3-5-3-1, drawn round the top and turned
  // into place
  wheel = mk("g", { class: "wheel" }, face);
  const RB = R - 58, W = SPREAD / 5;
  ["band-2", "band-3", "band-4", "band-3", "band-2"].forEach((cls, i) => {
    const a1 = 90 - SPREAD / 2 + i * W, a2 = a1 + W;
    const [x1, y1] = pt(a1, RB), [x2, y2] = pt(a2, RB);
    mk("path", { d: `M0 0L${x1.toFixed(1)} ${y1.toFixed(1)}A${RB} ${RB} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)}Z`, class: cls }, wheel);
    const [tx, ty] = pt(a1 + W / 2, RB - 30);
    const t = mk("text", { x: tx.toFixed(1), y: ty.toFixed(1), class: i === 2 ? "band-num dark" : "band-num", transform: `rotate(${a1 + W / 2 - 90} ${tx.toFixed(1)} ${ty.toFixed(1)})` }, wheel);
    t.textContent = [1, 3, 5, 3, 1][i];
  });

  // the signal's shape, drawn round the face at the reveal: clean if you were close
  wave = mk("path", { class: "wave", d: "" }, face);

  // the static over the face, and the broadcaster's peek through it
  cover = mk("g", { class: "cover" }, face);
  mk("path", { d: HALF(R), fill: "url(#static)" }, cover);
  mk("path", { d: HALF(R), class: "cover-tint" }, cover);

  // the needle, swinging from the tuning knob
  needleG = mk("g", { class: "needle" }, dial);
  mk("rect", { x: -3, y: -(R - 6), width: 6, height: R - 6, rx: 3, class: "needle-line" }, needleG);
  mk("circle", { cy: -(R - 10), r: 7, class: "needle-tip" }, needleG);
  knobG = mk("g", { class: "knob" }, dial);
  const kg = mk("g", { class: "knob-turn" }, knobG);
  mk("circle", { r: 46, class: "knob-rim" }, kg);
  for (let k = 0; k < 30; k++) mk("rect", { x: -2.2, y: -46, width: 4.4, height: 8, rx: 2, class: "knob-ridge", transform: `rotate(${k * 12})` }, kg);
  mk("circle", { r: 35, class: "knob-top" }, kg);
  mk("circle", { cx: 0, cy: -24, r: 6, class: "knob-dot" }, kg);

  // the points, popping up where the needle landed
  popG = mk("g", { class: "pop" }, dial);
  const inner = mk("g", { class: "pop-in" }, popG);
  mk("circle", { r: 44, class: "pop-bg" }, inner);
  popText = mk("text", { class: "pop-num" }, inner);

  // a click on the face is the broadcaster's peek, too
  mk("path", { d: HALF(R), class: "glass-hit" }, dial);
}

setInterval(() => {
  // the static crawls while it's up
  if (!staticImg || !STATIC.length || screenOpen) return;
  staticImg.setAttribute("href", STATIC[(Math.random() * STATIC.length) | 0]);
}, 70);

let wheelAt = null;    // where the station sits (a dial reading), or null: off the air
let shownAt = null;    // where the peak is drawn right now - it moves while scanning
let scanFrom = 0, scanStart = 0, scanPath = null;
function setWheel(target, spin) {
  scanPath = null;
  if (target > 180) {                     // parked: no station yet
    wheelAt = shownAt = null;
    return;
  }
  if (spin) {
    // scanning: it sweeps round the dial and back, slowing, then locks on
    scanPath = [wheelAt === null ? -40 : wheelAt, 210, -30, 175, 5, target];
    scanStart = performance.now();
  }
  wheelAt = target;
  if (!spin) shownAt = target;
}
const SCAN_MS = 2400;
const peakPts = (off) => (Math.abs(off) > SPREAD / 2 ? 0 : 5 - 4 * Math.abs(off) / (SPREAD / 2));
let peakStill = false; // the reveal freezes the peak so the needle reads clearly
function drawSpectrum(now) {
  if (scanPath) {
    const x = Math.min(1, (now - scanStart) / SCAN_MS), e = 1 - Math.pow(1 - x, 2.2);
    const seg = Math.min(scanPath.length - 2, Math.floor(e * (scanPath.length - 1))), f = e * (scanPath.length - 1) - seg;
    shownAt = scanPath[seg] + (scanPath[seg + 1] - scanPath[seg]) * f;
    if (x >= 1) { scanPath = null; shownAt = wheelAt; }
  }
  if (theme === "classic") {
    wheel.style.opacity = shownAt === null ? 0 : 1;
    if (shownAt !== null) wheel.setAttribute("transform", `rotate(${(shownAt - 90).toFixed(2)})`);
    requestAnimationFrame(drawSpectrum);
    return;
  }
  const top = R * 0.63;
  for (const b of bars) {
    const off = shownAt === null ? 999 : b.a - shownAt, p = peakPts(off);
    const len = p ? (p / 5) * top + (peakStill ? 0 : 12 * Math.sin(now / 700 + b.ph)) : b.floor;
    const [x1, y1] = pt(b.a, R - 30), [x2, y2] = pt(b.a, R - 30 - len);
    b.el.setAttribute("x1", x1.toFixed(1)); b.el.setAttribute("y1", y1.toFixed(1));
    b.el.setAttribute("x2", x2.toFixed(1)); b.el.setAttribute("y2", y2.toFixed(1));
    if (p) b.el.setAttribute("style", `stroke:${heat(Math.abs(off) / (SPREAD / 2))}`);
    else b.el.removeAttribute("style");
  }
  requestAnimationFrame(drawSpectrum);
}
function spinBlind() {
  // the real station's a secret here: it scans to somewhere random, under the static
  setWheel(Math.random() * 180, true);
}

let screenOpen = false;
function setScreen(open, slow) {
  if (open === screenOpen) return;
  screenOpen = open;
  cover.classList.toggle("slow", !!slow);
  cover.classList.toggle("clear", open);
  snd.hiss(slow ? 1.6 : 0.5);
}

// The broadcaster sees the signal all round, from picking the station to
// the reveal - unless they've hidden it, for a phone up on a big screen.
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
  if (!S || S.phase === "reveal") return;          // the reveal clears it itself
  setScreen(psychicSees() && !hideTarget);
}

let needleAt = 90;
function setNeedle(a, smooth) {
  // a click of the tuning knob every 3 degrees it passes
  if (Math.floor(a / 3) !== Math.floor(needleAt / 3)) snd.tick(smooth);
  needleAt = a;
  needleG.classList.toggle("smooth", !!smooth);
  knobG.classList.toggle("smooth", !!smooth);
  needleG.style.transform = `rotate(${(a - 90).toFixed(1)}deg)`;
  knobG.querySelector(".knob-turn").style.transform = `rotate(${(a - 90).toFixed(1)}deg)`;
}

/* ---------- tuning in ---------- */
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

// The broadcaster taps the glass to hide or show the signal.
dial.addEventListener("click", (e) => {
  if (!e.target.classList.contains("glass-hit")) return;
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
    snd.scan(2.4);
    return;
  }
  if (m.t === "locked") { snd.lock(); snd.beep(false); snd.buzz(40); return; }
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
        snd.beep(true);
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
  peakStill = true;
  const [px, py] = pt(needle, R * 0.6);
  popG.setAttribute("transform", `translate(${px.toFixed(1)} ${py.toFixed(1)})`);
  popG.setAttribute("class", `pop show p${tier(points)}`);
  popText.textContent = points ? `+${points}` : "0";
  // the signal's shape, round the face: a clean wave if you were close, noise if not
  const noise = Math.min(1, Math.abs(needle - target) / 45);
  const amp = 24 * (1 - noise * 0.6);
  let d = "";
  for (let a = 0; a <= 180; a += 1.5) {
    const [x, y] = pt(a, R * 0.8 + amp * Math.sin(a * 0.6) + (Math.random() - 0.5) * 64 * noise);
    d += `${d ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  wave.setAttribute("d", d);
  wave.classList.add("show");
}
function clearPop() {
  peakStill = false;
  popG.setAttribute("class", "pop");
  wave.classList.remove("show");
}

// A long word on the side of the page shrinks until it fits its column.
function fitEnds() {
  for (const el of [$("endL"), $("endR")]) {
    el.style.fontSize = "";
    if (!el.clientWidth) continue;               // the phone layout: it's a card, it wraps
    const range = document.createRange();
    range.selectNodeContents(el);
    let size = parseFloat(getComputedStyle(el).fontSize);
    while (range.getBoundingClientRect().width > el.clientWidth + 1 && size > 14) el.style.fontSize = `${--size}px`;
  }
}
addEventListener("resize", () => { if (document.body.classList.contains("split")) fitEnds(); });

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
// Hot on the left, cold on the right, like the two ends of the heat word.
const CARD_COLORS = [["#e0379f", "#2463d8"], ["#f0702a", "#0f2b9a"], ["#c93ad8", "#1d8fe0"], ["#ff4f7b", "#3046c8"], ["#e85d1f", "#6a3cf0"], ["#d6338f", "#1499c9"]];
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
    if (inGame && p.id === S.psychic) tags.push("broadcaster");
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
  $("tvOn").textContent = S.watchers ? `📺 ${S.watchers === 1 ? "A TV is" : `${S.watchers} TVs are`} showing this room.` : "";

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
    fitEnds();
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
      if (matchMedia("(min-width: 900px)").matches) snd.hiss(0.7);
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
        banner = "You're the broadcaster. Pick a card.";
        bits.push(`<div class="pick">${S.choices.map((c, i) => `<button class="card-btn" data-pick="${i}" style="background:linear-gradient(90deg, ${cardColors(c)[0]} 50%, ${cardColors(c)[1]} 50%)">${cardHTML(c)}</button>`).join("")}</div>`);
      } else banner = `${psy} is the broadcaster and is picking a card.`;
      break;
    case "clue":
      if (isPsychic()) {
        if (!S.spun) {
          banner = hideTarget
            ? "Spin the dial. The static stays up, so the room can't see where it lands."
            : "Spin the dial and watch where the target lands.";
          bits.push(`<button class="btn big" id="spinBtn">Spin</button>`);
        } else {
          banner = hideTarget
            ? "The target's hidden. Show it when nobody else is looking."
            : "Give a clue that gets your team to the target.";
          bits.push(`<form class="clue-form" id="clueForm"><input id="clueInput" maxlength="60" placeholder="Your clue" autocomplete="off" spellcheck="false" /><button class="btn" type="submit">Send</button></form>`);
        }
        hideBtn();
      } else banner = S.spun ? `${psy} is thinking of a clue…` : `${psy} is spinning the dial…`;
      break;
    case "guess":
      if (isPsychic()) { banner = "Your team is guessing. No hints, no faces!"; hideBtn(); }
      else if (isGuesser()) {
        banner = "Talk it over, drag the needle to where you think the target is, then lock it in.";
        bits.push(`<button class="btn big" id="lockBtn">Lock it in</button>`);
      } else banner = `${team} is guessing.${TV || S.mode === "coop" ? "" : " You'll call left or right next."}`;
      break;
    case "side":
      if (isCaller()) banner = "Is the target to the left or the right of their needle? Call it right for a point.";
      else banner = `${TEAM_NAMES[1 - S.activeTeam]} is calling left or right…`;
      if (isPsychic()) hideBtn();
      break;
    case "reveal": {
      if (revealing) { banner = `<span class="drum">Clearing the static…</span>`; break; }
      const r = S.result;
      const pts = r.points ? `<b class="pts p${tier(r.points)}">+${r.points}</b>` : `<b class="pts p0">0</b>`;
      if (S.mode === "coop") {
        banner = r.points ? `${pts} ${tier(r.points) === 4 ? "Perfect signal!" : tier(r.points) === 3 ? "Good signal." : "Weak signal."}${r.bonusCard ? " A perfect signal earns an extra card." : ""}` : `${pts} Dead air.`;
      } else {
        const other = TEAM_NAMES[1 - S.activeTeam];
        const side = S.side ? (r.sidePoint ? `${other} called ${S.side}: +1.` : `${other} called ${S.side}: no point.`) : "";
        banner = `${pts} for ${TEAM_NAMES[S.activeTeam]}${tier(r.points) === 4 ? " - perfect signal!" : r.points ? "." : ": dead air."} ${side}`;
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
  awards.push(["📶", "Perfect signals", `${bulls} of ${h.length} round${h.length === 1 ? "" : "s"}`]);
  const byPsy = new Map();
  for (const r of h) {
    const e = byPsy.get(r.psychic) || { name: name(r.psychic) || r.psychicName, pts: 0, n: 0 };
    e.pts += r.points; e.n++;
    byPsy.set(r.psychic, e);
  }
  const best = [...byPsy.values()].sort((a, b) => b.pts / b.n - a.pts / a.n || b.n - a.n)[0];
  if (best) awards.push(["📻", "Clearest broadcaster", `${esc(best.name)} · ${(best.pts / best.n).toFixed(1)} a round`]);
  if (h.length) {
    const off = (r) => Math.abs(r.needle - r.target);
    const close = h.reduce((a, b) => (off(b) < off(a) ? b : a));
    const wild = h.reduce((a, b) => (off(b) > off(a) ? b : a));
    awards.push(["🎯", "Closest tune-in", `“${esc(close.clue)}” · ${off(close).toFixed(1)}° off`]);
    if (wild !== close) awards.push(["🛸", "Most dead air", `“${esc(wild.clue)}” · ${off(wild).toFixed(0)}° off`]);
  }
  if (st.mode === "teams") {
    for (const t of [0, 1]) {
      const calls = h.filter((r) => r.team === 1 - t && r.side);
      if (calls.length) awards.push(["↔️", `${TEAM_NAMES[t]}'s calls`, `${calls.filter((r) => r.sidePoint).length} of ${calls.length} right`]);
    }
  }

  // every round: the card, the clue, and a little strip with the target
  // (the band) and where the needle landed (the red line)
  const rows = h.map((r) => {
    const who = st.mode === "teams" ? `<span class="dot t${r.team}"></span>` : "";
    return `<li>${who}<span class="rc"><b>${esc(r.card[0])} ↔ ${esc(r.card[1])}</b><span>“${esc(r.clue)}” · ${esc(name(r.psychic) || r.psychicName)}</span></span>` +
      `<span class="mini"><i class="t" style="left:${((r.target / 180) * 100).toFixed(1)}%"></i><i class="n" style="left:${((r.needle / 180) * 100).toFixed(1)}%"></i></span>` +
      `<b class="pts p${tier(r.points)}">${r.points ? `+${r.points}` : "0"}</b></li>`;
  }).join("");

  $("over").innerHTML =
    `<div class="over-card">` +
      (loud ? `<div class="confetti" aria-hidden="true">${confetti()}</div>` : "") +
      `<p class="over-kicker">Signal report · ${st.mode === "coop" ? "final score" : "game over"}</p>` +
      `<h2 class="over-head">${esc(head)}</h2>` +
      `<p class="over-sub">${esc(sub)}</p>` +
      `<div class="awards">${awards.map(([i, t, v]) => `<div class="award"><span class="ai">${i}</span><span class="at">${esc(t)}</span><span class="av">${v}</span></div>`).join("")}</div>` +
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
  const colors = ["#ff73e0", "#fa47bd", "#ff8033", "#ffcc73", "#fffaed", "#9ed6ff", "#2975fa"];
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
    cell(s.bullseyes, s.bullseyes === 1 ? "perfect signal" : "perfect signals") +
    (s.psyRounds ? cell((s.psyPoints / s.psyRounds).toFixed(1), "pts broadcasting") : "") +
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
    case "themeBtn": return goTheme("old");
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

function paintMute() {
  const m = snd.isMuted();
  $("muteBtn").textContent = m ? "🔇" : "🔊";
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

makeStatic();
buildDial();

setWheel(PARK, false);
setNeedle(90);
paintTheme();
requestAnimationFrame(drawSpectrum);
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
