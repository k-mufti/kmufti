// What's behind the table: the casino carpet. A harlequin of diamonds in
// two navies, painted once onto a canvas fixed behind the page, lit low,
// with the room falling into shadow at the walls.
//
// Nothing here knows about the game. It paints a backdrop and leaves.

(() => {
const cv = document.createElement("canvas");
cv.className = "city";
cv.setAttribute("aria-hidden", "true");
document.body.prepend(cv);

const ctx = cv.getContext("2d");
let W = 0, H = 0, dpr = 1, u = 1;

// Seeded, so the city is the same city every visit.
function rng(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function canvas(w, h) {
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h));
  return c;
}

function vignette(g, w, h, inner, outer, cx = w / 2, cy = h * 0.45) {
  const v = g.createRadialGradient(cx, cy, Math.min(w, h) * 0.2, cx, cy, Math.max(w, h) * 0.75);
  v.addColorStop(0, `rgba(3,2,10,${inner})`);
  v.addColorStop(1, `rgba(3,2,10,${outer})`);
  g.fillStyle = v;
  g.fillRect(0, 0, w, h);
}

/* ---------------- the carpet ---------------- */

function carpet() {
  // a harlequin of diamonds in two navies, a nested crimson-and-gold lozenge
  // in each bright one and a gold star in each dark one
  const C = Math.round(170 * u), T = C * 2, h = C / 2;
  const tile = canvas(T, T), g = tile.getContext("2d");
  const TAU = Math.PI * 2;
  const RED = "#8e1029", RED2 = "#c21c3a", GOLD = "#d9a640";
  const lw = (n) => Math.max(0.6, n * C / 300);
  // the room's light is up and to the left, so things cast down and right
  const shade = (blur, off) => {
    g.shadowColor = "rgba(0,0,0,.95)"; g.shadowBlur = lw(blur * 1.5);
    g.shadowOffsetX = lw(off * 1.2); g.shadowOffsetY = lw(off * 2);
  };
  const unshade = () => { g.shadowColor = "transparent"; g.shadowBlur = g.shadowOffsetX = g.shadowOffsetY = 0; };
  // draw fn at (x,y) and every wrapped copy that could reach into the tile
  const wrap = (x, y, fn) => {
    for (const dx of [-T, 0, T]) for (const dy of [-T, 0, T]) {
      const X = x + dx, Y = y + dy;
      if (X > -C && X < T + C && Y > -C && Y < T + C) fn(X, Y);
    }
  };
  const lozenge = (cx, cy, k) => {
    g.beginPath();
    g.moveTo(cx, cy - k); g.lineTo(cx + k, cy); g.lineTo(cx, cy + k); g.lineTo(cx - k, cy);
    g.closePath();
  };

  g.fillStyle = "#070622";                       // the dark diamonds are the ground
  g.fillRect(0, 0, T, T);
  const bright = [[h, h], [h + C, h], [h, h + C], [h + C, h + C]];
  const dark = [[0, 0], [C, 0], [0, C], [C, C]];
  g.fillStyle = "#15145e";
  for (const [x, y] of bright) { lozenge(x, y, h); g.fill(); }

  // the weave: a faint twill running both ways
  g.lineWidth = lw(1);
  for (let k = -T; k < T * 2; k += lw(6)) {
    g.strokeStyle = "rgba(60,70,200,.10)";
    g.beginPath(); g.moveTo(k, 0); g.lineTo(k + T, T); g.stroke();
    g.strokeStyle = "rgba(0,0,0,.18)";
    g.beginPath(); g.moveTo(k, T); g.lineTo(k + T, 0); g.stroke();
  }

  // a fine crimson border inside every diamond
  g.strokeStyle = "rgba(194,28,58,.7)"; g.lineWidth = lw(1.3);
  for (const [x, y] of bright) { lozenge(x, y, h * 0.86); g.stroke(); }
  for (const [x, y] of dark) wrap(x, y, (X, Y) => { lozenge(X, Y, h * 0.86); g.stroke(); });

  // gold studs where four corners meet
  g.fillStyle = GOLD;
  for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++)
    for (const [x, y] of [[h + i * C, j * C], [i * C, h + j * C]])
      wrap(x, y, (X, Y) => {
        shade(3, 1.5);
        g.beginPath(); g.moveTo(X, Y - lw(7)); g.lineTo(X + lw(5), Y); g.lineTo(X, Y + lw(7)); g.lineTo(X - lw(5), Y); g.fill();
        unshade();
      });

  // in the bright diamonds, nested lozenges: crimson, then gold, then a
  // navy eye
  for (const [x, y] of bright) {
    shade(8, 4); g.fillStyle = RED; lozenge(x, y, h * 0.34); g.fill(); unshade();
    g.strokeStyle = RED2; g.lineWidth = lw(1.2); lozenge(x, y, h * 0.28); g.stroke();
    g.fillStyle = GOLD; lozenge(x, y, h * 0.16); g.fill();
    g.fillStyle = "#15145e"; lozenge(x, y, h * 0.06); g.fill();
  }
  // in the dark ones, a four-point gold star
  for (const [x, y] of dark) wrap(x, y, (X, Y) => {
    const k = h * 0.2;
    shade(5, 2.5);
    g.fillStyle = GOLD; g.beginPath();
    g.moveTo(X, Y - k); g.quadraticCurveTo(X, Y, X + k * 0.7, Y); g.quadraticCurveTo(X, Y, X, Y + k);
    g.quadraticCurveTo(X, Y, X - k * 0.7, Y); g.quadraticCurveTo(X, Y, X, Y - k); g.fill();
    unshade();
  });

  // pile: every fibre tip catches a little light or a little shadow
  const img = g.getImageData(0, 0, T, T), px = img.data;
  const nr = rng(3);
  for (let i = 0; i < px.length; i += 4) {
    const n = (nr() - 0.5) * 34;
    px[i] += n; px[i + 1] += n; px[i + 2] += n;
  }
  g.putImageData(img, 0, 0);

  ctx.fillStyle = ctx.createPattern(tile, "repeat");
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "rgba(3,2,10,.5)";               // the lights are low in here
  ctx.fillRect(0, 0, W, H);
  // ...except a little warmth spilling down from the table lamp
  const warm = ctx.createRadialGradient(W / 2, H * 0.4, 0, W / 2, H * 0.4, Math.max(W, H) * 0.6);
  warm.addColorStop(0, "rgba(255,190,110,.06)");
  warm.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = warm;
  ctx.fillRect(0, 0, W, H);
  vignette(ctx, W, H, 0.1, 0.85);
  // and the room falls into shadow at every wall
  const edge = Math.min(W, H) * 0.28;
  for (const [x0, y0, x1, y1] of [[0, 0, edge, 0], [W, 0, W - edge, 0], [0, 0, 0, edge], [0, H, 0, H - edge]]) {
    const e = ctx.createLinearGradient(x0, y0, x1, y1);
    e.addColorStop(0, "rgba(2,1,8,.9)");
    e.addColorStop(1, "rgba(2,1,8,0)");
    ctx.fillStyle = e;
    ctx.fillRect(0, 0, W, H);
  }
}

function paint() {
  dpr = Math.min(devicePixelRatio || 1, 2);
  W = Math.round(innerWidth * dpr); H = Math.round(innerHeight * dpr);
  cv.width = W; cv.height = H;
  u = Math.max(W, H * 1.2) / 1600;
  carpet();
}

let timer = 0;
addEventListener("resize", () => {
  clearTimeout(timer);
  timer = setTimeout(paint, 120);
});
paint();
})();
