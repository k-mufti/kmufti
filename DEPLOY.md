# Deploying kmufti-hub

The whole site is **static files** except three small **Node backends** (the
wishlist scraper, the White Canvas pixel wall, and the Jigsaw table). No
database — each backend keeps its own state in a file, and everything else
persists in the visitor's browser (`localStorage`).

## What runs where

| Part | Type | Notes |
|------|------|-------|
| Hub (`/`) | static | the launcher board |
| Larprady (`/jeoprady/`) | static | loads `boards.json`, `categories.json`, `modern_categories.json` |
| Meccha Chameleon (`/chameleon/`) | static | daily puzzle from `daily.json` |
| Lost in Translation (`/translate/`) | static | pre-built `puzzles.json` |
| Wishlist (`/wishlist/`) | static + **Node** (`wishlist/server.js`) | `/wishlist/api/unfurl` + `/wishlist/api/img` on port 8021 |
| White Canvas (`/white-canvas/`) | static + **Node** (`draw/server.js`) | SSE stream on port 8022; grid in `/var/lib/kmufti-draw/canvas.bin` |
| Jigsaw (`/puzzle/`) | static + **Node** (`puzzle/server.js`) | WebSocket table on port 8023; state in `/var/lib/kmufti-puzzle/` |

The hub's visit count is served by the **Jigsaw** backend (`GET`/`POST`
`/puzzle/api/visits`) rather than a service of its own: nginx already forwards
`/puzzle/api/` there, so the counter needed no fourth port and no new proxy
rule. The total lives in `visits.json` next to the shelf — in production that
is `/var/lib/kmufti-puzzle/visits.json`, outside the repo. It counts opens,
not people, and records nothing about a visitor. If that backend is down the
hub simply doesn't show the line.

The White Canvas backend lives in `draw/` — the canvas used to sit behind the
launcher tiles before it became its own project, and the folder name stuck.

## One-time server setup

1. **Clone** into the web root:
   ```bash
   sudo git clone https://github.com/k-mufti/kmufti.git /var/www/kmufti-hub
   ```

2. **Node** (v16+ is plenty; the backends have zero npm dependencies):
   ```bash
   node --version   # install via your distro / nvm if missing
   ```

3. **Wishlist service** (auto-starts on boot, restarts on crash):
   ```bash
   sudo cp /var/www/kmufti-hub/deploy/kmufti-wishlist.service /etc/systemd/system/
   # edit the file if your node path or web root differ (see comments inside)
   sudo systemctl daemon-reload
   sudo systemctl enable --now kmufti-wishlist
   sudo systemctl status kmufti-wishlist   # should be "active (running)"
   ```

4. **White Canvas service** (the shared pixel wall):
   ```bash
   sudo mkdir -p /var/lib/kmufti-draw && sudo chown www-data:www-data /var/lib/kmufti-draw
   sudo cp /var/www/kmufti-hub/deploy/kmufti-draw.service /etc/systemd/system/
   sudo systemctl daemon-reload
   sudo systemctl enable --now kmufti-draw
   ```

5. **Jigsaw service** (the shared puzzle table):
   ```bash
   sudo mkdir -p /var/lib/kmufti-puzzle && sudo chown www-data:www-data /var/lib/kmufti-puzzle
   sudo cp /var/www/kmufti-hub/deploy/kmufti-puzzle.service /etc/systemd/system/
   sudo systemctl daemon-reload
   sudo systemctl enable --now kmufti-puzzle
   ```

6. **nginx**:
   ```bash
   sudo cp /var/www/kmufti-hub/deploy/nginx.conf /etc/nginx/sites-available/kmufti
   # edit server_name / root to match yours
   sudo ln -s /etc/nginx/sites-available/kmufti /etc/nginx/sites-enabled/
   sudo nginx -t && sudo systemctl reload nginx
   ```

7. **HTTPS** (Let's Encrypt):
   ```bash
   sudo certbot --nginx -d kmufti.com -d www.kmufti.com
   ```

8. **DNS**: point `kmufti.com` (and `www`) at your VPS IP (A / AAAA records).

## Updating (your git-pull workflow)

From your Mac, `./deploy.sh "what you changed"` commits, pushes, and pulls on
the server. Or by hand:

```bash
cd /var/www/kmufti-hub
sudo git pull
```

Then restart a service **only** if its own `server.js` changed:

```bash
sudo systemctl restart kmufti-wishlist   # wishlist/server.js
sudo systemctl restart kmufti-draw       # draw/server.js
sudo systemctl restart kmufti-puzzle     # puzzle/server.js
```

Adding a puzzle needs no restart — `puzzle/puzzles.json` is re-read at every
changeover.

Static changes are live immediately. When you edit a CSS/JS file, bump its
`?v=` in the referencing HTML so browsers fetch the new one.

## Notes / gotchas

- **The wishlist `/api/*` routes are open endpoints.** They fetch arbitrary
  URLs on the visitor's behalf. `server.js` has an SSRF guard (blocks
  internal/localhost addresses), which is the key protection. Optionally add
  nginx rate-limiting on `/wishlist/api/`.
- The unfurl endpoint falls back to **Microlink** (a free external API with
  rate limits) when its own scrape is blocked.
- **White Canvas needs `proxy_buffering off`** on `/draw/api/`, or nginx holds
  back the SSE stream and pixels arrive in bursts (or not at all). It's already
  in `deploy/nginx.conf`.
- **Jigsaw needs the WebSocket block in `deploy/nginx.conf`.** Without the
  `Upgrade`/`Connection` headers on `/puzzle/api/socket` the table never
  connects and every visitor sits on "reconnecting…".
- **Runtime state lives outside the repo** — `/var/lib/kmufti-draw/canvas.bin`
  and `/var/lib/kmufti-puzzle/` — so a `git pull` can't wipe the drawing or a
  puzzle in progress. Back these up if you care about them.
- **The White Canvas has no wipe route.** The server exposes nothing that can
  blank the grid, so the wall is permanent by design and no misconfiguration
  can lose it. To reset it deliberately:
  ```bash
  sudo systemctl stop kmufti-draw
  sudo rm /var/lib/kmufti-draw/canvas.bin
  sudo systemctl start kmufti-draw
  ```
- `jeoprady/JEOPARDY_CSV.csv` is **git-ignored** — it's only used by
  `build_boards.py` to regenerate the JSON, which the live site doesn't need.
