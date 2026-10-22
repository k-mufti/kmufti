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

  function show(id) {
    for (const s of document.querySelectorAll(".screen")) s.hidden = s.id !== id;
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
    } catch (e) {
      $("errorText").textContent = e.message && !/fetch|JSON/i.test(e.message) ? e.message : "Today's paper hasn't arrived yet. Check your connection and try again.";
      return show("error");
    }

    $("edition").textContent = `No. ${day.number}`;
    $("date").textContent = new Date(day.date + "T12:00:00Z").toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
    $("of").textContent = day.rounds.length;

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

  /* ---------- Playing ---------- */
  function round() {
    const i = guesses.length;
    if (i >= day.rounds.length) return finish(true);
    answered = false;
    show("play");
    $("n").textContent = i + 1;
    $("headline").textContent = day.rounds[i].text;
    $("stamp").className = "stamp";
    $("verdict").hidden = true;
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
    $("stamp").textContent = r.real ? "REAL" : "FAKE";
    $("stamp").className = "stamp " + (r.real ? "real" : "fake");
    requestAnimationFrame(() => $("stamp").classList.add("on"));
    $("verdictText").innerHTML = `<span class="${right ? "right" : "wrong"}">${right ? "Got it." : "Nope."}</span> `;
    $("verdictText").append(describe(r));
    $("verdictLink").hidden = !r.link;
    if (r.link) $("verdictLink").href = r.link;
    $("verdict").hidden = false;
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

  fetchDay();
})();
