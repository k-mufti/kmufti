// Recipe review: every combo in recipes.json, once each, for rating by hand.
//
// Combos are grouped by item, in pantry order - Water first, then Salt,
// Sugar... then the techniques, then everything else in the order recipes.json
// first makes it. A pair is listed under whichever of its two items comes
// first, so "Salt + Water" lives under Water and never again under Salt.
//
// Each combo can be marked, and given your own answer in the box:
//   fire      it's right, keep it
//   simple    the result is too big a jump (Rice + Rice = Sticky Rice)
//   logical   there's a more obvious answer (Egg + Rice = Fried Rice?)
//   category  right name, wrong kind (a dish filed as an ingredient, ...)
//   remove    these two shouldn't combine at all
// and new combos can be added under any item.
//
// It all saves to this browser as you go, and - when the page is served by
// the kitchen backend on this machine - to infinite-kitchen/data/review.json
// too, where the next batch of edits can be read straight from.
"use strict";

(function () {
  const SAVE_KEY = "infinite-kitchen:review";
  const isLocal = location.hostname === "localhost" || location.hostname === "127.0.0.1";
  const API = (isLocal ? `${location.protocol}//${location.hostname}:8027` : "") + "/infinite-kitchen/api";
  const VERDICTS = [
    ["fire", "🔥 Fire"],
    ["simple", "Not simple enough"],
    ["logical", "Use a more logical answer"],
    ["category", "Wrong category"],
    ["remove", "Shouldn't combine"],
  ];
  const FLAGS = new Set(["simple", "logical", "category", "remove"]);
  const KINDS = ["ingredient", "dish", "technique", "cuisine"];

  const $ = (id) => document.getElementById(id);
  let DATA = null;
  let rank = new Map();     // item -> position in pantry order
  let filter = "all";

  // reviews: { "a|b": { v: verdict | "", text: "" } }
  // added:   [{ a, b, r, kind, at }]
  let R = { reviews: {}, added: [], savedAt: 0 };

  const key = (a, b) => [a, b].sort().join("|");
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const kindOf = (n) => DATA.items[n] || addedKind(n) || "ingredient";
  const addedKind = (n) => R.added.find((x) => x.r === n)?.kind;

  function toast(html, ms = 2400) {
    const t = document.createElement("div");
    t.className = "toast";
    t.innerHTML = html;
    $("toasts").prepend(t);
    setTimeout(() => { t.classList.add("out"); setTimeout(() => t.remove(), 300); }, ms);
  }

  /* ---------- saving ---------- */
  let saveTimer = null;
  function save() {
    R.savedAt = Date.now();
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(R)); } catch { /* blocked */ }
    clearTimeout(saveTimer);
    $("saved").textContent = "Saving…";
    saveTimer = setTimeout(async () => {
      try {
        const r = await fetch(API + "/review", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(R),
        });
        if (!r.ok) throw new Error(r.status);
        $("saved").textContent = "Saved to data/review.json";
      } catch {
        $("saved").textContent = "Saved in this browser (use Export to send it)";
      }
    }, 600);
    renderProgress();
  }

  /* ---------- building the list ---------- */
  function computeRank() {
    const order = [...DATA.starters];
    const push = (n) => { if (!order.includes(n)) order.push(n); };
    for (const [, , r] of DATA.combos) push(r);
    for (const c of Object.values(DATA.cuisines)) c.pantry.forEach(push);
    Object.keys(DATA.cuisines).forEach(push);
    for (const x of R.added) push(x.r);
    rank = new Map(order.map((n, i) => [n, i]));
  }
  const rk = (n) => rank.has(n) ? rank.get(n) : 1e9;

  // All combos, recipes.json's and yours, as { a, b, r, added } with a being
  // the item the pair is filed under.
  function allCombos() {
    const out = [];
    for (const [x, y, r] of DATA.combos) out.push(file(x, y, r, false));
    for (const ad of R.added) out.push(file(ad.a, ad.b, ad.r, true, ad));
    return out;
  }
  function file(x, y, r, added, src) {
    const [a, b] = rk(x) <= rk(y) ? [x, y] : [y, x];
    return { a, b, r, added, src, k: key(a, b) };
  }

  function chip(name) {
    const c = document.createElement("span");
    c.className = "item";
    c.dataset.kind = kindOf(name);
    c.textContent = name;
    return c;
  }
  const op = (s) => Object.assign(document.createElement("span"), { className: "op", textContent: s });

  function matches(c) {
    const rv = R.reviews[c.k] || {};
    if (filter === "todo" && (rv.v || c.added)) return false;
    if (filter === "flagged" && !(FLAGS.has(rv.v) || (rv.text || "").trim())) return false;
    if (filter === "fire" && rv.v !== "fire") return false;
    if (filter === "added" && !c.added) return false;
    const q = $("q").value.trim().toLowerCase();
    if (q && ![c.a, c.b, c.r, rv.text || ""].some((s) => s.toLowerCase().includes(q))) return false;
    return true;
  }

  function row(c) {
    const rv = R.reviews[c.k] || { v: "", text: "" };
    const el = document.createElement("div");
    el.className = "row" + (c.added ? " added" : "") + (rv.v ? " v-" + rv.v : "");
    el.dataset.k = c.k;

    const eqn = document.createElement("div");
    eqn.className = "eqn";
    eqn.append(chip(c.a), op("+"), chip(c.b), op("="), chip(c.r));
    if (c.added) eqn.append(Object.assign(document.createElement("span"), { className: "tag", textContent: "added by you" }));
    el.append(eqn);

    const v = document.createElement("div");
    v.className = "verdicts";
    if (c.added) {
      const del = Object.assign(document.createElement("button"), { type: "button", className: "added-del", textContent: "Delete" });
      del.addEventListener("click", () => {
        R.added = R.added.filter((x) => x !== c.src);
        save(); render();
      });
      v.append(del);
    } else {
      for (const [id, label] of VERDICTS) {
        const b = document.createElement("button");
        b.type = "button";
        b.dataset.v = id;
        b.textContent = label;
        b.setAttribute("aria-pressed", String(rv.v === id));
        b.addEventListener("click", () => {
          const cur = R.reviews[c.k] || { v: "", text: "" };
          cur.v = cur.v === id ? "" : id;               // click again to undo
          R.reviews[c.k] = cur;
          el.className = "row" + (cur.v ? " v-" + cur.v : "");
          for (const x of v.querySelectorAll("button")) x.setAttribute("aria-pressed", String(x.dataset.v === cur.v));
          save(); renderJump();
        });
        v.append(b);
      }
    }
    el.append(v);

    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = c.added ? "Note…" : "Your answer, or a note…";
    input.value = rv.text || "";
    input.setAttribute("list", "allItems");
    input.addEventListener("input", () => {
      const cur = R.reviews[c.k] || { v: "", text: "" };
      cur.text = input.value;
      R.reviews[c.k] = cur;
      save();
    });
    el.append(input);
    return el;
  }

  function addRow(owner) {
    const wrap = document.createElement("div");
    wrap.className = "add-row";
    const b = Object.assign(document.createElement("input"), { placeholder: "with…", type: "text" });
    const r = Object.assign(document.createElement("input"), { placeholder: "makes…", type: "text" });
    b.setAttribute("list", "allItems"); r.setAttribute("list", "allItems");
    const kind = document.createElement("select");
    for (const k of KINDS) kind.append(new Option(k, k, k === "dish", k === "dish"));
    // A result that already exists keeps its kind; the picker is for new names.
    r.addEventListener("input", () => {
      const known = DATA.items[r.value.trim()];
      kind.disabled = !!known;
      if (known) kind.value = known;
    });
    const go = Object.assign(document.createElement("button"), { type: "button", textContent: "Add combo" });
    const submit = () => {
      const bv = b.value.trim(), rv = r.value.trim();
      if (!bv || !rv) { toast("Fill in both boxes."); return; }
      const k = key(owner, bv);
      const existing = DATA.combos.find(([x, y]) => key(x, y) === k);
      if (existing) {
        toast(`${esc(owner)} + ${esc(bv)} already makes <strong>${esc(existing[2])}</strong>. Put your answer in its box instead.`, 4200);
        return;
      }
      if (R.added.some((x) => key(x.a, x.b) === k)) { toast("You already added that pair."); return; }
      R.added.push({ a: owner, b: bv, r: rv, kind: DATA.items[rv] || kind.value, at: Date.now() });
      computeRank();
      save(); render();
      toast(`Added <strong>${esc(owner)} + ${esc(bv)} = ${esc(rv)}</strong>`);
    };
    go.addEventListener("click", submit);
    for (const i of [b, r]) i.addEventListener("keydown", (e) => { if (e.key === "Enter") submit(); });
    wrap.append("Add: ", chip(owner), op("+"), b, op("="), r, kind, go);
    return wrap;
  }

  /* ---------- rendering ---------- */
  let groupsCache = new Map();   // owner -> combos, rebuilt each render

  function render() {
    const byOwner = new Map();
    for (const c of allCombos()) {
      if (!byOwner.has(c.a)) byOwner.set(c.a, []);
      byOwner.get(c.a).push(c);
    }
    const owners = [...byOwner.keys()].sort((x, y) => rk(x) - rk(y));
    for (const o of owners) byOwner.get(o).sort((x, y) => rk(x.b) - rk(y.b) || x.b.localeCompare(y.b));
    groupsCache = byOwner;

    const main = $("groups");
    main.replaceChildren();
    const unfiltered = filter === "all" && !$("q").value.trim();
    let any = false;
    for (const o of owners) {
      const list = byOwner.get(o).filter(matches);
      if (!list.length && !unfiltered) continue;
      any = true;
      const g = document.createElement("section");
      g.className = "group";
      g.id = "g-" + rk(o);
      const h = document.createElement("h2");
      h.append(chip(o), Object.assign(document.createElement("small"), { textContent: `${byOwner.get(o).length} combos` }));
      g.append(h);
      for (const c of list) g.append(row(c));
      if (unfiltered) g.append(addRow(o));
      main.append(g);
    }
    if (!any) main.innerHTML = `<p class="empty-note">Nothing matches.</p>`;
    renderJump();
    renderProgress();
  }

  function renderJump() {
    const nav = $("jump");
    nav.replaceChildren();
    for (const [o, list] of groupsCache) {
      const orig = list.filter((c) => !c.added);
      const done = orig.filter((c) => R.reviews[c.k]?.v).length;
      const a = document.createElement("a");
      a.href = "#g-" + rk(o);
      if (orig.length && done === orig.length) a.className = "done";
      a.append(document.createTextNode(o), Object.assign(document.createElement("span"), { textContent: `${done}/${orig.length}` }));
      nav.append(a);
    }
  }

  function renderProgress() {
    const total = DATA.combos.length;
    const done = DATA.combos.filter(([a, b]) => R.reviews[key(a, b)]?.v).length;
    const fire = Object.values(R.reviews).filter((x) => x.v === "fire").length;
    const flagged = Object.values(R.reviews).filter((x) => FLAGS.has(x.v)).length;
    $("progress").textContent = `${done} / ${total} reviewed · ${fire} fire · ${flagged} flagged · ${R.added.length} added`;
  }

  document.querySelector(".filters").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    filter = b.dataset.filter;
    for (const x of document.querySelectorAll(".filters button")) x.setAttribute("aria-pressed", String(x === b));
    render();
  });
  let qTimer = null;
  $("q").addEventListener("input", () => { clearTimeout(qTimer); qTimer = setTimeout(render, 150); });

  // Export in a shape that reads well by eye: the current answer next to
  // the verdict and yours.
  $("exportBtn").addEventListener("click", () => {
    const reviews = DATA.combos
      .map(([a, b, r]) => ({ a, b, current: r, ...(R.reviews[key(a, b)] || {}) }))
      .filter((x) => x.v || (x.text || "").trim())
      .map(({ a, b, current, v, text }) => ({ a, b, current, verdict: v || "", answer: (text || "").trim() }));
    const out = { exportedAt: new Date().toISOString(), reviews, added: R.added.map(({ a, b, r, kind }) => ({ a, b, result: r, kind })) };
    const url = URL.createObjectURL(new Blob([JSON.stringify(out, null, 1)], { type: "application/json" }));
    const link = Object.assign(document.createElement("a"), { href: url, download: "infinite-kitchen-review.json" });
    document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });

  /* ---------- start ---------- */
  function loadLocal() {
    try { return JSON.parse(localStorage.getItem(SAVE_KEY)); } catch { return null; }
  }
  Promise.all([
    fetch("recipes.json?v=" + Date.now()).then((r) => r.json()),
    fetch(API + "/review").then((r) => (r.ok ? r.json() : null)).catch(() => null),
  ]).then(([data, remote]) => {
    DATA = data;
    const local = loadLocal();
    // Whichever copy was saved last wins, so reviewing on two machines (or
    // after clearing the browser) picks up where you left off.
    const best = [local, remote].filter((x) => x && x.reviews).sort((x, y) => (y.savedAt || 0) - (x.savedAt || 0))[0];
    if (best) R = { reviews: best.reviews || {}, added: best.added || [], savedAt: best.savedAt || 0 };

    const dl = document.createElement("datalist");
    dl.id = "allItems";
    for (const n of Object.keys(DATA.items).sort()) dl.append(new Option(n));
    document.body.append(dl);

    computeRank();
    render();
    $("saved").textContent = "Changes save as you go";
  }).catch(() => toast("Couldn't load recipes.json.", 8000));
})();
