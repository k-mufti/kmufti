# kmufti.com

A little hub of small projects.

- **`/`** — the landing page: a shared-style white canvas you can draw pixels on, with an app launcher.
- **`/jeoprady/`** — **Larprady!**, a multi-team Jeopardy game with real episodes + a custom board builder.
- **`/puzzle/`** — **Jigsaw**, one shared jigsaw puzzle. Everyone works the same
  table at once, you can watch each other drag pieces, and a finished puzzle is
  shelved and replaced automatically.
- **`/wishlist/`** — paste a product link (or use the **+ wish** bookmarklet) and it becomes a draggable cutout on a scrapbook board, with a shopping cart + shareable list.

Mostly static. Three small zero-dependency Node backends do the live bits:
`wishlist/server.js` (link previews + image proxy), `draw/server.js` (the shared
pixel wall, over SSE) and `puzzle/server.js` (the puzzle table, over a
hand-rolled WebSocket).

Adding a puzzle is a two-step job: drop an image in `puzzle/images/` and add a
row to `puzzle/puzzles.json`. Piece grid and image dimensions are worked out
from the file, and a running table picks it up at the next changeover.

See [DEPLOY.md](DEPLOY.md) for hosting on a VPS with nginx.








