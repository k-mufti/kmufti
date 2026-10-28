# Table assets

Photographed surfaces for the dice table, all from
[Poly Haven](https://polyhaven.com) under CC0 (public domain, no credit
required — credited anyway).

| File | What it is | Source |
|---|---|---|
| `velour_velvet_nor_gl_1k.jpg`, `velour_velvet_rough_1k.jpg` | The felt's surface (bumps + roughness only; the blue is ours) | [Velour Velvet](https://polyhaven.com/a/velour_velvet) |
| `black_walnut_veneer_01_*_1k.jpg` | Rails, tray base and the table, stained near-black under lacquer | [Black Walnut Veneer 01](https://polyhaven.com/a/black_walnut_veneer_01) |

All 1k. `dice3d.js` loads them by name; any that fail to load are skipped and
the table falls back to its generated textures. The room the dice reflect
is no longer a photo: `nightCityEquirect()` in `dice3d.js` paints it.
