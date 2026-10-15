// Zero-dependency Node backend for the "are you human" check (Cloudflare
// Turnstile), shared by every page that writes to a backend.
//
// A browser proves itself once with Turnstile and gets a signed cookie for a
// day. nginx asks this service about that cookie (auth_request) before it lets
// a request through to a protected route, so the backends themselves don't
// change at all.
//
//   GET  /api/status   {on, sitekey, human} - what the page needs to know
//   POST /api/verify   {token} - a Turnstile token; sets the cookie if it's good
//   GET  /api/check    204 or 401 - for nginx's auth_request only
//
// With no TURNSTILE_SECRET set the check is off: /api/check lets everything
// through and pages don't load Turnstile at all.
//
// Production: nginx proxies /human/api/* here, and the protected locations
// carry `auth_request /_human`. See deploy/nginx.conf and DEPLOY.md.
"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PORT = process.env.PORT || 8029;
const DATA_DIR = process.env.HUMAN_DATA || path.join(__dirname, "data");
const SECRET = process.env.TURNSTILE_SECRET || "";
const SITEKEY = process.env.TURNSTILE_SITEKEY || "";
const SITEVERIFY = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const COOKIE = "kh";
const DAY = 24 * 60 * 60;
const VERIFY_PER_IP_PER_MIN = 20;

/* ---------- the key that signs cookies ---------- */
// Random, made on first run and kept outside the repo. Deleting it logs every
// browser out of the check, which is harmless: they just pass it again.
function signingKey() {
  const file = path.join(DATA_DIR, "key");
  try { return fs.readFileSync(file); } catch { /* first run */ }
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const k = crypto.randomBytes(32);
  fs.writeFileSync(file, k, { mode: 0o600 });
  return k;
}
const KEY = signingKey();

const sign = (exp) => crypto.createHmac("sha256", KEY).update(String(exp)).digest("base64url");

function isHuman(req) {
  const m = /(?:^|;\s*)kh=(\d+)\.([\w-]+)/.exec(req.headers.cookie || "");
  if (!m || Number(m[1]) < Date.now() / 1000) return false;
  const want = Buffer.from(sign(m[1])), got = Buffer.from(m[2]);
  return want.length === got.length && crypto.timingSafeEqual(want, got);
}

/* ---------- a small per-IP limit on /verify ---------- */
const hits = new Map(); // ip -> { n, reset }
function allowed(ip) {
  const now = Date.now();
  let h = hits.get(ip);
  if (!h || now > h.reset) { h = { n: 0, reset: now + 60_000 }; hits.set(ip, h); }
  return ++h.n <= VERIFY_PER_IP_PER_MIN;
}
setInterval(() => { const now = Date.now(); for (const [ip, h] of hits) if (now > h.reset) hits.delete(ip); }, 60_000).unref();

function send(res, status, body, headers = {}) {
  res.writeHead(status, { "Content-Type": "application/json", "Cache-Control": "no-store", ...headers });
  res.end(body === undefined ? "" : JSON.stringify(body));
}

function readBody(req, limit = 4096) {
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
  const route = new URL(req.url, "http://x").pathname.replace(/^\/human/, "");
  const ip = req.headers["x-real-ip"] || req.socket.remoteAddress;

  if (route === "/api/check") {
    return send(res, !SECRET || isHuman(req) ? 204 : 401);
  }

  if (route === "/api/status" && req.method === "GET") {
    return send(res, 200, { on: !!SECRET, sitekey: SITEKEY, human: !SECRET || isHuman(req) });
  }

  if (route === "/api/verify" && req.method === "POST") {
    if (!SECRET) return send(res, 200, { ok: true });
    if (!allowed(ip)) return send(res, 429, { error: "slow down" });
    let token;
    try { ({ token } = JSON.parse(await readBody(req))); }
    catch { return send(res, 400, { error: "bad body" }); }
    if (typeof token !== "string" || !token || token.length > 2048) return send(res, 400, { error: "no token" });

    let result;
    try {
      const r = await fetch(SITEVERIFY, {
        method: "POST",
        body: new URLSearchParams({ secret: SECRET, response: token, remoteip: ip }),
        signal: AbortSignal.timeout(8000),
      });
      result = await r.json();
    } catch (e) {
      console.error("siteverify:", e.message);
      return send(res, 502, { error: "could not reach Cloudflare" });
    }
    if (!result.success) return send(res, 403, { error: "check failed", codes: result["error-codes"] });

    const exp = Math.floor(Date.now() / 1000) + DAY;
    return send(res, 200, { ok: true }, {
      "Set-Cookie": `${COOKIE}=${exp}.${sign(exp)}; Path=/; Max-Age=${DAY}; HttpOnly; Secure; SameSite=Lax`,
    });
  }

  send(res, 404, { error: "not found" });
});

server.listen(PORT, "127.0.0.1", () =>
  console.log(`human check on :${PORT} (${SECRET ? "on" : "off - no TURNSTILE_SECRET"}), key in ${DATA_DIR}`));
