/* =========================================================================
   The heat word behind the bust - "KMUFTI" as a thermal image.

   Each letter is blurred and recoloured through a thermal palette (how
   solid a point is picks its colour: a dark blue core out through white
   and orange to a pink fringe). Moving the cursor over it melts the heat
   in rings - deepest under the cursor, a layer less with each ring out -
   down to a last layer that never goes, then it warms back up.

   Tuned in the lab (_lab/heat.html, local only); these are the settings it
   was locked in with. The word doesn't animate by itself: the only moving
   part is the cursor's cooling map, so it costs nothing while untouched.
   ========================================================================= */
(function heatWord() {
  const svg = document.getElementById("heatWord");
  if (!svg) return;

  const S = {
    text: "KMUFTI", font: "Paytone One", weight: "400", size: 360, spacing: 22,
    blur: 2, breathe: 6, warp: 0, warpSize: 1, smooth: 1,
    fringe: 0.05, core: 1.02, melt: 0.42,
    cSize: 50, cStrength: 0.74, cSpread: 0.6, cRings: 9, cFloor: 0.03, cRecover: 0.55,
  };
  // edge -> core
  const PALETTE = [[0, [1, .45, .88]], [.16, [.98, .28, .74]], [.32, [1, .5, .2]], [.46, [1, .8, .45]], [.58, [1, .98, .93]], [.7, [.62, .84, 1]], [.84, [.16, .46, .98]], [.95, [.05, .16, .62]], [1, [.03, .06, .34]]];

  // Film grain over the letters: how strongly the noise shows.
  const FX = { grain: 0.9 };

  const NS = "http://www.w3.org/2000/svg";
  const mk = (n, a = {}) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); return e; };
  const setHref = (el, url) => {
    el.setAttribute("href", url);
    el.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", url);
  };

  /* ---------- palette -> filter tables ---------- */
  function tables() {
    const at = (t) => {
      for (let i = 0; i < PALETTE.length - 1; i++) {
        const [a, ca] = PALETTE[i], [b, cb] = PALETTE[i + 1];
        if (t >= a && t <= b) { const k = (t - a) / (b - a || 1); return ca.map((c, j) => c + (cb[j] - c) * k); }
      }
      return PALETTE[PALETTE.length - 1][1];
    };
    const N = 33, cols = [], alpha = [];
    for (let i = 0; i < N; i++) {
      const t = i / (N - 1);
      cols.push(at(Math.min(1, t / Math.max(0.01, S.core))));
      alpha.push(Math.min(1, t / S.fringe) ** 1.5);
    }
    const j = (k) => cols.map((c) => c[k].toFixed(3)).join(" ");
    return { r: j(0), g: j(1), b: j(2), a: alpha.map((v) => v.toFixed(3)).join(" ") };
  }

  /* ---------- the cursor's cooling map ----------
     A small canvas the size of the word (quarter resolution): white = full
     heat, darker = cooled. The cursor stamps rings into it; it warms back
     toward white over time. Every letter's filter reads it as an image. */
  const MW = 250, MH = 95, MS = 1000 / MW;
  const mask = document.createElement("canvas");
  mask.width = MW; mask.height = MH;
  const mctx = mask.getContext("2d");
  mctx.fillStyle = "#fff"; mctx.fillRect(0, 0, MW, MH);

  /* ---------- build the letters, one filter each ---------- */
  let letters = [];
  function build() {
    const defs = mk("defs"), g = mk("g");
    svg.textContent = "";
    svg.append(defs, g);
    letters = [];
    const fam = `"${S.font}", sans-serif`;
    const probe = mk("text", { "font-family": fam, "font-weight": S.weight, "font-size": S.size });
    g.appendChild(probe);
    const chars = [...S.text];
    const widths = chars.map((ch) => { probe.textContent = ch; return probe.getComputedTextLength(); });
    probe.remove();
    let total = widths.reduce((a, b) => a + b, 0) + S.spacing * (chars.length - 1);
    const fit = Math.min(1, 900 / total);
    const size = S.size * fit;
    total *= fit;
    let x = 500 - total / 2;
    const baseline = 190 + size * 0.36;
    const tb = tables(), url = mask.toDataURL();
    const drop = Math.max(0, 1 - S.cFloor);

    chars.forEach((ch, i) => {
      // The resting shape, exactly as the lab draws it with speed 0: every
      // letter frozen at the same point of its breath.
      const s = 0.5;
      const meltDip = S.melt * Math.max(0, Math.sin(1.2)) ** 6;
      const blurAmt = S.blur + S.breathe * s + meltDip * S.blur * 2.5;
      const f = S.warpSize / 1000, drift = Math.sin(i) * 0.25;
      const id = "heatL" + i;
      const fl = mk("filter", { id, x: "-60%", y: "-40%", width: "220%", height: "180%", "color-interpolation-filters": "sRGB" });
      fl.append(
        mk("feTurbulence", { type: "fractalNoise", numOctaves: S.smooth, seed: 3 + i * 7, result: "noise",
          baseFrequency: `${(f * (1 + drift)).toFixed(5)} ${(f * 1.35 * (1 - drift)).toFixed(5)}` }),
        mk("feGaussianBlur", { in: "SourceAlpha", stdDeviation: blurAmt.toFixed(2), result: "soft" }),
        mk("feDisplacementMap", { in: "soft", in2: "noise", scale: (S.warp * (0.75 + 0.5 * s) + meltDip * 60).toFixed(1),
          xChannelSelector: "R", yChannelSelector: "G", result: "warp" }),
      );
      // the cooling map, brightness -> alpha, then heat x (1 - drop + drop x map)
      const cool = mk("feImage", { x: 0, y: 0, width: 1000, height: 380, preserveAspectRatio: "none", result: "coolImg" });
      setHref(cool, url);
      fl.append(
        cool,
        mk("feColorMatrix", { in: "coolImg", type: "matrix", values: "0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  1 0 0 0 0", result: "cool" }),
        mk("feComposite", { in: "warp", in2: "cool", operator: "arithmetic", k1: drop.toFixed(3), k2: (1 - drop).toFixed(3), k3: 0, k4: 0, result: "cooled" }),
        mk("feColorMatrix", { in: "cooled", type: "matrix", values: "0 0 0 1 0  0 0 0 1 0  0 0 0 1 0  0 0 0 1 0" }),
      );
      const ct = mk("feComponentTransfer", { result: "col" });
      ct.append(mk("feFuncR", { type: "table", tableValues: tb.r }), mk("feFuncG", { type: "table", tableValues: tb.g }),
                mk("feFuncB", { type: "table", tableValues: tb.b }), mk("feFuncA", { type: "table", tableValues: tb.a }));
      fl.appendChild(ct);
      if (FX.grain) {
        // Film grain: fine grey noise soft-lit onto the colour, kept inside
        // the letters. A thermal camera's sensor is never perfectly smooth.
        fl.append(
          mk("feTurbulence", { type: "fractalNoise", baseFrequency: "0.9", numOctaves: 1, seed: 11 + i, result: "noise" }),
          mk("feColorMatrix", { in: "noise", type: "matrix", result: "grain",
            values: `${FX.grain} ${FX.grain} ${FX.grain} 0 ${0.5 - 1.5 * FX.grain}  ${FX.grain} ${FX.grain} ${FX.grain} 0 ${0.5 - 1.5 * FX.grain}  ${FX.grain} ${FX.grain} ${FX.grain} 0 ${0.5 - 1.5 * FX.grain}  0 0 0 0 1` }),
          mk("feBlend", { in: "grain", in2: "col", mode: "soft-light", result: "mix" }),
          mk("feComposite", { in: "mix", in2: "col", operator: "in" }),
        );
      }
      defs.appendChild(fl);

      const t = mk("text", { x: x.toFixed(1), y: baseline.toFixed(1), "font-family": fam, "font-weight": S.weight,
        "font-size": size.toFixed(1), filter: `url(#${id})` });
      t.textContent = ch;
      g.appendChild(t);
      letters.push(cool);
      x += widths[i] * fit + S.spacing * fit;
    });
    svg.classList.add("ready");
  }

  /* ---------- the cursor melts it, in rings ---------- */
  // depth at distance t (0 = cursor, 1 = edge) = strength x (1 - t)^p,
  // snapped to "rings" bands. Stamped with "darken" so a spot keeps its
  // deepest cooling rather than the sum - the rings survive going back over.
  const pw = 2 ** (2 - 4 * S.cSpread);
  const steps = S.cRings | 0;
  const depthAt = (t) => {
    let d = (1 - t) ** pw;
    if (steps) d = Math.ceil(d * steps - 1e-6) / steps;
    return S.cStrength * d;
  };
  const stops = [];
  for (let k = 0; k <= 24; k++) stops.push(k / 24);
  for (let k = 1; k < steps; k++) {
    const tb = 1 - (k / steps) ** (1 / pw), soft = Math.min(0.025, 0.1 / steps);
    stops.push(Math.max(0, tb - soft), Math.min(1, tb + soft));
  }
  stops.sort((a, b) => a - b);
  const R = S.cSize / MS;
  function stamp(cx, cy) {
    const g = mctx.createRadialGradient(cx, cy, 0, cx, cy, R);
    for (const t of stops) {
      const v = Math.round(255 * (1 - depthAt(Math.min(t, 0.9999))));
      g.addColorStop(t, `rgb(${v},${v},${v})`);
    }
    g.addColorStop(1, "rgb(255,255,255)");
    mctx.globalCompositeOperation = "darken";
    mctx.fillStyle = g;
    mctx.fillRect(cx - R, cy - R, R * 2, R * 2);
    mctx.globalCompositeOperation = "source-over";
  }

  let lastPt = null, coolLeft = 0, warmBank = 0, mapDirty = false, sent = 0, running = false, last = 0;
  function paint(x, y) {
    const p = { x: x / MS, y: y / MS };
    if (lastPt) {
      const d = Math.hypot(p.x - lastPt.x, p.y - lastPt.y), n = Math.min(80, Math.ceil(d / Math.max(0.5, R * 0.12)));
      for (let k = 1; k <= n; k++) stamp(lastPt.x + (p.x - lastPt.x) * k / n, lastPt.y + (p.y - lastPt.y) * k / n);
    } else stamp(p.x, p.y);
    lastPt = p;
    mapDirty = true;
    coolLeft = 1 / S.cRecover + 0.5;
    if (!running) { running = true; last = performance.now(); requestAnimationFrame(tick); }
  }

  // Warm back up at "recovery" per second. Fractions of a brightness level
  // are banked until they make a whole one, so slow recovery creeps rather
  // than freezing and jumping. Stops itself once fully warm.
  function tick(now) {
    const dt = Math.min(0.1, (now - last) / 1000); last = now;
    coolLeft -= dt;
    let changed = false;
    if (coolLeft <= 0) {
      mctx.fillStyle = "#fff"; mctx.fillRect(0, 0, MW, MH);
      warmBank = 0; changed = true;
    } else {
      warmBank += dt * S.cRecover * 255;
      const levels = Math.floor(warmBank);
      if (levels >= 1) {
        warmBank -= levels;
        mctx.globalCompositeOperation = "lighter";
        mctx.fillStyle = `rgba(255,255,255,${Math.min(1, levels / 255)})`;
        mctx.fillRect(0, 0, MW, MH);
        mctx.globalCompositeOperation = "source-over";
        changed = true;
      }
    }
    if (changed) mapDirty = true;
    if (mapDirty && (now - sent >= 33 || coolLeft <= 0)) {
      sent = now; mapDirty = false;
      const url = mask.toDataURL();
      for (const c of letters) setHref(c, url);
    }
    if (coolLeft > 0) requestAnimationFrame(tick);
    else running = false;
  }

  // The bust's canvas sits on top of the word, so listen on the page and
  // work out where the pointer is in the word's own coordinates.
  window.addEventListener("pointermove", (e) => {
    if (!letters.length) return;
    const m = svg.getScreenCTM();
    if (!m) return;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const p = pt.matrixTransform(m.inverse());
    if (p.x < -60 || p.x > 1060 || p.y < -60 || p.y > 440) { lastPt = null; return; }
    paint(p.x, p.y);
  }, { passive: true });
  document.addEventListener("pointerleave", () => { lastPt = null; });

  // The letters are measured, so wait for the font before building.
  const go = () => build();
  if (document.fonts && document.fonts.load) {
    document.fonts.load(`${S.weight} 100px "${S.font}"`, S.text).then(go, go);
  } else go();
})();
