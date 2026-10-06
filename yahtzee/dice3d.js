// A tray of physical dice that always land on the numbers you ask for.
//
// The trick, and the reason this file exists as its own module: the outcome of
// a roll is decided somewhere else (the server, or the bot) BEFORE anything
// moves. But a die that snaps to its answer at the end of a tumble looks
// rigged, and one that just plays a canned animation looks dead. So:
//
//   1. Throw five dice into a physics world with a seeded random shove and
//      step the whole thing to completion RIGHT NOW, in about two
//      milliseconds, before a single frame is drawn.
//   2. Every position and rotation along the way is recorded.
//   3. Now that we know how each die naturally came to rest, rotate the
//      *visual mesh inside its physics body* so the face we were told to show
//      is the one pointing up. A cube rotated onto itself is the same cube --
//      the physics never notices, and neither does anyone watching.
//   4. Play the recording back.
//
// So the bounces, the collisions, the die that skitters off the rim and nudges
// another one -- all of it is real rigid-body simulation. Only the labels on
// the faces are chosen after the fact. And because it is a recording rather
// than a live sim, two people watching the same roll see the same roll, with
// no floating-point-determinism tightrope between browsers.
//
// Nothing in here knows what Yahtzee is. It rolls dice.
//
//   const table = await DiceTable.create({ canvas, count: 5 });
//   await table.roll({ values: [3, 3, 6, 1, 5] });
//   table.setHeld(0, true);

import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import * as CANNON from "cannon-es";
import { createComposer, DiceSound } from "./dice-fx.js?v=2";

// Photographed surfaces and lighting, all CC0 from Poly Haven -- see
// assets/README.md.
const ASSET = (f) => new URL("./assets/" + f, import.meta.url).href;

/* ---------- the die ---------- */

// Measured by rendering models/die.glb down each of the six axes -- see
// models/README.md. Opposite faces sum to 7 and it is right-handed, so this is
// just a rotation of the usual layout. Swap in a different model, re-measure.
export const FACE_MAP = [
  { axis: new THREE.Vector3(1, 0, 0), value: 6 },
  { axis: new THREE.Vector3(-1, 0, 0), value: 1 },
  { axis: new THREE.Vector3(0, 1, 0), value: 2 },
  { axis: new THREE.Vector3(0, -1, 0), value: 5 },
  { axis: new THREE.Vector3(0, 0, 1), value: 4 },
  { axis: new THREE.Vector3(0, 0, -1), value: 3 },
];

const DIE = 1.0;                       // edge length, world units
const TRAY = { w: 9.6, d: 6.6, wallH: 1.0, rim: 0.4 };
const UP = new THREE.Vector3(0, 1, 0);

/* ---------- the 24 ways a cube can sit on itself ---------- */
// Used twice: to work out which face a resting die is showing, and to pick the
// hidden mesh rotation that makes it show the face we actually want.
const CUBE_ROTATIONS = (() => {
  const dirs = FACE_MAP.map((f) => f.axis);
  const out = [];
  for (const ix of dirs)
    for (const iy of dirs) {
      if (Math.abs(ix.dot(iy)) > 0.5) continue;      // must be perpendicular
      const iz = new THREE.Vector3().crossVectors(ix, iy);
      out.push(
        new THREE.Quaternion().setFromRotationMatrix(
          new THREE.Matrix4().makeBasis(ix, iy, iz)
        )
      );
    }
  return out;                                         // 24 of them
})();

// Which number is face-up, for a die whose body sits at quaternion q and whose
// mesh carries the extra local rotation `offset`.
function faceUp(q, offset) {
  const full = offset ? q.clone().multiply(offset) : q;
  let best = null, bestDot = -2;
  for (const f of FACE_MAP) {
    const d = f.axis.clone().applyQuaternion(full).dot(UP);
    if (d > bestDot) { bestDot = d; best = f.value; }
  }
  return { value: best, flatness: bestDot };
}

// Find a hidden rotation that makes `value` the face-up one, for a die resting
// at `q`. Four of the 24 qualify (they differ only by spin about the vertical);
// pick among them so repeat rolls of the same number aren't identically posed.
//
// Scored rather than thresholded, deliberately. A die that settles a hair off
// true -- resting against the rim, say -- has a local "up" that is not exactly
// a face axis, so a fixed cutoff can match NOTHING and quietly hand back a
// random rotation. That showed up as roughly one wrong face in a thousand.
// Taking the best four by score always returns the right answer.
function offsetShowing(q, value, rnd) {
  const localUp = UP.clone().applyQuaternion(q.clone().invert());
  const want = FACE_MAP.find((f) => f.value === value).axis;
  const scored = CUBE_ROTATIONS
    .map((R) => ({ R, d: want.clone().applyQuaternion(R).dot(localUp) }))
    .sort((a, b) => b.d - a.d);
  const best = scored[0].d;
  const hits = scored.filter((h) => h.d > best - 1e-4);
  return hits[Math.floor(rnd() * hits.length)].R.clone();
}

/* ---------- small helpers ---------- */

// Seeded RNG, so a roll can be reproduced from a seed alone.
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Felt wants to look like felt and not like green plastic, and a flat normal
// map is most of the difference. Cheap fibrous noise, generated once.
function feltNormalMap(size = 512) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d");
  const img = ctx.createImageData(size, size);
  for (let i = 0; i < size * size; i++) {
    const n = (Math.random() - 0.5) * 34;
    img.data[i * 4 + 0] = 128 + n;
    img.data[i * 4 + 1] = 128 + (Math.random() - 0.5) * 34;
    img.data[i * 4 + 2] = 255;
    img.data[i * 4 + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(16, 11);
  return tex;
}

// The model's colour map is 1024px with soft-edged pips, which reads as blurry
// once a die fills a few hundred pixels on a retina screen. Redraw it at
// 2048px and push every pixel to either the body colour or the pip colour,
// keeping a narrow ramp between them as anti-aliasing: crisp round pips.
function sharpenPips(src, aniso, size = 2048) {
  const img = src.image;
  if (!img || !img.width) return { map: src, roughnessMap: null };
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, size, size);
  const d = ctx.getImageData(0, 0, size, size);
  const px = d.data;
  // body colour: the brightest thing on the sheet
  let hi = 0;
  for (let i = 0; i < px.length; i += 4 * 97) hi = Math.max(hi, px[i]);
  const lo = 12;
  for (let i = 0; i < px.length; i += 4) {
    let t = (px[i] / hi - 0.38) / 0.24;                  // ramp across the old soft edge
    t = t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t);
    const v = lo + (hi - lo) * t;
    px[i] = px[i + 1] = px[i + 2] = v;
  }
  ctx.putImageData(d, 0, 0);
  // The pips are matte paint in polished plastic: a roughness map from the
  // same sheet (three reads roughness from green), glossy body, rough pips.
  // Without it the dented pips mirror the room and read as metal studs.
  const rc = document.createElement("canvas");
  rc.width = rc.height = size;
  const rctx = rc.getContext("2d");
  const rd = rctx.createImageData(size, size);
  for (let i = 0; i < px.length; i += 4) {
    const t = (px[i] - lo) / (hi - lo);
    rd.data[i] = rd.data[i + 2] = 0;
    rd.data[i + 1] = 255 * (0.85 - 0.6 * t);          // 0.85 in a pip, 0.25 on the body
    rd.data[i + 3] = 255;
  }
  rctx.putImageData(rd, 0, 0);
  const tex = (cv, srgb) => {
    const t = new THREE.CanvasTexture(cv);
    t.flipY = src.flipY;
    if (srgb) t.colorSpace = src.colorSpace;
    t.wrapS = src.wrapS; t.wrapT = src.wrapT;
    t.anisotropy = aniso;
    return t;
  };
  return { map: tex(c, true), roughnessMap: tex(rc, false) };
}

// Walnut for the rails: dark streaks along the length of the board, drawn once.
function woodGrainMap(aniso, w = 1024, h = 256) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#3d2210";
  ctx.fillRect(0, 0, w, h);
  const rnd = mulberry32(42);
  for (let n = 0; n < 140; n++) {
    const y = rnd() * h, amp = 2 + rnd() * 6, freq = 0.004 + rnd() * 0.01, ph = rnd() * 6.3;
    const dark = rnd() < 0.7;
    ctx.strokeStyle = dark ? `rgba(28,14,6,${0.15 + rnd() * 0.35})` : `rgba(120,72,38,${0.1 + rnd() * 0.25})`;
    ctx.lineWidth = 0.6 + rnd() * 2.2;
    ctx.beginPath();
    for (let x = 0; x <= w; x += 8) {
      const yy = y + Math.sin(x * freq + ph) * amp;
      x ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy);
    }
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = aniso;
  return tex;
}

// Low-frequency mottling for the felt: a tiny random grid scaled up smooth,
// so the cloth is never one flat green. Multiplies the felt colour.
function feltColorMap(aniso, size = 1024) {
  const small = document.createElement("canvas");
  small.width = small.height = 48;
  const sctx = small.getContext("2d");
  const rnd = mulberry32(7);
  const img = sctx.createImageData(48, 48);
  for (let i = 0; i < 48 * 48; i++) {
    const v = 232 + rnd() * 23;
    img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v;
    img.data[i * 4 + 3] = 255;
  }
  sctx.putImageData(img, 0, 0);
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(small, 0, 0, size, size);
  // and a fine speckle of lighter and darker fibres on top
  const d = ctx.getImageData(0, 0, size, size);
  for (let i = 0; i < d.data.length; i += 4) {
    const n = (rnd() - 0.5) * 30;
    d.data[i] = d.data[i + 1] = d.data[i + 2] = Math.min(255, d.data[i] + n);
  }
  ctx.putImageData(d, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  // Stretched once across the whole tray, never tiled: the grid isn't
  // seamless, and a repeat shows as a line down the middle of the felt.
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.anisotropy = aniso;
  return tex;
}

// A soft dark square-ish blob, darkest in the middle: one die's footprint.
let _contactTex = null;
function contactShadowMap(size = 128) {
  if (_contactTex) return _contactTex;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(size / 2, size / 2, size * 0.18, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.45, "rgba(255,255,255,0.45)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  _contactTex = new THREE.CanvasTexture(c);
  _contactTex.format = THREE.RGBAFormat;
  return _contactTex;
}

// Wear on the dice's clear coat, as a roughness map (three reads green):
// mostly glassy, with fingerprint smudges and a scatter of fine scratches
// that each catch the light a little differently.
function wearMap(aniso, size = 1024) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "rgb(0,14,0)";                      // 0.055: polished
  ctx.fillRect(0, 0, size, size);
  const rnd = mulberry32(99);
  for (let n = 0; n < 60; n++) {                       // smudges
    const x = rnd() * size, y = rnd() * size, r = 20 + rnd() * 70;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(0,70,0,${0.25 + rnd() * 0.35})`);
    g.addColorStop(1, "rgba(0,70,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  ctx.lineCap = "round";
  for (let n = 0; n < 260; n++) {                      // hairline scratches
    const x = rnd() * size, y = rnd() * size, len = 6 + rnd() * 40, a = rnd() * Math.PI;
    ctx.strokeStyle = `rgba(0,${90 + rnd() * 90},0,${0.35 + rnd() * 0.4})`;
    ctx.lineWidth = 0.6 + rnd() * 0.9;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = aniso;
  return tex;
}

/* ---------- the table ---------- */

export class DiceTable {
  static async create(opts) {
    const t = new DiceTable(opts);
    await t._build();
    return t;
  }

  constructor({ canvas, count = 5, modelUrl = null, onSettle = null, speed = 1.2 }) {
    this.speed = speed;
    this.canvas = canvas;
    this.count = count;
    this.modelUrl = modelUrl || new URL("./models/die.glb", import.meta.url).href;
    this.onSettle = onSettle;
    this.held = new Array(count).fill(false);
    this.values = new Array(count).fill(1);
    this._offsets = Array.from({ length: count }, () => new THREE.Quaternion());
    this._playing = null;
  }

  /* ----- scene, tray, physics ----- */

  async _build() {
    // Phones get the same scene without the two expensive post passes.
    this._high = !matchMedia("(pointer: coarse)").matches;
    const r = (this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas, antialias: true, powerPreference: "high-performance",
    }));
    // Never below 2x, even on a 1x screen: rendering at double size and
    // letting the browser scale down is the cheapest anti-aliasing there is.
    r.setPixelRatio(Math.min(Math.max(devicePixelRatio, 2), 3));
    r.shadowMap.enabled = true;
    // Plain PCF with a small filter radius: a hard-edged shadow, like one
    // cast by a single bare bulb, rather than the soft blur of PCFSoft.
    r.shadowMap.type = THREE.PCFShadowMap;
    r.toneMapping = THREE.ACESFilmicToneMapping;
    r.toneMappingExposure = 1.15;
    this._aniso = r.capabilities.getMaxAnisotropy();

    const scene = (this.scene = new THREE.Scene());
    scene.background = new THREE.Color(0x050806);
    const cam = (this.camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100));

    // The dice reflect a real room: a photographed billiard hall, dim, with
    // warm lamps over the tables. A made-up room (three's RoomEnvironment)
    // is the fallback if the file can't load.
    // Handed to each material directly rather than only set as
    // scene.environment: since three r163 the scene-wide one overrides every
    // material's envMapIntensity, so the felt was reflecting the room as
    // brightly as the dice and nothing else could be lit.
    const pmrem = new THREE.PMREMGenerator(r);
    const [hdr, tex] = await Promise.all([
      new RGBELoader().loadAsync(ASSET("billiard_hall_1k.hdr")).catch(() => null),
      this._loadSurfaces(),
    ]);
    this._env = scene.environment = hdr
      ? pmrem.fromEquirectangular(hdr).texture
      : pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    hdr?.dispose();
    pmrem.dispose();
    this._tex = tex;

    // Lit like a card table in a dark room: one warm lamp hanging straight
    // over the felt throws a pool of light that falls off toward the rails,
    // a cool light from across the table catches the dice's back edges, and
    // the ambient is kept low so the shadows stay deep.
    scene.add(new THREE.HemisphereLight(0xfff1dd, 0x0b2a1a, 0.018));

    const lamp = (this._lamp = new THREE.SpotLight(0xffd6a3, 820, 0, 0.37, 0.55, 2));
    lamp.position.set(0, 11.5, 0.6);
    lamp.target.position.set(0, 0, 0.3);
    lamp.castShadow = true;
    // A crisp shadow edge on a desktop; phones get a quarter of the memory.
    const big = this._high;
    lamp.shadow.mapSize.set(big ? 4096 : 2048, big ? 4096 : 2048);
    lamp.shadow.radius = 1.5;
    lamp.shadow.bias = -0.0002;
    lamp.shadow.normalBias = 0.02;
    lamp.shadow.camera.near = 4;
    lamp.shadow.camera.far = 16;
    scene.add(lamp, lamp.target);

    // The key swings round with the chair (see setViewSeat) and is what puts
    // the bright glint on the top of each die. No shadow from it: two shadow
    // casters give every die a double shadow.
    const key = (this._key = new THREE.DirectionalLight(0xfff4e6, 0.12));
    scene.add(key);
    const fill = (this._fill = new THREE.DirectionalLight(0x9cc4ff, 0.4));
    scene.add(fill);
    this.setViewSeat(0);           // places the camera and swings the lamp with it

    this._buildTray();
    this._buildWorld();
    await this._buildDice();

    this.sound = new DiceSound();
    this._shake = 0;
    this.fx = createComposer(r, scene, cam, {
      high: this._high,
      focus: this._camBase.length() - 0.4,
      hidden: () => this.dice.flatMap((d) => [d.contact, ...d.ghosts]),
    });

    this._resize();
    this._ro = new ResizeObserver(() => this._resize());
    this._ro.observe(this.canvas);
    this._render();
  }

  // Every photographed texture, loaded together. Any that fail come back
  // null and the material just goes without.
  async _loadSurfaces() {
    const L = new THREE.TextureLoader();
    const get = (f, srgb, repeat) =>
      L.loadAsync(ASSET(f)).then((t) => {
        t.wrapS = t.wrapT = THREE.RepeatWrapping;
        if (srgb) t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = this._aniso;
        if (repeat) t.repeat.set(...repeat);
        return t;
      }).catch(() => null);
    const [feltNor, feltRough, walnut, walnutNor, walnutRough] = await Promise.all([
      get("velour_velvet_nor_gl_1k.jpg", false, [9, 6.2]),
      get("velour_velvet_rough_1k.jpg", false, [9, 6.2]),
      get("black_walnut_veneer_01_diff_1k.jpg", true),
      get("black_walnut_veneer_01_nor_gl_1k.jpg", false),
      get("black_walnut_veneer_01_rough_1k.jpg", false),
    ]);
    return { feltNor, feltRough, walnut, walnutNor, walnutRough };
  }

  _buildTray() {
    const T = this._tex;
    // Felt is not shiny. Letting the environment map light it is what made
    // the first version look like green plastic. What it does have is sheen
    // -- fibres catching light at a grazing angle -- an uneven colour where
    // the nap lies in different directions, and a real cloth surface (a
    // photographed velvet's bumps and roughness, under our own green).
    const felt = new THREE.MeshPhysicalMaterial({
      color: 0x0d5a36, map: feltColorMap(this._aniso), roughness: 1.0, metalness: 0,
      roughnessMap: T.feltRough,
      envMap: this._env, envMapIntensity: 0.04,
      sheen: 1, sheenColor: new THREE.Color(0x3c9a68), sheenRoughness: 0.55,
      normalMap: T.feltNor || feltNormalMap(), normalScale: new THREE.Vector2(0.55, 0.55),
    });
    felt.normalMap.anisotropy = this._aniso;
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(TRAY.w, TRAY.d), felt);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Walnut, from a photographed veneer, under a satin lacquer. The texture
    // is cloned per use so each surface can repeat the grain at its own scale.
    const walnut = (repeat, tint, coat) => {
      const tx = (t) => {
        if (!t) return null;
        const c = t.clone();
        c.repeat.set(...repeat);
        c.needsUpdate = true;
        return c;
      };
      return new THREE.MeshPhysicalMaterial({
        color: tint, map: tx(T.walnut) || woodGrainMap(this._aniso),
        normalMap: tx(T.walnutNor), roughnessMap: tx(T.walnutRough),
        roughness: 1, metalness: 0,
        clearcoat: coat, clearcoatRoughness: 0.5, envMap: this._env, envMapIntensity: 0.4,
      });
    };

    // The table the tray sits on, so the tray isn't floating in black. The
    // lamp's falloff does the rest: it fades into the dark a little way out.
    const { w, d, wallH, rim } = TRAY;
    const BASE = 0.14;
    const table = new THREE.Mesh(new THREE.PlaneGeometry(60, 40), walnut([7, 5], 0x5e4636, 0.25));
    table.rotation.x = -Math.PI / 2;
    table.position.y = -BASE;
    table.receiveShadow = true;
    this.scene.add(table);

    // The tray's own base board, showing as a thin step at the bottom.
    const base = new THREE.Mesh(
      new RoundedBoxGeometry(w + rim * 2 + 0.16, BASE, d + rim * 2 + 0.16, 3, 0.05),
      walnut([3, 2], 0x7a5a42, 0.4)
    );
    base.position.y = -BASE / 2 - 0.004;     // just under the felt, or the two flicker
    base.receiveShadow = base.castShadow = true;
    this.scene.add(base);

    // Rails with softened edges, topped with a padded leather cushion like a
    // proper dice tray. The long rails run the full width; the short ones
    // butt between them.
    const rail = walnut([2.5, 0.35], 0x7a5a42, 0.3);
    const leather = new THREE.MeshPhysicalMaterial({
      color: 0x1d130c, roughness: 0.6, metalness: 0,
      clearcoat: 0.15, clearcoatRoughness: 0.5,
      normalMap: T.feltNor, normalScale: new THREE.Vector2(0.12, 0.12),
      envMap: this._env, envMapIntensity: 0.5,
    });
    const PAD = 0.15;
    const rails = [
      [w + rim * 2, wallH, rim, 0, -(d / 2 + rim / 2)],
      [w + rim * 2, wallH, rim, 0, d / 2 + rim / 2],
      [rim, wallH, d, -(w / 2 + rim / 2), 0],
      [rim, wallH, d, w / 2 + rim / 2, 0],
    ];
    for (const [bw, bh, bd, x, z] of rails) {
      const m = new THREE.Mesh(new RoundedBoxGeometry(bw, bh - PAD * 0.5, bd, 3, 0.04), rail);
      m.position.set(x, (bh - PAD * 0.5) / 2, z);
      m.receiveShadow = true;
      this.scene.add(m);
      const cap = new THREE.Mesh(
        new RoundedBoxGeometry(bw + 0.05, PAD, bd + 0.05, 4, PAD / 2 - 0.005),
        leather
      );
      cap.position.set(x, bh - PAD * 0.5 + PAD / 2 - 0.02, z);
      cap.receiveShadow = cap.castShadow = true;
      this.scene.add(cap);
    }
  }

  _buildWorld() {
    const world = (this.world = new CANNON.World({ gravity: new CANNON.Vec3(0, -32, 0) }));
    world.allowSleep = true;
    world.defaultContactMaterial.contactEquationStiffness = 1e7;

    const mFelt = (this.mFelt = new CANNON.Material("felt"));
    const mDie = (this.mDie = new CANNON.Material("die"));
    // Felt eats energy: dice thud and stop rather than skating like they're on
    // glass. Die-on-die stays lively so a pile-up still scatters.
    world.addContactMaterial(new CANNON.ContactMaterial(mFelt, mDie, { friction: 0.72, restitution: 0.2 }));
    world.addContactMaterial(new CANNON.ContactMaterial(mDie, mDie, { friction: 0.08, restitution: 0.38 }));

    const ground = (this._ground = new CANNON.Body({ mass: 0, shape: new CANNON.Plane(), material: mFelt }));
    ground.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    world.addBody(ground);
    this._walls = new Set();         // so a recorded impact knows what it hit

    const { w, d, wallH } = TRAY;
    const walls = [
      [0, 0, -d / 2, 0], [0, 0, d / 2, Math.PI],
      [-w / 2, 0, 0, Math.PI / 2], [w / 2, 0, 0, -Math.PI / 2],
    ];
    for (const [x, y, z, ry] of walls) {
      const b = new CANNON.Body({ mass: 0, shape: new CANNON.Plane(), material: mFelt });
      b.position.set(x, y, z);
      b.quaternion.setFromEuler(0, ry, 0);
      world.addBody(b);
      this._walls.add(b);
    }
    // A lid, so a wild throw can't launch a die out of shot. It has to sit
    // above everything the throw does, or dice spawn on the wrong side of it.
    const lid = new CANNON.Body({ mass: 0, shape: new CANNON.Plane(), material: mFelt });
    lid.position.set(0, 10, 0);
    lid.quaternion.setFromEuler(Math.PI / 2, 0, 0);
    world.addBody(lid);
  }

  async _buildDice() {
    let proto;
    try {
      const gltf = await new GLTFLoader().loadAsync(this.modelUrl);
      proto = gltf.scene;
      const box = new THREE.Box3().setFromObject(proto);
      const size = box.getSize(new THREE.Vector3());
      const centre = box.getCenter(new THREE.Vector3());
      const s = DIE / Math.max(size.x, size.y, size.z);
      proto.scale.setScalar(s);
      proto.position.copy(centre).multiplyScalar(-s);
      proto.traverse((o) => {
        if (!o.isMesh) return;
        o.castShadow = o.receiveShadow = true;
        const m = o.material;
        // The model ships double-sided with no roughness map: double-sided
        // geometry wrecks the shadow map, and uniform roughness is what makes
        // a die read as plastic. Both are fixed here rather than in the asset.
        m.side = THREE.FrontSide;
        // Polished plastic: a glossy clear coat over a slightly softer body,
        // so the lamp leaves a sharp highlight on every face that tilts to it.
        // Used, not new: the coat carries fine scratches and fingerprint
        // smudges (clearcoatRoughnessMap), so the highlight breaks up a little
        // the way it does on dice that have actually been rolled.
        // Real dice are faintly translucent -- light soaks in and glows back
        // out of the shadowed sides. A small warm emissive stands in for that.
        const sheet = m.map ? sharpenPips(m.map, this._aniso) : { map: null, roughnessMap: null };
        const shiny = new THREE.MeshPhysicalMaterial({
          map: sheet.map, roughnessMap: sheet.roughnessMap,
          normalMap: m.normalMap, normalScale: m.normalScale,
          color: m.color, roughness: sheet.roughnessMap ? 1 : 0.3, metalness: 0,
          clearcoat: 1, clearcoatRoughness: 1, clearcoatRoughnessMap: wearMap(this._aniso),
          // the glow comes through the plastic, not the painted pips
          emissive: 0x1a130b, emissiveIntensity: 1, emissiveMap: sheet.map,
          envMap: this._env, envMapIntensity: 0.5,
        });
        if (m.normalMap) m.normalMap.anisotropy = this._aniso;
        o.material = shiny;
      });
    } catch (e) {
      console.warn("dice3d: die.glb failed to load, using a plain cube --", e.message);
      proto = new THREE.Mesh(
        new THREE.BoxGeometry(DIE, DIE, DIE),
        new THREE.MeshStandardMaterial({ color: 0xf2efe6, roughness: 0.35, envMap: this._env })
      );
      proto.castShadow = proto.receiveShadow = true;
    }

    this.dice = [];
    const h = DIE / 2;
    for (let i = 0; i < this.count; i++) {
      // Two nested objects on purpose: `pivot` follows the physics body, and
      // `mesh` carries the hidden rotation that decides which face shows.
      const pivot = new THREE.Group();
      const mesh = proto.clone(true);
      // clone() shares materials between clones. Each die needs its own so it
      // can glow when held.
      mesh.traverse((o) => {
        if (!o.isMesh) return;
        o.material = o.material.clone();
        o.userData.baseColor = o.material.color.getHex();   // to restore on release
        o.userData.baseEmissive = o.material.emissive.getHex();
      });
      pivot.add(mesh);
      this.scene.add(pivot);

      // Motion blur, cheaply: two faint copies trailing a die along its own
      // path, only while it's moving fast. At a glance it reads as the smear
      // a camera's shutter would leave.
      const ghosts = [0.32, 0.16].map((opacity) => {
        const g = new THREE.Group();
        const gm = proto.clone(true);
        gm.traverse((o) => {
          if (!o.isMesh) return;
          o.material = o.material.clone();
          o.material.transparent = true;
          o.material.depthWrite = false;
          o.material.opacity = 0;
          o.castShadow = false;
          o.receiveShadow = false;
        });
        g.add(gm);
        g.visible = false;
        g.userData = { mesh: gm, peak: opacity };
        this.scene.add(g);
        return g;
      });

      const body = new CANNON.Body({
        mass: 1,
        shape: new CANNON.Box(new CANNON.Vec3(h, h, h)),
        material: this.mDie,
        allowSleep: true,
        sleepSpeedLimit: 0.2,
        sleepTimeLimit: 0.18,
        angularDamping: 0.34,
        linearDamping: 0.13,
      });
      body.position.set((i - (this.count - 1) / 2) * 1.5, h, 2.6);
      body.dieIndex = i;
      body.addEventListener("collide", (e) => this._recordHit(i, e));
      this.world.addBody(body);

      // Contact shadow: the dark, tight ring where a die meets the cloth. The
      // lamp's shadow map is too soft to draw it, and without it a die looks
      // pasted on rather than resting on something.
      const contact = new THREE.Mesh(
        new THREE.PlaneGeometry(DIE * 1.9, DIE * 1.9),
        new THREE.MeshBasicMaterial({
          map: contactShadowMap(), transparent: true, depthWrite: false,
          color: 0x000000, opacity: 0.85,
        })
      );
      contact.rotation.x = -Math.PI / 2;
      contact.renderOrder = 1;
      this.scene.add(contact);

      this.dice.push({ pivot, mesh, body, contact, ghosts });
    }
    this.layoutRow();
  }

  // One die touched something during a recorded throw. Kept only if it was a
  // real knock: resting contact fires this every step at near-zero speed, and
  // a die chattering on one spot shouldn't machine-gun the same sound.
  _recordHit(i, e) {
    if (!this._recording) return;
    // Dice spawn tilted, close to the thrower's rail, and a corner can graze
    // it on the very first steps. That's the solver separating them, not a
    // knock anyone would hear.
    if (this._simStep < 4) return;
    const other = e.body;
    const kind = other === this._ground ? "felt"
      : this._walls.has(other) ? "wall"
      : other.dieIndex !== undefined ? "die"
      : null;                                   // the lid: never visible, never heard
    if (!kind) return;
    if (kind === "die" && other.dieIndex < i) return;   // both dice report it; keep one
    const v = Math.abs(e.contact.getImpactVelocityAlongNormal());
    if (v < 0.8) return;
    const key = i + kind;
    if (this._simStep - (this._lastHit[key] ?? -99) < 7) return;
    this._lastHit[key] = this._simStep;
    this._hits.push({ s: this._simStep, i, kind, v });
  }

  /* ----- where you are sitting ----- */

  // Two chairs at one table. Seat 0 is the +z edge, seat 1 the -z edge --
  // literally the chair opposite. Only the camera moves: the simulation is
  // identical on every machine, so two players watch the same throw from their
  // own side rather than watching two different throws.
  setViewSeat(seat) {
    this.viewSeat = seat === 1 ? 1 : 0;
    const s = this.viewSeat === 1 ? -1 : 1;
    // Where the camera rests; _render drifts it a hair around this point.
    this._camBase = new THREE.Vector3(0, 9.4, 7.5 * s);
    this.camera.position.copy(this._camBase);
    this.camera.lookAt(0, 0, 0);
    // The lamp swings round with the chair. Left where it was, the far seat
    // gets every shadow thrown toward it and the dice read as cut-outs.
    this._key.position.set(3 * s, 14, 6 * s);
    this._fill.position.set(-4 * s, 5, -9 * s);   // from across the table: a rim on the far edges
  }

  /* ----- rolling ----- */

  // values: array of 1-6, one per die (held dice are ignored and keep theirs).
  // seed:   any integer; the same seed gives the same throw, everywhere.
  // power:  0..1, how hard they're thrown (0.5 is an ordinary throw). Part
  //         of the throw like the seed: everyone watching must get the same.
  // Resolves when the animation finishes.
  async roll({ values, seed = (Math.random() * 1e9) | 0, instant = false, fromSeat = 0, power = 0.5 } = {}) {
    const loose = this.dice.map((_, i) => i).filter((i) => !this.held[i]);
    if (!loose.length) return this.values.slice();
    if (!values || values.length !== this.count)
      throw new Error("dice3d: roll() needs one value per die");

    this.sound?.wake();
    const take = this._simulate(loose, seed, values, fromSeat, power);
    for (const i of loose) this.values[i] = values[i];
    this._offsets = take.offsets;
    this.dice.forEach((d, i) => d.mesh.quaternion.copy(take.offsets[i]));
    this._durMs = ((take.frames.length - 1) / (60 * this.speed)) * 1000;

    if (instant) {
      this._applyFrame(take, take.frames.length - 1);
      this._settled();
      return this.values.slice();
    }
    await this._play(take);
    this._settled();
    return this.values.slice();
  }

  // Throw, step to a standstill, and record it -- all before anything is drawn.
  // Retries with a nudged seed if a die ends up leaning on another one, since
  // a tilted die has no face pointing up to relabel.
  _simulate(loose, seed, values, fromSeat = 0, power = 0.5) {
    // The two ends should feel nothing alike. Near 0 they're barely let go
    // of: dropped from low, just past your own rail, hardly turning. Near 1
    // they're hurled -- high, fast, spinning hard -- and slam around the tray
    // before they settle. 0.5 is the throw the game always had.
    const p = Math.min(1, Math.max(0, Number(power) || 0));
    const shove = 0.1 + 2.3 * Math.pow(p, 1.35);   // forward speed: x0.1 .. x2.4 (x1.0 at 0.5)
    const spin = 0.12 + 1.95 * Math.pow(p, 1.1);    // tumble:        x0.12 .. x2.1 (x1.0 at 0.5)
    const lift = Math.max(0, p - 0.5) * 2;          // extra toss, only for the hard half
    const drop = p < 0.5 ? 0.45 + 1.1 * p : 1;      // soft throws start lower
    // a hard throw takes longer to come to rest, so it gets more time
    const DT = 1 / 120, MAX = 720 + Math.round(600 * p), EVERY = 2, MAX_FRAMES = 132 + Math.round(110 * lift);
    for (let attempt = 0; attempt < 10; attempt++) {
      const rnd = mulberry32(seed + attempt * 7919);
      const held = this.dice.map((_, i) => this.held[i]);

      this.dice.forEach((d, i) => {
        if (held[i]) { d.body.type = CANNON.Body.STATIC; d.body.mass = 0; d.body.updateMassProperties(); d.body.wakeUp(); return; }
        d.body.type = CANNON.Body.DYNAMIC;
        d.body.mass = 1;
        d.body.updateMassProperties();
        const n = loose.indexOf(i);
        // Seat 0 sits at the +z edge, seat 1 at -z. The throw runs down the
        // LENGTH of the table, away from whoever rolled: the sideways part is
        // small and random scatter, not the main motion. Get that balance
        // wrong and it reads as a throw in from the wings rather than from a
        // player's own side.
        const dir = fromSeat === 1 ? -1 : 1;
        // Spaced wider than a die (1.0) so they do not spawn inside one
        // another. Overlapping bodies get shoved apart on the first step,
        // which reads as a little explosion before the throw even starts.
        d.body.position.set(
          (n - (loose.length - 1) / 2) * 1.25 + (rnd() - 0.5) * 0.2,
          (1.6 + rnd() * 1.4) * drop,
          dir * (TRAY.d / 2 - 0.7 + rnd() * 0.3)
        );
        d.body.quaternion.setFromEuler(rnd() * 6.28, rnd() * 6.28, rnd() * 6.28);
        d.body.velocity.set(
          (rnd() - 0.5) * 5.2 * Math.min(1.6, 0.25 + 0.75 * shove),
          -0.2 + rnd() * 1.4 * Math.min(1, shove) + lift * (1.5 + rnd() * 2.5),
          -dir * (9.0 + rnd() * 5.0) * shove
        );
        d.body.angularVelocity.set((rnd() - 0.5) * 38 * spin, (rnd() - 0.5) * 38 * spin, (rnd() - 0.5) * 38 * spin);
        d.body.wakeUp();
      });

      const frames = [];
      let asleep = 0, lastMove = 0;
      // Every impact gets written down as it happens, with the step it
      // happened on, so playback can make the matching sound at the matching
      // moment (see _recordHit).
      this._hits = [];
      this._lastHit = {};
      this._recording = true;
      for (let s = 0; s < MAX; s++) {
        this._simStep = s;
        this.world.step(DT);
        if (s % EVERY === 0) {
          frames.push(this.dice.map((d) => ({
            p: [d.body.position.x, d.body.position.y, d.body.position.z],
            q: [d.body.quaternion.x, d.body.quaternion.y, d.body.quaternion.z, d.body.quaternion.w],
          })));
        }
        const moving = loose.some(
          (i) => this.dice[i].body.velocity.lengthSquared() > 0.18 ||
                 this.dice[i].body.angularVelocity.lengthSquared() > 0.3
        );
        if (moving) { asleep = 0; lastMove = s; }
        else if (++asleep > 10) break;
      }
      // Trim the dead air at the end -- the last die usually stops well before
      // the solver admits everything is asleep, and nobody wants to watch that.
      // But never cut back past the point where every die is genuinely flat: a
      // die can still be tipping off an edge after it stops moving much, and
      // the frame we stop on is the one the player is left looking at.
      const q = new THREE.Quaternion();
      const flatAt = (f) =>
        loose.every((i) => {
          q.fromArray(frames[f][i].q);
          return faceUp(q).flatness >= 0.995;
        });
      this._recording = false;
      let cut = Math.min(frames.length, Math.floor(lastMove / EVERY) + 6, MAX_FRAMES);
      while (cut < frames.length && !flatAt(cut - 1)) cut++;
      if (!flatAt(cut - 1) || cut > MAX_FRAMES + 70) continue;   // never settled, or took too long
      frames.length = cut;

      // Relabel from the pose we actually end on, for the same reason.
      const offsets = this._offsets.map((o) => o.clone());
      for (const i of loose) {
        q.fromArray(frames[cut - 1][i].q);
        offsets[i] = offsetShowing(q, values[i], mulberry32(seed + i * 131));
      }
      const hits = this._hits
        .map((h) => ({ ...h, f: h.s / EVERY }))
        .filter((h) => h.f < cut);
      return { frames, offsets, loose, hits };
    }
    this._recording = false;
    // Ten bad throws is essentially impossible, but never leave the caller
    // without dice: drop them flat where they are.
    return this._fallback(loose, values);
  }

  _fallback(loose, values) {
    const offsets = this._offsets.map((o) => o.clone());
    const frame = this.dice.map((d, i) => {
      const flat = new THREE.Quaternion();
      if (!this.held[i]) {
        d.body.position.set((i - (this.count - 1) / 2) * 1.5, DIE / 2, 0);
        d.body.quaternion.set(0, 0, 0, 1);
        offsets[i] = offsetShowing(flat, values[i], Math.random);
      }
      return {
        p: [d.body.position.x, d.body.position.y, d.body.position.z],
        q: [d.body.quaternion.x, d.body.quaternion.y, d.body.quaternion.z, d.body.quaternion.w],
      };
    });
    return { frames: [frame], offsets, loose };
  }

  // How long the last roll's animation runs, in ms. The game needs this to
  // know when it is allowed to ask about the score.
  get rollDurationMs() {
    return this._durMs || 0;
  }

  _play(take) {
    const total = take.frames.length;
    const dur = this._durMs;

    // Playback rides on requestAnimationFrame, which browsers stop servicing
    // in a hidden tab. Left alone that means a player who switches away
    // mid-throw never finishes their roll -- and in a turn-timed game, a
    // promise that never settles is a wedged match. So: don't animate at all
    // if we're already hidden, bail to the final pose if we become hidden, and
    // keep a wall-clock watchdog for everything else that can stall a frame
    // loop. roll() always settles.
    return new Promise((resolve) => {
      const finish = () => {
        if (!this._playing) return;
        this._applyFrame(take, total - 1);
        this._playing = null;
        document.removeEventListener("visibilitychange", onHide);
        resolve();
      };
      if (document.hidden) {
        this._applyFrame(take, total - 1);
        resolve();
        return;
      }
      const onHide = () => { if (document.hidden) finish(); };
      document.addEventListener("visibilitychange", onHide);

      const started = performance.now();
      const deadline = started + dur + 500;
      const hits = take.hits || [];
      let next = 0;
      this._playing = () => {
        const now = performance.now();
        const f = ((now - started) / 1000) * 60 * this.speed;
        // Sounds for every impact the playback has now reached. Pan follows
        // the die across the table, from wherever this player is sitting.
        while (next < hits.length && hits[next].f <= f) {
          const h = hits[next++];
          const fr = take.frames[Math.min(Math.round(h.f), total - 1)][h.i];
          const pan = (fr.p[0] / (TRAY.w / 2)) * (this.viewSeat === 1 ? -1 : 1);
          this.sound?.play(h.kind, h.v, pan * 0.8);
          // A hard landing nudges the camera, as if it felt the table jump.
          if (h.kind !== "die" && h.v > 5) this._shake = Math.min(0.09, this._shake + (h.v - 5) * 0.008);
        }
        if (f >= total - 1 || now > deadline) return finish();
        this._applyFrame(take, f);
      };
    });
  }

  _applyFrame(take, f) {
    const i0 = Math.floor(f), i1 = Math.min(i0 + 1, take.frames.length - 1), t = f - i0;
    const a = take.frames[i0], b = take.frames[i1];
    this.dice.forEach((d, i) => {
      d.pivot.position.set(
        a[i].p[0] + (b[i].p[0] - a[i].p[0]) * t,
        a[i].p[1] + (b[i].p[1] - a[i].p[1]) * t,
        a[i].p[2] + (b[i].p[2] - a[i].p[2]) * t
      );
      _qa.fromArray(a[i].q); _qb.fromArray(b[i].q);
      d.pivot.quaternion.copy(_qa).slerp(_qb, t);
      this._placeGhosts(d, take, f, i);
    });
  }

  // Trail the ghosts a fraction of a frame behind the die, fading in with
  // speed. A die that's barely moving has no blur at all.
  _placeGhosts(d, take, f, i) {
    const last = take.frames.length - 1;
    const at = (g) => {
      const i0 = Math.max(0, Math.min(last, Math.floor(g))), i1 = Math.min(i0 + 1, last), t = g - Math.floor(g);
      const a = take.frames[i0][i], b = take.frames[i1][i];
      return { a, b, t: g < 0 ? 0 : t };
    };
    const cur = at(f), prev = at(f - 1);
    const speed = Math.hypot(
      cur.a.p[0] - prev.a.p[0], cur.a.p[1] - prev.a.p[1], cur.a.p[2] - prev.a.p[2]
    ) * 60 * this.speed;                                    // world units per second
    const k = Math.max(0, Math.min(1, (speed - 3) / 9));
    d.ghosts.forEach((g, n) => {
      if (k <= 0 || f >= last) { g.visible = false; return; }
      const { a, b, t } = at(f - 0.45 * (n + 1));
      g.position.set(
        a.p[0] + (b.p[0] - a.p[0]) * t,
        a.p[1] + (b.p[1] - a.p[1]) * t,
        a.p[2] + (b.p[2] - a.p[2]) * t
      );
      _qa.fromArray(a.q); _qb.fromArray(b.q);
      g.quaternion.copy(_qa).slerp(_qb, t);
      g.userData.mesh.quaternion.copy(d.mesh.quaternion);
      const op = g.userData.peak * k;
      g.userData.mesh.traverse((o) => { if (o.isMesh) o.material.opacity = op; });
      g.visible = true;
    });
  }

  _hideGhosts() {
    for (const d of this.dice) for (const g of d.ghosts) g.visible = false;
  }

  // What the dice ACTUALLY show, measured from their world transforms rather
  // than from what we intended. The only honest way to test this file.
  readFaces() {
    const q = new THREE.Quaternion();
    return this.dice.map((d) => {
      d.mesh.updateWorldMatrix(true, false);
      d.mesh.getWorldQuaternion(q);
      return faceUp(q, null);
    });
  }

  _settled() {
    const shown = this.readFaces();
    for (let i = 0; i < this.count; i++) {
      if (shown[i].value !== this.values[i])
        console.error(`dice3d: die ${i} shows ${shown[i].value}, expected ${this.values[i]}`);
      else if (shown[i].flatness < 0.98)
        console.error(`dice3d: die ${i} is not lying flat (${shown[i].flatness.toFixed(3)})`);
    }
    if (this.onSettle) this.onSettle(this.values.slice());
  }

  /* ----- holding ----- */

  setHeld(i, held) {
    this.held[i] = !!held;
    this.dice[i].mesh.traverse((o) => {
      if (!o.isMesh) return;
      o.material.color.setHex(this.held[i] ? 0x53d98c : o.userData.baseColor);
      o.material.emissive.setHex(this.held[i] ? 0x1c7a42 : o.userData.baseEmissive);
      o.material.emissiveIntensity = this.held[i] ? 0.7 : 1;
    });
  }

  clearHolds() {
    for (let i = 0; i < this.count; i++) this.setHeld(i, false);
  }

  // Which die is under this page coordinate, or -1. Clicking the actual die is
  // worth the raycast -- holding is the whole game.
  pick(clientX, clientY) {
    const r = this.canvas.getBoundingClientRect();
    const pt = new THREE.Vector2(
      ((clientX - r.left) / r.width) * 2 - 1,
      -((clientY - r.top) / r.height) * 2 + 1
    );
    this._ray = this._ray || new THREE.Raycaster();
    this._ray.setFromCamera(pt, this.camera);
    const hits = this._ray.intersectObjects(this.dice.map((d) => d.pivot), true);
    if (!hits.length) return -1;
    let o = hits[0].object;
    while (o && !this.dice.some((d) => d.pivot === o)) o = o.parent;
    return o ? this.dice.findIndex((d) => d.pivot === o) : -1;
  }

  setValues(values) {
    this.values = values.slice();
    this.layoutRow();
  }

  // Lay every die out flat in a row, showing its value. The idle pose, used
  // before the first roll of a turn.
  layoutRow() {
    const flat = new THREE.Quaternion();
    const lay = (list, z) =>
      list.forEach((i, n) => {
        const d = this.dice[i];
        const x = (n - (list.length - 1) / 2) * 1.5;
        d.body.position.set(x, DIE / 2, z);
        d.body.quaternion.set(0, 0, 0, 1);
        d.body.velocity.setZero();
        d.body.angularVelocity.setZero();
        d.pivot.position.set(x, DIE / 2, z);
        d.pivot.quaternion.set(0, 0, 0, 1);
        this._offsets[i] = offsetShowing(flat, this.values[i], mulberry32(i * 977 + this.values[i]));
        d.mesh.quaternion.copy(this._offsets[i]);
      });
    lay(this.dice.map((_, i) => i), 0);   // index order, so dice never swap places
  }

  /* ----- plumbing ----- */

  _resize() {
    const w = this.canvas.clientWidth || 640, h = this.canvas.clientHeight || 420;
    this.renderer.setSize(w, h, false);
    this.fx?.setSize(w, h, this.renderer.getPixelRatio());
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  get muted() { return !!this.sound?.muted; }
  setMuted(m) { this.sound?.setMuted(m); if (!m) this.sound?.wake(); }

  _render() {
    this._raf = requestAnimationFrame(() => this._render());
    if (this._playing) this._playing();
    else this._hideGhosts();
    // A camera on a person, not a tripod: a slow drift of a few centimetres,
    // plus whatever shake the last hard landing left behind.
    const t = performance.now() / 1000;
    const sh = this._shake || 0;
    this.camera.position.set(
      this._camBase.x + Math.sin(t * 0.21) * 0.06 + (Math.random() - 0.5) * sh,
      this._camBase.y + Math.sin(t * 0.17 + 1.3) * 0.035 + (Math.random() - 0.5) * sh,
      this._camBase.z + Math.cos(t * 0.13) * 0.05 + (Math.random() - 0.5) * sh
    );
    this.camera.lookAt(0, 0, 0);
    this._shake = sh * 0.88;
    // Contact shadows follow their die and fade and spread as it leaves the
    // cloth; a die at rest sits at y = DIE / 2.
    for (const d of this.dice) {
      const lift = Math.max(0, d.pivot.position.y - DIE / 2);
      const k = Math.max(0, 1 - lift / 1.2);
      d.contact.position.set(d.pivot.position.x, 0.003, d.pivot.position.z);
      d.contact.scale.setScalar(1 + lift * 0.6);
      d.contact.material.opacity = 0.85 * k * k;
    }
    if (this.fx) this.fx.render(t);
    else this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    cancelAnimationFrame(this._raf);
    this._ro?.disconnect();
    this.fx?.dispose();
    this.renderer.dispose();
  }
}

const _qa = new THREE.Quaternion(), _qb = new THREE.Quaternion();
