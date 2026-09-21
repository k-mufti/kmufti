// Zero-dependency Node backend for Infinite Kitchen.
//
// V1 has no AI: every recipe is written by hand in recipes.json. So the one
// job here is to keep the list of pairs players tried that have no recipe
// yet - the to-do list for writing the next batch.
//
//   GET  /api/health     counts, for a quick look
//   POST /api/missing    {a, b} - a player tried this pair and got nothing
//   GET  /api/missing    every open pair, most-tried first
//
// Only real items are accepted, and only pairs recipes.json doesn't already
// have, so the list can't be filled with junk. recipes.json is re-read when it
// changes on disk, and a pair that has since been given a recipe drops off
// the list by itself.
//
// Production: nginx proxies /infinite-kitchen/api/* here. A leading
// "/infinite-kitchen" is stripped below so the same routes work proxied or
// direct.
"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 8027;
const DATA_DIR = process.env.KITCHEN_DATA || path.join(__dirname, "data");
const MISSING_FILE = path.join(DATA_DIR, "missing.json");
const RECIPES_FILE = path.join(__dirname, "recipes.json");
const MAX_PAIRS = 20000;          // a cap on the file, far past any honest use
const PER_IP_PER_MIN = 60;

/* ---------- recipes, re-read when the file changes ---------- */
let items = {}, known = new Set(), recipesMtime = 0;
const key = (a, b) => [a, b].sort().join("|");

function loadRecipes() {
  try {
    const m = fs.statSync(RECIPES_FILE).mtimeMs;
    if (m === recipesMtime) return;
    const data = JSON.parse(fs.readFileSync(RECIPES_FILE, "utf8"));
    items = data.items || {};
    known = new Set(data.combos.map(([a, b]) => key(a, b)));
    recipesMtime = m;
  } catch (e) { console.error("recipes.json:", e.message); }
}
loadRecipes();

/* ---------- the missing list ---------- */
// key -> { a, b, tries, first, last }
let missing = new Map();
try {
  for (const p of JSON.parse(fs.readFileSync(MISSING_FILE, "utf8"))) missing.set(key(p.a, p.b), p);
} catch { /* first run */ }

let saveTimer = null;
function saveSoon() {
  if (saveTimer) return;
  saveTimer = setTimeout(() => {
    saveTimer = null;
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      const tmp = MISSING_FILE + ".tmp";
      fs.writeFileSync(tmp, JSON.stringify([...missing.values()]));
      fs.renameSync(tmp, MISSING_FILE);
    } catch (e) { console.error("missing.json save failed:", e.message); }
  }, 2000);
}

// Pairs that got a recipe since they were logged are dropped here rather
// than on a timer: the list is only ever looked at through this.
function openPairs() {
  loadRecipes();
  let dropped = false;
  for (const [k] of missing) if (known.has(k)) { missing.delete(k); dropped = true; }
  if (dropped) saveSoon();
  return [...missing.values()].sort((x, y) => y.tries - x.tries || x.first - y.first);
}

/* ---------- a small per-IP limit ---------- */
const hits = new Map();   // ip -> { n, reset }
function allowed(ip) {
  const now = Date.now();
  const h = hits.get(ip);
  if (!h || now > h.reset) { hits.set(ip, { n: 1, reset: now + 60000 }); return true; }
  return ++h.n <= PER_IP_PER_MIN;
}
setInterval(() => { const now = Date.now(); for (const [ip, h] of hits) if (now > h.reset) hits.delete(ip); }, 60000).unref();

/* ---------- http ---------- */
function send(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    // Local development serves the page from another port.
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(JSON.stringify(body));
}

function readBody(req, limit = 2048) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on("data", (c) => {
      size += c.length;
      if (size > limit) { reject(new Error("too big")); req.destroy(); return; }
      chunks.push(c);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://x");
  const route = url.pathname.replace(/^\/infinite-kitchen/, "");
  const ip = req.headers["x-real-ip"] || req.socket.remoteAddress;

  if (req.method === "OPTIONS") return send(res, 204, {});

  if (route === "/api/health" && req.method === "GET") {
    loadRecipes();
    return send(res, 200, { ok: true, recipes: known.size, items: Object.keys(items).length, open: openPairs().length });
  }

  if (route === "/api/missing" && req.method === "GET") {
    return send(res, 200, openPairs());
  }

  if (route === "/api/missing" && req.method === "POST") {
    if (!allowed(ip)) return send(res, 429, { error: "slow down" });
    let a, b;
    try { ({ a, b } = JSON.parse(await readBody(req))); }
    catch { return send(res, 400, { error: "bad body" }); }
    loadRecipes();
    if (typeof a !== "string" || typeof b !== "string" || !(a in items) || !(b in items)) {
      return send(res, 400, { error: "unknown item" });
    }
    const k = key(a, b);
    if (known.has(k)) return send(res, 200, { ok: true, known: true });
    const now = Date.now();
    const p = missing.get(k);
    if (p) { p.tries++; p.last = now; }
    else {
      if (missing.size >= MAX_PAIRS) return send(res, 507, { error: "list full" });
      const [x, y] = [a, b].sort();
      missing.set(k, { a: x, b: y, tries: 1, first: now, last: now });
    }
    saveSoon();
    return send(res, 200, { ok: true });
  }

  send(res, 404, { error: "not found" });
});

server.listen(PORT, () => console.log(`infinite-kitchen on :${PORT}, data in ${DATA_DIR}`));
