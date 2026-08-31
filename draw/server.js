// Zero-dependency Node backend for the shared drawing canvas.
//
//   GET  /api/stream        Server-Sent Events: sends an "init" event (config +
//                           palette + full snapshot), then live "px" deltas,
//                           "presence" counts.
//   POST /api/paint         { id, cells:[[index,color],...] } -> applies cells
//                           (rate-limited by a per-client token bucket) and
//                           broadcasts them. Returns the client's meter state.
//
// There is deliberately NO wipe route. The wall is permanent: nothing the
// server exposes can blank the grid, so no misconfiguration can lose it. To
// reset it, stop the service and delete the canvas file by hand.
//
// Production: nginx serves the static hub and proxies /draw/api/* here. A
// leading "/draw" is stripped below so the same routes work whether the request
// arrives proxied (/api/...) or direct (/draw/api/... in local dev).
"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 8022;

// Must match the client (app.js): STAGE 1440x2400, CELL 8.
const CELL = 8;
const GRID_W = 180; // 1440 / 8
const GRID_H = 300; // 2400 / 8
const N = GRID_W * GRID_H; // 54,000 cells
const EMPTY = 255; // sentinel: unpainted (transparent)

// The 16-color palette — indices 0..15. Keep in sync with app.js.
const PALETTE = [
  "#fb0000", "#ff4400", "#ffaf0d", "#ffde00", "#bbff00", "#62d42d", "#075327", "#34dcd3",
  "#1caffd", "#003eff", "#6400ff", "#ff8bf6", "#ff00b7", "#ffffff", "#898989", "#000000",
];

// Paint allowance — a "clip" of pixels, then a hard cooldown before it refills.
// Draw up to CLIP pixels; the moment you hit 0 you must wait COOLDOWN_MS for a
// full fresh clip (no partial trickle — predictable for the user).
const CLIP = Number(process.env.DRAW_CLIP || 200);
const COOLDOWN_MS = Number(process.env.DRAW_COOLDOWN_MS || 10000);

const DATA_FILE = process.env.DRAW_DATA || path.join(__dirname, "canvas.bin");

/* ---------- Canvas state ---------- */
let grid = new Uint8Array(N).fill(EMPTY);
try {
  const buf = fs.readFileSync(DATA_FILE);
  if (buf.length === N) { grid = new Uint8Array(N); grid.set(buf); console.log("loaded canvas snapshot"); }
} catch { /* first run — start blank */ }

let saveTimer = null, dirty = false;
function scheduleSave() {
  dirty = true;
  if (saveTimer) return;
  saveTimer = setTimeout(() => {
    saveTimer = null;
    if (!dirty) return;
    dirty = false;
    const tmp = DATA_FILE + ".tmp";
    fs.writeFile(tmp, Buffer.from(grid.buffer, grid.byteOffset, grid.byteLength), (e) => {
      if (!e) fs.rename(tmp, DATA_FILE, () => {});
    });
  }, 3000);
}
function saveSync() {
  try { fs.writeFileSync(DATA_FILE, Buffer.from(grid.buffer, grid.byteOffset, grid.byteLength)); } catch {}
}
process.on("SIGTERM", () => { saveSync(); process.exit(0); });
process.on("SIGINT", () => { saveSync(); process.exit(0); });

/* ---------- SSE clients ---------- */
const clients = new Set();

function sseWrite(res, event, data) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}
function broadcast(event, data) {
  const msg = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const res of clients) { try { res.write(msg); } catch {} }
}
function broadcastPresence() {
  broadcast("presence", { count: clients.size });
}

// Keep proxied SSE connections alive with a periodic comment ping.
setInterval(() => { for (const res of clients) { try { res.write(": ping\n\n"); } catch {} } }, 25000);

/* ---------- Delta batching ---------- */
// Accepted cells accumulate here and flush to everyone every ~50ms as one
// "px" event, so 100 people drawing is still one small frame per tick.
let pending = [];
let flushTimer = null;
function queueDelta(i, c) {
  pending.push(i, c);
  if (!flushTimer) flushTimer = setTimeout(flushDeltas, 50);
}
function flushDeltas() {
  flushTimer = null;
  if (!pending.length) return;
  const d = pending; pending = [];
  broadcast("px", d); // flat [i,c,i,c,...]
}

/* ---------- Paint allowance (per client id): clip + hard cooldown ---------- */
const buckets = new Map(); // id -> { left, cooldownUntil, ts }
function takeTokens(id, want) {
  const now = Date.now();
  let b = buckets.get(id);
  if (!b) { b = { left: CLIP, cooldownUntil: 0, ts: now }; buckets.set(id, b); }
  b.ts = now;
  // Reload once the cooldown has elapsed.
  if (b.cooldownUntil && now >= b.cooldownUntil) { b.left = CLIP; b.cooldownUntil = 0; }
  // Still cooling down → nothing granted.
  if (b.cooldownUntil && now < b.cooldownUntil) {
    return { grant: 0, left: 0, cooldownMs: b.cooldownUntil - now };
  }
  const grant = Math.max(0, Math.min(want, b.left));
  b.left -= grant;
  if (b.left <= 0) { b.left = 0; b.cooldownUntil = now + COOLDOWN_MS; } // clip emptied → start reload
  return { grant, left: b.left, cooldownMs: b.cooldownUntil > now ? b.cooldownUntil - now : 0 };
}
// Sweep idle buckets hourly so the map can't grow without bound.
setInterval(() => {
  const cutoff = Date.now() - 3600 * 1000;
  for (const [id, b] of buckets) if (b.ts < cutoff) buckets.delete(id);
}, 600000);

/* ---------- HTTP helpers ---------- */
function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}
function readJson(req, cb) {
  let body = "", tooBig = false;
  req.on("data", (c) => {
    body += c;
    if (body.length > 1_000_000) { tooBig = true; req.destroy(); }
  });
  req.on("end", () => {
    if (tooBig) return cb(new Error("body too large"));
    try { cb(null, JSON.parse(body || "{}")); } catch (e) { cb(e); }
  });
}

/* ---------- Static file serving (dev convenience; nginx does this in prod) ---------- */
const STATIC_DIR = path.join(__dirname, "..");
const MIME = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml", ".png": "image/png", ".ico": "image/x-icon",
};
function serveStatic(req, res, pathname) {
  let rel = decodeURIComponent(pathname.replace(/^\/+/, ""));
  if (rel === "" ) rel = "index.html";
  const filePath = path.join(STATIC_DIR, rel);
  if (!filePath.startsWith(STATIC_DIR)) { res.writeHead(403); return res.end(); }
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); return res.end("not found"); }
    res.writeHead(200, { "Content-Type": MIME[path.extname(filePath)] || "application/octet-stream", "Cache-Control": "no-cache" });
    res.end(data);
  });
}

/* ---------- Router ---------- */
const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://x");
  let pathname = url.pathname;
  if (pathname.startsWith("/draw/")) pathname = pathname.slice(5); // strip proxy prefix

  if (req.method === "OPTIONS") { cors(res); res.writeHead(204); return res.end(); }

  // --- SSE stream ---
  if (pathname === "/api/stream" && req.method === "GET") {
    cors(res);
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no", // tell nginx not to buffer the stream
    });
    res.write("retry: 3000\n\n");
    sseWrite(res, "init", {
      gridW: GRID_W, gridH: GRID_H, cell: CELL, empty: EMPTY, palette: PALETTE,
      clip: CLIP, cooldownMs: COOLDOWN_MS,
      grid: Buffer.from(grid.buffer, grid.byteOffset, grid.byteLength).toString("base64"),
    });
    clients.add(res);
    broadcastPresence();
    req.on("close", () => { clients.delete(res); broadcastPresence(); });
    return;
  }

  // --- Paint ---
  if (pathname === "/api/paint" && req.method === "POST") {
    cors(res);
    readJson(req, (err, body) => {
      res.setHeader("Content-Type", "application/json");
      if (err || !body || typeof body.id !== "string" || !Array.isArray(body.cells)) {
        res.writeHead(400); return res.end(JSON.stringify({ error: "bad request" }));
      }
      const cells = body.cells;
      const { grant, left, cooldownMs } = takeTokens(body.id, cells.length);
      let accepted = 0;
      for (let k = 0; k < grant; k++) {
        const cell = cells[k];
        if (!Array.isArray(cell)) continue;
        const i = cell[0] | 0, c = cell[1] | 0;
        if (i < 0 || i >= N || c < 0 || c >= PALETTE.length) continue;
        if (grid[i] !== c) { grid[i] = c; queueDelta(i, c); }
        accepted++;
      }
      if (accepted) scheduleSave();
      res.writeHead(200);
      res.end(JSON.stringify({ left, cooldownMs, clip: CLIP, accepted }));
    });
    return;
  }

  // --- Static (dev only) ---
  if (req.method === "GET") return serveStatic(req, res, pathname);
  res.writeHead(404); res.end("not found");
});

server.listen(PORT, () => {
  console.log(`draw server on http://localhost:${PORT}  (grid ${GRID_W}x${GRID_H}=${N}, clip ${CLIP} / ${COOLDOWN_MS}ms)`);
});
