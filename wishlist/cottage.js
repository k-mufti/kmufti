// Cottage theme: a live pixel-art landscape behind the page.
//
// Rendered into an ImageData buffer at 1/PX resolution, then scaled up crisp
// by CSS. Every pixel gets a continuous colour and is then posterised with an
// ordered (Bayer) dither, which is what gives smooth gradients that still
// read as pixel art.
//
// Depth cues: jagged snow-capped mountains with a lit face and a shadow face,
// forested foothills, rolling hills, mist pooling at the foot of every far
// layer, colours fading into the sky with distance, things shrinking with
// distance, and parallax. Ambient motion so it is never quite still: clouds
// drift, their shadows slide over the hills, wind gusts roll across the grass
// (a moving sheen, and the blades and flowers lean with it), smoke curls from
// the cottage, and the "camera" slowly sways. Only runs while <html> has
// class "theme-cottage".
(() => {
  "use strict";
  const PX = 4;            // CSS pixels per art pixel
  const FPS = 15;
  const STEP = 9;          // posterise step per channel (smaller = smoother)
  const M = 64;            // ridge samples kept beyond each screen edge
  const canvas = document.getElementById("meadow");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  // Reduce Motion: keep the gentle ambient life (clouds, wind, grass) but drop
  // the camera sway and mouse parallax, which move the whole scene.
  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;

  let W = 0, H = 0, img = null, buf = null, own = null, scene = null, timer = null, t = 0;
  let mouse = 0, mouseEased = 0;

  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16 * STEP);
  const HAZE = [206, 228, 238];
  // Sky in hard pixel-art bands, deep blue overhead to a warm blush at the horizon.
  const SKY = [[84, 146, 224], [98, 160, 232], [116, 176, 238], [136, 192, 242], [158, 207, 245], [182, 220, 246], [205, 230, 245], [226, 234, 242], [242, 230, 230]];
  const BAYER01 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);

  function rng(seed) { return () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296); }
  function hash(x, y) { let h = (x * 374761393 + y * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const mixc = (a, b, f) => [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
  const pack = (c) => (255 << 24) | (clamp(Math.round(c[2]), 0, 255) << 16) | (clamp(Math.round(c[1]), 0, 255) << 8) | clamp(Math.round(c[0]), 0, 255);

  // Write a continuous colour, dithered, at buffer index i.
  function put(i, x, y, r, g, b) {
    const th = BAYER[((y & 3) << 2) | (x & 3)];
    r = Math.floor((r + th) / STEP) * STEP; g = Math.floor((g + th) / STEP) * STEP; b = Math.floor((b + th) / STEP) * STEP;
    buf[i] = (255 << 24) | (clamp(b, 0, 255) << 16) | (clamp(g, 0, 255) << 8) | clamp(r, 0, 255);
  }
  // Sprite pixel: drawn only where nothing nearer than `layer` owns the pixel.
  function pset(x, y, c, layer) {
    x = Math.round(x); y = Math.round(y);
    if (x < 0 || y < 0 || x >= W || y >= H) return;
    const i = y * W + x;
    if (own[i] > layer + 1) return;
    buf[i] = c;
  }
  function psetq(x, y, rgb, layer) {   // dithered sprite pixel (clouds)
    x = Math.round(x); y = Math.round(y);
    if (x < 0 || y < 0 || x >= W || y >= H) return;
    const i = y * W + x;
    if (own[i] > layer + 1) return;
    put(i, x, y, rgb[0], rgb[1], rgb[2]);
  }

  // ---------- layers, far → near ----------
  const LAYERS = [
    { kind: "mtn", base: 0.53, amp: 0.2, haze: 0.42, par: 0.5, fog: 0.75,
      lit: [206, 208, 220], shade: [104, 114, 150], snow: [255, 255, 255], snowShade: [184, 200, 230],
      oct: [[0.0105, 1], [0.026, 0.5], [0.063, 0.2]], power: 2.2, jag: 1.4, snowLine: 0.62 },
    { kind: "mtn", base: 0.585, amp: 0.085, haze: 0.3, par: 1.3, fog: 0.7, soft: true, pines: true,
      lit: [104, 150, 110], shade: [56, 96, 92],
      oct: [[0.016, 1], [0.041, 0.45], [0.09, 0.15]], power: 1.4, jag: 0.6 },
    { kind: "hill", base: 0.625, amp: 0.03, haze: 0.22, par: 2.4, fog: 0.55, col: [112, 168, 94], f: [0.021, 0.057], trees: 0.05, cottage: true },
    { kind: "hill", base: 0.69, amp: 0.04, haze: 0.13, par: 3.8, fog: 0.4, col: [114, 178, 84], f: [0.014, 0.049], trees: 0.018, wind: true },
    { kind: "hill", base: 0.775, amp: 0.035, haze: 0.05, par: 5.8, fog: 0.18, col: [102, 172, 70], f: [0.019, 0.066], wind: true },
    { kind: "hill", base: 0.875, amp: 0.03, haze: 0, par: 8.5, fog: 0, col: [86, 158, 56], f: [0.011, 0.044], wind: true },
  ];
  const NL = LAYERS.length;

  function ridgeAt(L, xw) {
    if (L.kind === "mtn") {
      let h = 0, n = 0;
      for (const [f, a] of L.oct) {
        h += a * Math.pow(1 - Math.abs(Math.sin(xw * f + L.ph[n])), L.power);
        n++;
      }
      h /= L.osum;
      return L.basePx - h * L.ampPx - (hash(Math.floor(xw), 7) - 0.5) * L.jag;
    }
    return L.basePx + L.ampPx * (Math.sin(xw * L.f[0] + L.ph[0]) + 0.35 * Math.sin(xw * L.f[1] + L.ph[1]));
  }

  // Wind: a slow swell plus gust fronts rolling left→right across the field.
  function gust(xw, y) {
    const s = Math.sin(xw * 0.03 + y * 0.06 - t * 0.12);
    return s > 0 ? s * s * s * s : 0;
  }
  function lean(xw, y) { return Math.sin(t * 0.16 + xw * 0.05) * 1.1 + gust(xw, y) * 2.6; }

  function build() {
    W = Math.ceil(innerWidth / PX);
    H = Math.ceil(innerHeight / PX);
    canvas.width = W; canvas.height = H;
    img = ctx.createImageData(W, H);
    buf = new Uint32Array(img.data.buffer);
    own = new Uint8Array(W * H);
    const r = rng(20261025);

    const layers = LAYERS.map((d, i) => {
      const L = { ...d, idx: i, basePx: H * d.base, ampPx: H * d.amp, ph: [r() * 6.28, r() * 6.28, r() * 6.28], off: 0, R: new Float32Array(W + 2 * M), S: new Float32Array(W + 2 * M) };
      if (d.oct) L.osum = d.oct.reduce((s, o) => s + o[1], 0);
      const dk = d.col ? d.col : d.shade;
      L.dark = pack(mixc(mixc(dk, [30, 60, 35], 0.35), HAZE, d.haze));
      L.darker = pack(mixc(mixc(dk, [20, 45, 30], 0.55), HAZE, d.haze));
      L.lite = pack(mixc(mixc(d.col || d.lit, [255, 255, 230], 0.25), HAZE, d.haze));
      return L;
    });
    scene = { layers, clouds: [], shadows: [], pines: [], trees: [], blades: [], flowers: [], birds: [], flies: [] };

    // Clouds: thin wisps low on the horizon (far), big cumulus high up (near).
    for (let i = 0, n = Math.max(4, Math.round(W / 55)); i < n; i++) {
      scene.clouds.push({ far: true, x: r() * W, y: H * (0.33 + r() * 0.1), w: 10 + r() * 16, speed: 0.03 + r() * 0.03 });
    }
    // A bank of towering clouds along the horizon, behind the mountains.
    for (let x = -40; x < W + 60; x += 40 + r() * 50) {
      const w = 26 + r() * 30;
      scene.clouds.push({
        bank: true, x, y: H * (0.47 + r() * 0.03), w, speed: 0.012,
        puffs: [
          { dx: (r() - 0.5) * w * 0.2, dy: -w * (0.3 + r() * 0.12), rad: w * (0.22 + r() * 0.06) },
          ...Array.from({ length: 3 }, (_, k) => ({ dx: (k - 1) * w * 0.3 + (r() - 0.5) * 4, dy: -w * (0.12 + r() * 0.08), rad: w * (0.2 + r() * 0.07) })),
          ...Array.from({ length: 4 }, (_, k) => ({ dx: (k / 3 - 0.5) * w * 0.95, dy: 0, rad: w * (0.14 + r() * 0.06) })),
        ],
      });
    }
    for (let i = 0, n = Math.max(4, Math.round(W / 75)); i < n; i++) {
      const w = r() < 0.3 ? 50 + r() * 26 : 16 + r() * 30;
      scene.clouds.push({
        far: false, x: r() * W, y: 8 + r() * H * 0.24, w, speed: 0.05 + w * 0.0015 + r() * 0.03,
        puffs: [
          // back row: big domes on top
          ...Array.from({ length: 2 + Math.floor(r() * 2) }, (_, k, arr) => ({ dx: ((k + 0.5) / 3 - 0.5) * w * 0.7 + (r() - 0.5) * 3, dy: -w * (0.12 + r() * 0.1), rad: w * (0.2 + r() * 0.1) })),
          // front row: smaller puffs along the base
          ...Array.from({ length: 4 }, (_, k) => ({ dx: (k / 3 - 0.5) * w * 0.95, dy: w * 0.02, rad: w * (0.13 + r() * 0.07) })),
        ],
      });
    }
    // far wisps, then the horizon bank, then overhead clouds (small to big)
    scene.clouds.sort((a, b) => (b.far ? 2 : b.bank ? 1 : 0) - (a.far ? 2 : a.bank ? 1 : 0) || a.w - b.w);
    // High wispy streaks.
    scene.wisps = Array.from({ length: Math.max(3, Math.round(W / 120)) }, () => ({ x: r() * W, y: 4 + r() * H * 0.22, len: 30 + r() * 50, speed: 0.05 + r() * 0.04, ph: r() * 6 }));
    // Cloud shadows sliding across the hills.
    for (let i = 0; i < 3; i++) scene.shadows.push({ x: r() * W, y: H * (0.66 + r() * 0.26), rx: 30 + r() * 40, ry: 5 + r() * 6, speed: 0.14 + r() * 0.1 });

    // Pines on the foothills, dense — reads as forest from far away.
    for (let xw = -60; xw < W + 60; xw += 2) {
      if (r() < 0.55) scene.pines.push({ xw: xw + Math.floor(r() * 2), h: 3 + Math.floor(r() * 4), depth: Math.floor(r() * 4) });
    }
    // Round trees on the near-middle hills, in small clusters.
    layers.forEach((L, i) => {
      if (!L.trees) return;
      for (let xw = -40; xw < W + 40; xw++) {
        if (r() < L.trees * 0.3) {
          const n = 1 + Math.floor(r() * 4), size = i === 2 ? 1 : 2;
          for (let k = 0; k < n; k++) scene.trees.push({ layer: i, xw: xw + k * (size * 2 + 1), rad: size + (r() < 0.3 ? 1 : 0), depth: 1 + Math.floor(r() * 2) });
          xw += n * 5;
        }
      }
    });
    const cx = Math.round(W * 0.68);
    scene.cottage = { layer: 2, xw: cx };
    scene.trees = scene.trees.filter((tr) => !(tr.layer === 2 && Math.abs(tr.xw - cx) < 10));

    // Grass and flowers, sized by distance.
    for (let xw = -30; xw < W + 30; xw++) {
      for (let i = 3; i < NL; i++) {
        if (r() < 0.6) scene.blades.push({ layer: i, xw, depth: Math.floor(r() * 2), h: i === 5 ? 3 + Math.floor(r() * 7) : i === 4 ? 2 + Math.floor(r() * 3) : 1 + Math.floor(r() * 2) });
      }
      if (r() < 0.22) scene.blades.push({ layer: 5, xw, depth: 4 + Math.floor(r() * H * 0.12), h: 3 + Math.floor(r() * 4) });
    }
    const density = [0, 0, 0.05, 0.12, 0.2, 0.3];
    layers.forEach((L, i) => {
      for (let k = 0, n = Math.round((W + 60) * density[i]); k < n; k++) {
        const room = i === NL - 1 ? H - L.basePx : layers[i + 1].basePx - L.basePx;
        scene.flowers.push({
          layer: i, xw: Math.floor(r() * (W + 60)) - 30, depth: 2 + Math.floor(r() * Math.max(2, room * 0.9)),
          kind: r() < 0.7 ? "daisy" : r() < 0.6 ? "buttercup" : "clover",
          size: i === 5 ? (r() < 0.5 ? 3 : 2) : i === 4 ? (r() < 0.4 ? 2 : 1) : 0,
        });
      }
    });
    scene.flowers.sort((a, b) => a.layer - b.layer || a.depth - b.depth);

    for (let i = 0; i < 3; i++) scene.birds.push({ x: r() * W, y: H * (0.16 + r() * 0.12), sp: 0.06 + r() * 0.04, ph: r() * 6 });
    for (let i = 0; i < 2; i++) scene.flies.push({ cx: r() * W, cy: H * (0.76 + r() * 0.1), rx: 25 + r() * 40, ry: 5 + r() * 8, sp: 0.015 + r() * 0.015, ph: r() * 6.28, col: pack(i ? [246, 195, 216] : [255, 243, 166]) });

    // Static sprite colours.
    scene.C = {
      stem: pack([63, 138, 50]), white: pack([255, 255, 255]), petalShade: pack([226, 234, 238]),
      yolk: pack([245, 192, 44]), yolkDark: pack([217, 154, 28]), butter: pack([255, 217, 74]), butterHi: pack([255, 240, 160]),
      clover: pack([234, 166, 200]), bladeA: pack([63, 138, 44]), bladeB: pack([88, 168, 58]), bladeTip: pack([124, 194, 86]),
      bird: pack([96, 118, 136]), trunk: pack([107, 90, 60]), body: pack([90, 70, 48]),
      wall: pack(mixc([250, 245, 232], HAZE, 0.22)), roof: pack(mixc([176, 92, 74], HAZE, 0.22)), roofDark: pack(mixc([140, 70, 58], HAZE, 0.22)),
      door: pack(mixc([110, 80, 60], HAZE, 0.22)), window: pack([245, 211, 107]), smoke1: pack([240, 244, 244]), smoke2: pack([226, 236, 240]),
      far: [255, 255, 255].map((v, k) => v + (HAZE[k] - v) * 0.3),
    };
    scene.specks = {
      daisy: layers.map((L) => pack(mixc([255, 255, 255], HAZE, L.haze * 0.5))),
      buttercup: layers.map((L) => pack(mixc([255, 217, 74], HAZE, L.haze * 0.5))),
      clover: layers.map((L) => pack(mixc([234, 166, 200], HAZE, L.haze * 0.5))),
    };
  }

  function frame() {
    const now = t / FPS;
    mouseEased += (mouse - mouseEased) * 0.08;
    const look = calm ? 0 : mouseEased + Math.sin(now * (2 * Math.PI / 30)) * 0.9;   // slow camera sway

    const L0 = scene.layers;
    for (const L of L0) {
      L.off = look * L.par;
      // R[x + M] is the ridge height over screen column x
      for (let k = 0; k < W + 2 * M; k++) L.R[k] = ridgeAt(L, k - M + L.off);
      // S: smoothed slope (<0 = rising to the right, i.e. facing the sun)
      for (let k = 0; k < W + 2 * M; k++) L.S[k] = (L.R[Math.min(k + 3, W + 2 * M - 1)] - L.R[Math.max(k - 3, 0)]) / 6;
    }

    const sunX = W * 0.16, sunY = H * 0.13;
    const shadows = scene.shadows.map((s) => {
      const span = W + s.rx * 2;
      return { x: (((s.x + t * s.speed) % span) + span) % span - s.rx, y: s.y, rx: s.rx, ry: s.ry };
    });

    for (let x = 0; x < W; x++) {
      // Who owns each row of this column? Walk from nearest layer to farthest.
      let limit = H;
      for (let li = NL - 1; li >= 0; li--) {
        const L = L0[li];
        const top = Math.max(0, Math.ceil(L.R[x + M]));
        if (top >= limit) continue;
        const slope = L.S[x + M];
        const xw = Math.round(x + L.off);
        for (let y = top; y < limit; y++) {
          const d = y - L.R[x + M];
          // mountains measure mist from a smooth line, not the jagged ridge,
          // or every column fogs differently and the mist streaks
          const dm = L.kind === "mtn" ? y - (L.basePx - L.ampPx * 0.35) : d;
          let c;
          if (L.kind === "mtn") {
            // A face's light follows the ridge slope above it, sampled up a
            // slant, so light/shadow splits run diagonally down each face.
            const jitter = (hash(y, xw * 3 + li) - 0.5) * 2.2;
            const xs = clamp(Math.round(x - d * 0.6 + jitter), -M, W + M - 1);
            const lit = L.S[xs + M] < 0;
            const elev = (L.basePx - y) / L.ampPx;
            const snowLine = L.snowLine ? L.snowLine + 0.1 * Math.sin(xw * 0.13) + 0.06 * Math.sin(xw * 0.41 + 1) : 9;
            if (elev > snowLine) c = lit ? L.snow : L.snowShade;
            else {
              c = lit ? L.lit : L.shade;
              if (L.pines) c = mixc(c, [30, 60, 45], (hash(xw, y) > 0.7 ? 0.18 : 0));
              c = mixc(c, lit ? L.shade : [70, 80, 115], clamp(dm / (H * 0.25), 0, 0.3));
            }
            if (d < 1 && lit) c = mixc(c, [255, 255, 255], 0.25);
          } else {
            const light = clamp(0.5 - slope * 2.2, 0, 1);
            const k = 0.84 + light * 0.3 - clamp(d / (H * 0.09), 0, 1) * 0.14 + (d < 1.5 ? 0.12 : 0) + (hash(xw, y) - 0.5) * 0.05;
            c = [L.col[0] * k, L.col[1] * k, L.col[2] * k];
            if (L.wind) { const g = gust(xw, y) * 40; c = [c[0] + g * 0.8, c[1] + g, c[2] + g * 0.5]; }
            if (li >= 2) {
              for (const s of shadows) {
                const dx = (x - s.x) / s.rx, dy = (y - s.y) / s.ry, e = dx * dx + dy * dy;
                if (e < 1) { const f = 1 - 0.16 * Math.min(1, (1 - e) * 2.5); c = [c[0] * f, c[1] * f * 1.01, c[2] * f * 1.06]; }
              }
            }
          }
          // mist pooling low in each far layer, then distance haze
          const mist = L.fog * clamp(dm / (H * 0.1), 0, 1);
          const h = L.haze + (1 - L.haze) * mist * 0.85;
          put(y * W + x, x, y, c[0] + (HAZE[0] - c[0]) * h, c[1] + (HAZE[1] - c[1]) * h, c[2] + (HAZE[2] - c[2]) * h);
          own[y * W + x] = li + 1;
        }
        limit = top;
      }
      // Sky above everything.
      for (let y = 0; y < limit; y++) {
        const c = skyAt(x, y);
        // sun: core, a crisp ring, and a stepped halo
        const dx = x - sunX, dy = (y - sunY) * 1.1, sd = Math.hypot(dx, dy);
        let glow = 0, col = [255, 248, 222];
        if (sd < 5.5) { glow = 1; col = [255, 252, 236]; }
        else if (sd < 7) glow = 0.08;
        else if (sd < 8.2) glow = 0.75;
        else glow = Math.floor(Math.max(0, 1 - (sd - 8) / 30) * 3) / 3 * 0.22;
        put(y * W + x, x, y, c[0] + (col[0] - c[0]) * glow, c[1] + (col[1] - c[1]) * glow, c[2] + (col[2] - c[2]) * glow);
        own[y * W + x] = 0;
      }
    }

    drawWisps();
    drawClouds();
    drawBirds();
    drawSprites();
    drawFlies();
    ctx.putImageData(img, 0, 0);
    t++;
  }

  // Banded sky colour at (x, y). The bands are arcs of a dome centred below
  // the horizon, gently rippled, with a short dithered seam between them.
  function skyAt(x, y) {
    const dome = Math.hypot((x - W * 0.5) / (W * 0.95), (y - H * 0.62) / (H * 0.62));
    const f = clamp(1 - dome + Math.sin(x * 0.045 + y * 0.02) * 0.012, 0, 1) ** 0.9 * (SKY.length - 1);
    let i = Math.floor(f);
    const frac = f - i;
    if (i < SKY.length - 1 && frac > 0.78 && BAYER01[((y & 3) << 2) | (x & 3)] < (frac - 0.78) / 0.22) i++;
    return SKY[Math.min(i, SKY.length - 1)];
  }

  function drawWisps() {
    for (const w of scene.wisps) {
      const span = W + w.len * 2;
      const x0 = (((w.x + t * w.speed) % span) + span) % span - w.len;
      for (let k = 0; k < w.len; k++) {
        const a = Math.sin((k / w.len) * Math.PI);          // taper at both ends
        const y = Math.round(w.y + Math.sin(k * 0.08 + w.ph) * 1.2);
        if (a < 0.25) continue;
        const x = Math.round(x0 + k);
        if (x < 0 || x >= W || y < 0 || y >= H || own[y * W + x]) continue;
        psetq(x, y, mixc(skyAt(x, y), [255, 255, 255], a * 0.55), -1);
        if (a > 0.8 && k % 3) psetq(x + 2, y - 1, mixc(skyAt(x + 2, y - 1), [255, 255, 255], 0.3), -1);
      }
    }
  }

  function drawClouds() {
    for (const c of scene.clouds) {
      const span = W + c.w * 2;
      const x = (((c.x + t * c.speed) % span) + span) % span - c.w;
      if (c.far) {
        const hw = c.w / 2;
        for (let dx = -hw; dx <= hw; dx++) {
          psetq(x + dx, c.y, c.far ? scene.C.far : null, -1);
          if (Math.abs(dx) < hw - 3) psetq(x + dx, c.y - 1, mixc(scene.C.far, [255, 255, 255], 0.4), -1);
          if (Math.abs(dx) < hw - 1) psetq(x + dx, c.y + 1, mixc(scene.C.far, HAZE, 0.5), -1);
        }
        continue;
      }
      // Stylised cumulus: back puffs first, front puffs over them. Each pixel
      // takes the tone of the front-most puff covering it, lit from the upper
      // left in four hard steps, with a flat, shaded base.
      const base = c.y + c.w * 0.1;
      const x0 = Math.floor(x - c.w * 0.8), x1 = Math.ceil(x + c.w * 0.8);
      for (let py = Math.floor(c.y - c.w * 0.55); py <= base; py++) {
        for (let px = x0; px <= x1; px++) {
          let hit = null;
          for (const p of c.puffs) {
            const dx = px - (x + p.dx), dy = py - (c.y + p.dy);
            if (dx * dx + dy * dy <= p.rad * p.rad) hit = [dx / p.rad, dy / p.rad];
          }
          if (!hit) continue;
          const l = -0.55 * hit[0] - 0.85 * hit[1] - (py > base - 2 ? 0.9 : 0);
          let tone = l > 0.45 ? [255, 255, 255] : l > -0.1 ? [242, 246, 252] : l > -0.55 ? [218, 228, 244] : [196, 204, 232];
          if (py === base) tone = [184, 192, 224];
          if (c.bank) tone = mixc(tone, [236, 230, 238], 0.45);   // distant: softer, blushed
          psetq(px, py, tone, -1);
        }
      }
    }
  }

  function drawBirds() {
    for (const b of scene.birds) {
      const span = W + 20;
      const x = (((b.x + t * b.sp) % span) + span) % span - 10;
      const y = b.y + Math.sin(t * 0.04 + b.ph) * 2;
      const up = Math.floor(t / 4 + b.ph) % 2;
      pset(x, y, scene.C.bird, 0);
      pset(x - 1, y - up, scene.C.bird, 0); pset(x + 1, y - up, scene.C.bird, 0);
    }
  }

  function screenX(layer, xw) { return xw - scene.layers[layer].off; }
  function ground(layer, xw) { const x = screenX(layer, xw); return scene.layers[layer].R[clamp(Math.round(x) + M, 0, W + 2 * M - 1)]; }

  function drawSprites() {
    const C = scene.C, L = scene.layers;
    // pines on the foothills
    for (const p of scene.pines) {
      const x = Math.round(screenX(1, p.xw));
      if (x < -3 || x > W + 3) continue;
      const base = Math.round(ground(1, p.xw)) + p.depth;
      for (let k = 0; k < p.h; k++) {
        const w = Math.floor(k / 2);
        for (let dx = -w; dx <= w; dx++) pset(x + dx, base - p.h + k + 1, dx < 0 ? L[1].dark : L[1].darker, 1);
      }
    }
    for (let li = 2; li < NL; li++) {
      for (const tr of scene.trees) {
        if (tr.layer !== li) continue;
        const x = Math.round(screenX(li, tr.xw)), y = Math.round(ground(li, tr.xw)) + tr.depth;
        pset(x, y, C.trunk, li); pset(x, y - 1, C.trunk, li);
        const cy = y - 1 - tr.rad;
        for (let dy = -tr.rad; dy <= tr.rad; dy++) for (let dx = -tr.rad; dx <= tr.rad; dx++) {
          if (dx * dx + dy * dy > tr.rad * tr.rad + 0.5) continue;
          pset(x + dx, cy + dy, dx + dy < -tr.rad * 0.5 ? L[li].lite : dx + dy > tr.rad * 0.5 ? L[li].darker : L[li].dark, li);
        }
      }
      if (scene.cottage.layer === li) drawCottage();
      for (const b of scene.blades) {
        if (b.layer !== li) continue;
        const x = Math.round(screenX(li, b.xw));
        if (x < -2 || x > W + 2) continue;
        const y = Math.round(ground(li, b.xw)) + b.depth;
        const s = lean(b.xw, y) * (li === 5 ? 1.2 : 0.7);
        const col = li === 5 ? (b.xw & 1 ? C.bladeA : C.bladeB) : L[li].dark;
        for (let k = 0; k < b.h; k++) pset(x + Math.round(s * (k / b.h) ** 1.5), y - k, col, li);
        if (li === 5 && b.h > 5) pset(x + Math.round(s), y - b.h, C.bladeTip, li);
      }
      for (const f of scene.flowers) if (f.layer === li) drawFlower(f);
    }
  }

  function drawCottage() {
    const C = scene.C, li = scene.cottage.layer;
    const x = Math.round(screenX(li, scene.cottage.xw)), y = Math.round(ground(li, scene.cottage.xw)) + 1;
    for (let dy = 1; dy <= 4; dy++) for (let dx = -3; dx <= 3; dx++) pset(x + dx, y - dy, dx === 3 ? C.petalShade : C.wall, li);
    const rows = [[-4, 9], [-3, 7], [-2, 5], [-1, 3]];
    rows.forEach(([o, w], k) => { for (let dx = 0; dx < w; dx++) pset(x + o + dx, y - 5 - k, dx >= w / 2 ? C.roofDark : C.roof, li); });
    pset(x + 2, y - 8, C.roofDark, li); pset(x + 2, y - 9, C.roofDark, li);
    pset(x - 1, y - 1, C.door, li); pset(x - 1, y - 2, C.door, li);
    pset(x + 1, y - 3, C.window, li);
    for (let k = 0; k < 5; k++) {
      const age = (t * 0.1 + k * 2) % 10;
      if (age > 8) continue;
      pset(x + 2 + Math.round(age * 0.6 + Math.sin(age * 0.9 + k) * 0.7), y - 10 - Math.round(age * 1.3), age < 4 ? C.smoke1 : C.smoke2, li);
    }
  }

  function drawFlower(f) {
    const C = scene.C, li = f.layer;
    const x0 = Math.round(screenX(li, f.xw));
    if (x0 < -4 || x0 > W + 4) return;
    const base = Math.round(ground(li, f.xw)) + f.depth;
    if (f.size === 0) { pset(x0, base, scene.specks[f.kind][li], li); return; }
    const stem = f.size * 2;
    const s = Math.round(lean(f.xw, base) * (f.size === 3 ? 1.1 : 0.8));
    for (let k = 0; k < stem; k++) pset(x0 + Math.round(s * (k / stem)), base - k, C.stem, li);
    const x = x0 + s, y = base - stem;
    const P = (dx, dy, c) => pset(x + dx, y + dy, c, li);
    if (f.kind === "daisy") {
      if (f.size === 3) {
        for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) P(dx, dy, C.white);
        for (let k = -1; k <= 1; k++) { P(k, -3, C.white); P(k, 3, C.petalShade); P(-3, k, C.white); P(3, k, C.petalShade); }
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) P(dx, dy, C.yolk);
        P(1, 1, C.yolkDark); P(2, 2, C.petalShade);
      } else if (f.size === 2) {
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) P(dx, dy, C.white);
        for (let k = -1; k <= 1; k++) { P(k, -2, C.white); P(k, 2, C.petalShade); P(-2, k, C.white); P(2, k, C.petalShade); }
        P(0, 0, C.yolk);
      } else { P(-1, 0, C.white); P(1, 0, C.white); P(0, -1, C.white); P(0, 1, C.white); P(0, 0, C.yolk); }
    } else {
      const c = f.kind === "buttercup" ? C.butter : C.clover;
      for (let dx = -f.size + 1; dx <= f.size - 1; dx++) P(dx, 0, c);
      for (let dx = -f.size + 2; dx <= f.size - 2; dx++) P(dx, -1, c);
      if (f.kind === "buttercup") P(0, -1, C.butterHi);
    }
  }

  function drawFlies() {
    for (const b of scene.flies) {
      const a = t * b.sp + b.ph;
      const x = b.cx + Math.sin(a) * b.rx, y = b.cy + Math.sin(a * 2.3) * b.ry;
      const open = Math.floor(t / 3) % 2 === 0;
      pset(x, y, scene.C.body, 99); pset(x, y + 1, scene.C.body, 99);
      if (open) { pset(x - 2, y - 1, b.col, 99); pset(x - 1, y - 1, b.col, 99); pset(x - 2, y, b.col, 99); pset(x - 1, y, b.col, 99); pset(x + 1, y - 1, b.col, 99); pset(x + 2, y - 1, b.col, 99); pset(x + 1, y, b.col, 99); pset(x + 2, y, b.col, 99); }
      else { pset(x - 1, y - 1, b.col, 99); pset(x - 1, y, b.col, 99); pset(x + 1, y - 1, b.col, 99); pset(x + 1, y, b.col, 99); }
    }
  }

  function active() { return document.documentElement.classList.contains("theme-cottage"); }

  function sync() {
    clearInterval(timer);
    timer = null;
    if (!active()) return;
    if (!scene) build();
    frame();
    // the first-visit tip pauses the scene (html.wish-paused)
    if (document.documentElement.classList.contains("wish-paused")) return;
    timer = setInterval(() => { if (!document.hidden) frame(); }, 1000 / FPS);
  }

  addEventListener("pointermove", (e) => {
    if (e.pointerType === "mouse") mouse = (e.clientX / innerWidth - 0.5) * 2;
  }, { passive: true });
  let resizeTimer = null;
  addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { scene = null; sync(); }, 150);
  });
  new MutationObserver(sync).observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  sync();
})();
