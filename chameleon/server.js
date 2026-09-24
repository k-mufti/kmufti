// Zero-dependency Node backend for Meccha Chameleon.
//
// It does one job: hand out photographs for practice rounds.
//
// The daily photo is not its business. That one lives in the repo, hand-picked
// and hand-placed in build.html, and the game reads it straight off disk.
// Practice is the mode that empties a photo pool - a few rounds and you have
// seen all of them - so it draws from Pexels instead.
//
//   GET  /api/photo?seen=id,id   a photo for a round, as JSON + credit
//   GET  /api/photo/<id>.jpg     the bytes, from our own cache
//   GET  /api/photo/stats        how full the pool is
//
// Two things shape the design.
//
// The game samples pixels off the photo to light and blend the figure into it.
// A cross-origin image taints the canvas and makes getImageData throw, so
// photos are downloaded here and served from our own origin rather than
// hotlinked - which also keeps the API key off the front end.
//
// And an API has a rate limit. So every photo fetched is kept: the pool fills
// itself on a timer, evicts its oldest at a cap, and a practice round is
// served from what is already there. Being told to wait by Pexels costs
// nobody a round.
//
// No key configured means no upstream call at all: the endpoint says so and
// the game falls back to the photos in chameleon/images/.

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 8025;
const PHOTO_DIR = process.env.PHOTO_CACHE || path.join(__dirname, "photos");
const PHOTO_CAP = Number(process.env.PHOTO_CAP || 120);   // ~60MB at Pexels "large2x"
const PEXELS_KEY = process.env.PEXELS_KEY || "";

// Flagging a round writes to disk on a public server, so it is off unless a
// key is configured. No key means the endpoint refuses everything and nothing
// can be written - which is the right default for a box that has not been
// told it is a workbench.
const DEV_KEY = process.env.MC_DEV_KEY || "";
const VERDICT_DIR = process.env.MC_VERDICT_DIR || path.join(__dirname, "verdicts");
const VERDICT_MAX_BODY = 12 * 1024 * 1024;   // a 1800x1200 JPEG in base64, with room
// Overridable so the fetching can be pointed at a stub and tested for real
// rather than against the live API and its rate limit.
const PEXELS_API = process.env.PEXELS_API || "https://api.pexels.com/v1";
const PEXELS_IMG_HOST = process.env.PEXELS_IMG_HOST || "images.pexels.com";

// A photo has to be big enough to hide a figure in and roughly the shape of a
// screen. Panoramas and postage stamps make bad rounds.
//
// PHOTO_MIN_EDGE is checked twice, and the second one is the one that counts:
// the API reports the dimensions of the ORIGINAL, but what we download is one
// of its variants. "large" turns out to be 650px on the long edge - fine for a
// thumbnail, half of what this game draws at - so the file is measured after
// it lands and thrown away if it is too small to play on.
const PHOTO_MIN_EDGE = 900;
const PHOTO_MAX_RATIO = 2.2;
const PHOTO_MIN_STORED = 1000;   // the game's canvas is 1200 tall

// Enough of a JPEG reader to get the dimensions: walk the markers to the first
// SOF frame header. (Same trick the Jigsaw backend uses on its puzzle images.)
function jpegSize(buf) {
  if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  let i = 2;
  while (i + 9 < buf.length) {
    if (buf[i] !== 0xff) { i++; continue; }
    const m = buf[i + 1];
    if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) {
      return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
    }
    if (m === 0xd8 || (m >= 0xd0 && m <= 0xd9)) { i += 2; continue; }
    i += 2 + buf.readUInt16BE(i + 2);
  }
  return null;
}

let photos = [];   // [{ id, by, link, at }], oldest first
try { photos = JSON.parse(fs.readFileSync(path.join(PHOTO_DIR, "index.json"), "utf8")) || []; }
catch { /* first run */ }

function savePhotoIndex() {
  try {
    fs.mkdirSync(PHOTO_DIR, { recursive: true });
    fs.writeFileSync(path.join(PHOTO_DIR, "index.json"), JSON.stringify(photos));
  } catch (e) { console.error("photo index save failed:", e.message); }
}

// The index is the authority on what the pool holds. Anything else in the
// directory is a leftover - a crash between writing the file and saving the
// index, or an index that went missing - and would otherwise sit there
// forever, quietly making the cap a lie.
// Photos already in the pool that predate a rule change - the 650px ones that
// got in while the size was only checked against the API's numbers - are
// dropped on the way past, so the pool converges on what is playable rather
// than keeping whatever was true when it was fetched.
(function dropUnplayablePhotos() {
  const before = photos.length;
  photos = photos.filter((p) => {
    let buf;
    try { buf = fs.readFileSync(path.join(PHOTO_DIR, p.id + ".jpg")); } catch { return false; }
    const got = jpegSize(buf);
    if (got && Math.max(got.w, got.h) >= PHOTO_MIN_STORED) return true;
    try { fs.unlinkSync(path.join(PHOTO_DIR, p.id + ".jpg")); } catch { /* already gone */ }
    return false;
  });
  const gone = before - photos.length;
  if (gone) { console.log(`photo cache: dropped ${gone} too small to play on`); savePhotoIndex(); }
})();

(function sweepOrphanPhotos() {
  let found = [];
  try { found = fs.readdirSync(PHOTO_DIR); } catch { return; }
  const known = new Set(photos.map((p) => p.id + ".jpg"));
  let gone = 0;
  for (const f of found) {
    if (f === "index.json" || known.has(f)) continue;
    try { fs.unlinkSync(path.join(PHOTO_DIR, f)); gone++; } catch { /* leave it */ }
  }
  if (gone) console.log(`photo cache: swept ${gone} orphan${gone === 1 ? "" : "s"}`);
})();

// One upstream call at a time, and never two in the same breath - a burst of
// practice rounds should come off the pool, not out of the rate limit. A 429
// backs all of it off for a while: the pool is there precisely so that being
// told to wait costs nobody a round.
let photoFetching = false;
let lastPhotoFetch = 0;
let photoBackoffUntil = 0;

async function fetchPhoto() {
  if (!PEXELS_KEY || photoFetching) return null;
  if (Date.now() < photoBackoffUntil || Date.now() - lastPhotoFetch < 1500) return null;
  photoFetching = true;
  lastPhotoFetch = Date.now();
  const stop = AbortSignal.timeout(8000);
  try {
    // Curated is the editorial feed; a random page of it is a cheap way to
    // land somewhere different every time.
    const page = 1 + Math.floor(Math.random() * 400);
    const r = await fetch(`${PEXELS_API}/curated?per_page=1&page=${page}`,
                          { headers: { Authorization: PEXELS_KEY }, signal: stop });
    if (r.status === 429) {
      photoBackoffUntil = Date.now() + 15 * 60 * 1000;
      throw new Error("rate limited - backing off 15m");
    }
    if (!r.ok) throw new Error("pexels " + r.status);
    const p = (await r.json()).photos?.[0];
    if (!p) throw new Error("no photo in reply");

    const w = p.width || 0, h = p.height || 0;
    if (Math.min(w, h) < PHOTO_MIN_EDGE) throw new Error(`too small (${w}x${h})`);
    if (Math.max(w, h) / Math.min(w, h) > PHOTO_MAX_RATIO) throw new Error(`odd shape (${w}x${h})`);

    // large2x is ~1880px on the long edge, which still has something to give
    // at the 1200 the game draws at; large is 650 and does not.
    // Only ever download from the image CDN, whatever the reply says.
    const src = p.src?.large2x || p.src?.original || p.src?.large;
    if (!src || new URL(src).hostname !== PEXELS_IMG_HOST) throw new Error("unexpected image host");

    const img = await fetch(src, { signal: stop });
    if (!img.ok) throw new Error("image " + img.status);
    const bytes = Buffer.from(await img.arrayBuffer());

    const got = jpegSize(bytes);
    if (!got) throw new Error("not a readable jpeg");
    if (Math.max(got.w, got.h) < PHOTO_MIN_STORED) {
      throw new Error(`variant too small (${got.w}x${got.h})`);
    }

    fs.mkdirSync(PHOTO_DIR, { recursive: true });
    const id = String(p.id);
    fs.writeFileSync(path.join(PHOTO_DIR, id + ".jpg"), bytes);
    photos = photos.filter((q) => q.id !== id);
    photos.push({ id, by: p.photographer || "unknown", link: p.url || "", at: Date.now() });

    while (photos.length > PHOTO_CAP) {
      const gone = photos.shift();
      try { fs.unlinkSync(path.join(PHOTO_DIR, gone.id + ".jpg")); } catch { /* already gone */ }
    }
    savePhotoIndex();
    return photos[photos.length - 1];
  } catch (e) {
    console.error("photo fetch failed:", e.message);
    return null;
  } finally {
    photoFetching = false;
  }
}

// Fill the pool in the background rather than off the back of someone's
// round: a photo a minute, only while there is room, so the first people to
// play practice are not the ones paying for the fetch. Pexels' free tier is
// 200 an hour, and this asks for 60.
if (PEXELS_KEY) {
  setInterval(() => { if (photos.length < PHOTO_CAP) fetchPhoto(); }, 60000).unref();
  setTimeout(() => fetchPhoto(), 3000).unref();
}

// Pick a photo the player has not just had. `seen` is whatever ids the game
// remembers from this session; with a full pool that is the difference
// between a fresh photo every round and the occasional repeat.
function pickPhoto(seen) {
  if (!photos.length) return null;
  const fresh = photos.filter((p) => !seen.has(p.id));
  const from = fresh.length ? fresh : photos;
  return from[Math.floor(Math.random() * from.length)];
}

/* ========================================================================
   VERDICTS - rounds flagged while playing
   ========================================================================
   The game can say "this round was unfair" or "keep this one" with a
   keystroke. Each verdict lands here as one line of JSON plus the photo as it
   was played, so a bad round can be looked at weeks later and a good one
   promoted into daily.json.

   The photo is copied rather than referenced on purpose: the practice pool
   evicts its oldest at a cap, and a flagged round would otherwise lose its
   picture exactly because it sat around waiting to be reviewed.
   ======================================================================== */

function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    let n = 0;
    const chunks = [];
    req.on("data", (c) => {
      n += c.length;
      if (n > limit) { reject(new Error("body too large")); req.destroy(); return; }
      chunks.push(c);
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

// Constant-time-ish compare, so the key cannot be guessed a character at a
// time off the response timing.
function keyOk(given) {
  if (!DEV_KEY || !given || given.length !== DEV_KEY.length) return false;
  let diff = 0;
  for (let i = 0; i < DEV_KEY.length; i++) diff |= DEV_KEY.charCodeAt(i) ^ given.charCodeAt(i);
  return diff === 0;
}

function verdictCount() {
  try {
    return fs.readFileSync(path.join(VERDICT_DIR, "verdicts.jsonl"), "utf8")
      .split("\n").filter(Boolean).length;
  } catch { return 0; }
}

function saveVerdict(rec) {
  fs.mkdirSync(path.join(VERDICT_DIR, "shots"), { recursive: true });

  // One id for the record and its picture, sortable by when it happened.
  const id = new Date().toISOString().replace(/[-:]/g, "").replace(/\..+/, "") +
             "-" + Math.random().toString(36).slice(2, 7);

  const shot = rec.shot;
  delete rec.shot;
  if (typeof shot === "string") {
    const comma = shot.indexOf(",");
    if (comma > 0 && shot.startsWith("data:image/jpeg")) {
      try {
        fs.writeFileSync(path.join(VERDICT_DIR, "shots", id + ".jpg"),
                         Buffer.from(shot.slice(comma + 1), "base64"));
        rec.shot = "shots/" + id + ".jpg";
      } catch (e) { rec.shotError = e.message; }
    }
  }

  rec.id = id;
  fs.appendFileSync(path.join(VERDICT_DIR, "verdicts.jsonl"), JSON.stringify(rec) + "\n");
  return id;
}

/* ========================================================================
   HTTP
   ======================================================================== */
// nginx forwards /chameleon/api/ here with the prefix intact, so it is
// stripped the same way the other backends do it.
function stripPrefix(pathname) {
  return pathname.startsWith("/chameleon/") ? pathname.slice(10) : pathname;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://x");
  const apiPath = stripPrefix(url.pathname);

  // A photo for a practice round. Served from the pool, which the timer keeps
  // topped up; only an empty pool waits on the API. `seen` is the ids this
  // player has already had, so a full pool means a different photo every
  // time. 503 means no photo to give - the game falls back to the photos in
  // the repo.
  if (apiPath === "/api/photo" && req.method === "GET") {
    const seen = new Set((url.searchParams.get("seen") || "")
      .split(",").filter(Boolean).slice(0, 200));
    const pick = pickPhoto(seen) || await fetchPhoto();
    res.writeHead(pick ? 200 : 503, {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-cache",
    });
    return res.end(JSON.stringify(pick
      ? { id: pick.id, src: `/chameleon/api/photo/${pick.id}.jpg`, by: pick.by, link: pick.link }
      : { error: PEXELS_KEY ? "no photos yet" : "no key configured" }));
  }

  // Flag the round just played. Key-gated; without MC_DEV_KEY set on the
  // server this is a 503 and nothing touches the disk.
  if (apiPath === "/api/verdict" && req.method === "POST") {
    const json = (code, obj) => {
      res.writeHead(code, { "Content-Type": "application/json", "Cache-Control": "no-cache" });
      res.end(JSON.stringify(obj));
    };
    if (!DEV_KEY) return json(503, { error: "verdicts not enabled" });
    if (!keyOk(req.headers["x-mc-dev-key"])) return json(403, { error: "bad key" });

    let rec;
    try {
      rec = JSON.parse((await readBody(req, VERDICT_MAX_BODY)).toString("utf8"));
    } catch (e) { return json(400, { error: e.message }); }

    if (rec.verdict !== "broken" && rec.verdict !== "good") {
      return json(400, { error: "verdict must be broken or good" });
    }
    try {
      const id = saveVerdict(rec);
      console.log(`verdict ${rec.verdict} ${id} (${rec.image || "?"})`);
      return json(200, { ok: true, id, count: verdictCount() });
    } catch (e) { return json(500, { error: e.message }); }
  }

  // Read the flagged rounds back out, for review. Same key.
  if (apiPath === "/api/verdicts" && req.method === "GET") {
    if (!DEV_KEY) { res.writeHead(503); return res.end("verdicts not enabled"); }
    if (!keyOk(req.headers["x-mc-dev-key"] || url.searchParams.get("key"))) {
      res.writeHead(403); return res.end("bad key");
    }
    let body = "";
    try { body = fs.readFileSync(path.join(VERDICT_DIR, "verdicts.jsonl"), "utf8"); } catch { /* none yet */ }
    res.writeHead(200, { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-cache" });
    return res.end(body);
  }

  // The picture from a flagged round.
  const shot = apiPath.match(/^\/api\/verdicts\/shots\/([\w-]+)\.jpg$/);
  if (shot && req.method === "GET") {
    if (!keyOk(req.headers["x-mc-dev-key"] || url.searchParams.get("key"))) {
      res.writeHead(403); return res.end("bad key");
    }
    fs.readFile(path.join(VERDICT_DIR, "shots", shot[1] + ".jpg"), (err, data) => {
      if (err) { res.writeHead(404); return res.end("not found"); }
      res.writeHead(200, { "Content-Type": "image/jpeg", "Cache-Control": "no-store" });
      res.end(data);
    });
    return;
  }

  // How the pool is doing, for when you want to know whether it is filling.
  if (apiPath === "/api/photo/stats" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json", "Cache-Control": "no-cache" });
    return res.end(JSON.stringify({
      pool: photos.length, cap: PHOTO_CAP, key: Boolean(PEXELS_KEY),
      backingOff: Date.now() < photoBackoffUntil,
      oldest: photos[0]?.at || null, newest: photos[photos.length - 1]?.at || null,
    }));
  }

  // The bytes themselves, same-origin so the game can read pixels off them.
  const file = apiPath.match(/^\/api\/photo\/(\d+)\.jpg$/);
  if (file && req.method === "GET") {
    fs.readFile(path.join(PHOTO_DIR, file[1] + ".jpg"), (err, data) => {
      if (err) { res.writeHead(404); return res.end("not found"); }
      res.writeHead(200, { "Content-Type": "image/jpeg", "Cache-Control": "public, max-age=86400" });
      res.end(data);
    });
    return;
  }

  // Dev only: in production nginx serves the static site and only forwards
  // /chameleon/api/ here. Locally there is no nginx, so the same process
  // hands out the page as well - otherwise the game and its API would sit on
  // different origins and the photos would taint the canvas, which is the one
  // thing this backend exists to avoid.
  if (req.method === "GET") return serveStatic(req, res, url.pathname);

  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("not found");
});

const STATIC_DIR = path.join(__dirname, "..");
const MIME = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml", ".png": "image/png", ".ico": "image/x-icon",
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".gif": "image/gif",
  ".glb": "model/gltf-binary", ".stl": "model/stl", ".ttf": "font/ttf",
};
function serveStatic(req, res, pathname) {
  let rel = decodeURIComponent(pathname.replace(/^\/+/, ""));
  if (rel === "" || rel.endsWith("/")) rel += "index.html";
  const filePath = path.join(STATIC_DIR, rel);
  if (!filePath.startsWith(STATIC_DIR)) { res.writeHead(403); return res.end(); }
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); return res.end("not found"); }
    res.writeHead(200, {
      "Content-Type": MIME[path.extname(filePath)] || "application/octet-stream",
      "Cache-Control": "no-cache",
    });
    res.end(data);
  });
}

server.listen(PORT, () => {
  console.log(`chameleon server on http://localhost:${PORT} - pool ${photos.length}/${PHOTO_CAP}` +
              (PEXELS_KEY ? "" : " (no PEXELS_KEY: practice falls back to the repo photos)") +
              (DEV_KEY ? ` - verdicts on, ${verdictCount()} on file` : " - verdicts off (no MC_DEV_KEY)"));
});
