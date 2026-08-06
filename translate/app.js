(function () {
  "use strict";

  /* =========================================================================
     Lost in Translation — a phrase appears in a Google-Translate-style panel
     and you pick what it means.

     Two modes:
       random — any language. The source dropdown still reads "Detect
                language": setting it correctly before you answer is worth
                bonus points, so naming the language is part of the UI itself
                rather than a separate question.
       pick   — every phrase comes from one language you chose, so the source
                dropdown is fixed and there is no bonus.

     Puzzles are pre-built from Tatoeba's parallel corpora (build_puzzles.js).
     Distractors are other real translations of similar length, so every option
     reads as a genuine sentence.
     ========================================================================= */

  const ROUNDS = 10;
  const PTS_MEANING = 10;
  const PTS_LANGUAGE = 5;

  const $ = (id) => document.getElementById(id);

  let DATA = null;
  let langByCode = {};
  let pool = [];
  let deck = [];
  let round = 0;
  let score = 0;
  let streak = 0, bestStreak = 0;
  let mode = "random";     // 'random' | 'pick'
  let pickedLang = null;   // code, when mode === 'pick'
  let tally = { meaning: 0, language: 0 };
  let answered = false;

  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function showScreen(id) {
    document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
    $(id).classList.add("active");
  }
  function sortedLangs() {
    return DATA.languages.slice().sort((a, b) => a.name.localeCompare(b.name));
  }

  /* ---------- boot ---------- */
  $("btn-start").disabled = true;
  fetch("puzzles.json", { cache: "force-cache" })
    .then((r) => r.json())
    .then((d) => {
      DATA = d;
      d.languages.forEach((l) => { langByCode[l.code] = l; });
      buildLangGrid();
      $("btn-start").disabled = false;
    })
    .catch(() => {
      $("btn-start").textContent = "Failed to load phrases";
    });

  /* ---------- start screen ---------- */
  function buildLangGrid() {
    const grid = $("lang-grid");
    grid.innerHTML = "";
    sortedLangs().forEach((l) => {
      const b = document.createElement("button");
      b.className = "lang-chip";
      b.textContent = l.name;
      b.dataset.code = l.code;
      b.addEventListener("click", () => {
        pickedLang = l.code;
        grid.querySelectorAll(".lang-chip").forEach((c) => c.classList.toggle("active", c === b));
      });
      grid.appendChild(b);
    });
  }

  $("modes").addEventListener("click", (e) => {
    const card = e.target.closest(".mode-card");
    if (!card) return;
    mode = card.dataset.mode;
    document.querySelectorAll(".mode-card").forEach((c) => c.classList.toggle("active", c === card));
    $("lang-picker").classList.toggle("hidden", mode !== "pick");
  });

  /* ---------- game flow ---------- */
  function startGame() {
    if (mode === "pick") {
      if (!pickedLang) {
        // Default to the first language rather than blocking the player.
        const first = $("lang-grid").querySelector(".lang-chip");
        if (first) { first.click(); }
      }
      pool = DATA.puzzles.filter((p) => p.l === pickedLang);
    } else {
      pool = DATA.puzzles.slice();
    }
    deck = shuffle(pool.slice()).slice(0, ROUNDS);
    round = 0; score = 0; streak = 0; bestStreak = 0;
    tally = { meaning: 0, language: 0 };
    $("total").textContent = ROUNDS;
    buildSelect();
    updateHud();
    showScreen("game-screen");
    nextRound();
  }

  // The source dropdown: a real picker in random mode (it IS the language
  // answer), fixed and disabled when the player already chose the language.
  function buildSelect() {
    const sel = $("src-select");
    sel.innerHTML = "";
    if (mode === "pick") {
      const o = document.createElement("option");
      o.value = pickedLang;
      o.textContent = langByCode[pickedLang].name;
      sel.appendChild(o);
      sel.disabled = true;
      sel.classList.add("fixed");
      return;
    }
    sel.disabled = false;
    sel.classList.remove("fixed");
    const ph = document.createElement("option");
    ph.value = "";
    ph.textContent = "Detect language";
    sel.appendChild(ph);
    sortedLangs().forEach((l) => {
      const o = document.createElement("option");
      o.value = l.code;
      o.textContent = l.name;
      sel.appendChild(o);
    });
  }

  function updateHud() {
    $("score").textContent = score;
    $("streak").textContent = streak;
    $("progress").textContent = Math.min(round + 1, ROUNDS);
  }

  function nextRound() {
    if (round >= deck.length) return endGame();
    const p = deck[round];
    answered = false;
    $("phrase").textContent = p.q;
    $("char-count").textContent = p.q.length + " characters";
    $("btn-next").classList.add("hidden");

    const sel = $("src-select");
    if (mode === "random") {
      sel.value = "";
      sel.disabled = false;
      sel.classList.remove("locked");
    }

    $("q-label").textContent = mode === "random"
      ? "What does it mean?  ·  set the language for +5"
      : "What does it mean?";

    askMeaning(p);
    updateHud();
  }

  function askMeaning(p) {
    const target = p.a.length;
    // Prefer distractors from the same language pool so they feel of a piece,
    // then fall back to the whole set if that pool is thin.
    const near = pool.filter((x) => x.a !== p.a && Math.abs(x.a.length - target) < 18);
    const source = near.length >= 3 ? near
      : DATA.puzzles.filter((x) => x.a !== p.a && Math.abs(x.a.length - target) < 22);
    const others = shuffle(source.slice()).slice(0, 3).map((x) => x.a);
    while (others.length < 3) {
      const r = DATA.puzzles[(Math.random() * DATA.puzzles.length) | 0].a;
      if (r !== p.a && !others.includes(r)) others.push(r);
    }
    renderChoices(shuffle([p.a, ...others]), p.a);
  }

  function renderChoices(options, correct) {
    const wrap = $("choices");
    wrap.innerHTML = "";
    options.forEach((opt) => {
      const b = document.createElement("button");
      b.className = "choice";
      b.textContent = opt;
      b.addEventListener("click", () => commit(opt, correct, wrap));
      wrap.appendChild(b);
    });
  }

  // Picking a meaning commits the round — including whatever the language
  // dropdown is set to at that moment.
  function commit(picked, correct, wrap) {
    if (answered) return;
    answered = true;
    const p = deck[round];

    wrap.querySelectorAll(".choice").forEach((b) => {
      b.disabled = true;
      if (b.textContent === correct) b.classList.add("correct");
      else if (b.textContent === picked) b.classList.add("chosen-wrong");
      else b.classList.add("dim");
    });

    if (picked === correct) {
      score += PTS_MEANING;
      streak++;
      bestStreak = Math.max(bestStreak, streak);
      tally.meaning++;
    } else {
      streak = 0;
    }

    const sel = $("src-select");
    if (mode === "random") {
      if (sel.value === p.l) {
        score += PTS_LANGUAGE;
        tally.language++;
      }
      // Settle the dropdown on the true language and lock it.
      sel.value = p.l;
      sel.disabled = true;
      sel.classList.add("locked");
    }

    round++;
    updateHud();
    $("btn-next").textContent = round >= deck.length ? "See results" : "Next phrase";
    $("btn-next").classList.remove("hidden");
  }

  function endGame() {
    const per = PTS_MEANING + (mode === "random" ? PTS_LANGUAGE : 0);
    const max = ROUNDS * per;
    $("final-score").innerHTML = `<b>${score}</b><span>/ ${max} points</span>`;
    let rows = `<div><span>Meanings</span><b>${tally.meaning}/${ROUNDS}</b></div>`;
    if (mode === "random") {
      rows += `<div><span>Languages named</span><b>${tally.language}/${ROUNDS}</b></div>`;
    }
    rows += `<div><span>Best streak</span><b>${bestStreak}</b></div>`;
    $("breakdown").innerHTML = rows;
    showScreen("end-screen");
  }

  /* ---------- wiring ---------- */
  $("btn-start").addEventListener("click", startGame);
  $("btn-again").addEventListener("click", () => showScreen("start-screen"));
  $("btn-next").addEventListener("click", nextRound);
})();
