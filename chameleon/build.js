/* Meccha Chameleon — Builder.
 *
 * Tune placement / blend / shadow / filters per photo (rendered by the SAME
 * engine the game uses, so the preview never lies), then approve puzzles into a
 * dated queue and export daily.json.
 */
(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const cvs = $('c'), cx = cvs.getContext('2d', { willReadFrequently: true });

  const cfg = Object.assign({}, MECHA.DEFAULTS);

  const S = {
    path: null, img: null, CW: 0, CH: 0, baseData: null,
    x: 0.5, y: 0.5, size: MECHA.DEFAULTS.figSize, rot: 0,
    blend: 'multiply', shadow: MECHA.DEFAULTS.shadow, opacity: 0.9,
    reveal: false, autoOp: true,
  };

  let IMAGES = [];
  let QUEUE = loadQueue();
  let BANNED = loadBanned();

  // ---- images -------------------------------------------------------------
  async function loadImages() {
    try { const r = await fetch('images/manifest.json', { cache: 'no-cache' }); IMAGES = (await r.json()).images || []; } catch (_) {}
    const sel = $('imgSel'); sel.innerHTML = '';
    IMAGES.forEach((p) => { const o = document.createElement('option'); o.value = p; o.textContent = p.replace('images/', ''); sel.appendChild(o); });
  }

  async function setImage(path) {
    S.path = path;
    S.img = await MECHA.loadImage(path);
    const { CW, CH } = MECHA.sizeFor(S.img, cfg);
    S.CW = CW; S.CH = CH;
    const b = document.createElement('canvas'); b.width = CW; b.height = CH;
    const bc = b.getContext('2d', { willReadFrequently: true });
    bc.drawImage(S.img, 0, 0, CW, CH);
    S.baseData = bc.getImageData(0, 0, CW, CH).data;
    cvs.width = CW; cvs.height = CH;
    autoPlace();
  }

  const figDims = () => { const figH = Math.round(S.CH * S.size); return { figH, figW: Math.round(figH * MECHA.FIG_ASPECT) }; };

  function autoPlace() {
    if (!S.baseData) return;
    const { figW, figH } = figDims();
    const best = MECHA.autoPlace(S.baseData, S.CW, S.CH, figW, figH, cfg, Math.random);
    S.x = (best.fx + figW / 2) / S.CW;
    S.y = (best.fy + figH / 2) / S.CH;
    if (S.autoOp) S.opacity = MECHA.adaptiveOpacity(best.st.detail, cfg);
    syncInputs();
    recompute();
  }

  async function recompute() {
    if (!S.img) return;
    const { figW, figH } = figDims();
    const fx = Math.round(S.x * S.CW - figW / 2);
    const fy = Math.round(S.y * S.CH - figH / 2);
    const rot = S.rot * Math.PI / 180;
    const figImg = await MECHA.figure(S.shadow);
    const { scene } = MECHA.compose({ img: S.img, CW: S.CW, CH: S.CH, fx, fy, figW, figH, rot, blend: S.blend, opacity: S.opacity, feather: cfg.feather, figImg });
    cx.drawImage(scene, 0, 0);
    if (S.reveal) {
      const rf = MECHA.revealFigure(figImg, figW, figH, [39, 201, 110]);
      cx.save(); cx.globalAlpha = 0.9; cx.translate(fx + figW / 2, fy + figH / 2); cx.rotate(rot); cx.drawImage(rf, -figW / 2, -figH / 2); cx.restore();
      cx.beginPath(); cx.arc(fx + figW / 2, fy + figH / 2, Math.max(figW, figH) * 0.75, 0, Math.PI * 2);
      cx.strokeStyle = 'rgba(39,201,110,0.9)'; cx.lineWidth = Math.max(3, S.CW * 0.006); cx.stroke();
    }
    updateBadge(fx, fy, figW, figH);
  }

  function updateBadge(fx, fy, figW, figH) {
    const chk = MECHA.checkSpot(S.baseData, S.CW, fx, fy, figW, figH, cfg);
    const badge = $('badge');
    badge.textContent = `${chk.ok ? '✓' : '✕'} ${chk.reason}  ·  detail ${chk.stats.detail.toFixed(1)}  ·  lum ${Math.round(chk.stats.mean)}`;
    badge.className = 'b-badge ' + (chk.ok ? 'ok' : 'bad');
  }

  // ---- drag to place ------------------------------------------------------
  let dragging = false;
  const ptFrac = (e) => { const r = cvs.getBoundingClientRect(); return { x: clamp((e.clientX - r.left) / r.width, 0, 1), y: clamp((e.clientY - r.top) / r.height, 0, 1) }; };
  cvs.addEventListener('pointerdown', (e) => { dragging = true; cvs.setPointerCapture(e.pointerId); const p = ptFrac(e); S.x = p.x; S.y = p.y; recompute(); });
  cvs.addEventListener('pointermove', (e) => { if (!dragging) return; const p = ptFrac(e); S.x = p.x; S.y = p.y; recompute(); });
  cvs.addEventListener('pointerup', () => { dragging = false; });

  // ---- inputs -------------------------------------------------------------
  function syncInputs() {
    $('size').value = S.size; $('sizeV').textContent = S.size.toFixed(3);
    $('rot').value = S.rot; $('rotV').textContent = S.rot + '°';
    $('shadow').value = S.shadow; $('shadowV').textContent = S.shadow.toFixed(2);
    $('opacity').value = S.opacity; $('opacityV').textContent = S.opacity.toFixed(2);
    $('blend').value = S.blend;
    $('targetDetail').value = cfg.targetDetail; $('targetDetailV').textContent = cfg.targetDetail;
    $('detailLo').value = cfg.detailLo; $('detailLoV').textContent = cfg.detailLo;
    $('detailHi').value = cfg.detailHi; $('detailHiV').textContent = cfg.detailHi;
    $('minLum').value = cfg.minLum; $('minLumV').textContent = cfg.minLum;
    $('maxLum').value = cfg.maxLum; $('maxLumV').textContent = cfg.maxLum;
  }
  function bindRange(id, apply, fmt) {
    const el = $(id);
    el.addEventListener('input', () => { apply(parseFloat(el.value)); $(id + 'V').textContent = fmt(parseFloat(el.value)); recompute(); });
  }
  bindRange('size', (v) => S.size = v, (v) => v.toFixed(3));
  bindRange('rot', (v) => S.rot = v, (v) => v + '°');
  bindRange('shadow', (v) => S.shadow = v, (v) => v.toFixed(2));
  bindRange('opacity', (v) => { S.opacity = v; }, (v) => v.toFixed(2));
  bindRange('targetDetail', (v) => cfg.targetDetail = v, (v) => v);
  bindRange('detailLo', (v) => cfg.detailLo = v, (v) => v);
  bindRange('detailHi', (v) => cfg.detailHi = v, (v) => v);
  bindRange('minLum', (v) => cfg.minLum = v, (v) => v);
  bindRange('maxLum', (v) => cfg.maxLum = v, (v) => v);
  $('blend').addEventListener('change', (e) => { S.blend = e.target.value; recompute(); });
  $('revealChk').addEventListener('change', (e) => { S.reveal = e.target.checked; recompute(); });
  $('autoOpChk').addEventListener('change', (e) => { S.autoOp = e.target.checked; });
  $('imgSel').addEventListener('change', (e) => setImage(e.target.value));
  $('autoBtn').addEventListener('click', autoPlace);

  // ---- ban ----------------------------------------------------------------
  function loadBanned() { try { return JSON.parse(localStorage.getItem('mc-build-banned')) || []; } catch (_) { return []; } }
  function saveBanned() { localStorage.setItem('mc-build-banned', JSON.stringify(BANNED)); renderBanned(); }
  function isBanned(path) { return BANNED.includes(path); }

  $('banBtn').addEventListener('click', () => {
    if (!S.path) { alert('No image loaded.'); return; }
    if (isBanned(S.path)) { alert('Already banned.'); return; }
    // Remove any queue entries for this image
    for (const k of Object.keys(QUEUE)) { if (QUEUE[k].image === S.path) delete QUEUE[k]; }
    BANNED.push(S.path);
    saveBanned();
    saveQueue();
    // Move to next non-banned image
    const next = IMAGES.find((p) => !isBanned(p) && p !== S.path);
    if (next) { $('imgSel').value = next; setImage(next); }
    renderBanned();
  });

  function renderBanned() {
    const el = $('bannedList'); el.innerHTML = '';
    if (!BANNED.length) { el.innerHTML = '<div class="b-queue-empty">No images banned.</div>'; return; }
    for (const p of BANNED) {
      const row = document.createElement('div'); row.className = 'b-qrow';
      const name = document.createElement('span'); name.className = 'qi'; name.style.flex = '1'; name.textContent = p.replace('images/', '');
      const unban = document.createElement('button'); unban.textContent = '↩ unban'; unban.className = 'b-unban'; unban.title = 'Unban this image';
      unban.onclick = () => { BANNED = BANNED.filter((x) => x !== p); saveBanned(); };
      row.append(name, unban); el.appendChild(row);
    }
  }

  // ---- queue --------------------------------------------------------------
  function loadQueue() { try { return JSON.parse(localStorage.getItem('mc-build-queue')) || {}; } catch (_) { return {}; } }
  function saveQueue() { localStorage.setItem('mc-build-queue', JSON.stringify(QUEUE)); renderQueue(); }
  function currentEntry() {
    return { image: S.path, x: +S.x.toFixed(4), y: +S.y.toFixed(4), size: +S.size.toFixed(3), rot: +S.rot, blend: S.blend, shadow: +S.shadow.toFixed(2), opacity: +S.opacity.toFixed(2) };
  }
  $('addBtn').addEventListener('click', () => {
    const date = $('date').value;
    if (!date) { alert('Pick a date first.'); return; }
    QUEUE[date] = currentEntry();
    saveQueue();
    $('date').value = nextFreeDate();
  });
  function renderQueue() {
    const el = $('queue'); el.innerHTML = '';
    const keys = Object.keys(QUEUE).sort();
    if (!keys.length) { el.innerHTML = '<div class="b-queue-empty">No puzzles approved yet.</div>'; return; }
    for (const k of keys) {
      const row = document.createElement('div'); row.className = 'b-qrow';
      const date = document.createElement('span'); date.className = 'qd'; date.textContent = k;
      const img = document.createElement('span'); img.className = 'qi'; img.textContent = (QUEUE[k].image || '').replace('images/', '');
      const load = document.createElement('button'); load.textContent = '✎ edit'; load.className = 'b-qbtn'; load.title = 'Load into editor';
      load.onclick = () => loadEntry(k);
      const del = document.createElement('button'); del.textContent = '✕ delete'; del.className = 'b-qbtn b-qbtn-del'; del.title = 'Remove from queue';
      del.onclick = () => { if (confirm(`Remove ${k} from queue?`)) { delete QUEUE[k]; saveQueue(); } };
      row.append(date, img, load, del); el.appendChild(row);
    }
  }
  async function loadEntry(date) {
    const e = QUEUE[date];
    $('date').value = date;
    S.size = e.size; S.rot = e.rot; S.blend = e.blend; S.shadow = e.shadow; S.opacity = e.opacity; S.autoOp = false; $('autoOpChk').checked = false;
    $('imgSel').value = e.image;
    await setImageNoAuto(e.image);
    S.x = e.x; S.y = e.y;
    syncInputs(); recompute();
  }
  async function setImageNoAuto(path) {
    S.path = path; S.img = await MECHA.loadImage(path);
    const { CW, CH } = MECHA.sizeFor(S.img, cfg); S.CW = CW; S.CH = CH;
    const b = document.createElement('canvas'); b.width = CW; b.height = CH;
    const bc = b.getContext('2d', { willReadFrequently: true }); bc.drawImage(S.img, 0, 0, CW, CH);
    S.baseData = bc.getImageData(0, 0, CW, CH).data; cvs.width = CW; cvs.height = CH;
  }

  const JSON_NOTE = 'Approved daily puzzles, keyed by UTC date (YYYY-MM-DD). Fields: image, x, y (figure CENTER as fractions 0-1), size (height fraction), rot (deg), blend, shadow (0-1), opacity (0-1). Days with no entry fall back to auto-placement.';
  const queueJSON = () => JSON.stringify({ note: JSON_NOTE, puzzles: QUEUE }, null, 2);
  $('exportBtn').addEventListener('click', () => {
    const blob = new Blob([queueJSON()], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'daily.json'; a.click();
  });
  $('copyBtn').addEventListener('click', async () => { try { await navigator.clipboard.writeText(queueJSON()); $('copyBtn').textContent = 'Copied!'; setTimeout(() => $('copyBtn').textContent = 'Copy JSON', 1200); } catch (_) {} });
  $('importBtn').addEventListener('click', async () => {
    try { const r = await fetch('daily.json', { cache: 'no-cache' }); const j = await r.json(); QUEUE = j.puzzles || {}; saveQueue(); } catch (_) { alert('No daily.json found.'); }
  });

  function nextFreeDate() {
    const d = new Date();
    for (let i = 0; i < 400; i++) {
      const k = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
      if (!QUEUE[k]) return k;
      d.setUTCDate(d.getUTCDate() + 1);
    }
    return '';
  }

  // ---- init ---------------------------------------------------------------
  (async () => {
    await loadImages();
    renderQueue();
    renderBanned();
    $('date').value = nextFreeDate();
    const firstUnbanned = IMAGES.find((p) => !isBanned(p));
    if (firstUnbanned) { $('imgSel').value = firstUnbanned; await setImage(firstUnbanned); }
  })();
})();
