// The finishing pass for the dice table: everything that makes a correct 3D
// render look like a photograph of a real table, and sound like one.
//
//   - Post-processing: ambient occlusion in the creases, a little bloom on
//     the hottest highlights, a shallow depth of field, and a lens vignette
//     with film grain on top.
//   - Then the illustration: dark ink lines round every edge, light
//     gathered into soft cel bands, shadows pushed indigo and highlights
//     gold -- so the photograph reads as a 1980s airbrush painting.
//   - Sound: dice on felt, dice on dice, dice on the rail -- synthesised once
//     into buffers, no audio files.
//
// dice3d.js decides WHEN things happen; this file only knows how they look
// and sound.

import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { GTAOPass } from "three/addons/postprocessing/GTAOPass.js";
import { BokehPass } from "three/addons/postprocessing/BokehPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";

/* ---------- post-processing ---------- */

// Vignette + grain, applied last, after tone mapping, as a real lens and
// sensor would. The grain moves every frame; static grain reads as a dirty
// screen rather than film.
const LensShader = {
  uniforms: {
    tDiffuse: { value: null },
    time: { value: 0 },
    vignette: { value: 0.62 },
    grain: { value: 0.035 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float time, vignette, grain;
    varying vec2 vUv;
    float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
    void main() {
      vec4 c = texture2D(tDiffuse, vUv);
      vec2 d = vUv - 0.5;
      float v = 1.0 - vignette * smoothstep(0.2, 0.8, length(d * vec2(1.15, 1.0)));
      c.rgb *= v;
      float n = hash(vUv * 1024.0 + fract(time) * 97.0) - 0.5;
      // grain shows most in the mid-tones, as on film
      float l = dot(c.rgb, vec3(0.299, 0.587, 0.114));
      c.rgb += n * grain * (1.0 - abs(l * 2.0 - 1.0) * 0.6);
      gl_FragColor = c;
    }`,
};

// The painting. Runs after tone mapping, on display colours.
//
//   ink:   edges found in a separate render of the scene's normals and
//          depth (see InkBuffer) -- a silhouette is a jump in depth, a crease
//          is a turn in the normal. Drawn in a near-black indigo, never black.
//   bands: brightness pulled part-way toward a few flat steps, with soft
//          shoulders. Fully flat would kill the airbrushed gradients the
//          reference art is full of; part-way keeps them, but gives every
//          surface a lit side and a shadow side with an edge between.
//   grade: split-toned -- shadows toward ultramarine, highlights toward
//          warm gold -- and more saturation.
//   halftone (optional, off by default): shading done the way a comic is
//          printed. Lit areas become one flat colour; the shadow on them is
//          carried by dots of a darker shade of that same colour, on a
//          45-degree screen, growing as the shadow deepens until they merge
//          into solid shadow. No smooth gradients left at all -- only
//          flat colour, dots, and ink.
const InkShader = {
  uniforms: {
    tDiffuse: { value: null },
    tNormal: { value: null },
    tDepth: { value: null },
    texel: { value: new THREE.Vector2(1 / 1024, 1 / 1024) },
    near: { value: 0.1 },
    far: { value: 100 },
    ink: { value: new THREE.Color(0x07051c) },
    inkStrength: { value: 0.85 },
    bands: { value: 4.0 },
    bandMix: { value: 0.4 },
    grade: { value: 1.0 },
    halftone: { value: 0 },
    dotCell: { value: 7.0 },          // device pixels between dot centres
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: /* glsl */ `
    #include <packing>
    uniform sampler2D tDiffuse, tNormal, tDepth;
    uniform vec2 texel;
    uniform float near, far, inkStrength, bands, bandMix, grade, halftone, dotCell;
    uniform vec3 ink;
    varying vec2 vUv;

    float depthAt(vec2 uv) {
      float z = texture2D(tDepth, uv).x;
      return -perspectiveDepthToViewZ(z, near, far);
    }
    vec3 normalAt(vec2 uv) { return texture2D(tNormal, uv).xyz * 2.0 - 1.0; }

    float edge() {
      float dc = depthAt(vUv);
      vec3 nc = normalAt(vUv);
      float e = 0.0;
      // eight directions, so a line is as thick on the diagonal as it is
      // straight across
      for (int k = 0; k < 8; k++) {
        float a = float(k) * 0.7853982;
        vec2 o = vec2(cos(a), sin(a)) * texel;
        float d = depthAt(vUv + o);
        // relative, so the far end of the table isn't one solid line
        e = max(e, smoothstep(0.012, 0.03, (d - dc) / dc));
        e = max(e, smoothstep(0.3, 0.55, 1.0 - dot(nc, normalAt(vUv + o))));
      }
      // nothing drawn behind the table, where the depth runs out
      return dc > far * 0.95 ? 0.0 : e;
    }

    void main() {
      vec4 c = texture2D(tDiffuse, vUv);
      vec3 col = c.rgb;
      float l = dot(col, vec3(0.299, 0.587, 0.114));
      // 1 on a die (see InkBuffer): the dice get a light touch
      float die = 1.0 - texture2D(tNormal, vUv).a;

      // bands: pull the brightness part-way toward the nearest step, with
      // wide soft shoulders -- a hint of cel shading, not a poster
      float s = l * bands;
      float stepped = (floor(s) + smoothstep(0.2, 0.8, fract(s))) / bands;
      float l2 = mix(l, stepped, bandMix * mix(1.0, 0.3, die));
      col *= l > 1e-4 ? l2 / l : 1.0;

      // grade: indigo shadows, gold highlights, a touch more colour
      float g = clamp(l2, 0.0, 1.0);
      vec3 shadowTint = vec3(0.30, 0.30, 1.0);
      vec3 lightTint = vec3(1.0, 0.86, 0.55);
      vec3 graded = col;
      graded = mix(graded, graded * shadowTint * 1.6 + vec3(0.006, 0.004, 0.03), (1.0 - smoothstep(0.0, 0.35, g)) * 0.35);
      graded = mix(graded, graded * lightTint * 1.12, smoothstep(0.55, 1.0, g) * 0.25);
      float gl = dot(graded, vec3(0.299, 0.587, 0.114));
      graded = mix(vec3(gl), graded, 1.12);
      col = mix(col, graded, grade * mix(1.0, 0.35, die));

      if (halftone > 0.5) {
        // How lit is this pixel? Brightness as the strongest channel, not
        // luma, so a lit red face counts as lit as lit blue velvet.
        float v = max(col.r, max(col.g, col.b));
        float shade = 1.0 - smoothstep(0.05, 0.45, v);
        // The flat colour this surface is printed in: its own hue at one
        // brightness, so a lit area is a single flat tone with no gradient
        // across it. Only real highlights keep their own brightness. (The
        // lift is capped, so the near-black room doesn't amplify grain into
        // random colour.)
        float level = mix(0.66, v, smoothstep(0.82, 1.0, v));
        vec3 printed = col * min(level / max(v, 1e-3), 3.0);
        // ...and the shadow ink: the same hue, deep, pulled toward
        // ultramarine -- shadows in the painting are blue, never black.
        vec3 deep = mix(printed * 0.28, vec3(0.05, 0.04, 0.24), 0.4);
        // The dot screen: 45 degrees, a dot per cell, its radius set by how
        // much shadow there is. Past ~0.71 of a cell the dots touch and
        // merge, so the deepest shadow prints solid.
        vec2 p = gl_FragCoord.xy / dotCell;
        p = vec2(p.x + p.y, p.x - p.y) * 0.7071;
        float d = length(fract(p) - 0.5);
        float r = sqrt(shade) * 0.78;
        float aa = 0.9 / dotCell;
        float inDot = shade < 0.03 ? 0.0 : 1.0 - smoothstep(r - aa, r + aa, d);
        // never on the dice: dots on the pips read as dirt
        col = mix(mix(printed, deep, inDot), col, die);
      }

      col = mix(col, ink, edge() * inkStrength);
      gl_FragColor = vec4(clamp(col, 0.0, 1.0), c.a);
    }`,
};

// What the ink is drawn from: the scene again, every surface in a plain
// normal material, into a target that keeps its depth. Cheap -- no lights, no
// textures -- and it ignores the felt's normal map, so the cloth's weave
// doesn't come out as scribble.
//
// It also marks the dice: anything on layer DICE_LAYER is drawn a second time
// with alpha 0, so the painting pass knows which pixels are dice and can go
// easy on them (glossy red glass looks fried pushed as hard as cloth).
export const DICE_LAYER = 1;
const _clear = new THREE.Color();
class InkBuffer {
  constructor(hidden) {
    this.hidden = hidden;
    this.material = new THREE.MeshNormalMaterial();
    // transparent only so three doesn't force alpha to 1; no blending, so
    // the 0 lands in the target as written
    this.mark = new THREE.MeshNormalMaterial({ transparent: true, opacity: 0, blending: THREE.NoBlending });
    this.target = new THREE.WebGLRenderTarget(1, 1, {
      depthTexture: new THREE.DepthTexture(1, 1),
      minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter,
    });
  }
  setSize(w, h) { this.target.setSize(w, h); }
  render(renderer, scene, camera) {
    const was = this.hidden().map((o) => [o, o.visible]);
    for (const [o] of was) o.visible = false;
    const prevOverride = scene.overrideMaterial, prevBg = scene.background;
    scene.overrideMaterial = this.material;
    scene.background = null;
    const prevTarget = renderer.getRenderTarget();
    const prevClear = renderer.getClearColor(_clear), prevAlpha = renderer.getClearAlpha();
    renderer.setRenderTarget(this.target);
    renderer.setClearColor(0x8080ff, 1);
    renderer.clear();
    renderer.render(scene, camera);
    // the dice again, over themselves, marked
    const mask = camera.layers.mask, autoClear = renderer.autoClear;
    camera.layers.set(DICE_LAYER);
    scene.overrideMaterial = this.mark;
    renderer.autoClear = false;
    renderer.render(scene, camera);
    renderer.autoClear = autoClear;
    camera.layers.mask = mask;
    renderer.setRenderTarget(prevTarget);
    renderer.setClearColor(prevClear, prevAlpha);
    scene.overrideMaterial = prevOverride;
    scene.background = prevBg;
    for (const [o, v] of was) o.visible = v;
  }
  dispose() { this.target.dispose(); this.material.dispose(); this.mark.dispose(); }
}

// Things that must not show up in the ambient-occlusion pass: the transparent
// contact-shadow cards and the motion-blur ghosts. AO is worked out from depth
// and normals, and a flat card hovering a hair over the felt would darken a
// ring around every die.
class SelectiveGTAOPass extends GTAOPass {
  constructor(scene, camera, w, h, hidden) {
    super(scene, camera, w, h);
    this._hidden = hidden;
  }
  render(...args) {
    const was = this._hidden().map((o) => [o, o.visible]);
    for (const [o] of was) o.visible = false;
    super.render(...args);
    for (const [o, v] of was) o.visible = v;
  }
}

// Builds the chain. `high` is false on phones: no AO and no depth of field
// there, which are the two expensive passes.
export function createComposer(renderer, scene, camera, { high, hidden, focus }) {
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  let ao = null, dof = null;
  if (high) {
    ao = new SelectiveGTAOPass(scene, camera, 1, 1, hidden);
    ao.blendIntensity = 1.0;
    ao.updateGtaoMaterial({ radius: 0.35, distanceExponent: 1.5, thickness: 1.2, scale: 1.0, samples: 16 });
    ao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, rings: 2, samples: 16 });
    composer.addPass(ao);

    // Shallow, but only just: the dice stay sharp, the near rail and the far
    // end of the table soften like a close-up photo of something small.
    dof = new BokehPass(scene, camera, { focus, aperture: 0.0016, maxblur: 0.0045 });
    composer.addPass(dof);
  }

  // Only the brightest specular glints bloom.
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.12, 0.35, 0.96);
  composer.addPass(bloom);

  composer.addPass(new OutputPass());
  const inkBuf = new InkBuffer(hidden);
  const ink = new ShaderPass(InkShader);
  ink.uniforms.tNormal.value = inkBuf.target.texture;
  ink.uniforms.tDepth.value = inkBuf.target.depthTexture;
  ink.uniforms.near.value = camera.near;
  ink.uniforms.far.value = camera.far;
  composer.addPass(ink);
  const lens = new ShaderPass(LensShader);
  composer.addPass(lens);

  return {
    composer, dof, ink,
    setSize(w, h, pr) {
      composer.setPixelRatio(pr);
      composer.setSize(w, h);
      // The ink buffer at CSS resolution, not device: a quarter of the
      // pixels on a retina screen, and the lines (about 2.5 CSS pixels)
      // don't need more.
      inkBuf.setSize(Math.round(w), Math.round(h));
      ink.uniforms.texel.value.set(2.5 / w, 2.5 / h);
      ink.uniforms.dotCell.value = 5.5 * pr;
    },
    render(t) {
      lens.uniforms.time.value = t;
      inkBuf.render(renderer, scene, camera);
      composer.render();
    },
    setFocus(f) { if (dof) dof.uniforms.focus.value = f; },
    setHalftone(on) { ink.uniforms.halftone.value = on ? 1 : 0; },
    dispose() { composer.dispose(); inkBuf.dispose(); },
  };
}

/* ---------- sound ---------- */

// All three sounds are a burst of noise plus a few damped sine "modes",
// which is roughly what an impact on a solid object is. Generated once.
function makeBuffer(ctx, dur, fill) {
  const n = Math.floor(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, n, ctx.sampleRate);
  fill(buf.getChannelData(0), ctx.sampleRate);
  return buf;
}

function impact(data, sr, { modes, noise, noiseDecay, lowpass }) {
  let lp = 0;
  const a = Math.exp(-2 * Math.PI * lowpass / sr);
  for (let i = 0; i < data.length; i++) {
    const t = i / sr;
    let s = 0;
    for (const [f, amp, decay] of modes) s += amp * Math.sin(2 * Math.PI * f * t) * Math.exp(-t * decay);
    // one-pole low-pass on the noise: a soft thud for felt, an open crack for plastic
    lp = (1 - a) * (Math.random() * 2 - 1) + a * lp;
    s += noise * lp * Math.exp(-t * noiseDecay);
    data[i] = s;
  }
  // tiny fade-in so the start never clicks
  for (let i = 0; i < 48 && i < data.length; i++) data[i] *= i / 48;
}

export class DiceSound {
  constructor() {
    this.ctx = null;
    let saved = null;
    try { saved = localStorage.getItem("yahtzee-muted"); } catch {}
    this.muted = saved === "1";
  }

  setMuted(m) {
    this.muted = !!m;
    try { localStorage.setItem("yahtzee-muted", this.muted ? "1" : "0"); } catch {}
  }

  // Browsers only let audio start after a click, and rolling is a click.
  // Called at the start of every roll; harmless when already running.
  wake() {
    if (this.muted) return;
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      const c = this.ctx;
      this.out = c.createGain();
      this.out.gain.value = 0.9;
      this.out.connect(c.destination);
      this.bufs = {
        felt: [0, 1, 2].map(() => makeBuffer(c, 0.14, (d, sr) => impact(d, sr, {
          modes: [[95, 0.5, 38], [170, 0.25, 55]], noise: 1.1, noiseDecay: 45, lowpass: 900,
        }))),
        die: [0, 1, 2].map(() => makeBuffer(c, 0.07, (d, sr) => impact(d, sr, {
          modes: [[2650, 0.35, 90], [3900, 0.25, 120], [5200, 0.12, 160]], noise: 0.7, noiseDecay: 260, lowpass: 9000,
        }))),
        wall: [0, 1, 2].map(() => makeBuffer(c, 0.11, (d, sr) => impact(d, sr, {
          modes: [[420, 0.45, 48], [910, 0.25, 70], [1650, 0.12, 95]], noise: 0.8, noiseDecay: 90, lowpass: 3500,
        }))),
      };
    }
    if (this.ctx.state === "suspended") this.ctx.resume();
  }

  // kind: "felt" | "die" | "wall"; speed: impact speed in world units/s;
  // pan: -1 (left) .. 1 (right)
  play(kind, speed, pan = 0) {
    if (this.muted || !this.ctx || this.ctx.state !== "running") return;
    const c = this.ctx;
    const set = this.bufs[kind];
    const src = c.createBufferSource();
    src.buffer = set[(Math.random() * set.length) | 0];
    src.playbackRate.value = 0.9 + Math.random() * 0.2;
    const g = c.createGain();
    const loud = { felt: 0.11, die: 0.07, wall: 0.08 }[kind];
    g.gain.value = Math.min(1, (speed * loud) ** 1.3);
    let node = g;
    if (c.createStereoPanner) {
      const p = c.createStereoPanner();
      p.pan.value = Math.max(-1, Math.min(1, pan));
      g.connect(p);
      node = p;
    }
    node.connect(this.out);
    src.connect(g);
    src.start();
  }
}
