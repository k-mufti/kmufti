/* =========================================================================
   Cuts the bust into small solid blocks, so a shot can be carved out of it
   with real CSG (three-bvh-csg) fast enough to hold the trigger down.

     node bust/makehuman.js      -> bust/model/head.glb
     node bust/chunk.mjs         -> bust/model/bust.glb
     npx @gltf-transform/cli@4 draco bust/model/bust.glb bust/model/bust.glb
                                    (Draco: ~6.9 MB -> ~2.4 MB; each block's
                                    skin and inside are separate primitives,
                                    so Draco's reordering can't mix them)

   Needs three, three-bvh-csg and three-mesh-bvh where Node can find them
   (versions to match bust.js: three@0.160.0 three-bvh-csg@0.0.17
   three-mesh-bvh@0.7.8), e.g. `npm i --no-save` them in the repo root.

   Carving the whole 157k-triangle bust costs ~0.5 s a shot, nearly all of
   it re-preparing the full mesh afterwards. A block is a few thousand
   triangles and costs a few ms, and a shot only ever touches a handful.
   Each block is the bust intersected with a box, so it's closed: its box
   faces are the "inside" material (group 1) and its skin is group 0.
   Inside faces between two solid blocks sit back to back and are never
   seen; once a neighbour is carved away they're exactly the stone's broken
   face, so the cuts stay correct right across block boundaries.

   The eyeballs are separate globes sunk into the head; they're merged in
   first so the bust is one solid.

   Shipped quantized (KHR_mesh_quantization) to keep the file small:
   positions are 16-bit across each block's own box (sub-micron steps), and
   normals 16-bit, occlusion 8-bit, indices 16-bit where they fit. bust.js
   turns them back into floats on load.
   ========================================================================= */
import * as THREE from "three";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { Brush, Evaluator, ADDITION, INTERSECTION } from "three-bvh-csg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const DIR = path.dirname(fileURLToPath(import.meta.url));
const IN = path.join(DIR, "model", "head.glb"), OUT = path.join(DIR, "model", "bust.glb");
const CELL = 0.04;    // block size, metres

// ---------- Read head.glb (written by makehuman.js: one primitive) ----------
const glb = fs.readFileSync(IN);
const jl = glb.readUInt32LE(12), J = JSON.parse(glb.slice(20, 20 + jl)), BIN = glb.slice(20 + jl + 8);
const acc = (i, T) => {
  const v = J.bufferViews[J.accessors[i].bufferView];
  return new T(BIN.buffer.slice(BIN.byteOffset + v.byteOffset, BIN.byteOffset + v.byteOffset + v.byteLength));
};
const attrs = J.meshes[0].primitives[0].attributes;
const src = new THREE.BufferGeometry();
src.setAttribute("position", new THREE.BufferAttribute(acc(attrs.POSITION, Float32Array), 3));
src.setAttribute("normal", new THREE.BufferAttribute(acc(attrs.NORMAL, Float32Array), 3));
src.setAttribute("_ao", new THREE.BufferAttribute(acc(attrs._AO, Float32Array), 1));
src.setIndex(new THREE.BufferAttribute(acc(J.meshes[0].primitives[0].indices, Uint32Array), 1));

// ---------- Split off the eyeballs (small connected pieces) and merge them in ----------
const { head, eyes } = splitSmall(src, 0.06);
const skin = new THREE.MeshBasicMaterial(), inner = new THREE.MeshBasicMaterial();
const ev = new Evaluator();
ev.attributes = ["position", "normal", "_ao"];
ev.useGroups = true;
let t = performance.now();
let bust = brush(head, skin);
for (const e of eyes) bust = ev.evaluate(bust, brush(e, skin), ADDITION);
console.log(`eyes merged in ${((performance.now() - t) / 1000).toFixed(1)} s`);

// ---------- Blocks ----------
bust.geometry.computeBoundingBox();
const bb = bust.geometry.boundingBox;
const n = [0, 1, 2].map((k) => Math.ceil((bb.max.getComponent(k) - bb.min.getComponent(k)) / CELL));
const blocks = [];
t = performance.now();
for (let z = 0; z < n[2]; z++) for (let y = 0; y < n[1]; y++) for (let x = 0; x < n[0]; x++) {
  const box = new THREE.BoxGeometry(CELL, CELL, CELL);
  box.deleteAttribute("uv");
  box.setAttribute("_ao", new THREE.BufferAttribute(new Float32Array(box.attributes.position.count).fill(1), 1));
  const b = brush(box, inner);
  b.position.set(bb.min.x + (x + 0.5) * CELL, bb.min.y + (y + 0.5) * CELL, bb.min.z + (z + 0.5) * CELL);
  b.updateMatrixWorld();
  const r = ev.evaluate(bust, b, INTERSECTION);
  const g = r.geometry;
  if (!g.attributes.position || g.attributes.position.count === 0) continue;
  // groups come out keyed by material; put skin first, inside second
  const mats = Array.isArray(r.material) ? r.material : [r.material];
  const tris = { 0: [], 1: [] };
  for (const gr of g.groups.length ? g.groups : [{ start: 0, count: g.attributes.position.count, materialIndex: 0 }]) {
    const which = mats[gr.materialIndex] === inner ? 1 : 0;
    for (let i = gr.start; i < gr.start + gr.count; i++) tris[which].push(i);
  }
  const order = [...tris[0], ...tris[1]];
  const flat = new THREE.BufferGeometry();
  for (const name of ev.attributes) {
    const a = g.attributes[name], o = new Float32Array(order.length * a.itemSize);
    order.forEach((v, k) => { for (let c = 0; c < a.itemSize; c++) o[k * a.itemSize + c] = a.array[v * a.itemSize + c]; });
    flat.setAttribute(name, new THREE.BufferAttribute(o, a.itemSize));
  }
  // weld, so it ships indexed; welding keeps the skin/inside split since
  // their normals differ
  const welded = mergeVertices(flat, 1e-6);
  const skinIdx = tris[0].length;   // indices are in the same triangle order
  blocks.push({ g: welded, skinCount: skinIdx, cell: [x, y, z] });
}
console.log(`${blocks.length} blocks in ${((performance.now() - t) / 1000).toFixed(1)} s`);
writeGlb(OUT, blocks, { gridMin: bb.min.toArray(), cell: CELL });

// ---------- helpers ----------
function brush(g, m) { const b = new Brush(g, m); b.updateMatrixWorld(); return b; }

function splitSmall(geo, maxSize) {
  const pos = geo.attributes.position, idx = geo.index.array, nv = pos.count;
  const parent = new Int32Array(nv).map((_, i) => i);
  const find = (i) => { while (parent[i] !== i) i = parent[i] = parent[parent[i]]; return i; };
  for (let k = 0; k < idx.length; k += 3) { const a = find(idx[k]); parent[find(idx[k + 1])] = a; parent[find(idx[k + 2])] = a; }
  const box = new Map();
  for (let i = 0; i < nv; i++) {
    const r = find(i);
    if (!box.has(r)) box.set(r, new THREE.Box3());
    box.get(r).expandByPoint(new THREE.Vector3().fromBufferAttribute(pos, i));
  }
  const small = (r) => { const s = box.get(r).getSize(new THREE.Vector3()); return Math.max(s.x, s.y, s.z) < maxSize; };
  const headTris = [], eyeTris = new Map();
  for (let k = 0; k < idx.length; k += 3) {
    const r = find(idx[k]);
    if (small(r)) { if (!eyeTris.has(r)) eyeTris.set(r, []); eyeTris.get(r).push(idx[k], idx[k + 1], idx[k + 2]); }
    else headTris.push(idx[k], idx[k + 1], idx[k + 2]);
  }
  const make = (tri) => { const g = geo.clone(); g.setIndex(tri); return g; };
  return { head: make(headTris), eyes: [...eyeTris.values()].map(make) };
}

function writeGlb(file, blocks, grid) {
  const parts = [], views = [], accessors = [], nodes = [], meshes = [];
  let off = 0;
  const add = (arr, target, type, comp, extra) => {
    const buf = Buffer.from(arr.buffer, arr.byteOffset, arr.byteLength);
    const stride = { VEC3: 3, SCALAR: 1 }[type] * arr.BYTES_PER_ELEMENT;
    // vertex attributes need each element 4-byte aligned: pad VEC3 shorts to 4
    views.push({ buffer: 0, byteOffset: off, byteLength: buf.length, target, ...(extra?.byteStride ? { byteStride: extra.byteStride } : {}) });
    parts.push(buf, Buffer.alloc((4 - (buf.length % 4)) % 4));
    off += buf.length + ((4 - (buf.length % 4)) % 4);
    const a = { bufferView: views.length - 1, componentType: comp, count: extra?.count ?? arr.length / ({ VEC3: 3, SCALAR: 1 })[type], type };
    if (extra?.normalized) a.normalized = true;
    if (extra?.min) { a.min = extra.min; a.max = extra.max; }
    accessors.push(a);
    void stride;
    return accessors.length - 1;
  };
  let tris = 0;
  for (const { g, skinCount, cell } of blocks) {
    g.computeBoundingBox();
    const lo = g.boundingBox.min.toArray(), size = g.boundingBox.getSize(new THREE.Vector3()).toArray().map((v) => v || 1e-6);
    const p = g.attributes.position.array, nr = g.attributes.normal.array, ao = g.attributes._ao.array, n = p.length / 3;
    // positions: 0..65535 over the block's box, normalized unsigned short, padded to 4 per vertex
    const P = new Uint16Array(n * 4), N = new Int16Array(n * 4), A = new Uint8Array(n * 4);
    for (let i = 0; i < n; i++) {
      for (let c = 0; c < 3; c++) {
        P[i * 4 + c] = Math.round(((p[i * 3 + c] - lo[c]) / size[c]) * 65535);
        N[i * 4 + c] = Math.round(Math.max(-1, Math.min(1, nr[i * 3 + c])) * 32767);
      }
      A[i * 4] = Math.round(Math.max(0, Math.min(1, ao[i])) * 255);
    }
    const PA = add(P, 34962, "VEC3", 5123, { byteStride: 8, count: n, normalized: true, min: [0, 0, 0], max: [1, 1, 1] });
    const NA = add(N, 34962, "VEC3", 5122, { byteStride: 8, count: n, normalized: true });
    const AA = add(A, 34962, "SCALAR", 5121, { byteStride: 4, count: n, normalized: true });
    // skin and inside as two primitives: Draco reorders triangles, so the
    // split has to be structural, not an index range
    const idx = g.index.array, small = n <= 65535, primitives = [];
    for (const [part, a, b] of [["skin", 0, skinCount], ["inner", skinCount, idx.length]]) {
      if (b <= a) continue;
      const sub = idx.subarray(a, b);
      const IA = add(small ? new Uint16Array(sub) : new Uint32Array(sub), 34963, "SCALAR", small ? 5123 : 5125);
      primitives.push({ attributes: { POSITION: PA, NORMAL: NA, _AO: AA }, indices: IA, extras: { part } });
    }
    tris += idx.length / 3;
    meshes.push({ primitives });
    nodes.push({ mesh: meshes.length - 1, extras: { lo, size, cell } });
  }
  const bin = Buffer.concat(parts);
  const gltf = {
    asset: { version: "2.0", generator: "kmufti bust/chunk.mjs (MakeHuman base mesh, CC0)" },
    extensionsUsed: ["KHR_mesh_quantization"], extensionsRequired: ["KHR_mesh_quantization"],
    // the grid the blocks sit in, so the cutter knows which blocks are
    // neighbours (for working out which pieces are still attached)
    scene: 0, scenes: [{ nodes: nodes.map((_, i) => i), extras: grid }], nodes, meshes,
    buffers: [{ byteLength: bin.length }], bufferViews: views, accessors,
  };
  let json = Buffer.from(JSON.stringify(gltf));
  json = Buffer.concat([json, Buffer.alloc((4 - (json.length % 4)) % 4, 0x20)]);
  const header = Buffer.alloc(12);
  header.writeUInt32LE(0x46546c67, 0); header.writeUInt32LE(2, 4);
  header.writeUInt32LE(12 + 8 + json.length + 8 + bin.length, 8);
  const chunk = (buf, type) => { const h = Buffer.alloc(8); h.writeUInt32LE(buf.length, 0); h.writeUInt32LE(type, 4); return Buffer.concat([h, buf]); };
  fs.writeFileSync(file, Buffer.concat([header, chunk(json, 0x4e4f534a), chunk(bin, 0x004e4942)]));
  console.log(`${blocks.length} blocks, ${tris} triangles -> ${path.relative(process.cwd(), file)} (${(fs.statSync(file).size / 1e6).toFixed(2)} MB)`);
}
