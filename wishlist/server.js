// Zero-dependency Node backend for the wishlist unfurl endpoint.
// - POST /api/unfurl { url } -> { title, image, price, domain }
// - Any other GET request serves static files from this directory
//   (handy for local dev; in production nginx serves statics directly
//   and only proxies /wishlist/api/* to this process).
"use strict";

const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");
const dns = require("dns").promises;
const net = require("net");
const { execFile } = require("child_process");

const PORT = process.env.PORT || 8021;
const STATIC_DIR = __dirname;
const FETCH_TIMEOUT_MS = 8000;
const MAX_HTML_BYTES = 650 * 1024; // 650 KB: Amazon puts image data at ~520 KB into the page

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

// ---------- SSRF guard ----------
// The unfurl endpoint fetches whatever URL a visitor supplies. Without this,
// someone could point it at internal services / cloud metadata endpoints.
function isPrivateIp(ip) {
  if (net.isIP(ip) === 4) {
    const [a, b] = ip.split(".").map(Number);
    if (a === 10) return true;
    if (a === 127) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 0) return true;
    return false;
  }
  if (net.isIP(ip) === 6) {
    const lower = ip.toLowerCase();
    return lower === "::1" || lower.startsWith("fc") || lower.startsWith("fd") || lower.startsWith("fe80");
  }
  return true; // unknown -> treat as unsafe
}

async function assertPublicHost(hostname) {
  const addrs = await dns.lookup(hostname, { all: true });
  if (addrs.length === 0) throw new Error("could not resolve host");
  for (const { address } of addrs) {
    if (isPrivateIp(address)) throw new Error("refusing to fetch private/internal address");
  }
}

// ---------- Fetch a page's HTML (capped size, timeout) ----------
function fetchHtml(targetUrl) {
  return new Promise((resolve, reject) => {
    const lib = targetUrl.protocol === "https:" ? https : http;
    const req = lib.get(
      targetUrl,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
          "Cache-Control": "no-cache",
        },
        timeout: FETCH_TIMEOUT_MS,
      },
      (res) => {
        // Follow a single redirect hop manually (keeps SSRF guard in effect
        // for the final destination too, since we re-check per request).
        if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
          res.resume();
          resolve({ redirect: new URL(res.headers.location, targetUrl) });
          return;
        }
        if (res.statusCode >= 400) {
          res.resume();
          reject(new Error(`upstream responded ${res.statusCode}`));
          return;
        }
        let data = "";
        let bytes = 0;
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          bytes += Buffer.byteLength(chunk);
          data += chunk;
          if (bytes >= MAX_HTML_BYTES) {
            res.destroy();
          }
        });
        res.on("end", () => resolve({ html: data }));
        res.on("close", () => resolve({ html: data }));
      }
    );
    req.on("timeout", () => req.destroy(new Error("timed out")));
    req.on("error", reject);
  });
}

// Some storefronts (Akamai/etc.) block Node's TLS+HTTP fingerprint while
// letting curl through from the very same host. If the Node fetch is blocked
// or comes back suspiciously empty, retry once via curl. The host has already
// passed the SSRF check and curl is told not to follow redirects.
function fetchHtmlViaCurl(urlObj) {
  return new Promise((resolve) => {
    // Minimal flags on purpose: no -L (so curl won't follow redirects to an
    // internal host), matching the plain request that gets through.
    execFile(
      "curl",
      [
        "-s",
        "--max-time", String(Math.ceil(FETCH_TIMEOUT_MS / 1000)),
        "-A", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        urlObj.href,
      ],
      { timeout: FETCH_TIMEOUT_MS + 2000, maxBuffer: MAX_HTML_BYTES + 65536 },
      (err, stdout) => resolve(err || !stdout ? "" : String(stdout).slice(0, MAX_HTML_BYTES))
    );
  });
}

async function fetchHtmlWithGuard(urlObj, hopsLeft = 2) {
  await assertPublicHost(urlObj.hostname);
  // Curl FIRST: it slips past bot-protection that blocks Node's TLS/HTTP
  // fingerprint, and a plain curl (no -L) won't follow redirects to internal
  // hosts. Trying Node first would trip the site's IP block and poison the
  // curl retry, so order matters here.
  let html = await fetchHtmlViaCurl(urlObj);
  if (html.length >= 500) return html;
  // Curl yielded nothing useful (e.g. the URL redirects, which plain curl won't
  // follow) — fall back to Node, which follows redirects with a per-hop guard.
  try {
    const result = await fetchHtml(urlObj);
    if (result.redirect && hopsLeft > 0) return fetchHtmlWithGuard(result.redirect, hopsLeft - 1);
    if ((result.html || "").length > html.length) html = result.html || "";
  } catch {
    /* keep whatever curl gave us */
  }
  return html;
}

// ---------- Extraction ----------
function matchMetaContent(html, patterns) {
  for (const re of patterns) {
    const m = html.match(re);
    if (m && m[1]) return decodeEntities(m[1].trim());
  }
  return "";
}

function decodeEntities(str) {
  return str
    // numeric decimal (&#39;) and hex (&#x27;) entities
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(parseInt(n, 10)))
    // common named entities
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&"); // must be last so it doesn't double-decode
}

function metaTag(prop) {
  // matches <meta property="X" content="Y"> in either attribute order
  return [
    new RegExp(`<meta[^>]+(?:property|name)=["']${prop}["'][^>]+content=["']([^"']*)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${prop}["']`, "i"),
  ];
}

function extractTitle(html) {
  const og = matchMetaContent(html, metaTag("og:title"));
  if (og) return og;
  const tw = matchMetaContent(html, metaTag("twitter:title"));
  if (tw) return tw;
  const t = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return t ? decodeEntities(t[1].trim()) : "";
}

function extractImage(html, pageUrl) {
  let img = matchMetaContent(html, metaTag("og:image:secure_url"));
  if (!img) img = matchMetaContent(html, metaTag("og:image"));
  if (!img) img = matchMetaContent(html, metaTag("twitter:image:src"));
  if (!img) img = matchMetaContent(html, metaTag("twitter:image"));
  // JSON-LD Product schema: "image": "URL"
  if (!img) {
    const m = html.match(/"image"\s*:\s*"(https?:\/\/[^"]+)"/);
    if (m) img = decodeEntities(m[1]);
  }
  // Amazon: data-old-hires on the main product image element
  if (!img) {
    const m = html.match(/data-old-hires="(https?:\/\/[^"]+)"/);
    if (m) img = decodeEntities(m[1]);
  }
  // Amazon: hiRes inside colorImages script block
  if (!img) {
    const m = html.match(/"hiRes"\s*:\s*"(https?:\/\/[^"]+)"/);
    if (m) img = decodeEntities(m[1]);
  }
  if (!img) return "";
  try {
    return new URL(img, pageUrl).href;
  } catch {
    return "";
  }
}

// Pull the raw { amount, currency } a storefront advertises. Note: many sites
// (esp. non-US locales) only embed their HOME currency in the HTML metadata and
// render the localized/USD price with client-side JS — which our scraper can't
// see. So whatever we get here is the origin currency; resolveUsdPrice() below
// converts it to USD.
function extractPriceRaw(html) {
  // Tier 1: explicit price meta tags used by most storefronts
  let amount = matchMetaContent(html, metaTag("product:price:amount"));
  let currency = matchMetaContent(html, metaTag("product:price:currency"));
  if (!amount) amount = matchMetaContent(html, metaTag("og:price:amount"));
  if (!currency) currency = matchMetaContent(html, metaTag("og:price:currency"));

  // Tier 2: itemprop="price"
  if (!amount) {
    const m = html.match(/itemprop=["']price["'][^>]*content=["']([^"']+)["']/i);
    if (m) amount = m[1];
  }

  // Tier 3: JSON-LD "price": "..." / "priceCurrency": "..."
  if (!amount) {
    const m = html.match(/"price"\s*:\s*"?([\d]+(?:\.\d{1,2})?)"?/);
    if (m) amount = m[1];
  }
  if (!currency) {
    const c = html.match(/"priceCurrency"\s*:\s*"([A-Z]{3})"/);
    if (c) currency = c[1];
  }

  if (!amount) return null;
  return { amount, currency: (currency || "").toUpperCase() };
}

function formatPrice(amount, currency) {
  const symbol = { USD: "$", EUR: "€", GBP: "£", JPY: "¥", CAD: "$", AUD: "$" }[currency] || "";
  const num = parseFloat(String(amount).replace(/[^0-9.]/g, ""));
  const shown = Number.isFinite(num) ? (Number.isInteger(num) ? String(num) : num.toFixed(2)) : amount;
  return symbol ? `${symbol}${shown}` : currency ? `${shown} ${currency}` : `$${shown}`;
}

// Cached FX rates (currency -> USD), so we don't hit the API on every unfurl.
const fxCache = new Map();
const FX_TTL_MS = 12 * 3600 * 1000;
function getUsdRate(currency) {
  return new Promise((resolve) => {
    if (!currency || currency === "USD") return resolve(1);
    const hit = fxCache.get(currency);
    if (hit && Date.now() - hit.ts < FX_TTL_MS) return resolve(hit.rate);
    const req = https.get(
      `https://api.frankfurter.dev/v1/latest?from=${encodeURIComponent(currency)}&to=USD`,
      { timeout: 5000 },
      (res) => {
        if (res.statusCode !== 200) { res.resume(); return resolve(null); }
        let data = "";
        res.on("data", (d) => (data += d));
        res.on("end", () => {
          try {
            const rate = JSON.parse(data)?.rates?.USD;
            if (typeof rate === "number") { fxCache.set(currency, { rate, ts: Date.now() }); resolve(rate); }
            else resolve(null);
          } catch { resolve(null); }
        });
      }
    );
    req.on("error", () => resolve(null));
    req.on("timeout", () => { req.destroy(); resolve(null); });
  });
}

// Extract the price and always return it in USD (converting when needed).
async function resolveUsdPrice(html) {
  const raw = extractPriceRaw(html);
  if (!raw) return "";
  const num = parseFloat(String(raw.amount).replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(num)) return "";
  if (raw.currency && raw.currency !== "USD") {
    const rate = await getUsdRate(raw.currency);
    if (rate) return `$${(num * rate).toFixed(2)}`; // converted to USD
    return formatPrice(raw.amount, raw.currency); // conversion unavailable — show origin
  }
  return formatPrice(raw.amount, raw.currency);
}

// Kept for the module export / any sync caller: format without conversion.
function extractPrice(html) {
  const raw = extractPriceRaw(html);
  return raw ? formatPrice(raw.amount, raw.currency) : "";
}

// ---------- Fallback: Microlink (free API, runs a headless browser) ----------
// Used when our own scrape fails or can't find an image. Not hardcoded per
// site; helps for any JS-rendered / OG-tag-missing page.
function fetchViaMicrolink(urlObj) {
  return new Promise((resolve, reject) => {
    const api = new URL("https://api.microlink.io/");
    api.searchParams.set("url", urlObj.href);
    const req = https.get(
      api,
      { headers: { "User-Agent": "kmufti-wishlist/1.0" }, timeout: FETCH_TIMEOUT_MS },
      (res) => {
        if (res.statusCode >= 400) {
          res.resume();
          reject(new Error(`microlink ${res.statusCode}`));
          return;
        }
        let body = "";
        res.setEncoding("utf8");
        res.on("data", (c) => (body += c));
        res.on("end", () => {
          try {
            const json = JSON.parse(body);
            const d = (json && json.data) || {};
            resolve({
              title: d.title || "",
              image: (d.image && d.image.url) || "",
              logo: (d.logo && d.logo.url) || "",
            });
          } catch (e) {
            reject(e);
          }
        });
      }
    );
    req.on("timeout", () => req.destroy(new Error("timed out")));
    req.on("error", reject);
  });
}

// Last-resort favicon so every card has *something* visual, even when the
// site blocks all scrapers.
function faviconFor(hostname) {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=128`;
}

// ---------- HTTP server ----------
function sendJson(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "Access-Control-Allow-Origin": "*",
  });
  res.end(body);
}

function serveStatic(req, res) {
  let reqPath = decodeURIComponent(req.url.split("?")[0]);
  if (reqPath === "/") reqPath = "/index.html";
  const filePath = path.normalize(path.join(STATIC_DIR, reqPath));
  if (!filePath.startsWith(STATIC_DIR)) {
    res.writeHead(403);
    res.end("forbidden");
    return;
  }
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("not found");
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    res.end();
    return;
  }

  if (req.method === "POST" && req.url.split("?")[0].endsWith("/api/unfurl")) {
    let body = "";
    let tooBig = false;
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 5000) tooBig = true;
    });
    req.on("end", async () => {
      if (tooBig) return sendJson(res, 400, { error: "request too large" });
      let parsed;
      try {
        parsed = JSON.parse(body);
      } catch {
        return sendJson(res, 400, { error: "invalid JSON" });
      }
      let urlObj;
      try {
        urlObj = new URL(parsed.url);
        if (!/^https?:$/.test(urlObj.protocol)) throw new Error("bad protocol");
      } catch {
        return sendJson(res, 400, { error: "invalid url" });
      }

      const domain = urlObj.hostname.replace(/^www\./, "");
      let title = "";
      let image = "";
      let price = "";

      // Tier 1: our own scraper (fast, no rate limits)
      try {
        const html = await fetchHtmlWithGuard(urlObj);
        title = extractTitle(html);
        image = extractImage(html, urlObj);
        price = await resolveUsdPrice(html);
      } catch {
        // swallow — we'll try the fallbacks below
      }

      // Tier 2: Microlink runs a real browser and can see pages our scraper can't.
      // Try it whenever we're missing a title OR an image.
      if (!image || !title) {
        try {
          const ml = await fetchViaMicrolink(urlObj);
          if (!title) title = ml.title;
          if (!image) image = ml.image || ml.logo;
        } catch {
          // swallow
        }
      }

      // Tier 3: guaranteed favicon so the card is never blank.
      if (!image) image = faviconFor(urlObj.hostname);
      if (!title) title = domain;

      sendJson(res, 200, { title, image, price, domain });
    });
    return;
  }

  // Image proxy: fetch a product image server-side and re-serve it from our
  // origin. Sends a same-origin Referer so hotlink-protected CDNs don't 403,
  // and sidesteps cross-site image blocking in the browser.
  if (req.method === "GET" && req.url.split("?")[0].endsWith("/api/img")) {
    return handleImageProxy(req, res);
  }

  if (req.method === "GET") {
    return serveStatic(req, res);
  }

  res.writeHead(405);
  res.end("method not allowed");
});

// ---------- Image proxy ----------
const MAX_IMG_BYTES = 8 * 1024 * 1024; // 8 MB

function fetchImage(targetUrl, hopsLeft = 3) {
  return new Promise((resolve, reject) => {
    const lib = targetUrl.protocol === "https:" ? https : http;
    const req = lib.get(
      targetUrl,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
          "Accept": "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
          // Pretend we're loading from the image's own site to beat hotlink guards.
          "Referer": targetUrl.origin + "/",
        },
        timeout: FETCH_TIMEOUT_MS,
      },
      (res) => {
        if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
          res.resume();
          if (hopsLeft <= 0) return reject(new Error("too many redirects"));
          let next;
          try {
            next = new URL(res.headers.location, targetUrl);
          } catch {
            return reject(new Error("bad redirect"));
          }
          assertPublicHost(next.hostname)
            .then(() => resolve(fetchImage(next, hopsLeft - 1)))
            .catch(reject);
          return;
        }
        if (res.statusCode >= 400) {
          res.resume();
          return reject(new Error(`upstream ${res.statusCode}`));
        }
        const type = res.headers["content-type"] || "";
        if (!/^image\//i.test(type)) {
          res.resume();
          return reject(new Error("not an image"));
        }
        const chunks = [];
        let bytes = 0;
        res.on("data", (c) => {
          bytes += c.length;
          if (bytes > MAX_IMG_BYTES) {
            res.destroy();
            reject(new Error("image too large"));
            return;
          }
          chunks.push(c);
        });
        res.on("end", () => resolve({ type, body: Buffer.concat(chunks) }));
      }
    );
    req.on("timeout", () => req.destroy(new Error("timed out")));
    req.on("error", reject);
  });
}

async function handleImageProxy(req, res) {
  const src = new URL(req.url, "http://localhost").searchParams.get("src");
  let urlObj;
  try {
    urlObj = new URL(src);
    if (!/^https?:$/.test(urlObj.protocol)) throw new Error("bad protocol");
  } catch {
    res.writeHead(400, { "Content-Type": "text/plain" });
    return res.end("bad src");
  }
  try {
    await assertPublicHost(urlObj.hostname);
    const img = await fetchImage(urlObj);
    res.writeHead(200, {
      "Content-Type": img.type,
      "Content-Length": img.body.length,
      "Cache-Control": "public, max-age=86400",
      "Access-Control-Allow-Origin": "*",
    });
    res.end(img.body);
  } catch {
    res.writeHead(502, { "Content-Type": "text/plain" });
    res.end("image fetch failed");
  }
}

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`wishlist server running at http://localhost:${PORT}`);
  });
}

module.exports = { extractTitle, extractImage, extractPrice, extractPriceRaw, resolveUsdPrice };
