/* =========================================================================
   The bust's stone cutter, off the main thread. bust.js hands it the
   blocks once; after that each shot is a message (where the rock goes) and
   the reply says what changed:

     changed  the new geometry of every block the shot touched
     pieces   chunks the shot broke off: no longer joined to the plinth by
              any stone, so they fall (an ear, the nose, a whole head)
     left     how much of the stone is still standing, 0..1

   Every block is kept as a plain triangle soup: skin triangles first, then
   inside ones. Attributes: position, normal, _ao (baked occlusion), _rim
   (how near a crater's edge the skin is, for the chipped lip).

   Which pieces are still attached: each block is split into its connected
   parts, and two parts in neighbouring blocks are joined when their flat
   inside faces on the shared wall overlap. Whatever can't reach a part
   touching the base is loose.

   Bundled, so the worker needs no import map:
     npx esbuild bust/carve-worker.src.js --bundle --minify --format=esm --outfile=bust/carve-worker.js
   (with three@0.160.0 three-bvh-csg@0.0.17 three-mesh-bvh@0.7.8 installed
   where esbuild can find them)
   ========================================================================= */
import { BufferGeometry, BufferAttribute, IcosahedronGeometry, MeshBasicMaterial } from "three";
import { Brush, Evaluator, SUBTRACTION } from "three-bvh-csg";

const ATTRS = ["position", "normal", "_ao", "_rim"];
const SIZES = { position: 3, normal: 3, _ao: 1, _rim: 1 };
const RIM_W = 0.005;     // how far the chipped lip reaches from a crater's edge, metres
const S = 16;            // samples across a block wall, for the overlap test
const EPS = 3e-5;        // how close to a wall a face must lie to count as on it
const MIN_PIECE = 2e-7;  // m³ (0.2 cm³): anything looser and smaller is a CSG sliver, not a chunk
// Stone that's barely holding on breaks. A chunk joined to the rest only
// through thin links snaps off when their total area is less than it can
// bear: STRENGTH m² per m³ of what hangs from them (a head needs roughly a
// third of its neck), and never less than MIN_HOLD (a few square millimetres).
const STRENGTH = 0.35, MIN_HOLD = 6e-6, THIN = 3e-4;   // m²/m³, m², m² (a link under THIN counts as thin)

const skin = new MeshBasicMaterial(), inner = new MeshBasicMaterial();
const evaluator = new Evaluator();
evaluator.attributes = ATTRS;
evaluator.useGroups = true;

let originals = [], grid = null, blocks = [], neighbours = [], V0 = 1;
// which parts of two neighbouring blocks touch, kept until either changes:
// key -> { a, b, pairs: [partA, partB, ...] }
let links = new Map();

self.onmessage = ({ data: m }) => {
  if (m.type === "init") {
    originals = m.blocks;
    grid = m.grid;
    reset();
  } else if (m.type === "reset") {
    reset();
  } else if (m.type === "cut") {
    const out = cut(m);
    const transfer = [];
    for (const c of out.changed) if (c.arrays) transfer.push(...Object.values(c.arrays).map((a) => a.buffer));
    for (const p of out.pieces) transfer.push(...Object.values(p.arrays).map((a) => a.buffer));
    self.postMessage({ type: "cut", gen: m.gen, ...out }, transfer);
  }
};

// ---------- Blocks ----------
// A block: { soup, brush, box, cell, part } where soup = { a: {attr: Float32Array}, n, skinN }
// (n corners, the first skinN of them skin), and part is its connectivity.

function reset() {
  const cellIndex = new Map();
  blocks = originals.map((o, id) => {
    const idx = o.index, n = idx.length;
    const a = {};
    for (const k of ATTRS) a[k] = new Float32Array(n * SIZES[k]);
    for (let c = 0; c < n; c++) {
      const v = idx[c];
      for (let i = 0; i < 3; i++) { a.position[c * 3 + i] = o.position[v * 3 + i]; a.normal[c * 3 + i] = o.normal[v * 3 + i]; }
      a._ao[c] = o.ao[v];
    }
    cellIndex.set(o.cell.join(","), id);
    return block({ a, n, skinN: o.skinCount }, o.cell);
  });
  // each block's neighbour across its +x, +y, +z walls (-1 for none)
  neighbours = originals.map((o) => [0, 1, 2].map((ax) => {
    const c = o.cell.slice();
    c[ax]++;
    return cellIndex.get(c.join(",")) ?? -1;
  }));
  V0 = blocks.reduce((s, b) => s + b.vol, 0);
  links = new Map();
  self.postMessage({ type: "ready", loose: islands().length });
}

function block(soup, cell) {
  const g = new BufferGeometry();
  for (const k of ATTRS) g.setAttribute(k, new BufferAttribute(soup.a[k], SIZES[k]));
  g.addGroup(0, soup.skinN, 0);
  g.addGroup(soup.skinN, soup.n - soup.skinN, 1);
  const brush = new Brush(g, [skin, inner]);
  brush.updateMatrixWorld();
  g.computeBoundingBox();
  const b = { soup, brush, box: g.boundingBox, cell, vol: volume(soup) };
  b.part = parts(b);
  return b;
}

// Evaluator output -> soup, skin first.
function fromResult(res) {
  const g = res.geometry;
  const mats = Array.isArray(res.material) ? res.material : [res.material];
  const ranges = [[], []];
  for (const gr of g.groups) ranges[mats[gr.materialIndex] === inner ? 1 : 0].push([gr.start, gr.start + gr.count]);
  const n = ranges.flat().reduce((s, [a, b]) => s + b - a, 0);
  const a = {};
  for (const k of ATTRS) a[k] = new Float32Array(n * SIZES[k]);
  let o = 0, skinN = 0;
  for (let side = 0; side < 2; side++) {
    for (const [s0, s1] of ranges[side]) {
      for (const k of ATTRS) a[k].set(g.attributes[k].array.subarray(s0 * SIZES[k], s1 * SIZES[k]), o * SIZES[k]);
      o += s1 - s0;
    }
    if (side === 0) skinN = o;
  }
  return { a, n, skinN };
}

function pack(soup) {
  const arrays = {};
  for (const k of ATTRS) arrays[k] = soup.a[k].slice();
  return { arrays, skinN: soup.skinN, n: soup.n };
}

// ---------- The rock ----------
// An icosahedron with every corner pushed in or out, flat-shaded, so the
// crater it leaves is struck facets rather than a smooth scoop.
function rock({ position, quaternion, scale }) {
  const g = new IcosahedronGeometry(1, 1);
  g.deleteAttribute("uv");
  const p = g.attributes.position, jit = new Map();
  for (let i = 0; i < p.count; i++) {
    const k = `${p.getX(i).toFixed(3)},${p.getY(i).toFixed(3)},${p.getZ(i).toFixed(3)}`;
    if (!jit.has(k)) jit.set(k, 0.74 + Math.random() * 0.42);
    const s = jit.get(k);
    p.setXYZ(i, p.getX(i) * s, p.getY(i) * s, p.getZ(i) * s);
  }
  g.computeVertexNormals();   // non-indexed, so these come out per face: flat
  g.setAttribute("_ao", new BufferAttribute(new Float32Array(p.count).fill(1), 1));
  g.setAttribute("_rim", new BufferAttribute(new Float32Array(p.count), 1));
  const b = new Brush(g, inner);
  b.position.fromArray(position);
  b.quaternion.fromArray(quaternion);
  b.scale.fromArray(scale);
  b.updateMatrixWorld();
  g.computeBoundingBox();
  return { brush: b, bounds: g.boundingBox.clone().applyMatrix4(b.matrixWorld) };
}

// ---------- A shot ----------
function cut(m) {
  // one shot can be several rocks (a shotgun's pellets)
  const touched = new Set(), gone = new Set();
  let bounds = null;
  for (const spec of m.rocks) {
    const { brush, bounds: bb } = rock(spec);
    bounds = bounds ? bounds.union(bb) : bb;
    for (let id = 0; id < blocks.length; id++) {
      const b = blocks[id];
      if (!b || !bb.intersectsBox(b.box)) continue;
      const g = b.brush.geometry;
      if (!g.halfEdges) g.halfEdges = fastHalfEdges(g);
      const res = evaluator.evaluate(b.brush, brush, SUBTRACTION);
      const soup = fromResult(res);
      if (soup.n === 0) { blocks[id] = null; gone.add(id); touched.delete(id); continue; }
      blocks[id] = block(soup, b.cell);
      touched.add(id);
    }
    brush.geometry.dispose();
  }

  // the chipped lip: skin near the new crater edges, in the cut blocks and
  // any block close enough to reach
  const reach = bounds.clone().expandByScalar(RIM_W * 1.5);
  const near = [];
  for (let id = 0; id < blocks.length; id++) if (blocks[id] && reach.intersectsBox(blocks[id].box)) near.push(id);
  for (const id of rims([...touched], near, reach)) touched.add(id);

  // whatever no longer reaches the base breaks off; slivers just go
  const pieces = [];
  for (const isl of islands()) {
    const v = isl.reduce((s, [id, p]) => s + blocks[id].part.vol[p], 0);
    const piece = breakOff(isl);
    if (v >= MIN_PIECE && piece.n >= 60) pieces.push(piece);   // a real chunk, not a few loose faces
    for (const [id] of isl) {
      if (blocks[id]) touched.add(id);
      else { touched.delete(id); gone.add(id); }
    }
  }

  const changed = [...gone].map((id) => ({ id, gone: true }));
  for (const id of touched) if (blocks[id]) changed.push({ id, ...pack(blocks[id].soup) });
  const left = blocks.reduce((s, b) => s + (b ? b.vol : 0), 0) / V0;
  return { changed, pieces, left };
}

// ---------- Rims ----------
// Crater edges are where skin meets rock-cut faces (not the flat walls
// between blocks). Every skin corner within RIM_W of one gets marked.
function rims(cutIds, nearIds, reach) {
  const pts = [], H = RIM_W, hash = new Map();
  for (const id of cutIds) {
    const { soup, part } = blocks[id];
    const usedSkin = new Uint8Array(part.nIds), usedRock = new Uint8Array(part.nIds);
    for (let t = 0; t < soup.n / 3; t++) {
      const isSkin = t * 3 < soup.skinN;
      if (!isSkin && part.wallOf[t] >= 0) continue;
      for (let k = 0; k < 3; k++) (isSkin ? usedSkin : usedRock)[part.corner[t * 3 + k]] = 1;
    }
    const seen = new Uint8Array(part.nIds);
    for (let c = 0; c < soup.n; c++) {
      const v = part.corner[c];
      if (!usedSkin[v] || !usedRock[v] || seen[v]) continue;
      seen[v] = 1;
      pts.push(soup.a.position[c * 3], soup.a.position[c * 3 + 1], soup.a.position[c * 3 + 2]);
    }
  }
  if (!pts.length) return [];
  // buckets keyed by a hash of the cell (a collision just shares a bucket;
  // every candidate is still distance-checked)
  const key = (x, y, z) => (Math.imul(x, 73856093) ^ Math.imul(y, 19349663) ^ Math.imul(z, 83492791)) | 0;
  for (let i = 0; i < pts.length; i += 3) {
    const k = key(Math.floor(pts[i] / H), Math.floor(pts[i + 1] / H), Math.floor(pts[i + 2] / H));
    if (!hash.has(k)) hash.set(k, []);
    hash.get(k).push(i);
  }
  const changed = [];
  for (const id of nearIds) {
    const { soup } = blocks[id];
    const P = soup.a.position, R = soup.a._rim;
    let any = false;
    const { min, max } = reach;
    for (let c = 0; c < soup.skinN; c++) {
      const x = P[c * 3], y = P[c * 3 + 1], z = P[c * 3 + 2];
      if (x < min.x || x > max.x || y < min.y || y > max.y || z < min.z || z > max.z) continue;
      const cx = Math.floor(x / H), cy = Math.floor(y / H), cz = Math.floor(z / H);
      let best = H * H;
      for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) for (let dz = -1; dz <= 1; dz++) {
        const list = hash.get(key(cx + dx, cy + dy, cz + dz));
        if (!list) continue;
        for (const i of list) {
          const d = (pts[i] - x) ** 2 + (pts[i + 1] - y) ** 2 + (pts[i + 2] - z) ** 2;
          if (d < best) best = d;
        }
      }
      if (best >= H * H) continue;
      const r = 1 - Math.sqrt(best) / H;
      if (r > R[c]) { R[c] = r; any = true; }
    }
    if (any) {
      blocks[id].brush.geometry.attributes._rim.needsUpdate = true;
      changed.push(id);
    }
  }
  return changed;
}

// ---------- Connectivity ----------
// parts(b): split a block into connected parts, and note, for each of its
// six walls, which part covers each sample point on it.
function parts(b) {
  const { soup, cell } = b, P = soup.a.position, tris = soup.n / 3;
  // weld corners by position
  let size = 1;
  while (size < soup.n * 2) size <<= 1;
  const qx = new Int32Array(size), qy = new Int32Array(size), qz = new Int32Array(size), slot = new Int32Array(size).fill(-1);
  const corner = new Int32Array(soup.n);
  let nIds = 0;
  for (let c = 0; c < soup.n; c++) {
    const x = Math.round(P[c * 3] * 1e5), y = Math.round(P[c * 3 + 1] * 1e5), z = Math.round(P[c * 3 + 2] * 1e5);
    let h = (Math.imul(x, 73856093) ^ Math.imul(y, 19349663) ^ Math.imul(z, 83492791)) & (size - 1);
    while (slot[h] !== -1 && (qx[h] !== x || qy[h] !== y || qz[h] !== z)) h = (h + 1) & (size - 1);
    if (slot[h] === -1) { slot[h] = nIds++; qx[h] = x; qy[h] = y; qz[h] = z; }
    corner[c] = slot[h];
  }
  // union the corners of each triangle
  const up = new Int32Array(nIds).map((_, i) => i);
  const find = (i) => { while (up[i] !== i) i = up[i] = up[up[i]]; return i; };
  for (let t = 0; t < tris; t++) {
    const a = find(corner[t * 3]);
    up[find(corner[t * 3 + 1])] = a;
    up[find(corner[t * 3 + 2])] = find(corner[t * 3]);
  }
  const label = new Map(), partOf = new Int32Array(tris);
  for (let t = 0; t < tris; t++) {
    const r = find(corner[t * 3]);
    if (!label.has(r)) label.set(r, label.size);
    partOf[t] = label.get(r);
  }
  const count = label.size, grounded = new Uint8Array(count), vol = new Float64Array(count);
  // signed volume per part: a hollow left inside a block by a cut is its
  // own part, but inward-facing (negative): it belongs to the stone around it
  for (let t = 0; t < tris; t++) {
    const i = t * 9;
    vol[partOf[t]] += (P[i] * (P[i + 4] * P[i + 8] - P[i + 5] * P[i + 7])
      - P[i + 1] * (P[i + 3] * P[i + 8] - P[i + 5] * P[i + 6])
      + P[i + 2] * (P[i + 3] * P[i + 7] - P[i + 4] * P[i + 6])) / 6;
  }
  const ground = grid.gridMin[1] + 5e-4;
  for (let t = 0; t < tris; t++) {
    if (grounded[partOf[t]]) continue;
    for (let k = 0; k < 3; k++) if (P[(t * 3 + k) * 3 + 1] < ground) { grounded[partOf[t]] = 1; break; }
  }
  // walls: 0 -x, 1 +x, 2 -y, 3 +y, 4 -z, 5 +z
  const lo = cell.map((c, k) => grid.gridMin[k] + c * grid.cell);
  const wallOf = new Int8Array(tris).fill(-1);
  const walls = Array.from({ length: 6 }, () => ({ samples: new Int32Array(S * S).fill(-1), tris: [], area: new Map() }));
  const UV = [[1, 2], [1, 2], [0, 2], [0, 2], [0, 1], [0, 1]];
  for (let t = soup.skinN / 3; t < tris; t++) {
    for (let w = 0; w < 6; w++) {
      const ax = w >> 1, plane = lo[ax] + (w & 1) * grid.cell;
      let on = true;
      for (let k = 0; k < 3; k++) if (Math.abs(P[(t * 3 + k) * 3 + ax] - plane) > EPS) { on = false; break; }
      if (!on) continue;
      wallOf[t] = w;
      const [ua, va] = UV[w];
      const tri = [0, 1, 2].map((k) => [(P[(t * 3 + k) * 3 + ua] - lo[ua]) / grid.cell, (P[(t * 3 + k) * 3 + va] - lo[va]) / grid.cell]);
      walls[w].tris.push({ tri, part: partOf[t] });
      const a2 = Math.abs((tri[1][0] - tri[0][0]) * (tri[2][1] - tri[0][1]) - (tri[2][0] - tri[0][0]) * (tri[1][1] - tri[0][1])) / 2 * grid.cell * grid.cell;
      walls[w].area.set(partOf[t], (walls[w].area.get(partOf[t]) || 0) + a2);
      // mark the sample points it covers
      const minU = Math.max(0, Math.floor(Math.min(tri[0][0], tri[1][0], tri[2][0]) * S - 0.5));
      const maxU = Math.min(S - 1, Math.ceil(Math.max(tri[0][0], tri[1][0], tri[2][0]) * S - 0.5));
      const minV = Math.max(0, Math.floor(Math.min(tri[0][1], tri[1][1], tri[2][1]) * S - 0.5));
      const maxV = Math.min(S - 1, Math.ceil(Math.max(tri[0][1], tri[1][1], tri[2][1]) * S - 0.5));
      for (let i = minU; i <= maxU; i++) for (let j = minV; j <= maxV; j++) {
        if (inTri((i + 0.5) / S, (j + 0.5) / S, tri)) walls[w].samples[i * S + j] = partOf[t];
      }
      break;
    }
  }
  // what a part weighs, for whether it can hang: its volume, but no more
  // than its bounding box (a part that's open where it meets a block wall
  // has a meaningless signed volume)
  const bmin = new Float64Array(count * 3).fill(Infinity), bmax = new Float64Array(count * 3).fill(-Infinity);
  for (let t = 0; t < tris; t++) {
    const q = partOf[t] * 3;
    for (let k = 0; k < 3; k++) for (let c = 0; c < 3; c++) {
      const v = P[(t * 3 + k) * 3 + c];
      if (v < bmin[q + c]) bmin[q + c] = v;
      if (v > bmax[q + c]) bmax[q + c] = v;
    }
  }
  const weight = new Float64Array(count);
  for (let q = 0; q < count; q++) {
    const box = (bmax[q * 3] - bmin[q * 3]) * (bmax[q * 3 + 1] - bmin[q * 3 + 1]) * (bmax[q * 3 + 2] - bmin[q * 3 + 2]);
    weight[q] = Math.min(Math.abs(vol[q]), box);
  }
  return { corner, nIds, partOf, count, grounded, vol, weight, wallOf, walls };
}

function inTri(u, v, [a, b, c]) {
  const d1 = (u - b[0]) * (a[1] - b[1]) - (a[0] - b[0]) * (v - b[1]);
  const d2 = (u - c[0]) * (b[1] - c[1]) - (b[0] - c[0]) * (v - c[1]);
  const d3 = (u - a[0]) * (c[1] - a[1]) - (c[0] - a[0]) * (v - a[1]);
  return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0));
}

// Every loose island: a list of [blockId, part] that together reach no base.
function islands() {
  const offset = new Int32Array(blocks.length + 1);
  for (let id = 0; id < blocks.length; id++) offset[id + 1] = offset[id] + (blocks[id] ? blocks[id].part.count : 0);
  const N = offset[blocks.length], up = new Int32Array(N).map((_, i) => i), ground = new Uint8Array(N);
  const find = (i) => { while (up[i] !== i) i = up[i] = up[up[i]]; return i; };
  const join = (a, b) => { a = find(a); b = find(b); if (a !== b) up[b] = a; };
  // the same again, over thick links only, to find what's hanging by threads
  const upS = new Int32Array(N).map((_, i) => i);
  const findS = (i) => { while (upS[i] !== i) i = upS[i] = upS[upS[i]]; return i; };
  const joinStrong = (a, b) => { a = findS(a); b = findS(b); if (a !== b) upS[b] = a; };
  const edges = [], vol = new Float64Array(N), where = [];
  for (let id = 0; id < blocks.length; id++) {
    const b = blocks[id];
    if (!b) continue;
    // held: touching the base, or a hollow left inside a block (which never
    // falls by itself). A flat sliver holds nothing up: it goes with
    // whatever it's stuck to, or on its own if it's stuck to nothing.
    for (let p = 0; p < b.part.count; p++) {
      if (b.part.grounded[p] || b.part.vol[p] < -MIN_PIECE / 20) ground[offset[id] + p] = 1;
      vol[offset[id] + p] = b.part.vol[p] > 0 ? b.part.weight[p] : 0;
      where[offset[id] + p] = [id, p];
    }
    // join across the +x, +y, +z walls to the neighbour's opposite wall
    for (let ax = 0; ax < 3; ax++) {
      const nid = neighbours[id][ax];
      const nb = nid >= 0 ? blocks[nid] : null;
      if (!nb) continue;
      const k = id * 4096 + nid;
      let L = links.get(k);
      if (!L || L.a !== b || L.b !== nb) links.set(k, (L = { a: b, b: nb, pairs: touching(b.part.walls[ax * 2 + 1], nb.part.walls[ax * 2]) }));
      for (let i = 0; i < L.pairs.length; i += 3) {
        const a = offset[id] + L.pairs[i], c = offset[nid] + L.pairs[i + 1], area = L.pairs[i + 2];
        join(a, c);
        edges.push(a, c, area);
        if (area >= THIN) joinStrong(a, c);
      }
    }
  }
  const rootGround = new Uint8Array(N), strongGround = new Uint8Array(N);
  for (let i = 0; i < N; i++) if (ground[i]) { rootGround[find(i)] = 1; strongGround[findS(i)] = 1; }
  const loose = new Map(), out = [];
  // 1. truly loose: no stone at all joins it to the base
  for (let i = 0; i < N; i++) {
    const r = find(i);
    if (rootGround[r]) continue;
    if (!loose.has(r)) loose.set(r, []);
    loose.get(r).push(where[i]);
  }
  out.push(...loose.values());
  // 2. hanging by threads: grounded overall, but not through thick links.
  // Each such group breaks if its thin links can't bear its weight.
  const groups = new Map();
  for (let i = 0; i < N; i++) {
    if (!rootGround[find(i)]) continue;
    const r = findS(i);
    if (strongGround[r]) continue;
    if (!groups.has(r)) groups.set(r, { nodes: [], vol: 0, hold: 0 });
    const g = groups.get(r);
    g.nodes.push(i);
    g.vol += vol[i];
  }
  if (groups.size) {
    for (let e = 0; e < edges.length; e += 3) {
      const ra = findS(edges[e]), rb = findS(edges[e + 1]);
      if (ra === rb) continue;
      if (groups.has(ra)) groups.get(ra).hold += edges[e + 2];
      if (groups.has(rb)) groups.get(rb).hold += edges[e + 2];
    }
    for (const g of groups.values()) {
      if (g.vol < MIN_PIECE) continue;   // slivers: not worth dropping
      if (g.hold < Math.max(MIN_HOLD, g.vol * STRENGTH)) out.push(g.nodes.map((i) => where[i]));
    }
  }
  return out;
}

// Which parts on wall A (one block) touch which on wall B (its neighbour's
// facing wall), and over how much area: flat triples [partA, partB, m², ...].
// The area is from the sample points they share; a touch too narrow for
// any sample takes the smaller of the two parts' faces on the wall (both
// sides are the same slice through the stone, so where they meet they match).
function touching(A, B) {
  const at = new Map(), pairs = [];
  const add = (a, b, n) => { const k = a * 65536 + b; at.set(k, (at.get(k) || 0) + n); };
  if (!A.tris.length || !B.tris.length) return pairs;
  for (let s = 0; s < S * S; s++) if (A.samples[s] >= 0 && B.samples[s] >= 0) add(A.samples[s], B.samples[s], 1);
  // parts too thin for any sample: test their faces' centres against the
  // other side (only theirs, so busy walls stay cheap)
  const linkedA = new Set(), linkedB = new Set();
  for (const k of at.keys()) { linkedA.add(Math.floor(k / 65536)); linkedB.add(k % 65536); }
  const centre = (t) => [(t[0][0] + t[1][0] + t[2][0]) / 3, (t[0][1] + t[1][1] + t[2][1]) / 3];
  for (const ta of A.tris) {
    if (linkedA.has(ta.part)) continue;
    const [u, v] = centre(ta.tri);
    for (const tb of B.tris) if (inTri(u, v, tb.tri)) { add(ta.part, tb.part, 0); break; }
  }
  for (const tb of B.tris) {
    if (linkedB.has(tb.part)) continue;
    const [u, v] = centre(tb.tri);
    for (const ta of A.tris) if (inTri(u, v, ta.tri)) { add(ta.part, tb.part, 0); break; }
  }
  const sampleArea = (grid.cell / S) ** 2;
  for (const [k, n] of at) {
    const a = Math.floor(k / 65536), b = k % 65536;
    const faces = Math.min(A.area.get(a) || 0, B.area.get(b) || 0);
    pairs.push(a, b, n > 0 ? n * sampleArea : faces);
  }
  return pairs;
}

// Take an island's triangles out of its blocks and hand them back as one
// piece (skin first, then inside), with its centre.
function breakOff(isl) {
  const byBlock = new Map();
  for (const [id, p] of isl) { if (!byBlock.has(id)) byBlock.set(id, new Set()); byBlock.get(id).add(p); }
  const take = [[], []];   // [soup, triangle] for skin, then inside
  for (const [id, ps] of byBlock) {
    const b = blocks[id], { soup, part } = b;
    const keep = [];
    for (let t = 0; t < soup.n / 3; t++) {
      if (ps.has(part.partOf[t])) take[t * 3 < soup.skinN ? 0 : 1].push([soup, t]);
      else keep.push(t);
    }
    if (!keep.length) { blocks[id] = null; continue; }
    const a = {};
    for (const k of ATTRS) a[k] = new Float32Array(keep.length * 3 * SIZES[k]);
    let skinN = 0;
    keep.forEach((t, i) => {
      for (const k of ATTRS) a[k].set(soup.a[k].subarray(t * 3 * SIZES[k], (t + 1) * 3 * SIZES[k]), i * 3 * SIZES[k]);
      if (t * 3 < soup.skinN) skinN += 3;
    });
    blocks[id] = block({ a, n: keep.length * 3, skinN }, b.cell);
  }
  const n = (take[0].length + take[1].length) * 3, arrays = {};
  for (const k of ATTRS) arrays[k] = new Float32Array(n * SIZES[k]);
  let i = 0;
  for (const side of take) for (const [soup, t] of side) {
    for (const k of ATTRS) arrays[k].set(soup.a[k].subarray(t * 3 * SIZES[k], (t + 1) * 3 * SIZES[k]), i * 3 * SIZES[k]);
    i++;
  }
  const c = [0, 0, 0];
  for (let v = 0; v < n; v++) for (let k = 0; k < 3; k++) c[k] += arrays.position[v * 3 + k] / n;
  return { arrays, skinN: take[0].length * 3, n, center: c };
}

function volume(soup) {
  const P = soup.a.position;
  let v = 0;
  for (let t = 0; t < soup.n / 3; t++) {
    const i = t * 9;
    v += P[i] * (P[i + 4] * P[i + 8] - P[i + 5] * P[i + 7])
       - P[i + 1] * (P[i + 3] * P[i + 8] - P[i + 5] * P[i + 6])
       + P[i + 2] * (P[i + 3] * P[i + 7] - P[i + 4] * P[i + 6]);
  }
  return v / 6;
}

// Which triangle sits across each edge, for the CSG's flood fill over the
// triangles a cut doesn't touch. three-bvh-csg builds this with string keys
// per edge, which was most of the cost of a shot; this does the same with
// numbers. Corners are matched by position (to 10 microns), not by index,
// because a cut's output is an unindexed soup of triangles.
// Only getSiblingTriangleIndex is used by the cut itself.
function fastHalfEdges(geometry) {
  const pos = geometry.attributes.position, idx = geometry.index ? geometry.index.array : null;
  const tris = (idx ? idx.length : pos.count) / 3;
  // corner -> vertex id, through an open-addressed table on quantized xyz
  let size = 1;
  while (size < tris * 6) size <<= 1;
  const qx = new Int32Array(size), qy = new Int32Array(size), qz = new Int32Array(size), slot = new Int32Array(size).fill(-1);
  const corner = new Int32Array(tris * 3), arr = pos.array;
  let n = 0;
  for (let c = 0; c < tris * 3; c++) {
    const v = (idx ? idx[c] : c) * 3;
    const x = Math.round(arr[v] * 1e5), y = Math.round(arr[v + 1] * 1e5), z = Math.round(arr[v + 2] * 1e5);
    let h = (Math.imul(x, 73856093) ^ Math.imul(y, 19349663) ^ Math.imul(z, 83492791)) & (size - 1);
    while (slot[h] !== -1 && (qx[h] !== x || qy[h] !== y || qz[h] !== z)) h = (h + 1) & (size - 1);
    if (slot[h] === -1) { slot[h] = n++; qx[h] = x; qy[h] = y; qz[h] = z; }
    corner[c] = slot[h];
  }
  const open = new Map(), data = new Int32Array(tris * 3).fill(-1);
  for (let t = 0; t < tris; t++) for (let e = 0; e < 3; e++) {
    const a = corner[t * 3 + e], b = corner[t * 3 + (e + 1) % 3];
    const back = open.get(b * n + a);
    if (back !== undefined) { data[t * 3 + e] = back; data[back] = t * 3 + e; open.delete(b * n + a); }
    else open.set(a * n + b, t * 3 + e);
  }
  return {
    data,
    getSiblingTriangleIndex(t, e) { const o = data[t * 3 + e]; return o === -1 ? -1 : (o / 3) | 0; },
    getSiblingEdgeIndex(t, e) { const o = data[t * 3 + e]; return o === -1 ? -1 : o % 3; },
  };
}
