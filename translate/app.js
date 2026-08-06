(function () {
  "use strict";

  /* =========================================================================
     Lost in Translation — a phrase in a mystery language appears in a
     Google-Translate-style panel. Two multiple-choice questions per round:

       1. What does it mean?   (10 pts)
       2. What language is it? (5 bonus pts)

     Puzzles are pre-built from Tatoeba's parallel corpora — see
     build_puzzles.js. Distractors are drawn from other real translations, so
     every wrong answer is a plausible sentence rather than obvious filler.
     ========================================================================= */

  const ROUNDS = 10;
  const PTS_MEANING = 10;
  const PTS_LANGUAGE = 5;

  const $ = (id) => document.getElementById(id);

  let DATA = null;
  let langByCode = {};
  let pool = [];          // puzzles filtered to the chosen difficulty
  let deck = [];          // this game's puzzles
  let round = 0;
  let score = 0;
  let streak = 0, bestStreak = 0;
  let tier = 0;           // 0 = all, 1 = distinct scripts, 3 = lookalikes
  let stage = "meaning";  // 'meaning' | 'language'
  let tally = { meaning: 0, language: 0 };

  /* ---------- helpers ---------- */
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

  /* ---------- boot ---------- */
  fetch("puzzles.json", { cache: "force-cache" })
    .then((r) => r.json())
    .then((d) => {
      DATA = d;
      d.languages.forEach((l) => { langByCode[l.code] = l; });
      $("btn-start").disabled = false;
    })
    .catch(() => {
      $("btn-start").textContent = "Failed to load phrases";
      $("btn-start").disabled = true;
    });

  /* ---------- difficulty ---------- */
  $("difficulty").addEventListener("click", (e) => {
    const btn = e.target.closest(".diff-btn");
    if (!btn) return;
    tier = parseInt(btn.dataset.tier, 10);
    document.querySelectorAll(".diff-btn").forEach((b) => b.classList.toggle("active", b === btn));
  });

  /* ---------- game flow ---------- */
  function startGame() {
    // Tier 1 = only distinct-script languages; tier 3 = only the confusable
    // clusters. Tier 0 uses everything.
    pool = DATA.puzzles.filter((p) => {
      const l = langByCode[p.l];
      if (!l) return false;
      if (tier === 0) return true;
      if (tier === 1) return l.tier === 1;
      return l.tier === 3;
    });
    deck = shuffle(pool.slice()).slice(0, ROUNDS);
    round = 0; score = 0; streak = 0; bestStreak = 0;
    tally = { meaning: 0, language: 0 };
    $("total").textContent = ROUNDS;
    updateHud();
    showScreen("game-screen");
    nextRound();
  }

  function updateHud() {
    $("score").textContent = score;
    $("streak").textContent = streak;
    $("progress").textContent = Math.min(round + 1, ROUNDS);
  }

  function nextRound() {
    if (round >= deck.length) return endGame();
    const p = deck[round];
    stage = "meaning";
    $("phrase").textContent = p.q;
    $("char-count").textContent = p.q.length + " characters";
    $("src-lang").textContent = "Detect language";
    $("src-lang").classList.remove("revealed");
    $("feedback").textContent = "";
    $("feedback").className = "feedback";
    $("btn-next").classList.add("hidden");
    askMeaning(p);
    updateHud();
  }

  // Distractors are other real English translations of a similar length, so
  // they read as genuine candidates rather than obvious padding.
  function askMeaning(p) {
    $("q-label").textContent = "What does it mean?";
    const target = p.a.length;
    const others = shuffle(
      pool.filter((x) => x.a !== p.a && Math.abs(x.a.length - target) < 18)
    ).slice(0, 3).map((x) => x.a);
    while (others.length < 3) {
      const r = pool[(Math.random() * pool.length) | 0].a;
      if (r !== p.a && !others.includes(r)) others.push(r);
    }
    renderChoices(shuffle([p.a, ...others]), p.a, onMeaningPick);
  }

  function askLanguage(p) {
    $("q-label").textContent = "Bonus — what language is it?";
    const correct = langByCode[p.l].name;
    // Prefer decoys from the same difficulty tier: guessing between Spanish,
    // Portuguese and Italian is the interesting version of this question.
    const sameTier = DATA.languages.filter((l) => l.code !== p.l && l.tier === langByCode[p.l].tier);
    const rest = DATA.languages.filter((l) => l.code !== p.l && l.tier !== langByCode[p.l].tier);
    const decoys = shuffle(sameTier).concat(shuffle(rest)).slice(0, 3).map((l) => l.name);
    renderChoices(shuffle([correct, ...decoys]), correct, onLanguagePick);
  }

  function renderChoices(options, correct, handler) {
    const wrap = $("choices");
    wrap.innerHTML = "";
    options.forEach((opt) => {
      const b = document.createElement("button");
      b.className = "choice";
      b.textContent = opt;
      b.addEventListener("click", () => handler(opt, correct, wrap));
      wrap.appendChild(b);
    });
  }

  function lockChoices(wrap, picked, correct) {
    wrap.querySelectorAll(".choice").forEach((b) => {
      b.disabled = true;
      if (b.textContent === correct) b.classList.add("correct");
      else if (b.textContent === picked) b.classList.add("wrong");
    });
  }

  function onMeaningPick(picked, correct, wrap) {
    const p = deck[round];
    lockChoices(wrap, picked, correct);
    const got = picked === correct;
    if (got) {
      score += PTS_MEANING;
      streak++;
      bestStreak = Math.max(bestStreak, streak);
      tally.meaning++;
      setFeedback(`Correct · +${PTS_MEANING}`, "ok");
    } else {
      streak = 0;
      setFeedback("Not quite.", "bad");
    }
    updateHud();
    // Move to the bonus question after a beat.
    setTimeout(() => {
      stage = "language";
      $("feedback").textContent = "";
      $("feedback").className = "feedback";
      askLanguage(p);
    }, 900);
  }

  function onLanguagePick(picked, correct, wrap) {
    const p = deck[round];
    lockChoices(wrap, picked, correct);
    if (picked === correct) {
      score += PTS_LANGUAGE;
      tally.language++;
      setFeedback(`It's ${correct} · +${PTS_LANGUAGE} bonus`, "ok");
    } else {
      setFeedback(`It was ${correct}.`, "bad");
    }
    $("src-lang").textContent = correct;
    $("src-lang").classList.add("revealed");
    updateHud();
    round++;
    $("btn-next").textContent = round >= deck.length ? "See results" : "Next phrase";
    $("btn-next").classList.remove("hidden");
  }

  function setFeedback(msg, kind) {
    const el = $("feedback");
    el.textContent = msg;
    el.className = "feedback " + kind;
  }

  function endGame() {
    const max = ROUNDS * (PTS_MEANING + PTS_LANGUAGE);
    $("final-score").innerHTML = `<b>${score}</b><span>/ ${max} points</span>`;
    $("breakdown").innerHTML =
      `<div><span>Meanings</span><b>${tally.meaning}/${ROUNDS}</b></div>` +
      `<div><span>Languages</span><b>${tally.language}/${ROUNDS}</b></div>` +
      `<div><span>Best streak</span><b>${bestStreak}</b></div>`;
    showScreen("end-screen");
  }

  /* ---------- wiring ---------- */
  $("btn-start").disabled = true;
  $("btn-start").addEventListener("click", startGame);
  $("btn-again").addEventListener("click", () => showScreen("start-screen"));
  $("btn-next").addEventListener("click", nextRound);
})();
