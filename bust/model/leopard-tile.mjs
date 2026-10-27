// Makes a seamless tile out of the leopard photo: for each wrap (left/right,
// then top/bottom) the overlapping strips are joined along the path where
// they differ least, so spots meet spots instead of ghosting.
import { chromium } from "/Users/karimmufti/.npm/_npx/360550e4913b8759/node_modules/playwright/index.mjs";
import fs from "fs";
// usage (from a folder holding the source photo as src.png): node leopard-tile.mjs -> tile.jpg, preview.jpg
const b = await chromium.launch();
const p = await b.newPage();
const src = "data:image/png;base64," + fs.readFileSync("src.png").toString("base64");
const out = await p.evaluate(async ({ src, S, T, O, x0, y0 }) => {
  const img = new Image(); img.src = src; await img.decode();
  const c = document.createElement("canvas"); c.width = img.width; c.height = img.height;
  const g = c.getContext("2d"); g.drawImage(img, 0, 0);
  // working region: S x T plus overlap O on the right and bottom
  let W = S + O, H = T + O;
  let d = g.getImageData(x0, y0, W, H).data;
  const px = (a, w, x, y) => (y * w + x) * 4;
  const diff = (a, i, j) => { let s = 0; for (let k = 0; k < 3; k++) s += (a[i + k] - a[j + k]) ** 2; return s; };
  // join the right strip back onto the left one along the cheapest seam
  function wrapX(a, w, h, s, o) {
    const cost = new Float64Array(h * o), from = new Int32Array(h * o);
    for (let y = 0; y < h; y++) for (let k = 0; k < o; k++) {
      const e = diff(a, px(a, w, k, y), px(a, w, s + k, y));
      if (y === 0) { cost[k] = e; continue; }
      let best = Infinity, bk = k;
      for (let dk = -1; dk <= 1; dk++) { const kk = k + dk; if (kk < 0 || kk >= o) continue; const v = cost[(y - 1) * o + kk]; if (v < best) { best = v; bk = kk; } }
      cost[y * o + k] = e + best; from[y * o + k] = bk;
    }
    let k = 0, best = Infinity;
    for (let kk = 0; kk < o; kk++) if (cost[(h - 1) * o + kk] < best) { best = cost[(h - 1) * o + kk]; k = kk; }
    const seam = new Int32Array(h);
    for (let y = h - 1; y >= 0; y--) { seam[y] = k; k = from[y * o + k]; }
    const r = new Uint8ClampedArray(s * h * 4);
    for (let y = 0; y < h; y++) for (let x = 0; x < s; x++) {
      let i = px(a, w, x, y);
      if (x < o) {
        // before the seam: the right strip (it carries on from the tile's last column); a 3px feather across it
        const t = Math.min(1, Math.max(0, (x - seam[y] + 1.5) / 3));
        const R = px(a, w, s + x, y);
        for (let q = 0; q < 4; q++) r[(y * s + x) * 4 + q] = a[R + q] * (1 - t) + a[i + q] * t;
        continue;
      }
      for (let q = 0; q < 4; q++) r[(y * s + x) * 4 + q] = a[i + q];
    }
    return r;
  }
  const transpose = (a, w, h) => { const r = new Uint8ClampedArray(a.length); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) for (let q = 0; q < 4; q++) r[(x * h + y) * 4 + q] = a[(y * w + x) * 4 + q]; return r; };
  let a = wrapX(d, W, H, S, O);               // S x H
  a = transpose(a, S, H);                      // H x S
  a = wrapX(a, H, S, T, O);                    // T x S
  a = transpose(a, T, S);                      // S x T
  // even out the light: divide out a very blurred copy, so the tile has no
  // bright corner to give the repeat away
  const o = document.createElement("canvas"); o.width = S; o.height = T;
  const og = o.getContext("2d"); og.putImageData(new ImageData(a, S, T), 0, 0);
  const blur = document.createElement("canvas"); blur.width = S; blur.height = T;
  const bg = blur.getContext("2d"); bg.filter = "blur(120px)";
  for (const dx of [-S, 0, S]) for (const dy of [-T, 0, T]) bg.drawImage(o, dx, dy);
  const bd = bg.getImageData(0, 0, S, T).data, od = og.getImageData(0, 0, S, T);
  let mean = [0, 0, 0];
  for (let i = 0; i < bd.length; i += 4) for (let q = 0; q < 3; q++) mean[q] += bd[i + q];
  mean = mean.map((m) => m / (bd.length / 4));
  for (let i = 0; i < bd.length; i += 4) for (let q = 0; q < 3; q++) od.data[i + q] = Math.min(255, od.data[i + q] * mean[q] / Math.max(1, bd[i + q]));
  og.putImageData(od, 0, 0);
  // and a 2 x 2 preview, to check the seams
  const pv = document.createElement("canvas"); pv.width = S * 2; pv.height = T * 2;
  const pg = pv.getContext("2d"); for (const dx of [0, S]) for (const dy of [0, T]) pg.drawImage(o, dx, dy);
  return { tile: o.toDataURL("image/jpeg", 0.88), preview: pv.toDataURL("image/jpeg", 0.7) };
}, { src, S: 960, T: 1680, O: 150, x0: 14, y0: 60 });
fs.writeFileSync("tile.jpg", Buffer.from(out.tile.split(",")[1], "base64"));
fs.writeFileSync("preview.jpg", Buffer.from(out.preview.split(",")[1], "base64"));
await b.close();
