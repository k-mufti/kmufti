/* Real or Fake: ten headlines a day, call each one.
   The day's paper comes from the Game Board backend (game-board/headlines-server.js).
   Everything about you - today's answers, your streak - stays in localStorage. */
(function () {
  const $ = (id) => document.getElementById(id);
  const API = location.hostname === "localhost" || location.hostname === "127.0.0.1"
    ? "http://localhost:8028/api/headlines/today"
    : "/game-board/api/headlines/today";
  const KEY = "real-or-fake";

  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
  const save = (s) => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* private mode */ } };

  let day = null;      // { date, number, rounds: [{ text, real, source, link }] }
  let guesses = [];    // "real" | "fake", one per answered round
  let answered = false;
  let cur = null;      // the story on screen

  function show(id) {
    for (const s of document.querySelectorAll(".screen")) s.hidden = s.id !== id;
    document.body.classList.toggle("reading", id === "play"); // the article takes the whole page
  }

  const SOURCE = {
    UPI: "UPI",
    AI: "made up by AI",
  };
  const describe = (r) => r.real ? `Really happened, reported by ${SOURCE[r.source] || r.source}.`
    : r.source === "AI" ? "Fake. It was made up by AI." : `Fake. That's satire from ${r.source}.`;

  /* ---------- Loading the paper ---------- */
  async function fetchDay() {
    show("start");
    $("go").disabled = true;
    $("go").textContent = "Fetching today's paper...";
    try {
      const res = await fetch(API);
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Today's paper hasn't arrived yet.");
      day = body;
      cur = null;
    } catch (e) {
      $("errorText").textContent = e.message && !/fetch|JSON/i.test(e.message) ? e.message : "Today's paper hasn't arrived yet. Check your connection and try again.";
      return show("error");
    }

    $("edition").textContent = `No. ${day.number}`;
    $("date").textContent = new Date(day.date + "T12:00:00Z").toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });

    const s = load();
    if (s.today && s.today.date === day.date) {
      guesses = s.today.guesses.slice(0, day.rounds.length);
      if (guesses.length >= day.rounds.length) return finish(false);
    } else {
      guesses = [];
    }
    $("go").disabled = false;
    $("go").textContent = guesses.length ? "Pick up where you left off" : "Read today's paper";
    tally();
  }

  function tally() {
    const right = guesses.filter((g, i) => (g === "real") === day.rounds[i].real).length;
    $("tally").textContent = guesses.length ? `${right} / ${guesses.length}` : "";
  }

  /* ---------- The paper ---------- */
  // Grey bars stand in for body text, so each headline sits in a real-looking column.
  const lines = (n, seed) => Array.from({ length: n }, (_, k) =>
    `<i style="width:${k === n - 1 ? 35 + (seed * 17) % 30 : 82 + (seed * 37 + k * 53) % 18}%"></i>`).join("");
  const cols = (n, seed) => `<div class="cols"><div>${lines(n, seed)}</div><div>${lines(n, seed + 7)}</div></div>`;

  /* Newspaper furniture: shapes, not words, and none of it depends on the answer. */
  const hd = (seed) => `<b class="hd" style="width:${45 + (seed * 31) % 40}%"></b>`;
  const WIDGETS = [
    (k) => `<div class="w">${hd(k)}<div class="wx"><span class="wx-i">&#9925;</span><b class="bar" style="width:40%"></b></div>${lines(3, k)}</div>`,
    (k) => { // a mini crossword
      const black = new Set([4, 6, 12, 18, 20]);
      const nums = { 0: 1, 1: 2, 2: 3, 3: 4, 5: 5, 7: 6, 10: 7, 13: 8, 15: 9, 21: 10 };
      return `<div class="w">${hd(k)}<div class="xw">${Array.from({ length: 25 }, (_, j) =>
        `<i class="${black.has(j) ? "b" : ""}">${nums[j] ? `<sup>${nums[j]}</sup>` : ""}</i>`).join("")}</div></div>`;
    },
    (k) => `<div class="w">${hd(k)}<div class="chart">${Array.from({ length: 12 }, (_, j) =>
      `<i style="height:${25 + (k * 13 + j * 29) % 70}%"></i>`).join("")}</div></div>`,
    (k) => `<div class="w">${hd(k)}<p class="lotto">${[4, 18, 23, 31, 42].map((n) => `<b>${(n + k) % 49 + 1}</b>`).join("")}<b class="pb">${k % 9 + 1}</b></p></div>`,
    (k) => `<div class="w"><div class="ph"></div><b class="bar cap" style="width:70%"></b>${lines(3, k)}</div>`,
    (k) => `<div class="w boxed"><b class="bar big" style="width:80%"></b><b class="bar big" style="width:55%"></b>${lines(2, k)}</div>`,
    (k) => `<div class="w">${hd(k)}<ul class="index">${Array.from({ length: 6 }, (_, j) =>
      `<li><b class="bar" style="width:${25 + (k + j * 17) % 30}%"></b><i></i><span>${String.fromCharCode(65 + j % 4)}${(k + j * 3) % 12 + 1}</span></li>`).join("")}</ul></div>`,
    (k) => `<div class="w"><span class="qm">&ldquo;</span>${lines(4, k)}</div>`,
  ];

  function story(i) {
    const a = document.createElement("article");
    const n = day.rounds.length;
    a.className = "story" + (i === 0 ? " front" : "");
    const top = i === 0
      ? `<header class="flag"><div class="ear"></div><div class="flagname">Real <i>or</i> Fake</div><div class="ear r"></div></header>`
      : `<header class="runhead"><span class="rn">Real <i>or</i> Fake</span></header>`;
    a.innerHTML = `${top}
      <div class="kicker"><span class="dots">${Array.from({ length: n }, (_, k) => `<i class="${k < i ? "done" : k === i ? "now" : ""}"></i>`).join("")}</span></div>
      <div class="spread">
        <div class="lead">
          <h2></h2><div class="stamp"></div>
          <b class="byline"></b>
          <p class="note" hidden></p>
          <div class="body">${cols(9, i)}</div>
        </div>
        <aside class="rail">${[0, 1, 2].map((k) => WIDGETS[(i * 3 + k) % WIDGETS.length](i * 3 + k)).join("")}</aside>
      </div>
      <footer class="folio"></footer>
      <div class="marks" aria-hidden="true"><i class="reg"></i><span class="bar-cmyk"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span><i class="reg"></i></div>`;
    a.querySelector("h2").textContent = day.rounds[i].text;
    return a;
  }

  // Next slides the whole paper up: the old page goes off the top while the
  // new one comes up from below right behind it, like scrolling the paper.
  const ROLL_MS = 650, EASE = "cubic-bezier(.65,0,.25,1)", GAP = 24;
  function roll(i) {
    const reel = $("reel");
    const next = story(i);
    const prev = cur && cur.isConnected ? cur : null;
    cur = next;
    for (const el of [...reel.children]) if (el !== prev) el.remove();
    const opts = { duration: ROLL_MS, easing: EASE };

    if (!prev) { // the first page comes up from the bottom of the screen
      reel.append(next);
      next.animate([{ transform: `translateY(${innerHeight}px)` }, { transform: "none" }], opts);
      return;
    }

    next.style.marginTop = GAP + "px";
    reel.append(next);
    const from = prev.offsetHeight, dy = from + GAP;
    reel.style.overflow = "hidden";
    const anims = [
      reel.animate([{ height: from + "px" }, { height: next.offsetHeight + "px" }], { ...opts, fill: "forwards" }),
      ...[prev, next].map((el) => el.animate([{ transform: "none" }, { transform: `translateY(${-dy}px)` }], { ...opts, fill: "forwards" })),
    ];
    anims[0].finished.then(() => {
      if (cur !== next) return;
      prev.remove();
      next.style.marginTop = "";
      reel.style.overflow = "";
      anims.forEach((a) => a.cancel());
    });
  }

  // After a guess: the verdict as an editor's note, then the story itself if
  // there is one, or a notice that it was never written.
  function reveal(a, r, right) {
    const note = a.querySelector(".note");
    note.innerHTML = `<b class="${right ? "right" : "wrong"}">${right ? "Got it." : "Nope."}</b> `;
    note.append(describe(r));
    note.hidden = false;

    const body = a.querySelector(".body");
    body.innerHTML = "";
    if (r.blurb) {
      if (r.image) {
        const fig = document.createElement("figure");
        const img = document.createElement("img");
        img.src = r.image; img.alt = ""; img.referrerPolicy = "no-referrer";
        img.onerror = () => fig.remove();
        const cap = document.createElement("figcaption");
        cap.textContent = `Photograph via ${SOURCE[r.source] || r.source}`;
        fig.append(img, cap);
        body.append(fig);
      }
      const p = document.createElement("p");
      p.className = "lede-text";
      p.textContent = r.blurb;
      body.append(p);
    } else if (!r.real) {
      const p = document.createElement("p");
      p.className = "never";
      p.textContent = r.source === "AI" ? "This story was never written. An AI made up the headline." : "There's no story here, just the joke.";
      body.append(p);
    }
    if (r.link) {
      const link = document.createElement("a");
      link.className = "more";
      link.href = r.link; link.target = "_blank"; link.rel = "noopener";
      link.textContent = `Continued at ${r.source} \u2192`;
      body.append(link);
    }
    const rest = document.createElement("div");
    rest.className = "rest";
    rest.innerHTML = cols(5, guesses.length + 11);
    body.append(rest);
    body.classList.add("revealed");
  }

  /* ---------- Playing ---------- */
  function round() {
    const i = guesses.length;
    if (i >= day.rounds.length) return finish(true);
    answered = false;
    show("play");
    if (scrollY > 0) scrollTo(0, 0);
    roll(i);
    $("next").hidden = true;
    $("choices").hidden = false;
  }

  function guess(g) {
    if (answered || !day) return;
    answered = true;
    const r = day.rounds[guesses.length];
    guesses.push(g);
    const s = load();
    s.today = { date: day.date, guesses };
    save(s);

    const right = (g === "real") === r.real;
    const stamp = cur.querySelector(".stamp");
    stamp.textContent = r.real ? "REAL" : "FAKE";
    stamp.className = "stamp " + (r.real ? "real" : "fake");
    requestAnimationFrame(() => stamp.classList.add("on"));
    reveal(cur, r, right);
    $("choices").hidden = true;
    $("next").hidden = false;
    $("next").innerHTML = (guesses.length === day.rounds.length ? "See my score" : "Next") + " <kbd>Enter</kbd>";
    tally();
  }

  /* ---------- Results ---------- */
  const RANKS = [
    [10, "Editor-in-chief. Nobody fools you."],
    [9, "Front-page material."],
    [7, "A sharp reader."],
    [5, "You'd believe about half of it."],
    [3, "The internet would love to meet you."],
    [0, "You'll believe anything. Respect."],
  ];

  function finish(fresh) {
    const results = day.rounds.map((r, i) => (guesses[i] === "real") === r.real);
    const score = results.filter(Boolean).length;
    const s = load();

    // Streak: days played in a row. Recorded once per day.
    if (fresh && s.lastDate !== day.date) {
      const yesterday = new Date(Date.parse(day.date) - 864e5).toISOString().slice(0, 10);
      s.streak = s.lastDate === yesterday ? (s.streak || 0) + 1 : 1;
      s.best = Math.max(s.best || 0, s.streak);
      s.played = (s.played || 0) + 1;
      s.total = (s.total || 0) + score;
      s.lastDate = day.date;
      s.today = { date: day.date, guesses, score };
      save(s);
      window.track?.("real_or_fake_finished", { score, number: day.number });
    }

    show("done");
    tally();
    $("score").textContent = score;
    $("rank").textContent = RANKS.find(([min]) => score >= min)[1];

    const recap = $("recap");
    recap.innerHTML = "";
    day.rounds.forEach((r, i) => {
      const li = document.createElement("li");
      const mark = document.createElement("span");
      mark.className = "mark " + (results[i] ? "right" : "wrong");
      mark.textContent = results[i] ? "✓" : "✗";
      const body = document.createElement("div");
      const h = document.createElement(r.link ? "a" : "span");
      h.className = "h";
      h.textContent = r.text;
      if (r.link) { h.href = r.link; h.target = "_blank"; h.rel = "noopener"; }
      const src = document.createElement("span");
      src.className = "src";
      src.innerHTML = `<b class="${r.real ? "real" : "fake"}">${r.real ? "Real" : "Fake"}</b> &middot; `;
      src.append(r.real ? SOURCE[r.source] || r.source : r.source === "AI" ? "made up by AI" : r.source);
      body.append(h, src);
      li.append(mark, body);
      recap.append(li);
    });

    $("stats").innerHTML = `
      <div><b>${s.streak || 0}</b><span>Streak</span></div>
      <div><b>${s.best || 0}</b><span>Best streak</span></div>
      <div><b>${s.played ? (s.total / s.played).toFixed(1) : "-"}</b><span>Average</span></div>`;

    $("share").onclick = async () => {
      const line = results.map((ok) => (ok ? "●" : "○")).join("");
      const text = `Real or Fake No. ${day.number}: ${score}/10\n${line}\nkmufti.com/real-or-fake`;
      try { await navigator.clipboard.writeText(text); $("share").textContent = "Copied"; }
      catch { prompt("Copy this:", text); }
      setTimeout(() => { $("share").textContent = "Copy my score"; }, 1600);
    };
    countdown();
  }

  let timer = null;
  function countdown() {
    clearInterval(timer);
    const tick = () => {
      const now = Date.now();
      const next = Math.ceil((now + 1) / 864e5) * 864e5;
      const left = next - now;
      const h = Math.floor(left / 36e5), m = Math.floor(left / 6e4) % 60, sec = Math.floor(left / 1e3) % 60;
      $("countdown").textContent = `Next edition in ${h}h ${String(m).padStart(2, "0")}m ${String(sec).padStart(2, "0")}s`;
      if (left < 1000) { clearInterval(timer); setTimeout(fetchDay, 2000); }
    };
    tick();
    timer = setInterval(tick, 1000);
  }

  /* ---------- Wiring ---------- */
  $("go").onclick = round;
  $("retry").onclick = fetchDay;
  $("next").onclick = round;
  for (const b of document.querySelectorAll("[data-guess]")) b.onclick = () => guess(b.dataset.guess);
  document.addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if ($("play").hidden) return;
    const k = e.key.toLowerCase();
    if (!answered && (k === "r" || k === "arrowleft")) guess("real");
    else if (!answered && (k === "f" || k === "arrowright")) guess("fake");
    else if (answered && (k === "enter" || k === " ")) { e.preventDefault(); round(); }
  });

  // Local dev only: wipe today's answers and start over.
  if (/^(localhost|127\.0\.0\.1)$/.test(location.hostname)) {
    $("devReset").hidden = false;
    $("devReset").onclick = () => {
      const s = load();
      delete s.today;
      if (day && s.lastDate === day.date) delete s.lastDate;
      save(s);
      guesses = [];
      fetchDay().then(() => { if (day) round(); });
    };
  }

  fetchDay();
})();
