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
const uniqSets = {};               // day -> Set of hashed IPs, rebuilt from disk at boot
const recent = [];                 // last 200 page views, memory only
let pending = "";                  // a half-written final line waits here for the rest

let salt = crypto.randomBytes(16).toString("hex");
let saltDay = dayKey(Date.now());
function visitorId(ip) {
  const today = dayKey(Date.now());
  if (today !== saltDay) { salt = crypto.randomBytes(16).toString("hex"); saltDay = today; }
  return crypto.createHash("sha256").update(salt + ip).digest("hex").slice(0, 8);
}

const emptyDay = () => ({
  hits: 0, bytes: 0, views: 0, api: 0, bots: 0, uniq: [],
  pages: {}, refs: {}, agents: {}, os: {}, status: {}, errors: {}, hours: new Array(24).fill(0),
});
for (const [day, d] of Object.entries(traffic.days)) uniqSets[day] = new Set(d.uniq || []);

const LINE = /^(\S+) \S+ \S+ \[([^\]]+)\] "(\S+) ([^"]*?) [^"]*" (\d{3}) (\d+|-) "([^"]*)" "([^"]*)"/;
const MONTHS = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
const BOT = /bot|crawl|spider|slurp|curl|wget|python-|headless|monitor|scan|fetch|preview|facebookexternalhit|semrush|ahrefs|bingpreview|uptime/i;
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
  const set = (uniqSets[day] ||= new Set());
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
  if (ASSET.test(p)) return;                         // an asset isn't a visit

  // A visitor is somebody who asked for a page. Counting them off every
  // request instead would count the stylesheet and the logo as people, and
  // "visitors" would come out higher than "page views" - which is how you can
  // tell an analytics number is measuring the wrong thing.
  const who = visitorId(ip);
  if (set.size < 20000) set.add(who);                // a cap, so a crawl can't grow the file

  d.views++;
  bump(d.pages, projectOf(p));
  bump(d.agents, browserOf(ua));
  bump(d.os, osOf(ua));
  if (ref && ref !== "-" && !/kmufti\.com/.test(ref)) {
    try { bump(d.refs, new URL(ref).hostname); } catch { bump(d.refs, ref.slice(0, 40)); }
  }
  recent.push({ at, who, page: projectOf(p), path: p.slice(0, 60), status,
                browser: browserOf(ua), os: osOf(ua) });
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

async function scanLog() {
  if (!fs.existsSync(ACCESS_LOG)) return false;
  // First run on a box: read yesterday's rotated log too, so the dashboard
  // opens with history instead of a blank chart. Gzipped ones are left alone.
  if (!traffic.cursor.seeded) {
    traffic.cursor.seeded = true;
    pending = "";
    await ingestFile(ACCESS_LOG + ".1", 0);
    pending = "";
  }
  let size = 0;
  try { size = fs.statSync(ACCESS_LOG).size; } catch { return false; }
  if (size < traffic.cursor.offset) { traffic.cursor.offset = 0; pending = ""; }  // rotated under us
  if (size === traffic.cursor.offset) return true;
  traffic.cursor.offset = await ingestFile(ACCESS_LOG, traffic.cursor.offset);
  for (const [day, set] of Object.entries(uniqSets)) {
    if (traffic.days[day]) traffic.days[day].uniq = [...set];
  }
  return true;
}

function pruneTraffic() {
  const cutoff = dayKey(Date.now() - KEEP_DAYS * 86400000);
  for (const day of Object.keys(traffic.days)) if (day < cutoff) { delete traffic.days[day]; delete uniqSets[day]; }
}

function trafficView(days = 30) {
  const series = [], totals = { pages: {}, refs: {}, agents: {}, os: {}, errors: {} };
  let views = 0, people = 0, bots = 0, bytes = 0;
  for (let i = days - 1; i >= 0; i--) {
    const day = dayKey(Date.now() - i * 86400000);
    const d = traffic.days[day];
    series.push({ day, views: d?.views || 0, uniq: d ? (uniqSets[day]?.size ?? d.uniq.length) : 0,
                  bots: d?.bots || 0, hits: d?.hits || 0 });
    if (!d) continue;
    views += d.views; people += uniqSets[day]?.size ?? d.uniq.length; bots += d.bots; bytes += d.bytes;
    for (const key of ["pages", "refs", "agents", "os", "errors"]) {
      for (const [k, v] of Object.entries(d[key])) bump(totals[key], k, v);
    }
  }
  const today = traffic.days[dayKey(Date.now())] || emptyDay();
  const fiveMin = Date.now() - 5 * 60000;
  const liveSet = new Set(recent.filter((r) => r.at > fiveMin).map((r) => r.who));
  return {
    series,
    window: { days, views, people, bots, bytes },
    today: { views: today.views, uniq: uniqSets[dayKey(Date.now())]?.size || 0, bots: today.bots,
             hits: today.hits, api: today.api, bytes: today.bytes, hours: today.hours },
    top: { pages: topOf(totals.pages), refs: topOf(totals.refs, 6),
           agents: topOf(totals.agents, 5), os: topOf(totals.os, 5), errors: topOf(totals.errors, 6) },
    live: { visitors: liveSet.size, recent: recent.slice(-25).reverse() },
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

  const log = await run("git", ["-C", REPO, "log", "-1", "--format=%h%x00%s%x00%ct%x00%an"]);
  let git = null;
  if (log) {
    const [hash, subject, ct, author] = log.trim().split("\0");
    const dirty = await run("git", ["-C", REPO, "status", "--porcelain"]);
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

async function poll() {
  const results = await Promise.all(SERVICES.map(probe));
  SERVICES.forEach((svc, i) => { record(svc.id, results[i].up, results[i].ms); last.services[svc.id] = results[i]; });

  const front = await probeFrontDoor();
  record("front", front.up, front.ms);
  last.front = front;

  last.systemd = await systemdFacts();
  last.logOk = await scanLog();
  last.at = Date.now();

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
  process.exit(0);
});

server.listen(PORT, HOST, async () => {
  console.log(`admin server on http://${HOST}:${PORT}/admin/ - state in ${STATE_DIR}`);
  await slowFacts();
  await poll();
  setInterval(poll, POLL_MS);
});
