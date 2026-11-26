/* Thumbnails: one tiny hand-built SVG per game, drawn from how it plays.
   ART[id]() returns an <svg> string, viewBox 160x100. Unknown ids (your own
   links) get the generic ticket art. */
(function () {
  "use strict";
  const G = "#6aaa64", Y = "#c9b458", X = "#3a3a3c", W = "#f2efe4", K = "#0e0e0e";
  // Every plate is drawn twice: a watercolour wash (recoloured, nudged a
  // little off-register) and a fine-liner ink pass on top (outlines only,
  // through the #wob wobble filter defined in index.html). Dark fills become
  // ink cross-hatching. See .plate-art .wash / .ink in styles.css.
  const PAPER = [244, 239, 226];
  function recolor(hex, big) {
    let h = hex.slice(1);
    if (h.length === 3) h = h.replace(/./g, "$&$&");
    const alpha = h.length === 8 ? h.slice(6) : "";
    const rgb = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
    const mx = Math.max(...rgb), mn = Math.min(...rgb);
    const lum = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
    const sat = mx ? (mx - mn) / mx : 0;
    if (big && lum < 0.3) return "none";
    if (lum < 0.26 && sat < 0.35) return "url(#hatch)";
    const k = lum < 0.35 ? 0.5 : lum > 0.85 ? 0.15 : 0.22;
    return "#" + rgb.map((v, i) => Math.round(v * (1 - k) + PAPER[i] * k).toString(16).padStart(2, "0")).join("") + alpha;
  }
  const washOf = (inner) => inner
    .replace(/(<rect[^>]*width="1[56]\d"[^>]*fill=")(#[0-9a-fA-F]{3,8})/g, (m, a, h) => a + recolor(h, true))
    .replace(/#[0-9a-fA-F]{8}\b|#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b/g, (h) => recolor(h, false));
  const svg = (inner, bg = "#161616") =>
    '<svg class="plate-art" viewBox="0 0 160 100" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">' +
    '<rect width="160" height="100" fill="' + recolor(bg, true).replace("none", "#f4efe2") + '"/>' +
    '<g class="wash" transform="translate(1.6 1.2)">' + washOf(inner) + "</g>" +
    '<g class="ink" filter="url(#wob)">' + inner + "</g></svg>";
  const r = (x, y, w, h, f, rx = 0, extra = "") =>
    '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + rx + '" fill="' + f + '" ' + extra + "/>";
  const t = (x, y, s, size, f = W, extra = "") =>
    '<text x="' + x + '" y="' + y + '" font-family="Cormorant Garamond, Georgia, serif" font-weight="700" font-size="' + size +
    '" fill="' + f + '" text-anchor="middle" ' + extra + ">" + s + "</text>";
  const c = (x, y, rad, f, extra = "") => '<circle cx="' + x + '" cy="' + y + '" r="' + rad + '" fill="' + f + '" ' + extra + "/>";
  const col = { g: G, y: Y, x: X, e: "#222" };

  // A Wordle-style board. rows: strings of g/y/x/e, optional letters.
  function board(x0, y0, size, gap, rows, letters) {
    let s = "";
    rows.forEach((row, i) => [...row].forEach((ch, j) => {
      const x = x0 + j * (size + gap), y = y0 + i * (size + gap);
      s += ch === "e" ? r(x, y, size, size, "none", 1, 'stroke="#333" stroke-width="1"') : r(x, y, size, size, col[ch], 1);
      if (letters && letters[i] && letters[i][j] && ch !== "e") s += t(x + size / 2, y + size * 0.78, letters[i][j], size * 0.8);
    }));
    return s;
  }
  const mini = (x0, y0, size, rows) => board(x0, y0, size, 1.5, rows);

  const ART = {
    wordle: () => svg(board(41, 8, 14, 2.5, ["xxyxx", "yxgxx", "gxgyx", "ggggg", "eeeee"], ["CRANE", "STOMP", "SOUTH", "SHOUT"])),
    quordle: () => svg(
      mini(30, 10, 9, ["xyxxx", "gxgxy", "ggggg", "eeeee"]) + mini(86, 10, 9, ["xxxyx", "ggggg", "eeeee", "eeeee"]) +
      mini(30, 54, 9, ["yxxxg", "xgxxg", "xgygg", "ggggg"]) + mini(86, 54, 9, ["xxgxx", "yxgxy", "eeeee", "eeeee"])),
    octordle: () => {
      let s = "";
      const pats = [["xyx", "ggg"], ["yxg", "ggg"], ["xxx", "gyx"], ["ggg", "eee"], ["xgx", "ggg"], ["yyx", "xgg"], ["ggg", "eee"], ["xxy", "ggg"]];
      pats.forEach((p, i) => { s += mini(14 + (i % 4) * 36, 22 + Math.floor(i / 4) * 32, 9, p.map((q) => q + q.slice(0, 2))); });
      return svg(s);
    },
    connections: () => {
      const cs = ["#f9df6d", "#a0c35a", "#b0c4ef", "#ba81c5"];
      let s = "";
      for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
        const solved = i < 2;
        s += r(22 + j * 30, 10 + i * 21, 27, 18, solved ? cs[i] : "#efefe6", 3);
        if (!solved) s += r(30 + j * 30, 17 + i * 21, 11, 3, "#888", 1);
      }
      s += r(22, 10, 117, 18, cs[0], 3) + t(80, 23, "BIRDS", 11, K) + r(22, 31, 117, 18, cs[1], 3) + t(80, 44, "CHEESES", 11, K);
      return svg(s, "#fff");
    },
    strands: () => {
      let s = "";
      const L = "STRAPLEOWNDIGHTB";
      for (let i = 0; i < 4; i++) for (let j = 0; j < 6; j++) s += t(30 + j * 20, 22 + i * 21, L[(i * 6 + j) % 16], 13, "#333");
      s = '<path d="M30 17 L50 17 L70 38 L90 38 L110 59 L130 80" stroke="#aedfee" stroke-width="13" stroke-linecap="round" stroke-linejoin="round" fill="none"/>' +
        '<path d="M30 59 L30 80 L50 80 L70 59" stroke="#f5d547" stroke-width="13" stroke-linecap="round" stroke-linejoin="round" fill="none"/>' + s;
      return svg(s, "#fff");
    },
    "spelling-bee": () => {
      const hex = (cx, cy, f) => {
        const p = [];
        for (let k = 0; k < 6; k++) { const a = Math.PI / 3 * k; p.push((cx + 15 * Math.cos(a)).toFixed(1) + "," + (cy + 15 * Math.sin(a)).toFixed(1)); }
        return '<polygon points="' + p.join(" ") + '" fill="' + f + '"/>';
      };
      let s = hex(80, 50, "#f7da21") + t(80, 56, "A", 15, K);
      "LTERNP".split("").forEach((ch, k) => {
        const a = Math.PI / 3 * k + Math.PI / 6, x = 80 + 27 * Math.cos(a), y = 50 + 27 * Math.sin(a);
        s += hex(x, y, "#e6e6e6") + t(x, y + 5.5, ch, 13, K);
      });
      return svg(s, "#fff");
    },
    mini: () => {
      const blk = [0, 4, 20, 24];
      let s = "";
      for (let k = 0; k < 25; k++) s += r(55 + (k % 5) * 10, 25 + Math.floor(k / 5) * 10, 10, 10, blk.includes(k) ? K : "#fff", 0, 'stroke="#000" stroke-width=".8"');
      s += r(65, 25, 30, 10, "#a7d8ff", 0, 'stroke="#000" stroke-width=".8"') + r(75, 25, 10, 10, "#ffda00", 0, 'stroke="#000" stroke-width=".8"');
      return svg(s + t(80, 92, "0:41", 11, "#555"), "#f4f4f4");
    },
    "letter-boxed": () => {
      let s = r(45, 15, 70, 70, "#fff", 0, 'stroke="#000" stroke-width="3"');
      s += '<polyline points="45,38 115,30 68,85 115,70 45,62" fill="none" stroke="#f9a6a8" stroke-width="3"/>';
      [[45, 38], [115, 30], [68, 85], [115, 70], [45, 62], [92, 15], [68, 15], [92, 85]].forEach(([x, y]) => (s += c(x, y, 4, "#fff", 'stroke="#000" stroke-width="2"')));
      return svg(s, "#fc716b");
    },
    waffle: () => {
      let s = "";
      const p = ["ggygg", "yexeg", "gxgyx", "xeyeg", "ggxgg"];
      p.forEach((row, i) => [...row].forEach((ch, j) => { if (ch !== "e") s += r(47 + j * 14, 15 + i * 14, 12, 12, ch === "x" ? "#ece8d8" : col[ch], 2); }));
      return svg(s, "#f6f1e1");
    },
    contexto: () => {
      let s = "";
      [[96, "#f2b"], [80, "#f80"], [62, "#fc3"], [40, "#3c5"], [20, "#3c5"]].forEach(([w, f], i) => {
        s += r(25, 12 + i * 16, 110, 12, "#2a2f3a", 3) + r(25, 12 + i * 16, 110 - w, 12, f, 3);
      });
      return svg(s, "#1b1f27");
    },
    semantle: () => {
      let s = "";
      [91, 74, 52, 33, 12].forEach((v, i) => {
        s += '<text x="28" y="' + (24 + i * 16) + '" font-family="Cormorant Garamond, Georgia, serif" font-weight="600" font-size="12" fill="#ddd">' + ["ocean", "river", "lake", "storm", "chair"][i] + "</text>" +
          r(80, 15 + i * 16, v * 0.55, 8, "#5aa0e0", 1) + t(140, 23 + i * 16, v, 10, "#9ab");
      });
      return svg(s, "#141a22");
    },
    squaredle: () => {
      let s = '<polyline points="48,25 80,25 112,50 80,75 48,75" fill="none" stroke="#ffbf47" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>';
      for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) s += c(48 + j * 32, 25 + i * 25, 10, "#1f2d4a", 'stroke="#ffbf47" stroke-width="2"') + t(48 + j * 32, 30 + i * 25, "SQUAREDLE"[i * 3 + j], 12);
      return svg(s, "#0d1a33");
    },
    "bracket-city": () => svg(
      t(80, 44, "[ [ ___ ] of ]", 22, "#1d1d1d", 'font-family="Georgia, serif" font-weight="400"') +
      r(30, 60, 100, 8, "#e4ded1", 2) + r(30, 74, 70, 8, "#e4ded1", 2), "#fbf7ee"),
    weaver: () => svg(board(41, 8, 14, 2, ["ggggg"].concat(["gxggg", "ggxgg", "gggxg"]).concat(["ggggg"]).map((r2) => r2), ["WEAVE", "LEAVE", "LEASE", "LEASH", "LEACH"]).replace(/#6aaa64/g, "#6b9ac4"), "#141414"),
    crossclimb: () => {
      let s = "";
      ["CLIMB", "CLIME", "SLIME", "SLIDE", "GLIDE"].forEach((w, i) => {
        s += r(45, 6 + i * 18, 70, 15, i === 0 || i === 4 ? "#f5c26b" : "#fff", 3, 'stroke="#c7b9a0"');
        s += t(80, 18 + i * 18, w.split("").join(" "), 11, "#333");
      });
      return svg(s, "#efe5d3");
    },
    pinpoint: () => {
      let s = "";
      ["MERCURY", "MARS", "VENUS"].forEach((w, i) => (s += r(40 + i * 6, 14 + i * 22, 80, 18, "#fff", 4, 'stroke="#c6d4e8"') + t(80 + i * 6, 27 + i * 22, w, 11, "#333")));
      return svg(s + t(80, 92, "PLANETS?", 11, "#0a66c2"), "#e8eef7");
    },

    worldle: () => svg('<path d="M58 22 L74 16 L92 24 L104 20 L112 34 L104 48 L110 62 L96 80 L80 76 L70 84 L60 70 L52 58 L56 44 Z" fill="#fff"/>', "#1c2a3a"),
    globle: () => svg(
      c(80, 50, 40, "#1e4f8a") +
      '<path d="M55 30 Q70 20 82 30 Q90 40 78 48 Q64 50 55 42 Z" fill="#f7c5a0"/><path d="M90 55 Q104 50 112 62 Q106 78 92 76 Q84 66 90 55 Z" fill="#e8623a"/><path d="M60 62 Q70 58 74 70 Q66 80 58 72 Z" fill="#fbe3d1"/>' +
      c(80, 50, 40, "none", 'stroke="#9cc6ef" stroke-width="1.5"'), "#0b1626"),
    travle: () => {
      let s = '<polyline points="25,70 55,40 85,55 112,28 138,40" fill="none" stroke="#7fd3a5" stroke-width="3" stroke-dasharray="5 4"/>';
      [[25, 70, "#f45"], [55, 40, "#7fd3a5"], [85, 55, "#7fd3a5"], [112, 28, "#7fd3a5"], [138, 40, "#f45"]].forEach(([x, y, f]) => (s += c(x, y, 6, f)));
      return svg(s, "#12261d");
    },
    flagle: () => {
      let s = r(30, 18, 100, 21, "#ce1126") + r(30, 39, 100, 22, "#fff") + r(30, 61, 100, 21, "#007a3d");
      for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) if ((i + j) % 2) s += r(30 + j * 33.4, 18 + i * 21.4, 33.4, 21.4, "#2b2b2b", 0, 'stroke="#161616"');
      return svg(s);
    },
    tradle: () => svg(
      r(15, 12, 70, 76, "#e35d6a") + r(85, 12, 60, 40, "#f4a259") + r(85, 52, 34, 36, "#5b8e7d") + r(119, 52, 26, 18, "#8cb369") + r(119, 70, 26, 18, "#bc4b51") +
      t(50, 55, "OIL", 16) + t(115, 36, "CARS", 12), "#161616"),
    timeguessr: () => svg(
      r(22, 14, 72, 72, "#d9c7a6", 2) + '<path d="M22 70 L45 48 L62 62 L78 44 L94 60 L94 86 L22 86Z" fill="#8a7a5c"/>' + c(78, 30, 7, "#f4ead0") +
      '<path d="M122 30 a10 10 0 1 1 0.1 0 M122 50 L122 50" fill="none"/><path d="M122 22 a11 11 0 0 1 11 11 c0 9 -11 22 -11 22 s-11 -13 -11 -22 a11 11 0 0 1 11 -11z" fill="#e8553f"/>' + c(122, 33, 4, "#161616") +
      t(122, 80, "1974?", 14, "#f2efe4"), "#161616"),

    nerdle: () => svg(board(14, 34, 14, 2, ["gxygxgggy"], ["3+4*5=23"]).replace(/#6aaa64/g, "#398874").replace(/#c9b458/g, "#820458"), "#161616"),
    mathler: () => svg(t(80, 30, "= 42", 20, "#ffd23f") + board(32, 44, 14, 2, ["ggxyggx".slice(0, 6)], ["6*8-6"]), "#161616"),
    queens: () => {
      const reg = ["aabbc", "abbcc", "ddbce", "dddee", "ddeee"], f = { a: "#bba3e2", b: "#ffc992", c: "#96beff", d: "#b3dfa0", e: "#ff7b60" };
      let s = "";
      reg.forEach((row, i) => [...row].forEach((ch, j) => (s += r(55 + j * 10, 25 + i * 10, 10, 10, f[ch], 0, 'stroke="#333" stroke-width=".5"'))));
      [[0, 1], [2, 3], [4, 0], [1, 4]].forEach(([i, j]) => (s += t(60 + j * 10, 33.5 + i * 10, "♛", 9, K)));
      return svg(s, "#f3f2ef");
    },
    tango: () => {
      let s = "";
      const p = ["smsm", "msms", "smms", "mssm"];
      p.forEach((row, i) => [...row].forEach((ch, j) => {
        const x = 58 + j * 12, y = 28 + i * 12;
        s += r(x - 6, y - 6, 12, 12, "#fff", 0, 'stroke="#ddd"');
        s += ch === "s" ? c(x, y, 3.8, "#f5a623") : c(x, y, 3.8, "#4a90d9");
      }));
      return svg(s, "#f3f2ef");
    },
    zip: () => {
      let s = "";
      for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) s += r(56 + j * 12, 26 + i * 12, 12, 12, "#fff", 0, 'stroke="#ddd"');
      s += '<polyline points="62,32 98,32 98,44 62,44 62,56 98,56 98,68 62,68" fill="none" stroke="#f28c38" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"/>';
      s += c(62, 32, 4.5, K) + t(62, 34.5, "1", 6) + c(62, 68, 4.5, K) + t(62, 70.5, "2", 6);
      return svg(s, "#f3f2ef");
    },
    "nyt-sudoku": () => {
      let s = r(50, 20, 60, 60, "#fff", 0, 'stroke="#000" stroke-width="1.5"');
      for (let k = 1; k < 3; k++) s += r(50 + k * 20, 20, 0.8, 60, "#000") + r(50, 20 + k * 20, 60, 0.8, "#000");
      "5 3   7 6".split("").forEach((d, i) => { if (d.trim()) s += t(60 + (i % 3) * 20, 35 + Math.floor(i / 3) * 20, d, 13, K); });
      return svg(s, "#f6e9c9");
    },
    pips: () => {
      const dom = (x, y, a, b, f) => r(x, y, 40, 20, f, 3) + r(x + 19.5, y + 3, 1, 14, "#0003") + t(x + 10, y + 15, a, 13, K) + t(x + 30, y + 15, b, 13, K);
      return svg(dom(28, 22, "●", "●●", "#fff") + dom(88, 22, "●●●", "", "#fff") + dom(58, 56, "", "●", "#fff") + r(24, 18, 48, 28, "none", 4, 'stroke="#ff9eb1" stroke-width="2" stroke-dasharray="3 3"'), "#6c5ce7");
    },
    tiles: () => {
      let s = "";
      const f = ["#f6b26b", "#93c47d", "#6fa8dc", "#c27ba0"];
      for (let i = 0; i < 4; i++) for (let j = 0; j < 6; j++) s += r(22 + j * 20, 12 + i * 20, 17, 17, f[(i * 3 + j * 2) % 4], 3) + c(30.5 + j * 20, 20.5 + i * 20, 3.5, "#fff8");
      return svg(s, "#fbf3e6");
    },

    costcodle: () => svg(
      '<path d="M40 30 L110 30 L130 50 L110 70 L40 70 Z" fill="#fff"/>' + c(116, 50, 4, "#161616") + t(75, 59, "$?.??", 22, "#e31837"),
      "#005daa"),
    metazooa: () => svg(
      '<path d="M80 90 L80 60 M80 60 L50 38 M80 60 L110 38 M50 38 L36 18 M50 38 L64 18 M110 38 L100 18 M110 38 L124 18" stroke="#9be08a" stroke-width="3" fill="none" stroke-linecap="round"/>' +
      [[36, 18], [64, 18], [100, 18], [124, 18]].map(([x, y], i) => c(x, y, 6, i === 2 ? "#ffd166" : "#2d6a4f")).join(""), "#14281d"),
    chronophoto: () => svg(
      r(30, 12, 100, 62, "#cbb38a", 2) + '<path d="M30 60 L58 38 L80 52 L100 34 L130 56 L130 74 L30 74 Z" fill="#7d6a4b"/>' + c(110, 26, 6, "#efe2c4") +
      r(30, 80, 100, 6, "#333", 3) + r(30, 80, 64, 6, "#e9c46a", 3) + c(94, 83, 5, "#fff"), "#1d1a16"),
    poeltl: () => svg(
      c(60, 50, 26, "#ee7b30") + '<path d="M34 50 H86 M60 24 V76 M41 32 Q60 50 41 68 M79 32 Q60 50 79 68" stroke="#3b1d07" stroke-width="2" fill="none"/>' +
      t(118, 46, "?", 34, "#fff") + t(118, 66, "6'11\"", 11, "#bbb"), "#1d2b4f"),

    framed: () => {
      let s = r(0, 18, 160, 64, "#222");
      for (let k = 0; k < 16; k++) s += r(4 + k * 10, 21, 5, 5, "#555", 1) + r(4 + k * 10, 74, 5, 5, "#555", 1);
      [["#3d5a80", 0], ["#c46d38", 1], ["#2a2a2a", 2]].forEach(([f, i]) => (s += r(12 + i * 47, 30, 42, 40, f, 2)));
      s += '<path d="M12 60 L30 46 L54 64 L54 70 L12 70 Z" fill="#98c1d9"/>' + c(80, 44, 7, "#f2cc8f") + t(127, 56, "?", 20, "#666");
      return svg(s, "#0c0c0c");
    },
    bandle: () => {
      let s = "";
      [20, 44, 30, 62, 50, 70, 38, 56, 26, 46, 18].forEach((h, i) => (s += r(22 + i * 11, 82 - h, 7, h, i < 5 ? "#ff6fae" : "#4a3550", 2)));
      return svg(s, "#1e1424");
    },
    spotle: () => svg(
      c(80, 50, 36, "#121212", 'stroke="#2a2a2a" stroke-width="6"') + c(80, 50, 24, "none", 'stroke="#262626" stroke-width="2"') + c(80, 50, 12, "#1ed760") + c(80, 50, 2.5, "#121212"),
      "#191414"),

    chameleon: () => svg(
      r(0, 0, 160, 100, "#7b1e14") + '<path d="M0 70 Q40 50 80 66 T160 60 L160 100 L0 100Z" fill="#a82a1c"/>' +
      '<g opacity=".55"><circle cx="104" cy="40" r="7" fill="#e23b2e"/><path d="M96 50 h16 l3 22 h-22z" fill="#e23b2e"/></g>' +
      c(104, 54, 20, "none", 'stroke="#fff" stroke-width="2" stroke-dasharray="4 3"')),
    "real-or-fake": () => svg(
      t(80, 26, "The Daily Truth", 15, "#1a1a1a", 'font-family="Georgia, serif"') + r(18, 32, 124, 1.5, "#1a1a1a") +
      r(18, 40, 80, 6, "#444") + r(18, 50, 70, 6, "#444") + r(18, 64, 124, 3, "#bbb") + r(18, 71, 124, 3, "#bbb") + r(18, 78, 90, 3, "#bbb") +
      '<g transform="rotate(-14 120 50)">' + r(100, 38, 44, 18, "none", 2, 'stroke="#c0392b" stroke-width="2.5"') + t(122, 52, "FAKE?", 12, "#c0392b") + "</g>", "#efe8d8"),
  };

  // Official share images (thumbs/thumbs.js, from fetch-thumbs.js) win; the ink drawings are the fallback.
  const shot = (id) => typeof THUMBS !== "undefined" && THUMBS[id];
  window.artFor = (id, g) => {
    if (shot(id)) return '<img class="shot" src="' + shot(id) + '" alt="" loading="lazy" decoding="async">';
    if (ART[id]) return ART[id]();
    return nameCard(g || { name: id, cat: "custom" });
  };

  // No share image and no drawing: a title card in the genre's colour.
  const TINT = { words: "#f7dd84", geo: "#bcd6ea", logic: "#f2d6a2", sports: "#c6dfae", film: "#e9bdb4", music: "#d3c6ea",
    history: "#e6d2b5", trivia: "#f3c49b", gaming: "#b6e0d3", kmufti: "#ffcdb8", custom: "#e9e3d3" };
  function nameCard(g) {
    const name = String(g.name || "");
    // Long names break onto two lines at the space nearest the middle; size fits the longest line.
    let lines = [name];
    if (name.length > 13 && name.includes(" ")) {
      const mid = name.length / 2;
      let cut = -1;
      for (let i = 0; i < name.length; i++) if (name[i] === " " && (cut < 0 || Math.abs(i - mid) < Math.abs(cut - mid))) cut = i;
      lines = [name.slice(0, cut), name.slice(cut + 1)];
    }
    const longest = Math.max(...lines.map((l) => l.length));
    const size = Math.min(30, 128 / (longest * 0.47));
    const esc = (x) => x.replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));
    return '<svg class="plate-art namecard" viewBox="0 0 160 100" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">' +
      '<rect width="160" height="100" fill="' + (TINT[g.cat] || TINT.custom) + '"/>' +
      '<g filter="url(#wob)" fill="none" stroke="#1f1b16" stroke-width=".8"><rect x="9" y="9" width="142" height="82"/><rect x="12" y="12" width="136" height="76" stroke-width=".4"/></g>' +
      '<text text-anchor="middle" font-family="Cormorant Garamond, Georgia, serif" font-weight="700" font-size="' + size.toFixed(1) + '" fill="#1f1b16">' +
        lines.map((l, i) => '<tspan x="80" y="' + (50 + size * 0.32 + (i - (lines.length - 1) / 2) * size * 1.05).toFixed(1) + '">' + esc(l) + "</tspan>").join("") + "</text>" +
      "</svg>";
  }
})();
