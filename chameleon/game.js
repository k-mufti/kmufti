/* Meccha Chameleon — the live game.
 *
 * Rendering + placement live in mecha.js (shared with the builder). This file is
 * the game around it: the daily puzzle, timer, clicks, reveal, stats, share.
 *
 * Daily source of truth: daily.json (a date→puzzle map the builder approves).
 * If today isn't curated yet, we auto-place deterministically from the date so
 * there's always a puzzle. Practice mode is always auto/random.
 */
(() => {
  'use strict';

  const CONFIG = {
    loseAt: 30, greenTo: 10, yellowTo: 20,
    epochUTC: Date.UTC(2026, 6, 30), // day #1 = 2026-07-30
  };

  const $ = (id) => document.getElementById(id);
  const lerp = (a, b, t) => a + (b - a) * t;

  // Deterministic RNG seeded from a string (xmur3 -> mulberry32).
  function xmur3(str) {
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
    return () => { h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return (h ^= h >>> 16) >>> 0; };
  }
  function mulberry32(a) {
    return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  const rngFrom = (s) => mulberry32(xmur3(s)());

  function todayUTCKey() {
    const d = new Date();
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
  }
  function dayNumber() {
    const d = new Date();
    const todayUTC = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
    return Math.floor((todayUTC - CONFIG.epochUTC) / 86400000) + 1;
  }

  const C_GREEN = [39, 201, 110], C_YELLOW = [240, 190, 20], C_RED = [226, 59, 46];
  const mixC = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
  function zoneRGB(t) {
    if (t <= CONFIG.greenTo) return C_GREEN;
    if (t <= CONFIG.yellowTo) return mixC(C_GREEN, C_YELLOW, (t - CONFIG.greenTo) / (CONFIG.yellowTo - CONFIG.greenTo));
    if (t <= CONFIG.loseAt) return mixC(C_YELLOW, C_RED, (t - CONFIG.yellowTo) / (CONFIG.loseAt - CONFIG.yellowTo));
    return C_RED;
  }
  const zoneEmoji = (t) => (t <= CONFIG.greenTo ? '🟢' : t <= CONFIG.yellowTo ? '🟡' : '🔴');
  const rgbCss = (c) => `rgb(${c[0]},${c[1]},${c[2]})`;

  // ---- DOM refs -----------------------------------------------------------
  const canvas = $('game');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  // HUD above the photo
  const hudPlay = $('hudPlay'), timeText = $('timeText'), clickText = $('clickText'), clickLbl = $('clickLbl');
  const hudEnd = $('hudEnd'), verdictWord = $('verdictWord'), verdictStats = $('verdictStats');

  // End state + actions
  const resultBar = $('resultBar');
  const shareBtn = $('shareBtn'), practiceBtn = $('practiceBtn'), practiceRow = $('practiceRow');
  const photoCredit = $('photoCredit');

  // Start screen
  const startOverlay = $('startOverlay'), startBtn = $('startBtn');

  const plural = (n) => (n === 1 ? 'click' : 'clicks');

  const params = new URLSearchParams(location.search);
  const FORCE_SEED = params.get('seed');
  const NO_LOCK = params.has('nolock');

  // ---- state --------------------------------------------------------------
  let scene = null, mask = null, round = null;
  let mode = 'daily';
  let running = false, startTime = 0, elapsed = 0, clicks = 0, raf = 0;
  let revealRAF = 0, revealStart = 0;
  const misses = [];

  let IMAGES = [];
  let DAILY = {};

  async function loadManifest() {
    try {
      const r = await fetch('images/manifest.json', { cache: 'no-cache' });
      const j = await r.json();
      if (Array.isArray(j.images) && j.images.length) IMAGES = j.images;
    } catch (_) {}
    if (!IMAGES.length) IMAGES = Array.from({ length: 12 }, (_, i) => `images/img${String(i + 1).padStart(2, '0')}.jpg`);
  }
  async function loadDaily() {
    try {
      const r = await fetch('daily.json', { cache: 'no-cache' });
      const j = await r.json();
      DAILY = j.puzzles || {};
    } catch (_) { DAILY = {}; }
  }

  // ---- building a round ---------------------------------------------------
  function finishRound(o, figImg) {
    canvas.width = o.CW; canvas.height = o.CH;
    const { scene: sc, mask: mk } = MECHA.compose({
      img: o.img, CW: o.CW, CH: o.CH, fx: o.fx, fy: o.fy, figW: o.figW, figH: o.figH,
      rot: o.rot, blend: o.blend, opacity: o.opacity, feather: MECHA.DEFAULTS.feather, figImg,
    });
    scene = sc; mask = mk;
    round = {
      CW: o.CW, CH: o.CH, fx: o.fx, fy: o.fy, figW: o.figW, figH: o.figH,
      cx: o.fx + o.figW / 2, cy: o.fy + o.figH / 2, rot: o.rot,
      blend: o.blend, opacity: o.opacity, shadow: o.shadow, _figImg: figImg, _won: false,
    };
    ctx.drawImage(scene, 0, 0);
    if (params.has('debug')) window.__mc = { round, isHit };
  }

  // ---- practice photos ----------------------------------------------------
  // Practice would run through the photos in the repo in a handful of rounds,
  // so it asks the backend for one instead: Pexels, fetched and cached there,
  // served same-origin so the pixel sampling below still works. Anything at
  // all going wrong - no key, no network, no pool yet - falls back to the
  // photos we ship, which is why none of this throws.
  async function practicePhoto() {
    try {
      const r = await fetch('/puzzle/api/photo', { cache: 'no-cache' });
      if (!r.ok) return null;
      const j = await r.json();
      return j.src ? j : null;
    } catch (_) { return null; }
  }

  function showCredit(photo) {
    if (!photoCredit) return;
    if (!photo) { photoCredit.hidden = true; return; }
    photoCredit.innerHTML = '';
    photoCredit.append('photo by ');
    const a = document.createElement('a');
    a.href = photo.link || 'https://www.pexels.com';
    a.target = '_blank'; a.rel = 'noopener';
    a.textContent = photo.by || 'unknown';
    photoCredit.append(a, ' on Pexels');
    photoCredit.hidden = false;
  }

  // Auto (deterministic) placement for practice + un-curated days.
  // Uses 3D rendered figure (FIGURE3D) when available, falls back to SVG.
  async function buildAuto(seedStr, photo) {
    stopReveal();
    const rng = rngFrom(seedStr);
    const src = photo ? photo.src : IMAGES[Math.floor(rng() * IMAGES.length) % IMAGES.length];
    const img = await MECHA.loadImage(src);
    const { CW, CH } = MECHA.sizeFor(img, MECHA.DEFAULTS);
    const figH = Math.round(CH * lerp(0.085, 0.115, rng()));
    const figW = Math.round(figH * MECHA.FIG_ASPECT);
    const rot = (rng() * 2 - 1) * MECHA.DEFAULTS.rotDeg * Math.PI / 180;

    const base = document.createElement('canvas'); base.width = CW; base.height = CH;
    const bctx = base.getContext('2d', { willReadFrequently: true });
    bctx.drawImage(img, 0, 0, CW, CH);
    const baseData = bctx.getImageData(0, 0, CW, CH).data;

    // Pick a random 3D pose
    const poseIdx = Math.floor(rng() * FIGURE3D.POSES_PROCEDURAL.length);

    // Find placement first (need position to sample lighting)
    const spot = MECHA.autoPlace(baseData, CW, CH, figW, figH, MECHA.DEFAULTS, rng);

    // Sample lighting from the photo around the placement area
    const lighting = FIGURE3D.sampleLighting(baseData, CW, CH, spot.fx, spot.fy, figW, figH);
    // Derive the light balance from the patch's texture/brightness.
    FIGURE3D.applyAutoTune(baseData, CW, CH, spot.fx, spot.fy, figW, figH);

    // Render 3D figure
    let figImg;
    try {
      const model = await FIGURE3D.getModel(poseIdx);
      figImg = FIGURE3D.render(model, figW, figH, lighting, rot);
    } catch (err) {
      console.warn('[MC] 3D figure failed, falling back to SVG:', err);
      figImg = await MECHA.figure(MECHA.DEFAULTS.shadow);
    }

    const { visLo, visHi } = MECHA.DEFAULTS;

    // Calibrate visibility
    let bestResult = null, bestSpot = spot, bestDist = Infinity;
    for (let attempt = 0; attempt < 3; attempt++) {
      const s = attempt === 0 ? spot : MECHA.autoPlace(baseData, CW, CH, figW, figH, MECHA.DEFAULTS, rng);
      if (attempt > 0) {
        // Re-render figure for new spot's lighting
        const lit = FIGURE3D.sampleLighting(baseData, CW, CH, s.fx, s.fy, figW, figH);
        FIGURE3D.applyAutoTune(baseData, CW, CH, s.fx, s.fy, figW, figH);
        try {
          const model = await FIGURE3D.getModel(poseIdx);
          figImg = FIGURE3D.render(model, figW, figH, lit, rot);
        } catch (_) {}
      }
      const p = {
        img, CW, CH, fx: s.fx, fy: s.fy, figW, figH, rot,
        blend: MECHA.DEFAULTS.blend, feather: MECHA.DEFAULTS.feather, figImg,
        opacity: MECHA.adaptiveOpacity(s.st.detail, MECHA.DEFAULTS),
      };
      const r = MECHA.calibratedCompose(p, baseData, visLo, visHi);
      const dist = r.vis < visLo ? visLo - r.vis : r.vis > visHi ? r.vis - visHi : 0;
      if (dist < bestDist) { bestDist = dist; bestResult = r; bestSpot = s; }
      if (dist === 0) break;
    }

    canvas.width = CW; canvas.height = CH;
    scene = bestResult.scene; mask = bestResult.mask;
    round = {
      CW, CH, fx: bestSpot.fx, fy: bestSpot.fy, figW, figH,
      cx: bestSpot.fx + figW / 2, cy: bestSpot.fy + figH / 2, rot,
      blend: MECHA.DEFAULTS.blend, opacity: bestResult.opacity,
      shadow: MECHA.DEFAULTS.shadow,
      _figImg: figImg, _won: false,
      _rebuild: { img, baseData, poseIdx, spot: bestSpot, rot },
    };
    ctx.drawImage(scene, 0, 0);
    if (params.has('debug')) window.__mc = { round, isHit, vis: bestResult.vis };
  }

  // Approved puzzle from daily.json.
  async function buildFromEntry(e) {
    stopReveal();
    const img = await MECHA.loadImage(e.image);
    const { CW, CH } = MECHA.sizeFor(img, MECHA.DEFAULTS);
    const figH = Math.round(CH * (e.size || MECHA.DEFAULTS.figSize));
    const figW = Math.round(figH * MECHA.FIG_ASPECT);
    const fx = Math.round(e.x * CW - figW / 2);
    const fy = Math.round(e.y * CH - figH / 2);
    const rot = (e.rot || 0) * Math.PI / 180;
    const shadow = e.shadow != null ? e.shadow : MECHA.DEFAULTS.shadow;

    // Use 3D figure with lighting from placement area
    let figImg;
    const base = document.createElement('canvas'); base.width = CW; base.height = CH;
    const bctx = base.getContext('2d', { willReadFrequently: true });
    bctx.drawImage(img, 0, 0, CW, CH);
    const baseData = bctx.getImageData(0, 0, CW, CH).data;
    const poseIdx = (e.pose != null) ? e.pose : Math.floor(Math.random() * FIGURE3D.POSE_PATHS.length);
    try {
      const lighting = FIGURE3D.sampleLighting(baseData, CW, CH, fx, fy, figW, figH);
      const model = await FIGURE3D.getModel(poseIdx);
      figImg = FIGURE3D.render(model, figW, figH, lighting, rot);
    } catch (err) {
      console.warn('3D figure failed, falling back to SVG:', err);
      figImg = await MECHA.figure(shadow);
    }
    finishRound({ img, CW, CH, fx, fy, figW, figH, rot, blend: e.blend || 'multiply', opacity: e.opacity != null ? e.opacity : 0.9, shadow }, figImg);
  }

  // ---- perimeter timer (drawn directly on the game canvas) ----------------
  // Snake starts at top-LEFT corner and travels clockwise.
  // ctx.rect() starts at top-left, so dashOffset=0 puts the dash head right there.

  const PERIM = { enabled: false };

  function drawPerim(t) {
    if (!PERIM.enabled || !round) return;
    const { CW, CH } = round;

    const sw    = Math.max(12, CW * 0.025);
    const s     = sw / 2;
    // Inset the rect by sw/2 so the stroke stays fully inside the canvas
    const x0 = s, y0 = s, x1 = CW - s, y1 = CH - s;
    const total  = 2 * (x1 - x0) + 2 * (y1 - y0);
    const filled = (t / CONFIG.loseAt) * total;
    if (filled <= 0) return;

    ctx.save();
    // Clip so nothing bleeds outside the canvas bounds
    ctx.beginPath(); ctx.rect(0, 0, CW, CH); ctx.clip();
    ctx.strokeStyle = rgbCss(zoneRGB(t));
    ctx.lineWidth   = sw;
    ctx.lineCap     = 'square';
    ctx.lineJoin    = 'miter';
    ctx.setLineDash([filled, total]);
    ctx.lineDashOffset = 0;
    ctx.beginPath();
    ctx.rect(x0, y0, x1 - x0, y1 - y0);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }



  // ---- per-frame draw during play -----------------------------------------
  function drawFrame(t) {
    ctx.drawImage(scene, 0, 0);
    const now = performance.now();
    for (let i = misses.length - 1; i >= 0; i--) {
      const m = misses[i];
      const age = (now - m.t) / 650;
      if (age >= 1) { misses.splice(i, 1); continue; }
      ctx.beginPath(); ctx.arc(m.x, m.y, 8 + age * 20, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255,255,255,${0.5 * (1 - age)})`; ctx.lineWidth = 2; ctx.stroke();
      ctx.beginPath(); ctx.arc(m.x, m.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(226,59,46,${0.9 * (1 - age)})`; ctx.fill();
    }
    if (t != null) drawPerim(t);
  }

  function tick(now) {
    if (!running) return;
    elapsed = (now - startTime) / 1000;
    if (elapsed >= CONFIG.loseAt && !params.has('debug')) { elapsed = CONFIG.loseAt; endGame(false); return; }
    const c = zoneRGB(elapsed);
    timeText.textContent = elapsed.toFixed(1);
    hudPlay.style.color = rgbCss(c);
    drawFrame(elapsed);
    raf = requestAnimationFrame(tick);
  }

  function startGame() {
    stopReveal();
    startOverlay.hidden = true;
    resultBar.hidden = true;
    practiceRow.hidden = true;
    hudEnd.hidden = true;
    hudPlay.hidden = false;
    PERIM.enabled = true;
    clicks = 0; misses.length = 0;
    clickText.textContent = '0'; clickLbl.textContent = 'clicks';
    timeText.textContent = '0.0';
    hudPlay.style.color = rgbCss(C_GREEN);
    ctx.drawImage(scene, 0, 0);
    running = true; startTime = performance.now();
    raf = requestAnimationFrame(tick);
  }

  // ---- clicks -------------------------------------------------------------
  function canvasPoint(e) {
    const rect = canvas.getBoundingClientRect();
    const sx = canvas.width / rect.width, sy = canvas.height / rect.height;
    return { x: Math.round((e.clientX - rect.left) * sx), y: Math.round((e.clientY - rect.top) * sy) };
  }
  function isHit(x, y) {
    if (x < 0 || y < 0 || x >= round.CW || y >= round.CH) return false;
    return mask[(y * round.CW + x) * 4 + 3] > MECHA.DEFAULTS.hitAlpha;
  }
  canvas.addEventListener('click', (e) => {
    if (!running) return;
    const { x, y } = canvasPoint(e);
    clicks++; clickText.textContent = String(clicks); clickLbl.textContent = plural(clicks);
    if (isHit(x, y)) endGame(true); else misses.push({ x, y, t: performance.now() });
  });

  // ---- end / reveal -------------------------------------------------------
  function endGame(won) {
    running = false; cancelAnimationFrame(raf);
    PERIM.enabled = false;
    round._won = won;
    if (mode === 'daily' && !FORCE_SEED) saveDaily(won);
    showEndState(won, elapsed, clicks);
    startReveal();
  }

  function startReveal() {
    // Color everything by the time taken — same color for figure, circle, and verdict
    round._endCol = zoneRGB(elapsed);
    round._revealFig = MECHA.revealFigure(round._figImg, round.figW, round.figH, round._endCol);
    revealStart = 0; cancelAnimationFrame(revealRAF); revealRAF = requestAnimationFrame(revealLoop);
  }
  function stopReveal() { cancelAnimationFrame(revealRAF); revealRAF = 0; }

  function revealLoop(now) {
    if (!revealStart) revealStart = now;
    const t = (now - revealStart) / 1000;
    const { cx, cy, figW, figH, CW } = round;
    ctx.drawImage(scene, 0, 0);

    // Draw verdict FIRST so the figure + circle render on top of the text
    drawVerdict(round._won, elapsed, clicks);

    // Figure silhouette
    ctx.save();
    ctx.globalAlpha = 0.9; ctx.translate(cx, cy); ctx.rotate(round.rot);
    ctx.drawImage(round._revealFig, -figW / 2, -figH / 2, figW, figH);
    ctx.restore();

    // Pulsing + steady circle
    const col = round._endCol;
    const baseR = Math.max(figW, figH) * 0.75;
    const p = (t * 0.85) % 1;
    ctx.beginPath(); ctx.arc(cx, cy, baseR + p * baseR * 0.7, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${col[0]},${col[1]},${col[2]},${0.45 * (1 - p)})`; ctx.lineWidth = Math.max(2, CW * 0.004); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, baseR, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${col[0]},${col[1]},${col[2]},0.95)`; ctx.lineWidth = Math.max(3, CW * 0.006); ctx.stroke();

    revealRAF = requestAnimationFrame(revealLoop);
  }

  // Draw verdict text at the very top of the canvas — no background box.
  function drawVerdict(won, time, nClicks) {
    if (!round) return;
    const { CW, CH } = round;
    const word = won ? 'FOUND IT!' : "TIME'S UP";
    const col  = round._endCol ? rgbCss(round._endCol) : rgbCss(zoneRGB(time));

    ctx.save();
    ctx.textBaseline = 'top';
    ctx.textAlign    = 'left';

    // Binary-search font size so the word fills the full canvas width
    let lo = 10, hi = CW * 1.5, fs = hi / 2;
    for (let i = 0; i < 20; i++) {
      ctx.font = `900 ${fs}px Anton, sans-serif`;
      const w = ctx.measureText(word).width;
      if (Math.abs(w - CW) < 0.5) break;
      if (w < CW) lo = fs; else hi = fs;
      fs = (lo + hi) / 2;
    }

    // Word sits right at the top edge (y=0)
    ctx.font      = `900 ${fs}px Anton, sans-serif`;
    ctx.fillStyle = col;
    ctx.fillText(word, 0, 0);

    // Stats line — Bebas Neue, same color, "s" as subscript (baseline-aligned)
    const timeVal   = won ? time.toFixed(1) : '30.0';
    const clicksStr = '  ·  ' + nClicks + ' ' + plural(nClicks);
    const statFs    = Math.max(18, CW * 0.055);
    const unitFs    = statFs * 0.58;   // smaller "s"
    const yBaseline = fs * 0.82 + statFs * 0.72;  // baseline position

    ctx.textBaseline = 'alphabetic';   // align by baseline so small "s" sits lower
    ctx.fillStyle    = col;

    ctx.font = `400 ${statFs}px "Bebas Neue", sans-serif`;
    ctx.fillText(timeVal, 2, yBaseline);
    const timeW = ctx.measureText(timeVal).width;

    ctx.font = `400 ${unitFs}px "Bebas Neue", sans-serif`;
    ctx.fillText('s', 2 + timeW + 1, yBaseline);
    const unitW = ctx.measureText('s').width;

    ctx.font = `400 ${statFs}px "Bebas Neue", sans-serif`;
    ctx.fillText(clicksStr, 2 + timeW + unitW + 2, yBaseline);

    ctx.restore();
  }

  function showEndState(won, time, nClicks) {
    hudPlay.hidden   = true;
    hudEnd.hidden    = true;   // verdict lives on canvas
    resultBar.hidden = false;
    practiceRow.hidden = false;
    drawVerdict(won, time, nClicks);

    // Color the Share button to match everything else
    const col = round._endCol || zoneRGB(time);
    shareBtn.style.background = rgbCss(col);
    shareBtn.style.color = '#000';

  }

  // ---- stats --------------------------------------------------------------
  const STATS_KEY = 'mc-stats-v1';
  const dailyKey = (k) => `mc-daily-${k}`;
  function loadStats() { try { return JSON.parse(localStorage.getItem(STATS_KEY)) || {}; } catch (_) { return {}; } }
  function saveDaily(won) {
    const rec = { won, time: +elapsed.toFixed(1), clicks, day: dayNumber() };
    try { localStorage.setItem(dailyKey(todayUTCKey()), JSON.stringify(rec)); } catch (_) {}
    const s = loadStats();
    s.played = (s.played || 0) + 1;
    if (won) { s.wins = (s.wins || 0) + 1; if (s.best == null || rec.time < s.best) s.best = rec.time; }
    const y = new Date(); y.setUTCDate(y.getUTCDate() - 1);
    const yKey = `${y.getUTCFullYear()}-${String(y.getUTCMonth() + 1).padStart(2, '0')}-${String(y.getUTCDate()).padStart(2, '0')}`;
    let prevStreak = 0;
    try { const yr = JSON.parse(localStorage.getItem(dailyKey(yKey))); if (yr && yr.won) prevStreak = s._streak || 0; } catch (_) {}
    s._streak = won ? (prevStreak + 1) : 0; s.streak = s._streak;
    try { localStorage.setItem(STATS_KEY, JSON.stringify(s)); } catch (_) {}
  }
  function playedToday() { try { return JSON.parse(localStorage.getItem(dailyKey(todayUTCKey()))); } catch (_) { return null; } }

  // ---- share --------------------------------------------------------------
  function shareText(won, time, nClicks) {
    const head = `Meccha Chameleon #${dayNumber()}`;
    const line = won ? `${zoneEmoji(time)} ${time.toFixed(1)}s · ${nClicks} clicks` : `❌ didn't find it · ${nClicks} clicks`;
    return `${head}\n${line}\nkmufti.com/chameleon`;
  }
  function toast(msg) {
    let t = document.querySelector('.mc-toast');
    if (!t) { t = document.createElement('div'); t.className = 'mc-toast'; document.body.appendChild(t); }
    t.textContent = msg;
    requestAnimationFrame(() => t.classList.add('show'));
    clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 1600);
  }
  shareBtn.addEventListener('click', async () => {
    const txt = shareText(round._won, elapsed, clicks);
    try {
      if (navigator.share) { await navigator.share({ text: txt }); return; }
      await navigator.clipboard.writeText(txt); toast('Copied to clipboard');
    } catch (_) { toast('Copy failed'); }
  });

  practiceBtn.addEventListener('click', async () => {
    mode = 'practice'; resultBar.hidden = true; hudEnd.hidden = true; practiceRow.hidden = true;
    const photo = await practicePhoto();
    showCredit(photo);
    await buildAuto('practice-' + Math.random().toString(36).slice(2), photo);
    startGame();
  });

  startBtn.addEventListener('click', () => {
    if (mode === 'daily' && !NO_LOCK) {
      const prev = playedToday();
      if (prev) { startOverlay.hidden = true; showLockedResult(prev); return; }
    }
    startGame();
  });

  function showLockedResult(prev) {
    round._won = prev.won; elapsed = prev.time; clicks = prev.clicks;
    PERIM.enabled = false; // game wasn't played this session
    showEndState(prev.won, prev.time, prev.clicks);
    startReveal();
  }

  // ---- boot ---------------------------------------------------------------
  async function boot() {
    $('dayLabel').textContent = 'DAY ' + dayNumber();
    await loadManifest();
    FIGURE3D.preloadAll();   // start loading 3D poses in background
    await loadDaily();

    if (FORCE_SEED) {
      await buildAuto('seed-' + FORCE_SEED);
    } else {
      const entry = DAILY[todayUTCKey()];
      if (entry) await buildFromEntry(entry);
      else { showCredit(null); await buildAuto('daily-' + todayUTCKey()); }
    }

    if (mode === 'daily' && !NO_LOCK && !FORCE_SEED) {
      const prev = playedToday();
      if (prev) { startOverlay.hidden = true; showLockedResult(prev); }
    }

    // Debug: re-render the live round's figure whenever CFG changes
    if (params.has('debug')) {
      window.addEventListener('f3d-cfg-changed', async () => {
        if (!round || !round._rebuild) return;
        const { img, baseData, poseIdx, spot, rot } = round._rebuild;
        const { CW, CH, figW, figH } = round;
        try {
          const lighting = FIGURE3D.sampleLighting(baseData, CW, CH, spot.fx, spot.fy, figW, figH);
          const model = await FIGURE3D.getModel(poseIdx);
          const figImg = FIGURE3D.render(model, figW, figH, lighting, rot);
          const r = MECHA.compose({
            img, CW, CH, fx: spot.fx, fy: spot.fy, figW, figH, rot,
            blend: round.blend, opacity: round.opacity,
            feather: MECHA.DEFAULTS.feather, figImg,
          });
          scene = r.scene; mask = r.mask;
          round._figImg = figImg;
          ctx.drawImage(scene, 0, 0);
        } catch (e) { console.error('[MC] debug rebuild failed', e); }
      });
    }

    // Debug: bottom-left button to swap the image (new random round)
    if (params.has('debug')) {
      const btn = document.createElement('button');
      btn.textContent = 'CHANGE IMAGE';
      btn.style.cssText = 'position:fixed;bottom:10px;left:10px;z-index:99999;background:#333;color:#eee;border:1px solid #666;padding:6px 12px;font:12px monospace;cursor:pointer;';
      btn.addEventListener('click', async () => {
        mode = 'practice'; resultBar.hidden = true; hudEnd.hidden = true; practiceRow.hidden = true;
        await buildAuto('debug-' + Math.random().toString(36).slice(2));
        startGame();
      });
      document.body.appendChild(btn);

      // Pause/resume the round timer
      const pauseBtn = document.createElement('button');
      pauseBtn.textContent = 'PAUSE TIMER';
      pauseBtn.style.cssText = 'position:fixed;bottom:10px;left:130px;z-index:99999;background:#333;color:#eee;border:1px solid #666;padding:6px 12px;font:12px monospace;cursor:pointer;';
      let pausedAt = 0;
      pauseBtn.addEventListener('click', () => {
        if (running) {
          running = false; cancelAnimationFrame(raf);
          pausedAt = performance.now();
          pauseBtn.textContent = 'RESUME TIMER';
        } else if (pausedAt) {
          startTime += performance.now() - pausedAt;   // don't count paused time
          pausedAt = 0;
          running = true; raf = requestAnimationFrame(tick);
          pauseBtn.textContent = 'PAUSE TIMER';
        }
      });
      document.body.appendChild(pauseBtn);
    }
  }

  boot().catch((err) => {
    console.error(err);
    startOverlay.innerHTML = '<p class="mc-sub">Couldn\'t load the puzzle. Refresh to try again.</p>';
  });
})();
