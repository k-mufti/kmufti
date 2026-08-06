(function () {
  "use strict";

  /* =========================================================================
     White Canvas — an always-on, SHARED r/place-style pixel wall.
     Drag anywhere to place pixels; one random palette colour per stroke.

     The canvas lives on a FIXED stage (STAGE_W × STAGE_H) that scales as a
     single unit, so a drawing lands on the same cells on every device. It is
     synced to draw/server.js over Server-Sent Events: the server holds the
     authoritative grid, streams a snapshot on connect, and broadcasts every
     accepted pixel to all viewers. Local edits are sent as batched POSTs and
     rate-limited by a shared paint clip + cooldown.

     NOTE: the stage/cell dimensions MUST match the server's grid (180 × 300)
     or this page would not line up with the same shared drawing.
     ========================================================================= */

  const STAGE_W = 1440;
  const STAGE_H = 2400;
  const CELL = 8;
  const GRID_W = STAGE_W / CELL; // 180
  const GRID_H = STAGE_H / CELL; // 300
  const N = GRID_W * GRID_H;     // 54,000 cells
  const EMPTY = 255;             // unpainted sentinel

  // Palette (indices 0..15) — kept in sync with draw/server.js.
  const PALETTE = [
    "#fb0000", "#ff4400", "#ffaf0d", "#ffde00", "#bbff00", "#62d42d", "#075327", "#34dcd3",
    "#1caffd", "#003eff", "#6400ff", "#ff8bf6", "#ff00b7", "#ffffff", "#898989", "#000000",
  ];

  // API base: same-origin /draw/api in production (nginx proxies it); the dev
  // server port in local dev. The server strips the /draw prefix either way.
  const isLocal = location.hostname === "localhost" || location.hostname === "127.0.0.1";
  const DRAW_API = (isLocal ? `${location.protocol}//${location.hostname}:8022` : "") + "/draw/api";

  // A stable per-visitor id keys the server-side paint meter across reloads.
  // Same storage key as the hub used, so an existing visitor keeps their clip.
  let clientId;
  try {
    clientId = localStorage.getItem("kmufti-draw-id") || "";
    if (!clientId) {
      clientId = Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem("kmufti-draw-id", clientId);
    }
  } catch { clientId = Math.random().toString(36).slice(2); }

  const gallery = document.getElementById("gallery");
  const stage = document.getElementById("stage");
  const canvas = document.getElementById("board");
  canvas.width = STAGE_W;
  canvas.height = STAGE_H;
  const ctx = canvas.getContext("2d");

  // Client mirror of the grid — lets us repaint cleanly (e.g. under the glow).
  let cells = new Uint8Array(N).fill(EMPTY);

  let drawing = false;
  let strokeColorIndex = (Math.random() * PALETTE.length) | 0;
  let nextColorIndex = (Math.random() * PALETTE.length) | 0; // previewed in the ink well
  let last = null;
  let lastCell = "";

  /* ---------- Paint allowance (mirror of the server clip + cooldown) ------- */
  // Draw up to `clip` pixels; the moment the clip hits 0, a hard `cooldownMs`
  // reload begins (no partial trickle). Server is authoritative.
  let clip = 200, cooldownMs = 10000;
  let left = clip;        // pixels remaining in the current clip
  let cooldownUntil = 0;  // performance.now() ms when reload completes (0 = ready)
  function meterReady() {
    const now = performance.now();
    if (cooldownUntil && now >= cooldownUntil) { left = clip; cooldownUntil = 0; }
    return !cooldownUntil && left > 0;
  }
  function spendPixel() {
    left -= 1;
    if (left <= 0) { left = 0; cooldownUntil = performance.now() + cooldownMs; }
    updateMeterUI();
  }
  function updateMeterUI() {
    const now = performance.now();
    if (cooldownUntil && now >= cooldownUntil) { left = clip; cooldownUntil = 0; }
    const liq = document.getElementById("inkLiquid");
    const lbl = document.getElementById("inkLabel");
    if (!liq) return;
    if (cooldownUntil) {
      const remain = Math.max(0, cooldownUntil - now);
      liq.style.height = 100 * (1 - remain / cooldownMs) + "%"; // refilling
      liq.style.background = "#c98a3a"; // amber while reloading
      if (lbl) lbl.textContent = Math.ceil(remain / 1000) + "s";
    } else {
      liq.style.height = (100 * left) / clip + "%";
      liq.style.background = PALETTE[nextColorIndex]; // preview: your next colour
      if (lbl) lbl.textContent = Math.round(left); // pixels left
    }
  }
  setInterval(updateMeterUI, 200);

  /* ---------- Fit the framed canvas to the screen width -------------------- */
  function fitStage() {
    const frameW = Math.min(window.innerWidth - 32, 2200);
    const s = Math.max(0, frameW / STAGE_W);
    gallery.style.width = STAGE_W * s + "px";
    gallery.style.height = STAGE_H * s + "px";
    stage.style.setProperty("--stage-scale", s);
  }

  /* ---------- Rendering --------------------------------------------------- */
  function paintCell(idx, colorIdx) {
    const cx = idx % GRID_W, cy = (idx / GRID_W) | 0;
    if (colorIdx === EMPTY) ctx.clearRect(cx * CELL, cy * CELL, CELL, CELL);
    else { ctx.fillStyle = PALETTE[colorIdx] || "#000"; ctx.fillRect(cx * CELL, cy * CELL, CELL, CELL); }
  }
  function renderAll() {
    ctx.clearRect(0, 0, STAGE_W, STAGE_H);
    for (let idx = 0; idx < N; idx++) {
      const v = cells[idx];
      if (v !== EMPTY) paintCell(idx, v);
    }
  }

  /* ---------- Neighbour glow: incoming pixels briefly flash ---------------- */
  const glow = new Map(); // idx -> start time
  const mine = new Map(); // idx -> time I painted it (suppresses self-glow)
  const GLOW_MS = 600;
  let glowRAF = null;
  function addGlow(idx) { glow.set(idx, performance.now()); if (!glowRAF) glowRAF = requestAnimationFrame(glowLoop); }
  function glowLoop(now) {
    glowRAF = null;
    glow.forEach((t, idx) => {
      const age = now - t;
      paintCell(idx, cells[idx]); // clean base first
      if (age >= GLOW_MS) { glow.delete(idx); return; }
      const a = 0.6 * (1 - age / GLOW_MS);
      const cx = idx % GRID_W, cy = (idx / GRID_W) | 0;
      ctx.fillStyle = `rgba(255,255,255,${a})`;
      ctx.fillRect(cx * CELL, cy * CELL, CELL, CELL);
    });
    if (glow.size) glowRAF = requestAnimationFrame(glowLoop);
  }

  /* ---------- Drawing (fixed stage coordinates) --------------------------- */
  function pointFromEvent(e) {
    const r = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * STAGE_W,
      y: ((e.clientY - r.top) / r.height) * STAGE_H,
    };
  }

  function fillCellAt(x, y) {
    const cx = Math.floor(x / CELL);
    const cy = Math.floor(y / CELL);
    if (cx < 0 || cy < 0 || cx >= GRID_W || cy >= GRID_H) return;
    const key = cx + "," + cy;
    if (key === lastCell) return;
    lastCell = key;
    if (!meterReady()) return; // out of paint — reloading
    spendPixel();
    const idx = cy * GRID_W + cx;
    cells[idx] = strokeColorIndex;
    paintCell(idx, strokeColorIndex);
    mine.set(idx, performance.now());
    enqueueCell(idx, strokeColorIndex);
  }

  function paintLine(a, b) {
    const dx = b.x - a.x, dy = b.y - a.y;
    const dist = Math.hypot(dx, dy);
    const steps = Math.max(1, Math.ceil(dist / (CELL / 2)));
    for (let i = 1; i <= steps; i++) fillCellAt(a.x + (dx * i) / steps, a.y + (dy * i) / steps);
  }

  function startDraw(e) {
    if (e.button !== undefined && e.button !== 0) return;
    drawing = true;
    strokeColorIndex = nextColorIndex; // use the previewed colour
    lastCell = "";
    last = pointFromEvent(e);
    fillCellAt(last.x, last.y);
    canvas.setPointerCapture && canvas.setPointerCapture(e.pointerId);
  }
  function moveDraw(e) {
    if (!drawing) return;
    const events = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
    for (const ev of events) { const p = pointFromEvent(ev); paintLine(last, p); last = p; }
  }
  function endDraw() {
    if (!drawing) return;
    drawing = false; last = null; lastCell = "";
    flushOutbox();
    nextColorIndex = (Math.random() * PALETTE.length) | 0; // load & preview the next colour
    updateMeterUI();
  }

  canvas.addEventListener("pointerdown", startDraw);
  canvas.addEventListener("pointermove", moveDraw);
  window.addEventListener("pointerup", endDraw);
  window.addEventListener("pointercancel", endDraw);

  /* ---------- Send strokes (batched POST) --------------------------------- */
  let outbox = [];
  let sendTimer = null;
  function enqueueCell(idx, colorIdx) {
    outbox.push([idx, colorIdx]);
    if (!sendTimer) sendTimer = setTimeout(flushOutbox, 80);
  }
  function flushOutbox() {
    if (sendTimer) { clearTimeout(sendTimer); sendTimer = null; }
    if (!outbox.length) return;
    const batch = outbox; outbox = [];
    fetch(`${DRAW_API}/paint`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: clientId, cells: batch }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (!d) return;
        if (d.clip) clip = d.clip;
        if (typeof d.cooldownMs === "number" && d.cooldownMs > 0) {
          cooldownUntil = performance.now() + d.cooldownMs; // server authoritative
          left = 0;
        } else if (typeof d.left === "number") {
          left = Math.min(left, d.left);
          cooldownUntil = 0;
        }
        updateMeterUI();
      })
      .catch(() => { /* offline / server down — keep drawing locally */ });
  }

  /* ---------- Receive: live stream ---------------------------------------- */
  function setPresence(n) {
    const el = document.getElementById("drawPresence");
    if (el) el.textContent = n > 0 ? "● " + n + " here" : "";
  }
  function applyDelta(arr) {
    const now = performance.now();
    for (let k = 0; k + 1 < arr.length; k += 2) {
      const idx = arr[k], c = arr[k + 1];
      if (idx < 0 || idx >= N) continue;
      cells[idx] = c;
      paintCell(idx, c);
      const m = mine.get(idx);
      if (m && now - m < 1500) continue; // my own pixel echoed back — no glow
      addGlow(idx);
    }
    // prune old "mine" marks
    if (mine.size > 4000) mine.forEach((t, i) => { if (now - t > 3000) mine.delete(i); });
  }
  function onInit(d) {
    if (d.clip) clip = d.clip;
    if (d.cooldownMs) cooldownMs = d.cooldownMs;
    if (typeof d.grid === "string") {
      const bin = atob(d.grid);
      const snap = new Uint8Array(N).fill(EMPTY);
      for (let i = 0; i < N && i < bin.length; i++) snap[i] = bin.charCodeAt(i);
      cells = snap;
      glow.clear();
      renderAll();
    }
    updateMeterUI();
  }

  function connect() {
    let es;
    try { es = new EventSource(`${DRAW_API}/stream`); }
    catch { return; }
    es.addEventListener("init", (e) => { try { onInit(JSON.parse(e.data)); } catch {} });
    es.addEventListener("px", (e) => { try { applyDelta(JSON.parse(e.data)); } catch {} });
    es.addEventListener("presence", (e) => { try { setPresence(JSON.parse(e.data).count); } catch {} });
    es.addEventListener("clear", () => { cells.fill(EMPTY); glow.clear(); ctx.clearRect(0, 0, STAGE_W, STAGE_H); });
    // EventSource auto-reconnects; on reconnect the server re-sends "init".
  }

  /* ---------- Boot -------------------------------------------------------- */
  fitStage();
  updateMeterUI();
  connect();

  let resizeTimer = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(fitStage, 120);
  });
})();
