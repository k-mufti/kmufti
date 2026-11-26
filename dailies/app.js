/* Dailies — all in this browser's localStorage, nothing sent anywhere.
   state = { list: [ids], custom: [{id,name,url}], day: "YYYY-MM-DD",
             done: [ids done today], streak: n, lastFull: "YYYY-MM-DD" } */
(function () {
  "use strict";
  const KEY = "kmufti-dailies";
  const $ = (id) => document.getElementById(id);
  const GENRE = Object.assign({}, CATS, { custom: "Yours" });

  const ymd = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  const today = () => ymd(new Date());
  const yesterday = () => { const d = new Date(); d.setDate(d.getDate() - 1); return ymd(d); };

  let state = { list: [], custom: [], day: today(), done: [], streak: 0, lastFull: "" };
  try { Object.assign(state, JSON.parse(localStorage.getItem(KEY)) || {}); } catch {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {} };

  // New day: everything unticked. A streak survives only if yesterday was finished.
  function rollDay() {
    if (state.day !== today()) { state.day = today(); state.done = []; }
    if (state.lastFull !== today() && state.lastFull !== yesterday()) state.streak = 0;
    save();
  }
  rollDay();

  const all = () => GAMES.concat(state.custom.map((c) => ({ ...c, by: "your link", cat: "custom", blurb: "" })));
  const byId = (id) => all().find((g) => g.id === id);
  const inList = (id) => state.list.includes(id);
  const isDone = (id) => state.done.includes(id);
  const liveList = () => state.list.map(byId).filter(Boolean);
  const nextUp = () => liveList().find((g) => !isDone(g.id));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // Little hand-drawn bits
  const LEMON = (on) =>
    '<svg viewBox="0 0 24 20"><g filter="url(#wob)" stroke="#1f1b16" stroke-width="1" stroke-linejoin="round">' +
    '<path d="M3 10 C3 5 8 2 12 2 C16 2 21 5 21 10 C21 15 16 18 12 18 C8 18 3 15 3 10 Z" fill="' + (on ? "#f2c53d" : "none") + '"/>' +
    '<path d="M21 10 l2 -1 M3 10 l-2 1" fill="none"/>' + (on ? '<path d="M12 2 C14 0 17 0 18 1 C16 3 14 3 12 2 Z" fill="#5f8a4f"/>' : "") + "</g></svg>";
  const CHECK =
    '<svg viewBox="0 0 42 42"><g filter="url(#wob)" fill="none" stroke="#1f1b16" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M8 9 C17 7 27 8 34 9 C35 18 34 27 33 34 C24 35 15 34 8 33 C7 25 7 17 8 9 Z" stroke-width="1.2"/>' +
    '<path class="tick" d="M11 21 C14 23 16 26 18 30 C23 20 30 10 40 3" stroke-width="2.6"/></g></svg>';
  const STRIKE =
    '<svg class="strike" viewBox="0 0 200 10" preserveAspectRatio="none"><path d="M2 6 C40 3 80 7 120 4 C150 2 175 6 198 4" fill="none" stroke="#1f1b16" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linecap="round"/></svg>';
  const MARK = '<svg viewBox="0 0 24 24"><path d="M6.5 3.5 h11 v17 l-5.5 -4.2 l-5.5 4.2 z" stroke-linejoin="round"/></svg>';
  // The bird is called Bardudi.
  const BIRD = '<svg class="bird" viewBox="0 0 48 40" role="img" aria-label="Bardudi"><title>Bardudi</title><use href="#bird"/></svg>';

  function markDone(id, on = true) {
    rollDay();
    state.done = state.done.filter((x) => x !== id);
    if (on) state.done.push(id);
    const list = liveList();
    if (list.length && list.every((g) => isDone(g.id)) && state.lastFull !== today()) {
      state.streak = state.lastFull === yesterday() ? state.streak + 1 : 1;
      state.lastFull = today();
    }
    save();
    updateToday();
    if (on && list.length && list.every((g) => isDone(g.id))) celebrate();
  }

  /* Paper confetti in the almanac's colours, thrown up from both bottom
     corners. If the last game was ticked from another tab (Play opens one),
     it waits until you come back so you actually see it. */
  function celebrate() {
    if (document.hidden) {
      const go = () => { if (!document.hidden) { document.removeEventListener("visibilitychange", go); celebrate(); } };
      document.addEventListener("visibilitychange", go);
      return;
    }
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cv = document.createElement("canvas");
    cv.className = "confetti";
    document.body.appendChild(cv);
    const ctx = cv.getContext("2d");
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = innerWidth, H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.scale(dpr, dpr);
    const COLORS = ["#f2c53d", "#f7dd84", "#5f8a4f", "#9aa5d9", "#e8a93a", "#e9bdb4", "#fffdf6"];
    const bits = [];
    for (let i = 0; i < 220; i++) {
      const left = i % 2 === 0;
      const ang = (left ? -60 : -120) + (Math.random() - 0.5) * 50;
      const sp = 11 + Math.random() * 11;
      bits.push({
        x: left ? -10 : W + 10, y: H * (0.75 + Math.random() * 0.2),
        vx: Math.cos(ang * Math.PI / 180) * sp, vy: Math.sin(ang * Math.PI / 180) * sp,
        w: 6 + Math.random() * 7, h: 4 + Math.random() * 5,
        r: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.3,
        flip: Math.random() * 6.28, vf: 0.08 + Math.random() * 0.12,
        c: COLORS[i % COLORS.length], round: Math.random() < 0.18,
      });
    }
    const t0 = performance.now();
    (function frame(t) {
      ctx.clearRect(0, 0, W, H);
      let alive = 0;
      for (const b of bits) {
        b.vy += 0.32; b.vx *= 0.985; b.vy *= 0.985;
        b.x += b.vx + Math.sin(b.flip) * 0.6; b.y += b.vy;
        b.r += b.vr; b.flip += b.vf;
        if (b.y > H + 20) continue;
        alive++;
        ctx.save();
        ctx.translate(b.x, b.y); ctx.rotate(b.r); ctx.scale(1, Math.cos(b.flip));
        ctx.fillStyle = b.c; ctx.strokeStyle = "#1f1b16"; ctx.lineWidth = 0.8;
        ctx.beginPath();
        if (b.round) ctx.arc(0, 0, b.h * 0.7, 0, 6.28); else ctx.rect(-b.w / 2, -b.h / 2, b.w, b.h);
        ctx.fill(); ctx.stroke();
        ctx.restore();
      }
      if (alive && t - t0 < 7000) requestAnimationFrame(frame); else cv.remove();
    })(t0);
  }

  function toggleList(id) {
    state.list = inList(id) ? state.list.filter((x) => x !== id) : state.list.concat(id);
    save();
    renderToday();
    updateCards();
  }

  function play(g) {
    window.open(g.url, "_blank", "noopener");
    markDone(g.id, true);
  }

  // ---------- Sideways rows (shared by both tabs) ----------
  function wireShelf(shelf) {
    const track = shelf.querySelector(".track");
    const step = (dir) => track.scrollBy({ left: dir * track.clientWidth * 0.8, behavior: "smooth" });
    shelf.querySelector(".nudge.left").onclick = () => step(-1);
    shelf.querySelector(".nudge.right").onclick = () => step(1);
    const edges = () => {
      shelf.classList.toggle("at-start", track.scrollLeft < 8);
      shelf.classList.toggle("at-end", track.scrollLeft + track.clientWidth > track.scrollWidth - 8);
    };
    track.addEventListener("scroll", edges, { passive: true });
    addEventListener("resize", edges);
    shelf.edges = edges;
    requestAnimationFrame(edges);
  }

  // ---------- Today ----------
  let dragId = null;
  function renderToday() {
    const list = liveList();
    const track = $("list");
    track.innerHTML = "";
    list.forEach((g) => {
      const el = document.createElement("article");
      el.className = "ticket mine";
      el.dataset.id = g.id;
      el.draggable = true;
      el.innerHTML =
        '<a class="ticket-plate" href="' + esc(g.url) + '" target="_blank" rel="noopener">' + artFor(g.id, g) + "</a>" +
        '<div class="mine-row">' +
          '<a class="mine-name" href="' + esc(g.url) + '" target="_blank" rel="noopener"><h3>' + esc(g.name) + STRIKE + "</h3></a>" +
          '<button class="check" aria-label="Tick off ' + esc(g.name) + '">' + CHECK + "</button>" +
        "</div>" +
        '<button class="remove" aria-label="Remove ' + esc(g.name) + '">Remove</button>';
      el.querySelectorAll("a").forEach((a) => (a.onclick = () => markDone(g.id, true)));
      el.querySelector(".check").onclick = () => markDone(g.id, !isDone(g.id));
      el.querySelector(".remove").onclick = () => toggleList(g.id);
      el.ondragstart = (e) => { dragId = g.id; el.classList.add("dragging"); e.dataTransfer.effectAllowed = "move"; };
      el.ondragend = () => { dragId = null; el.classList.remove("dragging"); renderToday(); };
      el.ondragover = (e) => {
        e.preventDefault();
        if (!dragId || dragId === g.id) return;
        const after = e.offsetX > el.offsetWidth / 2;
        state.list.splice(state.list.indexOf(dragId), 1);
        const to = state.list.indexOf(g.id);
        state.list.splice(after ? to + 1 : to, 0, dragId);
        save();
        track.insertBefore(track.querySelector('[data-id="' + dragId + '"]'), after ? el.nextSibling : el);
      };
      track.appendChild(el);
    });
    const bird = document.createElement("div");
    bird.className = "perch";
    bird.id = "perch";
    bird.innerHTML = BIRD;
    track.appendChild(bird);
    birdAt = null;
    updateToday(true);
  }

  function renderHero(list, next, done) {
    const hero = $("hero");
    const key = list.length ? (next ? next.id + ":" + done + "/" + list.length : "done") : "empty";
    const lemons = '<div class="lemons">' + list.map((g) => LEMON(isDone(g.id))).join("") + "</div>";
    if (hero.dataset.key === key) return;
    hero.dataset.key = key;
    if (!list.length) {
      hero.innerHTML =
        '<div class="hero-art plain"><svg viewBox="30 10 190 140"><use href="#orn"/></svg></div>' +
        '<div class="hero-text"><p class="kicker">Today</p><h2 class="hero-name">No games yet.</h2>' +
        "<p class=\"hero-blurb\">Pick the daily games you play and they'll line up here, ready to go.</p>" +
        '<div class="hero-actions"><button class="btn big" id="starter">Add the popular ones</button>' +
        '<button class="btn ghost" data-goto="explore">Pick my own</button></div></div>';
      $("starter").onclick = () => { state.list = Array.from(new Set(state.list.concat(STARTER))); save(); renderToday(); updateCards(); };
    } else if (!next) {
      hero.innerHTML =
        '<div class="hero-art plain"><svg viewBox="30 10 190 140"><use href="#orn"/></svg>' + BIRD.replace('class="bird"', 'class="bird home"') + "</div>" +
        '<div class="hero-text"><p class="kicker">Today</p><h2 class="hero-name">All done.</h2>' +
        '<p class="hero-blurb">' + list.length + " of " + list.length + " played" +
        (state.streak > 1 ? " · " + state.streak + " days in a row" : "") + ". Bardudi will see you tomorrow.</p>" + lemons + "</div>";
    } else {
      hero.innerHTML =
        '<a class="hero-art" href="' + esc(next.url) + '" target="_blank" rel="noopener">' + artFor(next.id, next) + "</a>" +
        '<div class="hero-text"><p class="kicker">Up next · ' + esc(GENRE[next.cat] || "") + "</p>" +
        '<h2 class="hero-name">' + esc(next.name) + "</h2>" +
        (next.blurb ? '<p class="hero-blurb">' + esc(next.blurb) + "</p>" : "") +
        '<div class="hero-actions"><button class="btn big" id="heroPlay">Play →</button>' +
        '<button class="btn ghost" id="heroSkip">Already done</button></div>' +
        '<p class="tally">' + done + " of " + list.length + " done</p>" + lemons + "</div>";
      $("heroPlay").onclick = () => play(next);
      hero.querySelector(".hero-art").onclick = () => markDone(next.id, true);
      $("heroSkip").onclick = () => markDone(next.id, true);
    }
    hero.querySelectorAll("[data-goto]").forEach((b) => (b.onclick = () => show(b.dataset.goto)));
    hero.classList.remove("fresh"); void hero.offsetWidth; hero.classList.add("fresh");
  }

  // Ticks, hero, bird — rows aren't rebuilt, so the ink animates.
  function updateToday(instant) {
    const list = liveList();
    const done = list.filter((g) => isDone(g.id)).length;
    const next = nextUp();
    document.querySelectorAll("#list .ticket").forEach((el) => el.classList.toggle("done", isDone(el.dataset.id)));
    $("tabCount").textContent = list.length ? done + "/" + list.length : "";
    $("listCount").textContent = list.length + (list.length === 1 ? " game" : " games");
    $("listShelf").hidden = list.length === 0;
    renderHero(list, next, done);
    if ($("listShelf").edges) $("listShelf").edges();
    moveBird(next, instant);
  }

  // The bird perches on the next card and hops along the row.
  let birdAt = null;
  function moveBird(next, instant) {
    const bird = $("perch");
    if (!bird) return;
    const el = next && document.querySelector('#list .ticket[data-id="' + CSS.escape(next.id) + '"]');
    if (!el || $("today").hidden) { bird.classList.remove("on"); birdAt = null; return; }
    const plate = el.querySelector(".ticket-plate");
    const to = { x: el.offsetLeft + plate.offsetWidth - 66, y: el.offsetTop - 44 };
    const from = birdAt;
    bird.style.transform = "translate(" + to.x + "px," + to.y + "px)";
    bird.classList.add("on");
    if (from && !instant && (from.x !== to.x || from.y !== to.y) && bird.animate && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const mid = { x: (from.x + to.x) / 2, y: Math.min(from.y, to.y) - 30 };
      bird.animate([
        { transform: "translate(" + from.x + "px," + from.y + "px)" },
        { transform: "translate(" + mid.x + "px," + mid.y + "px) rotate(-8deg)", offset: 0.45 },
        { transform: "translate(" + to.x + "px," + (to.y + 3) + "px) scaleY(.9)", offset: 0.85 },
        { transform: "translate(" + to.x + "px," + to.y + "px)" },
      ], { duration: 650, easing: "cubic-bezier(.4,0,.3,1)" });
    }
    birdAt = to;
    // keep the next card in view
    const track = $("list");
    if (el.offsetLeft < track.scrollLeft || el.offsetLeft + el.offsetWidth > track.scrollLeft + track.clientWidth) {
      track.scrollTo({ left: el.offsetLeft - parseFloat(getComputedStyle(track).paddingLeft), behavior: instant ? "auto" : "smooth" });
    }
  }
  addEventListener("resize", () => { birdAt = null; updateToday(true); });

  // ---------- All games ----------
  const heading = (name, n) =>
    '<h2 class="genre"><span class="g-name">' + esc(name) + '</span><span class="g-rule"></span><span class="g-count">' + n + (n === 1 ? " game" : " games") + "</span></h2>";
  function card(g) {
    const el = document.createElement("article");
    el.className = "ticket";
    el.dataset.id = g.id;
    el.innerHTML =
      '<a class="ticket-plate" href="' + esc(g.url) + '" target="_blank" rel="noopener">' + artFor(g.id, g) + "</a>" +
      '<button class="mark" aria-pressed="false">' + MARK + "</button>" +
      '<a class="card-name" href="' + esc(g.url) + '" target="_blank" rel="noopener"><h3>' + esc(g.name) + "</h3></a>" +
      (g.blurb ? '<p class="blurb">' + esc(g.blurb) + "</p>" : "");
    el.querySelector(".mark").onclick = () => toggleList(g.id);
    return el;
  }
  // Added/not-added without rebuilding, so rows keep their scroll position.
  function updateCards() {
    document.querySelectorAll("#grid .ticket").forEach((el) => {
      const on = inList(el.dataset.id);
      el.classList.toggle("on", on);
      const b = el.querySelector(".mark");
      b.setAttribute("aria-pressed", on);
      b.setAttribute("aria-label", (on ? "Remove " : "Add ") + el.querySelector("h3").textContent + (on ? " from" : " to") + " today");
      b.title = on ? "On your list" : "Add to your list";
    });
  }

  function renderGrid() {
    const q = $("search").value.trim().toLowerCase();
    const grid = $("grid");
    grid.innerHTML = "";
    const games = all();
    if (q) {
      const hits = games.filter((g) => (g.name + " " + g.by + " " + g.blurb + " " + (GENRE[g.cat] || "")).toLowerCase().includes(q));
      grid.innerHTML = heading("Results", hits.length);
      if (!hits.length) { grid.innerHTML += '<p class="none">No matches.</p>'; return; }
      const wrap = document.createElement("div");
      wrap.className = "results";
      hits.forEach((g) => wrap.appendChild(card(g)));
      grid.appendChild(wrap);
    } else {
      const cats = Object.keys(CATS).concat(state.custom.length ? ["custom"] : []);
      for (const k of cats) {
        const inCat = games.filter((g) => g.cat === k);
        if (!inCat.length) continue;
        const shelf = document.createElement("section");
        shelf.className = "shelf";
        shelf.innerHTML =
          heading(GENRE[k] || CATS[k], inCat.length) +
          '<div class="shelf-wrap"><button class="nudge left" aria-label="Scroll left">‹</button>' +
          '<div class="track"></div><button class="nudge right" aria-label="Scroll right">›</button></div>';
        inCat.forEach((g) => shelf.querySelector(".track").appendChild(card(g)));
        grid.appendChild(shelf);
        wireShelf(shelf);
      }
    }
    updateCards();
  }
  $("search").oninput = () => { if ($("explore").hidden) show("explore"); renderGrid(); };

  $("customForm").onsubmit = (e) => {
    e.preventDefault();
    const name = $("customName").value.trim();
    const url = $("customUrl").value.trim();
    if (!name || !/^https?:\/\//i.test(url)) return;
    const id = "c-" + Date.now().toString(36);
    state.custom.push({ id, name, url });
    state.list.push(id);
    save();
    $("customName").value = $("customUrl").value = "";
    renderGrid(); renderToday();
    show("today");
  };

  // ---------- Tabs ----------
  function show(tab) {
    for (const t of ["today", "explore"]) {
      $(t).hidden = t !== tab;
      document.querySelector('[data-tab="' + t + '"]').classList.toggle("on", t === tab);
    }
    try { localStorage.setItem(KEY + "-tab", tab); } catch {}
    birdAt = null;
    updateToday(true);
    document.querySelectorAll(".shelf").forEach((s) => s.edges && s.edges());
  }
  document.querySelectorAll("[data-tab]").forEach((b) => b.addEventListener("click", () => show(b.dataset.tab)));

  setInterval(() => { if (state.day !== today()) { rollDay(); renderToday(); } }, 30000);

  wireShelf($("listShelf"));
  renderGrid();
  renderToday();
  let start = "";
  try { start = localStorage.getItem(KEY + "-tab") || ""; } catch {}
  show(start === "explore" ? "explore" : "today");
  // Fonts shift the layout; re-seat the bird once they're in.
  if (document.fonts) document.fonts.ready.then(() => { birdAt = null; updateToday(true); });
})();
