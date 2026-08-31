# kmufti.com

A little hub of small projects — [kmufti.com](https://kmufti.com).

Everything here is hand-written HTML, CSS and vanilla JS. No build step, no
framework, no npm dependencies. The landing page is a launcher board of tiles;
each tile is a self-contained app living in its own folder.

## The projects

| Path | What it is |
|------|------------|
| **`/`** | The launcher: tiles on a mounting board, with a DVD-screensaver bouncing behind them. |
| **`/puzzle/`** | **Jigsaw** — one shared jigsaw puzzle. Everyone works the same table at once, you watch each other drag pieces, and a finished puzzle is shelved and replaced automatically. |
| **`/jeoprady/`** | **Larprady!** — a multi-team Jeopardy game with 600 real episodes plus a custom board builder and a library of original modern/nostalgia categories. |
| **`/wishlist/`** | **Wishlist** — paste a product link (or use the **+ wish** bookmarklet) and it unfurls into a draggable cutout on a scrapbook board, with a shopping cart and a shareable list. |
| **`/chameleon/`** | **Meccha Chameleon** — a blank figure is hiding in today's photo, blended into it. Find it fast; your time and click count are the only score. One a day. |
| **`/white-canvas/`** | **White Canvas** — a shared r/place-style pixel wall. Everyone draws on the same 180×300 grid, live, and every pixel stays. |
| **`/translate/`** | **Lost in Translation** — a phrase appears in a mystery language. Guess what it means, and name the language for bonus points. |

## Architecture

Mostly static files. Three small zero-dependency Node backends do the live bits:

| Backend | Port | Does |
|---------|------|------|
| `wishlist/server.js` | 8021 | Link unfurling (title/image/price scrape) + an image proxy, with an SSRF guard. |
| `draw/server.js` | 8022 | The White Canvas pixel wall — authoritative grid, snapshot + deltas over Server-Sent Events. Read/paint only; there is no wipe route, so the wall is permanent. |
| `puzzle/server.js` | 8023 | The Jigsaw table — piece positions and presence over a hand-rolled WebSocket. |

`draw/server.js` is the backend for `/white-canvas/` — the canvas used to live
behind the launcher tiles, and the folder name stuck.

In production nginx serves the static files and proxies `/wishlist/api/`,
`/draw/api/` and `/puzzle/api/` to those three. Runtime state lives outside the
repo (`/var/lib/kmufti-puzzle/`) so a `git pull` can't wipe a puzzle in
progress. Everything else that persists — wishlist boards, game stats — is in
the visitor's `localStorage`.

## Repo layout

```
index.html  styles.css  app.js   the launcher page
projects.js                      the tile list (one object per project)
artwork.js                       tile artwork, drawn in code
<project>/                       one folder per app, each self-contained
draw/server.js                   white-canvas backend (no frontend of its own)
deploy/                          nginx.conf + three systemd units
deploy.sh                        commit, push, pull on the VPS
```

## Running it locally

The static pages need any file server, from the repo root:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>. The frontends detect localhost and talk to
the backends on their own ports, so start whichever ones you need:

```bash
node wishlist/server.js   # 8021
node draw/server.js       # 8022
node puzzle/server.js     # 8023
```

Node 16+ is plenty — there is nothing to `npm install`.

## Adding things

**A project.** Add one object to `projects.js` (`slug`, `title`,
`description`, `tags`, `accent`, `accentBg`, `href`, `status`) and the tile
renders itself. Give it artwork in `artwork.js` keyed by the same slug.

**A puzzle.** Drop an image in `puzzle/images/` and add a row to
`puzzle/puzzles.json`. The piece grid and image dimensions are worked out from
the file, and a running table picks it up at the next changeover — no restart.

**Jeopardy boards.** `jeoprady/build_boards.py` regenerates `boards.json` and
`categories.json` from `JEOPARDY_CSV.csv`. That CSV is git-ignored; the
generated JSON is committed and is all the live game needs.

Static edits are live on the next pull. When you change a CSS or JS file, bump
its `?v=` in the referencing HTML so browsers fetch the new one.

## Deploying

```bash
./deploy.sh "what you changed"
```

Commits, pushes, and pulls on the VPS. Restart a systemd unit only when its
`server.js` changed. See [DEPLOY.md](DEPLOY.md) for the full VPS + nginx
setup.
