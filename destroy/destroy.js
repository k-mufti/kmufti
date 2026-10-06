/* =========================================================================
   Destroy — turns whatever page it's loaded into into a level.

   Every word on the page is wrapped in its own <dz-w> element and measured
   once; those boxes (and every image, video, button…) become one-way
   platforms you can stand on and targets you can shoot. Nothing ever
   reflows: a destroyed word is only made invisible, so every other box
   stays exactly where it was measured, and the debris — letters, shards,
   fire — is drawn on one fixed canvas laid over the page.

   Loaded three ways, all running this same file:
     /destroy/demo.html        the demo article
     /destroy/play.html?p=/    any kmufti.com page, in a same-origin frame
     the bookmarklet           any page on the web (CSP permitting)
   ========================================================================= */
(() => {
  "use strict";
  if (window.__kmDestroy) return;
  window.__kmDestroy = true;

  const doc = document, win = window, root = doc.documentElement;
  const DPR = Math.min(win.devicePixelRatio || 1, 2);
  const TAU = Math.PI * 2;

  // ---------- Tuning ----------
  const GRAVITY = 2200, RUN = 330, ACCEL = 2600, AIR_ACCEL = 1600, FRICTION = 2400;
  const JUMP_V = 720, DJUMP_V = 640, FLY_THRUST = 3600, FLY_MAX_UP = 430, FUEL_MAX = 1.6;
  const PW = 22, PH = 40;          // player hitbox
  const CELL = 64;                 // collision grid cell
  const MAX_WORDS = 9000, MAX_LETTERS = 2500, MAX_SHARDS = 450, MAX_PARTICLES = 1400;

  const WEAPONS = [
    { name: "Pistol",  rate: 0.2,  speed: 1500, spread: 0.02, count: 1, dmg: 1, color: "#ffe066", gun: 14 },
    { name: "Shotgun", rate: 0.65, speed: 1300, spread: 0.2,  count: 7, dmg: 1, color: "#ffb347", gun: 20, life: 0.3 },
    { name: "SMG",     rate: 0.06, speed: 1700, spread: 0.09, count: 1, dmg: 1, color: "#fff3a0", gun: 17 },
    { name: "Rocket",  rate: 0.8,  speed: 760,  spread: 0,    count: 1, rocket: true, radius: 115, color: "#ff6a3d", gun: 24 },
    { name: "Laser",   laser: true, dps: 16, color: "#ff3df2", gun: 20 },
  ];

  const rand = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const approach = (v, t, d) => (v < t ? Math.min(v + d, t) : Math.max(v - d, t));

  // =========================================================================
  // 1. Turn the page into solids
  // =========================================================================
  const solids = [];               // { word, el, x, y, w, h, alive, ... }
  let docW = 0, docH = 0;

  // Anything fixed or sticky moves with the viewport, not the document, so
  // its measured box would be a lie the moment we scroll. Leave it alone.
  const fixedMemo = new Map();
  function isFixed(el) {
    if (!el || el === root || el.nodeType !== 1) return false;
    if (fixedMemo.has(el)) return fixedMemo.get(el);
    const pos = getComputedStyle(el).position;
    const r = pos === "fixed" || pos === "sticky" || isFixed(el.parentElement);
    fixedMemo.set(el, r);
    return r;
  }

  const SKIP_TEXT = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "SELECT", "OPTION", "TEMPLATE", "TITLE", "DZ-W"]);
  const MEDIA_SEL = "img, svg, video, canvas, button, input, select, textarea, iframe";

  function build() {
    // Pass 1, reads only: which text nodes and media are visible and in flow.
    const texts = [];
    const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
    let wordBudget = MAX_WORDS;
    for (let n = walker.nextNode(); n && wordBudget > 0; n = walker.nextNode()) {
      const p = n.parentElement;
      if (!p || SKIP_TEXT.has(p.tagName) || !/\S/.test(n.nodeValue)) continue;
      if (p.closest("svg") || p.closest("[data-dz-ignore]") || p.isContentEditable) continue;
      if (!p.getClientRects().length || isFixed(p)) continue;
      const vis = getComputedStyle(p);
      if (vis.visibility === "hidden" || vis.opacity === "0") continue;
      texts.push(n);
      wordBudget -= n.nodeValue.split(/\s+/).length;
    }
    const media = [];
    for (const el of doc.querySelectorAll(MEDIA_SEL)) {
      if (el === canvas || el.closest("[data-dz-ignore]")) continue;
      if (el.tagName.toLowerCase() === "svg" && el.parentElement && el.parentElement.closest("svg")) continue;
      if (!el.getClientRects().length || isFixed(el)) continue;
      media.push(el);
    }

    // Pass 2, writes only: one element per word.
    const words = [];
    for (const tn of texts) {
      const frag = doc.createDocumentFragment();
      for (const part of tn.nodeValue.split(/(\s+)/)) {
        if (!part) continue;
        if (/^\s+$/.test(part)) { frag.appendChild(doc.createTextNode(part)); continue; }
        const w = doc.createElement("dz-w");
        w.textContent = part;
        frag.appendChild(w);
        words.push(w);
      }
      tn.parentNode.replaceChild(frag, tn);
    }

    // Pass 3, reads only: one layout, then every box.
    for (const el of words) solids.push({ word: true, el, alive: true, hp: 1 });
    for (const el of media) {
      const tag = el.tagName.toLowerCase();
      const cs = getComputedStyle(el);
      let color = cs.backgroundColor;
      if (!color || color === "transparent" || color === "rgba(0, 0, 0, 0)") color = tag === "svg" ? "#6b7280" : "#9aa0a6";
      solids.push({ word: false, el, tag, alive: true, color, fit: cs.objectFit, hp: 0, cv: null });
    }
    measure();
    for (const s of solids) if (!s.word) {
      s.hp = s.maxHp = clamp(Math.sqrt(s.w * s.h) / 14, 3, 40);
      if (s.tag === "svg" && s.alive) rasterSvg(s);
    }
    total = words.length + media.length * 5 || 1;
  }

  // An inline <svg> can't be drawn onto a canvas, but a picture of it can:
  // serialise it into an image up front so it shatters with its artwork.
  // (Styles from the page's stylesheets don't come along; inline ones do.)
  function rasterSvg(s) {
    try {
      const clone = s.el.cloneNode(true);
      clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      clone.setAttribute("width", s.w);
      clone.setAttribute("height", s.h);
      const img = new Image();
      img.onload = () => { s.img = img; };
      img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(new XMLSerializer().serializeToString(clone));
    } catch (e) {}
  }

  // Grid of solid indices by cell, for every "what's here?" question.
  const grid = new Map();
  const cellKey = (cx, cy) => cy * 8192 + cx + 4096;
  function measure() {
    const sx = win.scrollX, sy = win.scrollY;
    grid.clear();
    for (let i = 0; i < solids.length; i++) {
      const s = solids[i];
      if (!s.alive) continue;
      const r = s.el.getClientRects()[0];
      if (!r || r.width < 2 || r.height < 2) { s.alive = false; s.gone = true; continue; }
      s.x = r.left + sx; s.y = r.top + sy; s.w = r.width; s.h = r.height;
      const x0 = Math.floor(s.x / CELL), x1 = Math.floor((s.x + s.w) / CELL);
      const y0 = Math.floor(s.y / CELL), y1 = Math.floor((s.y + s.h) / CELL);
      for (let cy = y0; cy <= y1; cy++) for (let cx = x0; cx <= x1; cx++) {
        const k = cellKey(cx, cy);
        let list = grid.get(k);
        if (!list) grid.set(k, (list = []));
        list.push(i);
      }
    }
    docW = Math.max(root.scrollWidth, doc.body.scrollWidth, win.innerWidth);
    docH = Math.max(root.scrollHeight, doc.body.scrollHeight, win.innerHeight);
  }

  let qid = 0;
  function eachSolid(x0, y0, x1, y1, fn) {
    qid++;
    const cx0 = Math.floor(x0 / CELL), cx1 = Math.floor(x1 / CELL);
    const cy0 = Math.floor(y0 / CELL), cy1 = Math.floor(y1 / CELL);
    for (let cy = cy0; cy <= cy1; cy++) for (let cx = cx0; cx <= cx1; cx++) {
      const list = grid.get(cellKey(cx, cy));
      if (!list) continue;
      for (const i of list) {
        const s = solids[i];
        if (s.q === qid || !s.alive) continue;
        s.q = qid;
        if (fn(s) === false) return;
      }
    }
  }
  function solidAt(x, y) {
    let hit = null;
    eachSolid(x, y, x, y, (s) => {
      if (x >= s.x - 1 && x <= s.x + s.w + 1 && y >= s.y - 1 && y <= s.y + s.h + 1) { hit = s; return false; }
    });
    return hit;
  }
  // The highest platform top a falling box crosses this step, or Infinity.
  function landing(x0, x1, prevBottom, bottom) {
    let best = Infinity;
    eachSolid(x0, prevBottom - 1, x1, bottom + 1, (s) => {
      if (s.x < x1 && s.x + s.w > x0 && s.y >= prevBottom - 1 && s.y <= bottom && s.y < best) best = s.y;
    });
    return Math.min(best, bottom >= docH ? docH : Infinity);
  }

  // =========================================================================
  // 2. Breaking things
  // =========================================================================
  let destroyed = 0, total = 1, score = 0, shake = 0;
  const letters = [], shards = [], particles = [], bullets = [], grenades = [];

  function destroyWord(s, ix, iy) {
    s.alive = false;
    destroyed++; score += 10;
    const cs = getComputedStyle(s.el);
    s.el.style.visibility = "hidden";
    const font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    const size = parseFloat(cs.fontSize) || 16;
    ctx.font = font;
    const text = s.el.textContent;
    const scaleX = s.w / (ctx.measureText(text).width || s.w);
    let x = s.x;
    for (const ch of text) {
      const cw = ctx.measureText(ch).width * scaleX;
      if (letters.length >= MAX_LETTERS) letters.shift();
      letters.push({
        ch, font, color: cs.color, size,
        x: x + cw / 2, y: s.y + s.h / 2,
        vx: ix * 0.22 + rand(-90, 90), vy: iy * 0.22 + rand(-280, -60),
        rot: 0, vr: rand(-9, 9), rest: false,
      });
      x += cw;
    }
  }

  function jaggedCircle(c, x, y, r) {
    c.beginPath();
    const n = 11;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU, rr = r * rand(0.72, 1.12);
      if (i) c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
      else c.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    }
    c.closePath();
  }

  // A damaged picture is swapped for a canvas copy of itself, so holes can
  // be burnt into it. Cross-origin images taint that copy, which is fine:
  // we only ever draw it, never read it back.
  function ensureCanvas(s) {
    if (s.cv) return s.cv;
    const el = s.img || s.el;
    const drawable = s.img || (s.tag === "img" && el.complete && el.naturalWidth) ||
      (s.tag === "video" && el.readyState >= 2) || s.tag === "canvas";
    if (!drawable) return null;
    const k = Math.min(1, 900 / Math.max(s.w, s.h));
    const cv = doc.createElement("canvas");
    cv.width = Math.max(1, Math.round(s.w * k));
    cv.height = Math.max(1, Math.round(s.h * k));
    const c = cv.getContext("2d");
    try {
      const nw = el.naturalWidth || el.videoWidth || el.width, nh = el.naturalHeight || el.videoHeight || el.height;
      if (!s.img && (s.fit === "cover" || s.fit === "contain")) {
        const sc = s.fit === "cover" ? Math.max(cv.width / nw, cv.height / nh) : Math.min(cv.width / nw, cv.height / nh);
        const dw = nw * sc, dh = nh * sc;
        c.drawImage(el, (cv.width - dw) / 2, (cv.height - dh) / 2, dw, dh);
      } else {
        c.drawImage(el, 0, 0, cv.width, cv.height);
      }
    } catch (e) { return null; }
    s.cv = cv; s.k = k;
    s.el.style.visibility = "hidden";
    return cv;
  }

  function burnHole(s, x, y, r) {
    const cv = ensureCanvas(s);
    if (!cv) { s.flash = 0.08; return; }
    const c = cv.getContext("2d"), k = s.k;
    const lx = (x - s.x) * k, ly = (y - s.y) * k, R = r * k;
    c.save();
    c.globalCompositeOperation = "source-atop";
    const g = c.createRadialGradient(lx, ly, R * 0.6, lx, ly, R * 2);
    g.addColorStop(0, "rgba(25,10,2,0.95)");
    g.addColorStop(0.45, "rgba(90,35,5,0.6)");
    g.addColorStop(1, "rgba(60,20,0,0)");
    c.fillStyle = g;
    c.fillRect(lx - R * 2, ly - R * 2, R * 4, R * 4);
    c.strokeStyle = "rgba(255,140,40,0.9)";
    c.lineWidth = Math.max(1, R * 0.25);
    jaggedCircle(c, lx, ly, R * 1.08);
    c.stroke();
    c.globalCompositeOperation = "destination-out";
    jaggedCircle(c, lx, ly, R);
    c.fill();
    c.restore();
  }

  function damageMedia(s, dmg, x, y, holeR, fx, fy) {
    s.hp -= dmg;
    score += 1;
    burnHole(s, x, y, holeR);
    if (s.hp <= 0) shatter(s, x, y, fx, fy);
  }

  // Fan triangles out from the point of impact to the rim, then cut each
  // one into an inner triangle and an outer quad — reads as broken glass.
  function shatter(s, ix, iy, fx, fy) {
    s.alive = false;
    destroyed += 5; score += 50; shake = Math.max(shake, 5);
    const src = ensureCanvas(s);
    s.el.style.visibility = "hidden";
    const cx = clamp(ix - s.x, 2, s.w - 2), cy = clamp(iy - s.y, 2, s.h - 2);
    const P = 2 * (s.w + s.h);
    const n = clamp(Math.round(P / 60), 8, 20);
    const ts = [0, s.w, s.w + s.h, 2 * s.w + s.h];
    for (let i = 0; i < n; i++) ts.push(((i + rand(0.1, 0.9)) / n) * P);
    ts.sort((a, b) => a - b);
    const rim = ts.map((t) =>
      t <= s.w ? [t, 0] : t <= s.w + s.h ? [s.w, t - s.w] : t <= 2 * s.w + s.h ? [s.w - (t - s.w - s.h), s.h] : [0, s.h - (t - 2 * s.w - s.h)]);
    const polys = [];
    for (let i = 0; i < rim.length; i++) {
      const A = rim[i], B = rim[(i + 1) % rim.length];
      const t1 = rand(0.3, 0.6), t2 = rand(0.3, 0.6);
      const A2 = [cx + (A[0] - cx) * t1, cy + (A[1] - cy) * t1];
      const B2 = [cx + (B[0] - cx) * t2, cy + (B[1] - cy) * t2];
      polys.push([[cx, cy], A2, B2], [A2, A, B, B2]);
    }
    const fl = Math.hypot(fx, fy) || 1;
    for (const poly of polys) {
      let mx = 0, my = 0;
      for (const p of poly) { mx += p[0]; my += p[1]; }
      mx /= poly.length; my /= poly.length;
      let r = 0;
      const pts = poly.map((p) => { const q = [p[0] - mx, p[1] - my]; r = Math.max(r, Math.hypot(q[0], q[1])); return q; });
      if (r < 1.5) continue;
      const dx = mx - cx, dy = my - cy, dl = Math.hypot(dx, dy) || 1;
      const push = rand(120, 380);
      if (shards.length >= MAX_SHARDS) shards.shift();
      shards.push({
        pts, src, color: s.color, sw: s.w, sh: s.h, ox: mx, oy: my, r: Math.min(r, 30),
        x: s.x + mx, y: s.y + my,
        vx: (dx / dl) * push + (fx / fl) * 160, vy: (dy / dl) * push + (fy / fl) * 160 - rand(80, 260),
        rot: 0, vr: rand(-7, 7), rest: false,
      });
    }
    for (let i = 0; i < 14; i++) spark(ix, iy, "#ffffff");
  }

  function hitSolid(s, dmg, x, y, fx, fy, holeR) {
    if (s.word) destroyWord(s, fx, fy);
    else damageMedia(s, dmg, x, y, holeR, fx, fy);
  }

  function explode(x, y, R) {
    shake = Math.max(shake, 14);
    sound("boom");
    eachSolid(x - R, y - R, x + R, y + R, (s) => {
      const nx = clamp(x, s.x, s.x + s.w), ny = clamp(y, s.y, s.y + s.h);
      const d = Math.hypot(nx - x, ny - y);
      if (d > R) return;
      const f = 1 - d / R, dx = nx - x, dy = ny - y, dl = Math.hypot(dx, dy) || 1;
      const fx = (dx / dl) * 900 * f, fy = (dy / dl) * 900 * f - 300 * f;
      if (s.word) destroyWord(s, fx, fy);
      else damageMedia(s, 14 * f + 2, nx, ny, 14 + 26 * f, fx, fy);
    });
    for (const list of [letters, shards]) {
      for (const l of list) {
        const dx = l.x - x, dy = l.y - y, d = Math.hypot(dx, dy);
        if (d > R * 1.4) continue;
        const f = (1 - d / (R * 1.4)) * 1100;
        l.vx += (dx / (d || 1)) * f; l.vy += (dy / (d || 1)) * f - 200; l.rest = false; l.vr += rand(-10, 10);
      }
    }
    // Rocket-jumping: the blast pushes you, it never hurts you.
    const pcx = player.x + PW / 2, pcy = player.y + PH / 2;
    const pd = Math.hypot(pcx - x, pcy - y);
    if (pd < R * 1.2) {
      const f = (1 - pd / (R * 1.2)) * 1300;
      player.vx += ((pcx - x) / (pd || 1)) * f * 0.6;
      player.vy += ((pcy - y) / (pd || 1)) * f - 250;
      player.grounded = false;
    }
    for (let i = 0; i < 34; i++) {
      const a = rand(0, TAU), v = rand(40, 420);
      addParticle({ x: x + rand(-8, 8), y: y + rand(-8, 8), vx: Math.cos(a) * v, vy: Math.sin(a) * v - 80, life: rand(0.35, 0.9), size: rand(6, 16), kind: "fire" });
    }
    for (let i = 0; i < 16; i++) {
      const a = rand(0, TAU), v = rand(20, 140);
      addParticle({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 60, life: rand(0.8, 1.8), size: rand(10, 22), kind: "smoke" });
    }
    for (let i = 0; i < 24; i++) spark(x, y, "#ffd166");
  }

  function addParticle(p) {
    if (particles.length >= MAX_PARTICLES) particles.shift();
    p.max = p.life;
    particles.push(p);
  }
  function spark(x, y, color) {
    const a = rand(0, TAU), v = rand(120, 520);
    addParticle({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: rand(0.15, 0.45), size: 2, kind: "spark", color });
  }

  // =========================================================================
  // 3. The player
  // =========================================================================
  const player = { x: 0, y: 0, vx: 0, vy: 0, grounded: false, jumps: 0, coyote: 0, dropT: 0, fuel: FUEL_MAX, spin: 0, walk: 0, flying: false, face: 1 };
  const keys = {};
  const mouse = { x: win.innerWidth / 2, y: win.innerHeight / 2, down: false };
  let jumpQueued = false, jumpHeld = false, jumpHeldT = 0;
  let weapon = 0, cooldown = 0, grenadeCd = 0;

  function aim() {
    const sx = player.x + PW / 2, sy = player.y + 17;
    const a = Math.atan2(mouse.y + win.scrollY - sy, mouse.x + win.scrollX - sx);
    return { sx, sy, a };
  }

  function updatePlayer(dt) {
    const p = player;
    const dir = (keys.d || keys.arrowright ? 1 : 0) - (keys.a || keys.arrowleft ? 1 : 0);
    if (dir) p.vx = approach(p.vx, dir * RUN, (p.grounded ? ACCEL : AIR_ACCEL) * dt);
    else if (p.grounded) p.vx = approach(p.vx, 0, FRICTION * dt);
    else p.vx = approach(p.vx, 0, 300 * dt);

    if (jumpQueued) {
      jumpQueued = false;
      if (p.grounded || p.coyote > 0) { p.vy = -JUMP_V; p.jumps = 1; p.coyote = 0; p.grounded = false; sound("jump"); }
      else if (p.jumps < 2) { p.vy = -DJUMP_V; p.jumps = 2; p.spin = 1; sound("jump"); }
    }
    if (jumpHeld) jumpHeldT += dt;
    p.flying = false;
    if (jumpHeld && !p.grounded && jumpHeldT > 0.25 && p.fuel > 0) {
      p.vy = Math.max(p.vy - FLY_THRUST * dt, -FLY_MAX_UP);
      p.fuel -= dt;
      p.flying = true;
      const bx = p.x + PW / 2 - p.face * 9, by = p.y + 30;
      addParticle({ x: bx + rand(-2, 2), y: by, vx: rand(-30, 30), vy: rand(250, 420), life: rand(0.12, 0.25), size: rand(3, 6), kind: "fire" });
    }
    if (p.grounded) p.fuel = Math.min(FUEL_MAX, p.fuel + dt * 1.2);

    p.vy = Math.min(p.vy + GRAVITY * dt, 1500);
    p.x = clamp(p.x + p.vx * dt, 0, docW - PW);
    const prevBottom = p.y + PH;
    p.y += p.vy * dt;
    if (p.y < 0) { p.y = 0; p.vy = Math.max(p.vy, 0); }
    p.grounded = false;
    if (p.vy >= 0) {
      const bottom = p.y + PH;
      const top = p.dropT > 0 ? (bottom >= docH ? docH : Infinity) : landing(p.x + 3, p.x + PW - 3, prevBottom, bottom);
      if (top < Infinity) { p.y = top - PH; p.vy = 0; p.grounded = true; }
    }
    if (p.grounded) { p.jumps = 0; p.coyote = 0.08; } else p.coyote -= dt;
    p.dropT -= dt;
    p.spin = Math.max(0, p.spin - dt * 2.6);
    p.walk += Math.abs(p.vx) * dt;
  }

  function fire(dt) {
    cooldown -= dt; grenadeCd -= dt;
    const w = WEAPONS[weapon];
    if (!mouse.down) { laserBeam = null; return; }
    const { sx, sy, a } = aim();
    const mx = sx + Math.cos(a) * (w.gun + 4), my = sy + Math.sin(a) * (w.gun + 4);
    if (w.laser) { laser(mx, my, a, w, dt); return; }
    laserBeam = null;
    if (cooldown > 0) return;
    cooldown = w.rate;
    for (let i = 0; i < w.count; i++) {
      const aa = a + rand(-w.spread, w.spread), v = w.speed * rand(0.9, 1.05);
      bullets.push({ x: mx, y: my, vx: Math.cos(aa) * v, vy: Math.sin(aa) * v, life: w.life || 1.4, w });
    }
    player.vx -= Math.cos(a) * (w.rocket ? 160 : w.count > 1 ? 120 : 15);
    shake = Math.max(shake, w.rocket ? 4 : w.count > 1 ? 4 : 1.2);
    addParticle({ x: mx, y: my, vx: 0, vy: 0, life: 0.06, size: w.rocket ? 16 : 10, kind: "flash" });
    sound(w.rocket ? "rocket" : w.count > 1 ? "shotgun" : "shot");
  }

  let laserBeam = null, laserTick = 0;
  function laser(x, y, a, w, dt) {
    const dx = Math.cos(a), dy = Math.sin(a);
    let ex = x, ey = y, hit = null;
    for (let d = 0; d < 1600; d += 4) {
      ex = x + dx * d; ey = y + dy * d;
      if (ey > docH || ex < 0 || ex > docW) break;
      if ((hit = solidAt(ex, ey))) break;
    }
    laserBeam = { x, y, ex, ey };
    laserTick -= dt;
    if (hit) {
      if (hit.word) destroyWord(hit, dx * 300, dy * 300);
      else if (laserTick <= 0) damageMedia(hit, w.dps * 0.05, ex, ey, 5, dx, dy);
      if (Math.random() < 0.6) spark(ex, ey, w.color);
    }
    if (laserTick <= 0) { laserTick = 0.05; sound("laser"); }
  }

  function throwGrenade() {
    if (grenadeCd > 0) return;
    grenadeCd = 0.6;
    const { sx, sy, a } = aim();
    grenades.push({ x: sx, y: sy, vx: Math.cos(a) * 700 + player.vx * 0.5, vy: Math.sin(a) * 700 - 120, t: 1.3, rot: 0 });
  }

  // =========================================================================
  // 4. Simulation
  // =========================================================================
  function updateBullets(dt) {
    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i];
      b.life -= dt;
      const steps = Math.ceil((Math.hypot(b.vx, b.vy) * dt) / 6);
      let dead = b.life <= 0;
      for (let k = 0; k < steps && !dead; k++) {
        b.x += (b.vx * dt) / steps; b.y += (b.vy * dt) / steps;
        if (b.y > docH || b.y < 0 || b.x < 0 || b.x > docW) { dead = true; if (b.w.rocket) explode(b.x, Math.min(b.y, docH), b.w.radius); break; }
        const s = solidAt(b.x, b.y);
        if (!s) continue;
        dead = true;
        if (b.w.rocket) explode(b.x, b.y, b.w.radius);
        else { hitSolid(s, b.w.dmg, b.x, b.y, b.vx, b.vy, rand(5, 9)); spark(b.x, b.y, b.w.color); }
      }
      if (b.w.rocket && !dead) addParticle({ x: b.x, y: b.y, vx: rand(-20, 20), vy: rand(-20, 20), life: rand(0.3, 0.6), size: rand(4, 8), kind: "smoke" });
      if (dead) { if (b.w.rocket && b.life <= 0) explode(b.x, b.y, b.w.radius); bullets.splice(i, 1); }
    }
    for (let i = grenades.length - 1; i >= 0; i--) {
      const g = grenades[i];
      g.t -= dt;
      g.vy += GRAVITY * dt;
      const prevB = g.y + 4;
      g.x += g.vx * dt; g.y += g.vy * dt; g.rot += g.vx * dt * 0.05;
      if (g.x < 0 || g.x > docW) { g.vx *= -0.6; g.x = clamp(g.x, 0, docW); }
      if (g.vy > 0) {
        const top = landing(g.x - 4, g.x + 4, prevB, g.y + 4);
        if (top < Infinity) { g.y = top - 4; g.vy *= -0.45; g.vx *= 0.7; }
      }
      if (g.t <= 0) { explode(g.x, g.y, 125); grenades.splice(i, 1); }
    }
  }

  // Letters and shards share one tiny physics: fall, land on the tops of
  // things, settle. Settled debris only re-checks its footing now and then.
  let frame = 0;
  function updateDebris(list, dt, halfOf) {
    for (let i = 0; i < list.length; i++) {
      const l = list[i];
      if (l.rest) {
        if ((frame + i) % 12) continue;
        const h = halfOf(l);
        if (landing(l.x - 2, l.x + 2, l.y + h - 1, l.y + h + 2) === Infinity) l.rest = false;
        continue;
      }
      l.vy = Math.min(l.vy + GRAVITY * dt, 1500);
      const h = halfOf(l);
      const prevB = l.y + h;
      l.x += l.vx * dt; l.y += l.vy * dt; l.rot += l.vr * dt;
      if (l.x < 0 || l.x > docW) { l.vx *= -0.5; l.x = clamp(l.x, 0, docW); }
      if (l.vy > 0) {
        const top = landing(l.x - 2, l.x + 2, prevB, l.y + h);
        if (top < Infinity) {
          l.y = top - h;
          l.vx *= 0.55; l.vr *= 0.5;
          if (l.vy < 140) { l.vy = 0; l.vr = 0; if (Math.abs(l.vx) < 40) { l.vx = 0; l.rest = true; } }
          else l.vy *= -0.28;
        }
      }
    }
  }

  function updateParticles(dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life -= dt;
      if (p.life <= 0) { particles.splice(i, 1); continue; }
      if (p.kind === "spark") p.vy += GRAVITY * 0.5 * dt;
      if (p.kind === "smoke") { p.vy -= 40 * dt; p.vx *= 0.98; }
      if (p.kind === "fire") { p.vx *= 0.93; p.vy = p.vy * 0.93 - 60 * dt; }
      p.x += p.vx * dt; p.y += p.vy * dt;
    }
  }

  // =========================================================================
  // 5. Drawing
  // =========================================================================
  const canvas = doc.createElement("canvas");
  canvas.setAttribute("data-dz-ignore", "");
  canvas.style.cssText = "position:fixed!important;left:0!important;top:0!important;width:100vw!important;height:100vh!important;z-index:2147483647!important;pointer-events:none!important;margin:0!important;padding:0!important;border:0!important;background:none!important;";
  const ctx = canvas.getContext("2d");
  function resize() {
    canvas.width = Math.round(win.innerWidth * DPR);
    canvas.height = Math.round(win.innerHeight * DPR);
  }

  const SPRITE = {
    head: ["...HHHH...", "..HHHHHH..", "..HHVVVV..", "..HSVVVV..", "..HSSSSS..", "...SSSS...",
      "..BBBBBB..", ".BBBBBBBB.", ".BBBBBBBB.", ".BBBBBBBB.", "..BBBBBB..", "..PPPPPP.."],
    stand: ["..PP..PP..", "..PP..PP..", "..PP..PP..", ".KKK..KKK."],
    walk1: [".PP...PP..", ".PP....PP.", "PP.....PP.", "KK.....KKK"],
    walk2: ["...PPPP...", "...PPPP...", "...PP.PP..", "..KKK.KKK."],
    air: ["..PP..PP..", ".PP....PP.", ".PP...PP..", "KKK...KKK."],
  };
  const PAL = { H: "#1f2a44", V: "#57e0ff", S: "#f1b48a", B: "#e8743b", P: "#2b3a67", K: "#0f172a" };
  const PX = 2.5;

  function drawPlayer(sx, sy) {
    const p = player;
    const { a } = aim();
    p.face = Math.cos(a) >= 0 ? 1 : -1;
    const legs = !p.grounded ? SPRITE.air : Math.abs(p.vx) < 20 ? SPRITE.stand : Math.floor(p.walk / 26) % 2 ? SPRITE.walk1 : SPRITE.walk2;
    const rows = SPRITE.head.concat(legs);
    const cx = p.x + PW / 2 - sx, cy = p.y + PH / 2 - sy;
    ctx.save();
    ctx.translate(cx, cy);
    if (p.spin > 0) ctx.rotate(-p.face * (1 - p.spin) * TAU);
    ctx.scale(p.face, 1);
    // jetpack
    ctx.fillStyle = "#0f172a"; ctx.fillRect(-15, -6, 7, 13);
    ctx.fillStyle = "#94a3b8"; ctx.fillRect(-14, -5, 5, 11);
    const ox = -12.5, oy = -20;
    for (const pass of [0, 1]) {
      for (let r = 0; r < rows.length; r++) for (let c = 0; c < 10; c++) {
        const ch = rows[r][c];
        if (ch === ".") continue;
        ctx.fillStyle = pass ? PAL[ch] : "rgba(0,0,0,0.55)";
        if (pass) ctx.fillRect(ox + c * PX, oy + r * PX, PX + 0.3, PX + 0.3);
        else ctx.fillRect(ox + c * PX - 1, oy + r * PX - 1, PX + 2, PX + 2);
      }
    }
    ctx.restore();
    // arm + gun, rotated to the mouse
    const w = WEAPONS[weapon];
    ctx.save();
    ctx.translate(p.x + PW / 2 - sx, p.y + 17 - sy);
    ctx.rotate(a);
    if (p.face < 0) ctx.scale(1, -1);
    ctx.fillStyle = "rgba(0,0,0,0.55)"; ctx.fillRect(-1, -3, w.gun + 6, 7);
    ctx.fillStyle = PAL.B; ctx.fillRect(0, -2, 8, 5);
    ctx.fillStyle = PAL.S; ctx.fillRect(7, -2, 3, 5);
    ctx.fillStyle = w.rocket ? "#4b5563" : "#111827";
    ctx.fillRect(8, w.rocket ? -4 : -2, w.gun - 4, w.rocket ? 7 : 4);
    ctx.fillStyle = w.color; ctx.fillRect(w.gun + 1, -1, 3, w.rocket ? 3 : 2);
    ctx.restore();
    if (p.fuel < FUEL_MAX - 0.01) {
      ctx.fillStyle = "rgba(0,0,0,0.5)"; ctx.fillRect(cx - 14, cy - 30, 28, 4);
      ctx.fillStyle = p.fuel > 0.3 ? "#57e0ff" : "#ff5a5a"; ctx.fillRect(cx - 14, cy - 30, 28 * (p.fuel / FUEL_MAX), 4);
    }
  }

  function drawShard(s, sx, sy) {
    ctx.save();
    ctx.translate(s.x - sx, s.y - sy);
    ctx.rotate(s.rot);
    ctx.beginPath();
    ctx.moveTo(s.pts[0][0], s.pts[0][1]);
    for (let i = 1; i < s.pts.length; i++) ctx.lineTo(s.pts[i][0], s.pts[i][1]);
    ctx.closePath();
    if (s.src) { ctx.save(); ctx.clip(); ctx.drawImage(s.src, -s.ox, -s.oy, s.sw, s.sh); ctx.restore(); }
    else { ctx.fillStyle = s.color; ctx.fill(); }
    ctx.strokeStyle = "rgba(255,255,255,0.55)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }

  function fireColor(t) { // t: 1 fresh -> 0 dead
    return t > 0.75 ? "#fff3b0" : t > 0.5 ? "#ffc23d" : t > 0.28 ? "#ff7a1a" : "#b8341b";
  }

  function draw() {
    const vw = win.innerWidth, vh = win.innerHeight;
    const sx = win.scrollX, sy = win.scrollY;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, vw, vh);
    if (shake > 0.2) ctx.translate(rand(-shake, shake), rand(-shake, shake));
    const onScreen = (x, y, m) => x > sx - m && x < sx + vw + m && y > sy - m && y < sy + vh + m;

    // damaged pictures, holes and all
    for (const s of solids) {
      if (!s.alive || s.word) continue;
      if (s.x + s.w < sx || s.x > sx + vw || s.y + s.h < sy || s.y > sy + vh) continue;
      if (s.cv) ctx.drawImage(s.cv, s.x - sx, s.y - sy, s.w, s.h);
      if (s.flash > 0) { ctx.fillStyle = "rgba(255,255,255,0.5)"; ctx.fillRect(s.x - sx, s.y - sy, s.w, s.h); }
    }
    for (const s of shards) if (onScreen(s.x, s.y, 40)) drawShard(s, sx, sy);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    let lastFont = "";
    for (const l of letters) {
      if (!onScreen(l.x, l.y, 30)) continue;
      if (l.font !== lastFont) { ctx.font = l.font; lastFont = l.font; }
      ctx.fillStyle = l.color;
      if (l.rot) {
        ctx.save(); ctx.translate(l.x - sx, l.y - sy); ctx.rotate(l.rot); ctx.fillText(l.ch, 0, 0); ctx.restore();
      } else ctx.fillText(l.ch, l.x - sx, l.y - sy);
    }

    for (const g of grenades) {
      ctx.save(); ctx.translate(g.x - sx, g.y - sy); ctx.rotate(g.rot);
      ctx.fillStyle = "#0f172a"; ctx.fillRect(-5, -5, 10, 10);
      ctx.fillStyle = "#4d7c0f"; ctx.fillRect(-4, -4, 8, 8);
      ctx.fillStyle = g.t % 0.3 < 0.15 ? "#ff3b3b" : "#fca5a5"; ctx.fillRect(-1.5, -7, 3, 3);
      ctx.restore();
    }

    drawPlayer(sx, sy);

    ctx.globalCompositeOperation = "lighter";
    for (const b of bullets) {
      ctx.strokeStyle = b.w.color;
      ctx.lineWidth = b.w.rocket ? 5 : 2.5;
      const k = b.w.rocket ? 0.02 : 0.018;
      ctx.beginPath(); ctx.moveTo(b.x - sx, b.y - sy); ctx.lineTo(b.x - sx - b.vx * k, b.y - sy - b.vy * k); ctx.stroke();
    }
    if (laserBeam) {
      const L = laserBeam, c = WEAPONS[4].color;
      ctx.strokeStyle = c; ctx.globalAlpha = 0.35; ctx.lineWidth = 9;
      ctx.beginPath(); ctx.moveTo(L.x - sx, L.y - sy); ctx.lineTo(L.ex - sx, L.ey - sy); ctx.stroke();
      ctx.globalAlpha = 1; ctx.lineWidth = 2.5; ctx.strokeStyle = "#ffe4fb"; ctx.stroke();
    }
    for (const p of particles) {
      if (p.kind === "smoke") continue;
      const t = p.life / p.max, x = p.x - sx, y = p.y - sy;
      if (p.kind === "fire") {
        const s = Math.round(p.size * (0.5 + t * 0.7) / 3) * 3;
        ctx.fillStyle = fireColor(t);
        ctx.fillRect(Math.round(x / 3) * 3 - s / 2, Math.round(y / 3) * 3 - s / 2, s, s);
      } else if (p.kind === "flash") {
        ctx.fillStyle = "#fff6c8"; ctx.beginPath(); ctx.arc(x, y, p.size, 0, TAU); ctx.fill();
      } else {
        ctx.fillStyle = p.color; ctx.fillRect(x - 1, y - 1, 2.5, 2.5);
      }
    }
    ctx.globalCompositeOperation = "source-over";
    for (const p of particles) {
      if (p.kind !== "smoke") continue;
      const t = p.life / p.max, s = Math.round(p.size * (1.6 - t) / 3) * 3;
      ctx.fillStyle = `rgba(70,70,76,${0.45 * t})`;
      ctx.fillRect(Math.round((p.x - sx) / 3) * 3 - s / 2, Math.round((p.y - sy) / 3) * 3 - s / 2, s, s);
    }

    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    drawHud(vw, vh);
  }

  const started = performance.now();
  function drawHud(vw, vh) {
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.font = "600 12px ui-monospace, SFMono-Regular, Menlo, monospace";
    const pct = Math.min(100, (destroyed / total) * 100);
    const x = 14, y = 14, w = 262;
    ctx.fillStyle = "rgba(10,10,14,0.82)";
    ctx.fillRect(x, y, w, 88);
    ctx.fillStyle = "#ff6a3d"; ctx.fillText("DESTROY", x + 10, y + 9);
    ctx.fillStyle = "#e5e7eb"; ctx.textAlign = "right"; ctx.fillText(`${score.toLocaleString()} pts`, x + w - 10, y + 9); ctx.textAlign = "left";
    ctx.fillStyle = "#374151"; ctx.fillRect(x + 10, y + 29, w - 20, 8);
    ctx.fillStyle = "#ff6a3d"; ctx.fillRect(x + 10, y + 29, (w - 20) * (pct / 100), 8);
    ctx.fillStyle = "#9ca3af"; ctx.fillText(`${pct.toFixed(1)}% of this page destroyed`, x + 10, y + 43);
    for (let i = 0; i < WEAPONS.length; i++) {
      const bx = x + 10 + i * 49, by = y + 62;
      ctx.fillStyle = i === weapon ? WEAPONS[i].color : "#1f2937";
      ctx.fillRect(bx, by, 45, 18);
      ctx.fillStyle = i === weapon ? "#111" : "#9ca3af";
      ctx.fillText(`${i + 1} ${WEAPONS[i].name.slice(0, 3).toUpperCase()}`, bx + 5, by + 3);
    }
    const age = (performance.now() - started) / 1000;
    const a = age < 9 ? 1 : Math.max(0, 1 - (age - 9) / 1.5);
    if (a > 0) {
      const lines = ["A/D move · Space jump, twice to flip, hold to fly · S drop",
        "click shoot · right-click grenade · 1–5 or wheel switch · M mute · Esc quit"];
      ctx.globalAlpha = a;
      ctx.fillStyle = "rgba(10,10,14,0.82)";
      ctx.fillRect(14, vh - 58, 560, 44);
      ctx.fillStyle = "#e5e7eb";
      ctx.fillText(lines[0], 24, vh - 50);
      ctx.fillText(lines[1], 24, vh - 32);
      ctx.globalAlpha = 1;
    }
  }

  // =========================================================================
  // 6. Sound — a few synthesized blips, no files
  // =========================================================================
  let actx = null, muted = false, noiseBuf = null;
  function sound(kind) {
    if (muted) return;
    try {
      if (!actx) {
        actx = new (win.AudioContext || win.webkitAudioContext)();
        noiseBuf = actx.createBuffer(1, actx.sampleRate * 0.6, actx.sampleRate);
        const d = noiseBuf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      }
      const t = actx.currentTime, g = actx.createGain();
      g.connect(actx.destination);
      if (kind === "boom" || kind === "shotgun") {
        const n = actx.createBufferSource(), f = actx.createBiquadFilter();
        n.buffer = noiseBuf; f.type = "lowpass";
        f.frequency.setValueAtTime(kind === "boom" ? 900 : 2200, t);
        f.frequency.exponentialRampToValueAtTime(80, t + (kind === "boom" ? 0.55 : 0.2));
        g.gain.setValueAtTime(kind === "boom" ? 0.5 : 0.25, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + (kind === "boom" ? 0.6 : 0.22));
        n.connect(f).connect(g); n.start(t); n.stop(t + 0.6);
        return;
      }
      const o = actx.createOscillator();
      const spec = { shot: ["square", 880, 180, 0.07, 0.06], rocket: ["sawtooth", 220, 60, 0.25, 0.08],
        laser: ["sawtooth", 1400, 900, 0.05, 0.025], jump: ["square", 300, 620, 0.09, 0.04] }[kind];
      o.type = spec[0];
      o.frequency.setValueAtTime(spec[1], t);
      o.frequency.exponentialRampToValueAtTime(spec[2], t + spec[3]);
      g.gain.setValueAtTime(spec[4], t);
      g.gain.exponentialRampToValueAtTime(0.001, t + spec[3]);
      o.connect(g); o.start(t); o.stop(t + spec[3]);
    } catch (e) { muted = true; }
  }

  // =========================================================================
  // 7. Input, camera, loop
  // =========================================================================
  const GAME_KEYS = new Set(["a", "d", "w", "s", " ", "arrowleft", "arrowright", "arrowup", "arrowdown"]);
  const on = [];
  const listen = (t, ev, fn) => { t.addEventListener(ev, fn, { capture: true, passive: false }); on.push([t, ev, fn]); };

  listen(win, "keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key.toLowerCase();
    if (k === "escape") { quit(); return; }
    if (GAME_KEYS.has(k) || /^[1-5]$/.test(k) || k === "m") { e.preventDefault(); e.stopPropagation(); }
    if (/^[1-5]$/.test(k)) weapon = +k - 1;
    if (k === "m" && !e.repeat) muted = !muted;
    if ((k === " " || k === "w" || k === "arrowup") && !e.repeat) { jumpQueued = true; jumpHeld = true; jumpHeldT = 0; }
    if ((k === "s" || k === "arrowdown") && !e.repeat && player.grounded) { player.dropT = 0.22; player.y += 2; player.grounded = false; }
    keys[k] = true;
  });
  listen(win, "keyup", (e) => {
    const k = e.key.toLowerCase();
    keys[k] = false;
    if (k === " " || k === "w" || k === "arrowup") jumpHeld = false;
    if (GAME_KEYS.has(k)) e.preventDefault();
  });
  listen(win, "mousemove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
  listen(win, "mousedown", (e) => {
    mouse.x = e.clientX; mouse.y = e.clientY;
    if (e.button === 0) mouse.down = true;
    if (e.button === 2) throwGrenade();
    e.preventDefault(); e.stopPropagation();
  });
  listen(win, "mouseup", (e) => { if (e.button === 0) mouse.down = false; });
  // Links and buttons are targets now, not links and buttons.
  listen(win, "click", (e) => { e.preventDefault(); e.stopPropagation(); });
  listen(win, "auxclick", (e) => { e.preventDefault(); e.stopPropagation(); });
  listen(win, "contextmenu", (e) => e.preventDefault());
  let wheelAcc = 0;
  listen(win, "wheel", (e) => {
    e.preventDefault();
    wheelAcc += e.deltaY;
    if (Math.abs(wheelAcc) > 60) { weapon = (weapon + (wheelAcc > 0 ? 1 : -1) + WEAPONS.length) % WEAPONS.length; wheelAcc = 0; }
  });
  listen(win, "blur", () => { for (const k in keys) keys[k] = false; jumpHeld = false; mouse.down = false; });
  let resizeT = 0;
  listen(win, "resize", () => { resize(); clearTimeout(resizeT); resizeT = setTimeout(measure, 150); });

  const style = doc.createElement("style");
  style.setAttribute("data-dz-ignore", "");
  style.textContent = "html,body,body *{cursor:crosshair!important;user-select:none!important;-webkit-user-select:none!important}dz-w{display:inline!important}";
  const prevScrollBehavior = root.style.getPropertyValue("scroll-behavior");

  const cam = { x: win.scrollX, y: win.scrollY };
  function camera(dt) {
    const tx = player.x + PW / 2 - win.innerWidth / 2, ty = player.y + PH / 2 - win.innerHeight * 0.5;
    const k = Math.min(1, dt * 7);
    cam.x += (tx - cam.x) * k; cam.y += (ty - cam.y) * k;
    cam.x = clamp(cam.x, 0, Math.max(0, docW - win.innerWidth));
    cam.y = clamp(cam.y, 0, Math.max(0, docH - win.innerHeight));
    win.scrollTo(Math.round(cam.x), Math.round(cam.y));
  }

  let running = true, last = performance.now();
  function loop(now) {
    if (!running) return;
    const dt = Math.min(0.033, (now - last) / 1000);
    last = now;
    frame++;
    updatePlayer(dt);
    fire(dt);
    updateBullets(dt);
    updateDebris(letters, dt, (l) => l.size * 0.4);
    updateDebris(shards, dt, (s) => s.r * 0.6);
    updateParticles(dt);
    for (const s of solids) if (s.flash > 0) s.flash -= dt;
    shake *= Math.pow(0.004, dt);
    camera(dt);
    draw();
    requestAnimationFrame(loop);
  }

  function quit() {
    running = false;
    for (const [t, ev, fn] of on) t.removeEventListener(ev, fn, { capture: true });
    canvas.remove(); style.remove();
    root.style.setProperty("scroll-behavior", prevScrollBehavior);
    // Burnt copies lived on the overlay, which is gone: show the originals.
    for (const s of solids) if (s.cv && s.alive) s.el.style.visibility = "";
    window.__kmDestroy = false;
    try { win.dispatchEvent(new CustomEvent("kmdestroy:quit")); } catch (e) {}
  }

  // ---------- Go ----------
  root.style.setProperty("scroll-behavior", "auto", "important");
  doc.head.appendChild(style);
  build();
  resize();
  doc.body.appendChild(canvas);
  player.x = clamp(win.scrollX + win.innerWidth / 2 - PW / 2, 0, docW - PW);
  player.y = win.scrollY + 20;
  // Late-loading images shift things; measure again once they settle.
  setTimeout(measure, 1200);
  requestAnimationFrame((t) => { last = t; loop(t); });
})();
