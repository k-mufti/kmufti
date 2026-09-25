// Infinite Kitchen - the room, in 3D, seen from one camera that never moves.
//
// It looks like a photo of a kitchen but plays like a flat board: app.js
// still owns the game, and this file only draws the room and answers
// "what's under this point?". Every tool, cookbook and the bin is a spot
// with an id (the technique, the cuisine, or "bin" / "recipeBook" /
// "notepad"). The hidden .tool / .cookbook elements in the page carry the
// state (locked, target, hover, shake...) and this file mirrors them: a
// locked tool turns black in place, a targeted one glows.
//
// window.K3 = { ready, resize(), boardRect(), pick(x, y, skipId), snapshot(id),
//               grab(id, x, y), hold(id, x, y), sendHome(id),
//               throwTool(id, x, y, vx, vy), canThrow(id) }
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { GTAOPass } from "three/addons/postprocessing/GTAOPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

const canvas = document.getElementById("view");
const room = document.getElementById("room");
const stageEl = document.getElementById("stage");
const ART = "art/3d/";

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
const ANISO = renderer.capabilities.getMaxAnisotropy();
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x090b12);
scene.fog = new THREE.Fog(0x121a30, 14, 60);   // only the hills outside are far enough to get it
const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 120);
const CAM = new THREE.Vector3(0, 2.08, 3.0), LOOK = new THREE.Vector3(0, 1.02, -1.0);

/* ---------- drawing on demand ---------- */
// Soft shadow where things meet (ambient occlusion) is most of what makes
// it read as a photo; it's skipped on small screens to stay quick.
let composer = null, aoPass = null;
function makeComposer(w, h) {
  if (Math.min(w, h) < 420) { composer = null; return; }
  if (!composer) {
    // multisampled, so edges stay smooth through the extra pass
    const rt = new THREE.WebGLRenderTarget(w, h, { type: THREE.HalfFloatType, samples: 4 });
    composer = new EffectComposer(renderer, rt);
    composer.addPass(new RenderPass(scene, camera));
    aoPass = new GTAOPass(scene, camera, w, h);
    aoPass.updateGtaoMaterial({ radius: 0.35, distanceExponent: 1.5, thickness: 1.2, scale: 1.1, samples: 16 });
    aoPass.blendIntensity = 0.9;
    composer.addPass(aoPass);
    composer.addPass(new OutputPass());
  }
  composer.setPixelRatio(renderer.getPixelRatio());
  composer.setSize(w, h);
}
let queued = false, anims = [];
function dirty() {
  if (queued) return;
  queued = true;
  requestAnimationFrame(frame);
}
function frame(now) {
  queued = false;
  anims = anims.filter((a) => a.step(now) !== false);
  if (composer) composer.render(); else renderer.render(scene, camera);
  if (anims.length) dirty();
}

/* ---------- materials ---------- */
const texLoader = new THREE.TextureLoader();
const TEX = new Map();
function tex(file, srgb) {
  if (TEX.has(file)) return TEX.get(file);
  const t = texLoader.load(ART + "textures/" + file, dirty);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = ANISO;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  TEX.set(file, t);
  return t;
}
// A photo-scanned material; geometry gets UVs in metres (see worldUV), so
// `size` is how many metres one copy of the texture covers.
function pbr(name, size, opts = {}) {
  const arm = tex(name + "_arm.jpg");
  const m = new THREE.MeshStandardMaterial({
    map: tex(name + "_diff.jpg", true), normalMap: tex(name + "_nor.jpg"),
    aoMap: arm, roughnessMap: arm, metalnessMap: arm, metalness: 1, roughness: 1, ...opts,
  });
  m.userData.size = size;
  return m;
}
// Tiles drawn here rather than photographed: each one its own shade, with
// grout between - the colour map, and a bump map from the same drawing.
function tileTex(n, palette, grout, seed = 1) {
  const S = 1024, c = document.createElement("canvas"), b = document.createElement("canvas");
  c.width = c.height = b.width = b.height = S;
  const g = c.getContext("2d"), h = b.getContext("2d"), t = S / n, gw = Math.max(3, t * 0.045);
  let r = seed * 9301;
  const rnd = () => ((r = (r * 16807) % 2147483647) / 2147483647);
  g.fillStyle = grout; g.fillRect(0, 0, S, S);
  h.fillStyle = "#000"; h.fillRect(0, 0, S, S);
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const x = i * t + gw / 2, y = j * t + gw / 2, w = t - gw;
    const base = palette[Math.floor(rnd() * palette.length)];
    const grd = g.createLinearGradient(x, y, x + w, y + w);
    grd.addColorStop(0, base); grd.addColorStop(1, shade(base, 0.9 + rnd() * 0.12));
    g.fillStyle = grd; g.fillRect(x, y, w, w);
    for (let k = 0; k < 40; k++) {              // a little mottling
      g.fillStyle = `rgba(${rnd() < 0.5 ? "255,240,220" : "60,30,15"},${rnd() * 0.06})`;
      const rr = rnd() * w * 0.25;
      g.beginPath(); g.arc(x + rnd() * w, y + rnd() * w, rr, 0, 7); g.fill();
    }
    const hb = h.createRadialGradient(x + w / 2, y + w / 2, w * 0.2, x + w / 2, y + w / 2, w * 0.75);
    hb.addColorStop(0, "#fff"); hb.addColorStop(1, "#d8d8d8");
    h.fillStyle = hb; h.fillRect(x, y, w, w);
  }
  const map = new THREE.CanvasTexture(c), bump = new THREE.CanvasTexture(b);
  for (const x of [map, bump]) { x.wrapS = x.wrapT = THREE.RepeatWrapping; x.anisotropy = ANISO; }
  map.colorSpace = THREE.SRGBColorSpace;
  return { map, bump };
}
function shade(hex, k) {
  const n = parseInt(hex.slice(1), 16);
  const f = (v) => Math.max(0, Math.min(255, Math.round(v * k)));
  return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`;
}
// A marble slab: warm white, soft clouds, and thin grey veins.
function marbleTex(seed = 5) {
  const S = 2048, c = document.createElement("canvas");
  c.width = c.height = S;
  const g = c.getContext("2d");
  let r = seed * 7919;
  const rnd = () => ((r = (r * 16807) % 2147483647) / 2147483647);
  g.fillStyle = "#f4f0e8"; g.fillRect(0, 0, S, S);
  g.filter = "blur(40px)";
  for (let i = 0; i < 90; i++) {
    g.fillStyle = `rgba(${rnd() < 0.5 ? "205,198,188" : "255,252,246"},${0.12 + rnd() * 0.2})`;
    g.beginPath(); g.arc(rnd() * S, rnd() * S, 80 + rnd() * 260, 0, 7); g.fill();
  }
  const vein = (width, alpha, blur) => {
    g.filter = `blur(${blur}px)`;
    g.strokeStyle = `rgba(118,112,108,${alpha})`;
    g.lineWidth = width;
    let x = rnd() * S, y = -50, a = 0.5 + rnd() * 0.9;
    g.beginPath(); g.moveTo(x, y);
    while (y < S + 50 && x > -200 && x < S + 200) {
      a += (rnd() - 0.5) * 0.5;
      x += Math.cos(a) * 30; y += Math.abs(Math.sin(a)) * 30 + 6;
      g.lineTo(x, y);
      if (rnd() < 0.04) {                      // a branch
        const [bx, by] = [x, y];
        g.moveTo(bx, by);
        let ba = a + (rnd() - 0.5) * 2;
        for (let k = 0; k < 12; k++) { ba += (rnd() - 0.5) * 0.6; g.lineTo(bx + Math.cos(ba) * 25 * k, by + Math.sin(ba) * 25 * k); }
        g.moveTo(x, y);
      }
    }
    g.stroke();
  };
  for (let i = 0; i < 6; i++) vein(26 + rnd() * 30, 0.16, 16);
  for (let i = 0; i < 8; i++) vein(4 + rnd() * 4, 0.4, 1.5);
  for (let i = 0; i < 6; i++) vein(2 + rnd() * 2, 0.55, 0.5);
  g.filter = "none";
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = ANISO; t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function tiles(n, palette, grout, size, rough, seed) {
  const { map, bump } = tileTex(n, palette, grout, seed);
  const m = new THREE.MeshStandardMaterial({ map, bumpMap: bump, bumpScale: 1.2, roughness: rough, metalness: 0 });
  m.userData.size = size;
  return m;
}
const M = {
  plaster: pbr("yellow_plaster", 2.2, { color: 0xeadcc6, normalScale: new THREE.Vector2(0.6, 0.6) }),
  hood: pbr("yellow_plaster", 1.6, { color: 0xe6d2b4 }),
  floor: tiles(6, ["#c86a3e", "#b95b33", "#d27b4b", "#aa552f", "#c46238"], "#7a5540", 1.9, 0.8, 3),
  wood: pbr("dark_wood", 1.2, { color: 0x8c7462 }),
  board: pbr("dark_wood", 0.9, { color: 0x6e4a33 }),
  beam: pbr("wood_table_worn", 1.4, { color: 0x6e4a31 }),
  marble: Object.assign(new THREE.MeshPhysicalMaterial({ map: marbleTex(), color: 0xdcd6cc, roughness: 0.3, clearcoat: 0.35, clearcoatRoughness: 0.25 }), { userData: { size: 2.4 } }),
  tiles: tiles(8, ["#efe3cc", "#e9dbc0", "#f5ecdc", "#e4d3b5", "#ede0c6"], "#cdbb9c", 0.8, 0.25, 7),
  brass: new THREE.MeshStandardMaterial({ color: 0xc8963e, metalness: 1, roughness: 0.32 }),
  chrome: new THREE.MeshStandardMaterial({ color: 0xe8e8e8, metalness: 1, roughness: 0.18 }),
  iron: new THREE.MeshStandardMaterial({ color: 0x262422, metalness: 0.75, roughness: 0.55 }),
  steel: new THREE.MeshStandardMaterial({ color: 0xd9dcde, metalness: 1, roughness: 0.22 }),
  enamel: new THREE.MeshStandardMaterial({ color: 0xece0c6, metalness: 0, roughness: 0.28 }),
  ceramic: new THREE.MeshStandardMaterial({ color: 0xf7f3ea, metalness: 0, roughness: 0.2 }),
  basin: new THREE.MeshStandardMaterial({ color: 0xcfc9bf, metalness: 0, roughness: 0.3 }),
  paper: new THREE.MeshStandardMaterial({ color: 0xf5eedd, roughness: 0.9 }),
  frame: pbr("dark_wood", 0.8, { color: 0x5a3a24 }),
  glass: new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0, roughness: 0.05, transparent: true, opacity: 0.07 }),
  jar: new THREE.MeshPhysicalMaterial({ color: 0xe8f2f0, metalness: 0, roughness: 0.06, transparent: true, opacity: 0.35, clearcoat: 1 }),
  black: new THREE.MeshStandardMaterial({ color: 0x151210, roughness: 0.6 }),
};
const LOCKED = new THREE.MeshStandardMaterial({ color: 0x0a0807, roughness: 0.85, metalness: 0 });

// UVs from position, picking the two axes the face is most flat along -
// so textures keep one scale in metres on every box, whatever its size.
function worldUV(geo, size) {
  const p = geo.attributes.position, n = geo.attributes.normal;
  const uv = new Float32Array(p.count * 2);
  for (let i = 0; i < p.count; i++) {
    const ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i)), az = Math.abs(n.getZ(i));
    let u, v;
    if (ax >= ay && ax >= az) { u = p.getZ(i); v = p.getY(i); }
    else if (ay >= az) { u = p.getX(i); v = p.getZ(i); }
    else { u = p.getX(i); v = p.getY(i); }
    uv[i * 2] = u / size; uv[i * 2 + 1] = v / size;
  }
  geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  return geo;
}
function mesh(geo, mat, { cast = true, receive = true } = {}) {
  if (mat.userData.size) worldUV(geo, mat.userData.size);
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = cast; m.receiveShadow = receive;
  return m;
}
// a box by its centre, in room coordinates (metres; y up, the back wall at z = -2.5)
function box(w, h, d, x, y, z, mat, round = 0, opt) {
  const g = round ? new RoundedBoxGeometry(w, h, d, 3, round) : new THREE.BoxGeometry(w, h, d);
  g.translate(x, y, z);
  return mesh(g, mat, opt);
}
function add(parent, ...objs) { for (const o of objs) parent.add(o); return objs[0]; }

/* ---------- the room ---------- */
const W = 2.95, BACK = -2.5, CEIL = 2.78;
const COUNTER_TOP = 0.94, COUNTER_D = 0.66, SHELVES = [1.56, 1.98];

// floor, ceiling, side walls
add(scene, box(2 * W, 0.1, 12, 0, -0.05, 2.5, M.floor, 0, { cast: false }));
add(scene, box(2 * W, 0.1, 12, 0, CEIL + 0.05, 2.5, M.plaster, 0, { cast: false }));
add(scene, box(0.2, CEIL, 12, -W - 0.1, CEIL / 2, 2.5, M.plaster, 0, { cast: false }));
add(scene, box(0.2, CEIL, 12, W + 0.1, CEIL / 2, 2.5, M.plaster, 0, { cast: false }));
for (const z of [-1.9, -0.8, 0.3]) add(scene, box(2 * W, 0.2, 0.22, 0, CEIL - 0.1, z, M.beam));

// the back wall, with an arched window cut through it
const WIN = { w: 0.64, sill: 1.18, spring: 1.82 };
function archPath(path, r, sill) {
  path.moveTo(-r, sill); path.lineTo(r, sill); path.lineTo(r, WIN.spring);
  path.absarc(0, WIN.spring, r, 0, Math.PI, false); path.lineTo(-r, sill);
  return path;
}
{
  const s = new THREE.Shape();
  s.moveTo(-W, 0); s.lineTo(W, 0); s.lineTo(W, CEIL); s.lineTo(-W, CEIL); s.lineTo(-W, 0);
  s.holes.push(archPath(new THREE.Path(), WIN.w, WIN.sill));
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.32, bevelEnabled: false, curveSegments: 40 });
  g.translate(0, 0, BACK - 0.32);
  add(scene, mesh(g, M.plaster));

  // frame, glazing bars and glass
  const f = new THREE.Shape(); archPath(f, WIN.w, WIN.sill);
  f.holes.push(archPath(new THREE.Path(), WIN.w - 0.055, WIN.sill + 0.055));
  const fg = new THREE.ExtrudeGeometry(f, { depth: 0.08, bevelEnabled: false, curveSegments: 40 });
  fg.translate(0, 0, BACK - 0.2);
  add(scene, mesh(fg, M.frame));
  const zb = BACK - 0.16, r = WIN.w - 0.055, top = WIN.spring + r;
  add(scene, box(0.035, top - WIN.sill, 0.05, 0, (top + WIN.sill) / 2, zb, M.frame));
  for (const x of [-r / 2, r / 2]) {
    const h = WIN.spring + Math.sqrt(r * r - x * x);
    add(scene, box(0.025, h - WIN.sill, 0.04, x, (h + WIN.sill) / 2, zb, M.frame));
  }
  for (const y of [1.5, WIN.spring]) add(scene, box(2 * r, 0.03, 0.045, 0, y, zb, M.frame));
  const glass = new THREE.Shape(); archPath(glass, r, WIN.sill);
  const gl = mesh(new THREE.ShapeGeometry(glass, 40), M.glass, { cast: false, receive: false });
  gl.position.z = BACK - 0.14;
  add(scene, gl);
  // a marble sill
  add(scene, box(2 * WIN.w + 0.12, 0.04, 0.34, 0, WIN.sill - 0.02, BACK - 0.14, M.marble, 0.008));
}

// Outside: a Tuscan night - a deep blue sky, the moon, hills as
// silhouettes, and one farmhouse with its windows still lit.
{
  const c = document.createElement("canvas");
  c.width = 4; c.height = 256;
  const g = c.getContext("2d"), grad = g.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, "#05070f"); grad.addColorStop(0.5, "#0d1630"); grad.addColorStop(0.82, "#1d2a49"); grad.addColorStop(1, "#33405e");
  g.fillStyle = grad; g.fillRect(0, 0, 4, 256);
  const sky = new THREE.CanvasTexture(c); sky.colorSpace = THREE.SRGBColorSpace;
  const p = new THREE.Mesh(new THREE.PlaneGeometry(90, 34), new THREE.MeshBasicMaterial({ map: sky, fog: false }));
  p.position.set(0, 9, -45);
  scene.add(p);
  // stars
  const sc = document.createElement("canvas");
  sc.width = sc.height = 512;
  const sg = sc.getContext("2d");
  for (let i = 0; i < 420; i++) {
    const a = Math.random() * 0.8 + 0.2;
    sg.fillStyle = `rgba(255,252,240,${a})`;
    sg.beginPath(); sg.arc(Math.random() * 512, Math.random() * 512, Math.random() * 1.3 + 0.3, 0, 7); sg.fill();
  }
  const st = new THREE.CanvasTexture(sc);
  st.colorSpace = THREE.SRGBColorSpace;
  const stars = new THREE.Mesh(new THREE.PlaneGeometry(90, 26), new THREE.MeshBasicMaterial({ map: st, transparent: true, fog: false, depthWrite: false }));
  stars.position.set(0, 13, -44.5);
  scene.add(stars);
  const moon = new THREE.Mesh(new THREE.CircleGeometry(1.1, 40), new THREE.MeshBasicMaterial({ color: 0xf2f3ea, fog: false }));
  moon.position.set(3.2, 9.5, -44);
  scene.add(moon);
  const halo = new THREE.Mesh(new THREE.CircleGeometry(3.4, 40), new THREE.MeshBasicMaterial({ color: 0x9fb2d8, transparent: true, opacity: 0.18, fog: false, depthWrite: false }));
  halo.position.set(3.2, 9.5, -44.2);
  scene.add(halo);

  const hill = (z, y, amp, color, seed) => {
    const geo = new THREE.PlaneGeometry(90, 14, 120, 8);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), zz = pos.getZ(i);
      const h = Math.sin(x * 0.18 + seed) * 0.6 + Math.sin(x * 0.07 + seed * 2) * 1 + Math.sin(x * 0.41 + seed * 3) * 0.2;
      pos.setY(i, (h + 1.8) * amp * Math.max(0, (7 - zz) / 14));
    }
    geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color, fog: false }));
    m.position.set(0, y, z);
    scene.add(m);
    return m;
  };
  hill(-40, -1, 1.6, 0x1b2540, 1);
  hill(-30, -1.5, 1.4, 0x161e35, 2.5);
  hill(-20, -2.2, 1.1, 0x10172a, 4);
  hill(-12, -2.6, 0.7, 0x0a0f1d, 5.5);
  const cyM = new THREE.MeshBasicMaterial({ color: 0x070b15, fog: false });
  for (const [x, z, h] of [[2.6, -13, 2.2], [3.3, -13.5, 2.8], [3.9, -13, 2.1], [-3.5, -16, 2.4], [5.5, -22, 2.6], [6.1, -22.4, 2.2], [-1.2, -24, 2.3]]) {
    const cy = new THREE.Mesh(new THREE.ConeGeometry(0.28, h, 10), cyM);
    cy.position.set(x, -1.2 + h / 2, z);
    scene.add(cy);
  }
  const house = new THREE.Group();
  const dark = new THREE.MeshBasicMaterial({ color: 0x131a2b, fog: false });
  house.add(new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.2, 1.4), dark));
  const roof = new THREE.Mesh(new THREE.ConeGeometry(1.7, 0.5, 4), new THREE.MeshBasicMaterial({ color: 0x0d1220, fog: false }));
  roof.rotation.y = Math.PI / 4; roof.scale.set(1.1, 1, 0.62); roof.position.y = 0.85;
  house.add(roof);
  const tower = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.9, 0.7), dark);
  tower.position.set(-0.8, 0.5, 0);
  house.add(tower);
  const lit = new THREE.MeshBasicMaterial({ color: 0xffca72, fog: false });
  for (const [wx, wy] of [[-0.2, 0.1], [0.6, 0.1], [-0.8, 1.1]]) {
    const w = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.3), lit);
    w.position.set(wx, wy, 0.72);
    house.add(w);
  }
  house.position.set(-1.5, -0.3, -21);
  scene.add(house);
}

// back counter: cabinets with doors and brass knobs, a marble top
const FRIDGE = { x: -2.42, w: 0.76, h: 1.86, d: 0.72 };
const RANGE_W = 0.92, STOVE_X = FRIDGE.x + FRIDGE.w / 2 + 0.01 + RANGE_W / 2;   // right beside the fridge
function cabinets(x0, x1, z0, depth, frontZ) {
  const g = new THREE.Group();
  const w = x1 - x0, cx = (x0 + x1) / 2;
  g.add(box(w, 0.1, depth - 0.06, cx, 0.05, z0 + (depth - 0.06) / 2, M.black, 0, { cast: false }));
  g.add(box(w, 0.8, depth - 0.02, cx, 0.5, z0 + (depth - 0.02) / 2, M.wood));
  const n = Math.max(1, Math.round(w / 0.5)), dw = w / n;
  for (let i = 0; i < n; i++) {
    const x = x0 + dw * (i + 0.5);
    g.add(box(dw - 0.02, 0.52, 0.025, x, 0.4, frontZ + 0.012, M.wood, 0.006));
    g.add(box(dw - 0.02, 0.17, 0.025, x, 0.77, frontZ + 0.012, M.wood, 0.006));
    g.add(box(dw - 0.1, 0.4, 0.012, x, 0.4, frontZ + 0.028, M.wood, 0.004));
    const k = new THREE.Mesh(new THREE.SphereGeometry(0.014, 12, 8), M.brass);
    k.position.set(x, 0.77, frontZ + 0.04); k.castShadow = true;
    g.add(k);
  }
  return g;
}
{
  const z0 = BACK, front = BACK + COUNTER_D;
  const x0 = FRIDGE.x + FRIDGE.w / 2 + 0.01, sw = RANGE_W;
  if (STOVE_X - sw / 2 - x0 > 0.1) add(scene, cabinets(x0, STOVE_X - sw / 2, z0, COUNTER_D, front - 0.03));
  add(scene, cabinets(STOVE_X + sw / 2, -0.42, z0, COUNTER_D, front - 0.03));
  add(scene, cabinets(0.42, W, z0, COUNTER_D, front - 0.03));
  const topY = COUNTER_TOP - 0.02;
  if (STOVE_X - sw / 2 - x0 > 0.1) add(scene, box(STOVE_X - sw / 2 - x0, 0.04, COUNTER_D + 0.03, (x0 + STOVE_X - sw / 2) / 2, topY, z0 + (COUNTER_D + 0.03) / 2, M.marble, 0.01));
  add(scene, box(W - (STOVE_X + sw / 2), 0.04, COUNTER_D + 0.03, (W + STOVE_X + sw / 2) / 2, topY, z0 + (COUNTER_D + 0.03) / 2, M.marble, 0.01));
  // a farmhouse sink under the window, with a brass tap
  add(scene, box(0.84, 0.3, 0.06, 0, 0.77, front + 0.0, M.ceramic, 0.02));
  add(scene, box(0.84, 0.06, 0.6, 0, 0.64, BACK + 0.33, M.ceramic, 0.01));
  add(scene, box(0.72, 0.012, 0.46, 0, COUNTER_TOP - 0.035, BACK + 0.34, M.basin, 0, { cast: false }));
  const tap = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, COUNTER_TOP, BACK + 0.08), new THREE.Vector3(0, COUNTER_TOP + 0.26, BACK + 0.1),
    new THREE.Vector3(0, COUNTER_TOP + 0.3, BACK + 0.2), new THREE.Vector3(0, COUNTER_TOP + 0.2, BACK + 0.3),
  ]);
  add(scene, mesh(new THREE.TubeGeometry(tap, 30, 0.013, 10), M.brass));
  // tiled splashback, around the window
  const tz = BACK + 0.006, band = 0.56;
  add(scene, box(2 * W, band, 0.012, 0, COUNTER_TOP + band / 2, tz, M.tiles, 0, { cast: false }));
  // a plaster hood over the stove, going up to the ceiling
  const hg = new THREE.BoxGeometry(RANGE_W + 0.1, 0.55, 0.62, 1, 1, 1);
  const hp = hg.attributes.position;
  for (let i = 0; i < hp.count; i++) if (hp.getY(i) > 0) { hp.setX(i, hp.getX(i) * 0.55); hp.setZ(i, hp.getZ(i) * 0.6 - 0.12); }
  hg.computeVertexNormals();
  hg.translate(STOVE_X, 1.88, BACK + 0.31);
  add(scene, mesh(hg, M.hood));
  add(scene, box(0.56, 0.06, 0.4, STOVE_X, 2.17, BACK + 0.2, M.beam));
  add(scene, box(0.52, CEIL - 2.2, 0.36, STOVE_X, (CEIL + 2.2) / 2, BACK + 0.18, M.hood));
  add(scene, box(RANGE_W + 0.16, 0.1, 0.68, STOVE_X, 1.58, BACK + 0.34, M.beam, 0.01));
  // two open shelves right of the window
  for (const y of SHELVES) {
    add(scene, box(1.5, 0.045, 0.28, 1.85, y, BACK + 0.14, M.beam, 0.006));
    for (const x of [1.25, 2.45]) add(scene, box(0.04, 0.16, 0.2, x, y - 0.1, BACK + 0.1, M.beam));
  }
}

// the island: dark wood base with doors, a thick marble top
const ISLAND = { x: 0, z: 0.3, w: 2.6, d: 1.25, top: 0.96 };
{
  const { x, z, w, d, top } = ISLAND, bw = w - 0.3, bd = d - 0.3, front = z + bd / 2;
  add(scene, box(bw, top - 0.06, bd, x, (top - 0.06) / 2, z, M.wood));
  for (let i = 0; i < 4; i++) {
    const dx = x - bw / 2 + bw / 4 * (i + 0.5);
    add(scene, box(bw / 4 - 0.03, 0.66, 0.025, dx, 0.44, front + 0.012, M.wood, 0.006));
    add(scene, box(bw / 4 - 0.14, 0.52, 0.012, dx, 0.44, front + 0.028, M.wood, 0.004));
    const k = new THREE.Mesh(new THREE.SphereGeometry(0.015, 12, 8), M.brass);
    k.position.set(dx + (i % 2 ? -1 : 1) * (bw / 8 - 0.05), 0.62, front + 0.045); k.castShadow = true;
    scene.add(k);
  }
  add(scene, box(bw + 0.02, 0.08, bd + 0.02, x, 0.04, z, M.black, 0, { cast: false }));
  add(scene, box(w, 0.07, d, x, top - 0.035, z, M.marble, 0.02));
  // the big dark cutting board
  add(scene, box(1.5, 0.04, 0.72, x, top + 0.02, z - 0.02, M.board, 0.012));
}

/* ---------- spots: the things you can use ---------- */
const spots = new Map();   // id -> { group, meshes: [{ mesh, base, glow }], proxies: [] }
const proxyMat = new THREE.MeshBasicMaterial({ visible: false });
function spot(id, group, { meshes, proxy } = {}) {
  const s = spots.get(id) || { id, group, meshes: [], proxies: [] };
  spots.set(id, s);
  const list = meshes || [];
  if (!meshes) group.traverse((o) => { if (o.isMesh) list.push(o); });
  for (const m of list) s.meshes.push({ mesh: m, base: m.material, glow: null });
  // an invisible box a little bigger than the thing, so thin things (the
  // knife) are easy to hit and overlapping things (the pot on the stove)
  // pick whichever box is nearer the camera
  group.updateMatrixWorld(true);
  const b = proxy || new THREE.Box3();
  if (!proxy) for (const m of list) b.expandByObject(m);
  const size = b.getSize(new THREE.Vector3()).max(new THREE.Vector3(0.09, 0.06, 0.09)).addScalar(0.03);
  const p = new THREE.Mesh(new THREE.BoxGeometry(size.x, size.y, size.z), proxyMat);
  b.getCenter(p.position);
  p.userData.spot = id;
  p.userData.offset = p.position.clone().sub(group.position);
  scene.add(p);
  s.proxies.push(p);
  s.home = { pos: group.position.clone(), quat: group.quaternion.clone() };
  return s;
}

/* ---------- throwing a tool ----------
   Let go of a hand tool over empty room and it leaves your hand for real:
   it flies, bounces off the counters and the floor, then after a few
   seconds it lifts and floats back to where it belongs. */
// Everything that isn't built into the room: the loose kit can be picked up
// and chucked. The range and the fridge stay where they are.
// Everything in the room can be picked up and thrown - tools, cookbooks,
// the bin, the fridge, the lot.
const FIXED = new Set();
// The stove and the oven are one object, so they move as one: everything
// below works on the "unit", and the oven's half follows the stove's.
const UNIT = { Bake: "Heat" };
const unitOf = (id) => UNIT[id] || id;
const groupSpots = (g) => [...spots.values()].filter((s) => s.group === g);
const AIRBORNE = new Map();          // id -> the flight in progress
const GRAVITY = -9.5, BOUNCE = 0.42, REST_MS = 2600, HOME_MS = 850;
const canThrow = (id) => spots.has(unitOf(id)) && !FIXED.has(unitOf(id));

// The solid furniture, as boxes. A thrown thing bounces off these instead
// of sailing inside them, which used to leave it stuck in the woodwork.
let SOLIDS = null;
function solids() {
  if (SOLIDS) return SOLIDS;
  const b = (x0, y0, z0, x1, y1, z1) => new THREE.Box3(new THREE.Vector3(x0, y0, z0), new THREE.Vector3(x1, y1, z1));
  const i = ISLAND;
  SOLIDS = [
    b(i.x - i.w / 2, 0, i.z - i.d / 2, i.x + i.w / 2, i.top, i.z + i.d / 2),                   // the island
    b(-W, 0, BACK, W, COUNTER_TOP, BACK + COUNTER_D),                                          // the back counter
    b(FRIDGE.x - FRIDGE.w / 2, 0, BACK, FRIDGE.x + FRIDGE.w / 2, FRIDGE.h, BACK + FRIDGE.d),    // the fridge
    b(STOVE_X - 0.6, 1.58, BACK, STOVE_X + 0.6, CEIL, BACK + 0.66),                             // the hood
    b(1.1, SHELVES[0] - 0.05, BACK, 2.7, SHELVES[0], BACK + 0.3),                               // the shelves
    b(1.1, SHELVES[1] - 0.05, BACK, 2.7, SHELVES[1], BACK + 0.3),
  ];
  return SOLIDS;
}
// Push the point out of anything it has ended up inside, the short way, and
// bounce whatever speed it had in that direction.
function collide(p, v, spin) {
  let hit = false;
  for (const box of solids()) {
    if (p.x <= box.min.x || p.x >= box.max.x || p.y <= box.min.y || p.y >= box.max.y || p.z <= box.min.z || p.z >= box.max.z) continue;
    const out = [
      ["x", box.min.x - p.x, -1], ["x", box.max.x - p.x, 1],
      ["y", box.min.y - p.y, -1], ["y", box.max.y - p.y, 1],
      ["z", box.min.z - p.z, -1], ["z", box.max.z - p.z, 1],
    ].sort((a, c) => Math.abs(a[1]) - Math.abs(c[1]))[0];
    p[out[0]] += out[1];
    if (Math.sign(v[out[0]]) !== out[2]) v[out[0]] *= -BOUNCE;
    v.multiplyScalar(0.86);
    spin.multiplyScalar(0.7);
    hit = true;
  }
  return hit;
}
function screenRay(sx, sy, through) {
  const r = canvas.getBoundingClientRect();
  const v = new THREE.Vector3(((sx - r.left) / r.width) * 2 - 1, -((sy - r.top) / r.height) * 2 + 1, 0.5).unproject(camera);
  const dir = v.sub(camera.position).normalize();
  return { dir, point: camera.position.clone().addScaledVector(dir, camera.position.distanceTo(through)) };
}
// Picking a tool up: the object itself follows the pointer, held at the
// distance it normally sits at, so it keeps its size and its shadow.
const HELD = { id: null, dist: 0 };
function grab(id, sx, sy) {
  const u = unitOf(id), s = spots.get(u);
  if (!s || elFor(id)?.classList.contains("locked")) return false;
  endFlight(u);                                    // grabbed out of the air
  HELD.id = u;
  HELD.dist = camera.position.distanceTo(s.home.pos) * 0.9;
  s.group.visible = true;
  hold(u, sx, sy);
  return true;
}
function hold(id, sx, sy) {
  const s = spots.get(unitOf(id));
  if (!s || HELD.id !== unitOf(id)) return;
  const r = canvas.getBoundingClientRect();
  const x = Math.min(Math.max(sx, r.left + 6), r.right - 6);
  const y = Math.min(Math.max(sy, r.top + 6), r.bottom - 6);
  const { dir } = screenRay(x, y, s.home.pos);
  s.group.position.copy(camera.position).addScaledVector(dir, HELD.dist);
  s.group.quaternion.copy(s.home.quat);
  s.group.rotateX(-0.4);                           // tipped up, as if held
  s.group.rotateZ(0.22);
  moveProxies(s);
  dirty();
}
// Let go without throwing: it floats back to its place.
function endFlight(id) {
  const f = AIRBORNE.get(id);
  if (!f) return;
  if (f.timer) clearTimeout(f.timer);
  anims = anims.filter((a) => a !== f);
  AIRBORNE.delete(id);
}
function sendHome(id) {
  id = unitOf(id);
  const s = spots.get(id);
  if (HELD.id === id) HELD.id = null;
  if (!s) return;
  endFlight(id);
  if (s.group.position.distanceToSquared(s.home.pos) < 0.0004) {
    s.group.quaternion.copy(s.home.quat);
    moveProxies(s);
    dirty();
    return;
  }
  const flight = { g: s.group, id, s, phase: "home", last: performance.now(), t0: -1e9, v: new THREE.Vector3(), spin: new THREE.Vector3(),
    from: { pos: s.group.position.clone(), quat: s.group.quaternion.clone() }, homeAt: performance.now(), step: null };
  startHoming(flight, s);
}
function startHoming(flight, s) {
  const home = s.home;
  flight.step = function (now) {
    const t = Math.min(1, (now - this.homeAt) / HOME_MS);
    const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    this.g.position.lerpVectors(this.from.pos, home.pos, e);
    this.g.position.y += Math.sin(e * Math.PI) * 0.22;
    this.g.quaternion.copy(this.from.quat).slerp(home.quat, e);
    moveProxies(s);
    if (t >= 1) {
      this.g.position.copy(home.pos);
      this.g.quaternion.copy(home.quat);
      AIRBORNE.delete(this.id);
      return false;
    }
  };
  AIRBORNE.set(flight.id, flight);
  anims = anims.filter((a) => a.g !== flight.g);
  anims.push(flight);
  dirty();
}

function throwTool(id, sx, sy, vpx, vpy, rider) {
  id = unitOf(id);
  const s = spots.get(id);
  if (!canThrow(id) || !s) return false;
  // whatever was sitting on the stove goes with it
  if (id === "Heat" && !rider) {
    const jitter = () => (Math.random() - 0.5) * 300;
    for (const r of ["Boil", "Fry"]) throwTool(r, sx + jitter() / 6, sy + jitter() / 6, vpx * 0.8 + jitter(), vpy * 0.8 + jitter(), true);
  }
  const g = s.group, home = s.home;
  const held = HELD.id === id;
  const point = held ? g.position.clone() : screenRay(sx, sy, home.pos).point;
  if (held) HELD.id = null;
  const dist = camera.position.distanceTo(point);
  const r = canvas.getBoundingClientRect();
  // pixels per second at that distance, in metres
  const perPx = (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * dist) / r.height;
  const right = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0);
  const up = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 1);
  const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion).setY(0).normalize();
  const v = right.multiplyScalar(vpx * perPx).add(up.multiplyScalar(-vpy * perPx));
  const speed = Math.min(v.length(), 9);
  v.setLength(speed).addScaledVector(fwd, speed * 0.45 + 0.6);
  g.visible = true;
  g.position.copy(point);
  const flight = {
    g, id, s,
    v,
    spin: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize().multiplyScalar(2 + speed * 1.4),
    last: performance.now(),
    landed: null,
    phase: "fly",
    // stop animating, wait out the rest of the time, then float home
    sleep(now) {
      const wait = Math.max(0, REST_MS - (now - this.t0));
      this.timer = setTimeout(() => {
        this.timer = null;
        if (AIRBORNE.get(this.id) !== this) return;    // picked up meanwhile
        AIRBORNE.delete(this.id);
        sendHome(this.id);
      }, wait);
      return false;
    },
    step(now) {
      const dt = Math.min(0.034, (now - this.last) / 1000);
      this.last = now;
      if (this.phase === "fly") {
        this.v.y += GRAVITY * dt;
        this.g.position.addScaledVector(this.v, dt);
        const p = this.g.position;
        // the walls and the back of the room
        for (const [axis, lo, hi] of [["x", -W + 0.2, W - 0.2], ["z", BACK + 0.15, 3.2]]) {
          if (p[axis] < lo) { p[axis] = lo; this.v[axis] *= -BOUNCE; }
          if (p[axis] > hi) { p[axis] = hi; this.v[axis] *= -BOUNCE; }
        }
        if (p.y > CEIL - 0.25) { p.y = CEIL - 0.25; this.v.y *= -BOUNCE; }   // the ceiling
        if (p.y <= 0) {                                                       // the floor
          p.y = 0;
          this.v.y *= -BOUNCE;
          this.v.x *= 0.78; this.v.z *= 0.78;
          this.spin.multiplyScalar(0.6);
        }
        collide(p, this.v, this.spin);
        if (this.spin.lengthSq() > 0.0001) {
          const q = new THREE.Quaternion().setFromAxisAngle(this.spin.clone().normalize(), this.spin.length() * dt);
          this.g.quaternion.premultiply(q);
        }
        // Come to rest, and then stop drawing: a thing sitting still on the
        // floor shouldn't keep the whole room re-rendering every frame.
        if (this.v.lengthSq() < 0.05 && Math.abs(this.v.y) < 0.35) {
          this.still = (this.still || 0) + dt;
          if (this.still > 0.25) { this.v.set(0, 0, 0); this.spin.setScalar(0); return this.sleep(now); }
        } else this.still = 0;
        if (now - this.t0 > REST_MS) return this.sleep(now);
      } else {
        // floats back: a gentle arc up and across, easing in and out
        const t = Math.min(1, (now - this.homeAt) / HOME_MS);
        const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        this.g.position.lerpVectors(this.from.pos, home.pos, e);
        this.g.position.y += Math.sin(e * Math.PI) * 0.32;
        this.g.quaternion.copy(this.from.quat).slerp(home.quat, e);
        if (t >= 1) {
          this.g.position.copy(home.pos);
          this.g.quaternion.copy(home.quat);
          AIRBORNE.delete(this.id);
          moveProxies(this.s);
          return false;
        }
      }
      moveProxies(this.s);
    },
  };
  flight.t0 = performance.now();
  AIRBORNE.set(id, flight);
  anims = anims.filter((a) => a.g !== g);
  anims.push(flight);
  dirty();
  return true;
}
// the invisible hit boxes travel with the thing, so you can still grab it
function moveProxies(s) {
  for (const q of groupSpots(s.group)) {
    for (const p of q.proxies) p.position.copy(q.group.position).add(p.userData.offset);
  }
}

const gltf = new GLTFLoader();
// A Poly Haven model: scaled to `width` metres across (or by `scale`), set
// down on `y`, turned by `ry`.
async function model(name, { x = 0, y = 0, z = 0, ry = 0, width, scale = 1 }) {
  const g = (await gltf.loadAsync(`${ART}models/${name}/${name}.gltf`)).scene;
  g.traverse((o) => { if (o.isMesh) { o.castShadow = o.receiveShadow = true; } });
  const b = new THREE.Box3().setFromObject(g), size = b.getSize(new THREE.Vector3());
  const k = width ? width / Math.max(size.x, size.z) : scale;
  const holder = new THREE.Group();
  g.scale.setScalar(k);
  g.position.set(-(b.min.x + size.x / 2) * k, -b.min.y * k, -(b.min.z + size.z / 2) * k);
  holder.add(g);
  holder.position.set(x, y, z);
  holder.rotation.y = ry;
  scene.add(holder);
  return holder;
}

// hand-made things Poly Haven doesn't have
function knife() {
  const g = new THREE.Group();
  const s = new THREE.Shape();
  s.moveTo(0, 0); s.lineTo(0.2, 0.004); s.quadraticCurveTo(0.26, 0.012, 0.29, 0.05);
  s.quadraticCurveTo(0.2, 0.052, 0.0, 0.052); s.lineTo(0, 0);
  const blade = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 0.002, bevelEnabled: true, bevelThickness: 0.0008, bevelSize: 0.0015, bevelSegments: 1 }), M.steel);
  blade.rotation.x = -Math.PI / 2;
  blade.castShadow = true;
  g.add(blade);
  const handle = new THREE.Mesh(new RoundedBoxGeometry(0.13, 0.022, 0.03, 3, 0.009), M.board);
  handle.position.set(-0.066, 0.011, -0.024);
  handle.castShadow = true;
  g.add(handle);
  for (const hx of [-0.03, -0.066, -0.1]) {
    const r = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.024, 10), M.brass);
    r.position.set(hx, 0.011, -0.024);
    g.add(r);
  }
  g.children.forEach((c) => (c.position.y += 0.002));
  return g;
}
function grillPan() {
  const g = new THREE.Group(), s = 0.3;
  g.add(box(s, 0.016, s, 0, 0.008, 0, M.iron, 0.004));
  for (const [w, d, x, z] of [[s, 0.012, 0, s / 2], [s, 0.012, 0, -s / 2], [0.012, s, s / 2, 0], [0.012, s, -s / 2, 0]]) g.add(box(w, 0.045, d, x, 0.03, z, M.iron, 0.004));
  for (let i = 0; i < 8; i++) g.add(box(s - 0.03, 0.012, 0.01, 0, 0.022, -s / 2 + 0.03 + i * (s - 0.06) / 7, M.iron));
  const h = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.014, 0.22, 12), M.iron);
  h.rotation.z = Math.PI / 2 - 0.12; h.position.set(s / 2 + 0.11, 0.05, 0); h.castShadow = true;
  g.add(h);
  return g;
}
function blender() {
  const g = new THREE.Group();
  g.add(box(0.17, 0.13, 0.17, 0, 0.065, 0, M.enamel, 0.03));
  for (const x of [-0.04, 0, 0.04]) {
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.01, 12), M.chrome);
    b.rotation.x = Math.PI / 2; b.position.set(x, 0.07, 0.087);
    g.add(b);
  }
  g.add(box(0.12, 0.03, 0.12, 0, 0.145, 0, M.chrome, 0.01));
  const pts = [[0.045, 0], [0.058, 0.02], [0.066, 0.14], [0.072, 0.24], [0.071, 0.245]].map(([r, y]) => new THREE.Vector2(r, y));
  const jar = new THREE.Mesh(new THREE.LatheGeometry(pts, 32), M.jar);
  jar.position.y = 0.16;
  g.add(jar);
  const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.074, 0.074, 0.025, 32), M.black);
  lid.position.y = 0.415; lid.castShadow = true;
  g.add(lid);
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.011, 8, 20, Math.PI), M.black);
  handle.rotation.z = -Math.PI / 2; handle.position.set(0.075, 0.28, 0);
  g.add(handle);
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  return g;
}
// A big Tuscan range: cream enamel, cast-iron grates over four burners,
// brass knobs and rail, an oven door with a window. Returns the parts that
// are the stove (Heat) and the parts that are the oven (Bake).
function range() {
  const g = new THREE.Group(), w = RANGE_W, d = 0.64, h = COUNTER_TOP - 0.02, fz = d / 2;
  const hob = [], oven = [];
  const put = (list, m) => { g.add(m); list.push(m); return m; };
  const glassDark = new THREE.MeshStandardMaterial({ color: 0x0c0a09, metalness: 0.2, roughness: 0.08 });
  put(hob, box(w, h - 0.08, d, 0, 0.08 + (h - 0.08) / 2, 0, M.enamel, 0.015));
  put(hob, box(w - 0.02, 0.08, d - 0.06, 0, 0.04, -0.02, M.black, 0, { cast: false }));
  put(hob, box(w, 0.02, d, 0, h + 0.005, 0, M.iron, 0.004));                 // the cooktop
  put(hob, box(w, 0.14, 0.035, 0, h + 0.075, -fz + 0.018, M.enamel, 0.01));  // backguard
  put(hob, box(w - 0.04, 0.012, 0.012, 0, h + 0.13, -fz + 0.04, M.brass, 0.004));
  for (const bx of [-0.22, 0.22]) for (const bz of [-0.13, 0.12]) {
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.08, 0.018, 28), M.iron);
    ring.position.set(bx, h + 0.022, bz); ring.castShadow = ring.receiveShadow = true;
    put(hob, ring);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.04, 0.016, 24), M.brass);
    cap.position.set(bx, h + 0.036, bz); cap.castShadow = true;
    put(hob, cap);
  }
  for (const gx of [-0.22, 0.22]) {                                          // two grates
    const gy = h + 0.052;
    for (const x of [-0.19, 0, 0.19]) put(hob, box(0.014, 0.014, d - 0.1, gx + x, gy, 0, M.iron));
    for (const z of [-0.25, -0.01, 0.23]) put(hob, box(0.4, 0.014, 0.014, gx, gy, z, M.iron));
  }
  for (let i = 0; i < 5; i++) {                                              // brass knobs
    const k = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.026, 0.035, 20), M.brass);
    k.rotation.x = Math.PI / 2; k.position.set(-0.32 + i * 0.16, h - 0.07, fz + 0.018); k.castShadow = true;
    put(hob, k);
  }
  const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, w - 0.1, 14), M.brass);
  rail.rotation.z = Math.PI / 2; rail.position.set(0, h - 0.15, fz + 0.055); rail.castShadow = true;
  put(oven, rail);
  for (const x of [-(w - 0.14) / 2, (w - 0.14) / 2]) put(oven, box(0.02, 0.02, 0.06, x, h - 0.15, fz + 0.03, M.brass));
  put(oven, box(w - 0.08, 0.5, 0.03, 0, 0.47, fz + 0.015, M.enamel, 0.012));  // the oven door
  put(oven, box(w - 0.34, 0.24, 0.006, 0, 0.5, fz + 0.032, glassDark, 0.004, { cast: false }));
  put(oven, box(w - 0.32, 0.26, 0.004, 0, 0.5, fz + 0.03, M.brass, 0.004, { cast: false }));
  put(hob, box(w - 0.08, 0.13, 0.02, 0, 0.14, fz + 0.01, M.enamel, 0.01));   // drawer
  put(hob, box(0.16, 0.014, 0.02, 0, 0.15, fz + 0.03, M.brass, 0.005));
  return { g, hob, oven, d };
}
function fridge() {
  const g = new THREE.Group(), { w, h, d } = FRIDGE;
  g.add(box(w, h, d, 0, h / 2, 0, M.enamel, 0.07));
  g.add(box(w - 0.02, 0.012, 0.01, 0, h * 0.68, d / 2 + 0.002, M.black, 0, { cast: false }));
  for (const [y0, y1] of [[h * 0.72, h * 0.9], [h * 0.3, h * 0.62]]) {
    const hnd = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, y1 - y0, 12), M.chrome);
    hnd.position.set(w / 2 - 0.09, (y0 + y1) / 2, d / 2 + 0.04); hnd.castShadow = true;
    g.add(hnd);
    for (const y of [y0, y1]) g.add(box(0.02, 0.02, 0.04, w / 2 - 0.09, y, d / 2 + 0.02, M.chrome));
  }
  const badge = box(0.12, 0.025, 0.004, 0, h * 0.64, d / 2 + 0.003, M.chrome, 0, { cast: false });
  g.add(badge);
  return g;
}
function recipeBook() {
  const g = new THREE.Group();
  const cover = new THREE.MeshStandardMaterial({ map: tex("brown_leather_diff.jpg", true), normalMap: tex("brown_leather_nor.jpg"), color: 0x8a3524, roughness: 0.6 });
  g.add(box(0.26, 0.012, 0.33, 0, 0.006, 0, cover, 0.004));
  g.add(box(0.245, 0.04, 0.315, 0.004, 0.032, 0, M.paper, 0.003));
  g.add(box(0.26, 0.012, 0.33, 0, 0.058, 0, cover, 0.004));
  g.add(box(0.012, 0.064, 0.33, -0.128, 0.032, 0, cover, 0.005));
  g.add(box(0.2, 0.002, 0.012, 0.01, 0.065, -0.1, M.brass, 0, { cast: false }));
  g.add(box(0.2, 0.002, 0.012, 0.01, 0.065, 0.1, M.brass, 0, { cast: false }));
  return g;
}
function notepad() {
  const c = document.createElement("canvas");
  c.width = 256; c.height = 320;
  const x = c.getContext("2d");
  x.fillStyle = "#f7f0dc"; x.fillRect(0, 0, 256, 320);
  x.strokeStyle = "rgba(90,120,170,.45)"; x.lineWidth = 2;
  for (let y = 90; y < 320; y += 30) { x.beginPath(); x.moveTo(0, y); x.lineTo(256, y); x.stroke(); }
  x.fillStyle = "#3b2a1c"; x.font = "600 58px Caveat, cursive"; x.fillText("Notes", 60, 70);
  x.font = "600 30px Caveat, cursive"; x.fillText("try: ?? + ??", 30, 144); x.fillText("fill in later", 30, 204);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const g = new THREE.Group();
  g.add(box(0.16, 0.014, 0.2, 0, 0.007, 0, M.paper, 0.002));
  const top = new THREE.Mesh(new THREE.PlaneGeometry(0.156, 0.196), new THREE.MeshStandardMaterial({ map: t, roughness: 0.9 }));
  top.rotation.x = -Math.PI / 2; top.position.y = 0.0145; top.receiveShadow = true;
  g.add(top);
  const pencil = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.17, 6), new THREE.MeshStandardMaterial({ color: 0xd9a33a, roughness: 0.5 }));
  pencil.rotation.z = Math.PI / 2; pencil.rotation.y = 0.5; pencil.position.set(0.02, 0.019, 0.02); pencil.castShadow = true;
  g.add(pencil);
  return g;
}
const BOOK_COLORS = {
  American: 0x2d4a7a, Italian: 0x8e2a1f, Mexican: 0x2f6b3a, French: 0x1f3565, "Middle Eastern": 0xb07a2a,
  Indian: 0xc2601e, Chinese: 0xa11d1d, Japanese: 0xe4ddd0, Korean: 0x3a6f78, Thai: 0x5e3a78, "Fast Food": 0xd6a21f,
};
const bookGroup = new THREE.Group();
scene.add(bookGroup);
function buildBooks() {
  const els = [...stageEl.querySelectorAll(".cookbook")];
  const names = els.map((e) => e.dataset.cuisine);
  if (bookGroup.userData.names === names.join("|")) return;
  bookGroup.userData.names = names.join("|");
  for (const id of names.concat(bookGroup.userData.old || [])) {
    const s = spots.get(id);
    if (s) { s.proxies.forEach((p) => scene.remove(p)); spots.delete(id); }
  }
  bookGroup.userData.old = names;
  bookGroup.clear();
  let x = 1.16;
  names.forEach((name, i) => {
    const w = 0.05 + ((i * 37) % 5) * 0.006, h = 0.24 + ((i * 53) % 4) * 0.018;
    const cover = new THREE.MeshStandardMaterial({ map: tex("brown_leather_diff.jpg", true), normalMap: tex("brown_leather_nor.jpg"), color: BOOK_COLORS[name] || 0x7a4a2a, roughness: 0.55 });
    const g = new THREE.Group();
    g.add(box(w, h, 0.2, 0, h / 2, 0, cover, 0.005));
    g.add(box(w + 0.001, 0.012, 0.18, 0, h - 0.035, 0.012, M.brass, 0, { cast: false }));
    g.add(box(w + 0.001, 0.012, 0.18, 0, 0.04, 0.012, M.brass, 0, { cast: false }));
    g.position.set(x + w / 2, SHELVES[1] + 0.0225, BACK + 0.14);
    if (i === names.length - 1) { g.rotation.z = 0.28; g.position.x += 0.06; }
    bookGroup.add(g);
    spot(name, g);
    x += w + 0.006;
  });
  sync();
}

/* ---------- mirroring the page's state ---------- */
const ANIMS = ["shake", "unlocking", "gulp", "working"];
function elFor(id) {
  return stageEl.querySelector(`[data-tech="${id}"]`) || stageEl.querySelector(`[data-cuisine="${CSS.escape(id)}"]`) || document.getElementById(id);
}
function sync() {
  for (const s of spots.values()) {
    const el = elFor(s.id);
    if (!el) continue;
    const locked = el.classList.contains("locked");
    const lit = el.classList.contains("target") || (el.classList.contains("hover") && !locked);
    for (const m of s.meshes) {
      if (locked) m.mesh.material = LOCKED;
      else if (lit) {
        if (!m.glow) {
          m.glow = m.base.clone();
          if (m.glow.emissive) { m.glow.emissive = new THREE.Color(0xff9a40); m.glow.emissiveIntensity = 0.28; }
        }
        m.mesh.material = m.glow;
      } else m.mesh.material = m.base;
    }
  }
  dirty();
}
function animate(id, kind) {
  const s = spots.get(id);
  id = unitOf(id);
  // in the air, or in your hand: leave it be. The wiggle used to wipe the
  // flight out from under it, which froze the thing wherever it was.
  if (!s || AIRBORNE.has(id) || HELD.id === id) return;
  const g = s.group, t0 = performance.now();
  const rest = g.userData.rest || (g.userData.rest = { ry: g.rotation.y, rz: g.rotation.z, s: g.scale.clone(), y: g.position.y });
  anims = anims.filter((a) => a.g !== g);
  const dur = kind === "unlocking" ? 900 : 420;
  anims.push({
    g,
    step(now) {
      const t = Math.min(1, (now - t0) / dur), e = 1 - t;
      g.rotation.z = rest.rz; g.scale.copy(rest.s); g.position.y = rest.y;
      if (t >= 1) return false;
      if (kind === "shake") g.rotation.z = rest.rz + Math.sin(t * 40) * 0.05 * e;
      if (kind === "working") g.position.y = rest.y + Math.abs(Math.sin(t * Math.PI * 3)) * 0.025 * e;
      if (kind === "gulp") g.scale.set(rest.s.x * (1 + 0.1 * Math.sin(t * Math.PI) ), rest.s.y * (1 - 0.12 * Math.sin(t * Math.PI)), rest.s.z);
      if (kind === "unlocking") g.scale.copy(rest.s).multiplyScalar(1 + 0.18 * Math.sin(t * Math.PI));
    },
  });
  dirty();
}
new MutationObserver((records) => {
  let books = false;
  for (const r of records) {
    if (r.type === "childList") { books = true; continue; }
    const el = r.target, now = el.className, before = r.oldValue || "";
    for (const a of ANIMS) if (now.includes(a) && !before.includes(a)) {
      animate(el.dataset.tech || el.dataset.cuisine || el.id, a);
    }
  }
  if (books) buildBooks();
  sync();
}).observe(stageEl, { subtree: true, childList: true, attributes: true, attributeFilter: ["class"], attributeOldValue: true });

/* ---------- light ----------
   Night: the room itself is dark, and you see it by its lamps - two
   pendants over the island, the light under the hood on the stove, and
   small lamps that pick out the shelf and the blender. */
const hemi = new THREE.HemisphereLight(0x39465f, 0x1a120c, 0.22);
scene.add(hemi);
// moonlight through the window: cool, weak, and almost shadowless
const moon = new THREE.DirectionalLight(0xa8c0ea, 0.55);
moon.position.set(2.4, 5.5, -9);
moon.target.position.set(0.2, 1.1, -0.6);
moon.castShadow = true;
moon.shadow.mapSize.set(1024, 1024);
Object.assign(moon.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: 1, far: 20 });
moon.shadow.bias = -0.0005; moon.shadow.normalBias = 0.02; moon.shadow.radius = 8;
scene.add(moon, moon.target);

// two pendants hanging over the island
const bulbMat = new THREE.MeshBasicMaterial({ color: 0xffe0ae });
function pendant(x, z) {
  const g = new THREE.Group();
  const shadeY = 2.06;
  const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, CEIL - shadeY - 0.1, 8), M.iron);
  cord.position.set(x, (CEIL + shadeY + 0.1) / 2 - 0.05, z);
  scene.add(cord);
  const shade = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.18, 32, 1, true), new THREE.MeshStandardMaterial({ color: 0x2a2724, metalness: 0.7, roughness: 0.45, side: THREE.DoubleSide }));
  shade.position.set(x, shadeY, z);
  shade.castShadow = true;
  scene.add(shade);
  const inner = new THREE.Mesh(new THREE.ConeGeometry(0.155, 0.17, 32, 1, true), new THREE.MeshBasicMaterial({ color: 0xffdca8, side: THREE.BackSide }));
  inner.position.set(x, shadeY, z);
  scene.add(inner);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.035, 16, 12), bulbMat);
  bulb.position.set(x, shadeY - 0.08, z);
  scene.add(bulb);
  const l = new THREE.SpotLight(0xffd9a4, 26, 5, 0.6, 0.55, 1.7);
  l.position.set(x, shadeY - 0.06, z);
  l.target.position.set(x * 0.75, ISLAND.top, ISLAND.z);
  l.castShadow = true;
  l.shadow.mapSize.set(1024, 1024);
  l.shadow.bias = -0.0004; l.shadow.normalBias = 0.02; l.shadow.radius = 4;
  scene.add(l, l.target);
  return g;
}
pendant(-0.95, ISLAND.z - 0.05);
pendant(0.95, ISLAND.z - 0.05);

// the light under the hood, pointed down at the stove
const hoodLight = new THREE.SpotLight(0xffc98c, 12, 3.2, 0.8, 0.6, 1.6);
hoodLight.position.set(STOVE_X, 1.62, BACK + 0.36);
hoodLight.target.position.set(STOVE_X, COUNTER_TOP, BACK + 0.34);
hoodLight.castShadow = true;
hoodLight.shadow.mapSize.set(1024, 1024);
hoodLight.shadow.bias = -0.0004; hoodLight.shadow.normalBias = 0.02;
scene.add(hoodLight, hoodLight.target);
const hoodPanel = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.3), new THREE.MeshBasicMaterial({ color: 0xffca8d }));
hoodPanel.rotation.x = Math.PI / 2;
hoodPanel.position.set(STOVE_X, 1.605, BACK + 0.36);
scene.add(hoodPanel);

// small lamps under the shelf: the jars and clock, and the blender corner
const shelfLight = new THREE.SpotLight(0xffd0a0, 4.5, 2.4, 1.1, 0.8, 1.7);
shelfLight.position.set(2.0, SHELVES[1] - 0.06, BACK + 0.26);
shelfLight.target.position.set(2.1, SHELVES[0], BACK + 0.2);
scene.add(shelfLight, shelfLight.target);
const cornerLight = new THREE.SpotLight(0xffd2a4, 6, 3, 1.0, 0.8, 1.7);
cornerLight.position.set(2.62, 1.75, BACK + 0.5);
cornerLight.target.position.set(2.62, COUNTER_TOP, BACK + 0.32);
scene.add(cornerLight, cornerLight.target);
// and a breath of warm light in the room, so nothing goes pure black
const fill = new THREE.PointLight(0xffd0a0, 1.6, 9, 1.6);
fill.position.set(0, 2.2, 2.2);
scene.add(fill);

new RGBELoader().load(ART + "hdri/warm_restaurant_1k.hdr", (t) => {
  t.mapping = THREE.EquirectangularReflectionMapping;
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromEquirectangular(t).texture;
  t.dispose(); pm.dispose();
  scene.traverse((o) => { if (o.isMesh && o.material.envMapIntensity !== undefined) o.material.envMapIntensity = 0.12; });
  dirty();
});

/* ---------- the camera, fitted to the room's box ---------- */
function resize() {
  const r = room.getBoundingClientRect();
  if (!r.width || !r.height) return;
  renderer.setSize(r.width, r.height, false);
  makeComposer(r.width, r.height);
  const aspect = r.width / r.height;
  camera.aspect = aspect;
  // keep the whole island (and a bit either side) in view on any shape of
  // screen: a narrow one gets a taller view instead of a cropped island
  const needHalfW = 0.6;
  const v = Math.max(44, THREE.MathUtils.radToDeg(2 * Math.atan(needHalfW / aspect)));
  camera.fov = Math.min(v, 75);
  camera.position.copy(CAM);
  camera.lookAt(LOOK);
  camera.updateProjectionMatrix();
  dirty();
}
// The island top, as a rectangle of the room element - where tiles live.
function boardRect() {
  const r = room.getBoundingClientRect();
  const { x, z, w, d, top } = ISLAND;
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const [cx, cz] of [[x - w / 2, z - d / 2], [x + w / 2, z - d / 2], [x - w / 2, z + d / 2], [x + w / 2, z + d / 2]]) {
    const p = new THREE.Vector3(cx, top, cz).project(camera);
    const sx = (p.x + 1) / 2 * r.width, sy = (1 - p.y) / 2 * r.height;
    x0 = Math.min(x0, sx); x1 = Math.max(x1, sx); y0 = Math.min(y0, sy); y1 = Math.max(y1, sy);
  }
  x0 = Math.max(x0 + (x1 - x0) * 0.03, 4); x1 = Math.min(x1 - (x1 - x0) * 0.03, r.width - 4);
  y1 = Math.min(y1, r.height - 4);
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
function pick(cx, cy, skip) {
  const r = canvas.getBoundingClientRect();
  if (cx < r.left || cx > r.right || cy < r.top || cy > r.bottom) return null;
  ndc.set((cx - r.left) / r.width * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  const proxies = [];
  // whatever is in your hand isn't a thing you can drop onto
  for (const s of spots.values()) {
    if (s.id === skip || unitOf(s.id) === HELD.id) continue;
    proxies.push(...s.proxies);
  }
  // nearest first, but a found tool beats a black one in front of it (the
  // pan on the stove shouldn't hide the stove before you have a pan)
  const hits = ray.intersectObjects(proxies, false).map((h) => h.object.userData.spot);
  return hits.find((id) => !elFor(id)?.classList.contains("locked")) || hits[0] || null;
}

// Is this point roughly where the tool lives? Dropping a tool back on its
// own empty place is how you use it on itself (the clock twice = fermenting).
function atHome(id, cx, cy) {
  const s = spots.get(unitOf(id));
  if (!s) return false;
  const r = canvas.getBoundingClientRect();
  const p = s.home.pos.clone().project(camera);
  const hx = r.left + ((p.x + 1) / 2) * r.width, hy = r.top + ((1 - p.y) / 2) * r.height;
  return Math.hypot(cx - hx, cy - hy) < 55;
}

// A picture of one spot on its own, for the copy that follows the pointer.
let snapR = null;
const SNAPS = new Map();
function snapshot(id) {
  if (SNAPS.has(id)) return SNAPS.get(id);
  const s = spots.get(id);
  if (!s) return "";
  if (!snapR) {
    snapR = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    snapR.setPixelRatio(Math.min(devicePixelRatio, 2));
    snapR.setSize(140, 140);
    snapR.outputColorSpace = THREE.SRGBColorSpace;
    snapR.toneMapping = THREE.ACESFilmicToneMapping;
    snapR.toneMappingExposure = 1.1;
  }
  const b = new THREE.Box3();
  for (const m of s.meshes) b.expandByObject(m.mesh);
  const c = b.getCenter(new THREE.Vector3()), rad = b.getSize(new THREE.Vector3()).length() / 2;
  const cam = new THREE.PerspectiveCamera(30, 1, 0.01, 50);
  const dir = CAM.clone().sub(c).normalize();
  cam.position.copy(c).addScaledVector(dir, rad / Math.sin(THREE.MathUtils.degToRad(14)));
  cam.lookAt(c);
  const hidden = [];
  const keep = new Set(s.meshes.map((m) => m.mesh));
  scene.traverse((o) => { if (o.isMesh && o.visible && !keep.has(o)) { o.visible = false; hidden.push(o); } });
  const bg = scene.background, fog = scene.fog;
  scene.background = null; scene.fog = null;
  const mats = s.meshes.map((m) => [m.mesh, m.mesh.material]);
  for (const m of s.meshes) m.mesh.material = m.base;
  snapR.render(scene, cam);
  for (const [m, mat] of mats) m.material = mat;
  scene.background = bg; scene.fog = fog;
  for (const o of hidden) o.visible = true;
  const url = snapR.domElement.toDataURL();
  SNAPS.set(id, url);
  dirty();
  return url;
}

/* ---------- putting it all in the room ---------- */
async function build() {
  const top = COUNTER_TOP, it = ISLAND.top;
  const { g: stove, hob, oven, d: sd } = range();
  stove.position.set(STOVE_X, 0, BACK + sd / 2 + 0.01);
  scene.add(stove);
  stove.updateMatrixWorld(true);
  const sb = new THREE.Box3().setFromObject(stove), grate = top + 0.045;
  spot("Heat", stove, { meshes: hob, proxy: new THREE.Box3(new THREE.Vector3(sb.min.x, top - 0.12, sb.min.z), new THREE.Vector3(sb.max.x, top + 0.08, sb.max.z)) });
  spot("Bake", stove, { meshes: oven, proxy: new THREE.Box3(new THREE.Vector3(sb.min.x, 0.2, sb.max.z - 0.1), new THREE.Vector3(sb.max.x, top - 0.13, sb.max.z)) });

  const bz = BACK + sd / 2 + 0.01;
  spot("Boil", await model("pot_enamel_01", { x: STOVE_X - 0.22, y: grate, z: bz - 0.13, width: 0.42, ry: 0.3 }));
  spot("Fry", await model("brass_pan_01", { x: STOVE_X + 0.28, y: grate, z: bz + 0.14, width: 0.6, ry: Math.PI / 2 + 0.6 }));

  const f = fridge();
  f.position.set(FRIDGE.x, 0, BACK + FRIDGE.d / 2 + 0.01);
  scene.add(f);
  spot("Freeze", f);

  const grill = grillPan();
  grill.position.set(0.95, top, BACK + 0.36); grill.rotation.y = -0.25;
  scene.add(grill);
  spot("Grill", grill);
  const bl = blender();
  bl.position.set(2.62, top, BACK + 0.3); bl.rotation.y = -0.4;
  scene.add(bl);
  spot("Blend", bl);

  // jars for fermenting, and the clock, on the lower shelf
  const jars = new THREE.Group();
  scene.add(jars);
  for (const [n, x, w, ry] of [["ceramic_pot", 1.4, 0.26, 0.4], ["jug_01", 1.7, 0.19, -0.6], ["ceramic_pot", 1.94, 0.2, 2]]) {
    const m = await model(n, { x, y: SHELVES[0] + 0.0225, z: BACK + 0.15, width: w, ry });
    scene.remove(m); jars.add(m);
  }
  // the jars are a group of three: give it a pivot at their own base, or
  // picking it up would swing them across the room
  jars.updateMatrixWorld(true);
  const jb = new THREE.Box3().setFromObject(jars), jc = jb.getCenter(new THREE.Vector3());
  jc.y = jb.min.y;
  for (const ch of jars.children) ch.position.sub(jc);
  jars.position.copy(jc);
  spot("Ferment", jars);
  spot("Wait", await model("mantel_clock_01", { x: 2.28, y: SHELVES[0] + 0.0225, z: BACK + 0.13, width: 0.3 }));

  // on the island: the bowl, the knife, the recipe book, the notes
  spot("Mix", await model("wooden_bowl_02", { x: -0.98, y: it, z: 0.45, width: 0.32 }));
  const k = knife();
  k.scale.setScalar(1.45);
  k.position.set(0.98, it, 0.48); k.rotation.y = 0.75;
  scene.add(k);
  spot("Cut", k);
  const rb = recipeBook();
  rb.position.set(1.04, it, 0.1); rb.rotation.y = -0.35;
  scene.add(rb);
  spot("recipeBook", rb);
  const np = notepad();
  np.position.set(-1.0, it, 0.02); np.rotation.y = 0.25;
  scene.add(np);
  spot("notepad", np);

  // the compost bin on the floor
  spot("bin", await model("wooden_bucket_01", { x: -1.95, y: 0, z: -0.45, width: 0.42, ry: 0.6 }));

  // and things that are just there
  await model("wicker_basket_01", { x: 2.0, y: top, z: BACK + 0.32, width: 0.36, ry: 0.2 });
  for (const [n, x, z, ry] of [["lemon", 1.93, BACK + 0.3, 0], ["lemon", 2.03, BACK + 0.36, 1], ["yellow_onion", 2.09, BACK + 0.26, 2], ["food_apple_01", 1.9, BACK + 0.4, 0.5]]) {
    await model(n, { x, y: top + 0.03, z, scale: 1, ry });
  }
  await model("wooden_cutting_board", { x: -0.72, y: top, z: BACK + 0.3, width: 0.42, ry: 0.15 });
  await model("croissant", { x: -0.72, y: top + 0.03, z: BACK + 0.3, scale: 1, ry: 0.4 });

  scene.traverse((o) => { if (o.isMesh && o.material.envMapIntensity !== undefined) o.material.envMapIntensity = 0.12; });
  buildBooks();
  sync();
  resize();
  window.K3.ready = true;
  window.kitchenLayout?.();
}

window.K3 = { ready: false, resize, boardRect, pick, snapshot, dirty, throwTool, canThrow, grab, hold, sendHome, atHome,
  where: (id) => spots.get(id)?.group.position.toArray().map((n) => +n.toFixed(2)) };
new ResizeObserver(() => { if (window.K3.ready) window.kitchenLayout?.(); else resize(); }).observe(room);
resize();
build().catch((e) => console.error("kitchen scene:", e));
