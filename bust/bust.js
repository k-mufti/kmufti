/* =========================================================================
   The bust — a block of marble standing on top of the launcher. The mouse
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
import { Reflector } from "three/addons/objects/Reflector.js";
import { acceleratedRaycast, MeshBVH } from "three-mesh-bvh";

const HIT_R = 0.024;        // radius of the rock one shot knocks out, in metres (bust is ~0.49 tall)
const MAX_DEPTH = 0.07;     // how far below his original surface a crater can reach, metres,
                            // and never more than 60% of the way through him at that spot
const REWIND = 0.9;         // seconds for restore to undo every shot, newest first
const GATHER = 0.45;        // ...after this long for fallen chunks to fly back into place
const MAX_YAW = 0.6;        // how far a drag can turn him, radians either way
const FIRE_EVERY = 0.12;    // seconds between shots while held
const MAX_CHIPS = 360, MAX_DUST = 48;
const YAW = 0;              // square to the viewer: he's symmetrical, show it
const GRAVITY = 2.4;
const MARBLE_SCALE = 1.6;   // texture repeats per metre: one slab covers about two thirds of the bust

const wrap = document.getElementById("bust");
if (wrap) start(wrap);

function start(wrap) {
  const canvas = wrap.querySelector("canvas");
  const restoreBtn = wrap.querySelector(".bust-restore");
  const board = document.getElementById("app-board");

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
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
  const key = new THREE.DirectionalLight(0xfff0dc, 3.6);
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

  // A faint reflection in the board, as if it were lightly polished: the
  // scene mirrored in y = 0, fading out a few centimetres in front of the
  // plinth so only his base and anything lying on the board shows in it.
  const mirror = new Reflector(new THREE.PlaneGeometry(1.2, 0.8), {
    clipBias: 0.002,
    textureWidth: 1024, textureHeight: 512,
    shader: {
      uniforms: { color: { value: null }, tDiffuse: { value: null }, textureMatrix: { value: null }, uFront: { value: 0.1 } },
      vertexShader: `
        uniform mat4 textureMatrix;
        varying vec4 vUv;
        varying vec3 vWorld;
        void main() {
          vUv = textureMatrix * vec4(position, 1.0);
          vWorld = (modelMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float uFront;
        varying vec4 vUv;
        varying vec3 vWorld;
        void main() {
          vec4 base = texture2DProj(tDiffuse, vUv);
          float fade = 1.0 - smoothstep(-0.01, 0.07, vWorld.z - uFront);
          gl_FragColor = vec4(base.rgb, base.a * fade * 0.16);
        }`,
    },
  });
  mirror.material.transparent = true;
  mirror.material.depthWrite = false;
  mirror.rotation.x = -Math.PI / 2;
  mirror.position.y = 0.0002;
  mirror.renderOrder = -1;
  mirror.visible = false;   // until he's loaded
  scene.add(mirror);

  // ---------- Materials: the weathered skin, and the broken stone inside ----------
  const MAX_IMPACTS = 48;
  const uniforms = {
    uKeyDir: { value: new THREE.Vector3() },   // key light direction, view space
    uMarble: { value: null },
    uImpacts: { value: Array.from({ length: MAX_IMPACTS }, () => new THREE.Vector4()) },   // xyz (bust space), radius
    uImpactCount: { value: 0 },
    uDust: { value: 0 },                       // 0..1: how much dust has settled in the craters since the last shot
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

  function puff(at, v, size, grow, life, peak) {
    const d = dust[dustNext++ % MAX_DUST];
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
  const worker = new Worker(new URL("carve-worker.js?v=3", import.meta.url), { type: "module" });
  let originals = [], blocks = [];   // blocks[id]: Mesh, or null once carved away
  // The untouched bust, never drawn: shots measure against it how deep
  // below his original surface they've already dug.
  const pristine = new THREE.Group();

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
  worker.onmessage = ({ data: m }) => {
    if (m.type !== "cut" || m.gen !== gen) return;   // a cut from before the last restore
    const undo = [];
    for (const c of m.changed) {
      const mesh = blocks[c.id];
      if (!mesh) continue;
      undo.push({ id: c.id, mesh, prev: mesh.geometry });
      if (c.gone) { model.remove(mesh); blocks[c.id] = null; continue; }
      setGeometry(mesh, soupGeometry(c), true);
    }
    const broke = m.pieces.map(breakOff);
    impacts.push(pendingImpacts.shift() || new THREE.Vector4());
    syncImpacts();
    history.push({ undo, pieces: broke, left });
    left = m.left;
    shots++;
    updateStats();
    kick();
  };
  let gen = 0;   // bumped on restore

  function undoShot() {
    const h = history.pop();
    for (const { id, mesh, prev } of h.undo.reverse()) {
      if (blocks[id] === mesh) mesh.geometry.dispose();
      else { model.add(mesh); blocks[id] = mesh; }
      mesh.geometry = prev;
    }
    for (const p of h.pieces) { scene.remove(p.mesh); p.mesh.children[0].geometry.dispose(); pieces.splice(pieces.indexOf(p), 1); }
    impacts.pop();
    syncImpacts();
    left = h.left;
    shots = Math.max(0, shots - 1);
    updateStats();
  }

  // ---------- Falling chunks ----------
  // A piece the worker broke off: drawn where it was, then it's a simple
  // rigid body: it tumbles, hits the board, bounces a little and settles.
  const pieces = [];
  const pieceTmp = new THREE.Vector3(), pieceQ = new THREE.Quaternion();
  function breakOff(data) {
    // the piece keeps its bust-space coordinates (the stone's texture is
    // mapped from them), inside a group that turns about its centre
    const g = soupGeometry(data);
    g.computeBoundingSphere();
    const c = new THREE.Vector3().fromArray(data.center);
    const inner = new THREE.Mesh(g, MATS);
    inner.castShadow = inner.receiveShadow = true;
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
      v: out.multiplyScalar(rnd(0.15, 0.35)).add(lastShotDir.clone().multiplyScalar(rnd(0.1, 0.25))).add(new THREE.Vector3(0, rnd(0.05, 0.25), 0)),
      w: new THREE.Vector3(rnd(-4, 4), rnd(-4, 4), rnd(-4, 4)),
      rest: false, landed: false,
    };
    pieces.push(piece);
    return piece;
  }

  function stepPiece(pc, dt) {
    if (pc.rest) return false;
    pc.v.y -= GRAVITY * dt;
    pc.mesh.position.addScaledVector(pc.v, dt);
    const ang = pc.w.length();
    if (ang > 1e-4) pc.mesh.quaternion.premultiply(pieceQ.setFromAxisAngle(pieceTmp.copy(pc.w).divideScalar(ang), ang * dt));
    // the lowest of its corners against the board (y = 0)
    let low = Infinity, lowP = null;
    for (const h of pc.hull) {
      pieceTmp.copy(h).applyQuaternion(pc.mesh.quaternion).add(pc.mesh.position);
      if (pieceTmp.y < low) { low = pieceTmp.y; lowP = pieceTmp.clone(); }
    }
    if (low < 0) {
      pc.mesh.position.y -= low;
      if (pc.v.y < 0) {
        if (!pc.landed || pc.v.y < -0.4) thud(Math.min(1, -pc.v.y / 1.5));
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

  // ---------- Load ----------
  let drop = null, ready = false;    // drop: { y, v } while it's falling in
  const foot = [], footTmp = new THREE.Vector3();
  // He's heavy (a few MB), so he waits until the rest of the page is in and
  // the browser is idle; until then his silhouette holds his place.
  const whenIdle = (fn) => (window.requestIdleCallback || ((f) => setTimeout(f, 200)))(fn, { timeout: 1500 });
  if (document.readyState === "complete") whenIdle(loadBust);
  else window.addEventListener("load", () => whenIdle(loadBust), { once: true });
  function loadBust() {
  const draco = new DRACOLoader().setDecoderPath("https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/libs/draco/gltf/");
  new GLTFLoader().setDRACOLoader(draco).load(new URL("model/bust.glb?v=5", import.meta.url).href, (gltf) => {
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
    const box = new THREE.Box3();
    for (const g of originals) { g.computeBoundingBox(); box.union(g.boundingBox); }
    const c = box.getCenter(new THREE.Vector3());
    model.position.set(-c.x, -box.min.y, -c.z);   // plinth flat on y = 0, turning about its middle
    pivot.add(model);
    buildBlocks();
    worker.postMessage({ type: "init", blocks: originals.map((g) => ({
      position: g.attributes.position.array, normal: g.attributes.normal.array, ao: g.attributes._ao.array,
      index: g.index.array, skinCount: g.groups[0].materialIndex === 0 ? g.groups[0].count : 0, cell: g.userData.cell,
    })), grid: gltf.scene.userData });
    for (const g of originals) {
      const m = new THREE.Mesh(g, skinMat);
      g.boundsTree = new MeshBVH(g);
      m.raycast = acceleratedRaycast;
      pristine.add(m);
    }
    model.add(pristine);
    pristine.visible = false;

    // The foot of the plinth: every vertex within a hair of the bottom.
    // resize() lines the board's top border up with the lowest of them.
    for (const g of originals) {
      const p = g.attributes.position;
      for (let i = 0; i < p.count; i++) if (p.getY(i) < box.min.y + 0.004) foot.push(new THREE.Vector3().fromBufferAttribute(p, i));
    }

    // the reflection fades out from the front of his plinth
    mirror.material.uniforms.uFront.value = Math.max(...foot.map((f) => f.z)) + model.position.z;
    mirror.visible = true;

    ready = true;
    wrap.classList.add("ready");
    resize();
    dropIn();
  });
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
        // age: centuries of dust and handling settle warm into the hollows,
        // the high points stay cleaner, and it's never quite even
        diffuseColor.rgb *= mix(vec3(1.0), vec3(0.86, 0.8, 0.7), clamp(hollow * 0.9 + (0.5 - grime) * 0.35, 0.0, 1.0));
        diffuseColor.rgb *= mix(0.93, 1.03, grime);
        // hairline cracks spreading from each impact, thinning out with distance
        float spread = 0.0;
        for (int i = 0; i < ${MAX_IMPACTS}; i++) {
          if (i >= uImpactCount) break;
          float d = distance(vObj, uImpacts[i].xyz);
          spread = max(spread, 1.0 - smoothstep(uImpacts[i].w * 0.85, uImpacts[i].w * 1.9, d));
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
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.9, 0.88, 0.84), dusty * 0.7);` : ""}`)
      .replace("#include <roughnessmap_fragment>", `#include <roughnessmap_fragment>
        ${inner ? "" : "// honed, not polished: a soft sheen that varies a little across the block; rough where it's chipped\n        roughnessFactor = mix(roughnessFactor + (grime - 0.5) * 0.12 + hollow * 0.2, 1.0, lip);"}`)
      .replace("#include <aomap_fragment>", `#include <aomap_fragment>
        // baked occlusion: all of the bounce light, a little of the key, so
        // the sockets and creases read even where the sun reaches
        float ao = vAO;
        reflectedLight.indirectDiffuse *= ao;
        reflectedLight.indirectSpecular *= ao * ao;
        reflectedLight.directDiffuse *= mix(0.55, 1.0, smoothstep(0.15, 0.85, ao));
        reflectedLight.directSpecular *= ao;
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

  // ---------- Cutting ----------
  // The rock is a jagged icosahedron (the worker shapes it): a little deeper
  // than it is wide, pointed into the stone, sunk past the surface so the
  // cut is a crater, not a shallow scuff.
  const Z = new THREE.Vector3(0, 0, 1), rockQ = new THREE.Quaternion(), rollQ = new THREE.Quaternion();
  function cut(at, inward, r, sink, deep) {
    rockQ.setFromUnitVectors(Z, inward).multiply(rollQ.setFromAxisAngle(Z, rnd(0, Math.PI * 2)));
    worker.postMessage({
      type: "cut", gen,
      position: at.clone().addScaledVector(inward, r * sink).toArray(),
      quaternion: rockQ.toArray(),
      scale: [r * rnd(0.85, 1.15), r * rnd(0.85, 1.15), r * deep],
    });
  }

  // ---------- Aiming & shooting ----------
  const ray = new THREE.Raycaster();
  ray.firstHitOnly = true;
  const ndc = new THREE.Vector2();
  const pointer = { inside: false, down: false };
  let fireCd = 0, shake = 0;

  function pick() {
    if (!ready || drop || rewind) return null;
    ray.setFromCamera(ndc, camera);
    const hits = ray.intersectObjects(blocks.filter(Boolean), false);
    return hits[0] || null;
  }

  const rnd = (a, b) => a + Math.random() * (b - a);
  function shoot() {
    const hit = pick();
    if (!hit) return;
    // Into the stone along the line of fire, tipped a little toward the
    // surface's own normal. A fresh hit on the skin sinks in and blasts a
    // crater; a hit on stone that's already broken (inside a crater) bites
    // shallower and scatters wider, so a held trigger gnaws the crater
    // outward the way an impact does, instead of drilling a tunnel out the
    // back of him.
    const local = model.worldToLocal(hit.point.clone());
    const n = hit.face.normal.clone();                       // block space = model space
    const dirLocal = ray.ray.direction.clone().transformDirection(new THREE.Matrix4().copy(model.matrixWorld).invert());
    if (n.dot(dirLocal) > 0) n.negate();
    const inward = dirLocal.clone().multiplyScalar(0.6).addScaledVector(n, -0.4).normalize();
    const broken = hit.face.materialIndex === 1;
    const j = HIT_R * (broken ? 0.7 : 0.25);
    local.x += rnd(-j, j); local.y += rnd(-j, j); local.z += rnd(-j, j);
    const r = HIT_R * (broken ? rnd(0.75, 1.05) : rnd(0.85, 1.15));
    const deep = broken ? rnd(0.75, 0.95) : rnd(1.1, 1.35);
    let sink = broken ? rnd(-0.2, 0.1) : 0.4;
    // No deeper than MAX_DEPTH below where his surface used to be: past
    // that, a shot only widens the crater.
    ray.firstHitOnly = false;
    const orig = ray.intersectObjects(pristine.children, false);
    ray.firstHitOnly = true;
    if (orig.length) {
      const through = orig.length > 1 ? orig[orig.length - 1].distance - orig[0].distance : Infinity;
      const dug = hit.distance - orig[0].distance;
      const room = Math.min(MAX_DEPTH, through * 0.6) - dug - r * deep * 1.22;   // how far past the hit the rock's centre may go
      sink = Math.max(-1.6, Math.min(sink, room / r));
    }
    cut(local, inward, r, sink, deep);
    pendingImpacts.push(new THREE.Vector4(local.x, local.y, local.z, r * 1.1));
    lastShotDir.copy(ray.ray.direction);
    uniforms.uDust.value *= 0.35;   // the blast stirs up what had settled
    wrap.classList.add("shot");
    if (restoreBtn) restoreBtn.hidden = false;

    // Debris leaves along the surface normal, in world space.
    const nw = n.clone().transformDirection(model.matrixWorld);
    const count = 12 + Math.floor(Math.random() * 10);
    for (let i = 0; i < count; i++) {
      if (chips.length >= MAX_CHIPS) chips.shift();
      const big = Math.random() < 0.3;
      chips.push({
        p: hit.point.clone(), from: hit.point.clone(),
        v: nw.clone().multiplyScalar(rnd(0.15, 0.5)).add(new THREE.Vector3(rnd(-0.18, 0.18), rnd(0, 0.25), rnd(-0.12, 0.25))),
        r: new THREE.Euler(rnd(0, 6), rnd(0, 6), rnd(0, 6)),
        w: new THREE.Vector3(rnd(-18, 18), rnd(-18, 18), rnd(-18, 18)),
        s: new THREE.Vector3(rnd(0.6, 1.3), rnd(0.5, 1), rnd(0.7, 1.4)).multiplyScalar(big ? rnd(0.006, 0.01) : rnd(0.002, 0.005)),
        rest: false,
      });
    }
    for (let i = 0; i < 3; i++) {
      puff(hit.point.clone().addScaledVector(nw, 0.01),
        nw.clone().multiplyScalar(rnd(0.03, 0.07)).add(new THREE.Vector3(0, -0.02, 0)), 0.014, rnd(0.03, 0.06), rnd(0.8, 1.4), 0.5);
    }
    flash.position.copy(hit.point).addScaledVector(nw, 0.02);
    flash.scale.setScalar(0.06);
    flash.visible = true;
    flashT = 0.05;
    shake = Math.max(shake, 0.35);
    impactSound(broken);
    kick();
  }
  const lastShotDir = new THREE.Vector3(0, 0, -1);

  function updatePointer(e) {
    const r = canvas.getBoundingClientRect();
    pointer.inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  }

  // The canvas hangs over the top of the board and takes no pointer events
  // itself, so the board under it stays clickable. The page listens instead
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
    fireCd = FIRE_EVERY;
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
    pointer.down = false;
    rewind = {
      t: 0, shots: history.length,
      chips: chips.map((c) => ({ c, at: c.p.clone(), delay: rnd(0, 0.45), lift: rnd(0.03, 0.12) })),
      pieces: pieces.map((pc) => ({ pc, at: pc.mesh.position.clone(), q: pc.mesh.quaternion.clone() })),
    };
    for (const pc of pieces) pc.rest = true;
    yawTarget = 0;
    restoreBtn.hidden = true;
    rewindSound();
    kick();
  });

  // ---------- Sound, synthesized ----------
  // A shot on marble is three things at once: a hard "tock" (the strike),
  // a bright crack (the stone giving), and a crumble (grit and chips
  // landing). Each is randomized a little so a burst never repeats itself.
  let actx = null, noise = null;
  function audio() {
    if (!actx) {
      actx = new (window.AudioContext || window.webkitAudioContext)();
      noise = actx.createBuffer(1, actx.sampleRate * 1.2, actx.sampleRate);
      const d = noise.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    return actx;
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
    src.connect(f).connect(g).connect(actx.destination);
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
    o.connect(g).connect(actx.destination);
    o.start(t);
    o.stop(t + dur + 0.02);
  }
  function impactSound(broken) {
    try {
      audio();
      const t = actx.currentTime, pitch = rnd(0.85, 1.2);
      // the strike: duller once he's already broken there
      tone(t, (broken ? 520 : 900) * pitch, 160 * pitch, 0.18, 0.06, "triangle");
      burst(t, { f0: rnd(2600, 3600) * pitch, f1: 900, q: 1.4, gain: 0.12, dur: 0.07 });
      // the crack
      burst(t + 0.004, { f0: rnd(1500, 2400), f1: 420, q: 0.8, gain: 0.1, dur: 0.22 });
      // the crumble: a scatter of tiny grains over the next third of a second
      const grains = 5 + Math.floor(Math.random() * 6);
      for (let i = 0; i < grains; i++) {
        const at = t + 0.03 + Math.pow(Math.random(), 1.6) * 0.32;
        burst(at, { type: "highpass", f0: rnd(2500, 6000), q: 0.7, gain: rnd(0.012, 0.035), dur: rnd(0.012, 0.03) });
      }
    } catch (e) { /* no audio, no problem */ }
  }
  // a chunk hitting the board
  function thud(strength) {
    try {
      audio();
      const t = actx.currentTime;
      tone(t, rnd(110, 150), 55, 0.25 * strength + 0.05, 0.18);
      burst(t, { type: "lowpass", f0: 900, f1: 200, q: 0.7, gain: 0.12 * strength + 0.03, dur: 0.16 });
      burst(t + 0.01, { f0: rnd(1800, 3000), q: 1, gain: 0.03 * strength, dur: 0.08 });
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
      src.connect(f).connect(g).connect(actx.destination);
      src.start(t);
      src.stop(t + dur + 0.1);
      tone(t + dur - 0.02, 1400, 2200, 0.05, 0.12);   // and a soft click as he's whole again
    } catch (e) { /* no audio, no problem */ }
  }

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
      if (drop.y <= 0) { drop = null; pivot.position.y = 0; land(); }
      else pivot.position.y = drop.y;
      busy = true;
    }

    if (pointer.down) {
      busy = true;
      fireCd -= dt;
      if (fireCd <= 0) { shoot(); fireCd = FIRE_EVERY; }
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
        for (const pc of pieces.splice(0)) { scene.remove(pc.mesh); pc.mesh.children[0].geometry.dispose(); }
        worker.postMessage({ type: "reset" });
        chips.length = 0;
        wrap.classList.remove("shot");
        rewind = null;
      }
      busy = true;
    }

    // fallen chunks tumble and settle
    if (!rewind) for (const pc of pieces) if (stepPiece(pc, dt)) busy = true;

    // dust settles back into the craters once the shooting stops
    if (history.length && uniforms.uDust.value < 1 && !pointer.down) {
      uniforms.uDust.value = Math.min(1, uniforms.uDust.value + dt / 2.5);
      busy = true;
    }

    // a drag turns him; let go and he stays put
    const dy = yawTarget - pivot.rotation.y;
    if (Math.abs(dy) > 1e-4) { pivot.rotation.y += dy * Math.min(1, dt * 10); busy = true; }
    if (touch && !touch.dragging && !touch.fired && performance.now() - touch.t > 280) {
      // a finger held still on him: keep firing
      touch.fired = true;
      pointer.down = true;
      shoot();
      fireCd = FIRE_EVERY;
    }
    if (touch) busy = true;

    // camera shake: sharp, short, no easing wobble
    shake = Math.max(0, shake - dt * 6);
    const k = shake * shake * 0.006;
    camera.position.set(CAM.x + rnd(-k, k), CAM.y + rnd(-k, k), CAM.z);
    camera.lookAt(LOOK);
    if (shake > 0) busy = true;

    // chips fall, skitter, and stay where they land — rubble on the board
    for (const c of chips) {
      if (c.rest || rewind) continue;
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

    renderer.render(scene, camera);
    if (busy && visible && !document.hidden) requestAnimationFrame(frame);
    else running = false;
  }
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
