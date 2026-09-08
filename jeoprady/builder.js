// Jeoprady! — Board Builder
// Write all 30 clues yourself. No question-bank fill: a board built here is
// entirely the author's own writing. Boards live in localStorage, and can be
// exported/imported as JSON or shared via a URL hash.
//
// Depends on globals from game.js: $, showScreen, state, openTeamSetup,
// beginRound, renderTeamsDisplay, fmt, STANDARD_JEOPARDY_VALUES.

"use strict";

const BUILDER_KEY = "jeoprady.boards.v1";
const NUM_CATS = 6;
const NUM_ROWS = 5;
const SHARE_SOFT_LIMIT = 8000; // browsers/chat apps get unhappy past roughly this

// The board being edited, and where the cell modal is pointed.
let editorBoard = null;
let editorCell = { col: 0, row: 0 };
let previewOn = false;

// ---------- Model ----------
function blankBoard(name) {
  return {
    id: "b_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36),
    name: name || "Untitled Board",
    updated: Date.now(),
    categories: Array.from({ length: NUM_CATS }, () => ({
      name: "",
      clues: Array.from({ length: NUM_ROWS }, () => ({ q: "", a: "", dd: false })),
    })),
    final: { category: "", question: "", answer: "" },
  };
}

// Coerce anything claiming to be a board (imported file, share link, older
// save) into the exact 6x5 shape the editor and the game both assume.
function normalizeBoard(raw) {
  const b = blankBoard(typeof raw?.name === "string" ? raw.name.slice(0, 60) : "Imported Board");
  if (raw && typeof raw.id === "string") b.id = raw.id;
  const cats = Array.isArray(raw?.categories) ? raw.categories : [];
  for (let c = 0; c < NUM_CATS; c++) {
    const src = cats[c] || {};
    b.categories[c].name = String(src.name || "").slice(0, 40);
    const clues = Array.isArray(src.clues) ? src.clues : [];
    for (let r = 0; r < NUM_ROWS; r++) {
      const cl = clues[r] || {};
      b.categories[c].clues[r] = {
        q: String(cl.q ?? cl.question ?? ""),
        a: String(cl.a ?? cl.answer ?? ""),
        dd: !!(cl.dd ?? cl.isDailyDouble),
      };
    }
  }
  const f = raw?.final || {};
  b.final = {
    category: String(f.category || ""),
    question: String(f.question || ""),
    answer: String(f.answer || ""),
  };
  return b;
}

// ---------- Storage ----------
function loadLibrary() {
  try {
    const parsed = JSON.parse(localStorage.getItem(BUILDER_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.map(normalizeBoard) : [];
  } catch {
    return [];
  }
}

function saveLibrary(boards) {
  try {
    localStorage.setItem(BUILDER_KEY, JSON.stringify(boards));
    return true;
  } catch (err) {
    alert("Could not save — this browser's storage is full or blocked.\nExport the board to JSON so you don't lose it.");
    console.error(err);
    return false;
  }
}

// Write the in-progress board back to the library (insert or replace).
function persistEditorBoard() {
  if (!editorBoard) return;
  editorBoard.updated = Date.now();
  const boards = loadLibrary();
  const i = boards.findIndex((b) => b.id === editorBoard.id);
  if (i === -1) boards.unshift(editorBoard);
  else boards[i] = editorBoard;
  saveLibrary(boards);
}

// ---------- Validation ----------
function cellFilled(cl) {
  return cl.q.trim() !== "" && cl.a.trim() !== "";
}

function validateBoard(b) {
  let filled = 0;
  let dds = 0;
  const emptyCats = [];
  for (let c = 0; c < NUM_CATS; c++) {
    if (!b.categories[c].name.trim()) emptyCats.push(c + 1);
    for (let r = 0; r < NUM_ROWS; r++) {
      const cl = b.categories[c].clues[r];
      if (cellFilled(cl)) filled++;
      if (cl.dd) dds++;
    }
  }
  const errors = [];
  const warnings = [];
  const missing = NUM_CATS * NUM_ROWS - filled;
  if (missing > 0) {
    errors.push(`${missing} clue${missing === 1 ? "" : "s"} still empty — every cell needs a clue and an answer.`);
  }
  if (emptyCats.length) {
    errors.push(`Category ${emptyCats.join(", ")} ${emptyCats.length === 1 ? "has" : "have"} no name.`);
  }
  if (dds === 0) warnings.push("No Daily Double set.");
  if (dds > 2) warnings.push(`${dds} Daily Doubles — a real Jeopardy! round has one.`);
  if (!b.final.question.trim() || !b.final.answer.trim()) {
    warnings.push("No Final Jeopardy written — a random real one will be used.");
  }
  return { errors, warnings, filled, dds };
}

// ---------- Library screen ----------
function openBuilderLibrary() {
  renderLibrary();
  showScreen("builder-library");
}

function renderLibrary() {
  const boards = loadLibrary().sort((a, b) => b.updated - a.updated);
  const grid = $("lib-grid");
  grid.innerHTML = "";
  $("lib-empty").classList.toggle("hidden", boards.length > 0);

  for (const b of boards) {
    const v = validateBoard(b);
    const card = document.createElement("div");
    card.className = "lib-card";

    const title = document.createElement("div");
    title.className = "lib-card-name";
    title.textContent = b.name || "Untitled Board";

    const cats = document.createElement("div");
    cats.className = "lib-card-cats";
    const named = b.categories.map((c) => c.name.trim()).filter(Boolean);
    cats.textContent = named.length ? named.join(" • ") : "No categories yet";

    const meta = document.createElement("div");
    meta.className = "lib-card-meta";
    const done = v.filled === NUM_CATS * NUM_ROWS;
    meta.innerHTML =
      `<span class="lib-badge ${done ? "ready" : "draft"}">${done ? "Ready" : `${v.filled}/30`}</span>` +
      `<span class="lib-date">${new Date(b.updated).toLocaleDateString()}</span>`;

    const actions = document.createElement("div");
    actions.className = "lib-card-actions";
    actions.appendChild(libBtn("Edit", () => openEditor(b)));
    actions.appendChild(libBtn("Duplicate", () => {
      const copy = normalizeBoard(JSON.parse(JSON.stringify(b)));
      copy.id = blankBoard().id;
      copy.name = `${b.name} (copy)`;
      copy.updated = Date.now();
      const all = loadLibrary();
      all.unshift(copy);
      saveLibrary(all);
      renderLibrary();
    }));
    actions.appendChild(libBtn("Rename", () => {
      const next = prompt("Board name:", b.name);
      if (next === null) return;
      const all = loadLibrary();
      const target = all.find((x) => x.id === b.id);
      if (!target) return;
      target.name = next.trim().slice(0, 60) || "Untitled Board";
      target.updated = Date.now();
      saveLibrary(all);
      renderLibrary();
    }));
    actions.appendChild(libBtn("Delete", () => {
      if (!confirm(`Delete "${b.name}"? This cannot be undone.`)) return;
      saveLibrary(loadLibrary().filter((x) => x.id !== b.id));
      renderLibrary();
    }, "danger"));

    card.append(title, cats, meta, actions);
    grid.appendChild(card);
  }
}

function libBtn(label, onClick, extra) {
  const btn = document.createElement("button");
  btn.className = "lib-btn" + (extra ? " " + extra : "");
  btn.textContent = label;
  btn.addEventListener("click", onClick);
  return btn;
}

// ---------- Editor ----------
function openEditor(board) {
  editorBoard = normalizeBoard(JSON.parse(JSON.stringify(board)));
  previewOn = false;
  $("editor-name").value = editorBoard.name;
  renderEditor();
  showScreen("builder-editor");
}

function renderEditor() {
  renderEditorGrid();
  renderEditorIssues();
  applyPreviewVisibility();
}

function renderEditorGrid() {
  const grid = $("editor-grid");
  grid.innerHTML = "";

  // Row 1: editable category headers.
  for (let c = 0; c < NUM_CATS; c++) {
    const wrap = document.createElement("div");
    wrap.className = "edit-cat";
    const input = document.createElement("input");
    input.type = "text";
    input.className = "edit-cat-input";
    input.maxLength = 40;
    input.placeholder = `CATEGORY ${c + 1}`;
    input.value = editorBoard.categories[c].name;
    input.addEventListener("input", () => {
      editorBoard.categories[c].name = input.value;
      persistEditorBoard();
      renderEditorIssues();
    });
    wrap.appendChild(input);
    grid.appendChild(wrap);
  }

  // Rows 2-6: one clue cell per value.
  for (let r = 0; r < NUM_ROWS; r++) {
    for (let c = 0; c < NUM_CATS; c++) {
      const cl = editorBoard.categories[c].clues[r];
      const cell = document.createElement("button");
      const done = cellFilled(cl);
      cell.className = "edit-cell" + (done ? " filled" : " empty") + (cl.dd ? " dd" : "");
      cell.title = done ? cl.q : "Empty — click to write this clue";

      const val = document.createElement("span");
      val.className = "edit-cell-value";
      val.textContent = fmt(STANDARD_JEOPARDY_VALUES[r]);

      const peek = document.createElement("span");
      peek.className = "edit-cell-peek";
      peek.textContent = done ? cl.q : "empty";

      cell.append(val, peek);
      if (cl.dd) {
        const badge = document.createElement("span");
        badge.className = "edit-cell-dd";
        badge.textContent = "DD";
        cell.appendChild(badge);
      }
      cell.addEventListener("click", () => openCellEditor(c, r));
      grid.appendChild(cell);
    }
  }
}

function renderEditorIssues() {
  const v = validateBoard(editorBoard);
  $("editor-progress").textContent = `${v.filled} of 30 written`;
  const box = $("editor-issues");
  box.innerHTML = "";
  for (const e of v.errors) box.appendChild(issueLine(e, "error"));
  for (const w of v.warnings) box.appendChild(issueLine(w, "warn"));
  $("btn-editor-play").disabled = v.errors.length > 0;
}

function issueLine(text, kind) {
  const p = document.createElement("p");
  p.className = "editor-issue " + kind;
  p.textContent = (kind === "error" ? "✕ " : "! ") + text;
  return p;
}

// ---------- Cell modal ----------
function openCellEditor(col, row) {
  editorCell = { col, row };
  const cat = editorBoard.categories[col];
  const cl = cat.clues[row];
  $("cell-modal-cat").textContent = cat.name.trim() || `Category ${col + 1}`;
  $("cell-modal-value").textContent = fmt(STANDARD_JEOPARDY_VALUES[row]);
  $("cell-question").value = cl.q;
  $("cell-answer").value = cl.a;
  $("cell-dd").checked = cl.dd;
  $("cell-modal").classList.remove("hidden");
  $("cell-question").focus();
}

function commitCell() {
  const cl = editorBoard.categories[editorCell.col].clues[editorCell.row];
  cl.q = $("cell-question").value.trim();
  cl.a = $("cell-answer").value.trim();
  cl.dd = $("cell-dd").checked;
  persistEditorBoard();
}

function closeCellEditor() {
  commitCell();
  $("cell-modal").classList.add("hidden");
  renderEditor();
}

// Step through cells down a column, then on to the next column — the order you
// actually write a category in.
function stepCell(delta) {
  commitCell();
  const flat = editorCell.col * NUM_ROWS + editorCell.row;
  const total = NUM_CATS * NUM_ROWS;
  const next = (flat + delta + total) % total;
  renderEditorGrid();
  renderEditorIssues();
  openCellEditor(Math.floor(next / NUM_ROWS), next % NUM_ROWS);
}

// ---------- Toolbar ----------
function scatterDailyDoubles() {
  for (const cat of editorBoard.categories) for (const cl of cat.clues) cl.dd = false;
  // One Daily Double, weighted toward the harder (lower) rows like the real show.
  const rowWeights = [1, 2, 3, 3, 2];
  const bag = [];
  for (let r = 0; r < NUM_ROWS; r++) for (let n = 0; n < rowWeights[r]; n++) bag.push(r);
  const row = bag[Math.floor(Math.random() * bag.length)];
  const col = Math.floor(Math.random() * NUM_CATS);
  editorBoard.categories[col].clues[row].dd = true;
  persistEditorBoard();
  renderEditor();
}

function applyPreviewVisibility() {
  $("editor-grid").classList.toggle("hidden", previewOn);
  $("editor-preview-wrap").classList.toggle("hidden", !previewOn);
  $("btn-editor-preview").textContent = previewOn ? "Back to Editing" : "Preview";
  if (previewOn) renderEditorPreview();
}

// Read-only render of what the board will look like in play.
function renderEditorPreview() {
  const board = $("editor-preview-board");
  board.innerHTML = "";
  for (const cat of editorBoard.categories) {
    const el = document.createElement("div");
    el.className = "category-cell";
    el.textContent = cat.name.trim() || "—";
    board.appendChild(el);
  }
  for (let r = 0; r < NUM_ROWS; r++) {
    for (let c = 0; c < NUM_CATS; c++) {
      const el = document.createElement("div");
      el.className = "clue-cell";
      el.textContent = fmt(STANDARD_JEOPARDY_VALUES[r]);
      board.appendChild(el);
    }
  }
}

// ---------- Export / import / share ----------
function exportBoard() {
  const safe = (editorBoard.name || "board").replace(/[^\w\- ]+/g, "").trim() || "board";
  const blob = new Blob([JSON.stringify(editorBoard, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${safe}.jeoprady.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function importBoardFile(file) {
  const reader = new FileReader();
  reader.onload = () => {
    let raw;
    try {
      raw = JSON.parse(String(reader.result));
    } catch {
      alert("That file isn't valid JSON.");
      return;
    }
    const board = normalizeBoard(raw);
    board.id = blankBoard().id; // never collide with an existing saved board
    const all = loadLibrary();
    all.unshift(board);
    saveLibrary(all);
    renderLibrary();
  };
  reader.readAsText(file);
}

// UTF-8 safe base64, URL-hash friendly.
function encodeBoard(b) {
  const bytes = new TextEncoder().encode(JSON.stringify(b));
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function decodeBoard(str) {
  let b64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (b64.length % 4) b64 += "=";
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return JSON.parse(new TextDecoder().decode(bytes));
}

function shareBoard() {
  // Strip the local id so an imported copy doesn't overwrite the sender's board.
  const payload = { ...editorBoard, id: undefined };
  const url = `${location.origin}${location.pathname}#board=${encodeBoard(payload)}`;
  if (url.length > SHARE_SOFT_LIMIT) {
    alert(`This board makes a ${url.length}-character link, which many browsers and chat apps will truncate.\nUse Export instead and send the JSON file.`);
    return;
  }
  const done = () => alert("Share link copied to your clipboard.");
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(url).then(done, () => prompt("Copy this link:", url));
  } else {
    prompt("Copy this link:", url);
  }
}

// A board arriving by link is imported into the library, then opened. The hash
// is cleared so a refresh doesn't import it a second time.
function importFromHash() {
  const m = /^#board=(.+)$/.exec(location.hash);
  if (!m) return false;
  let board;
  try {
    board = normalizeBoard(decodeBoard(m[1]));
  } catch {
    history.replaceState(null, "", location.pathname);
    return false;
  }
  board.id = blankBoard().id;
  const all = loadLibrary();
  all.unshift(board);
  saveLibrary(all);
  history.replaceState(null, "", location.pathname);
  openEditor(board);
  return true;
}

// ---------- Paste importer ----------
// Accepts tab-separated (straight from a spreadsheet) or comma-separated rows of
// Category, Clue, Answer. Commas are split on the first and last one so clue
// text containing commas survives.
function parsePasted(text) {
  const rows = [];
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) continue;
    let parts;
    if (line.includes("\t")) {
      parts = line.split("\t");
    } else {
      const first = line.indexOf(",");
      const last = line.lastIndexOf(",");
      if (first === -1 || first === last) continue;
      parts = [line.slice(0, first), line.slice(first + 1, last), line.slice(last + 1)];
    }
    const [cat, q, a] = parts.map((s) => (s || "").trim());
    if (!cat || !q || !a) continue;
    rows.push({ cat, q, a });
  }
  return rows;
}

function buildFromPaste(text) {
  const rows = parsePasted(text);
  if (!rows.length) return { error: "Couldn't find any rows shaped like: Category, Clue, Answer." };

  const order = [];
  const byCat = new Map();
  for (const r of rows) {
    const key = r.cat.toUpperCase();
    if (!byCat.has(key)) {
      if (order.length >= NUM_CATS) continue; // ignore categories past the sixth
      order.push(key);
      byCat.set(key, { name: r.cat, clues: [] });
    }
    const bucket = byCat.get(key);
    if (bucket.clues.length < NUM_ROWS) bucket.clues.push({ q: r.q, a: r.a, dd: false });
  }

  const board = blankBoard("Pasted Board");
  order.forEach((key, i) => {
    const src = byCat.get(key);
    board.categories[i].name = src.name.slice(0, 40);
    src.clues.forEach((cl, r) => { board.categories[i].clues[r] = cl; });
  });
  return { board, cats: order.length, clues: rows.length };
}

// ---------- Play ----------
// Convert a saved board into the runtime shape game.js renders and judges.
function toPlayableBoard(b) {
  const categories = b.categories.map((c) => ({
    name: c.name.trim(),
    clues: c.clues.map((cl, idx) => ({
      position: idx,
      standardValue: STANDARD_JEOPARDY_VALUES[idx],
      isDailyDouble: !!cl.dd,
      wager: STANDARD_JEOPARDY_VALUES[idx],
      question: cl.q,
      answer: cl.a,
    })),
  }));

  let final = null;
  if (b.final.question.trim() && b.final.answer.trim()) {
    final = {
      category: b.final.category.trim() || "FINAL JEOPARDY",
      question: b.final.question.trim(),
      answer: b.final.answer.trim(),
    };
  } else if (state.boards && state.boards.length) {
    // No hand-written Final: borrow one from a real episode.
    final = state.boards[Math.floor(Math.random() * state.boards.length)].final;
  } else {
    final = { category: "FINAL JEOPARDY", question: "(No Final Jeopardy clue was written.)", answer: "—" };
  }

  return {
    show: "Custom",
    airDate: b.name,
    jeopardy: { scale: "new", values: STANDARD_JEOPARDY_VALUES, categories },
    double: null,
    final,
  };
}

let pendingBuiltBoard = null;

// Called by game.js once team setup is confirmed for the 'built' flow.
function startBuiltGame() {
  state.mode = "custom";
  state.currentBoard = toPlayableBoard(pendingBuiltBoard);
  state.teams.forEach((t) => { t.score = 0; });
  renderTeamsDisplay();
  beginRound("jeopardy");
}

// ---------- Wire up ----------
document.addEventListener("DOMContentLoaded", () => {
  $("btn-build-game").addEventListener("click", openBuilderLibrary);
  $("btn-lib-back").addEventListener("click", () => showScreen("start-screen"));
  $("btn-lib-new").addEventListener("click", () => openEditor(blankBoard()));

  $("btn-lib-import").addEventListener("click", () => $("lib-file-input").click());
  $("lib-file-input").addEventListener("change", (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) importBoardFile(file);
    e.target.value = ""; // let the same file be picked again
  });

  // Paste-from-spreadsheet importer
  $("btn-lib-paste").addEventListener("click", () => {
    $("paste-input").value = "";
    $("paste-error").textContent = "";
    $("paste-modal").classList.remove("hidden");
    $("paste-input").focus();
  });
  $("btn-paste-cancel").addEventListener("click", () => $("paste-modal").classList.add("hidden"));
  $("btn-paste-go").addEventListener("click", () => {
    const result = buildFromPaste($("paste-input").value);
    if (result.error) {
      $("paste-error").textContent = result.error;
      return;
    }
    $("paste-modal").classList.add("hidden");
    const all = loadLibrary();
    all.unshift(result.board);
    saveLibrary(all);
    openEditor(result.board);
  });

  // Editor chrome
  $("editor-name").addEventListener("input", () => {
    editorBoard.name = $("editor-name").value.trim().slice(0, 60) || "Untitled Board";
    persistEditorBoard();
  });
  $("btn-editor-back").addEventListener("click", () => {
    persistEditorBoard();
    openBuilderLibrary();
  });
  $("btn-editor-preview").addEventListener("click", () => {
    previewOn = !previewOn;
    applyPreviewVisibility();
  });
  $("btn-editor-scatter").addEventListener("click", scatterDailyDoubles);
  $("btn-editor-export").addEventListener("click", exportBoard);
  $("btn-editor-share").addEventListener("click", shareBoard);
  $("btn-editor-delete").addEventListener("click", () => {
    if (!confirm(`Delete "${editorBoard.name}"? This cannot be undone.`)) return;
    saveLibrary(loadLibrary().filter((b) => b.id !== editorBoard.id));
    openBuilderLibrary();
  });
  $("btn-editor-play").addEventListener("click", () => {
    persistEditorBoard();
    pendingBuiltBoard = editorBoard;
    openTeamSetup("built");
  });

  // Cell modal
  $("btn-cell-save").addEventListener("click", closeCellEditor);
  $("btn-cell-prev").addEventListener("click", () => stepCell(-1));
  $("btn-cell-next").addEventListener("click", () => stepCell(1));
  $("btn-cell-clear").addEventListener("click", () => {
    $("cell-question").value = "";
    $("cell-answer").value = "";
    $("cell-dd").checked = false;
  });
  $("cell-modal").addEventListener("keydown", (e) => {
    if (e.key === "Escape") { e.preventDefault(); closeCellEditor(); }
    // Enter saves and moves on; Shift+Enter is a newline inside the clue.
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); stepCell(1); }
  });

  // Final Jeopardy modal
  $("btn-editor-final").addEventListener("click", () => {
    $("fe-category").value = editorBoard.final.category;
    $("fe-question").value = editorBoard.final.question;
    $("fe-answer").value = editorBoard.final.answer;
    $("final-edit-modal").classList.remove("hidden");
    $("fe-category").focus();
  });
  $("btn-fe-clear").addEventListener("click", () => {
    $("fe-category").value = "";
    $("fe-question").value = "";
    $("fe-answer").value = "";
  });
  $("btn-fe-save").addEventListener("click", () => {
    editorBoard.final = {
      category: $("fe-category").value.trim(),
      question: $("fe-question").value.trim(),
      answer: $("fe-answer").value.trim(),
    };
    persistEditorBoard();
    $("final-edit-modal").classList.add("hidden");
    renderEditorIssues();
  });

  importFromHash();
});
