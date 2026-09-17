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
| Ops dashboard (`/admin/`) | static + **Node** (`admin/server.js`) | **private.** Uptime, traffic and host health on port 8026, bound to localhost and behind an nginx password. History in `/var/lib/kmufti-admin` |

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

   Two things that bit on the way in, both worth knowing if you add a backend
   that serves files:

   - The photo location needs `^~`. The static-asset rule in the live config
     matches `.jpg`, and an nginx regex location beats a plain prefix one - so
     without it the JSON routes work (no extension) while the image bytes 404,
     which looks like a broken backend rather than a routing rule.
   - Pexels' `large` variant is 650px on the long edge, against a canvas that
     draws at 1200. The API reports the size of the *original*, so the file is
     measured after it lands and thrown away if it is too small to play on.

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

8. **Ops dashboard** (the private page at `/admin/`):
   ```bash
   sudo cp /var/www/kmufti-hub/deploy/kmufti-admin.service /etc/systemd/system/
   sudo systemctl daemon-reload
   sudo systemctl enable --now kmufti-admin
   ```

   Then give it a password — this is the only thing standing between the
   dashboard and the internet, so do it *before* the nginx step below:

   ```bash
   sudo apt install apache2-utils          # for htpasswd, once
   sudo htpasswd -c /etc/nginx/.kmufti-admin kareem
   sudo chown root:www-data /etc/nginx/.kmufti-admin && sudo chmod 640 /etc/nginx/.kmufti-admin
   ```

   After nginx is reloaded, **check the lock actually works**:

   ```bash
   curl -s -o /dev/null -w '%{http_code}\n' https://kmufti.com/admin/          # 401
   curl -s -o /dev/null -w '%{http_code}\n' https://kmufti.com/admin/admin.js  # 401, not 200
   ```

   The second one is the one that catches a mistake: without `^~` on the
   location, the static-asset regex wins and hands out the page's JS with no
   password (the same nginx rule that bit the chameleon photos). Two 401s and
   you're done.

   The service runs as `www-data` in the `adm` and `systemd-journal` groups,
   which is what lets it read the nginx access log and the units' journals.
   Drop either group and the dashboard still runs — it just says on the page
   that it can't see traffic, or that the **log** button is unavailable.

   The **restart** buttons on the service cards are off twice over. To turn
   them on, uncomment `ADMIN_ALLOW_RESTART=1` in the unit *and* allow exactly
   those five restarts, nothing else:

   ```bash
   sudo visudo -f /etc/sudoers.d/kmufti-admin
   # www-data ALL=(root) NOPASSWD: /usr/bin/systemctl restart kmufti-wishlist, \
   #   /usr/bin/systemctl restart kmufti-draw, /usr/bin/systemctl restart kmufti-puzzle, \
   #   /usr/bin/systemctl restart kmufti-yahtzee, /usr/bin/systemctl restart kmufti-chameleon
   ```

   Leaving it off is a perfectly good choice: `ssh` and `systemctl restart` is
   two lines of typing, and a web button that can restart services is a much
   bigger thing to get wrong than one that can only read.

9. **nginx**:
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

10. **HTTPS** (Let's Encrypt):
   ```bash
   sudo certbot --nginx -d kmufti.com -d www.kmufti.com
   ```

11. **DNS**: point `kmufti.com` (and `www`) at your VPS IP (A / AAAA records).

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
sudo systemctl restart kmufti-admin      # admin/server.js
```

Adding a puzzle needs no restart — `puzzle/puzzles.json` is re-read at every
changeover.

Static changes are live immediately. When you edit a CSS/JS file, bump its
`?v=` in the referencing HTML so browsers fetch the new one.

## Notes / gotchas

- **All three domains share one access log**, so the dashboard cannot tell a
  kmufti.com visitor from a kareemmuftee.com one until nginx writes the
  hostname down. One line in the `http` block of `/etc/nginx/nginx.conf` fixes
  it - a format that is `combined` with `$host` in front:

  ```nginx
  log_format hosted '$host $remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" "$http_user_agent"';
  access_log /var/log/nginx/access.log hosted;
  ```

  The dashboard reads both shapes, so nothing breaks in the changeover and the
  rotated `.gz` archive still parses - those older lines just have no host and
  are counted as kmufti.com, which is what they were being counted as anyway.
  After it, "where they went" lists kmufti's own projects by name and the other
  two domains by domain.
- **Days end at your midnight, not the box's.** The server runs UTC; `ADMIN_TZ`
  in the unit (default `America/Chicago`) is the zone every traffic day and
  hour is bucketed in, so "today" means since midnight where you are rather
  than since 7pm yesterday.

- **To rebuild the dashboard's traffic history, stop it before deleting the
  file.** The service writes its state on the way down, so `rm traffic.json &&
  systemctl restart` loses the race - the dying process puts the old file back
  and the new one starts from it. In this order it works:

  ```bash
  sudo systemctl stop kmufti-admin
  sudo rm -f /var/lib/kmufti-admin/traffic.json
  sudo systemctl start kmufti-admin
  ```

  Traffic totals are only ever derived from the nginx logs, so throwing the
  file away costs nothing - it re-reads the whole archive on the next start.
  `uptime.json` is the file that matters: nothing can rebuild a record of when
  the site was down, so leave that one alone.

- **The web root is a git checkout, so `/.git/` must be denied.** Without the
  dotfile `location` block in `deploy/nginx.conf`, `https://kmufti.com/.git/config`
  returns 200 and anyone can walk the whole history - and `/.git` is the single
  most-requested path in the access log, ahead of the hub itself. The rule
  excludes `.well-known` so certbot can still renew. Check it with:

  ```bash
  curl -s -o /dev/null -w '%{http_code}\n' https://kmufti.com/.git/config   # 403
  ```

- **The dashboard cannot tell you the site is down.** It runs on the box it
  watches, so if the box or its network goes, the dashboard goes with it and
  the last thing it ever showed you was green. Pair it with something outside:
  a free [Healthchecks.io](https://healthchecks.io) or
  [UptimeRobot](https://uptimerobot.com) monitor pointed at `https://kmufti.com/`
  every five minutes, mailing you when it stops answering. That one is the
  pager; `/admin/` is what you open *after* it goes off, to find out which
  part broke.
- **`/admin/` is not linked from anywhere** and nginx sends `X-Robots-Tag:
  noindex` for it. There is deliberately no `robots.txt` rule — a
  `Disallow: /admin/` line is a public sign saying the page exists, and the
  password already keeps crawlers out with a 401.
- **The dashboard stores no visitor data.** It reads the access log nginx
  writes anyway and turns each IP into a short one-way hash, which is only ever
  counted. Two salts: a **nightly** one behind every daily and 30-day figure,
  thrown away at midnight so one day's numbers cannot be linked to the next -
  and one **permanent** salt, in `/var/lib/kmufti-admin/visitors.json`, behind
  the single *unique viewers, all time* number, which cannot be counted at all
  without an identifier that outlives the night. Delete that file and the
  all-time count starts over; nothing else is affected. Requests to `/admin/` are skipped entirely, except the
  401s — somebody else trying the door shows up under Errors.

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
