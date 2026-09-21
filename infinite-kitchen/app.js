// Infinite Kitchen, V1 — every recipe is hand-written in recipes.json.
//
// Drag two things together on the counter. If recipes.json has that pair,
// you get the result; if it doesn't, the pair goes in the notebook (and to
// the server) so a recipe can be written for it. No AI yet, on purpose: this
// version exists to get the mechanics right.
//
// Pairs are unordered, so a combo is looked up by its two names sorted -
// the same key recipes.json is built with.
//
// Progress lives in localStorage: what you have found and how you first made
// it, the pairs you tried that have no recipe yet, and what is on the counter.
"use strict";

(function () {
  const SAVE_KEY = "infinite-kitchen:v1";
  const isLocal = location.hostname === "localhost" || location.hostname === "127.0.0.1";
  const API = (isLocal ? `${location.protocol}//${location.hostname}:8027` : "") + "/infinite-kitchen/api";
  const DRAG_START_PX = 4;

  const $ = (id) => document.getElementById(id);
  const counter = $("counter");
  const pantryEl = $("pantry");
  const shelf = $("shelf");
  const search = $("search");

  let DATA = null;            // recipes.json
  const RECIPES = new Map();  // "a|b" (sorted) -> result
  const UNLOCKS = new Map();  // signature dish -> cuisine
  let tab = "ingredient";
  let CTX = null;             // what rules.js needs to know about an item
  let COOKED = new Set();     // everything a heat technique ever touched

  /* ---------- saved state ---------- */
  // found: { name: { from: [a, b] | null, via: string | null, fresh: bool } }
  //   insertion order is discovery order, which is also shelf order.
  // missing: [[a, b], ...]  pairs with no recipe, as the player tried them
  // board: [{ name, x, y }]
  let S = { found: {}, missing: [], board: [] };

  function load() {
    try {
      const raw = JSON.parse(localStorage.getItem(SAVE_KEY));
      if (raw && raw.found) S = { found: raw.found, missing: raw.missing || [], board: raw.board || [] };
    } catch { /* private mode, or nothing saved yet */ }
  }
  function save() {
    S.board = [...counter.querySelectorAll(".tile")].map((t) => ({ name: t.dataset.name, x: t._x, y: t._y }));
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch { /* full or blocked */ }
  }

  const key = (a, b) => [a, b].sort().join("|");
  const kindOf = (name) => DATA.items[name] || "ingredient";
  const has = (name) => Object.prototype.hasOwnProperty.call(S.found, name);

  /* ---------- toasts ---------- */
  function toast(html, cls = "", ms = 2600) {
    const t = document.createElement("div");
    t.className = "toast " + cls;
    t.innerHTML = html;
    $("toasts").prepend(t);
    const all = $("toasts").children;
    while (all.length > 4) all[all.length - 1].remove();
    setTimeout(() => { t.classList.add("out"); setTimeout(() => t.remove(), 300); }, ms);
  }
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* ---------- discovery ---------- */
  function discover(name, from, via) {
    if (has(name)) return false;
    // The kind travels with it: a name the rules made isn't in recipes.json,
    // so without this the shelf would forget what it was after a reload.
    S.found[name] = { from: from || null, via: via || null, fresh: true, k: kindOf(name) };
    return true;
  }

  function found(result, a, b) {
    if (!discover(result, [a, b])) return;
    const kind = kindOf(result);
    const label = { ingredient: "New ingredient", dish: "New dish", technique: "New technique",
                    cuisine: "New cuisine", trash: "Into the bin" }[kind];
    toast(`${label}: <strong>${esc(result)}</strong>`);

    const cuisine = UNLOCKS.get(result);
    if (cuisine && !has(cuisine)) {
      discover(cuisine, null, result);
      const added = DATA.cuisines[cuisine].pantry.filter((p) => discover(p, null, cuisine));
      const extra = added.length ? `<br>Added to your pantry: ${added.map(esc).join(", ")}` : "";
      toast(`<strong>${esc(cuisine)} cuisine unlocked!</strong>${extra}`, "big", 5200);
    }
  }

  function noteMissing(a, b) {
    const [x, y] = [a, b].sort();
    if (!S.missing.some(([p, q]) => p === x && q === y)) S.missing.push([x, y]);
    renderMissingCount();
    fetch(API + "/missing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ a: x, b: y }),
      keepalive: true,
    }).catch(() => { /* offline or no backend: the local notebook still has it */ });
  }

  /* ---------- the counter ---------- */
  function makeTile(name, x, y) {
    const t = document.createElement("div");
    t.className = "item tile";
    t.dataset.name = name;
    t.dataset.kind = kindOf(name);
    t.textContent = name;
    counter.appendChild(t);
    place(t, x, y);
    return t;
  }
  function place(t, x, y) {
    // left/top rather than a transform: the pop and shake animations use
    // scale and translate, which would otherwise scale the position too.
    t._x = x; t._y = y;
    t.style.left = x + "px";
    t.style.top = y + "px";
  }
  function center(t) {
    const r = t.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }
  // A spot on the counter for a tapped item: near the middle, a little
  // scattered so repeated taps don't stack exactly.
  function freeSpot(w = 90, h = 34) {
    const r = counter.getBoundingClientRect();
    const x = r.width / 2 - w / 2 + (Math.random() - 0.5) * Math.min(260, r.width * 0.5);
    const y = r.height / 2 - h / 2 + (Math.random() - 0.5) * Math.min(180, r.height * 0.5);
    return { x: Math.max(8, x), y: Math.max(8, y) };
  }

  // Pull every tile back inside the counter - a layout saved on a wide
  // screen, or a window made smaller, can leave some past the edge.
  function keepOnCounter() {
    const r = counter.getBoundingClientRect();
    for (const t of counter.querySelectorAll(".tile")) {
      const x = Math.min(Math.max(0, t._x), Math.max(0, r.width - t.offsetWidth));
      const y = Math.min(Math.max(0, t._y), Math.max(0, r.height - t.offsetHeight));
      if (x !== t._x || y !== t._y) place(t, x, y);
    }
  }

  // The tile you'd combine with if you let go now: the one under the dragged
  // tile's centre, or failing that the nearest one it overlaps.
  function targetFor(t) {
    const c = center(t);
    const a = t.getBoundingClientRect();
    let best = null, bestD = Infinity;
    for (const o of counter.querySelectorAll(".tile")) {
      if (o === t) continue;
      const b = o.getBoundingClientRect();
      const overlap = a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
      if (!overlap) continue;
      const oc = center(o);
      const d = Math.hypot(oc.x - c.x, oc.y - c.y);
      if (d < bestD) { best = o; bestD = d; }
    }
    return best;
  }

  // A written recipe first; failing that, the mechanical rules (rules.js).
  function resultFor(a, b) {
    const written = RECIPES.get(key(a, b));
    if (written) return written;
    const made = KitchenRules.make(a, b, CTX);
    if (!made) return null;
    DATA.items[made.result] = made.kind;      // so the shelf knows what it is
    return made.result;
  }

  function combine(moving, still) {
    const a = moving.dataset.name, b = still.dataset.name;
    const result = resultFor(a, b);
    if (result) {
      const c = center(still);
      const cr = counter.getBoundingClientRect();
      moving.remove(); still.remove();
      const t = makeTile(result, 0, 0);
      place(t, c.x - cr.left - t.offsetWidth / 2, c.y - cr.top - t.offsetHeight / 2);
      t.classList.add("pop");
      found(result, a, b);
      $("hint").classList.add("gone");
      renderShelf();
    } else {
      for (const t of [moving, still]) {
        t.classList.remove("shake"); void t.offsetWidth; t.classList.add("shake");
      }
      place(moving, moving._x + 26, moving._y + 20);
      toast(`Nobody has cooked <strong>${esc(a)} + ${esc(b)}</strong> yet. It's in the notebook.`, "miss");
      noteMissing(a, b);
    }
    save();
  }

  /* ---------- dragging ----------
     One pointer routine for both cases: picking a tile up off the counter,
     and pulling a new one off the shelf. A tile being dragged floats in
     counter coordinates but the counter stops clipping while it's in the
     air ("in-flight"), so it can travel over the pantry. When it lands it is
     either dropped on the counter or, over the pantry, thrown away. */
  function drag(t, e, grabX, grabY) {
    t.classList.add("dragging");
    counter.classList.add("in-flight");
    try { t.setPointerCapture(e.pointerId); } catch { /* pointer already gone */ }
    let target = null;
    const cr = () => counter.getBoundingClientRect();

    const move = (ev) => {
      const r = cr();
      place(t, ev.clientX - r.left - grabX, ev.clientY - r.top - grabY);
      const next = overPantry(ev) ? null : targetFor(t);
      if (next !== target) {
        target?.classList.remove("target");
        next?.classList.add("target");
        target = next;
      }
    };
    const up = (ev) => {
      t.removeEventListener("pointermove", move);
      t.removeEventListener("pointerup", up);
      t.removeEventListener("pointercancel", up);
      t.classList.remove("dragging");
      counter.classList.remove("in-flight");
      target?.classList.remove("target");
      if (overPantry(ev) || !insideCounter(ev)) { t.remove(); save(); return; }
      // Settle on where the pointer actually let go - a quick flick can end
      // before a single move event has had the chance to pick a target.
      const r = cr();
      place(t, ev.clientX - r.left - grabX, ev.clientY - r.top - grabY);
      target = targetFor(t);
      if (target) combine(t, target);
      else save();
    };
    t.addEventListener("pointermove", move);
    t.addEventListener("pointerup", up);
    t.addEventListener("pointercancel", up);
  }
  function overPantry(ev) {
    const r = pantryEl.getBoundingClientRect();
    return ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom;
  }
  function insideCounter(ev) {
    const r = counter.getBoundingClientRect();
    return ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom;
  }

  counter.addEventListener("pointerdown", (e) => {
    const t = e.target.closest(".tile");
    if (!t || e.button > 0) return;
    e.preventDefault();
    const r = t.getBoundingClientRect();
    counter.appendChild(t);                       // bring to the front
    drag(t, e, e.clientX - r.left, e.clientY - r.top);
  });
  counter.addEventListener("dblclick", (e) => {
    const t = e.target.closest(".tile");
    if (!t) return;
    const copy = makeTile(t.dataset.name, t._x + 16, t._y + 16);
    copy.classList.add("pop");
    save();
  });

  shelf.addEventListener("pointerdown", (e) => {
    const chip = e.target.closest(".item");
    if (!chip || chip.classList.contains("locked") || e.button > 0) return;
    e.preventDefault();
    const name = chip.dataset.name;
    const sx = e.clientX, sy = e.clientY;
    const r = chip.getBoundingClientRect();
    const grabX = sx - r.left, grabY = sy - r.top;

    const move = (ev) => {
      if (Math.hypot(ev.clientX - sx, ev.clientY - sy) < DRAG_START_PX) return;
      stop();
      const t = makeTile(name, 0, 0);
      const cr = counter.getBoundingClientRect();
      place(t, ev.clientX - cr.left - grabX, ev.clientY - cr.top - grabY);
      drag(t, ev, grabX, grabY);
      unfresh(name);
    };
    const up = () => {                            // a tap: put one on the counter
      stop();
      const t = makeTile(name, 0, 0);
      const p = freeSpot(t.offsetWidth, t.offsetHeight);
      place(t, p.x, p.y);
      t.classList.add("pop");
      unfresh(name);
      save();
    };
    const stop = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", stop);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", stop);
  });

  function unfresh(name) {
    if (S.found[name]?.fresh) {
      S.found[name].fresh = false;
      shelf.querySelector(`[data-name="${CSS.escape(name)}"]`)?.classList.remove("new");
    }
  }

  $("clearBtn").addEventListener("click", () => {
    counter.querySelectorAll(".tile").forEach((t) => t.remove());
    save();
  });

  /* ---------- the pantry shelf ---------- */
  // `plain` is for chips inside the book and notebook, which never show the
  // "new" dot - that belongs to the shelf.
  function chip(name, kind, locked, plain) {
    const c = document.createElement("div");
    c.className = "item" + (locked ? " locked" : "") + (!locked && !plain && S.found[name]?.fresh ? " new" : "");
    c.dataset.kind = kind;
    if (locked) {
      // Same width as the real name, but the name itself is not in the page.
      c.textContent = "x".repeat(name.length);
      c.title = kind === "cuisine" ? "Locked: cook one of its signature dishes" : "Not discovered yet";
    } else {
      c.dataset.name = name;
      c.textContent = name;
    }
    return c;
  }

  function renderShelf() {
    const q = search.value.trim().toLowerCase();
    shelf.replaceChildren();
    const fixed = tab === "technique" || tab === "cuisine";
    // Techniques and cuisines are a known, finite set: show all of them,
    // blacked out until found. Ingredients and dishes only show once found.
    const names = fixed
      ? (tab === "technique" ? DATA.techniques : Object.keys(DATA.cuisines))
      : Object.keys(S.found).filter((n) => kindOf(n) === tab);
    let shown = 0;
    for (const n of names) {
      const locked = !has(n);
      if (q && (locked || !n.toLowerCase().includes(q))) continue;
      shelf.appendChild(chip(n, tab, locked));
      shown++;
    }
    if (!shown) {
      const p = document.createElement("p");
      p.className = "shelf-note";
      p.textContent = q ? "Nothing here matches." : "Nothing yet. Keep cooking.";
      shelf.appendChild(p);
    }
    for (const b of document.querySelectorAll(".tabs button")) {
      const k = b.dataset.tab;
      const total = TOTALS[k];
      const got = Object.keys(S.found).filter((n) => kindOf(n) === k).length;
      b.querySelector("span").textContent = got > total ? String(got) : `${got} / ${total}`;
    }
  }
  let TOTALS = {};

  document.querySelector(".tabs").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    tab = b.dataset.tab;
    for (const x of document.querySelectorAll(".tabs button")) x.setAttribute("aria-selected", String(x === b));
    renderShelf();
  });
  search.addEventListener("input", renderShelf);

  /* ---------- recipe book ---------- */
  function bookEntry(name) {
    const li = document.createElement("li");
    li.dataset.name = name;
    const f = S.found[name];
    const res = chip(name, kindOf(name), false, true);
    li.append(res);
    const how = document.createElement("span");
    how.className = "how";
    if (f.from) {
      how.append(eq(" = "), chip(f.from[0], kindOf(f.from[0]), false, true), eq(" + "), chip(f.from[1], kindOf(f.from[1]), false, true));
    } else if (f.via && kindOf(name) === "cuisine") {
      how.append(eq(" unlocked by cooking "), chip(f.via, kindOf(f.via), false, true));
    } else if (f.via) {
      how.append(eq(" from the " + f.via + " pantry"));
    } else {
      how.append(eq(" in the pantry from the start"));
    }
    li.append(how);
    return li;
  }
  const eq = (s) => Object.assign(document.createElement("span"), { className: "eq", textContent: s });

  function renderBook() {
    const q = $("bookSearch").value.trim().toLowerCase();
    const list = $("bookList");
    list.replaceChildren();
    const names = Object.keys(S.found).reverse();          // newest first
    for (const n of names) {
      if (q && !n.toLowerCase().includes(q)) continue;
      list.appendChild(bookEntry(n));
    }
    if (!list.children.length) list.innerHTML = `<li class="empty">No recipes match.</li>`;
    const dishes = Object.keys(S.found).filter((n) => kindOf(n) === "dish").length;
    $("bookSummary").textContent = `${Object.keys(S.found).length} things found, ${dishes} of ${TOTALS.dish} dishes cooked.`;
  }
  // Clicking an ingredient in a recipe jumps to how that one was made.
  $("bookList").addEventListener("click", (e) => {
    const c = e.target.closest(".item");
    if (!c) return;
    $("bookSearch").value = "";
    renderBook();
    const li = $("bookList").querySelector(`li[data-name="${CSS.escape(c.dataset.name)}"]`);
    if (!li) return;
    li.scrollIntoView({ block: "center", behavior: "smooth" });
    li.classList.add("flash");
    setTimeout(() => li.classList.remove("flash"), 1200);
  });
  $("bookSearch").addEventListener("input", renderBook);
  $("bookBtn").addEventListener("click", () => { $("bookSearch").value = ""; renderBook(); $("bookDialog").showModal(); });

  /* ---------- notebook: pairs with no recipe yet ---------- */
  function renderMissingCount() {
    const n = S.missing.length;
    $("missingCount").hidden = !n;
    $("missingCount").textContent = n;
  }
  function renderNotebook() {
    const list = $("missingList");
    list.replaceChildren();
    for (const [a, b] of [...S.missing].reverse()) {
      const li = document.createElement("li");
      li.append(chip(a, kindOf(a), false, true), eq(" + "), chip(b, kindOf(b), false, true), eq(" = ?"));
      list.appendChild(li);
    }
    if (!S.missing.length) list.innerHTML = `<li class="empty">Nothing yet. Every pair you've tried has a recipe.</li>`;
  }
  $("notebookBtn").addEventListener("click", () => { renderNotebook(); $("notebookDialog").showModal(); });
  $("copyMissing").addEventListener("click", async () => {
    const json = JSON.stringify(S.missing.map(([a, b]) => [a, b, ""]), null, 0).replace(/\],\[/g, "],\n[");
    try { await navigator.clipboard.writeText(json); toast("Copied " + S.missing.length + " pairs."); }
    catch { toast("Couldn't reach the clipboard.", "miss"); }
  });
  $("allMissing").href = API + "/missing";

  for (const d of document.querySelectorAll("dialog")) {
    d.addEventListener("click", (e) => { if (e.target === d || e.target.closest("[data-close]")) d.close(); });
  }

  /* ---------- start ---------- */
  fetch("recipes.json?v=2")
    .then((r) => r.json())
    .then((data) => {
      DATA = data;
      DATA.techniques = Object.keys(data.items).filter((n) => data.items[n] === "technique");
      for (const [a, b, r] of data.combos) RECIPES.set(key(a, b), r);
      for (const [c, v] of Object.entries(data.cuisines)) UNLOCKS.set(v.unlockedBy, c);
      TOTALS = { ingredient: 0, dish: 0, technique: 0, cuisine: 0, trash: 0 };
      for (const k of Object.values(data.items)) TOTALS[k]++;
      // The names recipes.json itself writes, so the rules can tell a dish's
      // own name from the flavours a player stacked on top of it.
      const WRITTEN = new Set(Object.keys(data.items));
      const SPLITS = KitchenRules.splitMap(data.combos, data.items);
      CTX = {
        kindOf,
        isWritten: (n) => WRITTEN.has(n),
        splitOf: (n) => SPLITS.get(n) || null,
        isCooked: (n) => COOKED.has(n),
        // A flavour is something you'd see in front of a dish on a menu - and
        // it has to be a real item, or a stray pair of words would pass as one.
        isModifier: (n) => {
          const k = data.items[n];
          return (k === "ingredient" || k === "dish") && !KitchenRules.NOT_A_FLAVOUR.has(n);
        },
      };
      COOKED = KitchenRules.cookedSet(data.combos, data.items, data.starters);

      load();
      for (const s of data.starters) if (!has(s)) S.found[s] = { from: null, via: null, fresh: false };
      // Items the rules made are saved with their kind and put back; anything
      // else recipes.json no longer knows about is dropped quietly, so
      // renaming an item doesn't leave a ghost on the shelf.
      for (const [n, f] of Object.entries(S.found)) {
        if (n in data.items) continue;
        if (f.k) data.items[n] = f.k; else delete S.found[n];
      }
      for (const b of S.board) if (b.name in data.items) makeTile(b.name, b.x, b.y);
      keepOnCounter();
      window.addEventListener("resize", keepOnCounter);
      if (Object.keys(S.found).length > data.starters.length) $("hint").classList.add("gone");

      renderShelf();
      renderMissingCount();
      save();
    })
    .catch(() => toast("Couldn't load the recipes.", "miss", 8000));
})();
