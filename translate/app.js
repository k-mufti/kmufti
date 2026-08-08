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
  const HINTS_FREE = 2;       // free hints per round
  const PTS_HINT_COST = 3;    // points deducted for each paid hint

  // Map puzzle language codes → Wiktionary subdomain + script info
  const WIKT = {
    spa: { sub: 'es', dir: 'ltr' },
    por: { sub: 'pt', dir: 'ltr' },
    ita: { sub: 'it', dir: 'ltr' },
    fra: { sub: 'fr', dir: 'ltr' },
    deu: { sub: 'de', dir: 'ltr' },
    nld: { sub: 'nl', dir: 'ltr' },
    swe: { sub: 'sv', dir: 'ltr' },
    dan: { sub: 'da', dir: 'ltr' },
    fin: { sub: 'fi', dir: 'ltr' },
    pol: { sub: 'pl', dir: 'ltr' },
    tur: { sub: 'tr', dir: 'ltr' },
    vie: { sub: 'vi', dir: 'ltr' },
    ind: { sub: 'id', dir: 'ltr' },
    rus: { sub: 'ru', dir: 'ltr' },
    ukr: { sub: 'uk', dir: 'ltr' },
    ell: { sub: 'el', dir: 'ltr' },
    heb: { sub: 'he', dir: 'rtl' },
    ara: { sub: 'ar', dir: 'rtl' },
    hin: { sub: 'hi', dir: 'ltr' },
    tha: { sub: 'th', dir: 'ltr' },
    jpn: { sub: 'ja', dir: 'ltr' },
    kor: { sub: 'ko', dir: 'ltr' },
    cmn: { sub: 'zh', dir: 'ltr' },
  };

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
  let hintsUsed = 0;        // per round
  let hintCache = {};       // word → definition string (cross-round cache)

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
    hintsUsed = 0;
    closeHintPopover();
    renderPhrase(p);
    updateHintBar();
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

  // Render the phrase as individually tappable word spans.
  function renderPhrase(p) {
    const el = $("phrase");
    el.innerHTML = "";
    // Split on whitespace, keep punctuation attached to words (natural wrapping)
    const tokens = p.q.split(/(\s+)/);
    tokens.forEach((tok) => {
      if (/^\s+$/.test(tok)) {
        el.appendChild(document.createTextNode(tok));
        return;
      }
      // Strip surrounding punctuation for the lookup word, keep for display
      const span = document.createElement("span");
      span.className = "hint-word";
      span.textContent = tok;
      span.dataset.lang = p.l;
      span.dataset.word = tok.replace(/^[\p{P}\p{Z}]+|[\p{P}\p{Z}]+$/gu, "");
      span.addEventListener("click", onWordClick);
      el.appendChild(span);
    });
  }

  // ---- Hint popover --------------------------------------------------------
  let activePopover = null;

  function closeHintPopover() {
    if (activePopover) { activePopover.remove(); activePopover = null; }
  }

  function updateHintBar() {
    let bar = $("hint-bar");
    if (!bar) return;
    const free = Math.max(0, HINTS_FREE - hintsUsed);
    bar.textContent = free > 0
      ? `${free} free hint${free !== 1 ? "s" : ""} left · tap any word`
      : `hints cost ${PTS_HINT_COST} pts each · tap any word`;
  }

  async function onWordClick(e) {
    e.stopPropagation();
    const span = e.currentTarget;
    const word = span.dataset.word;
    const langCode = span.dataset.lang;
    if (!word || answered) return;

    closeHintPopover();

    // Show loading popover immediately
    const pop = document.createElement("div");
    pop.className = "hint-pop";
    pop.innerHTML = `<span class="hint-word-title">${word}</span><span class="hint-loading">looking up…</span>`;
    document.body.appendChild(pop);
    activePopover = pop;
    positionPopover(pop, span);

    document.addEventListener("click", closeHintPopover, { once: true });

    let def;
    const cacheKey = `${langCode}:${word.toLowerCase()}`;
    if (hintCache[cacheKey]) {
      def = hintCache[cacheKey];
    } else {
      def = await fetchDefinition(word, langCode);
      if (def) hintCache[cacheKey] = def;
    }

    if (!activePopover || activePopover !== pop) return; // closed while loading

    // Deduct points (after first fetch so we don't penalise failed lookups)
    if (def) {
      if (hintsUsed >= HINTS_FREE) {
        score = Math.max(0, score - PTS_HINT_COST);
        updateHud();
      }
      hintsUsed++;
      updateHintBar();
    }

    const wiktInfo = WIKT[langCode] || { dir: 'ltr' };
    pop.innerHTML = `
      <span class="hint-word-title">${word}</span>
      ${def
        ? `<span class="hint-def" dir="${wiktInfo.dir}">${def}</span>`
        : `<span class="hint-loading hint-miss">no definition found</span>`}
      ${def && hintsUsed > HINTS_FREE ? `<span class="hint-cost">−${PTS_HINT_COST} pts</span>` : ""}
    `;
    positionPopover(pop, span);
  }

  function positionPopover(pop, anchor) {
    const r = anchor.getBoundingClientRect();
    const pw = 260;
    let left = r.left + window.scrollX + r.width / 2 - pw / 2;
    left = Math.max(8, Math.min(left, window.innerWidth - pw - 8));
    const top = r.bottom + window.scrollY + 8;
    pop.style.cssText = `left:${left}px;top:${top}px;width:${pw}px`;
  }

  async function fetchDefinition(word, langCode) {
    const wikt = WIKT[langCode];
    if (!wikt) return null;
    const sub = wikt.sub;
    // Fetch full plaintext extract — Wiktionary has no "intro" so exintro gives nothing
    const url = `https://${sub}.wiktionary.org/w/api.php?action=query&titles=${encodeURIComponent(word)}&prop=extracts&explaintext=1&exsectionformat=plain&format=json&origin=*`;
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(7000) });
      const json = await res.json();
      const pages = json.query?.pages;
      if (!pages) return null;
      const page = Object.values(pages)[0];
      if (page.missing !== undefined || !page.extract) return null;
      return parseWiktionaryDef(page.extract, word);
    } catch { return null; }
  }

  // Parse a Wiktionary plaintext extract to find the first real definition line.
  // Structure: == Language == > === Etymology === / === Noun === / etc.
  // Definition lines follow the POS header and a pronunciation line.
  function parseWiktionaryDef(text, word) {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    let skipEtym = false;

    for (const line of lines) {
      // Section headers
      if (/^===/.test(line)) {
        // Skip etymology, pronunciation, references sections
        skipEtym = /étymol|etymolog|pronunc|pronúnc|origin|herkunft|aussprache|prononciation|référence|anmerkung|notes|see also|synonym/i.test(line);
        continue;
      }
      if (/^==/.test(line)) { skipEtym = false; continue; } // language header resets
      if (skipEtym) continue;

      // Skip the headword line (often: "word \pronunciation\ gender")
      if (line.startsWith(word) || new RegExp('^' + word, 'i').test(line)) continue;

      // Skip lines that are just IPA/pronunciation notation
      if (/^[\\\/\[\/]/.test(line) || /^\(Prononciation/.test(line)) continue;

      // Skip quote lines and example attributions
      if (/^[—–\-―]/.test(line)) continue;

      // Skip very short or parenthetical-only lines like "(see above)"
      if (line.length < 14) continue;

      // Skip lines that look like cross-references or just a category tag
      if (/^\(→/.test(line)) continue;

      // This looks like a definition — take up to 200 chars
      const clean = line.replace(/\s+/g, ' ').trim();
      return clean.length > 200 ? clean.slice(0, 200) + '…' : clean;
    }
    return null;
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
      if (b.textContent === correct) {
        b.classList.add("correct");
        // Only badge it when the player actually got there themselves.
        if (picked === correct) b.classList.add("picked");
      }
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
