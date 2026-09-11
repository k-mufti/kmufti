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
import * as CANNON from "cannon-es";

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
    const r = (this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas, antialias: true, alpha: true,
    }));
    r.setPixelRatio(Math.min(devicePixelRatio, 2));
    r.shadowMap.enabled = true;
    r.shadowMap.type = THREE.PCFSoftShadowMap;
    r.toneMapping = THREE.ACESFilmicToneMapping;
    r.toneMappingExposure = 0.92;

    const scene = (this.scene = new THREE.Scene());
    const cam = (this.camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100));

    // A room environment gives the dice something to reflect. Without it they
    // read as matte plastic no matter how good the model is.
    const pmrem = new THREE.PMREMGenerator(r);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

    scene.add(new THREE.AmbientLight(0xffffff, 0.34));
    const key = (this._key = new THREE.DirectionalLight(0xfff4e6, 1.85));
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.radius = 3;
    key.shadow.bias = -0.0008;
    const sc = key.shadow.camera;
    sc.left = -7; sc.right = 7; sc.top = 6; sc.bottom = -6; sc.near = 1; sc.far = 30;
    sc.updateProjectionMatrix();
    scene.add(key);
    const fill = (this._fill = new THREE.DirectionalLight(0xbfd8ff, 0.45));
    scene.add(fill);
    this.setViewSeat(0);           // places the camera and swings the lamp with it

    this._buildTray();
    this._buildWorld();
    await this._buildDice();

    this._resize();
    this._ro = new ResizeObserver(() => this._resize());
    this._ro.observe(this.canvas);
    this._render();
  }

  _buildTray() {
    const felt = new THREE.MeshStandardMaterial({
      color: 0x0a4a2d, roughness: 1.0, metalness: 0,
      // Felt is not shiny. Letting the environment map light it is what made
      // the first version look like green plastic.
      envMapIntensity: 0.12,
      normalMap: feltNormalMap(), normalScale: new THREE.Vector2(0.7, 0.7),
    });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(TRAY.w, TRAY.d), felt);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    const wood = new THREE.MeshStandardMaterial({
      color: 0x3b2414, roughness: 0.6, metalness: 0.03, envMapIntensity: 0.4,
    });
    const { w, d, wallH, rim } = TRAY;
    const rails = [
      [w + rim * 2, wallH, rim, 0, wallH / 2, -(d / 2 + rim / 2)],
      [w + rim * 2, wallH, rim, 0, wallH / 2, d / 2 + rim / 2],
      [rim, wallH, d, -(w / 2 + rim / 2), wallH / 2, 0],
      [rim, wallH, d, w / 2 + rim / 2, wallH / 2, 0],
    ];
    for (const [bw, bh, bd, x, y, z] of rails) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, bd), wood);
      m.position.set(x, y, z);
      m.castShadow = false;
      m.receiveShadow = true;
      this.scene.add(m);
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

    const ground = new CANNON.Body({ mass: 0, shape: new CANNON.Plane(), material: mFelt });
    ground.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    world.addBody(ground);

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
        m.roughness = 0.34;
        m.metalness = 0.0;
        m.envMapIntensity = 0.85;
      });
    } catch (e) {
      console.warn("dice3d: die.glb failed to load, using a plain cube --", e.message);
      proto = new THREE.Mesh(
        new THREE.BoxGeometry(DIE, DIE, DIE),
        new THREE.MeshStandardMaterial({ color: 0xf2efe6, roughness: 0.35 })
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
      });
      pivot.add(mesh);
      this.scene.add(pivot);

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
      this.world.addBody(body);

      this.dice.push({ pivot, mesh, body });
    }
    this.layoutRow();
  }

  /* ----- where you are sitting ----- */

  // Two chairs at one table. Seat 0 is the +z edge, seat 1 the -z edge --
  // literally the chair opposite. Only the camera moves: the simulation is
  // identical on every machine, so two players watch the same throw from their
  // own side rather than watching two different throws.
  setViewSeat(seat) {
    this.viewSeat = seat === 1 ? 1 : 0;
    const s = this.viewSeat === 1 ? -1 : 1;
    this.camera.position.set(0, 9.4, 7.5 * s);
    this.camera.lookAt(0, 0, 0);
    // The lamp swings round with the chair. Left where it was, the far seat
    // gets every shadow thrown toward it and the dice read as cut-outs.
    this._key.position.set(3 * s, 14, 6 * s);
    this._fill.position.set(-7 * s, 6, -5 * s);
  }

  /* ----- rolling ----- */

  // values: array of 1-6, one per die (held dice are ignored and keep theirs).
  // seed:   any integer; the same seed gives the same throw, everywhere.
  // Resolves when the animation finishes.
  async roll({ values, seed = (Math.random() * 1e9) | 0, instant = false, fromSeat = 0 } = {}) {
    const loose = this.dice.map((_, i) => i).filter((i) => !this.held[i]);
    if (!loose.length) return this.values.slice();
    if (!values || values.length !== this.count)
      throw new Error("dice3d: roll() needs one value per die");

    const take = this._simulate(loose, seed, values, fromSeat);
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
  _simulate(loose, seed, values, fromSeat = 0) {
    const DT = 1 / 120, MAX = 720, EVERY = 2, MAX_FRAMES = 132;
    for (let attempt = 0; attempt < 10; attempt++) {
      const rnd = mulberry32(seed + attempt * 7919);
      const held = this.dice.map((_, i) => this.held[i]);

      this.dice.forEach((d, i) => {
        if (held[i]) { d.body.type = CANNON.Body.STATIC; d.body.mass = 0; d.body.updateMassProperties(); d.body.wakeUp(); return; }
        d.body.type = CANNON.Body.DYNAMIC;
        d.body.mass = 1;
        d.body.updateMassProperties();
        const n = loose.indexOf(i);
        // Seat 0 throws from the +z edge, seat 1 from -z: a 180 degree turn of
        // the same throw, so it always leaves from in front of whoever rolled.
        const f = fromSeat === 1 ? 1 : -1;
        d.body.position.set(
          f * (-TRAY.w / 2 + 0.9 + n * 0.42),
          1.7 + rnd() * 1.1,
          f * (-TRAY.d / 2 + 0.8 + rnd() * 0.5)
        );
        d.body.quaternion.setFromEuler(rnd() * 6.28, rnd() * 6.28, rnd() * 6.28);
        d.body.velocity.set(
          f * (6.2 + rnd() * 3.2),
          -0.5 + rnd() * 1.2,
          f * (3.0 + rnd() * 4.4)
        );
        d.body.angularVelocity.set((rnd() - 0.5) * 26, (rnd() - 0.5) * 26, (rnd() - 0.5) * 26);
        d.body.wakeUp();
      });

      const frames = [];
      let asleep = 0, lastMove = 0;
      for (let s = 0; s < MAX; s++) {
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
      let cut = Math.min(frames.length, Math.floor(lastMove / EVERY) + 6, MAX_FRAMES);
      while (cut < frames.length && !flatAt(cut - 1)) cut++;
      if (!flatAt(cut - 1) || cut > 200) continue;   // never settled, or took too long
      frames.length = cut;

      // Relabel from the pose we actually end on, for the same reason.
      const offsets = this._offsets.map((o) => o.clone());
      for (const i of loose) {
        q.fromArray(frames[cut - 1][i].q);
        offsets[i] = offsetShowing(q, values[i], mulberry32(seed + i * 131));
      }
      return { frames, offsets, loose };
    }
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
      this._playing = () => {
        const now = performance.now();
        const f = ((now - started) / 1000) * 60 * this.speed;
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
    });
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
      o.material.emissive.setHex(this.held[i] ? 0x1c7a42 : 0x000000);
      o.material.emissiveIntensity = this.held[i] ? 0.7 : 0;
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
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  _render() {
    this._raf = requestAnimationFrame(() => this._render());
    if (this._playing) this._playing();
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    cancelAnimationFrame(this._raf);
    this._ro?.disconnect();
    this.renderer.dispose();
  }
}

const _qa = new THREE.Quaternion(), _qb = new THREE.Quaternion();
