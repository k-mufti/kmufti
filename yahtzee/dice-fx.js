// The finishing pass for the dice table: everything that makes a correct 3D
// render look like a photograph of a real table, and sound like one.
//
//   - Post-processing: ambient occlusion in the creases, a little bloom on
//     the hottest highlights, a shallow depth of field, and a lens vignette
//     with film grain on top.
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
  const lens = new ShaderPass(LensShader);
  composer.addPass(lens);

  return {
    composer, dof,
    setSize(w, h, pr) {
      composer.setPixelRatio(pr);
      composer.setSize(w, h);
    },
    render(t) {
      lens.uniforms.time.value = t;
      composer.render();
    },
    setFocus(f) { if (dof) dof.uniforms.focus.value = f; },
    dispose() { composer.dispose(); },
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
