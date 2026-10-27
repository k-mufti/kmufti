/* =========================================================================
   The bust — a block of marble standing on a board (bust/index.html). The mouse
   is the gun: click (or hold) on it and it chips away where you hit it.

   It's meant to feel heavy, not rendered. So: it never moves on its own,
   it stands on the board's top edge (the canvas is lined up so the plinth
   meets the border) and casts a real shadow there, it drops in with a
   thud that jolts the board, one hard key light carves it, a soft room
   environment fills it, and baked occlusion darkens the eyes, ears and
   lips. The stone is a scanned Carrara slab mapped from three sides, aged:
   warm dust in the hollows, veins weathered a hair deeper, light soaking
   past the shadow line.

   Damage is real geometry. Every shot subtracts a jagged rock from the
   stone with CSG (three-bvh-csg), the way the GeoMod-style cutting demos
   do it: the crater has actual walls, lit and shadowed like the rest, and
   they're the "inside" material, broken chalky marble. Dig as deep as you
   like; it's solid all the way through.

   To keep a shot cheap, the bust ships as ~600 small closed blocks
   (bust/chunk.mjs), and a shot only cuts the blocks its rock reaches. The
   cutting itself runs in a worker (bust/carve-worker.js), so holding the
   trigger never stalls the page: the hit flashes at once and the crater
   arrives a few frames later with the new geometry.

   Model: bust/model/bust.glb, MakeHuman's default man (CC0) cut into a
   bust by bust/makehuman.js and into blocks by bust/chunk.mjs. It's bare
   geometry, so the stone is supplied here.
   ========================================================================= */
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { buildBling, carveMouth } from "./bling.js?v=4";

const HIT_R = 0.024;        // radius of the rock one shot knocks out, in metres (bust is ~0.49 tall)
const REWIND = 0.9;         // seconds for restore to undo every shot, newest first
const GATHER = 0.45;        // ...after this long for fallen chunks to fly back into place
const MAX_YAW = 0.6;        // how far a drag can turn him, radians either way
const MAX_CHIPS = 360, MAX_DUST = 110;
const YAW = 0;              // square to the viewer: he's symmetrical, show it
const GRAVITY = 2.4;
const LASER_R = 0.2;         // the laser's slot radius, as a multiple of HIT_R
const CHAR_N = 512;         // the scorch map: texels across the bust, about a millimetre each
const HEAT_N = 40;          // stretches of beam path still glowing at once
const MARBLE_SCALE = 1.6;   // texture repeats per metre: one slab covers about two thirds of the bust
const MAX_CONTACTS = 96;    // stretches of his things touching him, darkening the stone there

const wrap = document.getElementById("bust");
if (wrap) start(wrap);

function start(wrap) {
  const canvas = wrap.querySelector("canvas");
  const restoreBtn = wrap.querySelector(".bust-restore");
  const board = document.getElementById("board");

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  // Shadows are only redrawn when something that casts one has moved
  // (see shadowDirty); most frames during a burst of fire don't need it.
  renderer.shadowMap.autoUpdate = false;
  renderer.shadowMap.needsUpdate = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;   // with shadow.radius: a soft, even penumbra

  const scene = new THREE.Scene();
  // A soft room to reflect, so the stone has a sheen and the shadow side
  // picks up light from all around instead of one flat hemisphere.
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;
  pmrem.dispose();

  // A slightly low camera: you look up at it a little, the way you would
  // at something on a plinth.
  const camera = new THREE.PerspectiveCamera(24, 2, 0.01, 20);
  const CAM = new THREE.Vector3(0, 0.2, 1.32), LOOK = new THREE.Vector3(0, 0.25, 0);
  camera.position.copy(CAM);
  camera.lookAt(LOOK);

  // One hard key from high left does nearly all the work; the rest is just
  // enough fill that the shadow side isn't black.
  const key = new THREE.DirectionalLight(0xffe8cc, 3.6);
  key.position.set(-1.2, 1.25, 0.45);
  key.castShadow = true;
  key.shadow.mapSize.set(4096, 4096);
  Object.assign(key.shadow.camera, { left: -0.45, right: 0.45, top: 0.7, bottom: -0.2, near: 0.1, far: 4 });
  key.shadow.bias = -0.0002;
  key.shadow.normalBias = 0.006;   // enough to keep shadow streaks off the jaw and crown
  key.shadow.radius = 5;
  const fill = new THREE.HemisphereLight(0xeef2f8, 0x8a8277, 0.45);
  const rim = new THREE.DirectionalLight(0xdfe6f2, 0.7);
  rim.position.set(1.1, 0.6, -1.2);
  scene.add(key, fill, rim);
  // local only: a handle on the scene, for staging cover shots
  if (/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname)) {
    window.__bust = { scene, camera, CAM, LOOK, key, fill, rim, renderer, redraw() { shadowDirty = true; kick(); } };
  }

  const pivot = new THREE.Group();
  pivot.rotation.y = YAW;
  let yawTarget = YAW;
  scene.add(pivot);

  // A soft contact shadow where the plinth meets the board. (A cast shadow
  // on a ground plane can't line up with a flat page; this can.)
  const contact = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.22), new THREE.MeshBasicMaterial({
    map: radialTexture("rgba(0,0,0,0.5)", "rgba(0,0,0,0)"), transparent: true, depthWrite: false,
  }));
  contact.rotation.x = -Math.PI / 2;
  contact.position.set(0, 0.0005, 0.03);
  scene.add(contact);


  // ---------- Materials: the weathered skin, and the broken stone inside ----------
  const MAX_IMPACTS = 48;
  const uniforms = {
    uKeyDir: { value: new THREE.Vector3() },   // key light direction, view space
    uMarble: { value: null },
    uImpacts: { value: Array.from({ length: MAX_IMPACTS }, () => new THREE.Vector4()) },   // xyz (bust space), radius
    uImpactCount: { value: 0 },
    uDust: { value: 0 },                       // 0..1: how much dust has settled in the craters since the last shot
    // laser burns (see Laser burns): the scorch map, seen down the bust's
    // z axis, and the stretches of beam path still hot
    uChar: { value: null },
    uCharBox: { value: new THREE.Vector4(0, 0, 1, 1) },   // x, y of the map's corner, its width, height (bust space)
    uCharZ: { value: new THREE.Vector2(0, 1) },           // z the map's depth channel starts at, and its range
    uHeatA: { value: Array.from({ length: HEAT_N }, () => new THREE.Vector4()) },   // xyz, time it was burnt
    uHeatB: { value: Array.from({ length: HEAT_N }, () => new THREE.Vector4()) },
    uHeatCount: { value: 0 },
    uTime: { value: 0 },
    // where his things touch him (see syncContacts): a, radius / b, strength
    uContactA: { value: Array.from({ length: MAX_CONTACTS }, () => new THREE.Vector4()) },
    uContactB: { value: Array.from({ length: MAX_CONTACTS }, () => new THREE.Vector4()) },
    uContactCount: { value: 0 },
  };
  // where every shot so far landed (for the cracks), in order; the newest
  // MAX_IMPACTS of them are drawn
  const impacts = [], pendingImpacts = [];
  function syncImpacts() {
    const from = Math.max(0, impacts.length - MAX_IMPACTS);
    for (let i = from; i < impacts.length; i++) uniforms.uImpacts.value[i - from].copy(impacts[i]);
    uniforms.uImpactCount.value = impacts.length - from;
  }
  // Marble001 from ambientCG (CC0): white Carrara, grey veins
  uniforms.uMarble.value = new THREE.TextureLoader().load(new URL("model/marble.jpg", import.meta.url).href, () => kick());
  Object.assign(uniforms.uMarble.value, {
    colorSpace: THREE.SRGBColorSpace, wrapS: THREE.RepeatWrapping, wrapT: THREE.RepeatWrapping,
    anisotropy: renderer.capabilities.getMaxAnisotropy(),
  });
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xf4f0ea, roughness: 0.55, metalness: 0, envMapIntensity: 0.22 });
  skinMat.onBeforeCompile = (shader) => patchShader(shader, false);
  skinMat.customProgramCacheKey = () => "bust-skin";
  const innerMat = new THREE.MeshStandardMaterial({ color: 0xf0ece6, roughness: 0.92, metalness: 0, envMapIntensity: 0.15 });
  innerMat.onBeforeCompile = (shader) => patchShader(shader, true);
  innerMat.customProgramCacheKey = () => "bust-inner";
  const MATS = [skinMat, innerMat];

  // ---------- Debris ----------
  const chipGeo = new THREE.IcosahedronGeometry(1, 0);
  const chipMat = new THREE.MeshStandardMaterial({ color: 0xd9d2c5, roughness: 1, flatShading: true });
  const chipMesh = new THREE.InstancedMesh(chipGeo, chipMat, MAX_CHIPS);
  chipMesh.count = 0;
  chipMesh.frustumCulled = false;
  chipMesh.castShadow = true;
  scene.add(chipMesh);
  const chips = [];

  const dustTex = radialTexture("rgba(255,255,255,1)", "rgba(255,255,255,0)");
  const dust = [];
  for (let i = 0; i < MAX_DUST; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: dustTex, color: 0xcfc6b8, transparent: true, depthWrite: false, opacity: 0 }));
    s.visible = false;
    scene.add(s);
    dust.push({ s, life: 0, max: 1, v: new THREE.Vector3(), grow: 0, peak: 0.5 });
  }
  let dustNext = 0;
  const flash = new THREE.Sprite(new THREE.SpriteMaterial({ map: dustTex, color: 0xfff1c4, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  flash.visible = false;
  scene.add(flash);
  let flashT = 0;

  function puff(at, v, size, grow, life, peak, color = 0xcfc6b8) {
    const d = dust[dustNext++ % MAX_DUST];
    d.s.material.color.set(color);
    d.s.position.copy(at);
    d.v.copy(v);
    d.life = d.max = life;
    d.grow = grow;
    d.peak = peak;
    d.s.scale.setScalar(size);
    d.s.visible = true;
  }

  // ---------- The blocks ----------
  // The worker holds the solid copy it cuts; here each block is just a Mesh
  // drawing whatever geometry it last sent back. Everything is in the
  // bust's own space (the model group's).
  const model = new THREE.Group();
  const worker = new Worker(new URL("carve-worker.js?v=10", import.meta.url), { type: "module" });
  let originals = [], blocks = [];   // blocks[id]: Mesh, or null once carved away

  function setGeometry(mesh, geometry, keepOld) {
    // bounds from the vertices themselves: what the loader carries over
    // from the file can be stale, and a stale sphere gets a block culled
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
    if (mesh.geometry !== geometry && !keepOld) mesh.geometry.dispose();
    mesh.geometry = geometry;
  }

  function buildBlocks() {
    for (const m of blocks) if (m) { model.remove(m); m.geometry.dispose(); }
    blocks = originals.map((g) => {
      const m = new THREE.Mesh(new THREE.BufferGeometry(), MATS);
      setGeometry(m, g.clone());
      m.castShadow = m.receiveShadow = true;
      model.add(m);
      return m;
    });
  }

  // The worker sends geometry as triangle soup: skin corners first, then
  // the inside, with the chipped-lip weight (_rim) alongside.
  function soupGeometry({ arrays, skinN, n }) {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(arrays.position, 3));
    g.setAttribute("normal", new THREE.BufferAttribute(arrays.normal, 3));
    g.setAttribute("_ao", new THREE.BufferAttribute(arrays._ao, 1));
    g.setAttribute("_rim", new THREE.BufferAttribute(arrays._rim, 1));
    g.addGroup(0, skinN, 0);
    g.addGroup(skinN, n - skinN, 1);
    return g;
  }

  // A cut comes back as the new geometry of each block the rock reached,
  // plus any chunks it knocked loose. What each block looked like before is
  // kept, shot by shot, so restore can run the whole thing backwards.
  const history = [];   // per shot: { undo: [{ id, mesh, prev }], pieces: [piece], impact, left }
  let left = 1, shots = 0;
  // Every cut goes out with the cracks it should leave and, for a rocket,
  // a hold: the rocket's crater is worked out while it's still flying, and
  // kept back until it lands. Replies are applied strictly in order, so
  // anything that comes back after a held one waits behind it.
  const replies = [], holds = [], pendingRocks = [];
  function postCut(rocks, hits, hold = null) {
    worker.postMessage({ type: "cut", gen, rocks });
    pendingImpacts.push(hits);
    pendingRocks.push(rocks);
    holds.push(hold);
  }
  function drainReplies() {
    while (replies.length && (!replies[0].hold || replies[0].hold.landed)) {
      const r = replies.shift();
      applyCut(r.m, r.hits, r.rocks);
    }
  }
  worker.onmessage = ({ data: m }) => {
    if (m.type !== "cut" || m.gen !== gen) return;   // a cut from before the last restore
    replies.push({ m, hits: pendingImpacts.shift() || [], rocks: pendingRocks.shift() || [], hold: holds.shift() || null });
    drainReplies();
  };
  function applyCut(m, hit, rocks) {
    const undo = [];
    for (const c of m.changed) {
      const mesh = blocks[c.id];
      if (!mesh) continue;
      undo.push({ id: c.id, mesh, prev: mesh.geometry });
      if (c.gone) { model.remove(mesh); blocks[c.id] = null; continue; }
      setGeometry(mesh, soupGeometry(c), true);
    }
    // his things: a chunk that breaks off takes whatever it was wearing with
    // it; anything the rock dug out from under falls off
    const knocked = [], carried = [];
    const balls = rocks.flatMap(rockBalls);
    const broke = m.pieces.map((data) => {
      const worn = bling ? accs.filter((a) => a.state === "on" && wornBy(a, data)) : [];
      const pc = breakOff(data);
      for (const { a, all } of worn) {
        if (pc && all) { carry(a, pc); carried.push(a); }
        else { detach(a, new THREE.Vector3(0, 0.2, 0.3)); knocked.push(a); }
      }
      return pc;
    }).filter(Boolean);
    for (const a of accs) {
      if (a.state !== "on") continue;
      const b = balls.find((b) => a.supports.some((s) => s.distanceTo(b.p) < b.r * 1.15 + 0.004));
      if (b) {
        const away = a.center.clone().sub(b.p).normalize().transformDirection(model.matrixWorld);
        detach(a, away.multiplyScalar(0.35).add(new THREE.Vector3(0, 0.15, 0.2)));
        knocked.push(a);
      }
    }
    if (m.pieces.length) heights();   // he's shorter now: chunks land on what's left
    impacts.push(...hit);
    syncImpacts();
    history.push({ undo, pieces: broke, left, impacts: hit.length, knocked, carried });
    left = m.left;
    shots++;
    updateStats();
    shadowDirty = true;
    kick();
  }
  let gen = 0;   // bumped on restore
  let shadowDirty = true;   // something that casts a shadow has changed

  function undoShot() {
    const h = history.pop();
    if (h.shattered) { shots = Math.max(0, shots - 1); updateStats(); return; }
    for (const a of [...(h.knocked || []), ...(h.carried || [])]) home(a);
    if (h.acc) { shots = Math.max(0, shots - 1); updateStats(); return; }
    for (const { id, mesh, prev } of h.undo.reverse()) {
      if (blocks[id] === mesh) mesh.geometry.dispose();
      else { model.add(mesh); blocks[id] = mesh; }
      mesh.geometry = prev;
    }
    for (const p of h.pieces) { scene.remove(p.mesh); p.mesh.children[0].geometry.dispose(); pieces.splice(pieces.indexOf(p), 1); }
    impacts.length -= Math.min(impacts.length, h.impacts);
    syncImpacts();
    left = h.left;
    shadowDirty = true;
    shots = Math.max(0, shots - 1);
    updateStats();
  }

  // ---------- Falling chunks ----------
  // A piece the worker broke off: drawn where it was, then it's a simple
  // rigid body: it tumbles, hits the board, bounces a little and settles.
  const pieces = [];
  const pieceTmp = new THREE.Vector3(), pieceQ = new THREE.Quaternion();
  function breakOff(data) {
    // A thin shard doesn't fall as a slab, perched on his shoulder or
    // standing on edge on the board; it crumbles. Thickness is roughly twice
    // the volume over the surface area (exact for a flat slab).
    const P = data.arrays.position;
    let vol = 0, area = 0;
    for (let i = 0; i < data.n * 3; i += 9) {
      const ax = P[i + 3] - P[i], ay = P[i + 4] - P[i + 1], az = P[i + 5] - P[i + 2];
      const bx = P[i + 6] - P[i], by = P[i + 7] - P[i + 1], bz = P[i + 8] - P[i + 2];
      area += Math.hypot(ay * bz - az * by, az * bx - ax * bz, ax * by - ay * bx) / 2;
      vol += (P[i] * (P[i + 4] * P[i + 8] - P[i + 5] * P[i + 7]) - P[i + 1] * (P[i + 3] * P[i + 8] - P[i + 5] * P[i + 6]) + P[i + 2] * (P[i + 3] * P[i + 7] - P[i + 4] * P[i + 6])) / 6;
    }
    if (Math.abs(vol) < 3e-6 || 2 * Math.abs(vol) / area < 0.007) { crumble(data, Math.abs(vol)); return null; }
    // the piece keeps its bust-space coordinates (the stone's texture is
    // mapped from them), inside a group that turns about its centre
    const g = soupGeometry(data);
    g.computeBoundingSphere();
    const c = new THREE.Vector3().fromArray(data.center);
    const inner = new THREE.Mesh(g, MATS);
    inner.castShadow = inner.receiveShadow = true;
    inner.userData.piece = null;   // set below, so a shot can tell it hit a chunk
    inner.position.copy(c).negate();
    const mesh = new THREE.Group();
    mesh.add(inner);
    model.updateMatrixWorld();
    mesh.position.copy(c).applyMatrix4(model.matrixWorld);
    model.getWorldQuaternion(mesh.quaternion);
    scene.add(mesh);
    // the points it can land on: a spread of its own corners
    const p = g.attributes.position, hull = [];
    const step = Math.max(1, Math.floor(p.count / 240));
    for (let i = 0; i < p.count; i += step) hull.push(new THREE.Vector3().fromBufferAttribute(p, i).sub(c));
    // knocked outward from the bust's middle, away from the shot
    const out = mesh.position.clone().setY(0).normalize();
    const piece = {
      mesh, hull,
      home: { p: mesh.position.clone(), q: mesh.quaternion.clone() },
      // outward and toward you, so it tips off the front of him and lands
      // where you can see it
      v: out.multiplyScalar(rnd(0.1, 0.25)).add(new THREE.Vector3(rnd(-0.05, 0.05), rnd(0.05, 0.2), rnd(0.25, 0.4))),
      w: new THREE.Vector3(rnd(-4, 4), rnd(-4, 4), rnd(-4, 4)),
      rest: false, landed: false,
    };
    inner.userData.piece = piece;
    pieces.push(piece);
    return piece;
  }

  // What's left of him, as a height map seen from above (in his own space),
  // so a falling chunk lands on his shoulders, not through them.
  const HF = { n: [0, 0], lo: [0, 0], cell: 0.008, h: null };
  function heights() {
    const box = new THREE.Box3();
    for (const m of blocks) if (m) box.union(m.geometry.boundingBox);
    HF.lo = [box.min.x, box.min.z];
    HF.n = [Math.ceil((box.max.x - box.min.x) / HF.cell) + 1, Math.ceil((box.max.z - box.min.z) / HF.cell) + 1];
    HF.h = new Float32Array(HF.n[0] * HF.n[1]).fill(-1);
    for (const m of blocks) {
      if (!m) continue;
      const p = m.geometry.attributes.position.array;
      for (let i = 0; i < p.length; i += 3) {
        const k = Math.floor((p[i] - HF.lo[0]) / HF.cell) + HF.n[0] * Math.floor((p[i + 2] - HF.lo[1]) / HF.cell);
        if (p[i + 1] > HF.h[k]) HF.h[k] = p[i + 1];
      }
    }
  }
  const hfTmp = new THREE.Vector3(), hfInv = new THREE.Matrix4();
  // how far above whatever's under it (him, or the board) a world point is
  // (tol: how far below his top a point can be and still count as resting
  // on it; small for his things, which start out right up against him)
  function clearance(p, tol = 0.03) {
    if (!HF.h) return p.y;
    hfTmp.copy(p).applyMatrix4(hfInv);
    const x = Math.floor((hfTmp.x - HF.lo[0]) / HF.cell), z = Math.floor((hfTmp.z - HF.lo[1]) / HF.cell);
    if (x < 0 || z < 0 || x >= HF.n[0] || z >= HF.n[1]) return p.y;
    const top = HF.h[x + HF.n[0] * z];
    return top > 0 && hfTmp.y > top - tol ? hfTmp.y - top : p.y;   // only from above: deep inside him counts as clear
  }

  // a shard too thin to fall whole: it goes to rubble where it was
  function crumble(data, vol) {
    model.updateMatrixWorld();
    const P = data.arrays.position, at = new THREE.Vector3(), n = Math.min(40, 3 + Math.round(vol * 4e6));
    for (let i = 0; i < n; i++) {
      const k = Math.floor(Math.random() * data.n) * 3;
      at.set(P[k], P[k + 1], P[k + 2]).applyMatrix4(model.matrixWorld);
      if (chips.length >= MAX_CHIPS) chips.shift();
      chips.push({
        p: at.clone(), from: at.clone(),
        v: new THREE.Vector3(rnd(-0.12, 0.12), rnd(0, 0.15), rnd(0.02, 0.2)),
        r: new THREE.Euler(rnd(0, 6), rnd(0, 6), rnd(0, 6)),
        w: new THREE.Vector3(rnd(-18, 18), rnd(-18, 18), rnd(-18, 18)),
        s: new THREE.Vector3(rnd(0.6, 1.3), rnd(0.5, 1), rnd(0.7, 1.4)).multiplyScalar(rnd(0.003, 0.008)),
        rest: false,
      });
    }
  }

  // A chain isn't rigid: once it's down it slumps flat where it lies (in
  // its own frame, which is level as it comes off him), gathering itself
  // into a heap rather than standing as a hoop.
  const levelQ = new THREE.Quaternion();
  function slump(pc, dt) {
    const a = pc.acc;
    pc.flat = Math.min(1, pc.flat + dt * 2.5);
    const s = 1 - 0.85 * pc.flat * (2 - pc.flat);
    a.group.scale.set(1, s, 1);
    a.group.position.set(-a.center.x, -a.center.y * s, -a.center.z);
    pc.hull = a.hullRel.map((h) => new THREE.Vector3(h.x, h.y * s, h.z));
    model.getWorldQuaternion(levelQ);
    levelQ.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), pc.yaw ??= rnd(-0.6, 0.6)));
    pc.mesh.quaternion.slerp(levelQ, Math.min(1, dt * 6));
    pc.w.multiplyScalar(Math.pow(0.01, dt));
    return pc.flat < 1;
  }
  function stepPiece(pc, dt) {
    if (pc.acc?.kind === "chain" && pc.landed && slump(pc, dt)) pc.rest = false;
    if (pc.rest || pc.shattered) return false;
    if (pc.free > 0) pc.free -= dt;
    pc.v.y -= GRAVITY * dt;
    pc.mesh.position.addScaledVector(pc.v, dt);
    const ang = pc.w.length();
    if (ang > 1e-4) pc.mesh.quaternion.premultiply(pieceQ.setFromAxisAngle(pieceTmp.copy(pc.w).divideScalar(ang), ang * dt));
    // the lowest of its corners against what's under it: the board, or him
    hfInv.copy(model.matrixWorld).invert();
    let low = Infinity, lowP = null;
    for (const h of pc.hull) {
      pieceTmp.copy(h).applyQuaternion(pc.mesh.quaternion).add(pc.mesh.position);
      // (his things get a moment to come clear of him before he can catch them)
      const c = clearance(pieceTmp, pc.acc ? (pc.free > 0 ? -1 : 0.004) : 0.03);
      if (c < low) { low = c; lowP = pieceTmp.clone(); }
    }
    if (low < 0) {
      pc.mesh.position.y -= low;
      if (pc.v.y < 0) {
        if (!pc.landed || pc.v.y < -0.4) {
          if (pc.acc) clink(Math.min(1, 0.25 - pc.v.y / 1.5), pc.acc);
          else thud(Math.min(1, -pc.v.y / 1.5));
        }
        pc.landed = true;
        pc.v.y *= -0.22;
        pc.v.x *= 0.55; pc.v.z *= 0.55;
        // the contact point drags the spin toward rolling over that corner
        const arm = lowP.sub(pc.mesh.position);
        pc.w.multiplyScalar(0.5).add(new THREE.Vector3(arm.z, 0, -arm.x).multiplyScalar(-pc.v.length() * 6));
      }
      pc.w.multiplyScalar(Math.pow(0.04, dt));
      pc.v.x *= Math.pow(0.05, dt); pc.v.z *= Math.pow(0.05, dt);
      if (pc.v.length() < 0.03 && pc.w.length() < 0.4) pc.rest = true;
    }
    return true;
  }

  // ---------- His things (bust/bling.js) ----------
  // Each one is on him (a child of the model), carried (riding a chunk
  // that broke off with it on), or loose: a body of its own, falling and
  // landing like a chunk does. Restore brings them all home.
  let bling = null, sparkles = [];
  const accs = [], loose = [];
  // a rock as balls: one, or a row of them down a laser's slot
  const rockQuat = new THREE.Quaternion(), rockX = new THREE.Vector3();
  function rockBalls(rk) {
    const p = new THREE.Vector3().fromArray(rk.position), r = Math.max(rk.scale[0], rk.scale[1]);
    if (!rk.stretch) return [{ p, r }];
    rockX.set(1, 0, 0).applyQuaternion(rockQuat.fromArray(rk.quaternion));
    const half = rk.stretch * r, out = [];
    for (let d = -half; d <= half + 1e-9; d += r) out.push({ p: p.clone().addScaledVector(rockX, d), r });
    return out;
  }
  // which of its supports a chunk that broke off holds (all of them: it
  // goes with the chunk; some: it's knocked loose)
  function wornBy(a, data) {
    const P = data.arrays.position;
    let held = 0;
    for (const s of a.supports) {
      for (let i = 0; i < data.n * 3; i += 3) {
        if (Math.abs(P[i] - s.x) < 0.012 && Math.abs(P[i + 1] - s.y) < 0.012 && Math.abs(P[i + 2] - s.z) < 0.012) { held++; break; }
      }
    }
    return held ? { a, all: held === a.supports.length } : null;
  }
  // the stone darkens where his things rest on him, for as long as they do
  function syncContacts() {
    let n = 0;
    for (const a of accs) {
      if (a.state !== "on") continue;
      for (const c of a.contacts || []) {
        if (n >= MAX_CONTACTS) break;
        uniforms.uContactA.value[n].set(c.a.x, c.a.y, c.a.z, c.r);
        uniforms.uContactB.value[n].set(c.b.x, c.b.y, c.b.z, c.s);
        n++;
      }
    }
    uniforms.uContactCount.value = n;
  }
  function carry(a, pc) {
    a.group.removeFromParent();
    a.group.position.copy(pc.mesh.children[0].position);
    a.group.quaternion.identity();
    a.jolt = null;
    pc.mesh.add(a.group);
    a.state = "carried";
    a.carrier = pc;
    (pc.carried ||= []).push(a);
    syncContacts();
  }
  function unCarry(a) {
    if (!a.carrier) return;
    a.carrier.carried.splice(a.carrier.carried.indexOf(a), 1);
    a.carrier = null;
  }
  // knock it off: a body of its own where it is now, moving at v
  function detach(a, v) {
    if (a.state === "loose") {
      a.pc.v.add(v);
      a.pc.w.add(new THREE.Vector3(rnd(-6, 6), rnd(-6, 6), rnd(-6, 6)));
      a.pc.rest = false;
      kick();
      return;
    }
    a.jolt = null;
    a.group.updateWorldMatrix(true, false);
    const body = new THREE.Group();
    body.position.copy(a.center).applyMatrix4(a.group.matrixWorld);
    a.group.getWorldQuaternion(body.quaternion);
    unCarry(a);
    a.group.removeFromParent();
    a.group.position.copy(a.center).negate();
    a.group.quaternion.identity();
    body.add(a.group);
    scene.add(body);
    // a chain doesn't tumble: it slides off him forward, roughly level
    const spin = a.kind === "chain" ? new THREE.Vector3(rnd(-1, 1), rnd(-1, 1), rnd(-0.5, 0.5)) : new THREE.Vector3(rnd(-7, 7), rnd(-7, 7), rnd(-7, 7));
    if (a.kind === "chain") v = v.clone().add(new THREE.Vector3(0, 0, 0.25));
    a.pc = { mesh: body, hull: a.hullRel, v: v.clone(), w: spin, rest: false, landed: false, acc: a, flat: 0, free: 0.3 };
    a.state = "loose";
    loose.push(a.pc);
    syncContacts();
    shadowDirty = true;
    kick();
  }
  function home(a) {
    if (a.state === "on") return;
    if (a.pc) { scene.remove(a.pc.mesh); loose.splice(loose.indexOf(a.pc), 1); a.pc = null; }
    unCarry(a);
    a.group.removeFromParent();
    a.group.position.set(0, 0, 0);
    a.group.quaternion.identity();
    a.group.scale.set(1, 1, 1);
    model.add(a.group);
    a.state = "on";
    syncContacts();
    shadowDirty = true;
  }
  // a shot on one of his things. Each takes a few hits before it comes off
  // (TOUGH, in pistol rounds; the laser does dmg a second): until then it
  // jolts on him and rings, and the laser heats it, dull red to yellow, the
  // nearer it gets to letting go. Once it's off, a hit skips it across the
  // board.
  const TOUGH = { shades: 3, grill: 3.5, "stud-l": 1.5, "stud-r": 1.5, cuban: 4.5, rope: 3 };
  function hitAcc(a, hit, w) {
    const out = hit.point.clone().setY(0).normalize().multiplyScalar(0.12);
    const v = out.add(new THREE.Vector3(rnd(-0.06, 0.06), rnd(0.15, 0.3), rnd(0.2, 0.35))).multiplyScalar(0.8 + 0.25 * Math.sqrt(w.r));
    // (the laser's by the clock, so a slow frame rate doesn't make it gentler)
    let dmg = w.dmg;
    if (w.beam) {
      const now = performance.now(), since = a.beamAt && now - a.beamAt < 150 ? (now - a.beamAt) / 1000 : w.every;
      a.beamAt = now;
      dmg *= since;
    }
    if (a.state === "on" && a.hp - dmg > 0) {
      a.hp -= dmg;
      if (w.beam) {
        a.heat = Math.max(a.heat, 0.25 + 0.75 * (1 - a.hp / a.tough));
        a.hotT = 0.15;
        if (Math.random() < 0.5) puff(hit.point.clone(), new THREE.Vector3(rnd(-0.06, 0.06), rnd(0.03, 0.1), rnd(0, 0.06)), 0.003, rnd(0.004, 0.01), rnd(0.15, 0.35), 0.9, 0xffb050);
        if (!a.jolt) jolt(a, hit, 0.15);
        kick();
        return;
      }
      jolt(a, hit, Math.min(1, dmg / 2));
      flash.position.copy(hit.point);
      flash.scale.setScalar(0.035);
      flash.visible = true;
      flashT = 0.05;
      for (let i = 0; i < 2; i++) puff(hit.point.clone(), new THREE.Vector3(rnd(-0.04, 0.04), rnd(0, 0.05), rnd(0, 0.05)), 0.005, rnd(0.008, 0.016), rnd(0.25, 0.5), 0.5, 0xffe2a0);
      clink(0.45 + 0.3 * Math.min(1, dmg), a);
      history.push({ undo: [], pieces: [], acc: a, knocked: [], left, impacts: 0 });
      shots++;
      updateStats();
      wrap.classList.add("shot");
      if (restoreBtn) restoreBtn.hidden = false;
      kick();
      return;
    }
    flash.position.copy(hit.point);
    flash.scale.setScalar(0.05);
    flash.visible = true;
    flashT = 0.06;
    for (let i = 0; i < 3; i++) puff(hit.point.clone(), new THREE.Vector3(rnd(-0.05, 0.05), rnd(0, 0.06), rnd(0, 0.06)), 0.006, rnd(0.01, 0.02), rnd(0.3, 0.6), 0.6, 0xffe2a0);
    clink(0.9, a);
    if (a.state === "loose") { detach(a, v.multiplyScalar(0.5)); return; }
    a.hp = 0;
    detach(a, v);
    history.push({ undo: [], pieces: [], acc: a, knocked: [a], left, impacts: 0 });
    shots++;
    updateStats();
    wrap.classList.add("shot");
    if (restoreBtn) restoreBtn.hidden = false;
  }
  // knocked but still on him: a quick, dying shake. A chain swings out off
  // his chest from the back of his neck (never into him); the rest twist a
  // hair about their middle, the way the hit pushed them.
  const joltQ = new THREE.Quaternion(), joltP = new THREE.Vector3();
  function jolt(a, hit, s) {
    let axis, pivot;
    if (a.kind === "chain") { axis = new THREE.Vector3(1, 0, 0); pivot = a.supports[0]; }
    else {
      const p = model.worldToLocal(hit.point.clone()).sub(a.center);
      const d = ray.ray.direction.clone().transformDirection(new THREE.Matrix4().copy(model.matrixWorld).invert());
      axis = p.cross(d);
      if (axis.lengthSq() < 1e-12) axis.set(0, 0, 1);
      axis.normalize();
      pivot = a.center;
    }
    const amp = (a.kind === "chain" ? 0.07 : a.kind === "glass" ? 0.035 : 0.012) * (0.35 + 0.65 * s);
    a.jolt = { t: 0, amp: Math.max(amp, a.jolt ? a.jolt.amp * Math.exp(-a.jolt.t * 5) : 0), axis, pivot, swing: a.kind === "chain" };
  }
  // returns true while something is still moving or glowing
  function stepAccs(dt) {
    let on = false;
    for (const a of accs) {
      if (a.jolt) {
        const j = a.jolt;
        j.t += dt;
        const env = j.amp * Math.exp(-j.t * 5);
        if (env < 0.0004 || a.state !== "on") {
          a.jolt = null;
          if (a.state === "on") { a.group.quaternion.identity(); a.group.position.set(0, 0, 0); }
        } else {
          const s = Math.sin(j.t * 30);
          joltQ.setFromAxisAngle(j.axis, j.swing ? -env * Math.abs(s) : env * s);
          a.group.quaternion.copy(joltQ);
          a.group.position.copy(j.pivot).sub(joltP.copy(j.pivot).applyQuaternion(joltQ));
        }
        on = true;
        shadowDirty = true;
      }
      if (a.heat > 0) {
        if (a.hotT > 0) a.hotT -= dt;
        else a.heat = Math.max(0, a.heat - dt * 0.3);
        glow(a, a.heat);
        on = true;
      }
    }
    return on;
  }
  // the heat on it, in its own copies of the materials while it lasts
  function glow(a, h) {
    if (h > 0 && !a.hotMats) {
      a.hotMats = new Map();
      for (const m of a.meshes) {
        if (!m.material.emissive) continue;
        a.hotMats.set(m, m.material);
        m.material = m.material.clone();
      }
    }
    if (!a.hotMats) return;
    if (h <= 0) {
      for (const [m, orig] of a.hotMats) { m.material.dispose(); m.material = orig; }
      a.hotMats = null;
      return;
    }
    for (const m of a.hotMats.keys()) m.material.emissive.setRGB(1.8 * h, 0.75 * h * h, 0.25 * h ** 4);
  }
  // ---------- Twinkle ----------
  // Every second or so a diamond catches the light: a four-point star that
  // flares and fades over half a second.
  const starTex = starTexture();
  const twinkles = [];
  for (let i = 0; i < 3; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: starTex, color: 0xffffff, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending }));
    s.visible = false;
    s.renderOrder = 11;
    scene.add(s);
    twinkles.push({ s, t: 0, dur: 0.5, at: null });
  }
  const twTmp = new THREE.Vector3();
  function twinkle() {
    if (!ready || !visible || document.hidden || rewind || drop || !sparkles.length) return;
    const tw = twinkles.find((x) => !x.at);
    if (!tw) return;
    for (let k = 0; k < 6; k++) {
      const sp = sparkles[Math.floor(Math.random() * sparkles.length)];
      if (sp.acc.state === "on" && sp.p.z < 0.1) continue;   // round the back of him: out of sight
      tw.at = sp;
      tw.t = 0;
      tw.dur = rnd(0.4, 0.65);
      tw.s.visible = true;
      tw.s.material.rotation = rnd(0, 0.6);
      kick();
      return;
    }
  }
  setInterval(twinkle, 900);
  function stepTwinkles(dt) {
    let on = false;
    for (const tw of twinkles) {
      if (!tw.at) continue;
      tw.t += dt;
      if (tw.t >= tw.dur) { tw.at = null; tw.s.visible = false; continue; }
      const f = Math.sin(Math.PI * tw.t / tw.dur);
      tw.at.mesh.localToWorld(twTmp.copy(tw.at.p));
      tw.s.position.copy(twTmp).addScaledVector(camera.position.clone().sub(twTmp).normalize(), 0.01);
      tw.s.scale.setScalar(0.03 * f * f);
      tw.s.material.rotation += dt * 0.8;
      on = true;
    }
    return on;
  }

  // ---------- Load ----------
  let drop = null, ready = false;    // drop: { y, v } while it's falling in
  const foot = [], footTmp = new THREE.Vector3();
  // He's heavy (a few MB), so he waits until the rest of the page is in and
  // the browser is idle.
  const whenIdle = (fn) => (window.requestIdleCallback || ((f) => setTimeout(f, 200)))(fn, { timeout: 1500 });
  if (document.readyState === "complete") whenIdle(loadBust);
  else window.addEventListener("load", () => whenIdle(loadBust), { once: true });
  function loadBust() {
  const draco = new DRACOLoader().setDecoderPath("https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/libs/draco/gltf/");
  new GLTFLoader().setDRACOLoader(draco).load(new URL("model/bust.glb?v=5", import.meta.url).href, async (gltf) => {
    draco.dispose();
    // Each block is a node holding a skin part and an inside part (a Group
    // of two meshes, or one mesh if it only has one), quantized across the
    // block's own box. Unpack to floats and join them: skin first, then
    // inside, as two groups.
    for (const node of gltf.scene.children) {
      const { lo, size } = node.userData;
      const parts = { skin: null, inner: null };
      node.traverse((o) => { if (o.isMesh) parts[o.geometry.userData.part] = o.geometry; });
      const list = [parts.skin, parts.inner].filter(Boolean);
      const nv = list.reduce((a, q) => a + q.attributes.position.count, 0);
      const ni = list.reduce((a, q) => a + q.index.count, 0);
      const P = new Float32Array(nv * 3), N = new Float32Array(nv * 3), A = new Float32Array(nv), I = new Uint32Array(ni);
      let v0 = 0, i0 = 0;
      const g = new THREE.BufferGeometry();
      for (const q of list) {
        const qp = q.attributes.position, qn = q.attributes.normal, qa = q.attributes._ao, n = qp.count;
        for (let i = 0; i < n; i++) {
          const k = (v0 + i) * 3;
          P[k] = lo[0] + qp.getX(i) * size[0]; P[k + 1] = lo[1] + qp.getY(i) * size[1]; P[k + 2] = lo[2] + qp.getZ(i) * size[2];
          N[k] = qn.getX(i); N[k + 1] = qn.getY(i); N[k + 2] = qn.getZ(i);
          A[v0 + i] = qa.getX(i);
        }
        for (let i = 0; i < q.index.count; i++) I[i0 + i] = q.index.getX(i) + v0;
        g.addGroup(i0, q.index.count, q === parts.skin ? 0 : 1);
        v0 += n; i0 += q.index.count;
        q.dispose();
      }
      g.setAttribute("position", new THREE.BufferAttribute(P, 3));
      g.setAttribute("normal", new THREE.BufferAttribute(N, 3));
      g.setAttribute("_ao", new THREE.BufferAttribute(A, 1));
      g.setAttribute("_rim", new THREE.BufferAttribute(new Float32Array(nv), 1));
      g.setIndex(new THREE.BufferAttribute(I, 1));
      g.userData.cell = node.userData.cell;
      originals.push(g);
    }
    // part his lips for the grill (bling.js)
    let carved = false;
    try { await carveMouth(originals); carved = true; } catch (e) { console.warn("bust: mouth not carved", e); }
    const box = new THREE.Box3();
    for (const g of originals) { g.computeBoundingBox(); box.union(g.boundingBox); }
    const c = box.getCenter(new THREE.Vector3());
    model.position.set(-c.x, -box.min.y, -c.z);   // plinth flat on y = 0, turning about its middle
    charFrame(box);
    pivot.add(model);
    buildBlocks();
    heights();   // so anything that falls off him lands on him
    bling = buildBling(originals, { carved });
    // the studio his gold and diamonds reflect, once it's in
    new RGBELoader().load(new URL("model/studio.hdr", import.meta.url).href, (hdr) => {
      const gen = new THREE.PMREMGenerator(renderer);
      bling.setEnv(gen.fromEquirectangular(hdr).texture);
      gen.dispose();
      hdr.dispose();
      kick();
    });
    for (const a of bling.accs) {
      a.state = "on";
      a.tough = a.hp = TOUGH[a.name] ?? 3;
      a.heat = 0;
      a.hullRel = a.hull.map((h) => h.clone().sub(a.center));
      a.meshes = [];
      a.group.traverse((o) => {
        if (!o.isMesh) return;
        a.meshes.push(o);
        for (const p of o.userData.sparkle || []) sparkles.push({ acc: a, mesh: o, p });
      });
      model.add(a.group);
      accs.push(a);
    }
    syncContacts();
    worker.postMessage({ type: "init", blocks: originals.map((g) => ({
      position: g.attributes.position.array, normal: g.attributes.normal.array, ao: g.attributes._ao.array,
      index: g.index.array, skinCount: g.groups[0].materialIndex === 0 ? g.groups[0].count : 0, cell: g.userData.cell,
    })), grid: gltf.scene.userData });

    // The foot of the plinth: every vertex within a hair of the bottom.
    // resize() lines the board's top border up with the lowest of them.
    for (const g of originals) {
      const p = g.attributes.position;
      for (let i = 0; i < p.count; i++) if (p.getY(i) < box.min.y + 0.004) foot.push(new THREE.Vector3().fromBufferAttribute(p, i));
    }


    // Compile everything a rocket draws (its body, flame, fireball) now, so
    // the first one doesn't stall a frame while the GPU catches up.
    const warm = rocketBody.clone();
    scene.add(warm);
    fireball.visible = beam.visible = beamSpot.visible = true;
    renderer.compile(scene, camera);
    scene.remove(warm);
    fireball.visible = beam.visible = beamSpot.visible = false;

    appear();
  });
  }

  function appear() {
    if (ready) return;
    ready = true;
    wrap.classList.add("ready");
    if (weaponBtn) weaponBtn.hidden = false;
    resize();
    dropIn();
  }

  function dropIn() {
    drop = { y: 0.55, v: 0 };
    pivot.position.y = drop.y;
    kick();
  }

  function patchShader(shader, inner) {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nattribute float _ao;\nattribute float _rim;\nvarying float vAO;\nvarying float vRim;\nvarying vec3 vObj;\nvarying vec3 vObjN;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvObj = position;\nvObjN = normal;\nvAO = _ao;\nvRim = _rim;");
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>
        uniform vec3 uKeyDir;
        uniform sampler2D uMarble;
        uniform vec4 uImpacts[${MAX_IMPACTS}];
        uniform int uImpactCount;
        uniform float uDust;
        uniform sampler2D uChar;
        uniform vec4 uCharBox;
        uniform vec2 uCharZ;
        uniform vec4 uHeatA[${HEAT_N}];
        uniform vec4 uHeatB[${HEAT_N}];
        uniform int uHeatCount;
        uniform float uTime;
        uniform vec4 uContactA[${MAX_CONTACTS}];
        uniform vec4 uContactB[${MAX_CONTACTS}];
        uniform int uContactCount;
        varying float vRim;
        varying float vAO;
        varying vec3 vObj;
        varying vec3 vObjN;
        float sHash(vec3 p) {
          p = fract(p * 0.3183099 + 0.1); p *= 17.0;
          return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
        }
        float sNoise(vec3 x) {
          vec3 i = floor(x), f = fract(x);
          f = f * f * (3.0 - 2.0 * f);
          return mix(mix(mix(sHash(i), sHash(i + vec3(1,0,0)), f.x),
                         mix(sHash(i + vec3(0,1,0)), sHash(i + vec3(1,1,0)), f.x), f.y),
                     mix(mix(sHash(i + vec3(0,0,1)), sHash(i + vec3(1,0,1)), f.x),
                         mix(sHash(i + vec3(0,1,1)), sHash(i + vec3(1,1,1)), f.x), f.y), f.z);
        }
        // distance to the nearest edge between Voronoi cells (hairline
        // fractures, where it's near zero), and whether that edge actually
        // cracked: only some do, so it reads as a few fractures, not a web
        vec2 sCrackEdge(vec3 p) {
          vec3 i = floor(p), f = fract(p);
          float d1 = 8.0, d2 = 8.0, h1 = 0.0, h2 = 0.0;
          for (int z = -1; z <= 1; z++) for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
            vec3 o = vec3(float(x), float(y), float(z));
            vec3 h = fract(sin(vec3(dot(i + o, vec3(127.1, 311.7, 74.7)), dot(i + o, vec3(269.5, 183.3, 246.1)), dot(i + o, vec3(113.5, 271.9, 124.6)))) * 43758.5453);
            float d = length(o + h - f);
            if (d < d1) { d2 = d1; h2 = h1; d1 = d; h1 = h.y; } else if (d < d2) { d2 = d; h2 = h.y; }
          }
          return vec2(d2 - d1, step(0.55, fract((h1 + h2) * 7.13)));
        }
        vec3 sPerturb(vec3 pos, vec3 n, vec2 dH, float faceDir) {
          vec3 sx = dFdx(pos), sy = dFdy(pos);
          vec3 r1 = cross(sy, n), r2 = cross(n, sx);
          float det = dot(sx, r1) * faceDir;
          return normalize(abs(det) * n - sign(det) * (dH.x * r1 + dH.y * r2));
        }`)
      .replace("#include <map_fragment>", `#include <map_fragment>
        // the stone: a scanned Carrara slab, projected from all three axes
        // so the veins run through the block regardless of the carving
        vec3 tw = pow(abs(normalize(vObjN)), vec3(4.0));
        tw /= tw.x + tw.y + tw.z;
        vec3 mp = vObj * ${MARBLE_SCALE.toFixed(2)};
        vec3 marble = texture2D(uMarble, mp.zy + vec2(0.31, 0.17)).rgb * tw.x
                    + texture2D(uMarble, mp.xz + vec2(0.57, 0.83)).rgb * tw.y
                    + texture2D(uMarble, mp.xy).rgb * tw.z;
        float marbleLum = dot(marble, vec3(0.3, 0.55, 0.15));
        float grain = sNoise(vObj * 170.0) * 0.6 + sNoise(vObj * 48.0) * 0.4;
        float grime = sNoise(vObj * 9.0) * 0.6 + sNoise(vObj * 31.0) * 0.4;
        float hollow = 1.0 - smoothstep(0.35, 0.95, vAO);
        ${inner ? `
        // freshly broken: the same veins, but paler and chalky, no patina
        diffuseColor.rgb *= mix(marble, vec3(0.97, 0.96, 0.94), 0.55) * (0.9 + 0.1 * grain);` : `
        diffuseColor.rgb *= marble;
        // Calacatta oro: the veins run warm, a little gold in the grey
        diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * vec3(1.22, 0.98, 0.62), (1.0 - smoothstep(0.5, 0.82, marbleLum)) * 0.75);
        // age: centuries of dust and handling settle warm into the hollows,
        // the high points stay cleaner, and it's never quite even
        diffuseColor.rgb *= mix(vec3(1.0), vec3(0.86, 0.8, 0.7), clamp(hollow * 0.9 + (0.5 - grime) * 0.35, 0.0, 1.0));
        diffuseColor.rgb *= mix(0.93, 1.03, grime);
        // hairline cracks spreading from each impact, thinning out with distance
        float spread = 0.0;
        for (int i = 0; i < ${MAX_IMPACTS}; i++) {
          if (i >= uImpactCount) break;
          float d = distance(vObj, uImpacts[i].xyz);
          spread = max(spread, 1.0 - smoothstep(uImpacts[i].w * 0.9, uImpacts[i].w * 1.4, d));
        }
        float crack = 0.0;
        if (spread > 0.0) {
          vec3 cp = vObj * 110.0 + vec3(sNoise(vObj * 40.0), sNoise(vObj * 40.0 + 7.1), sNoise(vObj * 40.0 + 3.7)) * 0.9;
          vec2 e = sCrackEdge(cp);
          float w = 0.018 + fwidth(e.x) * 0.9;
          crack = (1.0 - smoothstep(0.0, w, e.x)) * e.y * smoothstep(0.0, 0.45, spread - (1.0 - sNoise(vObj * 55.0)) * 0.4);
        }
        diffuseColor.rgb *= 1.0 - 0.42 * crack;
        // the chipped lip: right round a crater the weathered skin has
        // flaked off, pale and chalky, darkening at the very break
        float lip = smoothstep(0.0, 0.75, vRim);
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.92, 0.91, 0.88) * (0.88 + 0.12 * grain), lip * 0.8);
        diffuseColor.rgb *= 1.0 - 0.25 * smoothstep(0.85, 1.0, vRim);`}
        ${inner ? `
        // dust from the shots settles on whatever in a crater faces up
        float dusty = smoothstep(0.3, 0.85, normalize(vObjN).y) * uDust * (0.7 + 0.3 * grain);
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.9, 0.88, 0.84), dusty * 0.7);` : ""}
        // laser burns: where the beam has been, the stone is scorched - the
        // groove it cut black, and a brown halo round its lip
        vec4 sChar = texture2D(uChar, (vObj.xy - uCharBox.xy) / uCharBox.zw);
        // (the map holds the depth it was burnt at, and the skin only takes
        // it close to that, so the back of his head isn't scorched too. A
        // crater's walls take it at any depth: the groove opens up the
        // walls between blocks, and those weren't cut by the beam itself.)
        float charred = sChar.r${inner ? "" : " * (1.0 - smoothstep(0.03, 0.05, abs(vObj.z - uCharZ.x - sChar.g * uCharZ.y)))"};
        charred = max(charred, step(1.25, vAO) * 0.9);   // the groove's own walls: cut by the beam
        charred = clamp(charred * (0.8 + 0.4 * grain), 0.0, 1.0);
        vec3 soot = mix(vec3(0.42, 0.31, 0.21), vec3(0.035, 0.03, 0.028), smoothstep(0.35, 0.85, charred));
        diffuseColor.rgb = mix(diffuseColor.rgb, soot, smoothstep(0.0, 0.45, charred));
        // ...and right behind the beam it's still hot: white where it is
        // now, cooling through orange and red over about three seconds
        float sHeat = 0.0;
        for (int i = 0; i < ${HEAT_N}; i++) {
          if (i >= uHeatCount) break;
          vec3 a = uHeatA[i].xyz, ab = uHeatB[i].xyz - a;
          float h = clamp(dot(vObj - a, ab) / max(dot(ab, ab), 1e-10), 0.0, 1.0);
          vec3 dv = vObj - a - ab * h;
          dv.z *= 0.12;   // all the way down the groove it just cut, just as hot
          float age = uTime - mix(uHeatA[i].w, uHeatB[i].w, h);
          sHeat = max(sHeat, exp(-age * 1.3) * (1.0 - smoothstep(${(HIT_R * LASER_R * 0.6).toFixed(5)}, ${(HIT_R * LASER_R * 1.8).toFixed(5)}, length(dv))));
        }`)
      .replace("#include <emissivemap_fragment>", `#include <emissivemap_fragment>
        totalEmissiveRadiance += vec3(smoothstep(0.03, 0.4, sHeat) * 3.0, smoothstep(0.25, 0.75, sHeat) * 2.0, smoothstep(0.6, 1.0, sHeat) * 1.5);`)
      .replace("#include <roughnessmap_fragment>", `#include <roughnessmap_fragment>
        ${inner ? "" : "// honed, not polished: a soft sheen that varies a little across the block; rough where it's chipped\n        roughnessFactor = mix(roughnessFactor + (grime - 0.5) * 0.12 + hollow * 0.2, 1.0, lip);"}`)
      .replace("#include <aomap_fragment>", `#include <aomap_fragment>
        // baked occlusion: all of the bounce light, a little of the key, so
        // the sockets and creases read even where the sun reaches
        float ao = min(vAO, 1.0);   // over 1 only marks a laser burn (see the worker's rock)
        reflectedLight.indirectDiffuse *= ao;
        reflectedLight.indirectSpecular *= ao * ao;
        reflectedLight.directDiffuse *= mix(0.55, 1.0, smoothstep(0.15, 0.85, ao));
        reflectedLight.directSpecular *= ao;
        // where something of his rests on him, the light can't get under it:
        // a soft dark line along each chain, round the lenses' pads, the
        // medallion's shadow on his chest
        float touch = 0.0;
        for (int i = 0; i < ${MAX_CONTACTS}; i++) {
          if (i >= uContactCount) break;
          vec3 ca = uContactA[i].xyz, cab = uContactB[i].xyz - ca;
          float ct = clamp(dot(vObj - ca, cab) / max(dot(cab, cab), 1e-10), 0.0, 1.0);
          vec3 cd = vObj - ca - cab * ct;
          touch = max(touch, uContactB[i].w * exp(-dot(cd, cd) / (uContactA[i].w * uContactA[i].w)));
        }
        reflectedLight.indirectDiffuse *= 1.0 - touch;
        reflectedLight.indirectSpecular *= 1.0 - touch;
        reflectedLight.directDiffuse *= 1.0 - touch * 0.5;
        // marble is a little translucent: light soaks past the shadow line
        // and comes back warm, which is what keeps it from looking like plaster
        float nl = dot(normal, uKeyDir);
        float soak = max(0.0, (nl + 0.45) / 1.45) - max(0.0, nl);
        reflectedLight.directDiffuse += diffuseColor.rgb * vec3(1.0, 0.86, 0.7) * soak * 0.35 * ao;
        ${inner ? "reflectedLight.indirectDiffuse *= 1.6;   // fresh breaks are bright: light scatters back out of the crystals" : ""}`)
      .replace("#include <normal_fragment_maps>", `#include <normal_fragment_maps>
        ${inner ? `
        // broken stone: a coarse, gritty tooth over the struck facets
        float h = (sNoise(vObj * 300.0) * 0.5 + sNoise(vObj * 90.0) * 0.5) * 0.0016;` : `
        // weathering: the veins and soft patches erode a hair deeper than
        // the stone around them, plus the faintest tooth of grain
        float h = (sNoise(vObj * 420.0) * 0.5 + sNoise(vObj * 160.0) * 0.5) * (0.00014 + lip * 0.0016) + marbleLum * 0.00035 * (1.0 - lip) - crack * 0.00012;`}
        normal = sPerturb(-vViewPosition, normal, vec2(dFdx(h), dFdy(h)), faceDirection);`);
  }

  // ---------- Weapons ----------
  // Every trigger pull is one message to the cutter with one or more rocks
  // in it, so a shotgun blast counts (and rewinds) as one shot.
  //   r       rock radius, as a multiple of HIT_R
  //   deep    rock depth, as a multiple of its radius
  //   pellets how many rocks, each on its own ray within spread (NDC units)
  //   every   seconds between shots while held
  //   beam    the laser: fired continuously while held (see laserSample)
  //   rocket  fires a projectile that explodes where it lands (see launch)
  const WEAPONS = [
    { name: "pistol", every: 0.12, dmg: 1, pellets: 1, spread: 0, r: 1, deep: 1.25, chips: 16, shake: 0.35, sound: (b) => impactSound(b, true) },
    { name: "shotgun", every: 0.55, dmg: 0.6, pellets: 7, spread: 0.07, r: 0.55, deep: 1.0, chips: 6, shake: 0.8, sound: () => shotgunSound() },
    { name: "sledgehammer", every: 0.9, dmg: 3.5, pellets: 1, spread: 0, r: 2.3, deep: 0.75, chips: 40, shake: 1.6, sound: () => hammerSound() },
    { name: "laser", every: 0.04, dmg: 2, beam: true, r: LASER_R, deep: 5, chips: 0, shake: 0.05 },
    { name: "rocket launcher", every: 1.4, dmg: 99, rocket: true, r: 3.0, deep: 1.0, chips: 70, shake: 2.4 },
  ];
  let weapon = WEAPONS[0];

  // The rock is a jagged icosahedron (the worker shapes it): a little deeper
  // than it is wide, pointed into the stone, sunk past the surface so the
  // cut is a crater, not a shallow scuff.
  const Z = new THREE.Vector3(0, 0, 1), rockQ = new THREE.Quaternion(), rollQ = new THREE.Quaternion();
  function rockSpec(at, inward, r, sink, deep) {
    rockQ.setFromUnitVectors(Z, inward).multiply(rollQ.setFromAxisAngle(Z, rnd(0, Math.PI * 2)));
    return {
      position: at.clone().addScaledVector(inward, r * sink).toArray(),
      quaternion: rockQ.toArray(),
      scale: [r * rnd(0.9, 1.1), r * rnd(0.9, 1.1), r * deep],
      detail: r > HIT_R * 1.5 ? 2 : 1,     // a big hollow needs a finer ball, or it's all flat planes
    };
  }
  // The laser's cut from a to b: a capsule lying along the path (the
  // worker stretches the ball into one), sunk the same way down the beam.
  const slotX = new THREE.Vector3(), slotY = new THREE.Vector3(), slotM = new THREE.Matrix4();
  function slotSpec(a, b, inward, r, sink, deep) {
    slotX.subVectors(b, a);
    slotX.addScaledVector(inward, -slotX.dot(inward));   // across the beam, not along it
    const half = slotX.length() / 2;
    if (half < 1e-6) return rockSpec(b, inward, r, sink, deep);
    slotX.normalize();
    slotY.crossVectors(inward, slotX);
    rockQ.setFromRotationMatrix(slotM.makeBasis(slotX, slotY, inward));
    return {
      position: a.clone().lerp(b, 0.5).addScaledVector(inward, r * sink).toArray(),
      quaternion: rockQ.toArray(),
      scale: [r, r, r * deep],
      stretch: half / r,
      burnt: true,
    };
  }

  // ---------- Aiming & shooting ----------
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2(), aim = new THREE.Vector2();
  const pointer = { inside: false, down: false };
  let fireCd = 0, shake = 0;

  function pick(offset) {
    if (!ready || drop || rewind) return null;
    aim.copy(ndc);
    if (offset) aim.add(offset);
    ray.setFromCamera(aim, camera);
    // the bust, and any chunk lying on the board (those shatter)
    const targets = blocks.filter(Boolean);
    for (const pc of pieces) if (!pc.shattered) targets.push(pc.mesh.children[0]);
    for (const a of accs) targets.push(...a.meshes);
    return ray.intersectObjects(targets, false)[0] || null;
  }

  const rnd = (a, b) => a + Math.random() * (b - a);
  function shoot() {
    if (weapon.beam) return laserSample();
    if (weapon.rocket) return launch();
    const w = weapon, rocks = [], hits = [];
    let anyBroken = false, hitSomething = false, anyStone = false;
    for (let i = 0; i < w.pellets; i++) {
      // pellets spread over a disc around the aim point
      const a = Math.random() * Math.PI * 2, d = Math.sqrt(Math.random()) * w.spread;
      const hit = pick(i === 0 && w.pellets === 1 ? null : new THREE.Vector2(Math.cos(a) * d, Math.sin(a) * d * camera.aspect));
      if (!hit) continue;
      hitSomething = true;
      if (hit.object.userData.piece) { shatter(hit.object.userData.piece, hit, w); continue; }
      if (hit.object.userData.acc) { hitAcc(hit.object.userData.acc, hit, w); continue; }
      anyStone = true;
      // Into the stone along the line of fire, tipped a little toward the
      // surface's own normal. A fresh hit on the skin sinks in and blasts a
      // crater; a hit on stone that's already broken (inside a crater) keeps
      // digging, scattered a little so a held trigger gnaws a ragged hole
      // rather than a neat bore. Keep at it and you'll come out the back.
      const local = model.worldToLocal(hit.point.clone());
      const n = hit.face.normal.clone();                       // block space = model space
      const dirLocal = ray.ray.direction.clone().transformDirection(new THREE.Matrix4().copy(model.matrixWorld).invert());
      if (n.dot(dirLocal) > 0) n.negate();
      const inward = dirLocal.clone().multiplyScalar(0.6).addScaledVector(n, -0.4).normalize();
      const broken = hit.face.materialIndex === 1;
      anyBroken ||= broken;
      const R = HIT_R * w.r;
      const j = R * (broken ? 0.7 : 0.25);
      local.x += rnd(-j, j); local.y += rnd(-j, j); local.z += rnd(-j, j);
      const r = R * (broken ? rnd(0.75, 1.05) : rnd(0.85, 1.15));
      const deep = w.deep * (broken ? rnd(0.65, 0.8) : rnd(0.9, 1.08));
      const sink = broken ? rnd(-0.1, 0.25) : 0.4;
      rocks.push(rockSpec(local, inward, r, sink, deep));
      hits.push(new THREE.Vector4(local.x, local.y, local.z, r * 1.1));
      lastShotDir.copy(ray.ray.direction);
      // debris leaves along the surface normal, in world space
      const nw = n.clone().transformDirection(model.matrixWorld);
      chipAt(hit.point, nw, w.chips + Math.floor(Math.random() * w.chips * 0.6));
      if (i === 0 || Math.random() < 0.4) {
        flash.position.copy(hit.point).addScaledVector(nw, 0.02);
        flash.scale.setScalar(0.06 * Math.sqrt(w.r));
        flash.visible = true;
        flashT = 0.05;
      }
    }
    if (!hitSomething) return;
    if (rocks.length) {
      postCut(rocks, hits);
      uniforms.uDust.value *= 0.35;   // the blast stirs up what had settled
      wrap.classList.add("shot");
      if (restoreBtn) restoreBtn.hidden = false;
      if (w.name === "sledgehammer") {
        // the whole board takes it
        board?.classList.remove("thud");
        void board?.offsetWidth;
        board?.classList.add("thud");
      }
    }
    shake = Math.max(shake, w.shake);
    if (anyStone || w.name !== "pistol") w.sound(anyBroken);
    else gunshot();
    kick();
  }
  const lastShotDir = new THREE.Vector3(0, 0, -1);

  // chips and a puff of dust off a struck surface (point and normal in world space)
  function chipAt(point, nw, count) {
    for (let i = 0; i < count; i++) {
      if (chips.length >= MAX_CHIPS) chips.shift();
      const big = Math.random() < 0.3;
      chips.push({
        p: point.clone(), from: point.clone(),
        v: nw.clone().multiplyScalar(rnd(0.15, 0.5)).add(new THREE.Vector3(rnd(-0.18, 0.18), rnd(0, 0.25), rnd(-0.12, 0.25))),
        r: new THREE.Euler(rnd(0, 6), rnd(0, 6), rnd(0, 6)),
        w: new THREE.Vector3(rnd(-18, 18), rnd(-18, 18), rnd(-18, 18)),
        s: new THREE.Vector3(rnd(0.6, 1.3), rnd(0.5, 1), rnd(0.7, 1.4)).multiplyScalar(big ? rnd(0.006, 0.01) : rnd(0.002, 0.005)),
        rest: false,
      });
    }
    for (let i = 0; i < 3; i++) {
      puff(point.clone().addScaledVector(nw, 0.01),
        nw.clone().multiplyScalar(rnd(0.03, 0.07)).add(new THREE.Vector3(0, -0.02, 0)), 0.014, rnd(0.03, 0.06), rnd(0.8, 1.4), 0.5);
    }
  }

  // A point just below and right of the camera, where the laser and the
  // rocket come from: as if from your hand, just out of shot.
  const muzzle = (out) => out.set(0.34, -0.26, -0.55).applyMatrix4(camera.matrixWorld);

  // ---------- Laser ----------
  // Held down, it's a beam: drawn every frame from the muzzle to whatever it
  // touches. It draws on him: every sample cuts a thin, deep slot from where
  // it last cut to where it is now, so a sweep is one groove, and burns the
  // stone along the way (see Laser burns). The slots are sent to the cutter
  // in batches, so it keeps up with a held beam.
  const LASER_BATCH = 0.14;   // seconds of beam per message to the cutter
  const LASER_JOIN = 0.06;    // metres: a jump further than this (off one edge, onto another) starts a new line
  const beamCore = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 8, 1, true),
    new THREE.MeshBasicMaterial({ color: 0xfff6f0, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false }));
  const beamGlow = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 12, 1, true),
    new THREE.MeshBasicMaterial({ color: 0xff3a24, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false }));
  const beamSpot = new THREE.Sprite(new THREE.SpriteMaterial({ map: dustTex, color: 0xff6a3a, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  const beam = new THREE.Group();
  beam.add(beamCore, beamGlow);
  beam.visible = beamSpot.visible = false;
  // drawn over everything: it always ends on the stone you can see, so it
  // should never look like it slips behind his head on the way there
  beamCore.renderOrder = beamGlow.renderOrder = beamSpot.renderOrder = 10;
  for (const m of [beamCore.material, beamGlow.material, beamSpot.material]) m.depthTest = false;
  scene.add(beam, beamSpot);
  // prev: where the line last got to (bust space), or null when it's broken
  const laser = { on: false, rocks: [], age: 0, end: new THREE.Vector3(), from: new THREE.Vector3(), touching: false, prev: null };
  const beamUp = new THREE.Vector3(0, 1, 0), beamDir = new THREE.Vector3();

  // where the beam ends this frame: the first stone along the aim, or far past him
  function beamTarget() {
    const hit = pick();
    laser.touching = !!hit;
    if (hit) laser.end.copy(hit.point);
    else { ray.setFromCamera(ndc, camera); laser.end.copy(ray.ray.origin).addScaledVector(ray.ray.direction, 3); }
    return hit;
  }
  function drawBeam(t) {
    muzzle(laser.from);
    beamDir.subVectors(laser.end, laser.from);
    const len = beamDir.length();
    beam.position.copy(laser.from).addScaledVector(beamDir, 0.5);
    beam.quaternion.setFromUnitVectors(beamUp, beamDir.normalize());
    const flick = 0.85 + 0.15 * Math.sin(t * 90) * Math.sin(t * 37);
    beamCore.scale.set(0.0016 * flick, len, 0.0016 * flick);
    beamGlow.scale.set(0.006 * flick, len, 0.006 * flick);
    beam.visible = true;
    beamSpot.visible = laser.touching;
    beamSpot.position.copy(laser.end);
    beamSpot.scale.setScalar(0.03 * flick + (laser.touching ? 0.01 : 0));
  }
  function laserStart() {
    laser.on = true;
    laser.age = 0;
    laserHum(true);
    kick();               // the beam is drawn by the frame loop, so wake it
  }
  function laserStop() {
    if (!laser.on) return;
    laser.on = false;
    laser.prev = null;
    beam.visible = beamSpot.visible = false;
    flushLaser();
    laserHum(false);
  }
  function laserSample() {
    if (!laser.on) laserStart();
    const hit = beamTarget();
    if (!hit) { laser.prev = null; return; }
    if (hit.object.userData.piece) { laser.prev = null; shatter(hit.object.userData.piece, hit, weapon, true); return; }
    if (hit.object.userData.acc) { laser.prev = null; if (hit.object.userData.acc.state !== "loose") hitAcc(hit.object.userData.acc, hit, weapon); return; }
    // straight down the beam, a thin slot sunk well past the surface, from
    // where the line had got to; a fresh line starts with a single needle.
    // Held still, it waits until it has moved a little before cutting again.
    const local = model.worldToLocal(hit.point.clone());
    const dirLocal = ray.ray.direction.clone().transformDirection(new THREE.Matrix4().copy(model.matrixWorld).invert());
    const r = HIT_R * weapon.r;
    const from = laser.prev && laser.prev.distanceTo(local) < LASER_JOIN ? laser.prev : null;
    if (!from) laser.rocks.push({ ...rockSpec(local, dirLocal, r, 1.2, weapon.deep), burnt: true });
    else if (from.distanceTo(local) > r * 0.35) laser.rocks.push(slotSpec(from, local, dirLocal, r, 1.2, weapon.deep));
    burn(from || local, local, r);
    if (!from || from.distanceTo(local) > r * 0.35) laser.prev = local;
    lastShotDir.copy(ray.ray.direction);
    // sparks: a few hot flecks and a wisp of smoke off the cut
    const n = hit.face.normal.clone().transformDirection(hit.object.matrixWorld);
    if (n.dot(ray.ray.direction) > 0) n.negate();
    if (Math.random() < 0.5) {
      puff(hit.point.clone().addScaledVector(n, 0.004), n.clone().multiplyScalar(0.05).add(new THREE.Vector3(0, 0.04, 0)),
        0.008, rnd(0.02, 0.04), rnd(0.5, 0.9), 0.35, 0x9a948c);
    }
    if (Math.random() < 0.35) chipAt(hit.point, n, 1);
    laserSizzle();
    wrap.classList.add("shot");
    if (restoreBtn) restoreBtn.hidden = false;
    if (laser.rocks.length && laser.age >= LASER_BATCH) flushLaser();
  }
  function flushLaser() {
    laser.age = 0;
    if (!laser.rocks.length) return;
    postCut(laser.rocks, []);           // a clean cut: no cracks spreading from it
    laser.rocks = [];
    uniforms.uDust.value *= 0.7;
  }

  // ---------- Laser burns ----------
  // Two parts. The scorch is a map of the bust seen straight down its z
  // axis (he only turns a little, so that's the side you can shoot): how
  // burnt each spot is, and how deep it was, so the back of his head at the
  // same x, y isn't scorched too. It only ever builds up, until restore.
  // The heat is the last HEAT_N stretches of beam path with the time each
  // end was burnt; the shader glows them white-hot and lets them cool.
  const charData = new Uint8Array(CHAR_N * CHAR_N * 4);
  const charTex = new THREE.DataTexture(charData, CHAR_N, CHAR_N);
  charTex.magFilter = charTex.minFilter = THREE.LinearFilter;
  charTex.needsUpdate = true;
  uniforms.uChar.value = charTex;
  const heat = [];   // { a, b, ta, tb }, oldest first
  const t0 = performance.now(), clock = () => (performance.now() - t0) / 1000;
  let heatUntil = 0, lastBurn = 0;
  // the map's frame, once his size is known: a square round his front
  function charFrame(box) {
    const pad = 0.02, size = Math.max(box.max.x - box.min.x, box.max.y - box.min.y) + pad * 2;
    const cx = (box.min.x + box.max.x) / 2, cy = (box.min.y + box.max.y) / 2;
    uniforms.uCharBox.value.set(cx - size / 2, cy - size / 2, size, size);
    uniforms.uCharZ.value.set(box.min.z - pad, box.max.z - box.min.z + pad * 2);
  }
  function burn(a, b, r) {
    const now = clock();
    heat.push({ a: a.clone(), b: b.clone(), ta: a === b ? now : Math.max(lastBurn, now - 0.1), tb: now });
    if (heat.length > HEAT_N) heat.shift();
    lastBurn = now;
    heatUntil = now + 3.5;
    heat.forEach((h, i) => {
      uniforms.uHeatA.value[i].set(h.a.x, h.a.y, h.a.z, h.ta);
      uniforms.uHeatB.value[i].set(h.b.x, h.b.y, h.b.z, h.tb);
    });
    uniforms.uHeatCount.value = heat.length;
    // scorch the map along a..b: full at the line, a soft brown edge out
    // to about 2 slot radii, and darker every time the beam passes
    const box = uniforms.uCharBox.value, zr = uniforms.uCharZ.value;
    const k = CHAR_N / box.z;
    const ax = (a.x - box.x) * k, ay = (a.y - box.y) * k, bx = (b.x - box.x) * k, by = (b.y - box.y) * k;
    const R = r * 2 * k, dx = bx - ax, dy = by - ay, ll = dx * dx + dy * dy;
    const x0 = Math.max(0, Math.floor(Math.min(ax, bx) - R)), x1 = Math.min(CHAR_N - 1, Math.ceil(Math.max(ax, bx) + R));
    const y0 = Math.max(0, Math.floor(Math.min(ay, by) - R)), y1 = Math.min(CHAR_N - 1, Math.ceil(Math.max(ay, by) + R));
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const h = ll > 0 ? Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / ll)) : 0;
      const d = Math.hypot(x - ax - dx * h, y - ay - dy * h);
      if (d >= R) continue;
      const e = Math.min(1, Math.max(0, (d - R * 0.35) / (R * 0.65)));
      const v = (1 - e * e * (3 - 2 * e)) * 0.5;
      const i = (y * CHAR_N + x) * 4;
      if (charData[i] < 20) charData[i + 1] = Math.round(Math.min(1, Math.max(0, (a.z + (b.z - a.z) * h - zr.x) / zr.y)) * 255);
      charData[i] = Math.min(255, charData[i] + v * 255);
    }
    charTex.needsUpdate = true;
  }
  function clearBurns() {
    charData.fill(0);
    charTex.needsUpdate = true;
    heat.length = 0;
    uniforms.uHeatCount.value = 0;
  }

  // ---------- Rocket launcher ----------
  // A rocket flies from your side of the room to wherever you clicked,
  // trailing flame and smoke, and goes off: one big crater ringed by smaller
  // ones, cracks well out past it, rubble everywhere, and anything already
  // lying on the board thrown clear.
  const ROCKET_SPEED = 3.2;   // metres a second: slow enough to watch it come
  const rockets = [];
  const rocketBody = new THREE.Group();
  {
    const metal = new THREE.MeshStandardMaterial({ color: 0x5a5f5a, roughness: 0.45, metalness: 0.6 });
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.07, 10), metal);
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.009, 0.022, 10), new THREE.MeshStandardMaterial({ color: 0x9b2a1e, roughness: 0.5 }));
    nose.position.y = 0.046;
    const fins = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.016, 0.002), metal);
    fins.position.y = -0.03;
    const fins2 = fins.clone();
    fins2.rotation.y = Math.PI / 2;
    rocketBody.add(tube, nose, fins, fins2);
  }
  function launch() {
    const hit = pick();
    if (!hit) return;
    const from = muzzle(new THREE.Vector3());
    const mesh = rocketBody.clone();
    const flame = new THREE.Sprite(new THREE.SpriteMaterial({ map: dustTex, color: 0xffa040, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    flame.position.y = -0.05;
    flame.scale.setScalar(0.035);
    mesh.add(flame);
    mesh.position.copy(from);
    mesh.quaternion.setFromUnitVectors(beamUp, hit.point.clone().sub(from).normalize());
    scene.add(mesh);
    const dist = from.distanceTo(hit.point);
    const rk = {
      mesh, flame, from, to: hit.point.clone(), t: 0, dur: dist / ROCKET_SPEED,
      hit: { object: hit.object, face: hit.face, point: hit.point.clone(), dir: ray.ray.direction.clone() },
      sound: rocketLaunchSound(dist / ROCKET_SPEED),
      hold: null,
    };
    // The crater is cut now, in the background, while the rocket's in the
    // air, and held back until it lands: so it's there the instant it hits.
    if (blocks.includes(hit.object)) {
      rk.hold = { landed: false };
      const w = weapon, local = model.worldToLocal(hit.point.clone());
      const n = hit.face.normal.clone();
      const dirLocal = rk.hit.dir.clone().transformDirection(new THREE.Matrix4().copy(model.matrixWorld).invert());
      if (n.dot(dirLocal) > 0) n.negate();
      const inward = dirLocal.clone().multiplyScalar(0.5).addScaledVector(n, -0.5).normalize();
      const R = HIT_R * w.r;
      const rocks = [rockSpec(local, inward, R * rnd(0.95, 1.1), 0.15, w.deep)];
      const hits = [new THREE.Vector4(local.x, local.y, local.z, R * 1.1)];
      for (let k = 0; k < 2; k++) {
        const off = new THREE.Vector3(rnd(-1, 1), rnd(-1, 1), rnd(-1, 1)).normalize().multiplyScalar(R * rnd(0.6, 0.9));
        const p = local.clone().add(off);
        rocks.push(rockSpec(p, inward, R * rnd(0.45, 0.6), 0.3, 1));
      }
      postCut(rocks, hits, rk.hold);
    }
    rockets.push(rk);
    wrap.classList.add("shot");
    if (restoreBtn) restoreBtn.hidden = false;
    shake = Math.max(shake, 0.25);
    kick();
  }
  function stepRockets(dt) {
    for (let i = rockets.length - 1; i >= 0; i--) {
      const rk = rockets[i];
      rk.t += dt;
      const u = Math.min(1, rk.t / rk.dur);
      rk.mesh.position.lerpVectors(rk.from, rk.to, u);
      rk.flame.scale.setScalar(0.03 + Math.random() * 0.02);
      // smoke: a puff left behind every frame, drifting and spreading
      const back = rk.to.clone().sub(rk.from).normalize().multiplyScalar(-0.04);
      puff(rk.mesh.position.clone().add(back), new THREE.Vector3(rnd(-0.02, 0.02), rnd(0.01, 0.04), rnd(-0.02, 0.02)),
        0.012, rnd(0.05, 0.09), rnd(0.9, 1.5), 0.45, 0xb8b4ae);
      if (u >= 1) {
        scene.remove(rk.mesh);
        rockets.splice(i, 1);
        explode(rk);
      }
    }
  }
  function explode(rk) {
    const { hit } = rk;
    rk.sound?.stop();
    const at = hit.point;
    const w = weapon.rocket ? weapon : WEAPONS.find((x) => x.rocket);
    // anything on the board nearby is thrown clear
    for (const pc of [...pieces, ...loose]) {
      if (pc.shattered) continue;
      const away = pc.mesh.position.clone().sub(at);
      const d = away.length();
      if (d > 0.32) continue;
      const push = (1 - d / 0.32) * 1.6;
      pc.rest = false;
      pc.v.add(away.normalize().multiplyScalar(push)).add(new THREE.Vector3(0, push * 0.6, 0));
      pc.w.add(new THREE.Vector3(rnd(-9, 9), rnd(-9, 9), rnd(-9, 9)));
    }
    if (hit.object.userData.acc) hitAcc(hit.object.userData.acc, hit, w);
    if (hit.object.userData.piece) {
      // a direct hit on a fallen chunk: it's gone
      const pc = hit.object.userData.piece;
      pc.hits = 1e9;
      shatter(pc, hit, w, true);
    }
    if (rk.hold) {
      // the crater was cut on the way in; it shows now
      rk.hold.landed = true;
      drainReplies();
      uniforms.uDust.value = 0;
      lastShotDir.copy(hit.dir);
    }
    // the blast: a fireball, a flash, a cloud, rubble everywhere
    const nw = hit.face.normal.clone().transformDirection(hit.object.matrixWorld);
    if (nw.dot(hit.dir) > 0) nw.negate();
    chipAt(at, nw, w.chips);
    for (let k = 0; k < 14; k++) {
      puff(at.clone().addScaledVector(nw, 0.02), nw.clone().multiplyScalar(rnd(0.05, 0.2)).add(new THREE.Vector3(rnd(-0.12, 0.12), rnd(0, 0.15), rnd(-0.12, 0.12))),
        0.025, rnd(0.08, 0.16), rnd(0.9, 1.6), 0.4, k < 4 ? 0x8a8580 : 0xcfc6b8);
    }
    fireball.position.copy(at).addScaledVector(nw, 0.03);
    fireballT = FIREBALL;
    fireball.visible = true;
    flash.position.copy(at).addScaledVector(nw, 0.03);
    flash.scale.setScalar(0.4);
    flash.visible = true;
    flashT = 0.08;
    shake = Math.max(shake, w.shake);
    board?.classList.remove("thud");
    void board?.offsetWidth;
    board?.classList.add("thud");
    explosionSound();
    kick();
  }
  const FIREBALL = 0.45;
  const fireball = new THREE.Sprite(new THREE.SpriteMaterial({ map: dustTex, color: 0xff8a30, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  fireball.visible = false;
  scene.add(fireball);
  let fireballT = 0;

  // A shot on a fallen chunk chips it, and the last one bursts it into
  // rubble: a small chunk goes in one, a whole head takes a handful.
  // (Restore still brings it back: it reappears where it lay and flies
  // home with the rest.)
  function shatter(pc, hit, w, quiet) {
    const size = pc.mesh.children[0].geometry.boundingSphere.radius;
    pc.hits = (pc.hits || 0) + w.r * w.r;   // a hammer blow counts for a lot more than a pellet
    if (pc.hits < Math.ceil(size * 40)) {
      chipAt(hit.point, hit.face.normal.clone().transformDirection(hit.object.matrixWorld), w.beam ? (Math.random() < 0.3 ? 1 : 0) : 8);
      pc.rest = false;
      pc.v.add(lastShotDir.clone().multiplyScalar(w.beam ? 0.01 : 0.12)).add(new THREE.Vector3(0, w.beam ? 0.004 : 0.08, 0));
      pc.w.add(new THREE.Vector3(rnd(-3, 3), rnd(-3, 3), rnd(-3, 3)));
      shake = Math.max(shake, 0.2);
      if (!quiet) impactSound(true);
      kick();
      return;
    }
    pc.shattered = true;
    for (const a of [...(pc.carried || [])]) detach(a, new THREE.Vector3(rnd(-0.1, 0.1), rnd(0.2, 0.35), rnd(0, 0.15)));
    pc.mesh.visible = false;
    const count = Math.min(60, 10 + Math.round(size * 900));
    const at = new THREE.Vector3();
    for (let i = 0; i < count; i++) {
      if (chips.length >= MAX_CHIPS) chips.shift();
      at.copy(pc.hull[Math.floor(Math.random() * pc.hull.length)]).applyQuaternion(pc.mesh.quaternion).add(pc.mesh.position);
      const big = Math.random() < 0.35;
      chips.push({
        p: at.clone(), from: at.clone(),
        v: new THREE.Vector3(rnd(-0.3, 0.3), rnd(0.2, 0.6), rnd(-0.3, 0.3)),
        r: new THREE.Euler(rnd(0, 6), rnd(0, 6), rnd(0, 6)),
        w: new THREE.Vector3(rnd(-18, 18), rnd(-18, 18), rnd(-18, 18)),
        s: new THREE.Vector3(rnd(0.6, 1.3), rnd(0.5, 1), rnd(0.7, 1.4)).multiplyScalar(big ? rnd(0.006, 0.012) : rnd(0.002, 0.006)),
        rest: false,
      });
    }
    for (let i = 0; i < 6; i++) {
      puff(hit.point.clone().add(new THREE.Vector3(rnd(-0.02, 0.02), rnd(0, 0.02), rnd(-0.02, 0.02))),
        new THREE.Vector3(rnd(-0.06, 0.06), rnd(0.02, 0.08), rnd(-0.06, 0.06)), 0.02, rnd(0.05, 0.1), rnd(1, 1.6), 0.5);
    }
    history.push({ undo: [], pieces: [], shattered: pc, left });
    shots++;
    updateStats();
    shake = Math.max(shake, 0.25);
    if (!quiet) { impactSound(true); thud(0.4); }
    kick();
  }

  function updatePointer(e) {
    const r = canvas.getBoundingClientRect();
    pointer.inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  }

  // The canvas hangs over the top of the board and takes no pointer events
  // itself, so the board under it stays clickable (the page's links). The page listens instead
  // and only claims a click that actually lands on stone; the crosshair
  // likewise only shows while you're over the bust.
  let hoverQueued = false, aiming = false;
  window.addEventListener("pointermove", (e) => {
    updatePointer(e);
    if (hoverQueued) return;
    hoverQueued = true;
    requestAnimationFrame(() => {
      hoverQueued = false;
      const on = pointer.inside && (pointer.down || !!pick());
      if (on !== aiming) { aiming = on; document.documentElement.classList.toggle("bust-aim", on); }
    });
  }, { passive: true });
  // Mouse: press to fire, hold to keep firing. Touch: a tap fires, a held
  // finger keeps firing, and a sideways drag turns him to show the damage.
  let touch = null;   // { x, y, t, dragging, yaw0 } while a finger is down on him
  window.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    updatePointer(e);
    if (!pointer.inside || !pick()) return;
    if (e.pointerType === "touch") {
      touch = { x: e.clientX, y: e.clientY, t: performance.now(), dragging: false, yaw0: yawTarget, fired: false };
      kick();
      return;
    }
    e.preventDefault();
    pointer.down = true;
    shoot();
    fireCd = weapon.every;
  });
  window.addEventListener("pointermove", (e) => {
    if (!touch || e.pointerType !== "touch") return;
    const dx = e.clientX - touch.x;
    if (!touch.dragging && !touch.fired && Math.abs(dx) > 10) { touch.dragging = true; pointer.down = false; }
    if (touch.dragging) {
      yawTarget = Math.max(-MAX_YAW, Math.min(MAX_YAW, touch.yaw0 + dx * 0.008));
      kick();
    }
  }, { passive: true });
  const release = (e) => {
    if (touch && e?.pointerType === "touch") {
      // a quick tap that never turned into a drag or a held burst: one shot
      if (!touch.dragging && !touch.fired) { updatePointer(e); shoot(); }
      touch = null;
    }
    pointer.down = false;
  };
  window.addEventListener("pointerup", release);
  window.addEventListener("pointercancel", release);
  window.addEventListener("blur", release);

  // Restore: the whole thing runs backwards. The shots come undo newest
  // first, so the craters fill in in reverse, and the rubble flies back up
  // into the holes it came out of.
  // Fallen chunks go first: they lift off the board and fly back to where
  // they broke from, and only then do the shots start coming undone.
  let rewind = null;   // { t, shots, chips: [...], pieces: [...] } while it runs
  restoreBtn?.addEventListener("click", () => {
    if (rewind) return;
    gen++;               // anything still being cut is dropped
    pendingImpacts.length = 0;
    pendingRocks.length = 0;
    holds.length = 0;
    replies.length = 0;
    pointer.down = false;
    laser.rocks = [];    // dropped first, or stopping the beam would send them
    laserStop();
    clearBurns();
    for (const rk of rockets.splice(0)) { scene.remove(rk.mesh); rk.sound?.stop(); }
    rewind = {
      t: 0, shots: history.length,
      chips: chips.map((c) => ({ c, at: c.p.clone(), delay: rnd(0, 0.45), lift: rnd(0.03, 0.12) })),
      pieces: pieces.map((pc) => ({ pc, at: pc.mesh.position.clone(), q: pc.mesh.quaternion.clone() })),
      loose: loose.map((pc) => ({
        pc, at: pc.mesh.position.clone(), q: pc.mesh.quaternion.clone(),
        to: pc.acc.center.clone().applyMatrix4(model.matrixWorld), toQ: model.getWorldQuaternion(new THREE.Quaternion()),
        s0: pc.acc.group.scale.y,
      })),
    };
    for (const pc of pieces) { pc.shattered = false; pc.hits = 0; pc.mesh.visible = true; }
    for (const pc of [...pieces, ...loose]) pc.rest = true;
    yawTarget = 0;
    restoreBtn.hidden = true;
    rewindSound();
    kick();
  });

  // ---------- Sound ----------
  // Real recordings where they exist (bust/sfx: Kenney's CC0 packs -- rock
  // struck with a pick, grit, explosions, a laser, a thruster -- plus the
  // pistol's and the shotgun's own shots), layered with
  // synthesis for what no recording does (a gun's crack, a beam's hum). Every
  // sound goes through one mix: a small room's reverb so it all sits in the
  // same space, and a limiter so a burst of fire never clips.
  // name: how many takes (name-0.mp3, name-1.mp3...), or the one file it is
  const SFX = {
    stone: 5, grit: 5, blast: 4, boom: 2, zap: 3, thrust: 1,
    gunshot: "classic-gunshot", shotgun: "shotgun-meme",
  };
  let actx = null, noise = null, out = null, verb = null, sfx = null;
  function audio() {
    if (actx) return actx;
    actx = new (window.AudioContext || window.webkitAudioContext)();
    noise = actx.createBuffer(1, actx.sampleRate * 1.2, actx.sampleRate);
    const d = noise.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    // the mix: everything into `out`, a share of it into the room
    const limit = actx.createDynamicsCompressor();
    limit.threshold.value = -10; limit.knee.value = 8; limit.ratio.value = 8;
    limit.attack.value = 0.002; limit.release.value = 0.18;
    const master = actx.createGain();
    master.gain.value = 0.9;
    out = actx.createGain();
    out.connect(limit);
    verb = actx.createConvolver();
    verb.buffer = room(1.4);
    const wet = actx.createGain();
    wet.gain.value = 0.22;
    out.connect(verb).connect(wet).connect(limit);
    limit.connect(master).connect(actx.destination);
    // the recordings, fetched once, the first time anything makes a sound
    sfx = {};
    for (const [name, n] of Object.entries(SFX)) {
      sfx[name] = [];
      for (let i = 0; i < (typeof n === "string" ? 1 : n); i++) {
        const file = typeof n === "string" ? n : n > 1 ? `${name}-${i}` : name;
        fetch(new URL(`sfx/${file}.mp3`, import.meta.url))
          .then((r) => r.arrayBuffer())
          .then((b) => actx.decodeAudioData(b))
          .then((buf) => { sfx[name][i] = buf; })
          .catch(() => { /* that one stays synthesized */ });
      }
    }
    return actx;
  }
  // a small stone room: decaying stereo noise, brighter at the start
  function room(seconds) {
    const n = Math.floor(actx.sampleRate * seconds), ir = actx.createBuffer(2, n, actx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const ch = ir.getChannelData(c);
      for (let i = 0; i < n; i++) ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3.2);
    }
    return ir;
  }
  // play a recording (a random take of it), or say it isn't loaded yet
  // (offset: seconds into the recording to start from)
  function play(name, { at = actx.currentTime, gain = 1, rate = 1, take, dur, offset = 0 } = {}) {
    const list = sfx?.[name];
    const buf = list && list[take ?? Math.floor(Math.random() * list.length)];
    if (!buf) return null;
    const src = actx.createBufferSource(), g = actx.createGain();
    src.buffer = buf;
    src.playbackRate.value = rate;
    g.gain.value = gain;
    src.connect(g).connect(out);
    src.start(at, offset);
    if (dur) {
      g.gain.setValueAtTime(gain, at + dur - 0.08);
      g.gain.linearRampToValueAtTime(0.0001, at + dur);
      src.stop(at + dur + 0.02);
    }
    return { src, g };
  }
  function burst(t, { type = "bandpass", f0, f1, q = 1, gain, dur, offset = 0 }) {
    const src = actx.createBufferSource(), f = actx.createBiquadFilter(), g = actx.createGain();
    src.buffer = noise;
    f.type = type;
    f.frequency.setValueAtTime(f0, t);
    if (f1) f.frequency.exponentialRampToValueAtTime(f1, t + dur);
    f.Q.value = q;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(out);
    src.start(t, offset || Math.random() * 0.6);
    src.stop(t + dur + 0.02);
  }
  function tone(t, f0, f1, gain, dur, type = "sine") {
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.003);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(out);
    o.start(t);
    o.stop(t + dur + 0.02);
  }
  // the weight behind a hit: a low thump you feel more than hear
  function thump(t, f, gain, dur) {
    tone(t, f, f * 0.4, gain, dur);
  }
  // stone giving way, then grit settling: the recordings, or synthesis
  function stoneHit(t, { gain = 0.7, rate = 1, grit = 4 } = {}) {
    if (!play("stone", { at: t, gain, rate: rate * rnd(0.92, 1.1) })) {
      tone(t, 900 * rate, 160, 0.18 * gain, 0.06, "triangle");
      burst(t + 0.004, { f0: rnd(1500, 2400), f1: 420, q: 0.8, gain: 0.12 * gain, dur: 0.22 });
    }
    for (let i = 0; i < grit; i++) {
      const at = t + 0.06 + Math.pow(Math.random(), 1.5) * 0.45;
      if (!play("grit", { at, gain: rnd(0.12, 0.3) * gain, rate: rnd(0.9, 1.5) }))
        burst(at, { type: "highpass", f0: rnd(2500, 6000), q: 0.7, gain: rnd(0.012, 0.03), dur: rnd(0.012, 0.03) });
    }
  }
  // A bullet into stone: the sledgehammer's recipe, smaller. Real stone
  // struck, pitched a little lower and heavier than it was recorded, a low
  // thump under it, a short boom for punch, grit after. Duller where he's
  // already broken. Fired from the pistol, the gunshot recording stands in
  // for the thump and boom.
  function impactSound(broken, fired) {
    try {
      audio();
      const t = actx.currentTime;
      if (!(fired && play("gunshot", { at: t, gain: 0.8, rate: rnd(0.97, 1.03) }))) {
        thump(t, rnd(105, 125), 0.28, 0.16);
        play("boom", { at: t, gain: 0.22, rate: rnd(1.9, 2.3), take: 1 });
      }
      stoneHit(t, { gain: broken ? 0.7 : 0.85, rate: broken ? rnd(0.68, 0.76) : rnd(0.8, 0.9), grit: 2 + Math.floor(Math.random() * 3) });
    } catch (e) { /* no audio, no problem */ }
  }
  // gold (or a lens) struck or landing: a bright, inharmonic ring; a chain
  // is a handful of them tumbling over each other
  function clink(strength = 0.6, a) {
    try {
      audio();
      const t = actx.currentTime, n = a?.kind === "chain" ? 6 : 2;
      for (let k = 0; k < n; k++) {
        const at = t + (k ? rnd(0.01, 0.16) : 0), f = rnd(2200, 3300) * (a?.kind === "glass" ? 1.35 : 1);
        for (const [m, g, d] of [[1, 0.09, 0.4], [2.76, 0.05, 0.25], [5.4, 0.03, 0.12]]) {
          if (f * m < 18000) tone(at, f * m, f * m * 0.995, g * strength * (k ? 0.6 : 1), d);
        }
        burst(at, { type: "highpass", f0: 5000, q: 0.7, gain: 0.04 * strength, dur: 0.03 });
      }
    } catch (e) { /* no audio, no problem */ }
  }
  // the pistol on its own, when the shot didn't touch stone
  function gunshot() {
    try {
      audio();
      if (!play("gunshot", { at: actx.currentTime, gain: 0.8, rate: rnd(0.97, 1.03) })) thump(actx.currentTime, rnd(105, 125), 0.28, 0.16);
    } catch (e) { /* no audio, no problem */ }
  }
  // a chunk hitting the board
  function thud(strength) {
    try {
      audio();
      const t = actx.currentTime;
      if (!play("stone", { at: t, gain: 0.35 + 0.6 * strength, rate: rnd(0.45, 0.6) })) {
        tone(t, rnd(110, 150), 55, 0.25 * strength + 0.05, 0.18);
        burst(t, { type: "lowpass", f0: 900, f1: 200, q: 0.7, gain: 0.12 * strength + 0.03, dur: 0.16 });
      }
      for (let i = 0; i < 2 + Math.round(strength * 4); i++)
        play("grit", { at: t + 0.03 + Math.random() * 0.3, gain: rnd(0.1, 0.25) * (0.4 + strength), rate: rnd(0.8, 1.3) });
    } catch (e) { /* no audio, no problem */ }
  }
  // restore: a rising, reversed-sounding swell
  function rewindSound() {
    try {
      audio();
      const t = actx.currentTime, dur = GATHER + REWIND;
      const src = actx.createBufferSource(), f = actx.createBiquadFilter(), g = actx.createGain();
      src.buffer = noise;
      f.type = "bandpass";
      f.Q.value = 1.6;
      f.frequency.setValueAtTime(300, t);
      f.frequency.exponentialRampToValueAtTime(3200, t + dur);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.09, t + dur * 0.92);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.05);
      src.connect(f).connect(g).connect(out);
      src.start(t);
      src.stop(t + dur + 0.1);
      tone(t + dur - 0.02, 1400, 2200, 0.05, 0.12);   // and a soft click as he's whole again
    } catch (e) { /* no audio, no problem */ }
  }
  // The shotgun: its recording (skipping the silence it opens with), and
  // the pellets' stone hits landing as a ragged cluster right after it.
  // The recording rings for seconds, longer than a reload, so the next
  // shot cuts the last one off rather than piling up on it. Until it has
  // loaded: one deep boom and thump.
  let lastShotgun = null;
  function shotgunSound() {
    try {
      audio();
      const t = actx.currentTime;
      if (lastShotgun) {
        lastShotgun.g.gain.setTargetAtTime(0, t, 0.02);
        lastShotgun.src.stop(t + 0.15);
      }
      lastShotgun = play("shotgun", { at: t, gain: 0.85, offset: 0.42 });
      if (!lastShotgun) {
        thump(t, rnd(80, 92), 0.42, 0.24);
        play("boom", { at: t, gain: 0.5, rate: rnd(1.45, 1.6), take: 1 });
      }
      for (let i = 0; i < 4; i++)
        stoneHit(t + 0.01 + Math.random() * 0.07, { gain: rnd(0.35, 0.5), rate: rnd(0.75, 1.0), grit: 2 });
    } catch (e) { /* no audio, no problem */ }
  }
  // a sledgehammer: a deep, heavy crunch and a long rubble tail
  function hammerSound() {
    try {
      audio();
      const t = actx.currentTime;
      tone(t, rnd(70, 85), 30, 0.4, 0.35);
      stoneHit(t, { gain: 1, rate: 0.55, grit: 10 });
      play("boom", { at: t, gain: 0.35, rate: 1.4, take: 1 });
    } catch (e) { /* no audio, no problem */ }
  }
  // the laser: a zap as it fires, then a hum for as long as it's held
  let hum = null, lastSizzle = 0;
  function laserHum(on) {
    try {
      audio();
      const t = actx.currentTime;
      if (on) {
        if (hum) return;
        play("zap", { at: t, gain: 0.35, rate: rnd(0.95, 1.05) });
        const g = actx.createGain(), f = actx.createBiquadFilter();
        f.type = "lowpass"; f.frequency.value = 2400; f.Q.value = 2;
        const a = actx.createOscillator(), b = actx.createOscillator(), lfo = actx.createOscillator(), depth = actx.createGain();
        a.type = "sawtooth"; a.frequency.value = 92;
        b.type = "square"; b.frequency.value = 184.6;
        lfo.frequency.value = 23; depth.gain.value = 700;
        lfo.connect(depth).connect(f.frequency);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.06, t + 0.05);
        a.connect(f); b.connect(f); f.connect(g).connect(out);
        a.start(t); b.start(t); lfo.start(t);
        hum = { g, nodes: [a, b, lfo] };
      } else if (hum) {
        hum.g.gain.cancelScheduledValues(t);
        hum.g.gain.setValueAtTime(hum.g.gain.value, t);
        hum.g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
        for (const n of hum.nodes) n.stop(t + 0.15);
        hum = null;
      }
    } catch (e) { /* no audio, no problem */ }
  }
  // the beam on stone: a crackling sizzle, a grain at a time
  function laserSizzle() {
    try {
      audio();
      const t = actx.currentTime;
      if (t - lastSizzle < 0.03) return;
      lastSizzle = t;
      burst(t, { type: "highpass", f0: rnd(3000, 7000), q: 0.9, gain: rnd(0.02, 0.05), dur: rnd(0.02, 0.05) });
      if (Math.random() < 0.15) play("grit", { at: t, gain: 0.12, rate: rnd(1.4, 2) });
    } catch (e) { /* no audio, no problem */ }
  }
  // the rocket: the thruster roaring for its flight
  function rocketLaunchSound(flight) {
    try {
      audio();
      const t = actx.currentTime;
      thump(t, 70, 0.25, 0.2);
      burst(t, { type: "bandpass", f0: 600, f1: 2400, q: 0.8, gain: 0.1, dur: Math.max(0.15, flight) });
      const h = play("thrust", { at: t, gain: 0.5, rate: 1.1, dur: Math.max(0.2, flight + 0.05) });
      return { stop() { if (h) { const n = actx.currentTime; h.g.gain.cancelScheduledValues(n); h.g.gain.setValueAtTime(h.g.gain.value, n); h.g.gain.linearRampToValueAtTime(0.0001, n + 0.05); } } };
    } catch (e) { return null; }
  }
  // the blast: a crunch on top of a deep boom, stone splitting, rubble raining
  function explosionSound() {
    try {
      audio();
      const t = actx.currentTime;
      if (!play("blast", { at: t, gain: 1, rate: rnd(0.9, 1.05) })) {
        burst(t, { type: "lowpass", f0: 2200, f1: 120, q: 0.6, gain: 0.5, dur: 0.9 });
      }
      play("boom", { at: t, gain: 0.9, rate: rnd(0.85, 1), take: 0 });
      tone(t, 70, 24, 0.5, 0.7);
      stoneHit(t + 0.03, { gain: 0.8, rate: 0.6, grit: 0 });
      for (let i = 0; i < 16; i++)
        play("grit", { at: t + 0.15 + Math.pow(Math.random(), 1.3) * 1.3, gain: rnd(0.1, 0.32), rate: rnd(0.7, 1.4) });
    } catch (e) { /* no audio, no problem */ }
  }

  // ---------- Weapon switch ----------
  // Soft-launched: a quiet label that cycles on click, and keys 1 to 5.
  const weaponBtn = wrap.querySelector(".bust-weapon");
  function setWeapon(i) {
    laserStop();
    weapon = WEAPONS[(i + WEAPONS.length) % WEAPONS.length];
    fireCd = Math.min(fireCd, 0.1);
    if (weaponBtn) weaponBtn.textContent = weapon.name;
    try { audio(); tone(actx.currentTime, 1800, 1200, 0.04, 0.05, "square"); } catch (e) { /* no audio */ }
  }
  weaponBtn?.addEventListener("click", () => setWeapon(WEAPONS.indexOf(weapon) + 1));
  window.addEventListener("keydown", (e) => {
    if (!ready || e.metaKey || e.ctrlKey || e.altKey || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable) return;
    const i = ["1", "2", "3", "4", "5"].indexOf(e.key);
    if (i >= 0) setWeapon(i);
  });

  // ---------- Stats ----------
  const stats = wrap.querySelector(".bust-stats");
  function updateStats() {
    if (!stats) return;
    stats.hidden = shots === 0;
    const gone = Math.max(0, Math.min(100, (1 - left) * 100));
    stats.textContent = `${shots} shot${shots === 1 ? "" : "s"} · ${gone < 10 ? gone.toFixed(1) : Math.round(gone)}% gone`;
  }

  // ---------- Size: stand the plinth on the board's top edge ----------
  function resize() {
    const w = wrap.clientWidth, h = wrap.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    if (!ready) return;
    // Where the front of the plinth's foot lands on screen is where the
    // board's top border should be; pull the board up to meet it.
    camera.updateMatrixWorld();
    const y0 = pivot.position.y;
    pivot.position.y = 0;
    pivot.updateMatrixWorld(true);
    let lowest = -1;
    for (const f of foot) {
      footTmp.copy(f).applyMatrix4(model.matrixWorld).project(camera);
      lowest = Math.max(lowest, (1 - (footTmp.y + 1) / 2) * h);
    }
    pivot.position.y = y0;
    const footY = lowest > 0 ? lowest - 3 : h * 0.9;   // sink 3px into the border
    const gap = parseFloat(getComputedStyle(wrap.parentElement).rowGap) || 0;
    wrap.style.marginBottom = `${-(h - footY) - gap}px`;
    wrap.style.setProperty("--foot", `${h - footY}px`);
    kick();
  }
  new ResizeObserver(resize).observe(wrap);

  let visible = true;
  new IntersectionObserver((es) => { visible = es[0].isIntersecting; kick(); }).observe(wrap);

  // ---------- Loop: only while something is moving ----------
  let running = false, last = 0;
  function kick() {
    if (running || !visible || !ready) return;
    running = true;
    last = performance.now();
    requestAnimationFrame(frame);
  }

  function land() {
    shake = 1.6;
    board?.classList.remove("thud");
    void board?.offsetWidth;
    board?.classList.add("thud");
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2;
      puff(new THREE.Vector3(Math.cos(a) * 0.1, 0.01, Math.sin(a) * 0.1),
        new THREE.Vector3(Math.cos(a) * rnd(0.12, 0.25), rnd(0.01, 0.04), Math.sin(a) * rnd(0.12, 0.25)),
        0.03, rnd(0.08, 0.14), rnd(1, 1.6), 0.45);
    }
  }

  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), keyView = new THREE.Vector3();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    let busy = false;

    // falling in, then landing hard
    if (drop) {
      drop.v -= GRAVITY * 2.2 * dt;
      drop.y += drop.v * dt;
      // (he's still moving this frame: the shadow follows him down to the board)
      shadowDirty = true;
      if (drop.y <= 0) { drop = null; pivot.position.y = 0; land(); }
      else pivot.position.y = drop.y;
      busy = true;
    }

    if (pointer.down) {
      busy = true;
      fireCd -= dt;
      if (fireCd <= 0) { shoot(); fireCd = weapon.every; }
    }

    // the laser, while it's held: redrawn every frame, cut in batches
    if (laser.on) {
      if (!pointer.down || !weapon.beam) laserStop();
      else {
        laser.age += dt;
        beamTarget();
        drawBeam(now / 1000);
        busy = true;
      }
    }
    if (rockets.length) { stepRockets(dt); busy = true; }
    // laser burns cooling
    if (uniforms.uHeatCount.value) {
      uniforms.uTime.value = clock();
      if (clock() < heatUntil) busy = true;
      else { heat.length = 0; uniforms.uHeatCount.value = 0; }
    }
    if (fireballT > 0) {
      fireballT = Math.max(0, fireballT - dt);
      const f = 1 - fireballT / FIREBALL;
      fireball.scale.setScalar(0.08 + 0.32 * Math.sqrt(f));
      fireball.material.opacity = (1 - f) * (1 - f);
      if (fireballT <= 0) fireball.visible = false;
      busy = true;
    }

    if (rewind) {
      rewind.t = Math.min(GATHER + REWIND, rewind.t + dt);
      // fallen chunks home first
      const gu = Math.min(1, rewind.t / GATHER), ge = gu * gu * (3 - 2 * gu);
      for (const { pc, at, q } of rewind.pieces) {
        pc.mesh.position.lerpVectors(at, pc.home.p, ge);
        pc.mesh.position.y += Math.sin(Math.PI * ge) * 0.06;
        pc.mesh.quaternion.slerpQuaternions(q, pc.home.q, ge);
      }
      for (const { pc, at, q, to, toQ, s0 } of rewind.loose) {
        const a = pc.acc, sy = s0 + (1 - s0) * ge;
        if (a.pc !== pc) continue;   // already home (its shot came undone)
        a.group.scale.set(1, sy, 1);
        a.group.position.set(-a.center.x, -a.center.y * sy, -a.center.z);
        pc.mesh.position.lerpVectors(at, to, ge);
        pc.mesh.position.y += Math.sin(Math.PI * ge) * 0.08;
        pc.mesh.quaternion.slerpQuaternions(q, toQ, ge);
      }
      const u = Math.max(0, rewind.t - GATHER) / REWIND, e = u * u * (3 - 2 * u);
      // undo shots on an ease, so it starts slow and rushes the last ones
      const left = Math.round(rewind.shots * (1 - e));
      while (history.length > left) undoShot();
      // each chip leaves the board on its own beat and arcs back up into
      // the hole it came from
      for (const { c, at, delay, lift } of rewind.chips) {
        const v = Math.min(1, Math.max(0, (u - delay) / 0.55)), f = v * v * (3 - 2 * v);
        c.p.lerpVectors(at, c.from, f);
        c.p.y += Math.sin(Math.PI * f) * lift;
        c.r.x -= c.w.x * dt * 0.5; c.r.y -= c.w.y * dt * 0.5;
      }
      if (rewind.t >= GATHER + REWIND) {
        while (history.length) undoShot();
        for (const a of accs) { home(a); a.hp = a.tough; a.heat = 0; glow(a, 0); }
        for (const pc of pieces.splice(0)) { scene.remove(pc.mesh); pc.mesh.children[0].geometry.dispose(); }
        worker.postMessage({ type: "reset" });
        chips.length = 0;
        wrap.classList.remove("shot");
        rewind = null;
      }
      busy = true;
    }

    // fallen chunks tumble and settle
    if (!rewind) for (const pc of [...pieces, ...loose]) if (stepPiece(pc, dt)) { busy = true; shadowDirty = true; }
    if (stepTwinkles(dt)) busy = true;
    if (stepAccs(dt)) busy = true;

    // dust settles back into the craters once the shooting stops
    if (history.length && uniforms.uDust.value < 1 && !pointer.down) {
      uniforms.uDust.value = Math.min(1, uniforms.uDust.value + dt / 2.5);
      busy = true;
    }

    // a drag turns him; let go and he stays put
    const dy = yawTarget - pivot.rotation.y;
    if (Math.abs(dy) > 1e-4) { pivot.rotation.y += dy * Math.min(1, dt * 10); busy = true; shadowDirty = true; }
    if (touch && !touch.dragging && !touch.fired && performance.now() - touch.t > 280) {
      // a finger held still on him: keep firing
      touch.fired = true;
      pointer.down = true;
      shoot();
      fireCd = weapon.every;
    }
    if (touch) busy = true;

    // camera shake: sharp, short, no easing wobble
    shake = Math.max(0, shake - dt * 6);
    const k = shake * shake * 0.006;
    camera.position.set(CAM.x + rnd(-k, k), CAM.y + rnd(-k, k), CAM.z);
    camera.lookAt(LOOK);
    if (shake > 0) busy = true;

    // chips fall, skitter, and stay where they land — rubble on the board
    let chipsMoving = false;
    for (const c of chips) {
      if (c.rest || rewind) continue;
      chipsMoving = true;
      c.v.y -= GRAVITY * dt;
      c.p.addScaledVector(c.v, dt);
      c.r.x += c.w.x * dt; c.r.y += c.w.y * dt; c.r.z += c.w.z * dt;
      const floor = c.s.y;
      if (c.p.y < floor) {
        c.p.y = floor;
        if (Math.abs(c.v.y) < 0.12) { c.rest = true; continue; }
        c.v.y *= -0.25; c.v.x *= 0.45; c.v.z *= 0.45; c.w.multiplyScalar(0.35);
      }
      busy = true;
    }
    for (let i = 0; i < chips.length; i++) {
      const c = chips[i];
      m4.compose(c.p, q.setFromEuler(c.r), c.s);
      chipMesh.setMatrixAt(i, m4);
    }
    chipMesh.count = chips.length;
    chipMesh.instanceMatrix.needsUpdate = true;

    for (const d of dust) {
      if (!d.s.visible) continue;
      d.life -= dt;
      if (d.life <= 0) { d.s.visible = false; continue; }
      d.v.multiplyScalar(Math.pow(0.2, dt));
      d.s.position.addScaledVector(d.v, dt);
      d.s.scale.addScalar(d.grow * dt);
      const t = d.life / d.max;
      d.s.material.opacity = d.peak * Math.min(1, (1 - t) * 8) * t;
      busy = true;
    }
    if (flashT > 0) { flashT -= dt; busy = true; if (flashT <= 0) flash.visible = false; }

    keyView.copy(key.position).normalize().transformDirection(camera.matrixWorldInverse);
    uniforms.uKeyDir.value.copy(keyView);

    if (drop || rewind || chipsMoving) shadowDirty = true;
    if (shadowDirty) { renderer.shadowMap.needsUpdate = true; shadowDirty = false; }
    renderer.render(scene, camera);
    if (busy && visible && !document.hidden) requestAnimationFrame(frame);
    else running = false;
  }
}

// a four-point star with a soft glow, for the twinkle
function starTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d");
  const glow = g.createRadialGradient(64, 64, 0, 64, 64, 30);
  glow.addColorStop(0, "rgba(255,255,255,1)");
  glow.addColorStop(0.25, "rgba(255,250,235,0.5)");
  glow.addColorStop(1, "rgba(255,240,210,0)");
  g.fillStyle = glow;
  g.fillRect(0, 0, 128, 128);
  for (const [w, h] of [[3, 62], [62, 3]]) {
    const ray = g.createRadialGradient(64, 64, 0, 64, 64, 62);
    ray.addColorStop(0, "rgba(255,255,255,1)");
    ray.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = ray;
    g.beginPath();
    g.ellipse(64, 64, w, h, 0, 0, Math.PI * 2);
    g.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function radialTexture(inner, outer) {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d");
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, inner);
  grd.addColorStop(1, outer);
  g.fillStyle = grd;
  g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
