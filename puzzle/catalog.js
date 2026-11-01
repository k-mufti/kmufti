// What puzzles exist, read straight from two folders:
//
//   images/puzzles-queue/   not played yet - drop an image in here and push
//   images/done-puzzles/    solved; a GitHub job (move-done.js) moves them here
//                           once a day, and they come back round as replays
//                           when the queue runs dry
//
// A file's name is its title and piece count: "red-canyon-100.jpg" is Red
// Canyon at about 100 pieces. puzzles.json only holds the exceptions, keyed by
// the file name without its extension: a title the name can't spell, a fixed
// grid, or an older id the shelf already knows the puzzle by.
//
// Shared by server.js and move-done.js, so the two always agree on ids.
"use strict";

const fs = require("fs");
const path = require("path");

const QUEUE_DIR = "images/puzzles-queue";
const DONE_DIR = "images/done-puzzles";
const IMAGE_RE = /\.(png|jpe?g|webp|gif|svg)$/i;

function fromFilename(file) {
  const stem = file.replace(/\.[^.]+$/, "");
  const m = /^(.*?)[-_ ]+(\d{1,4})$/.exec(stem);
  const words = (m ? m[1] : stem).replace(/[-_]+/g, " ").trim();
  return {
    stem,
    pieces: m ? Number(m[2]) : null,
    title: words.replace(/\b\w/g, (c) => c.toUpperCase()),
    id: words.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || stem,
  };
}

function readOverrides(root) {
  try { return JSON.parse(fs.readFileSync(path.join(root, "puzzles.json"), "utf8")).puzzles || {}; }
  catch (e) { if (e.code !== "ENOENT") console.error("could not read puzzles.json:", e.message); return {}; }
}

function listFolder(root, dir) {
  let files = [];
  try { files = fs.readdirSync(path.join(root, dir)); } catch { /* no folder yet */ }
  return files.filter((f) => IMAGE_RE.test(f) && !f.startsWith("."))
    .sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" }));
}

// { queue: [...], done: [...] } - each entry { id, title, pieces?, image, file, where, ...overrides }.
// A puzzle sitting in both folders counts as queued (it was dragged back for a replay).
function scan(root) {
  const over = readOverrides(root);
  const entry = (dir, where) => (file) => {
    const named = fromFilename(file);
    const o = over[named.stem] || {};
    return {
      ...o,
      id: o.id || named.id,
      title: o.title || named.title,
      pieces: o.pieces || named.pieces,
      image: path.posix.join(dir, file),
      file, where,
    };
  };
  const queue = listFolder(root, QUEUE_DIR).map(entry(QUEUE_DIR, "queue"));
  const queued = new Set(queue.map((q) => q.id));
  const done = listFolder(root, DONE_DIR).map(entry(DONE_DIR, "done")).filter((d) => !queued.has(d.id));
  return { queue, done };
}

module.exports = { scan, fromFilename, QUEUE_DIR, DONE_DIR };
