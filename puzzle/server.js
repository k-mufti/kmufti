// Zero-dependency Node backend for the shared jigsaw table.
//
// One puzzle exists at a time and EVERYONE works on the same one. The server
// is authoritative for every piece: where it sits, who is holding it, and
// whether it has been placed. Clients only ever ask.
//
//   GET  /api/archive       the shelf: summaries of finished puzzles (JSON)
//   WS   /api/socket        the table itself (see the protocol below)
//
// Protocol, client -> server (JSON text frames):
//   {t:"hello", id, name, color}   introduce yourself; server replies "init"
//   {t:"name",  name, color}       rename yourself
//   {t:"cursor", x, y}             your pointer, in stage units
//   {t:"grab", p}                  ask to pick up piece p
//   {t:"move", x, y}               drag the piece you're holding
//   {t:"drop", x, y}               let go - server decides if it snaps home
//   {t:"shuffle"}                  tip the loose pieces back out across the table
//
// Protocol, server -> client:
//   {t:"init", ...}                whole world: puzzle, pieces, peers, shelf
//   {t:"join"|"left"|"renamed"}    presence deltas
//   {t:"tick", cur, pos}           batched cursors + piece positions (~50ms)
//   {t:"held", p, by} / {t:"freed", p}
//   {t:"placed", p, by, count}     a piece went home - permanent
//   {t:"solved", entry, nextIn}    last piece placed; celebration window
//   {t:"deny", p}                  your grab lost the race; put it back
//
// Production: nginx serves the static hub and proxies /puzzle/api/* here
// (with the WebSocket Upgrade headers). A leading "/puzzle" is stripped below
// so the same routes work proxied or direct (local dev).
"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PORT = process.env.PORT || 8023;

/* ---------- Table geometry - MUST match app.js ---------- */
const STAGE_W = 2200;
const STAGE_H = 1240;
// The biggest the assembled picture is allowed to get. Each puzzle's board is
// its own image's aspect fitted inside this box and centred, so a square or a
// panorama both sit correctly. The margin left over is the scatter zone - a
// tipped-out box needs somewhere to land.
const MAX_BOARD = { w: 1180, h: 800 };

// Fit w:h inside MAX_BOARD, centred on the table.
function fitBoard(w, h) {
  const scale = Math.min(MAX_BOARD.w / w, MAX_BOARD.h / h);
  const bw = Math.round(w * scale), bh = Math.round(h * scale);
  return { x: Math.round((STAGE_W - bw) / 2), y: Math.round((STAGE_H - bh) / 2), w: bw, h: bh };
}

// How long the finished puzzle stays on the table before the next one drops.
const CELEBRATE_MS = Number(process.env.PUZZLE_CELEBRATE_MS || 15000);

const DATA_FILE = process.env.PUZZLE_DATA || path.join(__dirname, "table.json");
const ARCHIVE_FILE = process.env.PUZZLE_ARCHIVE || path.join(__dirname, "shelf.json");
const QUEUE_FILE = path.join(__dirname, "puzzles.json");

/* ========================================================================
   The queue + the shelf
   ======================================================================== */
// Adding a puzzle should be: drop an image in images/, name it in
// puzzles.json. Everything else is worked out here - the file's real pixel
// size, a sensible grid, and which entries are actually ready to play.

// Pixel size straight from the file header. Beats making someone measure
// their own images, and a wrong number would stretch the picture.
function imageSize(file) {
  let buf;
  try { buf = fs.readFileSync(file); } catch { return null; }
  // PNG: IHDR sits at a fixed offset.
  if (buf.length > 24 && buf.readUInt32BE(0) === 0x89504e47) {
    return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
  }
  // GIF: logical screen descriptor, little-endian.
  if (buf.length > 10 && buf.toString("ascii", 0, 3) === "GIF") {
    return { w: buf.readUInt16LE(6), h: buf.readUInt16LE(8) };
  }
  // JPEG: walk the markers to whichever SOF frame header comes first.
  if (buf.length > 4 && buf[0] === 0xff && buf[1] === 0xd8) {
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
  // WebP: RIFF container, then one of three chunk layouts.
  if (buf.length > 30 && buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") {
    const chunk = buf.toString("ascii", 12, 16);
    if (chunk === "VP8X") {
      return { w: (buf.readUIntLE(24, 3) & 0xffffff) + 1, h: (buf.readUIntLE(27, 3) & 0xffffff) + 1 };
    }
    if (chunk === "VP8 ") {
      return { w: buf.readUInt16LE(26) & 0x3fff, h: buf.readUInt16LE(28) & 0x3fff };
    }
    if (chunk === "VP8L" && buf[20] === 0x2f) {
      const bits = buf.readUInt32LE(21);
      return { w: (bits & 0x3fff) + 1, h: ((bits >> 14) & 0x3fff) + 1 };
    }
  }

  // SVG: explicit width/height, else the viewBox.
  const text = buf.toString("utf8", 0, Math.min(buf.length, 4096));
  if (text.includes("<svg")) {
    const w = /\bwidth\s*=\s*["']([\d.]+)/.exec(text);
    const h = /\bheight\s*=\s*["']([\d.]+)/.exec(text);
    if (w && h) return { w: parseFloat(w[1]), h: parseFloat(h[1]) };
    const vb = /viewBox\s*=\s*["']\s*[\d.-]+\s+[\d.-]+\s+([\d.]+)\s+([\d.]+)/.exec(text);
    if (vb) return { w: parseFloat(vb[1]), h: parseFloat(vb[2]) };
  }
  return null;
}

// The manifest may name an image with or without its extension, so dropping a
// .png or a .jpg with the right name both work.
const IMAGE_EXTS = ["", ".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"];
function resolveImage(spec) {
  for (const ext of IMAGE_EXTS) {
    const rel = spec + ext;
    try { fs.accessSync(path.join(__dirname, rel)); return rel; } catch { /* keep looking */ }
  }
  return null;
}

// Pick the grid closest to the wanted piece count whose pieces come out most
// nearly square. A 3:2 picture at 50 lands on 9x6; a square one on 7x7.
function chooseGrid(w, h, target) {
  let best = null;
  for (let cols = 2; cols <= 24; cols++) {
    for (let rows = 2; rows <= 24; rows++) {
      const off = Math.abs(cols * rows - target) / target;
      const squareness = Math.abs(Math.log((w / cols) / (h / rows)));
      const score = off * 2 + squareness;
      if (!best || score < best.score) best = { cols, rows, score };
    }
  }
  return best;
}

const DEFAULT_PIECES = Number(process.env.PUZZLE_PIECES || 50);

// A filename can carry the piece count and the title: "images/red-canyon-100"
// is Red Canyon at about 100 pieces. It saves repeating in the manifest what
// the file already says. Anything set explicitly on the entry still wins, and
// a name with no trailing number just falls back to the default.
function fromFilename(spec) {
  const base = path.basename(spec).replace(/\.[^.]+$/, "");
  const m = /^(.*?)[-_ ]+(\d{1,4})$/.exec(base);
  const words = (m ? m[1] : base).replace(/[-_]+/g, " ").trim();
  return {
    pieces: m ? Number(m[2]) : null,
    title: words.replace(/\b\w/g, (c) => c.toUpperCase()),
  };
}

// Read the manifest and keep only the entries that are actually playable.
// Called again at every changeover, so a puzzle added to a running table joins
// the rotation without a restart.
function loadQueue() {
  let raw = [];
  try { raw = JSON.parse(fs.readFileSync(QUEUE_FILE, "utf8")).queue || []; }
  catch (e) { console.error("could not read puzzles.json:", e.message); }

  const ready = [];
  const waiting = [];
  for (const def of raw) {
    const image = resolveImage(def.image);
    if (!image) { waiting.push(def.id); continue; }
    const size = imageSize(path.join(__dirname, image)) || { w: 1200, h: 800 };
    const w = def.imageW || size.w, h = def.imageH || size.h;
    const named = fromFilename(image);
    const pieces = def.pieces || named.pieces || DEFAULT_PIECES;
    const grid = def.cols && def.rows ? { cols: def.cols, rows: def.rows }
                                      : chooseGrid(w, h, pieces);
    ready.push({ ...def, title: def.title || named.title, image,
                 imageW: w, imageH: h, cols: grid.cols, rows: grid.rows });
  }
  if (waiting.length) console.log(`waiting on an image: ${waiting.join(", ")}`);
  for (const d of ready) {
    console.log(`  ${d.id.padEnd(11)} ${String(d.imageW).padStart(5)}x${String(d.imageH).padEnd(5)} -> ${d.cols}x${d.rows} = ${d.cols * d.rows} pieces`);
  }
  return ready;
}

let QUEUE = loadQueue();

let shelf = []; // finished puzzles, newest first
try { shelf = JSON.parse(fs.readFileSync(ARCHIVE_FILE, "utf8")) || []; } catch { /* first run */ }
function saveShelf() {
  const tmp = ARCHIVE_FILE + ".tmp";
  try {
    fs.writeFileSync(tmp, JSON.stringify(shelf));
    fs.renameSync(tmp, ARCHIVE_FILE);
  } catch (e) { console.error("shelf save failed:", e.message); }
}
// The shelf card - everything except the per-piece `order` log, which is only
// needed for a solve replay and would bloat every page load.
function shelfCard(e) {
  const { order, ...rest } = e;
  // A card keeps the image path it was solved with, so renaming a file would
  // otherwise leave a hole on the shelf. The id is the thing that lasts: if
  // the stored path has gone, take whatever the queue calls that puzzle now.
  if (!resolveImage(rest.image)) {
    const live = QUEUE.find((q) => q.id === e.id);
    if (live) rest.image = live.image;
  }
  return rest;
}

/* ========================================================================
   Puzzle construction
   ======================================================================== */
// Tab directions live on the SHARED edges between pieces, so two neighbours
// always agree: +1 and -1 are the two ways a knob can point, 0 is a flat
// border edge. hEdge[r][c] is the edge above piece (c,r); vEdge[r][c] is the
// edge to its left. Sent to every client so all of us cut the same pieces.
function makeEdges(cols, rows) {
  const h = [], v = [];
  for (let r = 0; r <= rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) row.push(r === 0 || r === rows ? 0 : (Math.random() < 0.5 ? -1 : 1));
    h.push(row);
  }
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c <= cols; c++) row.push(c === 0 || c === cols ? 0 : (Math.random() < 0.5 ? -1 : 1));
    v.push(row);
  }
  return { h, v };
}

// Scatter a loose piece into the margin around the board - the way you tip a
// box out around the frame. Overlap is fine (that's what a real table looks
// like); we only keep pieces on the table and off the board outline.
function scatter(pw, ph, board) {
  const pad = 0.3 * Math.min(pw, ph); // keep the knobs on the table
  const minX = pad, maxX = STAGE_W - pw - pad;
  const minY = pad, maxY = STAGE_H - ph - pad;
  const keepOut = { x: board.x - 24, y: board.y - 24, w: board.w + 48, h: board.h + 48 };
  for (let i = 0; i < 80; i++) {
    const x = minX + Math.random() * (maxX - minX);
    const y = minY + Math.random() * (maxY - minY);
    const clear = x + pw < keepOut.x || x > keepOut.x + keepOut.w ||
                  y + ph < keepOut.y || y > keepOut.y + keepOut.h;
    if (clear) return { x, y };
  }
  return { x: minX, y: minY };
}

// `table` is the whole live world. Pieces carry `r` (rotation) so the wire
// format and the save file are already shaped for it - V1 leaves every piece
// upright, and turning rotation on later doesn't change the protocol.
let table = null;

function newTable(queueIndex) {
  const def = QUEUE[queueIndex % QUEUE.length];
  const cols = def.cols, rows = def.rows;
  const board = fitBoard(def.imageW || 1200, def.imageH || 800);
  const pw = board.w / cols, ph = board.h / rows;
  const edges = makeEdges(cols, rows);
  const pieces = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const s = scatter(pw, ph, board);
      pieces.push({ x: s.x, y: s.y, r: 0, placed: false, by: null });
    }
  }
  return {
    def, queueIndex: queueIndex % QUEUE.length,
    cols, rows, board, pw, ph, edges, pieces,
    placedCount: 0,
    startedAt: Date.now(),
    contributors: {},   // clientId -> { name, color, count }
    order: [],          // [pieceIndex, name, msSinceStart] - kept for replays
    solvedAt: 0,        // non-zero during the celebration window
  };
}

/* ---------- Save / restore so a restart doesn't wipe the table ---------- */
let saveTimer = null;
function scheduleSave() {
  if (saveTimer) return;
  saveTimer = setTimeout(() => { saveTimer = null; saveTable(); }, 2000);
}
function saveTable() {
  if (!table) return;
  const snap = {
    id: table.def.id, queueIndex: table.queueIndex,
    cols: table.cols, rows: table.rows, edges: table.edges,
    boardW: table.board.w, boardH: table.board.h,
    pieces: table.pieces, placedCount: table.placedCount,
    startedAt: table.startedAt, contributors: table.contributors, order: table.order,
  };
  const tmp = DATA_FILE + ".tmp";
  try { fs.writeFileSync(tmp, JSON.stringify(snap)); fs.renameSync(tmp, DATA_FILE); }
  catch (e) { console.error("table save failed:", e.message); }
}
function restoreTable() {
  let snap;
  try { snap = JSON.parse(fs.readFileSync(DATA_FILE, "utf8")); } catch { return null; }
  const idx = QUEUE.findIndex((q) => q.id === snap.id);
  if (idx < 0) return null; // that puzzle left the queue - start fresh
  const def = QUEUE[idx];
  if (def.cols !== snap.cols || def.rows !== snap.rows) return null; // re-cut since
  const want = fitBoard(def.imageW || 1200, def.imageH || 800);
  // Piece positions are absolute table coordinates, so a resized desk or a
  // bigger board would leave every placed piece sitting off its slot.
  // A snapshot from before the board was recorded can't be checked, and the
  // desk has changed size since, so it goes too rather than restoring wrong.
  if (snap.boardW !== want.w || snap.boardH !== want.h) return null;
  if (!Array.isArray(snap.pieces) || snap.pieces.length !== snap.cols * snap.rows) return null;
  const board = fitBoard(def.imageW || 1200, def.imageH || 800);
  return {
    def, queueIndex: idx, cols: snap.cols, rows: snap.rows, board,
    pw: board.w / snap.cols, ph: board.h / snap.rows,
    edges: snap.edges, pieces: snap.pieces,
    placedCount: snap.placedCount || 0,
    startedAt: snap.startedAt || Date.now(),
    contributors: snap.contributors || {},
    order: snap.order || [],
    solvedAt: 0,
  };
}

// Which puzzle to put out when there's no table to carry on from. Walking
// forward to the first one nobody has finished yet beats always starting at
// the top of the queue and handing the room a picture it has already solved.
// Once the whole wall has been played there is nothing to skip to, so it
// falls back to the next in line and the queue simply comes round again.
function pickPuzzle(from) {
  const played = new Set(shelf.map((e) => e.id));
  for (let k = 0; k < QUEUE.length; k++) {
    const i = (from + k) % QUEUE.length;
    if (!played.has(QUEUE[i].id)) return i;
  }
  return from % QUEUE.length;
}

table = restoreTable() || newTable(pickPuzzle(0));
console.log(`table: ${table.def.id} - ${table.placedCount}/${table.pieces.length} placed`);

process.on("SIGTERM", () => { saveTable(); process.exit(0); });
process.on("SIGINT", () => { saveTable(); process.exit(0); });

function homeOf(i) {
  const c = i % table.cols, r = (i / table.cols) | 0;
  return { x: table.board.x + c * table.pw, y: table.board.y + r * table.ph };
}

/* ========================================================================
   A minimal RFC 6455 WebSocket server
   ------------------------------------------------------------------------
   Everything here is duplex and high-frequency (cursors, drags), which is
   the one thing SSE + POST can't do well - hence a real socket. Kept small
   and dependency-free to match the rest of the hub: text frames, ping/pong,
   close, and continuation frames. That's all this app speaks.
   ======================================================================== */
const WS_GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
const MAX_FRAME = 256 * 1024; // a cursor update is ~40 bytes; this is generous

function wsAccept(key) {
  return crypto.createHash("sha1").update(key + WS_GUID).digest("base64");
}

function encodeFrame(opcode, payload) {
  const len = payload.length;
  let header;
  if (len < 126) {
    header = Buffer.alloc(2); header[1] = len;
  } else if (len < 65536) {
    header = Buffer.alloc(4); header[1] = 126; header.writeUInt16BE(len, 2);
  } else {
    header = Buffer.alloc(10); header[1] = 127;
    header.writeUInt32BE(Math.floor(len / 4294967296), 2);
    header.writeUInt32BE(len >>> 0, 6);
  }
  header[0] = 0x80 | opcode; // FIN + opcode; we never fragment outbound
  return Buffer.concat([header, payload]);
}

// Feed socket bytes in, get complete messages out. Returns false on a protocol
// violation (the caller then closes the socket).
function makeParser(onMessage, onClose, onPing) {
  let buf = Buffer.alloc(0);
  let fragOp = 0, frags = [];
  return function feed(chunk) {
    buf = buf.length ? Buffer.concat([buf, chunk]) : chunk;
    for (;;) {
      if (buf.length < 2) return true;
      const b0 = buf[0], b1 = buf[1];
      const fin = (b0 & 0x80) !== 0;
      const opcode = b0 & 0x0f;
      const masked = (b1 & 0x80) !== 0;
      let len = b1 & 0x7f;
      let off = 2;
      if (len === 126) {
        if (buf.length < off + 2) return true;
        len = buf.readUInt16BE(off); off += 2;
      } else if (len === 127) {
        if (buf.length < off + 8) return true;
        const hi = buf.readUInt32BE(off), lo = buf.readUInt32BE(off + 4);
        len = hi * 4294967296 + lo; off += 8;
      }
      if (len > MAX_FRAME) return false;             // oversized: hang up
      if (!masked) return false;                     // clients MUST mask
      if (buf.length < off + 4) return true;
      const mask = buf.slice(off, off + 4); off += 4;
      if (buf.length < off + len) return true;       // wait for the rest
      const payload = Buffer.allocUnsafe(len);
      for (let i = 0; i < len; i++) payload[i] = buf[off + i] ^ mask[i & 3];
      buf = buf.slice(off + len);

      if (opcode === 0x8) { onClose(); return true; }
      if (opcode === 0x9) { onPing(payload); continue; }
      if (opcode === 0xa) continue;                  // pong - liveness only
      if (opcode === 0x0) {                          // continuation
        if (!fragOp) return false;
        frags.push(payload);
        if (fin) {
          const full = Buffer.concat(frags);
          frags = []; const op = fragOp; fragOp = 0;
          if (op === 0x1) onMessage(full.toString("utf8"));
        }
        continue;
      }
      if (opcode === 0x1 || opcode === 0x2) {
        if (!fin) { fragOp = opcode; frags = [payload]; continue; }
        if (opcode === 0x1) onMessage(payload.toString("utf8"));
        continue;
      }
      return false; // unknown opcode
    }
  };
}

/* ========================================================================
   Connected people
   ======================================================================== */
const peers = new Set(); // { socket, id, name, color, x, y, holding }
let nextSeat = 1;

function send(peer, obj) {
  try { peer.socket.write(encodeFrame(0x1, Buffer.from(JSON.stringify(obj)))); } catch { /* gone */ }
}
function broadcast(obj, except) {
  const frame = encodeFrame(0x1, Buffer.from(JSON.stringify(obj)));
  for (const p of peers) {
    if (p === except || !p.id) continue;
    try { p.socket.write(frame); } catch { /* gone */ }
  }
}
// Ping every 25s so proxies don't reap idle sockets.
setInterval(() => {
  const ping = encodeFrame(0x9, Buffer.alloc(0));
  for (const p of peers) { try { p.socket.write(ping); } catch { /* gone */ } }
}, 25000);

function cleanName(s) {
  return String(s || "").replace(/[\u0000-\u001f\u007f<>]/g, "").trim().slice(0, 18) || "someone";
}
function cleanColor(s) {
  return /^#[0-9a-fA-F]{6}$/.test(s || "") ? s : "#c9663a";
}

/* ---------- The 50ms tick: one small frame instead of a storm ---------- */
// Cursors and drags arrive continuously from everyone. Rather than relaying
// each one, we coalesce: only the LATEST position per cursor and per piece
// survives a tick, so ten people dragging is still one small frame.
const dirtyCursors = new Set(); // peers
const dirtyPieces = new Set();  // piece indices
setInterval(() => {
  if (!dirtyCursors.size && !dirtyPieces.size) return;
  const cur = [];
  for (const p of dirtyCursors) if (p.id) cur.push([p.id, Math.round(p.x), Math.round(p.y)]);
  const pos = [];
  for (const i of dirtyPieces) {
    const pc = table.pieces[i];
    if (pc) pos.push([i, Math.round(pc.x), Math.round(pc.y)]);
  }
  dirtyCursors.clear(); dirtyPieces.clear();
  if (cur.length || pos.length) broadcast({ t: "tick", cur, pos });
}, 50);

function peerList(except) {
  const out = [];
  for (const p of peers) {
    if (!p.id || p === except) continue;
    out.push({ id: p.id, name: p.name, color: p.color, x: Math.round(p.x), y: Math.round(p.y), holding: p.holding });
  }
  return out;
}

function heldMap() {
  const m = {};
  for (const p of peers) if (p.holding != null) m[p.holding] = p.id;
  return m;
}
function contributorList() {
  return Object.values(table.contributors)
    .map((c) => ({ name: c.name, color: c.color, count: c.count }))
    .sort((a, b) => b.count - a.count);
}

function initPayload(peer) {
  return {
    t: "init",
    you: { id: peer.id, name: peer.name, color: peer.color },
    stage: { w: STAGE_W, h: STAGE_H },
    board: table.board,
    puzzle: {
      id: table.def.id, title: table.def.title, image: table.def.image,
      cols: table.cols, rows: table.rows,
    },
    edges: table.edges,
    pieces: table.pieces.map((p) => ({ x: Math.round(p.x), y: Math.round(p.y), r: p.r, placed: p.placed })),
    held: heldMap(),
    placedCount: table.placedCount,
    startedAt: table.startedAt,
    contributors: contributorList(),
    solvedAt: table.solvedAt,
    peers: peerList(peer),
    shelf: shelf.slice(0, 24).map(shelfCard),
  };
}

/* ========================================================================
   Gameplay
   ======================================================================== */
function holderOf(pieceIndex) {
  for (const p of peers) if (p.holding === pieceIndex) return p;
  return null;
}

function clamp(v, lo, hi) {
  v = Number(v);
  if (!Number.isFinite(v)) return lo;
  return v < lo ? lo : v > hi ? hi : v;
}

function onGrab(peer, i) {
  if (!Number.isInteger(i) || i < 0 || i >= table.pieces.length) return;
  if (table.solvedAt) return send(peer, { t: "deny", p: i });
  const piece = table.pieces[i];
  // Placed pieces are permanent: once a piece is home nobody can pull it back
  // out. That single rule is what makes the table safe to leave unattended.
  if (piece.placed) return send(peer, { t: "deny", p: i });
  if (holderOf(i)) return send(peer, { t: "deny", p: i }); // someone else got there first
  if (peer.holding != null) {                              // one piece at a time,
    const prev = peer.holding; peer.holding = null;        // like one pair of hands
    broadcast({ t: "freed", p: prev });
  }
  peer.holding = i;
  broadcast({ t: "held", p: i, by: peer.id });
}

function onMove(peer, x, y) {
  if (peer.holding == null) return;
  const piece = table.pieces[peer.holding];
  if (!piece || piece.placed) return;
  piece.x = clamp(x, -table.pw * 0.5, STAGE_W - table.pw * 0.5);
  piece.y = clamp(y, -table.ph * 0.5, STAGE_H - table.ph * 0.5);
  dirtyPieces.add(peer.holding);
}

function onDrop(peer, x, y) {
  if (peer.holding == null) return;
  const i = peer.holding;
  const piece = table.pieces[i];
  peer.holding = null;
  if (!piece || piece.placed) return;
  piece.x = clamp(x, -table.pw * 0.5, STAGE_W - table.pw * 0.5);
  piece.y = clamp(y, -table.ph * 0.5, STAGE_H - table.ph * 0.5);

  const home = homeOf(i);
  const snap = Math.max(16, Math.min(table.pw, table.ph) * 0.25);
  if (Math.abs(piece.x - home.x) <= snap && Math.abs(piece.y - home.y) <= snap) {
    piece.x = home.x; piece.y = home.y; piece.placed = true; piece.by = peer.name;
    table.placedCount++;
    const c = table.contributors[peer.id] ||
      (table.contributors[peer.id] = { name: peer.name, color: peer.color, count: 0 });
    c.name = peer.name; c.color = peer.color; c.count++;
    table.order.push([i, peer.name, Date.now() - table.startedAt]);
    broadcast({
      t: "placed", p: i, by: { id: peer.id, name: peer.name, color: peer.color },
      count: table.placedCount, contributors: contributorList(),
    });
    scheduleSave();
    if (table.placedCount >= table.pieces.length) finish(peer);
    return;
  }
  broadcast({ t: "freed", p: i });
  dirtyPieces.add(i);
  scheduleSave();
}

// Last piece in: shelve it, tell the room, and set the next one going.
function finish(lastPeer) {
  const now = Date.now();
  table.solvedAt = now;
  const entry = {
    id: table.def.id,
    title: table.def.title,
    image: table.def.image,
    cols: table.cols, rows: table.rows,
    boardW: table.board.w, boardH: table.board.h,
    pieces: table.pieces.length,
    startedAt: table.startedAt,
    finishedAt: now,
    ms: now - table.startedAt,
    contributors: contributorList(),
    lastBy: { name: lastPeer.name, color: lastPeer.color },
    order: table.order,
  };
  shelf.unshift(entry);
  if (shelf.length > 200) shelf.length = 200;
  saveShelf();
  broadcast({ t: "solved", entry: shelfCard(entry), nextIn: CELEBRATE_MS });
  setTimeout(nextPuzzle, CELEBRATE_MS);
}

// Tip the loose pieces back out. Placed ones are permanent and never move,
// and a piece somebody is holding stays in their hand rather than being
// yanked out of it. One shuffle at a time for the whole room: it is a shared
// table, and a held-down button would make it unplayable for everyone else.
let lastShuffle = 0;
const SHUFFLE_GAP_MS = 4000;

function onShuffle(peer) {
  const now = Date.now();
  if (table.solvedAt || now - lastShuffle < SHUFFLE_GAP_MS) return;
  lastShuffle = now;

  const pos = [];
  for (let i = 0; i < table.pieces.length; i++) {
    const p = table.pieces[i];
    if (p.placed || holderOf(i)) continue;
    const s = scatter(table.pw, table.ph, table.board);
    p.x = s.x; p.y = s.y;
    pos.push([i, Math.round(p.x), Math.round(p.y)]);
  }
  if (!pos.length) return;
  scheduleSave();
  broadcast({ t: "shuffled", pos, by: peer.name });
}

function nextPuzzle() {
  const currentId = table.def.id;
  const fresh = loadQueue();
  if (fresh.length) QUEUE = fresh;
  const at = QUEUE.findIndex((q) => q.id === currentId);
  table = newTable(pickPuzzle((at < 0 ? table.queueIndex : at) + 1));
  for (const p of peers) p.holding = null;
  saveTable();
  console.log(`next puzzle: ${table.def.id} (${table.pieces.length} pieces)`);
  for (const p of peers) if (p.id) send(p, initPayload(p));
}

/* ========================================================================
   Message routing
   ======================================================================== */
function handle(peer, raw) {
  let m;
  try { m = JSON.parse(raw); } catch { return; }
  if (!m || typeof m.t !== "string") return;

  if (m.t === "hello") {
    if (peer.id) return; // already seated
    peer.id = (typeof m.id === "string" && /^[A-Za-z0-9_-]{4,40}$/.test(m.id)) ? m.id : "s" + (nextSeat++);
    peer.name = cleanName(m.name);
    peer.color = cleanColor(m.color);
    send(peer, initPayload(peer));
    broadcast({ t: "join", peer: { id: peer.id, name: peer.name, color: peer.color, x: 0, y: 0, holding: null } }, peer);
    return;
  }
  if (!peer.id) return; // everything else needs a hello first

  switch (m.t) {
    case "cursor":
      peer.x = clamp(m.x, -200, STAGE_W + 200);
      peer.y = clamp(m.y, -200, STAGE_H + 200);
      dirtyCursors.add(peer);
      break;
    case "grab": onGrab(peer, m.p | 0); break;
    case "move": onMove(peer, m.x, m.y); break;
    case "drop": onDrop(peer, m.x, m.y); break;
    case "shuffle": onShuffle(peer); break;
    case "name":
      peer.name = cleanName(m.name);
      peer.color = cleanColor(m.color);
      if (table.contributors[peer.id]) {
        table.contributors[peer.id].name = peer.name;
        table.contributors[peer.id].color = peer.color;
      }
      broadcast({ t: "renamed", id: peer.id, name: peer.name, color: peer.color });
      break;
  }
}

/* ========================================================================
   HTTP + upgrade
   ======================================================================== */
const STATIC_DIR = path.join(__dirname, "..");
const MIME = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml", ".png": "image/png", ".ico": "image/x-icon",
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".gif": "image/gif",
  ".wav": "audio/wav", ".mp3": "audio/mpeg", ".ttf": "font/ttf",
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
function stripPrefix(pathname) {
  return pathname.startsWith("/puzzle/") ? pathname.slice(7) : pathname;
}

const server = http.createServer((req, res) => {
  const pathname = new URL(req.url, "http://x").pathname;
  // API routes are matched with the proxy prefix stripped; static files are
  // served from the real path so /puzzle/ still finds puzzle/index.html.
  const apiPath = stripPrefix(pathname);

  if (apiPath === "/api/replay" && req.method === "GET") {
    const at = Number(new URL(req.url, "http://x").searchParams.get("at"));
    const entry = shelf.find((e) => e.finishedAt === at);
    res.writeHead(entry ? 200 : 404, {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-cache",
    });
    return res.end(JSON.stringify(entry ? { order: entry.order } : { error: "no such solve" }));
  }

  if (apiPath === "/api/archive" && req.method === "GET") {
    res.writeHead(200, {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-cache",
    });
    return res.end(JSON.stringify(shelf.map(shelfCard)));
  }
  if (req.method === "GET") return serveStatic(req, res, pathname); // dev only; nginx does this in prod
  res.writeHead(404); res.end("not found");
});

server.on("upgrade", (req, socket) => {
  const pathname = stripPrefix(new URL(req.url, "http://x").pathname);
  const key = req.headers["sec-websocket-key"];
  if (pathname !== "/api/socket" || !key || (req.headers.upgrade || "").toLowerCase() !== "websocket") {
    socket.write("HTTP/1.1 400 Bad Request\r\n\r\n"); return socket.destroy();
  }
  socket.write(
    "HTTP/1.1 101 Switching Protocols\r\n" +
    "Upgrade: websocket\r\nConnection: Upgrade\r\n" +
    `Sec-WebSocket-Accept: ${wsAccept(key)}\r\n\r\n`
  );
  socket.setNoDelay(true);

  const peer = { socket, id: null, name: "someone", color: "#c9663a", x: 0, y: 0, holding: null };
  peers.add(peer);

  const bye = () => {
    if (!peers.has(peer)) return;
    peers.delete(peer);
    dirtyCursors.delete(peer);
    // Walking away puts your piece back on the table for everyone else.
    if (peer.holding != null) { const i = peer.holding; peer.holding = null; broadcast({ t: "freed", p: i }); }
    if (peer.id) broadcast({ t: "left", id: peer.id });
    try { socket.destroy(); } catch {}
  };

  const feed = makeParser(
    (text) => { try { handle(peer, text); } catch (e) { console.error("handle:", e.message); } },
    bye,
    (payload) => { try { socket.write(encodeFrame(0xa, payload)); } catch {} }
  );

  socket.on("data", (chunk) => { if (feed(chunk) === false) bye(); });
  socket.on("error", bye);
  socket.on("close", bye);
});

server.listen(PORT, () => {
  console.log(`puzzle server on http://localhost:${PORT} - ${table.def.id}, ${table.pieces.length} pieces`);
});
