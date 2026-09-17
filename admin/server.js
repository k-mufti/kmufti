// Zero-dependency Node backend for the private ops dashboard.
//
// This is the one page on the site that is NOT for visitors. It answers two
// questions - "is anything down" and "is anyone out there" - out of what the
// box already knows: the nginx access log, systemd, and the other backends'
// own endpoints. It adds nothing to them and asks nothing of them that a
// visitor couldn't ask.
//
//   GET  /api/snapshot              everything the dashboard draws
//   GET  /api/journal?unit=kmufti-puzzle   last lines of that unit's journal
//   POST /api/restart {unit}        off unless ADMIN_ALLOW_RESTART=1
//
// It listens on 127.0.0.1 ONLY, so the single way in is through nginx, which
// keeps it behind HTTP basic auth. See DEPLOY.md. Nothing here is linked from
// the hub and the nginx block sends X-Robots-Tag: noindex.
//
// On privacy: the access log has visitor IPs in it, and this never stores one.
// An IP becomes a short hash with a salt that is regenerated every day, which
// is enough to count "how many different people today" and useless for
// anything else - yesterday's hashes can't be matched to today's.
//
// Two things it deliberately cannot do:
//   - tell you the box is down (it would be down too). That needs an external
//     pinger; DEPLOY.md says how.
//   - see anything a visitor does inside a page. There is no tracker here,
//     only the request log nginx writes anyway.

const http = require("http");
const https = require("https");
const fs = require("fs");
const zlib = require("zlib");
const path = require("path");
const os = require("os");
const crypto = require("crypto");
const { execFile } = require("child_process");

const PORT = process.env.PORT || 8026;
const HOST = "127.0.0.1";                       // never bind the world
const REPO = path.join(__dirname, "..");
const PUBLIC_URL = process.env.ADMIN_PUBLIC_URL || "https://kmufti.com/";
const ACCESS_LOG = process.env.ADMIN_ACCESS_LOG || "/var/log/nginx/access.log";
const ALLOW_RESTART = process.env.ADMIN_ALLOW_RESTART === "1";
const PROBE_MS = 3000;                          // a backend gets this long to answer
const POLL_MS = 30000;                          // how often we check everything
const FAILS_TO_OPEN = 2;                        // misses before it counts as an incident
const KEEP_DAYS = 60;                           // traffic history
const KEEP_HOURS = 24 * 90;                     // uptime history
const UA_SELF = "kmufti-admin/1 (health check)"; // so our own pings don't count as traffic

// State lives outside the repo in production, next to the script in dev, so a
// git pull can't wipe the uptime history and a laptop run needs no setup.
const STATE_DIR = process.env.ADMIN_STATE ||
  (fs.existsSync("/var/lib/kmufti-admin") ? "/var/lib/kmufti-admin" : path.join(__dirname, "state"));
try { fs.mkdirSync(STATE_DIR, { recursive: true }); } catch { /* read-only: we run without history */ }

/* ======================================================================
   The things we watch
   ====================================================================== */
// Each backend is probed on the cheapest route it already has. Where that
// route answers with numbers of its own (peers, pool size, visits) we keep
// them - they're the closest thing the site has to a live pulse.
const SERVICES = [
  { id: "wishlist",  name: "Wishlist",  unit: "kmufti-wishlist",  port: 8021,
    method: "OPTIONS", probe: "/api/unfurl", href: "/wishlist/" },
  { id: "draw",      name: "White Canvas", unit: "kmufti-draw",   port: 8022,
    method: "OPTIONS", probe: "/api/paint", href: "/white-canvas/" },
  { id: "puzzle",    name: "Jigsaw",    unit: "kmufti-puzzle",    port: 8023,
    method: "GET",     probe: "/api/visits", href: "/puzzle/" },
  { id: "yahtzee",   name: "Yahtzee",   unit: "kmufti-yahtzee",   port: 8024,
    method: "GET",     probe: "/api/health", href: "/yahtzee/" },
  { id: "chameleon", name: "Chameleon", unit: "kmufti-chameleon", port: 8025,
    method: "GET",     probe: "/api/photo/stats", href: "/chameleon/" },
];

// Pretty names for the top-level paths, so the traffic table reads like the
// hub rather than like a log file.
const PROJECT_NAMES = {
  "": "Hub", "index.html": "Hub",
  yahtzee: "Yahtzee", puzzle: "Jigsaw", jeoprady: "Jeoprady!", wishlist: "Wishlist",
  chameleon: "Meccha Chameleon", "white-canvas": "White Canvas", translate: "Lost in Translation",
  draw: "White Canvas", admin: "Admin", images: "Assets",
};

/* ======================================================================
   Small helpers
   ====================================================================== */
const run = (cmd, args, timeout = 5000) => new Promise((resolve) => {
  execFile(cmd, args, { timeout, maxBuffer: 8 << 20 }, (err, stdout) =>
    resolve(err && !stdout ? null : String(stdout)));
});

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return fallback; }
}
function writeJson(file, value) {
  const tmp = file + ".tmp";
  try {
    fs.writeFileSync(tmp, JSON.stringify(value));
    fs.renameSync(tmp, file);                    // atomic: a crash can't truncate history
  } catch (e) { /* no state dir - the dashboard still works, it just forgets */ }
}
const hourKey = (d) => new Date(d).toISOString().slice(0, 13);   // 2026-09-15T13
const dayKey  = (d) => new Date(d).toISOString().slice(0, 10);   // 2026-09-15
const bump = (obj, key, by = 1) => { obj[key] = (obj[key] || 0) + by; };
const topOf = (obj, n = 8) => Object.entries(obj)
  .sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, v]) => ({ k, v }));

/* ======================================================================
   Probing: is it answering, and how fast
   ====================================================================== */
function probe(svc) {
  return new Promise((resolve) => {
    const t0 = Date.now();
    const req = http.request(
      { host: "127.0.0.1", port: svc.port, path: svc.probe, method: svc.method, timeout: PROBE_MS,
        headers: { "User-Agent": UA_SELF } },
      (res) => {
        let body = "";
        res.setEncoding("utf8");
        res.on("data", (c) => { if (body.length < 4096) body += c; });
        res.on("end", () => {
          let data = null;
          try { data = JSON.parse(body); } catch { /* not every probe answers JSON */ }
          resolve({ up: res.statusCode < 500, status: res.statusCode, ms: Date.now() - t0, data });
        });
      });
    req.on("timeout", () => { req.destroy(); resolve({ up: false, ms: Date.now() - t0, error: "timeout" }); });
    req.on("error", (e) => resolve({ up: false, ms: Date.now() - t0, error: e.code || e.message }));
    req.end();
  });
}

// The front door: the real public URL, over the real certificate. It leaves
// the box and comes back, so it covers DNS, nginx and TLS in one go - and the
// same connection hands us the certificate's expiry date for free.
function probeFrontDoor() {
  return new Promise((resolve) => {
    const t0 = Date.now();
    let cert = null;
    const req = https.request(PUBLIC_URL, { method: "GET", timeout: 8000, headers: { "User-Agent": UA_SELF } },
      (res) => {
        const peer = res.socket.getPeerCertificate ? res.socket.getPeerCertificate() : null;
        if (peer && peer.valid_to) {
          cert = {
            validTo: peer.valid_to,
            issuer: (peer.issuer && (peer.issuer.O || peer.issuer.CN)) || "?",
            days: Math.floor((Date.parse(peer.valid_to) - Date.now()) / 86400000),
          };
        }
        res.resume();
        res.on("end", () => resolve({ up: res.statusCode < 400, status: res.statusCode, ms: Date.now() - t0, cert }));
      });
    req.on("timeout", () => { req.destroy(); resolve({ up: false, ms: Date.now() - t0, error: "timeout", cert }); });
    req.on("error", (e) => resolve({ up: false, ms: Date.now() - t0, error: e.code || e.message, cert }));
    req.end();
  });
}

/* ======================================================================
   Uptime history
   ----------------------------------------------------------------------
   Every poll writes one tick into an hour bucket, which is all the storage a
   90-day record needs (90 days x 24 hours x 6 services is a few thousand
   small numbers). Exact down windows are kept separately as incidents, so
   "12 minutes at 04:11" survives even though the bucket only knows the hour.
   ====================================================================== */
const uptime = readJson(path.join(STATE_DIR, "uptime.json"), { hours: {}, incidents: [] });
const misses = {};                 // consecutive failures, per service
const latency = {};                // last 60 samples, memory only - a sparkline

function record(id, up, ms) {
  const h = (uptime.hours[hourKey(Date.now())] ||= {});
  const b = (h[id] ||= { ok: 0, fail: 0, ms: 0 });
  if (up) { b.ok++; b.ms = Math.round((b.ms * (b.ok - 1) + ms) / b.ok); } else b.fail++;

  (latency[id] ||= []).push(up ? ms : null);
  if (latency[id].length > 60) latency[id].shift();

  misses[id] = up ? 0 : (misses[id] || 0) + 1;
  const open = uptime.incidents.find((i) => i.service === id && !i.to);
  if (!up && misses[id] === FAILS_TO_OPEN && !open) {
    // Dated from the first miss, not the second, or every outage reads
    // POLL_MS shorter than it was.
    uptime.incidents.unshift({ service: id, from: Date.now() - POLL_MS, to: null });
  }
  if (up && open) open.to = Date.now();
}

function uptimePct(id, hours) {
  const now = Date.now();
  let ok = 0, fail = 0;
  for (let i = 0; i < hours; i++) {
    const b = uptime.hours[hourKey(now - i * 3600000)]?.[id];
    if (b) { ok += b.ok; fail += b.fail; }
  }
  return ok + fail ? +((ok / (ok + fail)) * 100).toFixed(2) : null;
}

// One bar per hour for the last three days: null = we weren't watching.
function bars(id, hours = 72) {
  const now = Date.now(), out = [];
  for (let i = hours - 1; i >= 0; i--) {
    const at = now - i * 3600000;
    const b = uptime.hours[hourKey(at)]?.[id];
    out.push(b ? { at, ok: b.ok, fail: b.fail, ms: b.ms } : { at, ok: 0, fail: 0, ms: 0 });
  }
  return out;
}

function pruneUptime() {
  const cutoff = Date.now() - KEEP_HOURS * 3600000;
  for (const k of Object.keys(uptime.hours)) if (Date.parse(k + ":00:00Z") < cutoff) delete uptime.hours[k];
  uptime.incidents = uptime.incidents.filter((i) => (i.to || Date.now()) > cutoff).slice(0, 200);
}

/* ======================================================================
   Traffic, read out of the nginx access log
   ----------------------------------------------------------------------
   The log is read forward from wherever we stopped last time, so the cost is
   whatever arrived in the last 30 seconds rather than the whole file. Only
   the aggregates are kept; no line is stored.
   ====================================================================== */
const traffic = readJson(path.join(STATE_DIR, "traffic.json"), { days: {}, cursor: { offset: 0, seeded: false } });
const recent = [];                 // last 200 page views, memory only
let pending = "";                  // a half-written final line waits here for the rest

let salt = crypto.randomBytes(16).toString("hex");
let saltDay = dayKey(Date.now());
function visitorId(ip) {
  const today = dayKey(Date.now());
  if (today !== saltDay) { salt = crypto.randomBytes(16).toString("hex"); saltDay = today; }
  return crypto.createHash("sha256").update(salt + ip).digest("hex").slice(0, 8);
}

/* ----------------------------------------------------------------------
   All-time visitors
   ----------------------------------------------------------------------
   "How many different people, ever" needs an identifier that survives the
   night - which is exactly what the daily salt refuses to be. So this keeps a
   second one: a permanent random salt, generated once and stored, that turns
   an address into a 10-character hash. Still one-way, still never displayed,
   and the only question ever asked of it is "seen this before?".
   That is a real trade and worth naming: the daily numbers stay unlinkable
   night to night, but this one set can tell that somebody came back in March
   and again in September. Delete visitors.json and the count starts over.

   It lives in its own file because the traffic history is derived from the
   logs and gets thrown away freely, and this cannot be rebuilt from anything
   once it is gone. Re-reading the same logs hashes to the same ids, so a
   rebuild adds nothing - it just re-confirms what is already there.
   ---------------------------------------------------------------------- */
const ALLTIME_FILE = path.join(STATE_DIR, "visitors.json");
const allTime = readJson(ALLTIME_FILE, null) ||
  { salt: crypto.randomBytes(16).toString("hex"), since: null, first: {} };
// `first` is stable id -> the day that person first turned up, which is what
// makes "new" answerable: a visitor is new on exactly one day, ever. An older
// file that kept a plain list of ids still loads - those people are simply
// known, with no first day, so they count as returning.
if (Array.isArray(allTime.ids)) { allTime.first = {}; for (const id of allTime.ids) allTime.first[id] = null; }
delete allTime.ids;
allTime.first ||= {};
const ALLTIME_CAP = 200000;
let allTimeDirty = false;
let allTimeN = Object.keys(allTime.first).length;

const stableId = (ip) =>
  crypto.createHash("sha256").update(allTime.salt + ip).digest("hex").slice(0, 10);

// Returns true if this is the first time this address has ever been seen.
function allTimeAdd(ip, at, day) {
  if (at && (!allTime.since || at < allTime.since)) { allTime.since = at; allTimeDirty = true; }
  const id = stableId(ip);
  if (id in allTime.first) return false;
  if (allTimeN >= ALLTIME_CAP) return false;
  allTime.first[id] = day;
  allTimeN++;
  allTimeDirty = true;
  return true;
}

const emptyDay = () => ({
  hits: 0, bytes: 0, views: 0, api: 0, bots: 0, seen: {},
  pages: {}, refs: {}, agents: {}, os: {}, status: {}, errors: {}, hours: new Array(24).fill(0),
});

// `seen` is hashed address -> [pages, assets], and it exists to answer one
// question: was that a person?
//
// A user-agent can't answer it. Half the addresses hitting this site claim to
// be Chrome on a Mac and are a scanner in a rented rack - the same fake string
// arriving from seven addresses at once. Behaviour answers it. A browser asks
// for the page and then goes and gets the stylesheet, the script and the
// images; a scanner takes the HTML and leaves. So an address counts as a
// visitor once it has fetched an asset, or read a second page - and one that
// asked for `/` exactly once and nothing else never does.
//
// It undercounts in one case: someone coming back inside the hour, whose
// assets are still cached (max-age=3600) and who reads a single page. That is
// the right way round - a number that says "people" should be a floor, not a
// hopeful guess.
const SEEN_CAP = 20000;
const seenN = {};                                   // day -> size, so the cap costs nothing

// One entry per address per day:
//   p pages  a assets  f first seen  l last seen  b browser  o os
//   g the pages they looked at (capped)  n true if never here before
// It is a few hundred bytes a person, which buys the "unique users today"
// list: the counting and the listing come from the same record, so the list
// can never disagree with the number above it.
function mark(day, d, who, asset, info) {
  const seen = (d.seen ||= {});
  let e = seen[who];
  if (!e) {
    const n = (seenN[day] ??= Object.keys(seen).length);
    if (n >= SEEN_CAP) return false;                // a flood can't grow the file
    e = seen[who] = { p: 0, a: 0, f: info.at, l: info.at, b: info.browser, o: info.os, g: [] };
    seenN[day] = n + 1;
  }
  const was = qualifies(e);
  if (asset) e.a++;
  else { e.p++; if (e.g.length < 8 && !e.g.includes(info.page)) e.g.push(info.page); }
  if (info.at < e.f) e.f = info.at;
  if (info.at > e.l) e.l = info.at;
  if (info.browser !== "other") { e.b = info.browser; e.o = info.os; }
  return !was && qualifies(e);                      // true on the crossing only
}

// Read a page, and then behaved like a browser about it: went back for an
// asset, or read a second page. Both halves matter. Without the first, a
// stray request for a favicon counts as a person who never visited; without
// the second, every scanner that grabs the homepage and leaves does.
const qualifies = (e) => e.p > 0 && (e.a > 0 || e.p >= 2);
const visitors = (d) => { let n = 0; for (const k in d.seen || {}) if (qualifies(d.seen[k])) n++; return n; };
const addresses = (d) => Object.keys(d.seen || {}).length;

// Today's people, most recent first - the list behind the section.
function usersOf(d) {
  const out = [];
  for (const who in d.seen || {}) {
    const e = d.seen[who];
    if (!qualifies(e)) continue;                    // scanners are not users
    out.push({ who, first: e.f, last: e.l, views: e.p, assets: e.a,
               pages: e.g, browser: e.b, os: e.o, fresh: Boolean(e.n) });
  }
  return out.sort((a, b) => b.last - a.last);
}

// A state file written by an older build kept [pages, assets] pairs; keep the
// counts and let the detail fill in from here on rather than throwing the day away.
for (const d of Object.values(traffic.days)) {
  for (const who in d.seen || {}) {
    const e = d.seen[who];
    if (Array.isArray(e)) d.seen[who] = { p: e[0] || 0, a: e[1] || 0, f: 0, l: 0, b: "other", o: "other", g: [] };
  }
}

const LINE = /^(\S+) \S+ \S+ \[([^\]]+)\] "(\S+) ([^"]*?) [^"]*" (\d{3}) (\d+|-) "([^"]*)" "([^"]*)"/;
const MONTHS = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
const BOT = /bot|crawl|spider|slurp|curl|wget|python-|headless|monitor|scan|fetch|preview|facebookexternalhit|semrush|ahrefs|bingpreview|uptime|zgrab|go-http-client|masscan|nmap|censys|\+http/i;
const ASSET = /\.(css|js|mjs|json|png|jpe?g|svg|ico|woff2?|ttf|webp|gif|glb|stl|map|txt|csv|bin)$/i;

function logTime(s) {                       // 15/Sep/2026:13:45:12 +0000
  const m = /^(\d{2})\/(\w{3})\/(\d{4}):(\d{2}):(\d{2}):(\d{2}) ([+-]\d{4})/.exec(s);
  if (!m) return null;
  const off = (m[7][0] === "-" ? 1 : -1) * (Number(m[7].slice(1, 3)) * 60 + Number(m[7].slice(3))) * 60000;
  return Date.UTC(+m[3], MONTHS[m[2]], +m[1], +m[4], +m[5], +m[6]) + off;
}

function browserOf(ua) {
  if (/Edg\//.test(ua)) return "Edge";
  if (/OPR\//.test(ua)) return "Opera";
  if (/Firefox\//.test(ua)) return "Firefox";
  if (/Chrome\//.test(ua)) return "Chrome";
  if (/Safari\//.test(ua)) return "Safari";
  return "other";
}
function osOf(ua) {
  if (/iPhone|iPad|iPod/.test(ua)) return "iOS";
  if (/Android/.test(ua)) return "Android";
  if (/Mac OS X|Macintosh/.test(ua)) return "macOS";
  if (/Windows/.test(ua)) return "Windows";
  if (/Linux|X11/.test(ua)) return "Linux";
  return "other";
}
function projectOf(p) {
  const seg = p.split("?")[0].split("/").filter(Boolean)[0] || "";
  return PROJECT_NAMES[seg] || (seg ? "/" + seg : "Hub");
}

function ingestLine(line) {
  const m = LINE.exec(line);
  if (!m) return;
  const [, ip, stamp, method, rawPath, statusStr, bytesStr, ref, ua] = m;
  if (ua.includes("kmufti-admin")) return;          // our own front-door check
  const at = logTime(stamp);
  if (!at) return;

  const day = dayKey(at);
  const d = (traffic.days[day] ||= emptyDay());
  const p = rawPath.split("?")[0];
  const status = Number(statusStr);
  const bytes = bytesStr === "-" ? 0 : Number(bytesStr);
  const bot = BOT.test(ua) || !ua || ua === "-";

  // Me looking at this page is not traffic, so /admin never reaches the
  // counters - except when it was turned away, because somebody else trying
  // the door is exactly the kind of thing this page should show.
  if (p.startsWith("/admin")) {
    if (status === 401 || status === 403) { bump(d.status, statusStr); bump(d.errors, status + " " + p.slice(0, 80)); }
    return;
  }

  d.hits++; d.bytes += bytes;
  bump(d.status, statusStr);
  if (status >= 400) bump(d.errors, status + " " + p.slice(0, 80));
  if (bot) { d.bots++; return; }                    // people-numbers exclude crawlers
  d.hours[new Date(at).getUTCHours()]++;

  if (/\/api\//.test(p)) { d.api++; return; }

  // A page that was never served is not a page view. Scanners rattling /.git,
  // /wp-admin and /.env are the loudest thing in the log, and counting their
  // 404s put them straight to the top of "where they went". They are all still
  // in Errors, which is where a probe belongs.
  // 304 stays: HTML is sent no-cache, so a revalidated page is a real visit.
  if (status !== 200 && status !== 304) return;

  const who = visitorId(ip);
  const info = { at, browser: browserOf(ua), os: osOf(ua), page: projectOf(p) };
  const firstEver = (crossed) => {
    if (crossed && allTimeAdd(ip, at, day) && d.seen[who]) d.seen[who].n = true;
  };
  if (ASSET.test(p)) { firstEver(mark(day, d, who, 1, info)); return; }  // evidence of a browser
  firstEver(mark(day, d, who, 0, info));

  d.views++;
  bump(d.pages, projectOf(p));
  bump(d.agents, browserOf(ua));
  bump(d.os, osOf(ua));
  if (ref && ref !== "-" && !/kmufti\.com/.test(ref)) {
    try { bump(d.refs, new URL(ref).hostname); } catch { bump(d.refs, ref.slice(0, 40)); }
  }
  recent.push({ at, who, page: projectOf(p), path: p.slice(0, 60), status,
                browser: browserOf(ua), os: osOf(ua),
                fresh: allTime.first[stableId(ip)] === day });   // never been here before today
  if (recent.length > 200) recent.shift();
}

function ingestFile(file, from) {
  return new Promise((resolve) => {
    let size = 0;
    try { size = fs.statSync(file).size; } catch { return resolve(0); }
    if (size <= from) return resolve(size);
    const stream = fs.createReadStream(file, { start: from, end: size - 1, encoding: "utf8" });
    stream.on("data", (chunk) => {
      const lines = (pending + chunk).split("\n");
      pending = lines.pop();                         // the tail may be half a line
      for (const l of lines) ingestLine(l);
    });
    stream.on("error", () => resolve(from));
    stream.on("end", () => resolve(size));
  });
}

// The rotated logs, oldest first. logrotate keeps about two weeks of them and
// gzips everything past yesterday's, which would otherwise be two weeks of
// history the charts never see. zlib is in Node, so reading them costs nothing
// but the few seconds this takes once, on the very first start.
async function ingestArchive() {
  const dir = path.dirname(ACCESS_LOG), base = path.basename(ACCESS_LOG);
  let names = [];
  try { names = fs.readdirSync(dir); } catch { return; }
  const rotated = names
    .map((f) => ({ f, n: parseInt((f.match(new RegExp("^" + base.replace(/\./g, "\\.") + "\\.(\\d+)")) || [])[1], 10) }))
    .filter((x) => Number.isFinite(x.n))
    .sort((a, b) => b.n - a.n);                      // .14 first, .1 last
  for (const { f } of rotated) {
    pending = "";
    await (f.endsWith(".gz") ? ingestGz(path.join(dir, f)) : ingestFile(path.join(dir, f), 0));
  }
  pending = "";
}

function ingestGz(file) {
  return new Promise((resolve) => {
    const stream = fs.createReadStream(file).pipe(zlib.createGunzip());
    stream.setEncoding("utf8");
    stream.on("data", (chunk) => {
      const lines = (pending + chunk).split("\n");
      pending = lines.pop();
      for (const l of lines) ingestLine(l);
    });
    stream.on("error", () => resolve());             // a half-written rotation: skip it
    stream.on("end", () => { if (pending) ingestLine(pending); resolve(); });
  });
}

async function scanLog() {
  if (!fs.existsSync(ACCESS_LOG)) return false;
  // First run on a box: read everything logrotate still has, so the dashboard
  // opens with the last two weeks rather than with today.
  if (!traffic.cursor.seeded) {
    traffic.cursor.seeded = true;
    await ingestArchive();
  }
  let size = 0;
  try { size = fs.statSync(ACCESS_LOG).size; } catch { return false; }
  if (size < traffic.cursor.offset) { traffic.cursor.offset = 0; pending = ""; }  // rotated under us
  if (size === traffic.cursor.offset) return true;
  traffic.cursor.offset = await ingestFile(ACCESS_LOG, traffic.cursor.offset);
  return true;
}

function pruneTraffic() {
  const cutoff = dayKey(Date.now() - KEEP_DAYS * 86400000);
  for (const day of Object.keys(traffic.days)) if (day < cutoff) { delete traffic.days[day]; delete seenN[day]; }
}

// How many people turned up for the very first time on each day.
function firstsByDay() {
  const out = {};
  for (const id in allTime.first) { const d = allTime.first[id]; if (d) out[d] = (out[d] || 0) + 1; }
  return out;
}

function trafficView(days = 30) {
  const firsts = firstsByDay();
  const series = [], totals = { pages: {}, refs: {}, agents: {}, os: {}, errors: {} };
  let views = 0, people = 0, bots = 0, bytes = 0;
  for (let i = days - 1; i >= 0; i--) {
    const day = dayKey(Date.now() - i * 86400000);
    const d = traffic.days[day];
    series.push({ day, views: d?.views || 0, uniq: d ? visitors(d) : 0,
                  fresh: firsts[day] || 0, bots: d?.bots || 0, hits: d?.hits || 0 });
    if (!d) continue;
    views += d.views; people += visitors(d); bots += d.bots; bytes += d.bytes;
    for (const key of ["pages", "refs", "agents", "os", "errors"]) {
      for (const [k, v] of Object.entries(d[key])) bump(totals[key], k, v);
    }
  }
  const today = traffic.days[dayKey(Date.now())] || emptyDay();
  const fiveMin = Date.now() - 5 * 60000;
  const liveSet = new Set(recent.filter((r) => r.at > fiveMin).map((r) => r.who));
  const td = traffic.days[dayKey(Date.now())] || emptyDay();
  return {
    series,
    window: { days, views, people, bots, bytes },
    today: { views: today.views, uniq: visitors(td), addresses: addresses(td),
             fresh: firsts[dayKey(Date.now())] || 0, bots: today.bots,
             hits: today.hits, api: today.api, bytes: today.bytes, hours: today.hours },
    top: { pages: topOf(totals.pages), refs: topOf(totals.refs, 6),
           agents: topOf(totals.agents, 5), os: topOf(totals.os, 5), errors: topOf(totals.errors, 6) },
    live: { visitors: liveSet.size, recent: recent.slice(-25).reverse() },
    users: usersOf(td),
    allTime: { visitors: allTimeN, since: allTime.since,
               fresh30: series.reduce((a, x) => a + x.fresh, 0) },
  };
}

/* ======================================================================
   The box itself
   ====================================================================== */
let slow = { disk: null, state: [], git: null, at: 0 };   // refreshed every 5 min

async function slowFacts() {
  const df = await run("df", ["-Pk", "/"]);
  let disk = null;
  if (df) {
    const row = df.trim().split("\n").pop().split(/\s+/);
    if (row.length >= 5) disk = { totalKb: +row[1], usedKb: +row[2], freeKb: +row[3], pct: parseInt(row[4], 10) };
  }
  const du = await run("du", ["-sk", "/var/lib/kmufti-draw", "/var/lib/kmufti-puzzle",
                              "/var/lib/kmufti-chameleon", STATE_DIR], 15000);
  const state = du ? du.trim().split("\n").map((l) => {
    const [kb, dir] = l.split(/\s+/);
    return { dir: path.basename(dir), kb: +kb };
  }).filter((s) => s.kb) : [];

  // -c safe.directory, because this runs as www-data and the checkout belongs
  // to ubuntu; without it git refuses the repo as "dubious ownership" and the
  // dashboard just shows no commit. Set on the command, not in a global config.
  const gitArgs = ["-c", "safe.directory=" + REPO, "-C", REPO];
  const log = await run("git", [...gitArgs, "log", "-1", "--format=%h%x00%s%x00%ct%x00%an"]);
  let git = null;
  if (log) {
    const [hash, subject, ct, author] = log.trim().split("\0");
    const dirty = await run("git", [...gitArgs, "status", "--porcelain"]);
    git = { hash, subject, at: +ct * 1000, author, dirty: Boolean(dirty && dirty.trim()) };
  }
  slow = { disk, state, git, at: Date.now() };
}

async function hostFacts() {
  let available = os.freemem();
  try {                                    // MemAvailable is the honest number on Linux
    const m = /MemAvailable:\s+(\d+) kB/.exec(fs.readFileSync("/proc/meminfo", "utf8"));
    if (m) available = +m[1] * 1024;
  } catch { /* not Linux */ }
  return {
    hostname: os.hostname(), platform: os.platform(), node: process.version,
    uptime: os.uptime(), cores: os.cpus().length, load: os.loadavg(),
    mem: { total: os.totalmem(), available },
    disk: slow.disk, state: slow.state, adminUptime: process.uptime(),
  };
}

// One systemctl call for every unit. Missing systemd (a laptop) just means the
// dashboard shows a dash in that column.
async function systemdFacts() {
  const out = await run("systemctl", ["show", "--no-pager",
    "--property=Id,ActiveState,SubState,ActiveEnterTimestamp,NRestarts,MemoryCurrent",
    ...SERVICES.map((s) => s.unit)]);
  if (!out) return null;
  const byUnit = {};
  for (const block of out.trim().split(/\n\s*\n/)) {
    const kv = {};
    for (const line of block.split("\n")) {
      const i = line.indexOf("=");
      if (i > 0) kv[line.slice(0, i)] = line.slice(i + 1);
    }
    if (!kv.Id) continue;
    byUnit[kv.Id.replace(/\.service$/, "")] = {
      state: kv.ActiveState, sub: kv.SubState,
      since: kv.ActiveEnterTimestamp ? Date.parse(kv.ActiveEnterTimestamp) || null : null,
      restarts: kv.NRestarts === undefined ? null : +kv.NRestarts,
      mem: kv.MemoryCurrent && kv.MemoryCurrent !== "[not set]" ? +kv.MemoryCurrent : null,
    };
  }
  return byUnit;
}

/* ======================================================================
   The poll loop
   ====================================================================== */
let last = { services: {}, front: null, systemd: null, at: 0, logOk: false };
let pollN = 0;

async function poll() {
  const results = await Promise.all(SERVICES.map(probe));
  SERVICES.forEach((svc, i) => { record(svc.id, results[i].up, results[i].ms); last.services[svc.id] = results[i]; });

  // The front-door check leaves the box and comes back, so nginx logs it like
  // any visitor. Every 30s that is 2,880 lines a day - more than the site
  // itself gets - which buries the real traffic and rotates the archive out
  // faster. Every fourth poll is two minutes, which is still a fine pager.
  if (pollN % 4 === 0) {
    const front = await probeFrontDoor();
    record("front", front.up, front.ms);
    last.front = front;
  }

  last.systemd = await systemdFacts();
  last.logOk = await scanLog();
  last.at = Date.now();

  pollN++;
  if (Date.now() - slow.at > 5 * 60000) await slowFacts();
  pruneUptime(); pruneTraffic();
  save();
}

let saveTimer = null;
function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    writeJson(path.join(STATE_DIR, "uptime.json"), uptime);
    writeJson(path.join(STATE_DIR, "traffic.json"), traffic);
    if (allTimeDirty) { writeJson(ALLTIME_FILE, allTime); allTimeDirty = false; }
  }, 2000);
}

async function snapshot() {
  const openIncident = (id) => uptime.incidents.find((i) => i.service === id && !i.to) || null;
  const services = SERVICES.map((svc) => {
    const live = last.services[svc.id] || { up: false, ms: 0, error: "not polled yet" };
    return {
      ...svc, ...live,
      latency: latency[svc.id] || [],
      uptime: { d1: uptimePct(svc.id, 24), d7: uptimePct(svc.id, 24 * 7), d30: uptimePct(svc.id, 24 * 30) },
      bars: bars(svc.id),
      systemd: last.systemd ? last.systemd[svc.unit] || null : null,
      down: openIncident(svc.id),
    };
  });
  return {
    now: Date.now(), polledAt: last.at,
    services,
    front: { ...last.front, url: PUBLIC_URL, uptime: { d1: uptimePct("front", 24), d7: uptimePct("front", 24 * 7),
             d30: uptimePct("front", 24 * 30) }, bars: bars("front"), down: openIncident("front") },
    host: await hostFacts(),
    git: slow.git,
    traffic: trafficView(30),
    incidents: uptime.incidents.slice(0, 12).map((i) => ({
      ...i, name: i.service === "front" ? "Front door" : (SERVICES.find((s) => s.id === i.service)?.name || i.service),
    })),
    flags: { restart: ALLOW_RESTART, log: last.logOk, logPath: ACCESS_LOG, systemd: Boolean(last.systemd),
             state: STATE_DIR },
  };
}

/* ======================================================================
   Routes
   ====================================================================== */
function sendJson(res, status, body) {
  const text = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(text),
    "Cache-Control": "no-store",
    "X-Robots-Tag": "noindex, nofollow",
  });
  res.end(text);
}
const stripPrefix = (p) => (p.startsWith("/admin/") ? p.slice(6) : p);

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://x");
  const apiPath = stripPrefix(url.pathname);

  if (apiPath === "/api/snapshot" && req.method === "GET") {
    return sendJson(res, 200, await snapshot());
  }

  // The last lines a unit wrote, for when a card has gone red and you want to
  // know why without opening a terminal.
  if (apiPath === "/api/journal" && req.method === "GET") {
    const unit = url.searchParams.get("unit");
    if (!SERVICES.some((s) => s.unit === unit)) return sendJson(res, 400, { error: "unknown unit" });
    const out = await run("journalctl", ["-u", unit, "-n", "60", "--no-pager", "-o", "short-iso"], 8000);
    return sendJson(res, 200, out === null
      ? { unit, lines: [], error: "journalctl unavailable (needs the systemd-journal group)" }
      : { unit, lines: out.trim().split("\n").slice(-60) });
  }

  // Deliberately opt-in: it needs a sudoers line as well as the env flag, so
  // nothing here can restart a service unless the box was set up to allow it.
  if (apiPath === "/api/restart" && req.method === "POST") {
    if (!ALLOW_RESTART) return sendJson(res, 403, { error: "restart is off (set ADMIN_ALLOW_RESTART=1)" });
    let body = "";
    req.on("data", (c) => { if (body.length < 1024) body += c; });
    req.on("end", async () => {
      let unit = null;
      try { unit = JSON.parse(body).unit; } catch { /* bad json */ }
      if (!SERVICES.some((s) => s.unit === unit)) return sendJson(res, 400, { error: "unknown unit" });
      const out = await run("sudo", ["-n", "systemctl", "restart", unit], 15000);
      return sendJson(res, out === null ? 500 : 200,
        out === null ? { error: "systemctl restart failed - is the sudoers line in place?" } : { ok: true, unit });
    });
    return;
  }

  // Dev only. In production nginx serves the page and forwards /admin/api/ here.
  if (req.method === "GET") return serveStatic(req, res, url.pathname);
  res.writeHead(404); res.end("not found");
});

const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
               ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8",
               ".svg": "image/svg+xml", ".png": "image/png", ".ico": "image/x-icon" };
function serveStatic(req, res, pathname) {
  let rel = decodeURIComponent(pathname.replace(/^\/+/, ""));
  if (rel === "" || rel.endsWith("/")) rel += "index.html";
  const file = path.join(REPO, rel);
  if (!file.startsWith(REPO)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end("not found"); }
    res.writeHead(200, { "Content-Type": MIME[path.extname(file)] || "application/octet-stream",
                         "Cache-Control": "no-cache", "X-Robots-Tag": "noindex, nofollow" });
    res.end(data);
  });
}

for (const sig of ["SIGTERM", "SIGINT"]) process.on(sig, () => {
  writeJson(path.join(STATE_DIR, "uptime.json"), uptime);
  writeJson(path.join(STATE_DIR, "traffic.json"), traffic);
  writeJson(ALLTIME_FILE, allTime);
  process.exit(0);
});

server.listen(PORT, HOST, async () => {
  console.log(`admin server on http://${HOST}:${PORT}/admin/ - state in ${STATE_DIR}`);
  await slowFacts();
  await poll();
  setInterval(poll, POLL_MS);
});
