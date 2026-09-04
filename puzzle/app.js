(function () {
  "use strict";

  /* =========================================================================
     The Table — ONE jigsaw puzzle that everybody solves together.

     There is a single puzzle in the world at a time. The server (server.js)
     owns it: every piece position, who is holding what, and whether a piece
     has been placed. This page is a view onto that table plus a pair of hands.

     Two rules do most of the work:
       - A piece can be held by one person at a time. If someone else has it,
         you can see it move but you cannot take it.
       - A placed piece is permanent. Nobody can pull it back out, which is
         what makes the table safe to leave unattended overnight.

     Everything is drawn in fixed stage units (2200x1240) and scaled as one
     unit, so a piece is in the same spot for everyone. The stage size and
     board rect below MUST match the constants in server.js.
     ========================================================================= */

  const STAGE_W = 2200;
  const STAGE_H = 1240;

  const isLocal = location.hostname === "localhost" || location.hostname === "127.0.0.1";
  // Same-origin in production (nginx proxies it); the dev port locally.
  const API = (isLocal ? `${location.protocol}//${location.hostname}:8023` : "") + "/puzzle/api";
  const WS_URL = isLocal
    ? `ws://${location.hostname}:8023/puzzle/api/socket`
    : `${location.protocol === "https:" ? "wss" : "ws"}://${location.host}/puzzle/api/socket`;

  // Dev-only shortcut: /puzzle/?solve walks every loose piece home so the
  // finish -> shelve -> next-puzzle handover can be exercised without solving
  // 50 pieces by hand. Gated to localhost, so it does nothing in production.
  const DEV_SOLVE = isLocal && new URLSearchParams(location.search).has("solve");
  let devSolveDone = false;

  /* ---------- Who you are ------------------------------------------------ */
  // A stable id keeps your placed-piece tally attached to you across reloads.
  const ADJECTIVES = ["quiet", "slow", "corner", "edge", "late", "early", "patient", "restless", "tidy", "stubborn", "sleepy", "keen"];
  const NOUNS = ["otter", "heron", "moth", "fox", "wren", "badger", "crane", "hare", "finch", "marten", "swift", "vole"];
  const COLORS = ["#e8b45e", "#7fae52", "#5fb4e8", "#e2604f", "#c58ce0", "#4fd0b0", "#f0a83a", "#e87fa8", "#8fa8f0", "#d8d24a"];

  function store(key, fallback) {
    try { return localStorage.getItem(key) || fallback; } catch { return fallback; }
  }
  function remember(key, value) {
    try { localStorage.setItem(key, value); } catch { /* private mode */ }
  }
  const pick = (a) => a[(Math.random() * a.length) | 0];

  let myId = store("kmufti-puzzle-id", "");
  if (!myId) {
    myId = "p" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
    remember("kmufti-puzzle-id", myId);
  }
  let myName = store("kmufti-puzzle-name", "");
  if (!myName) { myName = pick(ADJECTIVES) + " " + pick(NOUNS); remember("kmufti-puzzle-name", myName); }
  let myColor = store("kmufti-puzzle-color", "");
  if (!/^#[0-9a-f]{6}$/i.test(myColor)) { myColor = pick(COLORS); remember("kmufti-puzzle-color", myColor); }
  let soundOn = store("kmufti-puzzle-sound", "on") !== "off";

  /* ---------- Elements --------------------------------------------------- */
  const svg = document.getElementById("stage");
  const defs = document.getElementById("defs");
  const boardLayer = document.getElementById("boardOutline");
  const placedLayer = document.getElementById("placedLayer");
  const looseLayer = document.getElementById("looseLayer");
  const cursorLayer = document.getElementById("cursorLayer");
  const tableEl = document.getElementById("table");
  const veil = document.getElementById("veil");
  const veilText = document.getElementById("veilText");
  const titleEl = document.getElementById("puzzleTitle");
  const presenceEl = document.getElementById("presence");
  const runningEl = document.getElementById("running");
  const youIcon = document.getElementById("youIcon");
  const youName = document.getElementById("youName");
  const shelfJump = document.getElementById("shelfJump");
  const shelfArea = document.getElementById("shelfArea");
  const shelfEl = document.getElementById("shelf");
  const boxView = document.getElementById("boxView");
  const boxStage = document.getElementById("boxStage");
  const boxFrame = document.querySelector(".box-frame");
  const boxInfo = document.getElementById("boxInfo");
  const boxClose = document.getElementById("boxClose");
  const boxPrev = document.getElementById("boxPrev");
  const boxNext = document.getElementById("boxNext");

  const SVGNS = "http://www.w3.org/2000/svg";
  const el = (name, attrs) => {
    const n = document.createElementNS(SVGNS, name);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  };

  /* ---------- World state ------------------------------------------------ */
  let board = null;          // { x, y, w, h }
  let cols = 0, rows = 0, pw = 0, ph = 0;
  let pieces = [];           // server-known [{ x, y, placed }]
  let nodes = [];            // per piece: { g, hold }
  let total = 0, placedCount = 0;
  let holders = new Map();   // pieceIndex -> peerId
  const peers = new Map();   // peerId -> { name, color, x, y, el }
  let drag = null;           // { i, offX, offY, fromX, fromY }
  let finaleEl = null;
  let ws = null, retry = 0, helloSent = false;

  /* =========================================================================
     Cutting the pieces

     The tab pattern lives on the SHARED edges between neighbours (the server
     picks it and sends it to everyone), so two touching pieces always agree
     on the shape of the edge they share: the same curve is traced forwards by
     one piece and backwards by the other.
     ========================================================================= */

  // One knob, in normalised edge space: x runs 0..1 along the edge, y is a
  // fraction of the knob's full depth (the neck sits at ~0.21, the tip
  // reaches 1). The control points that overshoot their endpoint are what
  // pinch the neck, so it reads as a jigsaw tab and not a bump.
  const KNOB = [
    [0.20, 0.00, 0.50, 0.21, 0.44, 0.21],
    [0.32, 0.21, 0.32, 1.00, 0.50, 1.00],
    [0.68, 1.00, 0.68, 0.21, 0.56, 0.21],
    [0.50, 0.21, 0.80, 0.00, 1.00, 0.00],
  ];

  // Cubic segments for the edge from a to b. `sign` is 0 (flat border edge)
  // or ±1 for the two directions a knob can point. Depth is measured off the
  // SHORT side of a piece so knobs stay the same size on oblong pieces.
  function edgeSegs(ax, ay, bx, by, sign, depth) {
    const dx = bx - ax, dy = by - ay;
    if (!sign) return [[ax + dx / 3, ay + dy / 3, ax + (dx * 2) / 3, ay + (dy * 2) / 3, bx, by]];
    const len = Math.hypot(dx, dy);
    const ux = dx / len, uy = dy / len;   // along the edge
    const nx = -uy, ny = ux;              // perpendicular to it
    const d = sign * depth;
    const at = (u, v) => [ax + ux * u * len + nx * v * d, ay + uy * u * len + ny * v * d];
    return KNOB.map((k) => {
      const c1 = at(k[0], k[1]), c2 = at(k[2], k[3]), p = at(k[4], k[5]);
      return [c1[0], c1[1], c2[0], c2[1], p[0], p[1]];
    });
  }

  // Walk the same curve the other way: a cubic reversed is its control points
  // swapped, ending at the previous segment's endpoint.
  function revSegs(segs, ax, ay) {
    const out = [];
    for (let i = segs.length - 1; i >= 0; i--) {
      const s = segs[i], prev = i > 0 ? segs[i - 1] : null;
      out.push([s[2], s[3], s[0], s[1], prev ? prev[4] : ax, prev ? prev[5] : ay]);
    }
    return out;
  }

  const r2 = (n) => Math.round(n * 100) / 100;
  const draw = (segs) => segs.map((s) => `C${r2(s[0])} ${r2(s[1])} ${r2(s[2])} ${r2(s[3])} ${r2(s[4])} ${r2(s[5])}`).join("");

  // The outline of piece (c,r) in ASSEMBLED coordinates — i.e. where it sits
  // when the puzzle is finished. Loose pieces are the same path translated,
  // which is why the image window inside a piece always shows the right crop:
  // the whole group moves, picture and all.
  function piecePath(c, r, edges, depth, geo) {
    const x0 = geo.x + c * geo.pw, y0 = geo.y + r * geo.ph;
    const x1 = x0 + geo.pw, y1 = y0 + geo.ph;
    const top = edgeSegs(x0, y0, x1, y0, edges.h[r][c], depth);
    const right = edgeSegs(x1, y0, x1, y1, edges.v[r][c + 1], depth);
    const bottom = edgeSegs(x0, y1, x1, y1, edges.h[r + 1][c], depth);
    const left = edgeSegs(x0, y0, x0, y1, edges.v[r][c], depth);
    return `M${r2(x0)} ${r2(y0)}` + draw(top) + draw(right) +
      draw(revSegs(bottom, x0, y1)) + draw(revSegs(left, x0, y0)) + "Z";
  }

  /* =========================================================================
     Building the table
     ========================================================================= */
  function buildScene(init) {
    board = init.board;
    cols = init.puzzle.cols;
    rows = init.puzzle.rows;
    pw = board.w / cols;
    ph = board.h / rows;
    total = init.pieces.length;
    placedCount = init.placedCount;
    pieces = init.pieces.map((p) => ({ x: p.x, y: p.y, placed: p.placed }));
    nodes = [];
    holders = new Map();
    drag = null;

    boardLayer.textContent = "";
    placedLayer.textContent = "";
    looseLayer.textContent = "";
    // Keep the two shadow filters; drop the clip paths from the last puzzle.
    Array.from(defs.querySelectorAll("clipPath, image")).forEach((n) => n.remove());

    // The picture, defined once and reused by every piece through <use>, so a
    // 30-piece puzzle still only loads one image.
    const img = el("image", {
      id: "puzImg", x: board.x, y: board.y, width: board.w, height: board.h,
      preserveAspectRatio: "none",
    });
    img.setAttribute("href", init.puzzle.image);
    img.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", init.puzzle.image);
    defs.appendChild(img);

    // Where the picture goes: an empty slot with a faint grid, like the lid
    // outline people lay out first.
    boardLayer.appendChild(el("rect", {
      class: "board-slot", x: board.x, y: board.y, width: board.w, height: board.h, rx: 4,
    }));
    for (let c = 1; c < cols; c++) {
      boardLayer.appendChild(el("line", {
        class: "board-grid", x1: board.x + c * pw, y1: board.y, x2: board.x + c * pw, y2: board.y + board.h,
      }));
    }
    for (let r = 1; r < rows; r++) {
      boardLayer.appendChild(el("line", {
        class: "board-grid", x1: board.x, y1: board.y + r * ph, x2: board.x + board.w, y2: board.y + r * ph,
      }));
    }

    const depth = 0.21 * Math.min(pw, ph);
    for (let i = 0; i < total; i++) {
      const c = i % cols, r = (i / cols) | 0;
      const d = piecePath(c, r, init.edges, depth, { x: board.x, y: board.y, pw, ph });

      const clip = el("clipPath", { id: `pc-${i}`, clipPathUnits: "userSpaceOnUse" });
      clip.appendChild(el("path", { d }));
      defs.appendChild(clip);

      const g = el("g", { class: "piece" });
      g.dataset.i = String(i);

      const window_ = el("g", { "clip-path": `url(#pc-${i})` });
      const use = el("use");
      use.setAttribute("href", "#puzImg");
      use.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#puzImg");
      window_.appendChild(use);
      // Bevel: a fat light stroke drawn INSIDE the clip, so only its inner
      // half survives — the piece looks cut rather than pasted.
      window_.appendChild(el("path", { class: "pc-bevel", d }));
      g.appendChild(window_);

      g.appendChild(el("path", { class: "pc-edge", d }));
      const hold = el("path", { class: "pc-hold", d, stroke: "none" });
      g.appendChild(hold);
      g.appendChild(el("path", { class: "pc-hit", d }));

      nodes[i] = { g, hold };
      applyPiece(i, true);
    }

    for (const id in init.held) holders.set(Number(id), init.held[id]);
    holders.forEach((by, i) => paintHold(i, by));

    titleEl.textContent = `“${init.puzzle.title}”`;
    renderShelf(init.shelf || []);
    veil.classList.add("gone");
    if (DEV_SOLVE && !devSolveDone) { devSolveDone = true; setTimeout(() => window.solve(), 700); }
  }

  // Put a piece where the server says it is, in the layer it belongs to.
  function applyPiece(i, insert) {
    const p = pieces[i], n = nodes[i];
    if (!p || !n) return;
    const home = homeOf(i);
    n.g.style.transform = `translate(${r2(p.x - home.x)}px, ${r2(p.y - home.y)}px)`;
    const layer = p.placed ? placedLayer : looseLayer;
    n.g.classList.toggle("placed", p.placed);
    if (insert || n.g.parentNode !== layer) layer.appendChild(n.g);
  }

  function homeOf(i) {
    return { x: board.x + (i % cols) * pw, y: board.y + ((i / cols) | 0) * ph };
  }

  function paintHold(i, by) {
    const n = nodes[i];
    if (!n) return;
    if (by == null) {
      n.g.classList.remove("held");
      n.hold.setAttribute("stroke", "none");
      return;
    }
    const peer = peers.get(by);
    n.hold.setAttribute("stroke", by === myId ? myColor : (peer ? peer.color : "#ffffff"));
    // Your own piece stays grabbable (you're the one holding it); everyone
    // else's is locked out until they let go.
    n.g.classList.toggle("held", by !== myId);
    if (by === myId) n.g.classList.add("dragging");
    looseLayer.appendChild(n.g); // whoever picks it up brings it to the top
  }

  /* =========================================================================
     Hands: dragging a piece
     ========================================================================= */
  function stageXY(e) {
    const rect = svg.getBoundingClientRect();
    const scale = rect.width / STAGE_W;
    return { x: (e.clientX - rect.left) / scale, y: (e.clientY - rect.top) / scale };
  }

  let lastCursorSend = 0, lastMoveSend = 0;

  svg.addEventListener("pointerdown", (e) => {
    if (e.button != null && e.button !== 0) return;
    unlockSound();
    const hit = e.target.closest ? e.target.closest(".piece") : null;
    if (!hit || !board) return;
    const i = Number(hit.dataset.i);
    const p = pieces[i];
    if (!p || p.placed) return;
    if (holders.has(i) && holders.get(i) !== myId) return; // in someone else's hands
    const at = stageXY(e);
    drag = { i, offX: at.x - p.x, offY: at.y - p.y, fromX: p.x, fromY: p.y };
    nodes[i].g.classList.add("dragging");
    looseLayer.appendChild(nodes[i].g);
    send({ t: "grab", p: i });
    try { svg.setPointerCapture(e.pointerId); } catch { /* not captureable */ }
    e.preventDefault();
  });

  window.addEventListener("pointermove", (e) => {
    if (!board) return;
    const at = stageXY(e);
    const now = performance.now();

    if (drag) {
      const p = pieces[drag.i];
      p.x = at.x - drag.offX;
      p.y = at.y - drag.offY;
      applyPiece(drag.i);
      if (now - lastMoveSend > 30) {
        lastMoveSend = now;
        send({ t: "move", x: Math.round(p.x), y: Math.round(p.y) });
      }
    }
    if (now - lastCursorSend > 40) {
      lastCursorSend = now;
      send({ t: "cursor", x: Math.round(at.x), y: Math.round(at.y) });
    }
  });

  function endDrag(e) {
    if (!drag) return;
    const i = drag.i, p = pieces[i];
    nodes[i].g.classList.remove("dragging");
    drag = null;
    send({ t: "drop", x: Math.round(p.x), y: Math.round(p.y) });
    if (e) { try { svg.releasePointerCapture(e.pointerId); } catch { /* fine */ } }
  }
  window.addEventListener("pointerup", endDrag);
  window.addEventListener("pointercancel", endDrag);

  // Park your cursor off the table when you leave it, so your arrow doesn't
  // sit frozen mid-board for everyone else.
  svg.addEventListener("pointerleave", () => send({ t: "cursor", x: -150, y: -150 }));

  /* =========================================================================
     Other people
     ========================================================================= */
  function addPeer(p) {
    if (p.id === myId) return;
    let entry = peers.get(p.id);
    if (!entry) {
      const g = el("g", { class: "cursor" });
      const arrow = el("path", {
        class: "cursor-arrow",
        d: "M0 0 L0 34 L9 26 L15 40 L22 37 L16 24 L27 24 Z",
      });
      const tag = el("rect", { class: "cursor-tag", x: 20, y: 30, height: 26, width: 10 });
      const name = el("text", { class: "cursor-name", x: 27, y: 43 });
      g.appendChild(arrow); g.appendChild(tag); g.appendChild(name);
      cursorLayer.appendChild(g);
      entry = { el: g, arrow, tag, name, x: p.x, y: p.y };
      peers.set(p.id, entry);
    }
    entry.name_ = p.name;
    entry.color = p.color;
    entry.arrow.setAttribute("fill", p.color);
    entry.tag.setAttribute("fill", p.color);
    entry.name.textContent = p.name;
    entry.tag.setAttribute("width", Math.max(24, p.name.length * 11.5 + 14));
    entry.el.style.transform = `translate(${p.x}px, ${p.y}px)`;
    renderPresence();
  }

  function dropPeer(id) {
    const p = peers.get(id);
    if (!p) return;
    p.el.remove();
    peers.delete(id);
    renderPresence();
  }

  function renderPresence() {
    const n = peers.size + 1;
    presenceEl.textContent = n === 1 ? "just you at the table" : `${n} at the table`;
  }

  /* =========================================================================
     The shelf — every puzzle this table has finished

     Archived puzzles do NOT store the cut they were solved with; that would be
     hundreds of bytes per entry to record something nobody can tell apart. We
     re-derive a cut from a seed built out of the entry's own id and finish
     time, so a given shelf entry looks the same every time anyone opens it —
     just not identical to the tabs those particular hands pushed together.
     ========================================================================= */
  function hashSeed(str) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return h >>> 0;
  }
  function mulberry32(a) {
    return function () {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  // Same shape the server builds: 0 on the border, ±1 everywhere inside.
  function seededEdges(cols, rows, seed) {
    const rnd = mulberry32(seed);
    const h = [], v = [];
    for (let r = 0; r <= rows; r++) {
      const row = [];
      for (let c = 0; c < cols; c++) row.push(r === 0 || r === rows ? 0 : (rnd() < 0.5 ? -1 : 1));
      h.push(row);
    }
    for (let r = 0; r < rows; r++) {
      const row = [];
      for (let c = 0; c <= cols; c++) row.push(c === 0 || c === cols ? 0 : (rnd() < 0.5 ? -1 : 1));
      v.push(row);
    }
    return { h, v };
  }

  let shelfList = [];

  function boxGeo(e) {
    const w = e.boardW || 840, h = e.boardH || 560;
    return { x: 0, y: 0, w, h, pw: w / e.cols, ph: h / e.rows };
  }
  function entryEdges(e) {
    return seededEdges(e.cols, e.rows, hashSeed(`${e.id}:${e.finishedAt}`));
  }
  function puzzleImage(e, geo, id) {
    const img = el("image", { x: 0, y: 0, width: geo.w, height: geo.h, preserveAspectRatio: "none" });
    if (id) img.setAttribute("id", id);
    img.setAttribute("href", e.image);
    img.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", e.image);
    return img;
  }

  // On the shelf a finished puzzle is just the picture with its seams — no
  // card, no caption. Nothing moves, so nothing needs clipping.
  function shelfThumb(e) {
    const geo = boxGeo(e), edges = entryEdges(e);
    const depth = 0.21 * Math.min(geo.pw, geo.ph);
    const svg = el("svg", { viewBox: `0 0 ${geo.w} ${geo.h}`, width: geo.w, height: geo.h });
    svg.appendChild(puzzleImage(e, geo));
    for (let i = 0; i < e.cols * e.rows; i++) {
      svg.appendChild(el("path", { class: "seam", d: piecePath(i % e.cols, (i / e.cols) | 0, edges, depth, geo) }));
    }
    return svg;
  }

  function renderShelf(list) {
    shelfList = list;
    shelfEl.textContent = "";
    if (!list.length) {
      const p = document.createElement("p");
      p.className = "shelf-empty";
      p.textContent = "nothing finished yet";
      shelfEl.appendChild(p);
      return;
    }
    for (const e of list) {
      const b = document.createElement("button");
      b.className = "box";
      b.title = e.title;
      b.appendChild(shelfThumb(e));
      b.addEventListener("click", () => openBox(e));
      shelfEl.appendChild(b);
    }
  }

  /* ---------- One puzzle, zoomed, with who solved it and a replay -------- */
  let boxPieces = [];   // the clipped piece groups in the zoom view
  let replayTimer = null;

  // Where the open puzzle sits on the shelf, so the arrows know what's either
  // side of it. -1 when nothing is open.
  let boxIndex = -1;

  function stepBox(delta) {
    if (boxIndex < 0) return;
    const i = boxIndex + delta;
    if (i < 0 || i >= shelfList.length) return;
    openBox(shelfList[i]);
  }

  function openBox(e) {
    stopReplay();
    boxIndex = shelfList.indexOf(e);
    boxPrev.disabled = boxIndex <= 0;
    boxNext.disabled = boxIndex < 0 || boxIndex >= shelfList.length - 1;
    const geo = boxGeo(e), edges = entryEdges(e);
    const depth = 0.21 * Math.min(geo.pw, geo.ph);

    boxStage.textContent = "";
    const svg = el("svg", { viewBox: `0 0 ${geo.w} ${geo.h}`, width: geo.w, height: geo.h });
    const defs = el("defs");
    defs.appendChild(puzzleImage(e, geo, "bx-img"));
    svg.appendChild(defs);
    svg.appendChild(el("rect", { class: "box-slot", x: 0, y: 0, width: geo.w, height: geo.h }));

    boxPieces = [];
    for (let i = 0; i < e.cols * e.rows; i++) {
      const d = piecePath(i % e.cols, (i / e.cols) | 0, edges, depth, geo);
      const clip = el("clipPath", { id: `bx-${i}`, clipPathUnits: "userSpaceOnUse" });
      clip.appendChild(el("path", { d }));
      defs.appendChild(clip);

      const g = el("g", { class: "rp-piece" });
      const win = el("g", { "clip-path": `url(#bx-${i})` });
      const use = el("use");
      use.setAttribute("href", "#bx-img");
      use.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#bx-img");
      win.appendChild(use);
      win.appendChild(el("path", { class: "seam-lit", d }));
      g.appendChild(win);
      g.appendChild(el("path", { class: "seam", d }));
      const flash = el("path", { class: "rp-flash", d });
      g.appendChild(flash);
      svg.appendChild(g);
      boxPieces[i] = { g, flash };
    }
    boxStage.appendChild(svg);

    boxInfo.textContent = "";

    // Left, against the picture's left edge: what it is.
    const left = document.createElement("div");
    left.className = "box-left";
    const h = document.createElement("h2");
    h.className = "box-title";
    h.textContent = `“${e.title}”`;
    const meta = document.createElement("p");
    meta.className = "box-meta";
    const when = new Date(e.finishedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }).toLowerCase();
    meta.append(`${e.pieces} pieces`, document.createElement("br"), `${fmtClock(e.ms)} · ${when}`);
    left.append(h, meta);

    // Right, against its right edge: who did it.
    const right = document.createElement("div");
    right.className = "box-right";
    if (e.lastBy && e.lastBy.name) {
      const last = document.createElement("p");
      last.className = "box-last";
      const b = document.createElement("b");
      b.textContent = e.lastBy.name;
      last.append("last piece: ", b);
      right.appendChild(last);
    }
    const crew = document.createElement("div");
    crew.className = "box-crew";
    for (const c of e.contributors || []) {
      const one = document.createElement("span");
      const nm = document.createElement("span");
      nm.className = "crew-name";
      nm.style.color = c.color;   // a contributor's colour is their name
      nm.textContent = c.name;
      const ct = document.createElement("span");
      ct.className = "crew-count";
      ct.textContent = c.count;
      one.append(nm, ct);
      crew.appendChild(one);
    }
    right.appendChild(crew);

    const mid = document.createElement("div");
    mid.className = "box-mid";
    const btn = document.createElement("button");
    btn.className = "replay-btn";
    btn.textContent = "replay";
    btn.addEventListener("click", () => runReplay(e, btn));
    mid.appendChild(btn);

    boxInfo.append(left, mid, right);
    boxView.hidden = false;
    requestAnimationFrame(fitFrame);
    window.addEventListener("resize", fitFrame);
  }

  function fitFrame() {
    boxFrame.style.width = "";
    const svg = boxStage.querySelector("svg");
    if (!svg) return;
    const w = svg.getBoundingClientRect().width;
    if (w) boxFrame.style.width = Math.round(w) + "px";
  }

  function closeBox() {
    stopReplay();
    boxIndex = -1;
    window.removeEventListener("resize", fitFrame);
    boxFrame.style.width = "";
    boxView.hidden = true;
    boxStage.textContent = "";
    boxInfo.textContent = "";
    boxPieces = [];
  }
  function stopReplay() {
    if (replayTimer) { clearTimeout(replayTimer); replayTimer = null; }
  }

  // The replay is not a recording — it's the order log, replayed. Each entry
  // is [pieceIndex, who, msSinceStart], so we know exactly which piece landed
  // when. We ignore the timestamps and space every piece evenly: most tables
  // sit untouched for hours between visits, and honouring the real gaps would
  // make almost every replay a long stall followed by a rush.
  async function runReplay(entry, btn) {
    stopReplay();
    btn.disabled = true;
    btn.textContent = "…";
    let order;
    try {
      const res = await fetch(`${API}/replay?at=${entry.finishedAt}`);
      order = (await res.json()).order;
    } catch { order = null; }
    if (!order || !order.length) {
      btn.textContent = "replay";
      btn.disabled = false;
      return;
    }

    const tint = new Map();
    for (const c of entry.contributors || []) tint.set(c.name, c.color);

    for (const p of boxPieces) if (p) p.g.classList.add("pending");
    btn.textContent = "replay";

    const step = Math.min(220, Math.max(70, 8000 / order.length));
    let k = 0;
    const next = () => {
      if (k >= order.length) {
        replayTimer = null;
        btn.disabled = false;
        return;
      }
      const [idx, who] = order[k++];
      const p = boxPieces[idx];
      if (p) {
        p.g.classList.remove("pending");
        p.g.classList.add("landing");
        setTimeout(() => p.g.classList.remove("landing"), 260);
        const colour = tint.get(who);
        if (colour) {
          p.flash.setAttribute("stroke", colour);
          p.flash.style.opacity = "1";
          setTimeout(() => { p.flash.style.opacity = "0"; }, 90);
        }
      }
      replayTimer = setTimeout(next, step);
    };
    next();
  }

  boxClose.addEventListener("click", closeBox);
  boxView.addEventListener("click", (e) => { if (e.target === boxView) closeBox(); });
  boxPrev.addEventListener("click", () => stepBox(-1));
  boxNext.addEventListener("click", () => stepBox(1));
  document.addEventListener("keydown", (e) => {
    if (boxView.hidden) return;
    if (e.key === "Escape") closeBox();
    // Newest is leftmost on the shelf, so left goes back towards it.
    else if (e.key === "ArrowLeft") stepBox(-1);
    else if (e.key === "ArrowRight") stepBox(1);
  });
  shelfJump.addEventListener("click", () => shelfArea.scrollIntoView({ behavior: "smooth", block: "start" }));

  /* ---------- Your name (the colour stays whatever you were dealt) ------- */
  youName.value = myName;
  youIcon.setAttribute("fill", myColor);
  function commitName() {
    const v = youName.value.trim().slice(0, 18) || myName;
    youName.value = v;
    if (v === myName) return;
    myName = v;
    remember("kmufti-puzzle-name", myName);
    send({ t: "name", name: myName, color: myColor });
  }
  youName.addEventListener("change", commitName);
  youName.addEventListener("blur", commitName);
  youName.addEventListener("keydown", (e) => { if (e.key === "Enter") youName.blur(); });

  /* ---------- How long it took, for the solved card ----------------------- */
  // Clock style, so a solve reads as a time and not a rounded-off label:
  // 0:07, 2:31, 1:04:22. Past a day the hours roll into a day count —
  // "2d 3:04:22" reads better than a bare 51:04:22.
  function fmtClock(ms) {
    const total = Math.max(0, Math.round(ms / 1000));
    const d = Math.floor(total / 86400);
    const h = Math.floor((total % 86400) / 3600);
    const m = Math.floor((total % 3600) / 60);
    const sec = total % 60;
    const pad = (n) => String(n).padStart(2, "0");
    if (d) return `${d}d ${h}:${pad(m)}:${pad(sec)}`;
    return h ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`;
  }

  /* ---------- The running clock, under the title -------------------------- */
  // A table can stay up for days, so the header carries how long this one has
  // been going. It freezes the moment the puzzle is solved: after that the
  // number belongs to the finished picture, not to a clock still ticking.
  let tableStartedAt = null;
  let tableSolvedAt = 0;

  function paintRunning() {
    if (!tableStartedAt) { runningEl.textContent = ""; return; }
    const end = tableSolvedAt || Date.now();
    const t = fmtClock(end - tableStartedAt);
    runningEl.textContent = tableSolvedAt ? `solved in ${t}` : `${t} on the table`;
  }
  setInterval(paintRunning, 1000);

  /* =========================================================================
     The last piece
     ========================================================================= */
  function celebrate(entry, nextIn) {
    if (finaleEl) finaleEl.remove();
    placedLayer.classList.add("solved-lift");

    finaleEl = document.createElement("div");
    finaleEl.className = "finale";
    const h = document.createElement("h2");
    h.textContent = "solved";
    const took = document.createElement("p");
    took.className = "finale-time";
    took.textContent = fmtClock(entry.ms);
    const next = document.createElement("p");
    next.className = "finale-next";
    finaleEl.append(h, took, next);
    tableEl.appendChild(finaleEl);

    let left = Math.ceil((nextIn || 15000) / 1000);
    const tick = () => {
      next.textContent = left > 0 ? `a new one in ${left}…` : "clearing the table…";
      if (left-- > 0) setTimeout(tick, 1000);
    };
    tick();
  }

  function clearFinale() {
    if (finaleEl) { finaleEl.remove(); finaleEl = null; }
    placedLayer.classList.remove("solved-lift");
  }

  /* =========================================================================
     Sound — one clip: a piece going home.

     Decoded once into Web Audio buffers rather than played through <audio>
     elements, so a flurry of placements overlaps cleanly instead of each one
     cutting off the last. Browsers start the context suspended until the
     visitor interacts, so the first pointerdown resumes it.
     ========================================================================= */
  const SOUNDS = { click: "sounds/piece-click.wav" };
  let actx = null;
  const clips = {};

  (function loadSounds() {
    if (!soundOn) return;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      actx = new Ctx();
    } catch { actx = null; return; }
    for (const name of Object.keys(SOUNDS)) {
      fetch(SOUNDS[name])
        .then((r) => r.arrayBuffer())
        .then((b) => actx.decodeAudioData(b))
        .then((buf) => { clips[name] = buf; })
        .catch(() => { /* a missing clip just means silence */ });
    }
  })();

  function unlockSound() {
    if (actx && actx.state === "suspended") actx.resume().catch(() => {});
  }
  // Browsers keep the context suspended until the visitor interacts. Listen
  // page-wide, not just on the table, so clicking anything at all wakes it.
  document.addEventListener("pointerdown", unlockSound);
  document.addEventListener("keydown", unlockSound);

  function play(name, gain) {
    if (!soundOn || !actx || !clips[name] || actx.state !== "running") return;
    try {
      const src = actx.createBufferSource();
      src.buffer = clips[name];
      const amp = actx.createGain();
      amp.gain.value = gain == null ? 1 : gain;
      src.connect(amp).connect(actx.destination);
      src.start();
    } catch { /* sound is a nicety */ }
  }

  /* =========================================================================
     The socket
     ========================================================================= */
  function send(obj) {
    if (ws && ws.readyState === 1) {
      try { ws.send(JSON.stringify(obj)); } catch { /* closing */ }
    }
  }

  // Ask the server to place each loose piece, one at a time, the same way a
  // pair of hands would: grab, then drop it on its home. Re-runnable from the
  // console as solve(), and only defined on localhost.
  if (DEV_SOLVE) {
    window.solve = async function solve(delay = 55) {
      const wait = (ms) => new Promise((r) => setTimeout(r, ms));
      for (let pass = 0; pass < 3; pass++) {
        const todo = [];
        pieces.forEach((p, i) => { if (!p.placed && !holders.has(i)) todo.push(i); });
        if (!todo.length) return;
        for (const i of todo) {
          if (pieces[i].placed) continue;
          const home = homeOf(i);
          send({ t: "grab", p: i });
          await wait(20);
          send({ t: "drop", x: Math.round(home.x), y: Math.round(home.y) });
          await wait(delay);
        }
        await wait(250);
      }
    };
  }

  function connect() {
    try { ws = new WebSocket(WS_URL); } catch { return scheduleReconnect(); }
    helloSent = false;

    ws.onopen = () => {
      retry = 0;
      helloSent = true;
      send({ t: "hello", id: myId, name: myName, color: myColor });
    };

    ws.onmessage = (ev) => {
      let m;
      try { m = JSON.parse(ev.data); } catch { return; }
      handle(m);
    };

    ws.onclose = () => {
      veilText.textContent = "reconnecting…";
      veil.classList.remove("gone");
      scheduleReconnect();
    };
    ws.onerror = () => { try { ws.close(); } catch { /* already gone */ } };
  }

  function scheduleReconnect() {
    retry = Math.min(retry + 1, 6);
    setTimeout(connect, 400 * retry * retry);
  }

  function handle(m) {
    switch (m.t) {
      case "init": {
        const isNewPuzzle = board && m.puzzle.id !== titleEl.dataset.id;
        tableStartedAt = m.startedAt || Date.now();
        tableSolvedAt = m.solvedAt || 0;
        paintRunning();
        peers.clear();
        cursorLayer.textContent = "";
        for (const p of m.peers) addPeer(p);
        renderPresence();

        if (finaleEl || isNewPuzzle) {
          // The finished picture slides off the table, then the next one
          // drops in — the changeover you'd see in a real room.
          clearFinale();
          placedLayer.classList.add("slide-off");
          looseLayer.classList.add("slide-off");
          setTimeout(() => {
            placedLayer.classList.remove("slide-off");
            looseLayer.classList.remove("slide-off");
            buildScene(m);
            titleEl.dataset.id = m.puzzle.id;
            placedLayer.classList.add("drop-in");
            looseLayer.classList.add("drop-in");
            setTimeout(() => {
              placedLayer.classList.remove("drop-in");
              looseLayer.classList.remove("drop-in");
            }, 700);
          }, 900);
        } else {
          buildScene(m);
          titleEl.dataset.id = m.puzzle.id;
          if (m.solvedAt) celebrate(
            { title: m.puzzle.title, pieces: m.pieces.length, ms: Date.now() - m.startedAt,
              lastBy: { name: "someone" }, contributors: m.contributors },
            8000,
          );
        }
        break;
      }

      case "join": addPeer(m.peer); break;
      case "left": dropPeer(m.id); holders.forEach((by, i) => { if (by === m.id) { holders.delete(i); paintHold(i, null); } }); break;
      case "renamed": {
        const p = peers.get(m.id);
        if (p) addPeer({ id: m.id, name: m.name, color: m.color, x: p.x, y: p.y });
        break;
      }

      case "tick": {
        for (const [id, x, y] of m.cur) {
          const p = peers.get(id);
          if (!p) continue;
          p.x = x; p.y = y;
          p.el.style.transform = `translate(${x}px, ${y}px)`;
        }
        for (const [i, x, y] of m.pos) {
          if (drag && drag.i === i) continue;      // your own hand wins locally
          if (!pieces[i] || pieces[i].placed) continue;
          pieces[i].x = x; pieces[i].y = y;
          applyPiece(i);
        }
        break;
      }

      case "held":
        holders.set(m.p, m.by);
        paintHold(m.p, m.by);
        break;

      case "freed":
        holders.delete(m.p);
        paintHold(m.p, null);
        if (drag && drag.i === m.p) { nodes[m.p].g.classList.remove("dragging"); drag = null; }
        break;

      case "deny": {
        // Someone beat you to it (or it's already home). Put it back where it
        // was before your hand landed on it.
        if (drag && drag.i === m.p) {
          pieces[m.p].x = drag.fromX;
          pieces[m.p].y = drag.fromY;
          nodes[m.p].g.classList.remove("dragging");
          drag = null;
          applyPiece(m.p);
        }
        break;
      }

      case "placed": {
        holders.delete(m.p);
        const p = pieces[m.p];
        if (p) {
          p.placed = true;
          p.x = homeOf(m.p).x;
          p.y = homeOf(m.p).y;
        }
        paintHold(m.p, null);
        if (drag && drag.i === m.p) drag = null;
        const n = nodes[m.p];
        if (n) {
          n.g.classList.remove("dragging");
          applyPiece(m.p);
          n.g.classList.add("snap-flash");
          setTimeout(() => n.g.classList.remove("snap-flash"), 300);
        }
        placedCount = m.count;
        play("click", m.by.id === myId ? 1 : 0.55);
        break;
      }

      case "solved":
        tableSolvedAt = m.entry.finishedAt || Date.now();
        paintRunning();
        celebrate(m.entry, m.nextIn);
        break;
    }
  }

  /* ---------- Go -------------------------------------------------------- */
  renderPresence();
  connect();
})();
