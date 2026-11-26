#!/usr/bin/env node
/* Downloads each game's official share image (its og:image / twitter:image,
   the picture you see when you paste its link into a chat) into thumbs/,
   and writes thumbs/thumbs.js mapping id -> file. Games without one keep
   their ink drawing from art.js.

     node dailies/fetch-thumbs.js            # fetch missing ones
     node dailies/fetch-thumbs.js --force    # re-fetch all
     node dailies/fetch-thumbs.js wordle     # just these ids

   Re-run after adding games to games.js. Images are resized to 720px wide
   with macOS `sips` when it's available. */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { execFileSync } = require("child_process");

const DIR = __dirname;
const OUT = path.join(DIR, "thumbs");
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
const MAX_BYTES = 4 * 1024 * 1024;
// Share images that look bad as a card (thin banners etc.). These keep the ink drawing.
const SKIP = new Set(["octordle", "phoodle", "keyword", "geogrid", "who-are-ya", "songless"]);
const EXT = { "image/png": "png", "image/jpeg": "jpg", "image/jpg": "jpg", "image/webp": "webp", "image/gif": "gif" };

const ctx = {};
vm.runInNewContext(fs.readFileSync(path.join(DIR, "games.js"), "utf8") + ";this.GAMES=GAMES;", ctx);
const args = process.argv.slice(2);
const force = args.includes("--force");
const only = args.filter((a) => !a.startsWith("--"));

fs.mkdirSync(OUT, { recursive: true });
const manifestPath = path.join(OUT, "thumbs.js");
let manifest = {};
try { const m = {}; vm.runInNewContext(fs.readFileSync(manifestPath, "utf8") + ";this.T=THUMBS;", m); manifest = m.T || {}; } catch {}

function metaImage(html, base) {
  const tags = html.match(/<meta\b[^>]*>/gi) || [];
  const want = ["og:image:secure_url", "og:image", "twitter:image", "twitter:image:src"];
  for (const key of want) {
    for (const tag of tags) {
      const name = (tag.match(/\b(?:property|name)\s*=\s*["']([^"']+)["']/i) || [])[1];
      const content = (tag.match(/\bcontent\s*=\s*["']([^"']+)["']/i) || [])[1];
      if (name && content && name.toLowerCase() === key) {
        try { return new URL(content.replace(/&amp;/g, "&"), base).href; } catch {}
      }
    }
  }
  return null;
}

async function get(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 15000);
  try {
    return await fetch(url, { headers: { "user-agent": UA, accept: "text/html,image/*;q=0.9,*/*;q=0.8" }, redirect: "follow", signal: ctrl.signal });
  } finally { clearTimeout(t); }
}

async function one(g) {
  if (!/^https:\/\//.test(g.url)) return [g.id, "skip (not an external link)"];
  if (SKIP.has(g.id)) return [g.id, "skip (on the SKIP list)"];
  if (!force && manifest[g.id] && fs.existsSync(path.join(DIR, manifest[g.id]))) return [g.id, "have it"];
  const page = await get(g.url);
  if (!page.ok) return [g.id, "page " + page.status];
  const img = metaImage(await page.text(), page.url);
  if (!img) return [g.id, "no share image"];
  const res = await get(img);
  if (!res.ok) return [g.id, "image " + res.status];
  const type = (res.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length > MAX_BYTES) return [g.id, "too big"];
  // Trust the file's own bytes over the header (some servers say octet-stream).
  const sniff = buf[0] === 0x89 && buf.toString("ascii", 1, 4) === "PNG" ? "png"
    : buf[0] === 0xff && buf[1] === 0xd8 ? "jpg"
    : buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP" ? "webp"
    : buf.toString("ascii", 0, 3) === "GIF" ? "gif" : null;
  const ext = sniff || null;
  if (!ext) return [g.id, "not an image (" + type + ")"];
  for (const e of Object.values(EXT)) { try { fs.unlinkSync(path.join(OUT, g.id + "." + e)); } catch {} }
  const file = path.join(OUT, g.id + "." + ext);
  fs.writeFileSync(file, buf);
  try { if (ext !== "gif") execFileSync("sips", ["--resampleWidth", "720", file], { stdio: "ignore" }); } catch {}
  manifest[g.id] = "thumbs/" + g.id + "." + ext;
  return [g.id, "saved " + manifest[g.id] + " (" + img + ")"];
}

(async () => {
  const games = ctx.GAMES.filter((g) => !only.length || only.includes(g.id));
  for (const g of games) {
    let r;
    try { r = await one(g); } catch (e) { r = [g.id, "error " + (e.name === "AbortError" ? "timeout" : e.message)]; }
    console.log(r[0].padEnd(14), r[1]);
  }
  const lines = Object.keys(manifest).sort().map((k) => "  " + JSON.stringify(k) + ": " + JSON.stringify(manifest[k]) + ",");
  fs.writeFileSync(manifestPath, "// Written by fetch-thumbs.js — each game's official share image.\nconst THUMBS = {\n" + lines.join("\n") + "\n};\n");
  console.log("wrote thumbs/thumbs.js (" + lines.length + " images)");
})();
