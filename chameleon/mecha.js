/* Meccha Chameleon — shared engine.
 *
 * The single source of truth for BOTH the live game and the builder tool, so a
 * preview in the builder renders pixel-identically to what players see.
 *
 * Responsibilities:
 *   - the blank figure (generated from SVG, with a tunable shadow depth)
 *   - region scoring (fine detail + luminance) used by placement + filters
 *   - auto-placement (pick a good hiding spot)
 *   - composing a scene (base photo + camouflaged figure) + the hit mask
 *
 * No UI, no timers, no DOM beyond offscreen canvases.
 */
window.MECHA = (function () {
  'use strict';

  const FIG_ASPECT = 220 / 440;

  // Defaults. The builder can override any of these per-image; the game reads
  // approved values from daily.json, or falls back to these for auto puzzles.
  const DEFAULTS = {
    figSize: 0.10,       // figure height as a fraction of canvas height
    blend: 'multiply',   // 'multiply' | 'soft-light' | 'overlay' | 'darken'
    shadow: 0.72,        // figure's shaded-rim gray (0 = black rim, 1 = no shadow)
    opacityMin: 0.58,    // imprint strength on smooth areas
    opacityMax: 1.00,    // imprint strength in busy areas
    feather: 0.8,        // px edge blur when compositing
    rotDeg: 8,           // max random tilt
    // placement + filters
    // 400, not 48. The filters below now reject a region rather than merely
    // charging for it, and the acceptable luminance window is narrower, so a
    // draw of 48 often held nothing that qualified and the round fell back to
    // a spot that had been rejected - measured at 5 of 22 rounds. At 400 that
    // drops to about 1 in 22 and no round lands outside the window at all.
    // It costs 0.7ms instead of 0.2ms per draw, about 3ms a round in all.
    candidates: 400,
    targetDetail: 12,    // aim for this fine-detail level
    detailLo: 4,         // detail→strength mapping floor
    detailHi: 22,        // detail→strength mapping ceiling (NOT a reject bound)
    // Separate from detailHi on purpose: detailHi is the top of the
    // detail→opacity ramp, so moving it would quietly restrength every
    // round. This is only the "too busy to be findable" cut-off, and 13 is
    // where the flagged rounds put it - 3 broken above it, no good ones.
    detailReject: 13,
    // 70, not 55: of the flagged rounds, 7 of the 14 broken ones sat on a
    // region below 70 and not one of the 9 good ones did. 55 was letting
    // through a band of near-black regions where multiply has nothing to
    // darken, so the figure was there and nobody could see it.
    minLum: 70,          // reject regions darker than this (multiply dies on black)
    // 150, not 225. The figure's lighting is sampled from the region it sits
    // on, so a bright region renders a near-white figure - and multiply by
    // white is a no-op, which means no amount of opacity can make it
    // visible. Measured directly: a region at lum 172 produced a figure at
    // lum 253 and a vis of 0.64, while regions at 105-142 gave figures at
    // 170-192 and a vis near 12. The flagged rounds say the same - the
    // brightest round anyone called good sat at 139.8, and the two most
    // invisible broken ones at 215.2 and 145.3.
    maxLum: 150,         // reject regions so bright the figure bleaches out
    inset: 0.08,
    hitAlpha: 32,
    maxCanvasH: 1200,
    // difficulty calibration: target mean ΔLuminance over the figure area
    // visLo was 6, which turned out to be most of the problem. The band is
    // the difficulty dial, and the bottom half of [6, 14] produced nothing
    // but unfindable rounds: of the flagged rounds, every one of the 8
    // calibrated-broken below 9.5 timed out, and the 9 good ones all landed
    // at 9.85 or above (median 11.9). 9.5 is the knee - at 10 it starts
    // throwing away rounds that played well.
    visLo: 9.5,  // below this = nearly invisible (too hard)
    visHi: 14,   // above this = pops out (too easy)
  };

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const grayHex = (f) => { const v = Math.round(clamp(f, 0, 1) * 255).toString(16).padStart(2, '0'); return `#${v}${v}${v}`; };

  // ---- the figure -------------------------------------------------------
  // Mostly white (vanishes under multiply) with a soft shaded rim toward the
  // lower-right; `shadow` sets how dark that rim is.
  function figureSVG(shadow) {
    const rim = grayHex(shadow);
    const rimHead = grayHex(Math.min(1, shadow + 0.03));
    return `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="440" viewBox="0 0 220 440">
  <defs>
    <radialGradient id="body" cx="37%" cy="30%" r="80%">
      <stop offset="0%" stop-color="#ffffff"/><stop offset="64%" stop-color="#ffffff"/><stop offset="100%" stop-color="${rim}"/>
    </radialGradient>
    <radialGradient id="head" cx="37%" cy="32%" r="74%">
      <stop offset="0%" stop-color="#ffffff"/><stop offset="60%" stop-color="#ffffff"/><stop offset="100%" stop-color="${rimHead}"/>
    </radialGradient>
  </defs>
  <g fill="url(#body)">
    <rect x="66" y="262" width="42" height="164" rx="21"/>
    <rect x="112" y="262" width="42" height="164" rx="21"/>
    <rect x="34" y="150" width="38" height="150" rx="19" transform="rotate(7 53 225)"/>
    <rect x="148" y="150" width="38" height="150" rx="19" transform="rotate(-7 167 225)"/>
    <rect x="52" y="106" width="116" height="196" rx="56"/>
  </g>
  <circle cx="110" cy="72" r="38" fill="url(#head)"/>
</svg>`;
  }

  // Cache figure images by shadow value (rounded) so we don't rebuild constantly.
  const figCache = new Map();
  function figure(shadow) {
    const key = Math.round(shadow * 100);
    if (figCache.has(key)) return figCache.get(key);
    const p = new Promise((res, rej) => {
      const im = new Image();
      im.onload = () => res(im);
      im.onerror = () => rej(new Error('figure'));
      im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(figureSVG(shadow));
    });
    figCache.set(key, p);
    return p;
  }

  const loadImage = (src) => new Promise((res, rej) => {
    const im = new Image();
    im.onload = () => res(im);
    im.onerror = () => rej(new Error('img ' + src));
    im.src = src;
  });

  // ---- region scoring ----------------------------------------------------
  // Fine detail = mean brightness difference between neighboring samples. A
  // smooth area with one big edge scores LOW; pervasive texture scores HIGH.
  function regionStats(data, CW, x, y, w, h) {
    const step = Math.max(2, Math.floor(w / 12));
    const gw = Math.max(2, Math.floor(w / step));
    const gh = Math.max(2, Math.floor(h / step));
    const grid = new Float32Array(gw * gh);
    let lS = 0;
    for (let gy = 0; gy < gh; gy++) {
      for (let gx = 0; gx < gw; gx++) {
        const xx = clamp(x + gx * step, 0, CW - 1), yy = y + gy * step;
        const i = ((yy | 0) * CW + (xx | 0)) * 4;
        const l = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        grid[gy * gw + gx] = l; lS += l;
      }
    }
    let dsum = 0, dn = 0;
    for (let gy = 0; gy < gh; gy++) {
      for (let gx = 0; gx < gw; gx++) {
        const l = grid[gy * gw + gx];
        if (gx + 1 < gw) { dsum += Math.abs(l - grid[gy * gw + gx + 1]); dn++; }
        if (gy + 1 < gh) { dsum += Math.abs(l - grid[(gy + 1) * gw + gx]); dn++; }
      }
    }
    return { mean: lS / (gw * gh), detail: dn ? dsum / dn : 0 };
  }

  // Does a spot pass the filters? Returns {ok, reason, stats}.
  function checkSpot(baseData, CW, fx, fy, figW, figH, cfg) {
    const st = regionStats(baseData, CW, fx, fy, figW, figH);
    if (st.mean < cfg.minLum) return { ok: false, reason: 'too dark (multiply won’t show)', stats: st };
    if (st.mean > cfg.maxLum) return { ok: false, reason: 'blown-out / flat white', stats: st };
    if (st.detail < cfg.detailLo) return { ok: false, reason: 'too smooth — will be obvious', stats: st };
    if (st.detail > cfg.detailHi) return { ok: false, reason: 'too busy — will be impossible', stats: st };
    return { ok: true, reason: 'good', stats: st };
  }

  // Auto-pick a hiding spot from many seeded candidates.
  //
  // A candidate that fails the filters is now REJECTED rather than merely
  // charged for. It used to be only a cost: dark and busy regions were priced
  // up, and then whichever candidate was cheapest won even if every one of
  // them was unusable - which is how rounds shipped on regions multiply could
  // do nothing with. Acceptable candidates are preferred; the cheapest
  // unacceptable one is still kept as a fallback so a round always ships, and
  // `ok` says which happened.
  function autoPlace(baseData, CW, CH, figW, figH, cfg, rng) {
    const rnd = rng || Math.random;
    const inset = cfg.inset;
    const x0 = CW * inset, x1 = CW * (1 - inset) - figW;
    const y0 = CH * inset, y1 = CH * (1 - inset) - figH;
    const detailReject = cfg.detailReject ?? cfg.detailHi;
    let best = null, bestAny = null;
    for (let k = 0; k < cfg.candidates; k++) {
      const fx = Math.round(lerp(x0, x1, rnd()));
      const fy = Math.round(lerp(y0, y1, rnd()));
      const st = regionStats(baseData, CW, fx, fy, figW, figH);
      const detailCost = Math.abs(st.detail - cfg.targetDetail);
      const darkPenalty = st.mean < cfg.minLum ? (cfg.minLum - st.mean) * 0.6 : 0;
      const brightPenalty = st.mean > cfg.maxLum ? (st.mean - cfg.maxLum) * 0.6 : 0;
      const cost = detailCost + darkPenalty + brightPenalty;
      const ok = st.mean >= cfg.minLum && st.mean <= cfg.maxLum &&
                 st.detail >= cfg.detailLo && st.detail <= detailReject;
      const cand = { fx, fy, cost, st, ok };
      if (ok && (!best || cost < best.cost)) best = cand;
      if (!bestAny || cost < bestAny.cost) bestAny = cand;
    }
    return best || bestAny;
  }

  // Strength of the imprint given local detail (adaptive) — used for auto only.
  function adaptiveOpacity(detail, cfg) {
    const t = clamp((detail - cfg.detailLo) / (cfg.detailHi - cfg.detailLo), 0, 1);
    return lerp(cfg.opacityMin, cfg.opacityMax, t);
  }

  // Mean luminance of the figure's own opaque pixels. Under multiply the
  // figure can only darken, so this is the ceiling on what it can ever do: at
  // 255 it is pure white and literally cannot show up, however strong the
  // imprint. Recorded with each round so a flagged one can be told apart -
  // "nobody could find it" because it was well hidden, or because there was
  // nothing there to find.
  function figureLum(figImg) {
    try {
      const w = figImg.width || figImg.naturalWidth, h = figImg.height || figImg.naturalHeight;
      if (!w || !h) return null;
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      const x = c.getContext('2d', { willReadFrequently: true });
      x.drawImage(figImg, 0, 0);
      const d = x.getImageData(0, 0, w, h).data;
      let n = 0, sum = 0;
      for (let i = 0; i < d.length; i += 4) {
        if (d[i + 3] <= 32) continue;
        sum += 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]; n++;
      }
      return n ? sum / n : null;
    } catch (_) { return null; }
  }

  // ---- difficulty calibration ---------------------------------------------
  // Measures how visible the composed figure ACTUALLY is: mean |ΔLuminance|
  // between base photo and composed scene, over the figure's mask pixels.
  // This is a direct proxy for difficulty, independent of image content.
  function measureVisibility(baseData, scene, mask, CW, fx, fy, figW, figH) {
    const sctx = scene.getContext('2d', { willReadFrequently: true });
    const x = clamp(Math.floor(fx - figW * 0.2), 0, CW - 1);
    const y = clamp(Math.floor(fy - figH * 0.2), 0, scene.height - 1);
    const w = Math.min(Math.ceil(figW * 1.4), CW - x);
    const h = Math.min(Math.ceil(figH * 1.4), scene.height - y);
    const sd = sctx.getImageData(x, y, w, h).data;
    let sum = 0, n = 0;
    for (let yy = 0; yy < h; yy += 2) {
      for (let xx = 0; xx < w; xx += 2) {
        const gi = ((y + yy) * CW + (x + xx)) * 4;
        if (mask[gi + 3] <= 32) continue;   // only pixels under the figure
        const si = (yy * w + xx) * 4;
        const lb = 0.299 * baseData[gi] + 0.587 * baseData[gi + 1] + 0.114 * baseData[gi + 2];
        const ls = 0.299 * sd[si] + 0.587 * sd[si + 1] + 0.114 * sd[si + 2];
        sum += Math.abs(lb - ls); n++;
      }
    }
    return n ? sum / n : 0;
  }

  // Compose, measure, and adjust opacity until visibility lands in
  // [visLo, visHi] (mean ΔL). Returns { scene, mask, opacity, vis }.
  // Falls back to the closest achievable if the band can't be hit.
  function calibratedCompose(p, baseData, visLo, visHi) {
    let lo = 0.25, hi = 1.0;
    let op = clamp(p.opacity ?? 0.7, lo, hi);
    let out = null;
    for (let i = 0; i < 6; i++) {
      const r = compose({ ...p, opacity: op });
      const vis = measureVisibility(baseData, r.scene, r.mask, p.CW, p.fx, p.fy, p.figW, p.figH);
      out = { scene: r.scene, mask: r.mask, opacity: op, vis };
      if (vis >= visLo && vis <= visHi) break;   // in the sweet spot
      if (vis > visHi) { hi = op; op = (lo + op) / 2; }   // too visible → weaker
      else             { lo = op; op = (op + hi) / 2; }   // too hidden → stronger
      if (hi - lo < 0.02) break;
    }
    return out;
  }

  // ---- compose -----------------------------------------------------------
  // p: { img, CW, CH, fx, fy, figW, figH, rot, blend, opacity, feather, figImg }
  // Returns { scene:canvas, mask:Uint8ClampedArray } — scene is base+figure.
  function compose(p) {
    const { img, CW, CH, fx, fy, figW, figH, rot, blend, opacity, feather, figImg } = p;
    const cx = fx + figW / 2, cy = fy + figH / 2;

    const scene = document.createElement('canvas');
    scene.width = CW; scene.height = CH;
    const sctx = scene.getContext('2d');
    sctx.drawImage(img, 0, 0, CW, CH);

    sctx.save();
    sctx.globalAlpha = opacity;
    sctx.globalCompositeOperation = blend;
    sctx.filter = `blur(${feather}px)`;
    sctx.translate(cx, cy);
    sctx.rotate(rot);
    sctx.drawImage(figImg, -figW / 2, -figH / 2, figW, figH);
    sctx.restore();

    const mc = document.createElement('canvas');
    mc.width = CW; mc.height = CH;
    const mctx = mc.getContext('2d', { willReadFrequently: true });
    mctx.translate(cx, cy); mctx.rotate(rot);
    mctx.drawImage(figImg, -figW / 2, -figH / 2, figW, figH);
    const mask = mctx.getImageData(0, 0, CW, CH).data;

    return { scene, mask };
  }

  // A clearly-visible marker figure for the reveal (silhouette in a solid color).
  function revealFigure(figImg, figW, figH, rgb) {
    const fc = document.createElement('canvas');
    fc.width = figW; fc.height = figH;
    const fctx = fc.getContext('2d');
    fctx.drawImage(figImg, 0, 0, figW, figH);
    fctx.globalCompositeOperation = 'source-atop';
    fctx.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.82)`;
    fctx.fillRect(0, 0, figW, figH);
    return fc;
  }

  function sizeFor(img, cfg) {
    const scaleDown = Math.min(1, cfg.maxCanvasH / img.naturalHeight);
    return { CW: Math.round(img.naturalWidth * scaleDown), CH: Math.round(img.naturalHeight * scaleDown) };
  }

  return {
    FIG_ASPECT, DEFAULTS,
    figure, figureSVG, loadImage, sizeFor,
    regionStats, checkSpot, autoPlace, adaptiveOpacity,
    compose, revealFigure, measureVisibility, calibratedCompose, figureLum,
    clamp, lerp,
  };
})();
