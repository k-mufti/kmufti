# Deploying kmufti-hub

The whole site is **static files** except one small **Node backend** (the
wishlist's link-scraper + image proxy). No database — the draw canvas and the
wishlist both persist in the visitor's browser (`localStorage`).

## What runs where

| Part | Type | Notes |
|------|------|-------|
| Hub (`/`) | static | draw canvas launcher |
| Larprady (`/jeoprady/`) | static | loads `boards.json`, `categories.json`, `modern_categories.json` |
| Wishlist frontend (`/wishlist/`) | static | |
| Wishlist backend | **Node** (`wishlist/server.js`) | serves `/wishlist/api/unfurl` + `/wishlist/api/img` on port 8021 |

## One-time server setup

1. **Clone** into the web root:
   ```bash
   sudo git clone https://github.com/k-mufti/kmufti.git /var/www/kmufti-hub
   ```

2. **Node** (v16+ is plenty; the backend has zero npm dependencies):
   ```bash
   node --version   # install via your distro / nvm if missing
   ```

3. **Backend service** (auto-starts on boot, restarts on crash):
   ```bash
   sudo cp /var/www/kmufti-hub/deploy/kmufti-wishlist.service /etc/systemd/system/
   # edit the file if your node path or web root differ (see comments inside)
   sudo systemctl daemon-reload
   sudo systemctl enable --now kmufti-wishlist
   sudo systemctl status kmufti-wishlist   # should be "active (running)"
   ```

4. **nginx**:
   ```bash
   sudo cp /var/www/kmufti-hub/deploy/nginx.conf /etc/nginx/sites-available/kmufti
   # edit server_name / root to match yours
   sudo ln -s /etc/nginx/sites-available/kmufti /etc/nginx/sites-enabled/
   sudo nginx -t && sudo systemctl reload nginx
   ```

5. **HTTPS** (Let's Encrypt):
   ```bash
   sudo certbot --nginx -d kmufti.com -d www.kmufti.com
   ```

6. **DNS**: point `kmufti.com` (and `www`) at your VPS IP (A / AAAA records).

## Updating (your git-pull workflow)

```bash
cd /var/www/kmufti-hub
sudo git pull
# ONLY if wishlist/server.js changed:
sudo systemctl restart kmufti-wishlist
```

Static changes are live immediately. When you edit a CSS/JS file, bump its
`?v=` in the referencing HTML so browsers fetch the new one.

## Notes / gotchas

- **`/api/*` are open endpoints.** They fetch arbitrary URLs on the visitor's
  behalf. `server.js` has an SSRF guard (blocks internal/localhost addresses),
  which is the key protection. Optionally add nginx rate-limiting on
  `/wishlist/api/`.
- The unfurl endpoint falls back to **Microlink** (a free external API with
  rate limits) when its own scrape is blocked.
- `jeoprady/JEOPARDY_CSV.csv` is **git-ignored** — it's only used by
  `build_boards.py` to regenerate the JSON, which the live site doesn't need.
