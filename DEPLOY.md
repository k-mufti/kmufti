# Deploying kmufti-hub

The whole site is **static files** except three small **Node backends** (the
wishlist scraper, the White Canvas pixel wall, and the Jigsaw table). No
database — each backend keeps its own state in a file, and everything else
persists in the visitor's browser (`localStorage`).

## What runs where

| Part | Type | Notes |
|------|------|-------|
| Hub (`/`) | static | the launcher board |
| Jeoprady (`/jeoprady/`) | static | loads `boards.json`, `categories.json`, `modern_categories.json` |
| Meccha Chameleon (`/chameleon/`) | static + **Node** (`chameleon/server.js`) | daily puzzle from `daily.json` (static, in the repo); practice photos from Pexels on port 8025, cached in `/var/lib/kmufti-chameleon/photos` |
| Lost in Translation (`/translate/`) | static | pre-built `puzzles.json` |
| Wishlist (`/wishlist/`) | static + **Node** (`wishlist/server.js`) | `/wishlist/api/unfurl` + `/wishlist/api/img` on port 8021 |
| White Canvas (`/white-canvas/`) | static + **Node** (`draw/server.js`) | SSE stream on port 8022; grid in `/var/lib/kmufti-draw/canvas.bin` |
| Jigsaw (`/puzzle/`) | static + **Node** (`puzzle/server.js`) | WebSocket table on port 8023; state in `/var/lib/kmufti-puzzle/` |
| Yahtzee (`/yahtzee/`) | static + **Node** (`yahtzee/server.js`) | 1v1 matches over a WebSocket on port 8024. Nothing persisted — a match lives in memory, and solo-vs-bot works with the backend down |

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

5. **Meccha Chameleon service** (practice photos):
   ```bash
   sudo mkdir -p /var/lib/kmufti-chameleon/photos && sudo chown -R www-data:www-data /var/lib/kmufti-chameleon
   sudo cp /var/www/kmufti-hub/deploy/kmufti-chameleon.service /etc/systemd/system/
   sudo systemctl daemon-reload
   sudo systemctl enable --now kmufti-chameleon
   ```

   Photos come from Pexels, so the feature is off until a key is set. Put one
   in the unit (`sudo systemctl edit --full kmufti-chameleon`, uncomment
   `PEXELS_KEY`) and restart. Without a key there is no upstream call at all:
   the endpoint returns 503 and practice falls back to the photos in
   `chameleon/images/`. The **daily** photo never touches this service - it is
   in the repo, hand-picked and hand-placed - so the daily puzzle works even
   with the backend down.

   The pool fills itself in the background: a photo a minute while there is
   room, against a free tier of 200 an hour, so a practice round is served
   from what is already cached rather than waiting on the API. A 429 backs the
   fetching off for fifteen minutes. To see how it is doing:

   ```bash
   curl -s https://kmufti.com/chameleon/api/photo/stats
   ```

   Photos are served from our own origin rather than hotlinked, because the
   game samples pixels off the photo to blend the figure in and a cross-origin
   image would taint the canvas.

6. **Jigsaw service** (the shared puzzle table):
   ```bash
   sudo mkdir -p /var/lib/kmufti-puzzle && sudo chown www-data:www-data /var/lib/kmufti-puzzle
   sudo cp /var/www/kmufti-hub/deploy/kmufti-puzzle.service /etc/systemd/system/
   sudo systemctl daemon-reload
   sudo systemctl enable --now kmufti-puzzle
   ```

7. **Yahtzee service** (the 1v1 dice table):
   ```bash
   sudo cp /var/www/kmufti-hub/deploy/kmufti-yahtzee.service /etc/systemd/system/
   sudo systemctl daemon-reload
   sudo systemctl enable --now kmufti-yahtzee
   curl -s localhost:8024/api/health     # {"ok":true,...}
   ```
   No data directory: matches are in memory and a restart drops games in
   progress. That is the right trade for a fifteen-minute game and no database.

8. **nginx**:
   ```bash
   sudo cp /var/www/kmufti-hub/deploy/nginx.conf /etc/nginx/sites-available/kmufti
   # edit server_name / root to match yours
   sudo ln -s /etc/nginx/sites-available/kmufti /etc/nginx/sites-enabled/
   sudo nginx -t && sudo systemctl reload nginx
   ```

   **On the box as it actually stands**, this file is *not* what nginx is
   serving. The live config is `/etc/nginx/sites-available/default` (the only
   thing in `sites-enabled/`), and certbot has rewritten it to add the TLS
   listeners and the kareemmuftee.com blocks. `deploy/nginx.conf` is the
   reference copy, kept in step by hand.

   So to add a backend to the running server, do **not** copy this file over
   the top - that would throw away certbot's work. Paste the new `location`
   blocks into the kmufti.com server block in `default`, next to the other
   backends, then `sudo nginx -t && sudo systemctl reload nginx`. Take a dated
   backup of `default` first; `nginx -t` tells you before a reload can hurt.

9. **HTTPS** (Let's Encrypt):
   ```bash
   sudo certbot --nginx -d kmufti.com -d www.kmufti.com
   ```

10. **DNS**: point `kmufti.com` (and `www`) at your VPS IP (A / AAAA records).

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
sudo systemctl restart kmufti-chameleon  # chameleon/server.js
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
