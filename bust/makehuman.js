/* =========================================================================
   Builds the bust from MakeHuman's default man: the stock base mesh with
   the young caucasian male target applied — bald, neutral, symmetrical —
   smoothed twice, then cut off below the shoulders like a marble bust.
   Ambient occlusion is baked into every vertex (the _AO attribute), so the
   eye sockets, ears and lips shade themselves without a render pass.

     node bust/makehuman.js          -> bust/model/head.glb

   Source: MakeHuman base mesh and targets (CC0), pinned to one commit and
   fetched at build time, so nothing third-party lives in the repo but the
   finished model.

   The cut is a few planes applied one after another — each arm through the
   deltoid, then flat across the chest. Every plane leaves a hole in a closed
   mesh, which gets a flat cap, so the result stays solid.

   The base mesh is in decimetres; the output is metres (scaled up a little,
   as busts often are), y up, facing +z, the chest cut sitting on y = 0.
   ========================================================================= */
const fs = require("fs");
const path = require("path");

const REPO = "https://raw.githubusercontent.com/makehumancommunity/makehuman/a8bc2d54ff0ac92e78ff71431b1023eda42bf482/makehuman/data/";
const TARGETS = [["targets/macrodetails/caucasian-male-young.target", 1]];
const OUT = path.join(__dirname, "model", "head.glb");
const LEVELS = 2;      // Catmull-Clark passes: the base mesh is ~13k quads, two passes is ~16x that
const SCALE = 0.125;   // decimetres -> metres, then a touch over life size: a bust is ~0.49 m tall, filling the frame

// Cuts, in the base mesh's decimetres: keep the side of the plane through
// p that n points at. The arm cuts run from the armpit up and outward, so
// the top of each shoulder stays round and the arm is trimmed off below it,
// the way a sculptor ends a bust.
const CUTS = [
  { n: [1, 0.6, 0], p: [-2.0, 5.8, 0] },    // one arm
  { n: [-1, 0.6, 0], p: [2.0, 5.8, 0] },    // the other
  { n: [0, 1, 0], p: [0, 5.35, 0] },        // across the chest
];

async function get(p) {
  const r = await fetch(REPO + p);
  if (!r.ok) throw new Error(`${p}: ${r.status}`);
  return r.text();
}

(async () => {
  // ---------- Base mesh + targets ----------
  const V = [], F = [], EYES = [];
  let group = "";
  for (const line of (await get("3dobjs/base.obj")).split("\n")) {
    const p = line.trim().split(/\s+/);
    if (p[0] === "v") V.push(p.slice(1, 4).map(Number));
    else if (p[0] === "g") group = p[1];
    else if (p[0] === "f" && group === "body") F.push(p.slice(1).map((t) => parseInt(t, 10) - 1));
    else if (p[0] === "f" && /^helper-[lr]-eye$/.test(group)) EYES.push(p.slice(1).map((t) => parseInt(t, 10) - 1));
  }
  for (const [t, w] of TARGETS) {
    for (const line of (await get(t)).split("\n")) {
      if (!line || line[0] === "#") continue;
      const [i, x, y, z] = line.trim().split(/\s+/).map(Number);
      V[i][0] += x * w; V[i][1] += y * w; V[i][2] += z * w;
    }
  }
  const quads = subdivideN(V, F, LEVELS);
  let P = quads.V, T = [];
  for (const [a, b, c, d] of quads.F) T.push([a, b, c], [a, c, d]);

  // ---------- Cut and cap ----------
  let mesh = { P, T, caps: [] };
  for (const cut of CUTS) mesh = clip(mesh, cut);

  // ---------- Eyes: the helper eyeballs, as blank stone globes ----------
  const eyes = subdivideN(V, EYES, LEVELS);
  const off = mesh.P.length;
  mesh.P.push(...eyes.V);
  for (const [a, b, c, d] of eyes.F) mesh.T.push([off + a, off + b, off + c], [off + a, off + c, off + d]);

  // ---------- Out: metres, cut on y = 0 ----------
  let minY = Infinity;
  for (const p of mesh.P) minY = Math.min(minY, p[1]);
  const pos = [], nrm = [], idx = [];
  const sn = smoothNormals(mesh.P, mesh.T);
  for (let i = 0; i < mesh.P.length; i++) {
    const p = mesh.P[i];
    pos.push(p[0] * SCALE, (p[1] - minY) * SCALE, p[2] * SCALE);
    nrm.push(...sn[i]);
  }
  for (const t of mesh.T) idx.push(...t);
  // caps: their own vertices, flat, so the cut edge stays sharp
  for (const cap of mesh.caps) {
    const base = pos.length / 3;
    for (const p of cap.pts) { pos.push(p[0] * SCALE, (p[1] - minY) * SCALE, p[2] * SCALE); nrm.push(...cap.n); }
    for (const t of cap.tris) idx.push(base + t[0], base + t[1], base + t[2]);
  }
  const P32 = new Float32Array(pos), N32 = new Float32Array(nrm), I32 = new Uint32Array(idx);
  writeGlb(OUT, P32, N32, I32, bakeAO(P32, N32, I32));
})();

function subdivideN(V, F, n) {
  for (let k = 0; k < n; k++) ({ V, F } = subdivide(V, F));
  return { V, F };
}

// ---------- Catmull-Clark, one level (the base mesh is all quads, closed) ----------
function subdivide(V, F) {
  const out = V.map(() => null);
  const facePt = F.map((f) => avg(f.map((i) => V[i])));
  const edges = new Map();                     // "a,b" -> { faces: [], idx }
  const vFaces = V.map(() => []), vEdges = V.map(() => []);
  F.forEach((f, fi) => {
    for (let k = 0; k < 4; k++) {
      const a = f[k], b = f[(k + 1) % 4], key = a < b ? `${a},${b}` : `${b},${a}`;
      let e = edges.get(key);
      if (!e) { e = { a, b, faces: [] }; edges.set(key, e); vEdges[a].push(e); vEdges[b].push(e); }
      e.faces.push(fi);
      vFaces[a].push(fi);
    }
  });
  const NV = [];
  const used = new Set(F.flat());
  const vIdx = new Map();
  for (const i of used) {
    const n = vFaces[i].length, Fa = avg(vFaces[i].map((fi) => facePt[fi]));
    const R = avg(vEdges[i].map((e) => mid(V[e.a], V[e.b])));
    vIdx.set(i, NV.length);
    NV.push(V[i].map((c, k) => (Fa[k] + 2 * R[k] + (n - 3) * c) / n));
  }
  for (const e of edges.values()) {
    e.idx = NV.length;
    NV.push(avg([V[e.a], V[e.b], ...e.faces.map((fi) => facePt[fi])]));
  }
  const fIdx = facePt.map((p) => (NV.push(p), NV.length - 1));
  const NF = [];
  F.forEach((f, fi) => {
    const ek = (a, b) => edges.get(a < b ? `${a},${b}` : `${b},${a}`).idx;
    for (let k = 0; k < 4; k++) {
      const prev = f[(k + 3) % 4], cur = f[k], next = f[(k + 1) % 4];
      NF.push([vIdx.get(cur), ek(cur, next), fIdx[fi], ek(prev, cur)]);
    }
  });
  return { V: NV, F: NF };
}

// ---------- Clip a closed triangle mesh by a plane, and cap the hole ----------
// Keeps points on the side of the plane (through p0) that n points at.
function clip({ P, T, caps }, { n, p: p0 }) {
  const N = norm(n), D = -dot(N, p0);
  const s = P.map((p) => { const v = dot(N, p) + D; return v === 0 ? 1e-9 : v; });
  const NP = P.slice(), cutAt = new Map(), cutEdges = new Map();   // start -> end
  const edgePt = (a, b) => {
    const key = a < b ? `${a},${b}` : `${b},${a}`;
    if (!cutAt.has(key)) {
      const t = s[a] / (s[a] - s[b]);
      NP.push(P[a].map((c, k) => c + (P[b][k] - c) * t));
      cutAt.set(key, NP.length - 1);
    }
    return cutAt.get(key);
  };
  const NT = [];
  for (const tri of T) {
    const poly = [];
    let enter = -1, exit = -1;
    for (let k = 0; k < 3; k++) {
      const a = tri[k], b = tri[(k + 1) % 3];
      if (s[a] >= 0) poly.push(a);
      if ((s[a] >= 0) !== (s[b] >= 0)) {
        const q = edgePt(a, b);
        poly.push(q);
        if (s[a] >= 0) exit = q; else enter = q;
      }
    }
    for (let k = 1; k + 1 < poly.length; k++) NT.push([poly[0], poly[k], poly[k + 1]]);
    if (exit >= 0 && enter >= 0) cutEdges.set(exit, enter);
  }
  // Chain the cut edges into loops and triangulate each on the plane.
  const u = Math.abs(N[1]) < 0.9 ? norm(cross(N, [0, 1, 0])) : norm(cross(N, [1, 0, 0]));
  const v = cross(N, u);
  const capN = N.map((c) => -c);
  const newCaps = [];
  const done = new Set();
  for (const start of cutEdges.keys()) {
    if (done.has(start)) continue;
    const loop = [];
    let cur = start;
    while (cur !== undefined && !done.has(cur)) { done.add(cur); loop.push(cur); cur = cutEdges.get(cur); }
    if (loop.length < 3) continue;
    const pts = loop.map((i) => NP[i]);
    const tris = earClip(pts.map((p) => [dot(p, u), dot(p, v)]));
    // face the cap away from the kept side
    for (const t of tris) {
      const fn = cross(sub(pts[t[1]], pts[t[0]]), sub(pts[t[2]], pts[t[0]]));
      if (dot(fn, capN) < 0) { const x = t[1]; t[1] = t[2]; t[2] = x; }
    }
    newCaps.push({ pts, tris, n: capN });
  }
  // Earlier caps get clipped by this plane too.
  const keptCaps = [];
  for (const c of caps) {
    const sub2 = clip({ P: c.pts, T: c.tris, caps: [] }, { n, p: p0 });
    const used = [...new Set(sub2.T.flat())];
    if (!used.length) continue;
    const remap = new Map(used.map((i, k) => [i, k]));
    keptCaps.push({ pts: used.map((i) => sub2.P[i]), tris: sub2.T.map((t) => t.map((i) => remap.get(i))), n: c.n });
  }
  // Drop vertices nothing uses any more.
  const used = [...new Set(NT.flat())];
  const remap = new Map(used.map((i, k) => [i, k]));
  return { P: used.map((i) => NP[i]), T: NT.map((t) => t.map((i) => remap.get(i))), caps: [...keptCaps, ...newCaps] };
}

function earClip(pts) {
  const n = pts.length;
  let area = 0;
  for (let i = 0; i < n; i++) { const a = pts[i], b = pts[(i + 1) % n]; area += a[0] * b[1] - b[0] * a[1]; }
  const ccw = area > 0;
  const idx = [...Array(n).keys()];
  const tris = [];
  const cross2 = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
  const inside = (p, a, b, c) => {
    const d1 = cross2(a, b, p), d2 = cross2(b, c, p), d3 = cross2(c, a, p);
    return ccw ? d1 > 0 && d2 > 0 && d3 > 0 : d1 < 0 && d2 < 0 && d3 < 0;
  };
  let guard = 0;
  while (idx.length > 3 && guard++ < n * n) {
    let clipped = false;
    for (let k = 0; k < idx.length; k++) {
      const i0 = idx[(k + idx.length - 1) % idx.length], i1 = idx[k], i2 = idx[(k + 1) % idx.length];
      const c = cross2(pts[i0], pts[i1], pts[i2]);
      if (ccw ? c <= 0 : c >= 0) continue;
      if (idx.some((j) => j !== i0 && j !== i1 && j !== i2 && inside(pts[j], pts[i0], pts[i1], pts[i2]))) continue;
      tris.push([i0, i1, i2]);
      idx.splice(k, 1);
      clipped = true;
      break;
    }
    if (!clipped) break;
  }
  // whatever's left (a self-touching sliver), fan it
  for (let k = 1; k + 1 < idx.length; k++) tris.push([idx[0], idx[k], idx[k + 1]]);
  return tris;
}

function smoothNormals(P, T) {
  const N = P.map(() => [0, 0, 0]);
  for (const [a, b, c] of T) {
    const fn = cross(sub(P[b], P[a]), sub(P[c], P[a]));   // area-weighted
    for (const i of [a, b, c]) for (let k = 0; k < 3; k++) N[i][k] += fn[k];
  }
  return N.map((n) => norm(n));
}

// ---------- Ambient occlusion, per vertex ----------
// Cosine-weighted rays from each vertex; a ray that meets the mesh within
// AO_R is occluded. A BVH over the triangles keeps it to a few seconds.
const AO_RAYS = 96, AO_R = 0.09;   // metres: about the depth of an eye socket, a bit more
function bakeAO(P, N, I) {
  const nt = I.length / 3, bvh = buildBvh(P, I);
  const dirs = [];
  for (let k = 0; k < AO_RAYS; k++) {          // a fixed spiral, so the bake is repeatable
    const u = (k + 0.5) / AO_RAYS, phi = k * 2.399963;
    const r = Math.sqrt(u);
    dirs.push([r * Math.cos(phi), r * Math.sin(phi), Math.sqrt(1 - u)]);
  }
  const nv = P.length / 3, ao = new Float32Array(nv);
  for (let i = 0; i < nv; i++) {
    const n = [N[i * 3], N[i * 3 + 1], N[i * 3 + 2]];
    const t1 = norm(Math.abs(n[0]) < 0.9 ? cross(n, [1, 0, 0]) : cross(n, [0, 1, 0])), t2 = cross(n, t1);
    // start just off the surface so the ray clears its own triangles
    const o = [P[i * 3] + n[0] * 4e-4, P[i * 3 + 1] + n[1] * 4e-4, P[i * 3 + 2] + n[2] * 4e-4];
    let open = 0;
    for (const [a, b, c] of dirs) {
      const d = [t1[0] * a + t2[0] * b + n[0] * c, t1[1] * a + t2[1] * b + n[1] * c, t1[2] * a + t2[2] * b + n[2] * c];
      const t = raycast(bvh, P, I, o, d, AO_R);
      open += t < 0 ? 1 : Math.pow(t / AO_R, 0.5);   // near hits count fully, far ones only a little
    }
    ao[i] = open / AO_RAYS;
  }
  // one pass of neighbour averaging takes the speckle out
  const sum = new Float32Array(nv), cnt = new Float32Array(nv);
  for (let t = 0; t < nt; t++) for (let k = 0; k < 3; k++) {
    const a = I[t * 3 + k];
    for (let j = 0; j < 3; j++) { sum[a] += ao[I[t * 3 + j]]; cnt[a]++; }
  }
  for (let i = 0; i < nv; i++) if (cnt[i]) ao[i] = sum[i] / cnt[i];
  return ao;
}

function buildBvh(P, I) {
  const nt = I.length / 3, cen = new Float32Array(nt * 3), lo = new Float32Array(nt * 3), hi = new Float32Array(nt * 3);
  for (let t = 0; t < nt; t++) for (let c = 0; c < 3; c++) {
    const a = P[I[t * 3] * 3 + c], b = P[I[t * 3 + 1] * 3 + c], d = P[I[t * 3 + 2] * 3 + c];
    lo[t * 3 + c] = Math.min(a, b, d); hi[t * 3 + c] = Math.max(a, b, d); cen[t * 3 + c] = (a + b + d) / 3;
  }
  const order = new Uint32Array(nt).map((_, i) => i), nodes = [];
  (function build(start, end) {
    const node = { min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity], start, end, l: null, r: null };
    nodes.push(node);
    for (let k = start; k < end; k++) for (let c = 0; c < 3; c++) {
      node.min[c] = Math.min(node.min[c], lo[order[k] * 3 + c]); node.max[c] = Math.max(node.max[c], hi[order[k] * 3 + c]);
    }
    if (end - start <= 6) return node;
    const ext = [0, 1, 2].map((c) => node.max[c] - node.min[c]), ax = ext.indexOf(Math.max(...ext));
    const part = Array.from(order.subarray(start, end)).sort((a, b) => cen[a * 3 + ax] - cen[b * 3 + ax]);
    order.set(part, start);
    const mid = (start + end) >> 1;
    node.l = build(start, mid); node.r = build(mid, end);
    return node;
  })(0, nt);
  return { root: nodes[0], order };
}

// Nearest hit distance along d (unit) within maxT, or -1.
function raycast({ root, order }, P, I, o, d, maxT) {
  const inv = [1 / d[0], 1 / d[1], 1 / d[2]];
  let best = maxT, hit = false;
  const stack = [root];
  while (stack.length) {
    const n = stack.pop();
    let t0 = 0, t1 = best;
    for (let c = 0; c < 3; c++) {
      let a = (n.min[c] - o[c]) * inv[c], b = (n.max[c] - o[c]) * inv[c];
      if (a > b) { const x = a; a = b; b = x; }
      t0 = Math.max(t0, a); t1 = Math.min(t1, b);
    }
    if (t0 > t1) continue;
    if (n.l) { stack.push(n.l, n.r); continue; }
    for (let k = n.start; k < n.end; k++) {
      const t = order[k], ia = I[t * 3] * 3, ib = I[t * 3 + 1] * 3, ic = I[t * 3 + 2] * 3;
      const e1x = P[ib] - P[ia], e1y = P[ib + 1] - P[ia + 1], e1z = P[ib + 2] - P[ia + 2];
      const e2x = P[ic] - P[ia], e2y = P[ic + 1] - P[ia + 1], e2z = P[ic + 2] - P[ia + 2];
      const px = d[1] * e2z - d[2] * e2y, py = d[2] * e2x - d[0] * e2z, pz = d[0] * e2y - d[1] * e2x;
      const det = e1x * px + e1y * py + e1z * pz;
      if (Math.abs(det) < 1e-12) continue;
      const id = 1 / det, sx = o[0] - P[ia], sy = o[1] - P[ia + 1], sz = o[2] - P[ia + 2];
      const u = (sx * px + sy * py + sz * pz) * id;
      if (u < 0 || u > 1) continue;
      const qx = sy * e1z - sz * e1y, qy = sz * e1x - sx * e1z, qz = sx * e1y - sy * e1x;
      const v = (d[0] * qx + d[1] * qy + d[2] * qz) * id;
      if (v < 0 || u + v > 1) continue;
      const tt = (e2x * qx + e2y * qy + e2z * qz) * id;
      if (tt > 1e-5 && tt < best) { best = tt; hit = true; }
    }
  }
  return hit ? best : -1;
}

// ---------- GLB ----------
function writeGlb(file, P, Nr, I, AO) {
  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  for (let p = 0; p < P.length; p += 3) for (let c = 0; c < 3; c++) { min[c] = Math.min(min[c], P[p + c]); max[c] = Math.max(max[c], P[p + c]); }
  const bin = Buffer.concat([Buffer.from(P.buffer), Buffer.from(Nr.buffer), Buffer.from(AO.buffer), Buffer.from(I.buffer)]);
  const gltf = {
    asset: { version: "2.0", generator: "kmufti bust/makehuman.js (MakeHuman base mesh, CC0)" },
    scene: 0, scenes: [{ nodes: [0] }], nodes: [{ mesh: 0, name: "bust" }],
    meshes: [{ name: "bust", primitives: [{ attributes: { POSITION: 0, NORMAL: 1, _AO: 2 }, indices: 3 }] }],
    buffers: [{ byteLength: bin.length }],
    bufferViews: [
      { buffer: 0, byteOffset: 0, byteLength: P.byteLength, target: 34962 },
      { buffer: 0, byteOffset: P.byteLength, byteLength: Nr.byteLength, target: 34962 },
      { buffer: 0, byteOffset: P.byteLength + Nr.byteLength, byteLength: AO.byteLength, target: 34962 },
      { buffer: 0, byteOffset: P.byteLength + Nr.byteLength + AO.byteLength, byteLength: I.byteLength, target: 34963 },
    ],
    accessors: [
      { bufferView: 0, componentType: 5126, count: P.length / 3, type: "VEC3", min, max },
      { bufferView: 1, componentType: 5126, count: Nr.length / 3, type: "VEC3" },
      { bufferView: 2, componentType: 5126, count: AO.length, type: "SCALAR" },
      { bufferView: 3, componentType: 5125, count: I.length, type: "SCALAR" },
    ],
  };
  let json = Buffer.from(JSON.stringify(gltf));
  json = Buffer.concat([json, Buffer.alloc((4 - (json.length % 4)) % 4, 0x20)]);
  const binPad = Buffer.concat([bin, Buffer.alloc((4 - (bin.length % 4)) % 4)]);
  const header = Buffer.alloc(12);
  header.writeUInt32LE(0x46546c67, 0); header.writeUInt32LE(2, 4);
  header.writeUInt32LE(12 + 8 + json.length + 8 + binPad.length, 8);
  const chunk = (buf, type) => { const h = Buffer.alloc(8); h.writeUInt32LE(buf.length, 0); h.writeUInt32LE(type, 4); return Buffer.concat([h, buf]); };
  fs.writeFileSync(file, Buffer.concat([header, chunk(json, 0x4e4f534a), chunk(binPad, 0x004e4942)]));
  console.log(`${P.length / 3} vertices, ${I.length / 3} triangles, ${(max[1] - min[1]).toFixed(3)} m tall -> ${path.relative(process.cwd(), file)} (${(fs.statSync(file).size / 1e6).toFixed(2)} MB)`);
}

// ---------- Vectors ----------
function avg(ps) { const o = [0, 0, 0]; for (const p of ps) for (let k = 0; k < 3; k++) o[k] += p[k] / ps.length; return o; }
function mid(a, b) { return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2]; }
function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
function norm(a) { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }
