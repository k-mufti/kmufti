// Infinite Kitchen, V1 — every recipe is hand-written (see the .txt files).
//
// The room is the interface. Food goes on the cutting board and combines by
// being dropped on other food. The techniques are tools around the room:
// drop food on a station (the oven, the pot) or carry a hand tool (the knife,
// the bowl) onto food. Cuisines are cookbooks on the shelf, used the same
// way. A tool is a black silhouette until you've found it. The compost bin
// throws things away.
//
// Pairs are unordered, so a combo is looked up by its two names sorted -
// the same key recipes.json is built with.
//
// Progress lives in localStorage: what you have found and how you first made
// it, the pairs you tried that have no recipe yet, and what is on the board.
"use strict";

(function () {
  const SAVE_KEY = "infinite-kitchen:v2";
  const isLocal = location.hostname === "localhost" || location.hostname === "127.0.0.1";
  const API = (isLocal ? `${location.protocol}//${location.hostname}:8027` : "") + "/infinite-kitchen/api";
  const DRAG_START_PX = 4;

  const $ = (id) => document.getElementById(id);
  const counter = $("counter");
  const pantryEl = $("pantry");
  const shelf = $("shelf");
  const search = $("search");
  const tools = [...document.querySelectorAll(".tool")];
  const cookbooksEl = $("cookbooks");
  const bin = $("bin");

  let DATA = null;            // recipes.json
  const RECIPES = new Map();  // "a|b" (sorted) -> result
  const UNLOCKS = new Map();  // signature dish -> cuisine
  let tab = "ingredient";
  let CTX = null;             // what rules.js needs to know about an item
  let COOKED = new Set();     // everything a heat technique ever touched

  // The room is drawn by scene3d.js (window.K3), which loads on its own
  // time: until it's ready there is nothing to point at and no board.
  const room = $("room");
  const k3 = () => (window.K3 && window.K3.ready ? window.K3 : null);
  function layout() {
    const K = k3();
    if (K) {
      K.resize();
      const b = K.boardRect();
      Object.assign(counter.style, { left: b.x + "px", top: b.y + "px", width: b.w + "px", height: b.h + "px" });
    }
    if (DATA) keepOnCounter();
  }
  window.kitchenLayout = layout;
  const toolFor = (tech) => tools.find((t) => t.dataset.tech === tech);
  // a spot in the 3D room <-> its element in the hidden stage
  const idOf = (el) => el.dataset.tech || el.dataset.cuisine || el.id;
  const elFor = (id) => id && (toolFor(id) || cookbooksEl.querySelector(`[data-cuisine="${CSS.escape(id)}"]`) || $(id));

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
  const labelOf = (tech) => toolFor(tech)?.dataset.label || tech;

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
  const restart = (el, cls) => { if (!el) return; el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); };

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
    if (kind === "technique") {
      toast(`New tool: <strong>the ${esc(labelOf(result).toLowerCase())}</strong> (${esc(result)})`, "big", 4000);
      renderRoom();
      restart(toolFor(result), "unlocking");
      return;
    }
    const label = { ingredient: "New ingredient", dish: "New dish", cuisine: "New cuisine", trash: "Into the bin" }[kind];
    toast(`${label}: <strong>${esc(result)}</strong>`);

    const cuisine = UNLOCKS.get(result);
    if (cuisine && !has(cuisine)) {
      discover(cuisine, null, result);
      const added = DATA.cuisines[cuisine].pantry.filter((p) => discover(p, null, cuisine));
      const extra = added.length ? `<br>Added to your pantry: ${added.map(esc).join(", ")}` : "";
      toast(`<strong>${esc(cuisine)} cookbook unlocked!</strong>${extra}`, "big", 5200);
      renderRoom();
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

  /* ---------- the room: tools and cookbooks ---------- */
  function renderRoom() {
    for (const t of tools) {
      const open = has(t.dataset.tech);
      t.classList.toggle("locked", !open);
      t.title = open ? `${t.dataset.label} (${t.dataset.tech})` : "Not found yet";
    }
    cookbooksEl.replaceChildren();
    for (const c of Object.keys(DATA.cuisines)) {
      const b = document.createElement("div");
      const open = has(c);
      b.className = "cookbook" + (open ? "" : " locked");
      b.dataset.cuisine = c;
      b.title = open ? `${c} cookbook: drag it onto food` : "A cookbook you haven't unlocked";
      cookbooksEl.appendChild(b);
    }
    const tech = DATA.techniques.filter(has).length;
    const cui = Object.keys(DATA.cuisines).filter(has).length;
    $("pantryFoot").textContent = `Tools ${tech} / ${DATA.techniques.length}  ·  Cookbooks ${cui} / ${Object.keys(DATA.cuisines).length}`;
  }

  /* ---------- the board ---------- */
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
  // A spot on the board for a tapped item: near the middle, a little
  // scattered so repeated taps don't stack exactly.
  function freeSpot(w = 90, h = 34) {
    const r = counter.getBoundingClientRect();
    const x = r.width / 2 - w / 2 + (Math.random() - 0.5) * Math.min(260, r.width * 0.5);
    const y = r.height / 2 - h / 2 + (Math.random() - 0.5) * Math.min(180, r.height * 0.5);
    return { x: Math.max(8, Math.min(x, r.width - w - 8)), y: Math.max(8, Math.min(y, r.height - h - 8)) };
  }

  // Pull every tile back onto the board - a layout saved on a wide screen,
  // or a window made smaller, can leave some past the edge.
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

  // What's under the pointer in the room: a tool, a cookbook or the bin -
  // asked of the 3D room, which knows what's in front of what.
  function spotAt(ev, self) {
    const K = k3();
    if (!K) return null;
    const el = elFor(K.pick(ev.clientX, ev.clientY, self && idOf(self)));
    return el && el.matches(".tool, .cookbook, .bin") ? el : null;
  }
  // A tool can also be used on itself - the clock twice is fermenting, the
  // stove twice is grilling - so when nothing else is under the pointer,
  // the tool being carried counts as the thing it was dropped on.
  function spotOrSelf(ev, self) {
    const K = k3();
    // itself first: the oven's hit box sits behind the stove top, and it
    // would otherwise win every time the stove is dropped on the stove
    if (K && elFor(K.pick(ev.clientX, ev.clientY)) === self) return self;
    return spotAt(ev, self);
  }
  function tileAt(ev) {
    for (const el of document.elementsFromPoint(ev.clientX, ev.clientY)) {
      const t = el.closest(".tile");
      if (t && !t.classList.contains("dragging")) return t;
    }
    return null;
  }

  // A written recipe first; failing that, the mechanical rules (rules.js).
  function resultFor(a, b) {
    const made = KitchenRules.find(a, b, CTX);
    if (!made) return null;
    // so the shelf knows what it is - but a name the recipes already know
    // keeps its kind, however it was reached (Egg + Fry is still a dish)
    if (!(made.result in DATA.items)) DATA.items[made.result] = made.kind;
    return made.result;
  }

  // Put a tile back where it came from, or off the board if it came from
  // the pantry and never landed.
  function sendHome(t) {
    if (t._home) place(t, t._home.x, t._home.y);
    else t.remove();
  }

  function combine(moving, still) {
    const a = moving.dataset.name, b = still.dataset.name;
    const result = resultFor(a, b);
    if (result) {
      const c = center(still);
      const cr = counter.getBoundingClientRect();
      moving.remove(); still.remove();
      if (kindOf(result) !== "technique") {
        const t = makeTile(result, 0, 0);
        place(t, c.x - cr.left - t.offsetWidth / 2, c.y - cr.top - t.offsetHeight / 2);
        t.classList.add("pop");
      }
      found(result, a, b);
      $("hint").classList.add("gone");
      renderShelf();
    } else {
      for (const t of [moving, still]) restart(t, "shake");
      place(moving, moving._x + 26, moving._y + 20);
      toast(`Nobody has cooked <strong>${esc(a)} + ${esc(b)}</strong> yet. It's in the notebook.`, "miss");
      noteMissing(a, b);
    }
    save();
  }

  // Food meets a tool or a cookbook: `with` is a technique or a cuisine.
  function applyTo(t, withName, el) {
    const a = t.dataset.name;
    const result = resultFor(a, withName);
    restart(el, "working");
    if (!result) {
      sendHome(t);
      if (t.isConnected) restart(t, "shake");
      toast(`Nobody has cooked <strong>${esc(a)} + ${esc(withName)}</strong> yet. It's in the notebook.`, "miss");
      noteMissing(a, withName);
      save();
      return;
    }
    const home = t._home;
    t.remove();
    if (kindOf(result) !== "technique") {
      const n = makeTile(result, 0, 0);
      const p = home || freeSpot(n.offsetWidth, n.offsetHeight);
      place(n, p.x, p.y);
      n.classList.add("pop");
      keepOnCounter();
    }
    if (result !== a) found(result, a, withName);
    $("hint").classList.add("gone");
    renderShelf();
    save();
  }

  // Two tools together (the clock on the stove) can reveal a new tool.
  function toolWithTool(a, b, el) {
    const w = RECIPES.get(key(a, b));
    if (w && kindOf(w) === "technique") {
      if (has(w)) toast(`That's the ${esc(labelOf(w).toLowerCase())} - you already have it.`);
      else found(w, a, b);
      save();
      return;
    }
    restart(el, "shake");
    toast(`Nothing happens.`, "miss");
  }

  /* ---------- dragging food ----------
     A tile being dragged floats in board coordinates but the board stops
     clipping while it's in the air ("in-flight"), so it can travel over the
     room and the pantry. Where it lands decides what happens: on food it
     combines, on a tool or cookbook it gets cooked, in the bin or back in
     the pantry it's thrown away, anywhere else in the room it goes home. */
  function drag(t, e, grabX, grabY) {
    t.classList.add("dragging");
    counter.classList.add("in-flight");
    try { t.setPointerCapture(e.pointerId); } catch { /* pointer already gone */ }
    let target = null, spot = null;
    const cr = () => counter.getBoundingClientRect();
    const mark = (next, prev) => { if (next !== prev) { prev?.classList.remove("target"); next?.classList.add("target"); } return next; };

    const move = (ev) => {
      const r = cr();
      place(t, ev.clientX - r.left - grabX, ev.clientY - r.top - grabY);
      const s = overPantry(ev) ? null : spotAt(ev, t);
      spot = mark(s, spot);
      target = mark(s ? null : (overPantry(ev) ? null : targetFor(t)), target);
    };
    const up = (ev) => {
      t.removeEventListener("pointermove", move);
      t.removeEventListener("pointerup", up);
      t.removeEventListener("pointercancel", up);
      t.classList.remove("dragging");
      counter.classList.remove("in-flight");
      target?.classList.remove("target");
      spot?.classList.remove("target");
      const s = overPantry(ev) ? null : spotAt(ev, t);
      if (s === bin) { t.remove(); restart(bin, "gulp"); save(); return; }
      if (s) {
        const name = s.dataset.tech || s.dataset.cuisine;
        if (s.classList.contains("locked")) {
          sendHome(t); restart(s, "shake");
          toast(s.classList.contains("cookbook") ? "That cookbook is still locked." : "You haven't found that tool yet.", "miss");
          save();
          return;
        }
        applyTo(t, name, s);
        return;
      }
      if (overPantry(ev)) { t.remove(); save(); return; }
      if (!insideCounter(ev)) { sendHome(t); save(); return; }
      // Settle on where the pointer actually let go - a quick flick can end
      // before a single move event has had the chance to pick a target.
      const r = cr();
      place(t, ev.clientX - r.left - grabX, ev.clientY - r.top - grabY);
      t._home = { x: t._x, y: t._y };
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

  // Double-click (or double-tap) a tile to get another one. The browser's own
  // dblclick never arrives - the drag swallows it - so taps are timed here.
  let lastTap = { t: null, at: 0 };
  counter.addEventListener("pointerdown", (e) => {
    const t = e.target.closest(".tile");
    if (!t || e.button > 0) return;
    e.preventDefault();
    const now = performance.now();
    if (lastTap.t === t && now - lastTap.at < 350) {
      lastTap = { t: null, at: 0 };
      const copy = makeTile(t.dataset.name, t._x + 16, t._y + 16);
      copy.classList.add("pop");
      keepOnCounter();
      save();
      return;
    }
    lastTap = { t, at: now };
    const r = t.getBoundingClientRect();
    t._home = { x: t._x, y: t._y };
    counter.appendChild(t);                       // bring to the front
    drag(t, e, e.clientX - r.left, e.clientY - r.top);
  });
  // Right-click a tile to take it off the board.
  counter.addEventListener("contextmenu", (e) => {
    const t = e.target.closest(".tile");
    if (!t) return;
    e.preventDefault();
    t.remove();
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
      t._home = null;
      const cr = counter.getBoundingClientRect();
      place(t, ev.clientX - cr.left - grabX, ev.clientY - cr.top - grabY);
      drag(t, ev, grabX, grabY);
      unfresh(name);
    };
    const up = () => {                            // a tap: put one on the board
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

  /* ---------- carrying a tool or a cookbook ----------
     Any found tool can be picked up (a copy of it follows the pointer): onto
     food it cooks that food, onto another tool it may reveal a new one. A
     plain click just says what the tool is for. */
  function carry(e, src) {
    if (e.button > 0) return;
    e.preventDefault();
    const tech = src.dataset.tech, cuisine = src.dataset.cuisine;
    const name = tech || cuisine;
    if (src.classList.contains("locked")) {
      toast(cuisine ? "A cookbook you haven't unlocked yet. Cook its signature dish." : "Something belongs here. Keep cooking to find it.", "miss");
      return;
    }
    const sx = e.clientX, sy = e.clientY;
    let held = false, ghost = null, over = null;
    // the last moments of the pointer, so letting go can become a throw
    let trail = [{ x: sx, y: sy, t: performance.now() }];
    // Picking it up: the real thing comes with the pointer. Only if the 3D
    // room isn't there yet does a flat picture stand in for it.
    const pickUp = (ev) => {
      held = !!k3()?.grab?.(name, ev.clientX, ev.clientY);
      if (held) return;
      ghost = document.createElement("div");
      ghost.className = "ghost";
      const img = new Image();
      img.src = k3()?.snapshot(name) || "";
      img.alt = "";
      ghost.appendChild(img);
      document.body.appendChild(ghost);
    };
    const putBack = () => { if (held) k3()?.sendHome?.(name); };
    const move = (ev) => {
      trail.push({ x: ev.clientX, y: ev.clientY, t: performance.now() });
      if (trail.length > 6) trail.shift();
      if (!held && !ghost) {
        if (Math.hypot(ev.clientX - sx, ev.clientY - sy) < DRAG_START_PX) return;
        pickUp(ev);
      }
      if (held) k3().hold(name, ev.clientX, ev.clientY);
      else { ghost.style.left = ev.clientX + "px"; ghost.style.top = ev.clientY + "px"; }
      const next = tileAt(ev) || (tech ? spotOrSelf(ev, src) : null);
      if (next !== over) { over?.classList.remove("target"); next?.classList.add("target"); over = next; }
    };
    const up = (ev) => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      over?.classList.remove("target");
      if (!held && !ghost) {                      // a click, not a carry
        if (cuisine) toast(`The ${esc(cuisine)} cookbook: drag it onto food to cook it ${esc(cuisine)}-style.`);
        else if (src.classList.contains("hand")) toast(`The ${esc(src.dataset.label.toLowerCase())}: drag it onto food to ${esc(tech.toLowerCase())} it.`);
        else toast(`The ${esc(src.dataset.label.toLowerCase())}: drag food onto it to ${esc(tech.toLowerCase())} it.`);
        return;
      }
      ghost?.remove();
      const tile = tileAt(ev);
      if (tile) { tile._home = { x: tile._x, y: tile._y }; putBack(); applyTo(tile, name, src); return; }
      // While it's in your hand it can't be dropped on itself, so using a
      // tool on itself means putting it back on its own empty place.
      const self = held && tech && k3().atHome(tech, ev.clientX, ev.clientY);
      const other = self ? src : (tech ? spotOrSelf(ev, src) : null);
      if (other && other.dataset.tech) {
        putBack();
        if (other.classList.contains("locked")) { restart(other, "shake"); return; }
        toolWithTool(tech, other.dataset.tech, other);
        return;
      }
      // Nothing under it: chuck it. A hand tool thrown across the room
      // bounces where it lands and floats home a few seconds later.
      const now = performance.now();
      const old = trail.find((p) => now - p.t < 130) || trail[0];
      const dt = Math.max(0.016, (now - old.t) / 1000);
      const speed = Math.hypot(ev.clientX - old.x, ev.clientY - old.y) / dt;
      if (tech && !overPantry(ev) && speed > 120 && k3()?.canThrow(tech)) {
        k3().throwTool(tech, ev.clientX, ev.clientY, (ev.clientX - old.x) / dt, (ev.clientY - old.y) / dt);
        return;
      }
      putBack();                                  // set down gently
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  }
  // Pressing on the room: a tool or cookbook gets carried, the bin, the
  // recipe book and the notes just open.
  room.addEventListener("pointerdown", (e) => {
    if (e.target.closest(".tile") || !k3()) return;
    const el = elFor(k3().pick(e.clientX, e.clientY));
    if (!el) return;
    hover(null);
    if (el.matches(".tool, .cookbook")) carry(e, el);
    else el.click();
  });
  // Pointing at something names it and lights it up.
  const spotLabel = $("spotLabel");
  let hovered = null;
  function hover(el, ev) {
    if (el !== hovered) { hovered?.classList.remove("hover"); el?.classList.add("hover"); hovered = el; }
    room.style.cursor = !el ? "" : el.classList.contains("locked") ? "not-allowed" : el.matches(".tool, .cookbook") ? "grab" : "pointer";
    if (!el) { spotLabel.hidden = true; return; }
    const r = room.getBoundingClientRect();
    spotLabel.textContent = el.classList.contains("locked") ? "???"
      : el.dataset.cuisine ? `${el.dataset.cuisine} cookbook`
      : el.dataset.tech ? `${el.dataset.label} · ${el.dataset.tech}`
      : { bin: "Compost bin", recipeBook: "Recipe book", notepad: "Notebook" }[el.id];
    spotLabel.style.left = ev.clientX - r.left + "px";
    spotLabel.style.top = ev.clientY - r.top + "px";
    spotLabel.hidden = false;
  }
  room.addEventListener("pointermove", (e) => {
    if (e.buttons || e.pointerType === "touch" || !k3()) return hover(null);
    hover(e.target.closest(".tile") ? null : elFor(k3().pick(e.clientX, e.clientY)), e);
  });
  room.addEventListener("pointerleave", () => hover(null));

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

  // Start over from the starting pantry: forgets every discovery.
  $("resetBtn").addEventListener("click", () => {
    if (!confirm("Forget everything you've discovered and start from the beginning?")) return;
    try { localStorage.removeItem(SAVE_KEY); } catch { /* blocked */ }
    location.reload();
  });

  // the bin, clicked, shows what's in it
  bin.addEventListener("click", () => selectTab("trash"));

  /* ---------- the pantry shelf ---------- */
  // `plain` is for chips inside the book and notebook, which never show the
  // "new" dot - that belongs to the shelf.
  function chip(name, kind, locked, plain) {
    const c = document.createElement("div");
    c.className = "item" + (locked ? " locked" : "") + (!locked && !plain && S.found[name]?.fresh ? " new" : "");
    c.dataset.kind = kind;
    c.dataset.name = name;
    c.textContent = name;
    return c;
  }

  function renderShelf() {
    const q = search.value.trim().toLowerCase();
    shelf.replaceChildren();
    const names = Object.keys(S.found).filter((n) => kindOf(n) === tab);
    let shown = 0;
    for (const n of names) {
      if (q && !n.toLowerCase().includes(q)) continue;
      shelf.appendChild(chip(n, tab, false));
      shown++;
    }
    if (!shown) {
      const p = document.createElement("p");
      p.className = "shelf-note";
      p.textContent = q ? "Nothing here matches." : tab === "trash" ? "The bin is empty. Burn something." : "Nothing yet. Keep cooking.";
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

  function selectTab(name) {
    tab = name;
    for (const x of document.querySelectorAll(".tabs button")) x.setAttribute("aria-selected", String(x.dataset.tab === name));
    renderShelf();
  }
  document.querySelector(".tabs").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (b) selectTab(b.dataset.tab);
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
      how.append(eq(" in the kitchen from the start"));
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
  const openBook = () => { $("bookSearch").value = ""; renderBook(); $("bookDialog").showModal(); };
  $("bookBtn").addEventListener("click", openBook);
  $("recipeBook").addEventListener("click", openBook);

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
  const openNotebook = () => { renderNotebook(); $("notebookDialog").showModal(); };
  $("notebookBtn").addEventListener("click", openNotebook);
  $("notepad").addEventListener("click", openNotebook);
  $("copyMissing").addEventListener("click", async () => {
    const json = JSON.stringify(S.missing.map(([a, b]) => [a, b, ""]), null, 0).replace(/\],\[/g, "],\n[");
    try { await navigator.clipboard.writeText(json); toast("Copied " + S.missing.length + " pairs."); }
    catch { toast("Couldn't reach the clipboard.", "miss"); }
  });
  $("allMissing").href = API + "/missing";

  for (const d of document.querySelectorAll("dialog")) {
    d.addEventListener("click", (e) => { if (e.target === d || e.target.closest("[data-close]")) d.close(); });
  }

  layout();
  window.addEventListener("resize", layout);

  /* ---------- start ---------- */
  fetch("recipes.json?v=9")
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
      const LIKE = data.like || {};
      CTX = {
        kindOf,
        written: (x, y) => RECIPES.get(key(x, y)),
        likeOf: (n) => LIKE[n] || null,
        follows: (n) => (data.follows || {})[n] || null,
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
      COOKED = KitchenRules.cookedSet(data.combos, data.items, data.starters, data.raw);

      load();
      for (const s of data.starters) if (!has(s)) S.found[s] = { from: null, via: null, fresh: false };
      // Items the rules made are saved with their kind and put back; anything
      // else recipes.json no longer knows about is dropped quietly, so
      // renaming an item doesn't leave a ghost on the shelf.
      for (const [n, f] of Object.entries(S.found)) {
        if (n in data.items) continue;
        // techniques and cuisines are never rule-made: an old save's merged-away
        // technique (Simmer, Whip...) just goes
        if (f.k && f.k !== "technique" && f.k !== "cuisine") data.items[n] = f.k; else delete S.found[n];
      }
      // Tools and cookbooks live in the room now, not on the board.
      for (const b of S.board) {
        const k = data.items[b.name];
        if (k && k !== "technique" && k !== "cuisine") makeTile(b.name, b.x, b.y);
      }
      layout();
      keepOnCounter();
      if (Object.keys(S.found).length > data.starters.length) $("hint").classList.add("gone");

      renderRoom();
      renderShelf();
      renderMissingCount();
      save();
    })
    .catch(() => toast("Couldn't load the recipes.", "miss", 8000));
})();
