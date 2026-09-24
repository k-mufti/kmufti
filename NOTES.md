# kmufti.com — the things worth remembering

Everything you actually need day to day, in plain language. `DEPLOY.md` is the
long version for setting a server up from nothing; this is the short version
for running the one that already exists.

---

## 0. The single biggest source of confusion: there are two computers

Almost every mistake so far has been running the right command on the wrong
machine. They are:

| | **Your Mac** | **The server** |
|---|---|---|
| Prompt looks like | `karimmufti@Mac kmufti-hub %` | `ubuntu@vps-c678d550:~$` |
| Where the code is | `~/Desktop/kmufti-hub` | `/var/www/kmufti-hub` |
| You get there by | opening a terminal | `ssh ubuntu@15.204.244.251` |
| Commands that live here | `git`, `./deploy.sh` | `sudo systemctl ...` |

**`systemctl` only exists on the server.** If you see
`sudo: systemctl: command not found`, you are on the Mac.

**URLs go in a browser, never in a terminal.** If you see
`-bash: https://...: No such file or directory`, you pasted a web address into
a shell.

To avoid the whole problem, you can run a server command from the Mac in one
line by wrapping it in `ssh -t`:

```bash
ssh -t ubuntu@15.204.244.251 "sudo systemctl restart kmufti-chameleon"
```

The `-t` matters — without it the remote `sudo` can't prompt you for a
password.

---

## 1. Shipping a change

From the Mac, in the repo:

```bash
./deploy.sh "what you changed"
```

That commits everything, pushes to GitHub, and pulls it onto the server. Static
files (HTML/CSS/JS/JSON) are **live the moment it finishes**.

### When you must also restart something

Only if you changed that project's `server.js`. Static changes never need it.

```bash
ssh -t ubuntu@15.204.244.251 "sudo systemctl restart kmufti-chameleon"
```

| If you changed | Restart |
|---|---|
| `chameleon/server.js` | `kmufti-chameleon` |
| `wishlist/server.js` | `kmufti-wishlist` |
| `draw/server.js` | `kmufti-draw` |
| `puzzle/server.js` | `kmufti-puzzle` |
| `yahtzee/server.js` | `kmufti-yahtzee` |
| `infinite-kitchen/server.js` | `kmufti-kitchen` |
| `admin/server.js` | `kmufti-admin` |

**Deploy first, restart second.** Restarting before the pull just restarts the
old code — it looks like the change didn't work when really it isn't there yet.

### The cache-busting rule

Browsers hang on to CSS and JS. When you edit one, bump its `?v=` number in the
HTML that loads it:

```html
<link rel="stylesheet" href="styles.css?v=27" />
<script src="game.js?v=44"></script>
```

Forget this and you'll swear your change didn't deploy, while everyone else
sees the old file. It's the single most common "why isn't it working."

### Checking what's actually live

```bash
curl -s https://kmufti.com/chameleon/ | grep -o 'game.js?v=[0-9]*'
```

---

## 2. Meccha Chameleon — flagging bad rounds

Some photos make an unfair puzzle and you only find out by playing one. Autumn
woodland is the worst: the figure is a soft vertical blob and so is every tree
trunk, in the same colours, at the same size.

While playing, two keys:

| | |
|---|---|
| `⌥` + `⇧` + `B` | **broken** — unfair, nobody finds this |
| `⌥` + `⇧` + `G` | **good** — keep it, worth a daily |

A toast confirms each one: *"Flagged broken · 12 on file"*. Works during a round
or after the reveal.

Each flag saves the photo exactly as played, where the figure was, every number
that put it there, and **where your clicks went** — that last one is the useful
part, because it shows where the picture pulled your eye instead.

### Arming a browser

The keys don't exist until a browser has the dev key. Once per browser:

```
https://kmufti.com/chameleon/?dev=YOUR-KEY-HERE
```

The page looks normal and the URL snaps back to plain `/chameleon/` — that's
the key being stashed and scrubbed. It's in `localStorage`, so it **survives
closing tabs, quitting Chrome, and restarting the Mac.** You only redo it for:

- a different browser or a different device
- Incognito windows (they throw it away on close)
- clearing site data for kmufti.com
- signing out on purpose with `?dev=` and nothing after it

### Reading the flags back

From the Mac, in the repo — same idea as `./deploy.sh`:

```bash
./verdicts.sh
```

That lands everything in `~/Desktop/chameleon-verdicts/`: `verdicts.jsonl`
(one JSON object per line) and a `shots/` folder with the photo from every
flagged round. It prints a count as it goes — *"14 round(s): 11 broken, 3
good"*. Run it again later and it only downloads the new pictures.

```bash
./verdicts.sh --no-shots        # records only, much faster
./verdicts.sh ~/some/folder     # somewhere other than the Desktop
```

**First run needs the key**, once, in a file outside the repo:

```bash
echo 'your-key-here' > ~/.kmufti-devkey && chmod 600 ~/.kmufti-devkey
```

Outside the repo because this one is public on GitHub — a key committed here
is a key anyone can read. The script also accepts `MC_DEV_KEY=... ./verdicts.sh`
for a one-off.

If something's wrong it says which thing: `403` wrong key, `503` flagging
switched off on the server, `404` the server is running old code.

A `good` record stores placement in the exact units `daily.json` wants, so
promoting one to a real daily is a paste, not a re-measure.

### The key itself

**Anyone holding the key can do everything you can** — flag rounds, read every
round you've flagged, and download the photos. There is no per-person login;
it is one shared password. So giving a friend the `?dev=` URL genuinely does
hand them the tool, which is the right move if you want a second pair of eyes
flagging rounds, and the wrong one otherwise.

**Keep it in your password manager, not in this repo** — the GitHub repo is
public, so anything committed here is readable by anyone.

It lives in two places, and both survive reboots and deploys:

- **Server:** `/etc/systemd/system/kmufti-chameleon.service.d/devkey.conf`.
  It's in `/etc`, not the repo, so `git pull` can't touch it.
- **Browser:** Chrome's `localStorage` for kmufti.com.

To change it, write a new one and re-arm your browser:

```bash
ssh -t ubuntu@15.204.244.251 "printf '[Service]\nEnvironment=MC_DEV_KEY=NEW-KEY\n' | sudo tee /etc/systemd/system/kmufti-chameleon.service.d/devkey.conf && sudo systemctl daemon-reload && sudo systemctl restart kmufti-chameleon"
```

If the server has no key set at all, the whole feature is off: the endpoint
refuses everything and nothing is ever written to disk. That's the deliberate
default — a public server shouldn't accept writes because nobody said it
shouldn't.

### Is it on?

```bash
curl -s -o /dev/null -w "%{http_code}\n" -X POST https://kmufti.com/chameleon/api/verdict -d '{}'
```

- **403** — working. (It's rejecting you because that request has no key.)
- **404** — the old code is running. Deploy, then restart.
- **503** — no key set on the server.

---

## 3. What runs where

Static files for everything, plus seven small Node backends. No database, no npm
packages, no build step.

| Project | Backend | Port | Breaks without it? |
|---|---|---|---|
| Hub `/` | — | — | — |
| Jeoprady `/jeoprady/` | — | — | — |
| Lost in Translation `/translate/` | — | — | — |
| Meccha Chameleon `/chameleon/` | `chameleon/server.js` | 8025 | No — daily still works, practice falls back to repo photos |
| Infinite Kitchen `/infinite-kitchen/` | `infinite-kitchen/server.js` | 8027 | No — the game is static |
| Yahtzee `/yahtzee/` | `yahtzee/server.js` | 8024 | Only 1v1; solo-vs-bot still works |
| Wishlist `/wishlist/` | `wishlist/server.js` | 8021 | Yes — no link unfurling |
| White Canvas `/white-canvas/` | `draw/server.js` | 8022 | Yes |
| Jigsaw `/puzzle/` | `puzzle/server.js` | 8023 | Yes |
| Ops dashboard `/admin/` | `admin/server.js` | 8026 | Yes (private, password-protected) |

`draw/` is White Canvas — the canvas used to live behind the launcher tiles and
the folder name stuck.

The hub's visit counter is served by the **Jigsaw** backend, not one of its own.

---

## 4. Where the data lives

Runtime state is in `/var/lib/` on the server, **outside the repo on purpose**,
so a `git pull` can never wipe it:

| What | Where |
|---|---|
| White Canvas pixels | `/var/lib/kmufti-draw/canvas.bin` |
| Jigsaw table + hub visit count | `/var/lib/kmufti-puzzle/` |
| Chameleon practice photos | `/var/lib/kmufti-chameleon/photos/` |
| Chameleon flagged rounds | `/var/lib/kmufti-chameleon/verdicts/` |
| Kitchen's untried pairs | `/var/lib/kmufti-kitchen/missing.json` |
| Dashboard history | `/var/lib/kmufti-admin/` |

Back these up if you'd miss them. Nothing else on the box holds anything you
can't rebuild from git.

Yahtzee keeps nothing — a match lives in memory, and a restart drops games in
progress. Fine for a fifteen-minute game.

---

## 5. Health checks, in one place

```bash
curl -s https://kmufti.com/chameleon/api/photo/stats     # practice photo pool
curl -s localhost:8024/api/health                        # yahtzee  (on the server)
curl -s localhost:8027/api/health                        # kitchen  (on the server)
curl -s -o /dev/null -w '%{http_code}\n' https://kmufti.com/.git/config   # must be 403
```

That last one matters: the web root is a git checkout, so if `/.git/` ever
starts returning 200 anyone can read your whole history. It's also the
single most-requested path in the access log — people scan for it constantly.

To see if a service is alive:

```bash
ssh -t ubuntu@15.204.244.251 "sudo systemctl status kmufti-chameleon --no-pager"
```

---

## 6. Gotchas that have actually bitten

- **nginx locations that serve files need `^~`.** The static-asset rule matches
  things like `.jpg`, and an nginx regex location beats a plain prefix one. Get
  this wrong and JSON routes work while image bytes 404 — which looks like a
  broken backend rather than a routing rule. It bit the chameleon photos and
  the admin dashboard's JS.

- **Don't copy `deploy/nginx.conf` over the live config.** The live one is
  `/etc/nginx/sites-available/default` and certbot has rewritten it to add TLS.
  Overwriting throws that away. Paste new `location` blocks in by hand, then
  `sudo nginx -t && sudo systemctl reload nginx`. Always `nginx -t` first — it
  tells you before a reload can hurt.

- **The dashboard can't tell you the site is down.** It runs on the box it
  watches, so if the box goes, it goes too and the last thing it showed you was
  green. For actual alerting use something outside — a free UptimeRobot or
  Healthchecks.io monitor on `https://kmufti.com/`. `/admin/` is what you open
  *after* it pages you, to find out which part broke.

- **The server runs UTC.** Chameleon's daily rolls over at UTC midnight —
  early evening in Chicago (6pm or 7pm depending on daylight saving), not at
  your midnight. The dashboard is the exception — it buckets by
  `ADMIN_TZ`, default `America/Chicago`.

- **Rebuilding dashboard traffic history needs a stop first.** The service
  writes state on the way down, so `rm && restart` loses the race. Stop, delete,
  start — in that order.

- **`/admin/` has no link anywhere and no `robots.txt` rule**, deliberately. A
  `Disallow: /admin/` line is a public sign saying the page exists; the password
  already keeps crawlers out.

---

## 7. If something's broken, in order

1. Did you actually deploy? `git status` on the Mac — "ahead 1" means no.
2. Did you bump `?v=` on the CSS/JS you changed?
3. Hard-refresh the browser (⌘⇧R).
4. Did the change need a service restart, and did you do it *after* deploying?
5. `sudo systemctl status kmufti-<name>` on the server — running or crashed?
6. `sudo journalctl -u kmufti-<name> -n 50` for the actual error.
