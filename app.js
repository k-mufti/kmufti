(function () {
  "use strict";

  /* =========================================================================
     kmufti.com — an app launcher over an always-on, r/place-style pixel
     canvas: drag anywhere to place pixels, one random color per stroke.

     The tiles AND the canvas live on one FIXED stage (STAGE_W × STAGE_H).
     The stage is scaled as a single unit to fit any screen, so the drawing
     and the tiles always line up the same way on every device — a circle
     drawn over a tile stays over that tile everywhere. Because both scale
     together, resizing only changes the CSS scale; nothing is redrawn.

     Drawings persist per-visitor in localStorage. sendStroke() is the seam
     where a shared backend would hook in later.
     ========================================================================= */

  const STORAGE_KEY = "kmufti-stage-v2";

  // The fixed stage (the framed canvas). Tiles and canvas both live here and
  // scale together. CELL is the pixel size in stage px.
  const STAGE_W = 1440;
  const STAGE_H = 2400;
  const CELL = 8;

  function randomColor() {
    // Fully random across the whole hex space: any of 16,777,216 colors.
    const hex = Math.floor(Math.random() * 0x1000000)
      .toString(16)
      .padStart(6, "0");
    return "#" + hex;
  }

  const galleryArea = document.getElementById("galleryArea");
  const gallery = document.getElementById("gallery");
  const stage = document.getElementById("stage");
  const canvas = document.getElementById("board");
  canvas.width = STAGE_W; // fixed backing store; a CSS transform scales it
  canvas.height = STAGE_H;
  const ctx = canvas.getContext("2d");

  let drawing = false;
  let strokeColor = randomColor(); // one random color per stroke
  let last = null; // previous pointer position, in stage coords
  let lastCell = ""; // last painted cell key, so a drag doesn't repaint it
  let saveTimer = null;

  /* ---------- Fit the framed gallery to the screen width. The frame can be
     taller than the viewport — the page scrolls down to deep space. -------- */
  function fitStage() {
    // Fill the width (with a small side margin), capped so it doesn't get
    // absurd on ultrawide monitors. Height follows the fixed board aspect.
    const frameW = Math.min(window.innerWidth - 32, 2200);
    const s = Math.max(0, frameW / STAGE_W);
    gallery.style.width = STAGE_W * s + "px";
    gallery.style.height = STAGE_H * s + "px";
    stage.style.setProperty("--stage-scale", s);
  }

  /* ---------- Drawing (all in fixed stage coordinates) ------------------- */
  // Screen point -> stage coordinates. getBoundingClientRect() already
  // reflects the CSS scale, so dividing by the rect size maps back to stage px.
  function pointFromEvent(e) {
    const r = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * STAGE_W,
      y: ((e.clientY - r.top) / r.height) * STAGE_H,
    };
  }

  // Fill the grid cell containing stage point (x, y) with the stroke color.
  function fillCellAt(x, y) {
    const cx = Math.floor(x / CELL);
    const cy = Math.floor(y / CELL);
    if (cx < 0 || cy < 0 || cx * CELL >= STAGE_W || cy * CELL >= STAGE_H) return;
    const key = cx + "," + cy;
    if (key === lastCell) return; // just painted this one — skip
    lastCell = key;
    ctx.fillStyle = strokeColor;
    ctx.fillRect(cx * CELL, cy * CELL, CELL, CELL);
    sendStroke(cx, cy, strokeColor); // shared-canvas seam
  }

  // Walk the line between two stage points, filling every cell along the way,
  // so a fast cursor move leaves a continuous run of pixels instead of gaps.
  function paintLine(a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dist = Math.hypot(dx, dy);
    const steps = Math.max(1, Math.ceil(dist / (CELL / 2)));
    for (let i = 1; i <= steps; i++) {
      fillCellAt(a.x + (dx * i) / steps, a.y + (dy * i) / steps);
    }
  }

  function startDraw(e) {
    if (e.button !== undefined && e.button !== 0) return;
    drawing = true;
    strokeColor = randomColor(); // a fresh color for this stroke
    lastCell = "";
    last = pointFromEvent(e);
    fillCellAt(last.x, last.y);
    canvas.setPointerCapture && canvas.setPointerCapture(e.pointerId);
  }

  function moveDraw(e) {
    if (!drawing) return;
    const events = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
    for (const ev of events) {
      const p = pointFromEvent(ev);
      paintLine(last, p);
      last = p;
    }
  }

  function endDraw() {
    if (!drawing) return;
    drawing = false;
    last = null;
    lastCell = "";
    scheduleSave();
  }

  canvas.addEventListener("pointerdown", startDraw);
  canvas.addEventListener("pointermove", moveDraw);
  window.addEventListener("pointerup", endDraw);
  window.addEventListener("pointercancel", endDraw);

  /* ---------- Persistence (per-visitor, localStorage) --------------------- */
  function scheduleSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(save, 500);
  }

  function save() {
    try {
      // The canvas is a fixed STAGE_W×STAGE_H bitmap, so this is device-independent.
      localStorage.setItem(STORAGE_KEY, canvas.toDataURL("image/png"));
    } catch (err) {
      /* quota exceeded / storage blocked — drawing just won't persist */
    }
  }

  window.addEventListener("pagehide", save);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") save();
  });

  function restore() {
    let data;
    try {
      data = localStorage.getItem(STORAGE_KEY);
    } catch (err) {
      return;
    }
    if (!data) return;
    const img = new Image();
    img.onload = function () {
      ctx.drawImage(img, 0, 0, STAGE_W, STAGE_H);
    };
    img.src = data;
  }

  /* ---------- Shared-canvas seam (no-op until a backend exists) ----------- */
  function sendStroke(/* cx, cy, color */) {}

  /* ---------- Clear (the only control — drawing is always on) ------------- */
  document.getElementById("clear").addEventListener("click", () => {
    ctx.clearRect(0, 0, STAGE_W, STAGE_H);
    save();
  });

  /* ---------- App launcher (from projects.js) ----------------------------- */
  const appsWrap = document.getElementById("apps");
  const projects = typeof PROJECTS !== "undefined" ? PROJECTS : [];
  projects.forEach((p) => {
    const live = p.status !== "soon";
    const el = document.createElement(live ? "a" : "div");
    el.className = "app" + (live ? "" : " soon");
    if (live) el.href = p.href;

    const art = document.createElement("div");
    art.className = "app-art";
    const custom = (typeof ARTWORK !== "undefined" && ARTWORK[p.slug]) ? ARTWORK[p.slug] : null;
    art.innerHTML = custom
      || `<div class="app-art-fallback" style="background:${p.accentBg || "#111"}">${p.title.charAt(0)}</div>`;

    const label = document.createElement("div");
    label.className = "app-label";
    label.textContent = p.title;

    el.appendChild(art);
    el.appendChild(label);

    if (!live) {
      const sub = document.createElement("div");
      sub.className = "app-sub";
      sub.textContent = "soon";
      el.appendChild(sub);
    }

    appsWrap.appendChild(el);
  });

  /* ---------- Boot -------------------------------------------------------- */
  fitStage();
  restore();

  let resizeTimer = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(fitStage, 120);
  });
})();
