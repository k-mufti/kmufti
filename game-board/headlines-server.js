// Real or Fake (/real-or-fake/): today's ten headlines, served at
// /game-board/api/headlines/today. It rides on the Game Board backend because
// nginx already forwards /game-board/api/ here, so the game needed no port,
// service or proxy rule of its own.
//
// A day is ten headlines in a shuffled order, the same for everyone:
//   - real ones from UPI's Odd News feed (true stories that sound made up)
//   - satire from The Onion, The Hard Times and Reductress
//   - fakes written by AI ahead of time, one per line in ../real-or-fake/fakes.txt
//     (checked so none of them is secretly a true story)
// Each day is built the first time someone asks for it and saved to
// HEADLINES_STATE, so a restart mid-day doesn't hand out a different puzzle,
// and a real story is never used twice.
//
// Every headline is set in Title Case, because UPI writes in sentence case and
// the satire sites don't - otherwise the capitals would give the answer away.

const https = require("https");
const fs = require("fs");
const os = require("os");
const path = require("path");

const STATE = process.env.HEADLINES_STATE || path.join(os.tmpdir(), "kmufti-headlines.json");
const FAKES = fs.readFileSync(path.join(__dirname, "../real-or-fake/fakes.txt"), "utf8")
  .split("\n").map((l) => l.trim()).filter(Boolean);

const REAL_FEEDS = [
  { url: "https://rss.upi.com/news/odd_news.rss", source: "UPI" },
];
const SATIRE_FEEDS = [
  { url: "https://www.theonion.com/rss", source: "The Onion" },
  { url: "https://thehardtimes.net/feed/", source: "The Hard Times" },
  { url: "https://reductress.com/feed/", source: "Reductress" },
];

const ROUNDS = 10;
const KEEP_DAYS = 60;

/* ---------- Fetching and reading RSS ---------- */
function get(url, hops = 0) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { "user-agent": "Mozilla/5.0 kmufti" }, timeout: 10000 }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location && hops < 3) {
        res.resume();
        return resolve(get(new URL(res.headers.location, url).href, hops + 1));
      }
      if (res.statusCode !== 200) { res.resume(); return reject(new Error(`${url}: ${res.statusCode}`)); }
      let body = "";
      res.setEncoding("utf8");
      res.on("data", (c) => { body += c; if (body.length > 3e6) req.destroy(); });
      res.on("end", () => resolve(body));
    });
    req.on("timeout", () => req.destroy(new Error(`${url}: timed out`)));
    req.on("error", reject);
  });
}

const ENT = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
function decode(s) {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d))
    .replace(/&([a-z]+);/gi, (m, n) => ENT[n.toLowerCase()] ?? m)
    .replace(/[‘’]/g, "'").replace(/[“”]/g, '"')
    .replace(/\s+/g, " ").trim();
}
const tag = (xml, name) => { const m = xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`)); return m ? decode(m[1]) : ""; };

// The story's opening lines, shown once you've answered. WordPress feeds tack
// on "The post X appeared first on Y" and a read-more link; drop those.
function blurbOf(item) {
  const raw = (item.match(/<description>([\s\S]*?)<\/description>/) || [])[1] || "";
  const first = raw.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"')
    .split(/<p>The post /)[0].replace(/<a [^>]*>Read the full[\s\S]*?<\/a>/i, "");
  let text = tag(item, "media:description") || decode(first);
  if (text.length > 420) text = text.slice(0, 420).replace(/\s+\S*$/, "") + "...";
  return text;
}
const imageOf = (item) => (item.match(/<media:content url="([^"]+)"/) || [])[1] || "";

async function readFeed({ url, source }) {
  const xml = await get(url);
  return [...xml.matchAll(/<item[\s>][\s\S]*?<\/item>/g)].map(([item]) => ({
    text: tag(item, "title"),
    link: tag(item, "link"),
    date: Date.parse(tag(item, "pubDate")) || 0,
    blurb: blurbOf(item),
    image: imageOf(item),
    source,
  }));
}

/* ---------- Making headlines fair ---------- */
// UPI marks videos and photos ("Watch:", "Look:"); the satire sites have
// columns no newspaper runs. Strip or skip anything that's a tell.
function cleanReal(text) {
  return text.replace(/^(watch|look|listen|video|photos?)\s*:\s*/i, "");
}
function fairSatire(text) {
  if (/^(opinion|quiz|report|poll|diagram|horoscopes?|op-ed|editorial)\b/i.test(text)) return false;
  if (/^(how|why|what|when|\d+ (ways|things|signs|tips))\b/i.test(text)) return false; // listicles and essays
  if (/\b(I|I'm|I've|My|Me|We|Our)\b/.test(text)) return false;                       // first-person columns
  return true;
}
const fairLength = (t) => t.length >= 25 && t.length <= 120;

const SMALL = new Set("a an and as at but by for from in into nor of off on onto or over per so than the to up via vs with yet".split(" "));
function titleCase(text) {
  const words = text.split(" ");
  return words.map((w, i) => {
    if (/[A-Z\d]/.test(w.slice(1))) return w; // NASA, iPhone, McDonald's, LeBron, 3D
    const lower = w.toLowerCase();
    const prev = words[i - 1] || "";
    if (i > 0 && i < words.length - 1 && SMALL.has(lower.replace(/[^a-z]/g, "")) && !/[:—-]$/.test(prev)) return lower;
    return lower.replace(/^([^a-z]*)([a-z])/, (_, p, c) => p + c.toUpperCase())
      .replace(/-([a-z])/g, (_, c) => "-" + c.toUpperCase());
  }).join(" ");
}

/* ---------- Same day, same puzzle ---------- */
const today = () => new Date().toISOString().slice(0, 10); // UTC, like the Chameleon daily
const dayNumber = (date) => Math.floor(Date.parse(date + "T00:00:00Z") / 864e5);

function rng(seed) { // mulberry32
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffle(a, r) {
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

// The AI fakes go round in one fixed shuffled order, a few a day, so none
// comes back until the whole list has been used.
const FAKE_ORDER = shuffle(FAKES.map((_, i) => i), rng(20261021));
let fakeCursor = null;

function loadState() {
  try { return JSON.parse(fs.readFileSync(STATE, "utf8")); } catch { return { days: {}, used: [] }; }
}
function saveState(state) {
  const dates = Object.keys(state.days).sort();
  for (const d of dates.slice(0, -KEEP_DAYS)) delete state.days[d];
  state.used = state.used.slice(-2000);
  try { fs.writeFileSync(STATE, JSON.stringify(state)); } catch (e) { console.error("headlines state:", e.message); }
}

async function settled(feeds) {
  const results = await Promise.allSettled(feeds.map(readFeed));
  results.forEach((r, i) => { if (r.status === "rejected") console.error("headlines feed:", feeds[i].url, r.reason.message); });
  return results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
}

async function build(date) {
  const state = loadState();
  const used = new Set(state.used);
  const r = rng(dayNumber(date));

  // A day is 4-6 real, 2-3 satire and the rest AI, so nobody can play the odds.
  const nReal = 4 + Math.floor(r() * 3);
  const nSatire = 2 + Math.floor(r() * 2);

  const weekAgo = Date.now() - 7 * 864e5;
  const real = shuffle((await settled(REAL_FEEDS))
    .map((h) => ({ ...h, text: cleanReal(h.text) }))
    .filter((h) => fairLength(h.text) && !used.has(h.link) && h.date >= weekAgo), r).slice(0, nReal);
  if (real.length < 3) throw new Error("not enough real headlines today");

  // Satire is timeless, so any recent one not used yet will do; fill in with
  // AI fakes when the satire feeds come up short.
  const satire = shuffle((await settled(SATIRE_FEEDS))
    .filter((h) => fairLength(h.text) && fairSatire(h.text) && !used.has(h.link)), r).slice(0, nSatire);

  const nAi = ROUNDS - real.length - satire.length;
  if (fakeCursor === null) fakeCursor = state.fakeCursor || 0;
  const ai = [];
  for (let i = 0; i < nAi; i++) ai.push({ text: FAKES[FAKE_ORDER[fakeCursor++ % FAKE_ORDER.length]], link: "", source: "AI" });
  state.fakeCursor = fakeCursor;

  const rounds = shuffle([
    ...real.map((h) => ({ text: titleCase(h.text), real: true, source: h.source, link: h.link, blurb: h.blurb, image: h.image })),
    ...satire.map((h) => ({ text: titleCase(h.text), real: false, source: h.source, link: h.link, blurb: h.blurb, image: "" })),
    ...ai.map((h) => ({ text: titleCase(h.text), real: false, source: "AI", link: "" })),
  ], r);

  const day = { date, number: dayNumber(date) - dayNumber("2026-10-21") + 1, rounds };
  state.days[date] = day;
  state.used.push(...real.map((h) => h.link), ...satire.map((h) => h.link));
  saveState(state);
  return day;
}

// Days built before stories carried their blurb and photo: look them up once.
let backfilling = null;
function backfill(date) {
  if (backfilling && backfilling.date === date) return backfilling.promise;
  const promise = settled([...REAL_FEEDS, ...SATIRE_FEEDS]).then((items) => {
    const state = loadState();
    const day = state.days[date];
    const byLink = new Map(items.map((h) => [h.link, h]));
    for (const r of day.rounds) {
      if (!r.link || r.blurb !== undefined) continue;
      const h = byLink.get(r.link);
      r.blurb = h ? h.blurb : "";
      r.image = h && r.real ? h.image : "";
    }
    saveState(state);
    return day;
  });
  backfilling = { date, promise };
  return promise;
}

let building = null;
async function todays() {
  const date = today();
  const saved = loadState().days[date];
  if (saved && !saved.rounds.some((r) => r.link && r.blurb === undefined)) return saved;
  if (saved) return backfill(date);
  // One build at a time, so a rush at midnight fetches the feeds once.
  if (!building || building.date !== date) {
    building = { date, promise: build(date).finally(() => setTimeout(() => { building = null; }, 1000)) };
  }
  return building.promise;
}

// Returns true if it answered the request.
function handle(route, req, res) {
  if (route !== "/api/headlines/today") return false;
  todays().then(
    (day) => {
      // The page on a local static server asks this process straight from another port.
      res.writeHead(200, { "content-type": "application/json", "cache-control": "public, max-age=300", "access-control-allow-origin": "*" });
      res.end(JSON.stringify(day));
    },
    (e) => {
      console.error("headlines:", e.message);
      res.writeHead(503, { "content-type": "application/json", "access-control-allow-origin": "*" });
      res.end(JSON.stringify({ error: "Today's headlines aren't in yet. Try again in a few minutes." }));
    }
  );
  return true;
}

module.exports = { handle, titleCase, fairSatire };
