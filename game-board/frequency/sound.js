// Frequency's sounds (Imposter borrows them too) and buzzes, all made on the spot with Web Audio - no
// files to load. Phones that can buzz (Android; iPhones can't) buzz too.
//
// Browsers keep audio locked until the first tap, so nothing plays before
// that; the mute switch is remembered per device.

let ctx = null, master = null;
let muted = false;
try { muted = localStorage.getItem("wavelenght-muted") === "1"; } catch { /* private mode */ }

function unlock() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 0.55;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") ctx.resume();
}
for (const ev of ["pointerdown", "keydown"]) window.addEventListener(ev, unlock, { capture: true, passive: true });

export const isMuted = () => muted;
export function setMuted(m) {
  muted = m;
  try { localStorage.setItem("wavelenght-muted", m ? "1" : "0"); } catch { /* fine */ }
  if (master) master.gain.setTargetAtTime(m ? 0 : 0.55, ctx.currentTime, 0.02);
}

export function buzz(pattern) {
  if (muted || !navigator.vibrate) return;
  try { navigator.vibrate(pattern); } catch { /* not allowed yet */ }
}

const live = () => ctx && ctx.state === "running" && !muted;

/* ---------- building blocks ---------- */
function tone(freq, at, dur, { type = "sine", vol = 0.3, to = null, attack = 0.005 } = {}) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, at);
  if (to) o.frequency.exponentialRampToValueAtTime(to, at + dur);
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(vol, at + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  o.connect(g).connect(master);
  o.start(at);
  o.stop(at + dur + 0.02);
}
let noiseBuf = null;
function noise(at, dur, { vol = 0.2, freq = 1200, q = 0.8, to = null, type = "bandpass" } = {}) {
  if (!noiseBuf) {
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
  s.buffer = noiseBuf;
  f.type = type;
  f.Q.value = q;
  f.frequency.setValueAtTime(freq, at);
  if (to) f.frequency.exponentialRampToValueAtTime(to, at + dur);
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(vol, at + Math.min(0.02, dur / 3));
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  s.connect(f).connect(g).connect(master);
  s.start(at, Math.random() * 0.5);
  s.stop(at + dur + 0.02);
}

/* ---------- the sounds ---------- */
// one click of the knob's ratchet
let lastTick = 0;
export function tick(soft) {
  if (!live()) return;
  const now = ctx.currentTime;
  if (now - lastTick < 0.028) return;
  lastTick = now;
  noise(now, 0.025, { vol: soft ? 0.05 : 0.12, freq: 3200, q: 4 });
  tone(1900, now, 0.02, { type: "triangle", vol: soft ? 0.015 : 0.035 });
}

// the wheel whirring round and clicking to a stop, over `secs`
export function spin(secs = 2.4) {
  if (!live()) return;
  const t0 = ctx.currentTime;
  noise(t0, secs * 0.8, { vol: 0.06, freq: 500, to: 200, q: 0.6 });
  // clicks that slow down the way the wheel does (its ease-out curve)
  let t = 0, gap = 0.03;
  while (t < secs) {
    noise(t0 + t, 0.02, { vol: 0.09, freq: 2600, q: 5 });
    t += gap;
    gap *= 1.09;
  }
  tone(140, t0 + secs - 0.05, 0.12, { vol: 0.12 });
}

// the screen swinging over
export function swoosh(secs = 1) {
  if (!live()) return;
  noise(ctx.currentTime, secs, { vol: 0.09, freq: 300, to: 2400, q: 0.7 });
}

// a fat knob clunk: the dial's locked in
export function lock() {
  if (!live()) return;
  const now = ctx.currentTime;
  tone(180, now, 0.18, { vol: 0.35, to: 60 });
  noise(now, 0.06, { vol: 0.15, freq: 900, q: 1 });
}

// someone's clue has landed
export function clue() {
  if (!live()) return;
  const now = ctx.currentTime;
  tone(660, now, 0.12, { type: "triangle", vol: 0.12 });
  tone(990, now + 0.07, 0.16, { type: "triangle", vol: 0.1 });
}

// it's your go as the psychic
export function yourTurn() {
  if (!live()) return;
  const now = ctx.currentTime;
  [523, 659, 784].forEach((f, i) => tone(f, now + i * 0.09, 0.22, { type: "triangle", vol: 0.13 }));
}

// a drumroll while the screen opens
export function drumroll(secs) {
  if (!live()) return;
  const t0 = ctx.currentTime;
  for (let t = 0; t < secs; t += 0.045) {
    const swell = 0.04 + 0.12 * (t / secs);
    noise(t0 + t, 0.05, { vol: swell, freq: 180, q: 0.9, type: "lowpass" });
  }
}

// the score, in sound: a sad slide for nothing, more bells for more points
export function points(n) {
  if (!live()) return;
  const now = ctx.currentTime;
  if (!n) {
    tone(330, now, 0.35, { type: "sawtooth", vol: 0.07, to: 160 });
    tone(250, now + 0.28, 0.5, { type: "sawtooth", vol: 0.07, to: 110 });
    return;
  }
  const notes = n === 4 ? [523, 659, 784, 1047, 1319] : n === 3 ? [523, 659, 784] : [523, 659];
  notes.forEach((f, i) => tone(f, now + i * 0.08, 0.5, { type: "triangle", vol: 0.16 }));
  if (n === 4) for (let i = 0; i < 8; i++) tone(2000 + Math.random() * 2000, now + 0.4 + i * 0.05, 0.12, { vol: 0.04 });
}

// the side call: a right call, or a wrong one
export function side(right) {
  if (!live()) return;
  const now = ctx.currentTime;
  if (right) { tone(880, now, 0.14, { type: "square", vol: 0.05 }); tone(1175, now + 0.09, 0.2, { type: "square", vol: 0.05 }); }
  else tone(220, now, 0.25, { type: "square", vol: 0.05, to: 180 });
}

// the end of the game
export function fanfare() {
  if (!live()) return;
  const now = ctx.currentTime;
  const seq = [[523, 0], [523, 0.12], [523, 0.24], [659, 0.4], [784, 0.62], [659, 0.8], [784, 0.92], [1047, 1.1]];
  for (const [f, t] of seq) {
    tone(f, now + t, t > 1 ? 0.9 : 0.2, { type: "square", vol: 0.05 });
    tone(f / 2, now + t, t > 1 ? 0.9 : 0.2, { type: "triangle", vol: 0.1 });
  }
}

/* ---------- Frequency's radio ---------- */
// scanning the band: static, and a whistle sliding up and down the dial
export function scan(secs = 2.4) {
  if (!live()) return;
  const t0 = ctx.currentTime;
  noise(t0, secs, { vol: 0.07, freq: 2400, q: 0.4, to: 900 });
  const o = ctx.createOscillator(), g = ctx.createGain(), lfo = ctx.createOscillator(), lg = ctx.createGain();
  o.type = "sine";
  o.frequency.setValueAtTime(700, t0);
  for (let k = 1; k <= 6; k++) o.frequency.linearRampToValueAtTime(k % 2 ? 1900 : 500, t0 + (secs * k) / 7);
  o.frequency.exponentialRampToValueAtTime(880, t0 + secs);
  lfo.frequency.value = 9; lg.gain.value = 40;
  lfo.connect(lg).connect(o.frequency);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(0.03, t0 + 0.1);
  g.gain.setValueAtTime(0.03, t0 + secs - 0.3);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + secs);
  o.connect(g).connect(master);
  o.start(t0); lfo.start(t0);
  o.stop(t0 + secs + 0.05); lfo.stop(t0 + secs + 0.05);
  tone(1320, t0 + secs - 0.05, 0.12, { type: "square", vol: 0.04 });   // locked on
}

// a burst of static, as the screen of noise clears or comes back
export function hiss(secs = 0.9) {
  if (!live()) return;
  noise(ctx.currentTime, secs, { vol: 0.12, freq: 3000, q: 0.3, type: "highpass" });
}

// two beeps: a transmission going out, or the dial locked in
export function beep(high) {
  if (!live()) return;
  const now = ctx.currentTime;
  tone(high ? 1175 : 880, now, 0.09, { type: "square", vol: 0.05 });
  tone(high ? 1568 : 1175, now + 0.11, 0.12, { type: "square", vol: 0.05 });
}
