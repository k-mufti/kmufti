/* =========================================================================
   His things (bust/bust.js puts them on him): gold aviators, an iced-out
   grill, a Cuban link and a longer rope chain with a diamond medallion,
   and diamond studs.

   Everything is built in the bust's own space and fitted to the stone at
   load: each piece is laid against the skin it rests on (the nearest skin,
   smoothed over a centimetre or so) with a hair of clearance, so nothing
   sinks into him and nothing floats.

   It all comes off whole when it's shot (bust.js gives it a body to fall
   with).

   So they sit in him rather than on him: his lips are carved apart at load
   (carveMouth) and the grill set back behind them; everything that touches
   him darkens the stone it touches (each piece lists its contacts, which
   bust.js feeds to the stone's shader while it's on him); the metal and
   stones reflect a real photo studio (bust/model/studio.hdr, Poly Haven's
   studio_small_09, CC0).
   ========================================================================= */
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

// His mouth: where the lips meet, how wide, how far apart they're carved,
// and the front of his lips across it (they curve back toward the corners).
const SEAM = 0.2682, MOUTH_W = 0.0235, MOUTH_H = 0.0038;
const lipZ = (x) => 0.1975 - 14 * x * x;
const gap = (x) => MOUTH_H * Math.pow(Math.max(0, 1 - (x / MOUTH_W) ** 2), 0.7);

// Parts his lips: a thin, smile-shaped slot cut into the stone along the
// line where they meet, a centimetre deep, before the cutter ever sees him
// (so restore keeps it). Its walls are skin, darkened like a real mouth.
// The cutting library only loads for this; if it can't, he keeps his
// mouth shut and the grill sits on his lips.
export async function carveMouth(originals) {
  const { Brush, Evaluator, SUBTRACTION } = await import("three-bvh-csg");
  const shape = new THREE.Shape(), N = 28, pts = [];
  for (let i = 0; i <= N; i++) {
    const x = -MOUTH_W + (2 * MOUTH_W * i) / N, y = SEAM + 0.0011 * (x / MOUTH_W) ** 2;
    pts.push([x, y, gap(x) + 0.0003]);
  }
  pts.forEach(([x, y, h], i) => (i ? shape.lineTo(x, y + h) : shape.moveTo(x, y + h)));
  for (const [x, y, h] of [...pts].reverse()) shape.lineTo(x, y - h * 0.85);
  let g = new THREE.ExtrudeGeometry(shape, { depth: 0.045, bevelEnabled: false });
  g.deleteAttribute("uv");
  const P = g.attributes.position;
  for (let i = 0; i < P.count; i++) P.setZ(i, P.getZ(i) + lipZ(0) - 0.0105 - (lipZ(0) - lipZ(P.getX(i))));
  g.computeVertexNormals();
  g.setAttribute("_ao", new THREE.BufferAttribute(new Float32Array(g.attributes.position.count).fill(0.22), 1));
  g.setAttribute("_rim", new THREE.BufferAttribute(new Float32Array(g.attributes.position.count), 1));
  g.computeBoundingBox();
  const skinM = new THREE.MeshBasicMaterial(), innerM = new THREE.MeshBasicMaterial();
  const ev = new Evaluator();
  ev.attributes = ["position", "normal", "_ao", "_rim"];
  ev.useGroups = true;
  const slot = new Brush(g, skinM);
  slot.updateMatrixWorld();
  originals.forEach((orig, k) => {
    orig.computeBoundingBox();
    if (!orig.boundingBox.intersectsBox(g.boundingBox)) return;
    const block = new Brush(orig, [skinM, innerM]);
    block.updateMatrixWorld();
    const r = ev.evaluate(block, slot, SUBTRACTION);
    // back to how a block ships: skin triangles first, then the inside
    const mats = Array.isArray(r.material) ? r.material : [r.material], rg = r.geometry;
    const tris = [[], []];
    for (const gr of rg.groups) {
      const which = mats[gr.materialIndex] === innerM ? 1 : 0;
      for (let i = gr.start; i < gr.start + gr.count; i++) tris[which].push(i);
    }
    const order = [...tris[0], ...tris[1]], out = new THREE.BufferGeometry();
    for (const name of ev.attributes) {
      const a = rg.attributes[name], o = new Float32Array(order.length * a.itemSize);
      order.forEach((v, j) => { for (let c = 0; c < a.itemSize; c++) o[j * a.itemSize + c] = a.array[v * a.itemSize + c]; });
      out.setAttribute(name, new THREE.BufferAttribute(o, a.itemSize));
    }
    out.setIndex(new THREE.BufferAttribute(Uint32Array.from(order, (_, j) => j), 1));
    if (tris[0].length) out.addGroup(0, tris[0].length, 0);
    if (tris[1].length) out.addGroup(tris[0].length, tris[1].length, 1);
    out.userData.cell = orig.userData.cell;
    originals[k] = out;
  });
}

export function buildBling(originals, { carved = false } = {}) {
  const skin = skinIndex(originals);
  const mats = materials();
  const gem = gemGeometry();
  const accs = [
    glasses(skin, mats),
    grill(skin, mats, gem, carved),
    ...[1, -1].map((side) => stud(skin, mats, gem, side)),
    chain(skin, mats, gem, { name: "cuban", yFront: 0.118, ySide: 0.176, yBack: 0.168, ring: 0.0036, tube: 0.00155, flat: 0.62, step: 0.0058, twist: 0.7 }),
    chain(skin, mats, gem, { name: "rope", yFront: 0.062, ySide: 0.158, yBack: 0.15, ring: 0.0024, tube: 0.0009, flat: 1, step: 0.0028, twist: Math.PI / 2, medallion: true }),
  ];
  for (const a of accs) {
    a.group.traverse((o) => { if (o.isMesh) { o.castShadow = o.receiveShadow = true; o.userData.acc = a; } });
    a.center = new THREE.Box3().setFromPoints(a.hull).getCenter(new THREE.Vector3());
  }
  return {
    accs, mats,
    // the studio, once it's loaded, for everything that shines
    setEnv(tex) {
      // (the diamonds keep the brighter room the stone is lit by: in a dark
      // studio most of their facets go black)
      for (const m of [mats.gold, mats.satin, mats.lens, mats.pad]) { m.envMap = tex; m.needsUpdate = true; }
    },
  };
}

// ---------- Materials ----------
function materials() {
  return {
    // polished yellow gold: gold's own reflectance, a hair off a mirror
    gold: new THREE.MeshStandardMaterial({ color: 0xf6cf7e, metalness: 1, roughness: 0.13, envMapIntensity: 1.15 }),
    // the medallion's face: satin, so it holds the studio's light rather
    // than mirroring the dark across the room
    satin: new THREE.MeshStandardMaterial({ color: 0xf2c870, metalness: 1, roughness: 0.38, envMapIntensity: 1.5 }),
    // brilliant facets: a mirror, flat shaded so each facet flashes on its own,
    // with a little rainbow fire off the thin-film sheen
    diamond: new THREE.MeshPhysicalMaterial({
      color: 0xffffff, metalness: 1, roughness: 0.0, envMapIntensity: 2.3, flatShading: true,
      iridescence: 0.8, iridescenceIOR: 1.9, iridescenceThicknessRange: [200, 700],
    }),
    // clear silicone nose pads
    pad: new THREE.MeshPhysicalMaterial({ color: 0xf2efe8, roughness: 0.2, transmission: 0.6, thickness: 0.002, envMapIntensity: 1 }),
    // gradient aviator lenses: near black at the brow, amber-gold at the cheek
    lens: new THREE.MeshPhysicalMaterial({
      vertexColors: true, side: THREE.DoubleSide, metalness: 0.85, roughness: 0.04, envMapIntensity: 1.6, clearcoat: 1, clearcoatRoughness: 0.03,
    }),
  };
}

// a brilliant cut, table up (+y): crown, girdle, pavilion to a point
function gemGeometry() {
  const g = new THREE.LatheGeometry([
    new THREE.Vector2(0, -0.85), new THREE.Vector2(1, 0), new THREE.Vector2(1, 0.12),
    new THREE.Vector2(0.62, 0.42), new THREE.Vector2(0, 0.42),
  ], 8);
  return g.toNonIndexed();
}

// ---------- The skin, for fitting things to ----------
// Every skin vertex (normal and all) in a 1 cm hash. surface() finds the
// skin near a point, averaged over a small patch so it's smooth, not
// stepped vertex to vertex.
function skinIndex(originals) {
  const P = [], N = [];
  for (const g of originals) {
    const grp = g.groups.find((x) => x.materialIndex === 0);
    if (!grp) continue;
    const pa = g.attributes.position.array, na = g.attributes.normal.array, I = g.index.array, seen = new Set();
    for (let i = grp.start; i < grp.start + grp.count; i++) {
      const v = I[i];
      if (seen.has(v)) continue;
      seen.add(v);
      P.push(pa[v * 3], pa[v * 3 + 1], pa[v * 3 + 2]);
      N.push(na[v * 3], na[v * 3 + 1], na[v * 3 + 2]);
    }
  }
  const hash = spatialHash(P, 0.01);
  const tmp = new THREE.Vector3();
  // the smoothed skin under p: { point (p projected onto it), normal }
  function surface(p, r = 0.012) {
    for (let k = 0; k < 4; k++, r *= 1.6) {
      const c = new THREE.Vector3(), n = new THREE.Vector3();
      let wsum = 0;
      hash.each(p, r, (i, d2) => {
        const w = Math.exp(-d2 / (r * r * 0.25));
        c.x += P[i * 3] * w; c.y += P[i * 3 + 1] * w; c.z += P[i * 3 + 2] * w;
        n.x += N[i * 3] * w; n.y += N[i * 3 + 1] * w; n.z += N[i * 3 + 2] * w;
        wsum += w;
      });
      if (wsum < 1e-6) continue;
      c.divideScalar(wsum);
      n.normalize();
      return { point: p.clone().addScaledVector(n, -tmp.subVectors(p, c).dot(n)), normal: n };
    }
    return null;
  }
  // lay p on the skin, `clear` off it
  function onto(p, clear) {
    const s = surface(p);
    return s ? s.point.addScaledVector(s.normal, clear) : p.clone();
  }
  // push p out until it's at least `clear` off every bit of skin nearby
  function outside(p, clear) {
    const q = p.clone();
    for (let k = 0; k < 4; k++) {
      let worst = 0, wn = null;
      hash.each(q, clear * 2.5, (i) => {
        const d = (q.x - P[i * 3]) * N[i * 3] + (q.y - P[i * 3 + 1]) * N[i * 3 + 1] + (q.z - P[i * 3 + 2]) * N[i * 3 + 2];
        const lat = Math.hypot(q.x - P[i * 3], q.y - P[i * 3 + 1], q.z - P[i * 3 + 2]);
        if (lat > clear * 1.6) return;
        if (clear - d > worst) { worst = clear - d; wn = [N[i * 3], N[i * 3 + 1], N[i * 3 + 2]]; }
      });
      if (!wn) break;
      q.x += wn[0] * worst; q.y += wn[1] * worst; q.z += wn[2] * worst;
    }
    return q;
  }
  // the front of the face at (x, y): the highest z within r
  function front(x, y, r = 0.0025) {
    let z = -1;
    hash.each(new THREE.Vector3(x, y, 0), r, (i) => {
      if (Math.abs(P[i * 3] - x) < r && Math.abs(P[i * 3 + 1] - y) < r) z = Math.max(z, P[i * 3 + 2]);
    }, true);
    return z;
  }
  return { surface, onto, outside, front, P, N, hash };
}

// points in a hash of `cell`-sized cubes; each(p, r, fn) visits those within r
// (column: ignore z and visit the whole column of cells through p)
function spatialHash(P, cell) {
  const cells = new Map();
  const key = (x, y, z) => (x + 512) * 1048576 + (y + 512) * 1024 + (z + 512);
  for (let i = 0; i < P.length / 3; i++) {
    const k = key(Math.floor(P[i * 3] / cell), Math.floor(P[i * 3 + 1] / cell), Math.floor(P[i * 3 + 2] / cell));
    let a = cells.get(k);
    if (!a) cells.set(k, (a = []));
    a.push(i);
  }
  return {
    each(p, r, fn, column) {
      const x0 = Math.floor((p.x - r) / cell), x1 = Math.floor((p.x + r) / cell);
      const y0 = Math.floor((p.y - r) / cell), y1 = Math.floor((p.y + r) / cell);
      const z0 = column ? -40 : Math.floor((p.z - r) / cell), z1 = column ? 40 : Math.floor((p.z + r) / cell);
      for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) for (let z = z0; z <= z1; z++) {
        const a = cells.get(key(x, y, z));
        if (!a) continue;
        for (const i of a) {
          const dx = P[i * 3] - p.x, dy = P[i * 3 + 1] - p.y, dz = P[i * 3 + 2] - p.z, d2 = dx * dx + dy * dy + dz * dz;
          if (column || d2 <= r * r) fn(i, d2);
        }
      }
    },
  };
}

// a basis matrix: x along `along`, z out along `out`
function frame(at, along, out) {
  const z = out.clone().normalize();
  const x = along.clone().addScaledVector(z, -along.dot(z)).normalize();
  const y = new THREE.Vector3().crossVectors(z, x);
  return new THREE.Matrix4().makeBasis(x, y, z).setPosition(at);
}

// gems on a set of matrices (each one's +z is where the table faces)
const TABLE_UP = new THREE.Matrix4().makeRotationX(Math.PI / 2);
function gems(geo, mat, list) {
  const m = new THREE.InstancedMesh(geo, mat, list.length);
  list.forEach(({ m: f, r }, i) => m.setMatrixAt(i, f.clone().multiply(TABLE_UP).scale(new THREE.Vector3(r, r, r))));
  m.userData.sparkle = list.map(({ m: f }) => new THREE.Vector3().setFromMatrixPosition(f));
  return m;
}

function hullOf(...objs) {
  const out = [];
  for (const o of objs) {
    o.updateMatrixWorld(true);
    o.traverse((m) => {
      if (!m.isMesh) return;
      const p = m.geometry.attributes.position, n = m.isInstancedMesh ? m.count : 1;
      const step = Math.max(1, Math.floor((p.count * n) / 60));
      const mi = new THREE.Matrix4();
      for (let k = 0; k < n; k++) {
        if (m.isInstancedMesh) m.getMatrixAt(k, mi); else mi.identity();
        for (let i = (k * 7) % step; i < p.count; i += step) out.push(new THREE.Vector3().fromBufferAttribute(p, i).applyMatrix4(mi).applyMatrix4(m.matrixWorld));
      }
    });
  }
  return out;
}

// ---------- Aviators ----------
function glasses(skin, mats) {
  const group = new THREE.Group();
  const A = 0.0285, H = 0.046, C = { x: 0.0105 + A, y: 0.345 };   // inner rim stays where it was by his nose
  const bend = (x, y) => -4.2 * x * x - 1.2 * (y - C.y) * (y - C.y);
  // the lens outline in its own terms: u out from the nose, v up. Flat
  // across the top, deep and swept toward the nose at the bottom.
  const outline = [];
  for (let i = 0; i < 64; i++) {
    const t = (i / 64) * Math.PI * 2, c = Math.cos(t), s = Math.sin(t);
    const v = s >= 0 ? Math.pow(s, 0.38) * 0.42 : -Math.pow(-s, 0.85) * 0.58;
    const u = c + (s < 0 ? 0.16 * s * (1 - 0.4 * c) : 0);
    outline.push([u * A, v * H]);
  }
  // how far forward the glasses have to sit to clear his nose and brow
  let z0 = 0;
  for (const side of [1, -1]) for (const [u, v] of outline) for (const k of [1, 0.6, 0.2]) {
    const x = side * (C.x + u * k), y = C.y + v * k;
    z0 = Math.max(z0, skin.front(x, y, 0.003) + 0.0035 - bend(x, y));
  }
  const at = (side, u, v, dz = 0) => {
    const x = side * (C.x + u), y = C.y + v;
    return new THREE.Vector3(x, y, z0 + bend(x, y) + dz);
  };
  const tube = (pts, r, closed = false) => new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, closed, "centripetal"), pts.length * 3, r, 6, closed), mats.gold);
  const dark = new THREE.Color(0x120a04), amber = new THREE.Color(0x7a4a14);
  const lenses = [], hinges = [];
  for (const side of [1, -1]) {
    // the lens: a fan from its middle, bent to the curve, shaded top to bottom
    const pos = [], col = [], idx = [];
    const top = H * 0.42, bot = -H * 0.58;
    const push = (u, v) => {
      pos.push(...at(side, u, v, -0.0004).toArray());
      const c = dark.clone().lerp(amber, Math.pow((top - v) / (top - bot), 1.4));
      col.push(c.r, c.g, c.b);
    };
    push(0, 0);
    for (let ring = 1; ring <= 4; ring++) for (const [u, v] of outline) push((u * ring) / 4, (v * ring) / 4);
    const n = outline.length;
    for (let i = 0; i < n; i++) idx.push(0, 1 + i, 1 + ((i + 1) % n));
    for (let ring = 1; ring < 4; ring++) for (let i = 0; i < n; i++) {
      const a = 1 + (ring - 1) * n + i, b = 1 + (ring - 1) * n + ((i + 1) % n), c2 = a + n, d = b + n;
      idx.push(a, c2, d, a, d, b);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
    g.setIndex(side > 0 ? idx : idx.map((_, i, a) => a[i - (i % 3) + [0, 2, 1][i % 3]]));
    g.computeVertexNormals();
    const lens = new THREE.Mesh(g, mats.lens);
    lenses.push(lens);
    group.add(lens);
    // the wire rim
    group.add(tube(outline.map(([u, v]) => at(side, u, v)), 0.0011, true));
    // the hinge, at the outer top corner
    const hu = A * 0.97, hv = H * 0.3;
    hinges.push(at(side, hu, hv));
  }
  // double bridge: a straight brow bar across the tops, and an arch over the nose
  group.add(tube([at(1, -A * 0.55, H * 0.4, 0.0012), at(1, -A * 0.9, H * 0.4, 0.0016), at(-1, -A * 0.9, H * 0.4, 0.0016), at(-1, -A * 0.55, H * 0.4, 0.0012)], 0.0010));
  group.add(tube([at(1, -A * 0.97, H * 0.12), at(1, -A * 1.2, H * 0.2, 0.001), at(-1, -A * 1.2, H * 0.2, 0.001), at(-1, -A * 0.97, H * 0.12)], 0.0011));
  // the arms: from each hinge straight back along the side of his head,
  // level until they rise a touch to clear the ear, then hooked down
  // behind it. Each sample is held a couple of millimetres off his temple
  // (only sideways, so the line stays level), then smoothed.
  const arms = [];
  for (const side of [1, -1]) {
    const h = hinges[side > 0 ? 0 : 1];
    const zs = [0.17, 0.155, 0.14, 0.125, 0.11, 0.095, 0.082, 0.07, 0.06, 0.051, 0.043, 0.037];
    let pts = zs.map((z) => {
      const y = z > 0.07 ? h.y + (0.3665 - h.y) * (1 - (z - 0.07) / (h.z - 0.07)) : z > 0.05 ? 0.367 : 0.367 - (0.05 - z) * 1.9;
      const s2 = skin.surface(new THREE.Vector3(side * 0.1, y, z), 0.008);
      const x = Math.max(Math.abs(h.x) + 0.002, Math.abs(s2 ? s2.point.x : 0.085) + 0.0026);
      return new THREE.Vector3(side * x, y, z);
    });
    for (let pass = 0; pass < 3; pass++) {
      pts = pts.map((p, i) => (i === 0 || i === pts.length - 1 ? p : p.clone().multiplyScalar(0.5).addScaledVector(pts[i - 1], 0.25).addScaledVector(pts[i + 1], 0.25)));
    }
    pts = pts.map((p) => skin.outside(p, 0.0022));
    pts.unshift(h, h.clone().add(new THREE.Vector3(side * 0.0015, 0, -0.006)));
    group.add(tube(pts, 0.0012));
    arms.push(pts.slice(3));
    const knuckle = new THREE.Mesh(new THREE.BoxGeometry(0.0035, 0.003, 0.007), mats.gold);
    knuckle.position.copy(h).add(new THREE.Vector3(side * 0.0008, 0, -0.003));
    group.add(knuckle);
  }
  // nose pads: clear pads resting on either side of his nose, on little
  // gold arms back to the rims
  const pads = [];
  for (const side of [1, -1]) {
    const s2 = skin.surface(new THREE.Vector3(side * 0.012, 0.336, skin.front(side * 0.012, 0.336)), 0.004);
    const p0 = s2.point.clone().addScaledVector(s2.normal, 0.0012);
    const pad = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), mats.pad);
    pad.applyMatrix4(frame(p0, new THREE.Vector3(0, 1, 0), s2.normal).scale(new THREE.Vector3(0.0028, 0.0045, 0.0011)));
    group.add(pad, tube([p0.clone().addScaledVector(s2.normal, 0.001), p0.clone().addScaledVector(s2.normal, 0.004).add(new THREE.Vector3(0, 0.002, 0)), at(side, -A * 0.92, H * 0.05)], 0.0006));
    pads.push(p0);
  }
  const hull = hullOf(group);
  const contacts = [...pads.map((p) => ({ a: p, b: p, r: 0.006, s: 0.5 }))];
  for (const arm of arms) for (let i = 0; i + 1 < arm.length; i++) contacts.push({ a: arm[i], b: arm[i + 1], r: 0.0045, s: 0.45 });
  return {
    name: "shades", group, hull, kind: "glass", head: true, contacts,
    supports: [new THREE.Vector3(0, 0.352, skin.front(0, 0.352)), new THREE.Vector3(0.093, 0.366, 0.058), new THREE.Vector3(-0.093, 0.366, 0.058)],
  };
}

// ---------- Grill ----------
// Iced-out caps on his teeth, top and bottom rows, gold paved with
// diamonds. With his lips carved apart they sit back in his mouth, just
// behind the lips, and only show between them; if the carving couldn't
// happen they sit over his closed lips instead.
function grill(skin, mats, gem, carved) {
  const group = new THREE.Group();
  const seamY = (x) => SEAM + 0.0011 * (x / MOUTH_W) ** 2;
  const rows = [
    { up: true, w: 0.0072, h: carved ? 0.0075 : 0.0068, xs: [-2.5, -1.5, -0.5, 0.5, 1.5, 2.5] },
    { up: false, w: 0.0066, h: carved ? 0.007 : 0.006, xs: [-2.5, -1.5, -0.5, 0.5, 1.5, 2.5] },
  ];
  const D = 0.0032;
  const toothGeo = new RoundedBoxGeometry(1, 1, 1, 2, 0.18);
  const teeth = [], stones = [];
  for (const row of rows) for (const k of row.xs) {
    const x = k * row.w, sy = seamY(x);
    // the tooth's middle: hung from the seam (top row) or stood under it
    const y = carved ? (row.up ? sy - 0.0002 + row.h / 2 : sy - 0.0005 - row.h / 2) : (row.up ? SEAM + 0.0036 : SEAM - 0.0033);
    // follow the curve of his mouth: turn each tooth to face along it
    const out = new THREE.Vector3(28 * x, 0, 1).normalize();
    const z = carved ? lipZ(x) - 0.0021 - D / 2
      : Math.max(skin.front(x - row.w / 2, y, 0.002), skin.front(x, y, 0.002), skin.front(x + row.w / 2, y, 0.002)) + 0.0006 + D / 2;
    const f = frame(new THREE.Vector3(x, y, z), new THREE.Vector3(1, 0, 0), out);
    teeth.push(f.clone().scale(new THREE.Vector3(row.w * 0.94, row.h, D)));
    // pavé across the part of the face that shows
    const g = carved ? gap(x) : row.h * 0.9;
    if (g < 0.0011) continue;
    const vy = carved ? (row.up ? sy + g * 0.5 : sy - 0.0005 - g * 0.42) - y : 0;
    const rows2 = carved ? [vy] : [-0.24 * row.h, 0.24 * row.h];
    for (const b of rows2) for (const a of [-0.25, 0.25]) {
      const p = new THREE.Vector3(a * row.w, b, D / 2 + 0.0002).applyMatrix4(f);
      stones.push({ m: frame(p, new THREE.Vector3(1, 0, 0), out), r: Math.min(row.w * 0.2, g * 0.42) });
    }
  }
  const caps = new THREE.InstancedMesh(toothGeo, mats.gold, teeth.length);
  teeth.forEach((m, i) => caps.setMatrixAt(i, m));
  group.add(caps, gems(gem, mats.diamond, stones));
  const l = new THREE.Vector3(-0.02, SEAM, lipZ(0.02)), r = new THREE.Vector3(0.02, SEAM, lipZ(0.02)), c = new THREE.Vector3(0, SEAM, lipZ(0));
  return {
    name: "grill", group, hull: hullOf(group), kind: "gold", head: true,
    supports: [new THREE.Vector3(0, SEAM, skin.front(0, SEAM))],
    contacts: [{ a: l, b: c, r: 0.0045, s: 0.45 }, { a: c, b: r, r: 0.0045, s: 0.45 }],
  };
}

// ---------- Diamond studs ----------
function stud(skin, mats, gem, side) {
  const group = new THREE.Group();
  // the earlobe: the lowest bit of ear that stands off his head
  let best = null;
  const P = skin.P;
  for (let i = 0; i < P.length / 3; i++) {
    const x = P[i * 3] * side, y = P[i * 3 + 1], z = P[i * 3 + 2];
    if (x < 0.097 || y < 0.29 || y > 0.34 || z < 0.035 || z > 0.085) continue;
    if (!best || y < best.y) best = { x, y, z };
  }
  const lobe = new THREE.Vector3(best.x * side, best.y + 0.006, best.z);
  const s = skin.surface(lobe);
  const out = s.normal.clone();
  const at = s.point.clone().addScaledVector(out, 0.0024);
  const basket = new THREE.Mesh(new THREE.CylinderGeometry(0.0028, 0.002, 0.0018, 12), mats.gold);
  basket.applyMatrix4(frame(s.point.clone().addScaledVector(out, 0.0011), new THREE.Vector3(0, 1, 0), out).multiply(TABLE_UP));
  group.add(basket, gems(gem, mats.diamond, [{ m: frame(at, new THREE.Vector3(0, 1, 0), out), r: 0.0034 }]));
  return { name: side > 0 ? "stud-l" : "stud-r", group, hull: hullOf(group), kind: "gold", head: true, supports: [s.point.clone()], contacts: [{ a: s.point, b: s.point, r: 0.005, s: 0.5 }] };
}

// ---------- Chains ----------
// A loop round his neck, laid on him: high at the back and sides, hanging
// lower on his chest in front. Links are tori along it, each turned a
// little more than the last so it reads as a chain, not a tube.
function chain(skin, mats, gem, o) {
  const group = new THREE.Group();
  const Z0 = 0.043;   // his neck's axis, front to back
  const N = 120, clear = o.tube * (o.flat < 1 ? 1.2 : 1.6) + 0.0006;
  let path = [];
  for (let i = 0; i < N; i++) {
    const t = (i / N) * Math.PI * 2, c = Math.cos(t), s = Math.sin(t);
    const front = Math.pow(Math.max(0, c), 1.4);
    const y = c >= 0 ? o.ySide + (o.yFront - o.ySide) * front : o.ySide + (o.yBack - o.ySide) * -c;
    path.push(new THREE.Vector3(s * 0.085, y, Z0 + c * (c > 0 ? 0.075 : 0.08)));
  }
  // lay it on him, smooth out the lumps, lay it on him again
  for (let pass = 0; pass < 4; pass++) {
    path = path.map((p) => skin.onto(p, clear));
    path = path.map((p, i) => p.clone().multiplyScalar(0.5).addScaledVector(path[(i + N - 1) % N], 0.25).addScaledVector(path[(i + 1) % N], 0.25));
  }
  path = path.map((p) => skin.outside(skin.onto(p, clear), clear));
  const curve = new THREE.CatmullRomCurve3(path, true, "centripetal");
  const len = curve.getLength(), count = Math.floor(len / o.step);
  const links = new THREE.InstancedMesh(
    new THREE.TorusGeometry(o.ring, o.tube, 6, 14).scale(1.35, 1, o.flat), mats.gold, count);
  const sparkle = [];
  let bottom = null;
  for (let i = 0; i < count; i++) {
    const u = i / count, p = curve.getPointAt(u), t = curve.getTangentAt(u);
    const n = skin.surface(p)?.normal || new THREE.Vector3(0, 0, 1);
    const f = frame(p, t, n).multiply(new THREE.Matrix4().makeRotationX(i % 2 ? o.twist * 0.5 : -o.twist * 0.5));
    links.setMatrixAt(i, f);
    if (i % 9 === 0) sparkle.push(p);
    if (!bottom || (p.z > Z0 && p.y < bottom.p.y)) bottom = { p, t, n, i };
  }
  links.userData.sparkle = sparkle;
  // for bust.js, to string it as a rope once it's knocked off
  links.userData.twist = o.twist;
  links.userData.ring = o.ring;
  group.add(links);
  const supports = [new THREE.Vector3(0, o.yBack, -0.03), new THREE.Vector3(0.085, o.ySide, Z0), new THREE.Vector3(-0.085, o.ySide, Z0), bottom.p.clone()];
  const contacts = [];
  const nC = Math.round(len / 0.018);
  for (let i = 0; i < nC; i++) contacts.push({ a: curve.getPointAt(i / nC), b: curve.getPointAt((i + 1) / nC), r: o.ring * 1.6, s: 0.55 });
  if (o.medallion) contacts.push(medallion(skin, mats, gem, group, bottom));
  // what a shot has to hit to knock it off: a fat invisible tube along it
  const pick = new THREE.Mesh(new THREE.TubeGeometry(curve, 90, o.ring * 1.6, 5, true), new THREE.MeshBasicMaterial());
  pick.visible = false;
  pick.castShadow = false;
  pick.userData.pick = true;
  group.add(pick);
  return { name: o.name, group, hull: hullOf(links), kind: "chain", supports, contacts };
}

// A gold piece the size of a big coin, hung from the bottom of the rope
// chain: a rim of diamonds round it, a halo of ten smaller ones inside
// that, and one big stone in the middle.
function medallion(skin, mats, gem, group, bottom) {
  const R = 0.017, T = 0.0032;
  const guess = bottom.p.clone().add(new THREE.Vector3(0, -R - 0.004, 0));
  const s = skin.surface(guess);
  const out = s.normal.clone();
  const up = new THREE.Vector3(0, 1, 0);
  // lean it on his chest, hanging square to gravity
  const at = skin.outside(s.point.clone().addScaledVector(out, T / 2 + 0.0012), T / 2 + 0.001);
  let f = frame(at, new THREE.Vector3().crossVectors(up, out), out);
  // ...and far enough off him that its edge doesn't dig in where he curves
  let shift = 0;
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2, q = new THREE.Vector3(Math.cos(a) * R, Math.sin(a) * R, -T / 2).applyMatrix4(f);
    shift = Math.max(shift, skin.outside(q, 0.0008).sub(q).dot(out));
  }
  at.addScaledVector(out, shift);
  f = frame(at, new THREE.Vector3().crossVectors(up, out), out);
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(R, R, T, 40), mats.satin);
  disc.applyMatrix4(f.clone().multiply(TABLE_UP));
  const rim = new THREE.Mesh(new THREE.TorusGeometry(R, 0.0014, 8, 48), mats.gold);
  rim.applyMatrix4(f.clone().multiply(new THREE.Matrix4().makeTranslation(0, 0, T / 2)));
  // the bail: a ring from the top of the disc up to the chain
  const bailAt = new THREE.Vector3(0, R + 0.0025, 0).applyMatrix4(f);
  const bail = new THREE.Mesh(new THREE.TorusGeometry(0.0034, 0.0011, 8, 16), mats.gold);
  bail.applyMatrix4(frame(bailAt, out, new THREE.Vector3().crossVectors(up, out)));
  const stones = [];
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    stones.push({ m: frame(new THREE.Vector3(Math.cos(a) * R * 0.78, Math.sin(a) * R * 0.78, T / 2 + 0.0003).applyMatrix4(f), new THREE.Vector3(1, 0, 0).transformDirection(f), out), r: 0.0021 });
  }
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    stones.push({ m: frame(new THREE.Vector3(Math.cos(a) * R * 0.5, Math.sin(a) * R * 0.5, T / 2 + 0.0003).applyMatrix4(f), new THREE.Vector3(1, 0, 0).transformDirection(f), out), r: 0.0014 });
  }
  stones.push({ m: frame(new THREE.Vector3(0, 0, T / 2 + 0.0006).applyMatrix4(f), new THREE.Vector3(1, 0, 0).transformDirection(f), out), r: 0.0062 });
  // all one piece, hung from link bottom.i (bust.js swings it on the rope)
  const medal = new THREE.Group();
  medal.add(disc, rim, bail, gems(gem, mats.diamond, stones));
  group.add(medal);
  group.userData.medal = { group: medal, f: f.clone(), k: bottom.i };
  // the shadow it makes on his chest: soft, about its own size
  const under = at.clone().addScaledVector(out, -T / 2);
  return { a: under, b: under, r: R * 0.95, s: 0.55 };
}

