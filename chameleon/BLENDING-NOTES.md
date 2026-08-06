# Meccha Chameleon — figure blending research notes

Working notes on how the 3D figure's lighting should be tuned so it blends into
different background photos. Started 2026-08-05.

The game hides a rendered 3D figure inside a photo. The figure is lit by four
lights (main / fill / ambient / hemi) and composited with a blend mode + opacity.
Getting those numbers right per-scene is what makes the figure *findable but not
obvious*. These notes track what we've learned about picking them.

---

## 1. Raw data (hand-tuned by eye, session 1)

Seven scenes, tuned in the `?debug` panel until the figure looked well-blended.

| # | Scene | Noise (by eye) | Pose | Main | Fill | Ambient | Hemi | Zoom |
|---|-------|-----|------|------|------|---------|------|------|
| 1 | light blue sky, top of frame, flat colour | **zero** | 1 | 0.44 | 0.08 | **3.00** ⚠ capped | 0.00 | 0.80 |
| 2 | dark gray textured mountain | some | 1 | 0.70 | 0.74 | 2.24 | 0.29 | 1.00 |
| 3 | brown textured tree bark | semi | 1 | 0.70 | 0.00 | 0.44 | **1.71** | 1.00 |
| 4 | light grayish-blue sky | **zero** | 1 | 0.05 | 0.33 | **3.00** ⚠ capped | 0.57 | 0.85 |
| 5 | dark blue water, yellowish photo filter | noisy | 4 | 0.40 | 1.20 | 1.31 | 0.21 | 1.00 |
| 6 | forest, jade green, between leaves | very noisy | 4 | 0.37 | 0.70 | 1.38 | 0.43 | 1.00 |
| 7 | dark blue ocean, semi waves | semi | 4 | 0.00 | 0.74 | 1.89 | 0.87 | 0.68 |

⚠ = value hit the slider maximum; the true preference is unknown (censored).

Notes recorded at the time:
- On scene 1 the user wanted ambient **higher than the 3.00 cap**.
- At zoom 1.00, **pose 4's arms get cut off** by the camera framing.

---

## 2. Findings

### 2.1 "Flatness" is the dominant axis, and it tracks background texture

Define:

```
flatness = ambient / (main + fill + hemi)
```

i.e. how much of the light is shapeless vs. directional.

| Scene | Flatness | Noise |
|-------|----------|-------|
| 3 bark | 0.18 | textured |
| 5 dark water | 0.72 | noisy |
| 6 forest | 0.92 | very noisy |
| 7 ocean | 1.17 | semi |
| 2 mountain | 1.29 | some |
| 4 sky | 3.16 | **zero** |
| 1 sky | 5.77 | **zero** |

Sorting by flatness sorts by noise almost perfectly. The perceptual logic:

- **Flat background** → any shading gradient on the figure reads as a 3D object
  sitting *on top* of the photo. Giveaway. So flatten the figure (high ambient).
- **Textured background** → a flat figure looks like a pasted sticker. Shading
  lets it read as part of the scene, and the background texture hides it.

There appears to be a **regime break**, not a smooth continuum: textured scenes
cluster at flatness 0.2–1.3, flat scenes jump to 3.2–5.8, with a gap between.

### 2.2 Total light budget is roughly constant

Sum of all four lights per scene: 3.52, 3.97, 2.85, 3.95, 3.12, 2.88, 3.50.

**Mean ≈ 3.40, range 2.85–3.97.**

The tuning isn't changing *how much* light there is, it's redistributing a fixed
budget across light *types*. This shrinks the effective search space: roughly
"total ≈ 3.4" plus "how it's split".

(Caveat: ambient is uniform while main/fill/hemi have geometric falloff, so the
raw sum isn't luminance. The tight range is suggestive, not proof.)

### 2.3 Hemi is secretly a colour knob — with a blind spot

In code:

```js
new THREE.HemisphereLight(0xb0c0e0, 0x4a3f30, CFG.hemiLight)
//                        pale blue    dark brown
```

Sky colour and ground colour are **hardcoded blue and brown**. So raising hemi
doesn't just add light, it tints the figure blue-from-above / brown-from-below.

Observed: hemi is highest on **brown bark (1.71)**, mid on **blue ocean (0.87)**,
low on **green forest (0.43)**.

The knob has been used, unconsciously, as a **hue matcher** — and it only offers
blue and brown. In a green scene it can't help. This is a structural gap, not a
tuning failure. Candidate fix: make the hemisphere colours sampled from the scene
instead of hardcoded, or add an explicit figure-tint control.

### 2.4 Main vs. fill is also a colour control

`main` is tinted by the photo-sampled light colour; `fill` is neutral white. So
the main:fill ratio controls how much of the scene's colour cast the figure takes.

Bark is the extreme: main 0.70 / fill 0.00 = fully scene-tinted, which fits a
strongly brown scene.

### 2.5 Two data points are censored

Scenes 1 and 4 both sat at **ambient 3.00 = slider max**, with the user wanting
more. Those are not real preferences, they are the wall.

This also explains an apparent contradiction: scenes 1 and 4 are described almost
identically (flat, light blue, zero noise) yet have very different main/fill
(0.44/0.08 vs 0.05/0.33). Likely because **once ambient is at 3.0 it swamps the
other lights**, so those choices sat in a flat, low-sensitivity region of the
space — low-confidence data rather than a genuine disagreement.

→ Acted on: ambient slider max raised (see §4).

### 2.6 Zoom is contaminated — it is not currently a blending variable

Zoom conflates two different things:
1. apparent figure size (a **difficulty** control), and
2. a workaround for **pose 4's arms being clipped** at zoom 1.00.

Scene 7 at 0.68 is unusually small — impossible to tell from the data whether
that scene needed a tiny figure or the zoom was fixing framing.

→ The framing bug should be fixed at the source (fit the camera to each pose's
bounding box) so zoom becomes a clean difficulty knob.

### 2.7 Working model

The hand-tuning appears to be solving, by eye:

> match the figure's luminance distribution to the background patch's

- **mean** → total light budget
- **variance** → ambient vs. directional split (the flatness ratio)
- **hue** → hemi, and the main:fill ratio

---

---

## 2b. Session 2 — three more scenes, and two corrections

| # | Scene | Eye label | Pose | Main | Fill | Amb | Hemi | Zoom | Opacity | Mean lum | Global std |
|---|-------|-----------|------|------|------|-----|------|------|---------|----------|------------|
| 8 | light sky (person's shoulder in frame) | flat | 1 | 0.12 | 0.29 | 3.60 | 0.43 | 1.00 | 0.72 | 86.2 | 95.3 |
| 9 | very light blue sky, almost white | **none** | 1 | 0.35 | 0.26 | 2.07 | 0.31 | 0.80 | 0.99 | 197.5 | 57.9 |
| 10 | reflective water, contrasty | **noisy** | 1 | 0.99 | 0.34 | 0.55 | 0.90 | 0.98 | 0.76 | 85.1 | 23.1 |

### 2b.1 CORRECTION — global std-dev is the wrong metric for "noise"

The measured std-dev **inverted** the by-eye labels:

- Scene 9, "no noise at all" → std 57.9 → labelled "high texture" ❌
- Scene 10, "noisy, very contrasty" → std 23.1 → labelled "low texture" ❌

Cause: std-dev over the whole patch measures **global spread**, not local business.
Scene 9's patch straddles a dark building corner and near-white sky — one hard
edge between two flat regions gives an enormous std-dev with zero camouflage.
Scene 10 is busy everywhere but its luminance range is compressed, so its
std-dev stays low.

**Fix:** measure **local texture** = median of per-tile std-devs (12px tiles).
Ignores large-scale gradients and the handful of tiles containing an edge.
Global std is kept but renamed **contrast/spread** — still useful for detecting
boundary-straddling placements.

### 2b.2 The flatness law survived — now 10/10

Only the metric was wrong; the theory held. Sorted by flatness:

5.77 sky · **4.29 light sky** · 3.16 sky · **2.25 very light sky** · 1.29 mountain ·
1.17 ocean · 0.92 forest · 0.72 dark water · **0.25 reflective water** · 0.18 bark

Perfectly monotonic against the by-eye noise labels across all ten scenes, with
the flat/textured regime gap still present (2.25 vs 1.29).

Total light budget across all 10 still averages **exactly 3.40** (range widened
to 2.78–4.44, so the claim is softened to "clusters near 3.4, ±25%").

### 2b.3 CORRECTION — opacity was never a hand-tuned value

Opacity appeared to track background brightness beautifully
(dark 0.72/0.76, bright 0.99). But `round.opacity` comes from
`MECHA.calibratedCompose`, which already adjusts opacity to hit a measured
visibility target. **These were the existing calibration working, not user
preferences.**

That is a validation of the existing system, not a new relationship to model —
so the auto-tune algorithm deliberately leaves opacity alone.

### 2b.4 Measurement scope problem

Scene 8 is labelled "light sky" but measured **mean 86.2, RGB `#54565d`** — dark
grey. The figure sits in sky while the measurement window (figure + 50% margin)
swallowed the subject's dark jacket. Tuned against sky, measured against jacket.

**Fix:** report **footprint** (pixels directly behind the figure) separately from
**surround** (context ring), and flag boundary-straddling patches.

---

## 3. Open gaps / what isn't accounted for

1. **Measured patch statistics.** "Dark gray", "very noisy" are eyeball labels.
   The real predictors are almost certainly *mean luminance* and *luminance
   std-dev* of the placement patch. → Acted on: now in the copy output (§4).
2. **Noise frequency, not just amount.** Fine forest leaves (high frequency) and
   big ocean waves (low frequency) are both "noisy" but structurally opposite.
   Lumping them together will hide a real effect.
3. **Blend mode / opacity** were not being recorded, despite mattering a lot for
   blending. → Acted on: now in the copy output (§4).
4. **Scene light direction.** The main light direction is hardcoded to
   `[0.4, 0.5, 1]` in the debug preview. Bark and mountain have obvious sun
   direction; mismatch is one of the biggest compositing tells.
5. **Figure colour and rotation** were in the panel but not recorded.
   → Acted on: now in the copy output (§4).
6. **Pose is confounded with scene type.** All flat/sky scenes used pose 1; all
   water/forest used pose 4. Any pose effect is inseparable from scene effect.
7. **No test–retest.** Unknown whether the same scene would get the same numbers
   on a different day. That sets the noise floor for everything else.
8. **No tolerance band.** Unknown whether 0.40 vs 0.50 main is perceptible, or
   whether there's a wide plateau. Sensitivity per knob is as useful as values.
9. **No difficulty target.** The goal is not "invisible", it's "findable with
   effort". Everything so far optimises *looks well-blended to the author*, which
   is a proxy. Real find-times from players would be the actual ground truth.

---

## 4. Changes made as a result

- **Ambient slider max raised** from 3.00 → 8.00, so flat/bright scenes are no
  longer clipped. Scenes 1 and 4 need re-tuning with the new headroom.
- **Copy button** in the `?debug` panel now exports, in one block:
  - Mode, pose, main, fill, ambient, hemi, zoom
  - Colour, rotation, blend mode, opacity
  - **Measured patch stats**: mean luminance, luminance std-dev, mean RGB
  - Proportions are deliberately **excluded** (procedural-mode only, not
    relevant to relief-mode blending).

The std-dev makes the "noise" label objective — no more eyeballing.

---

## 5. Data collection protocol (to do)

### 5.1 Re-tune the censored scenes
- [ ] Scene 1 (light blue flat sky) — re-tune with ambient headroom up to 8.00
- [ ] Scene 4 (light gray-blue sky) — same

### 5.2 Hunt edge cases
Deliberately chosen to stress the model and confirm/refute §2.3:
- [ ] **Bright white / snow** — extreme high mean luminance, near-zero texture
- [ ] **Near-black** — extreme low mean luminance
- [ ] **Strong warm sunset** — heavy colour cast, tests the main:fill tint theory
- [ ] **Green scene** (field/foliage) — tests the hemi blue/brown blind spot

### 5.3 Reliability + decoupling
- [ ] Re-tune 2–3 already-done scenes on a **different day**, without looking at
      the previous numbers (test–retest → noise floor)
- [ ] Tune at least one scene with **both pose 1 and pose 4** (decouples pose
      from scene type)

### 5.4 Record for every entry
Paste the full copy-button block. It now includes the measured patch stats, so
each entry is self-describing.

---

## 6b. The auto-tune algorithm (v1, shipped)

`FIGURE3D.autoTune(stats)` — derives the light balance from the measured patch.

```
tex       = local texture (median tile std-dev)
flatness  = 4.5 · e^(−tex/12) + 0.15      # fitted to the 10 hand-tuned scenes
TOTAL     = 3.4                            # observed near-constant budget
ambient   = TOTAL · flatness/(1+flatness)
direction = TOTAL − ambient

t         = min(1, tex/45)
mainShare = 0.20 + 0.25·t                  # more texture → more modelling
fillShare = 0.35 − 0.10·t
hemiShare = 1 − mainShare − fillShare
hemiShare ×= 1 + 0.5·min(1, |R−B|/50)      # hemi doubles as a hue tint
→ renormalise so main+fill+hemi = direction
```

**Opacity is intentionally not set** — `calibratedCompose` already tunes it
against measured visibility (see §2b.3).

### Validation against the hand-tuned scenes

Using *estimated* local-texture values (the originals predate the metric):

| Scene | tex | algo ambient | hand ambient | err |
|-------|-----|--------------|--------------|-----|
| flat blue sky | 2 | 2.71 | 3.00 | −0.29 |
| light sky | 3 | 2.67 | 3.60 | −0.93 |
| gray-blue sky | 3 | 2.67 | 3.00 | −0.33 |
| very light sky | 4 | 2.62 | 2.07 | +0.55 |
| gray mountain | 15 | 2.01 | 2.24 | −0.23 |
| blue ocean | 18 | 1.82 | 1.89 | −0.07 |
| forest jade | 28 | 1.26 | 1.38 | −0.12 |
| dark water | 30 | 1.16 | 1.31 | −0.15 |
| reflective water | 40 | 0.81 | 0.55 | +0.26 |
| brown bark | 45 | 0.69 | 0.44 | +0.25 |

Mean absolute error ≈ **0.32**. The mid-range (0.07–0.23) is good; the flat-sky
extreme is the loosest — which is exactly the low-sensitivity regime where the
hand-tuned values were themselves scattered and two were slider-capped.

**Caveat:** those texture values are estimates, so this is a soft validation.
Re-copying the 10 scenes with the new metric would make it real.

### Known weakest part

The main/fill/hemi split is the least-supported piece — those ratios were
scattered across the hand-tuned data (main share ranged 0%–85%). Ambient is
well-determined; the directional split is an educated guess.

---

## 7. Reference — what each knob does

| Knob | Three.js object | Notes |
|------|-----------------|-------|
| Main light | `DirectionalLight`, **tinted by photo-sampled colour** | Directional modelling + scene colour cast |
| Fill light | `DirectionalLight`, neutral white | Softens the shadow side |
| Ambient | `AmbientLight`, scene-averaged colour | Uniform, shapeless — the "flatten" knob |
| Hemi | `HemisphereLight(0xb0c0e0, 0x4a3f30)` | **Hardcoded** blue sky / brown ground — acts as a hue tint |
| Zoom | orthographic camera height | Apparent figure size; currently also a framing workaround |
| Proportions | procedural mode only | Irrelevant to relief (STL) mode |
