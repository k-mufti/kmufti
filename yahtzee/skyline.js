// The view behind the table: an art deco city at night, painted once onto a
// canvas fixed behind the page. Indigo sky, two layers of towers with
// setbacks and spires, gold windows, a lit diamond crown, searchlights. Every
// so often a few windows go dark or come on -- people are home.
//
// Nothing here knows about the game. It paints a backdrop and leaves.

const cv = document.createElement("canvas");
cv.className = "city";
cv.setAttribute("aria-hidden", "true");
document.body.prepend(cv);

const beams = document.createElement("div");
beams.className = "beams";
beams.setAttribute("aria-hidden", "true");
beams.innerHTML = "<i></i><i></i><i></i>";
document.body.prepend(beams);

const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
const ctx = cv.getContext("2d");
let windows = [];          // [x, y, w, h, lit] in canvas pixels, for flicker

// Seeded, so the city is the same city every visit.
function rng(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const LIT = ["#ffd27a", "#ffc65c", "#ffe2a6"];
const lit = (r) => LIT[Math.floor(r() * LIT.length)];

function tower(r, x, base, w, h, body, opt = {}) {
  const top = base - h;
  ctx.fillStyle = body;
  ctx.fillRect(x, top, w, h);
  // setbacks: each tier a little narrower, art deco wedding-cake style
  let tx = x, tw = w, ty = top;
  const tiers = opt.tiers ?? Math.floor(r() * 3);
  for (let k = 0; k < tiers; k++) {
    const th = h * (0.08 + r() * 0.06);
    tx += tw * 0.12; tw *= 0.76; ty -= th;
    ctx.fillRect(tx, ty, tw, th);
  }
  if (opt.spire ?? r() < 0.45) {
    const sh = h * (0.18 + r() * 0.25);
    ctx.beginPath();
    ctx.moveTo(tx + tw * 0.3, ty);
    ctx.lineTo(tx + tw * 0.5, ty - sh);
    ctx.lineTo(tx + tw * 0.7, ty);
    ctx.fill();
  }
  if (opt.diamond) {
    // the lit crown: a gold lozenge, like the tower in the window
    const dw = tw * 0.42, dh = dw * 1.6, cx = tx + tw / 2, cy = ty - dh * 0.1;
    ctx.fillStyle = "#ffdf8a";
    ctx.shadowColor = "rgba(255,200,90,.8)";
    ctx.shadowBlur = dw;
    ctx.beginPath();
    ctx.moveTo(cx, cy - dh / 2); ctx.lineTo(cx + dw / 2, cy);
    ctx.lineTo(cx, cy + dh / 2); ctx.lineTo(cx - dw / 2, cy);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(90,50,0,.55)";
    ctx.lineWidth = Math.max(1, dw * 0.05);
    for (let k = 1; k < 4; k++) {
      ctx.beginPath();
      ctx.moveTo(cx - dw / 2 + (dw / 4) * k * 0.5, cy - dh / 2 + (dh / 4) * k * 0.5);
      ctx.lineTo(cx + (dw / 4) * k * 0.5, cy + (dh / 4) * k * 0.5);
      ctx.stroke();
    }
  }
  // windows on a grid
  const cw = opt.cell, ch = cw * 1.5, on = opt.lit ?? 0.32;
  for (let wy = top + ch; wy < base - ch * 0.5; wy += ch)
    for (let wx = x + cw * 0.6; wx < x + w - cw; wx += cw) {
      const isLit = r() < on;
      const win = [Math.round(wx), Math.round(wy), Math.max(1, Math.round(cw * 0.45)), Math.max(1, Math.round(ch * 0.5)), isLit];
      paintWindow(win, isLit ? lit(r) : opt.dark);
      if (opt.flicker) windows.push(win);
    }
}

function paintWindow([x, y, w, h], colour) {
  ctx.fillStyle = colour;
  ctx.fillRect(x, y, w, h);
}

function draw() {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const W = Math.round(innerWidth * dpr), H = Math.round(innerHeight * dpr);
  cv.width = W; cv.height = H;
  windows = [];
  const r = rng(1931);

  // sky: black overhead to ultramarine at the horizon
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, "#03020c");
  sky.addColorStop(0.45, "#0b0a3c");
  sky.addColorStop(0.8, "#1e22a6");
  sky.addColorStop(1, "#2b30c8");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  // a few stars
  for (let k = 0; k < 90; k++) {
    ctx.fillStyle = `rgba(220,225,255,${0.25 + r() * 0.5})`;
    const s = (r() < 0.9 ? 1 : 2) * dpr;
    ctx.fillRect(r() * W, r() * H * 0.5, s, s);
  }

  const u = Math.max(W, H * 1.2) / 1600;     // towers scale with the window
  const base = H;

  // far: hazy, paler blue, tiny windows, a wall of them
  for (let x = -20 * u; x < W; ) {
    const w = (30 + r() * 60) * u;
    tower(r, x, base, w, (140 + r() * 260) * u, "#1a1a6e", { cell: 6 * u, lit: 0.22, dark: "#1d1e78" });
    x += w + r() * 6 * u;
  }
  // near: dark navy, bigger, with the occasional landmark
  let n = 0;
  for (let x = -40 * u; x < W; n++) {
    const w = (70 + r() * 110) * u;
    const h = (180 + r() * 300) * u;
    const landmark = n % 5 === 2;
    tower(r, x, base, w, landmark ? h * 1.35 : h, "#080726", {
      cell: 10 * u, lit: 0.3, dark: "#0c0b33", flicker: true,
      tiers: landmark ? 3 : undefined, spire: landmark ? n % 2 === 0 : undefined,
      diamond: landmark && n % 2 === 1,
    });
    x += w + (r() * 24 - 4) * u;
  }

  // a cool haze lying over the bottom of the city
  const haze = ctx.createLinearGradient(0, H * 0.7, 0, H);
  haze.addColorStop(0, "rgba(40,44,190,0)");
  haze.addColorStop(1, "rgba(40,44,190,.18)");
  ctx.fillStyle = haze;
  ctx.fillRect(0, H * 0.7, W, H * 0.3);
}

let timer = 0;
addEventListener("resize", () => {
  clearTimeout(timer);
  timer = setTimeout(draw, 120);
});
draw();

// Somebody turns a light off; somebody else gets home.
if (!still) {
  const r = rng(Date.now() & 0xffff);
  setInterval(() => {
    if (document.hidden || !windows.length) return;
    for (let k = 0; k < 3; k++) {
      const win = windows[Math.floor(r() * windows.length)];
      win[4] = !win[4];
      paintWindow(win, win[4] ? lit(r) : "#0c0b33");
    }
  }, 1400);
}
