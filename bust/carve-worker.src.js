/* =========================================================================
   The bust's stone cutter, off the main thread. bust.js hands it the
   blocks once; after that each shot is a message (where the rock goes) and
   the reply is the new geometry of every block the rock reached.

   Bundled, so the worker needs no import map:
     npx esbuild bust/carve-worker.src.js --bundle --minify --format=esm --outfile=bust/carve-worker.js
   (with three@0.160.0 three-bvh-csg@0.0.17 three-mesh-bvh@0.7.8 installed
   where esbuild can find them)
   ========================================================================= */
import { BufferGeometry, BufferAttribute, IcosahedronGeometry, MeshBasicMaterial } from "three";
import { Brush, Evaluator, SUBTRACTION } from "three-bvh-csg";

const skin = new MeshBasicMaterial(), inner = new MeshBasicMaterial();
const evaluator = new Evaluator();
evaluator.attributes = ["position", "normal", "_ao"];
evaluator.useGroups = true;

let originals = [], blocks = [];   // blocks[id]: { brush, box: [min xyz, max xyz] } or null once carved away

self.onmessage = ({ data: m }) => {
  if (m.type === "init") {
    originals = m.blocks;
    reset();
  } else if (m.type === "reset") {
    reset();
  } else if (m.type === "cut") {
    const changed = cut(m);
    self.postMessage({ type: "cut", changed, gen: m.gen }, changed.flatMap((c) => c.arrays ? Object.values(c.arrays).map((a) => a.buffer) : []));
  }
};

function reset() {
  blocks = originals.map((o) => {
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(o.position.slice(), 3));
    g.setAttribute("normal", new BufferAttribute(o.normal.slice(), 3));
    g.setAttribute("_ao", new BufferAttribute(o.ao.slice(), 1));
    g.setIndex(new BufferAttribute(o.index.slice(), 1));
    g.addGroup(0, o.skinCount, 0);
    g.addGroup(o.skinCount, o.index.length - o.skinCount, 1);
    return block(g, [skin, inner]);
  });
}

function block(g, material) {
  const brush = new Brush(g, material);
  brush.updateMatrixWorld();
  g.computeBoundingBox();
  return { brush, box: g.boundingBox };
}

// A rock: an icosahedron with every corner pushed in or out, flat-shaded,
// so the crater it leaves is struck facets rather than a smooth scoop.
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
  const b = new Brush(g, inner);
  b.position.fromArray(position);
  b.quaternion.fromArray(quaternion);
  b.scale.fromArray(scale);
  b.updateMatrixWorld();
  g.computeBoundingBox();
  return { brush: b, bounds: g.boundingBox.clone().applyMatrix4(b.matrixWorld) };
}

function cut(m) {
  const { brush, bounds } = rock(m);
  const changed = [];
  for (let id = 0; id < blocks.length; id++) {
    const b = blocks[id];
    if (!b || !bounds.intersectsBox(b.box)) continue;
    if (!b.brush.geometry.halfEdges) b.brush.geometry.halfEdges = fastHalfEdges(b.brush.geometry);
    const res = evaluator.evaluate(b.brush, brush, SUBTRACTION);
    const g = res.geometry;
    if (!g.attributes.position || g.attributes.position.count === 0) {
      blocks[id] = null;
      changed.push({ id, gone: true });
      continue;
    }
    res.updateMatrixWorld();
    blocks[id] = { brush: res, box: (g.computeBoundingBox(), g.boundingBox) };
    // groups refer to res.material; map them to 0 = skin, 1 = inside
    const mats = Array.isArray(res.material) ? res.material : [res.material];
    const groups = g.groups.map((gr) => [gr.start, gr.count, mats[gr.materialIndex] === inner ? 1 : 0]);
    changed.push({
      id, groups,
      arrays: {
        position: g.attributes.position.array.slice(0, g.attributes.position.count * 3),
        normal: g.attributes.normal.array.slice(0, g.attributes.normal.count * 3),
        ao: g.attributes._ao.array.slice(0, g.attributes._ao.count),
      },
    });
  }
  return changed;
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
