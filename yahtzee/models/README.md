# Drop the die model here

One file, named exactly:

    die.glb

That's it. The game loads `yahtzee/models/die.glb`, clones it five times, and
throws the clones around a physics tray. If the file is missing the game falls
back to a procedurally generated rounded cube so nothing breaks.

## What the file needs to be

| | |
|---|---|
| **Format** | `.glb` (binary glTF 2.0) — textures embedded, not sidecar files |
| **Contents** | A single die. One mesh, or a small group; no scene extras, no camera, no lights, no animation |
| **Up axis** | Y-up (glTF's native). If you export from Blender or Z-up software, tick "+Y up" |
| **Origin** | Dead centre of the cube. The physics spins it around its own centre — an off-centre origin makes it wobble like a loaded die |
| **Size** | 1 unit across, i.e. corners at ±0.5. Not critical — it gets scaled — but being close keeps the shadows and bevels looking right |
| **Materials** | PBR (metallic/roughness). Baked-in normal or roughness maps are very welcome; that's most of what sells a close-up die |
| **Textures** | ≤ 2048×2048, embedded. Keep the whole file under ~4 MB |
| **Polys** | 5k–50k triangles is the happy range. It's rendered 5× with shadows |

## Pip orientation

The renderer decides which number is showing by checking which face points up,
so it needs a face map. **The die currently in this folder was measured by
rendering it, and its map is:**

    +X ... 6      -X ... 1
    +Y ... 2      -Y ... 5
    +Z ... 4      -Z ... 3

Opposite faces sum to 7 and the die is right-handed (standard Western), so this
is just a rotation of the usual layout — `dice3d.js` carries the map above as
`FACE_MAP` and needs no other adjustment.

If you ever swap in a different `die.glb`, re-measure rather than assume: render
it looking down each of the six axes and read the pips off. A die whose opposite
faces don't sum to 7, or which is left-handed, is a bad model — get another.

## Where to get one

Sketchfab, Poly Haven, Quaternius, CGTrader, or Kenney's asset packs. Check the
licence allows use on a public site; CC0 and CC-BY are both fine (CC-BY needs a
credit line, which goes in the game's about panel).

Drop the licence text next to it as `die.LICENSE.txt` if there is one.
