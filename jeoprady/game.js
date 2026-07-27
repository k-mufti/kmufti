// Jeoprady! - Multi-team Jeopardy game
// Uses boards.json + categories.json

"use strict";

const STANDARD_JEOPARDY_VALUES = [200, 400, 600, 800, 1000];
const TEAM_COLORS = ['#ffcc00', '#64b5f6', '#81c784', '#ff8a65'];

// Sets = curated collections, matched by explicit tag membership. A set and a
// topic tag can be active at the same time (they AND together).
const SETS = [
  // The classic archive: every real-show category (i.e. not part of a custom pack).
  { id: 'og',     label: 'Jeoprady OG Pack',   match: (c) => !(c.tags && c.tags.includes('modern')), grouped: true },
  { id: 'modern', label: 'Easy Questions Pack', tagId: 'modern', grouped: true },
  { id: 'newest', label: 'Newest Pack',      tagId: 'newest', grouped: true },
];

// Topic tags = subject filters. A category matches if it carries the topic's
// section sub-tag (used by the curated sets) OR its name matches a keyword
// (used across the full 47k library).
const TOPIC_TAGS = [
  { id: 'movies',     label: 'Movies & TV', sectionTags: ['film2'],   terms: ['MOVIE','FILM','FILMS','CINEMA','OSCAR','ACTOR','ACTRESS','DIRECTOR','TV','TELEVISION','SITCOM','EMMY'] },
  { id: 'music',      label: 'Music',        sectionTags: ['music2'],  terms: ['MUSIC','SONG','SONGS','BAND','BANDS','ROCK','POP','RAP','JAZZ','OPERA','ALBUM','SINGER','BEATLES'] },
  { id: 'sports',     label: 'Sports',       sectionTags: ['sports2'], terms: ['SPORT','SPORTS','FOOTBALL','BASKETBALL','BASEBALL','TENNIS','GOLF','SOCCER','OLYMPIC','SWIMMING','NFL','NBA','MLB'] },
  { id: 'science',    label: 'Science',      sectionTags: ['science2'],terms: ['SCIENCE','BIOLOGY','CHEMISTRY','PHYSICS','ASTRONOMY','SPACE','PLANET','ELEMENT','MATH','GEOLOGY','ANATOMY','MEDICINE'] },
  { id: 'history',    label: 'History',      sectionTags: ['history2'],terms: ['HISTORY','HISTORICAL','PRESIDENT','PRESIDENTS','WAR','WARS','REVOLUTION','ANCIENT','DYNASTY','EMPIRE'] },
  { id: 'geography',  label: 'Geography',    sectionTags: ['geo2'],    terms: ['GEOGRAPHY','COUNTRY','COUNTRIES','CITIES','CITY','CAPITAL','CONTINENT','RIVER','MOUNTAIN','ISLAND','OCEAN'] },
  { id: 'literature', label: 'Literature',   sectionTags: ['lit2','arts2'], terms: ['LITERATURE','NOVEL','NOVELS','AUTHOR','AUTHORS','BOOK','BOOKS','POETRY','POET','SHAKESPEARE','FICTION'] },
  { id: 'tech',       label: 'Tech & AI',    sectionTags: ['tech'],    terms: ['TECH','TECHNOLOGY','COMPUTER','COMPUTERS','INTERNET','GADGET','ROBOT','SOFTWARE'] },
  { id: 'food',       label: 'Food & Drink', sectionTags: ['food2'],   terms: ['FOOD','COOKING','CUISINE','DRINK','WINE','BEER','RECIPE','CHEF','RESTAURANT','DESSERT','FRUIT'] },
  { id: 'wordplay',   label: 'Wordplay',     sectionTags: ['wordplay2'],terms: ['WORD','WORDS','RHYME','LETTERS','ANAGRAM','LANGUAGE','PHRASE','SLANG','CROSSWORD'] },
  { id: 'potpourri',  label: 'Potpourri',    sectionTags: ['misc2'],   terms: ['POTPOURRI','GRAB BAG','MISCELLANEOUS','HODGEPODGE','ASSORTED','MIXED BAG'] },
];

// The untagged OG archive has no section tags, so classify each category into a
// topic section by name keyword — the same terms the Topics filter uses.
const KEYWORD_SECTIONS = TOPIC_TAGS.map((t) => ({ section: t.sectionTags[0], terms: t.terms }));

const state = {
  boards: null,
  categoryIndex: null,
  mode: "random",       // 'random' | 'custom'
  pendingMode: null,    // mode queued until team setup done
  currentBoard: null,
  round: "jeopardy",   // 'jeopardy' | 'double' | 'final'
  cellsRemaining: 0,
  teams: [],            // [{ name, score }, ...]
  activeTeam: 0,
  finalWagers: [],
  activeClue: null,
  pickerSelected: [],
  pickerFilter: "",
  episodeOrder: [],       // board indices sorted oldest -> newest
  selectedBoard: null,    // chosen board (null = pick random at start)
};

const CLUE_TIMER_SECS = 45;
const SA_VALUES = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];

// ---------- DOM helpers ----------
const $ = (id) => document.getElementById(id);

function showScreen(id) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
  $(id).classList.add("active");
}

function fmt(amount) {
  const sign = amount < 0 ? "-" : "";
  return `${sign}$${Math.abs(amount).toLocaleString("en-US")}`;
}

function renderTeamsDisplay() {
  const container = $("teams-display");
  container.innerHTML = "";
  for (let i = 0; i < state.teams.length; i++) {
    const t = state.teams[i];
    const card = document.createElement("div");
    card.className = "team-card clickable" + (i === state.activeTeam ? " active-team" : "");
    card.title = "Click to adjust score";
    const nameEl = document.createElement("span");
    nameEl.className = "team-card-name";
    nameEl.textContent = t.name;
    const scoreEl = document.createElement("span");
    scoreEl.className = "team-card-score" + (t.score < 0 ? " negative" : "");
    scoreEl.textContent = fmt(t.score);
    card.appendChild(nameEl);
    card.appendChild(scoreEl);
    const idx = i;
    card.addEventListener("click", () => openScoreAdjust(idx, card));
    container.appendChild(card);
  }
}

// ---------- Score adjust popup ----------
let scoreAdjustTeam = -1;

function openScoreAdjust(teamIdx, anchorEl) {
  if (scoreAdjustTeam === teamIdx) {
    closeScoreAdjust();
    return;
  }
  scoreAdjustTeam = teamIdx;
  const popup = $("score-adjust-popup");
  const team = state.teams[teamIdx];

  popup.innerHTML = "";
  const nameEl = document.createElement("div");
  nameEl.className = "sa-name";
  nameEl.textContent = team.name;
  popup.appendChild(nameEl);

  const addRow = document.createElement("div");
  addRow.className = "sa-row";
  const subRow = document.createElement("div");
  subRow.className = "sa-row";

  SA_VALUES.forEach((v) => {
    const addBtn = document.createElement("button");
    addBtn.className = "sa-btn add";
    addBtn.textContent = `+${v}`;
    addBtn.addEventListener("click", () => { adjustScore(teamIdx, v); });
    addRow.appendChild(addBtn);

    const subBtn = document.createElement("button");
    subBtn.className = "sa-btn sub";
    subBtn.textContent = `-${v}`;
    subBtn.addEventListener("click", () => { adjustScore(teamIdx, -v); });
    subRow.appendChild(subBtn);
  });

  popup.appendChild(addRow);
  popup.appendChild(subRow);

  const closeRow = document.createElement("div");
  closeRow.className = "sa-close-row";
  const closeBtn = document.createElement("button");
  closeBtn.className = "text-btn small";
  closeBtn.textContent = "Done";
  closeBtn.addEventListener("click", closeScoreAdjust);
  closeRow.appendChild(closeBtn);
  popup.appendChild(closeRow);

  // Position below the anchor card
  const rect = anchorEl.getBoundingClientRect();
  popup.style.left = `${Math.max(12, Math.min(rect.left, window.innerWidth - 384))}px`;
  popup.style.top = `${rect.bottom + 6}px`;
  popup.classList.remove("hidden");
}

function adjustScore(teamIdx, delta) {
  state.teams[teamIdx].score += delta;
  renderTeamsDisplay();
  // Re-open so position refreshes and active state syncs
  const cards = document.querySelectorAll(".team-card");
  if (cards[teamIdx]) openScoreAdjust(teamIdx, cards[teamIdx]);
}

function closeScoreAdjust() {
  scoreAdjustTeam = -1;
  $("score-adjust-popup").classList.add("hidden");
}

// ---------- Team setup ----------
let teamSetupCount = 1;

function openTeamSetup(mode) {
  state.pendingMode = mode;
  teamSetupCount = 1;
  highlightTeamCountBtn(1);
  renderTeamNameFields(1);
  // Episode picker only applies to the random flow; reset to "random" each time.
  state.selectedBoard = null;
  const picker = $("episode-picker");
  if (picker) {
    picker.classList.toggle("hidden", mode !== "random");
    $("episode-select").value = "";
  }
  showScreen("team-screen");
}

function highlightTeamCountBtn(n) {
  document.querySelectorAll(".team-count-btn").forEach((b) =>
    b.classList.toggle("active", parseInt(b.dataset.count) === n)
  );
}

function renderTeamNameFields(n) {
  const fields = $("team-name-fields");
  fields.innerHTML = "";
  for (let i = 0; i < n; i++) {
    const row = document.createElement("div");
    row.className = "team-name-row";
    const dot = document.createElement("div");
    dot.className = "team-color-dot";
    dot.style.background = TEAM_COLORS[i];
    const input = document.createElement("input");
    input.className = "team-name-input";
    input.type = "text";
    input.placeholder = `Team ${i + 1}`;
    input.id = `team-name-${i}`;
    row.appendChild(dot);
    row.appendChild(input);
    fields.appendChild(row);
  }
}

function confirmTeamSetup() {
  state.teams = [];
  for (let i = 0; i < teamSetupCount; i++) {
    const input = $(`team-name-${i}`);
    const name = (input && input.value.trim()) || `Team ${i + 1}`;
    state.teams.push({ name, score: 0 });
  }
  state.activeTeam = 0;
  if (state.pendingMode === "random") {
    startRandomGame();
  } else {
    openCustomPicker();
  }
}

// ---------- Modern pack ----------
async function mergeModernPack() {
  let res;
  try {
    res = await fetch("modern_categories.json", { cache: "no-cache" });
  } catch {
    return; // file not present — skip silently
  }
  if (!res || !res.ok) return;
  const data = await res.json();
  const playable = (data.categories || []).filter(
    (c) => Array.isArray(c.clues) && c.clues.length === 5
  );
  const mapped = playable.map((c) => ({
    name: c.name,
    tags: c.tags || [],
    modern: true,
    clues: c.clues.map((cl, i) => ({
      position: i,
      isDailyDouble: !!cl.dd,
      question: cl.q,
      answer: cl.a,
    })),
  }));
  // Prepend so the modern categories are easy to find at the top of the picker.
  state.categoryIndex = mapped.concat(state.categoryIndex);
}

// ---------- Boot ----------
async function boot() {
  try {
    // Load both files in parallel
    const [boardsRes, catsRes] = await Promise.all([
      fetch("boards.json", { cache: "no-cache" }),
      fetch("categories.json", { cache: "no-cache" }),
    ]);
    if (!boardsRes.ok) throw new Error(`boards.json: HTTP ${boardsRes.status}`);
    if (!catsRes.ok) throw new Error(`categories.json: HTTP ${catsRes.status}`);

    state.boards = await boardsRes.json();

    // categories.json uses compact {name, clues:[{q,a,dd}]} format
    const rawCats = await catsRes.json();
    state.categoryIndex = rawCats.map((c) => ({
      name: c.name,
      clues: c.clues.map((cl, i) => ({
        position: i,
        isDailyDouble: cl.dd,
        question: cl.q,
        answer: cl.a,
      })),
    }));

    // Modern pack (optional) — merge in only categories that have all 5 clues,
    // carrying their explicit tags so the picker can filter them by membership.
    await mergeModernPack();

    buildEpisodeDropdown();

    $("loading-status").textContent = "";
    $("btn-new-game").disabled = false;
    $("btn-custom-game").disabled = false;
  } catch (err) {
    $("loading-status").textContent =
      "Failed to load data. Serve this folder over HTTP (e.g. `python3 -m http.server`).";
    $("btn-new-game").disabled = true;
    $("btn-custom-game").disabled = true;
    console.error(err);
  }
}

// ---------- Episode dropdown ----------
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function fmtEpisodeDate(airDate) {
  // airDate is "YYYY-MM-DD"
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(airDate || "");
  if (!m) return airDate || "Unknown date";
  return `${MONTHS[parseInt(m[2], 10) - 1]} ${m[1]}`;
}

function buildEpisodeDropdown() {
  // Sort board indices oldest -> newest so episode numbers read chronologically.
  state.episodeOrder = state.boards
    .map((b, i) => i)
    .sort((a, b) => String(state.boards[a].airDate).localeCompare(String(state.boards[b].airDate)));

  const select = $("episode-select");
  // Newest first in the list; synthetic number = position in chronological order.
  for (let rank = state.episodeOrder.length - 1; rank >= 0; rank--) {
    const boardIdx = state.episodeOrder[rank];
    const opt = document.createElement("option");
    opt.value = String(boardIdx);
    opt.textContent = `Episode ${rank + 1} — ${fmtEpisodeDate(state.boards[boardIdx].airDate)}`;
    select.appendChild(opt);
  }
}

// ---------- Game flow ----------
function startRandomGame() {
  state.mode = "random";
  const board = state.selectedBoard
    || state.boards[Math.floor(Math.random() * state.boards.length)];
  state.currentBoard = board;
  state.teams.forEach((t) => { t.score = 0; });
  renderTeamsDisplay();
  beginRound("jeopardy");
}

function startCustomGame() {
  state.mode = "custom";
  const chosenCats = state.pickerSelected.map((i) => state.categoryIndex[i]);
  const categories = chosenCats.map((c) => ({
    name: c.name,
    clues: c.clues.map((cl, idx) => ({
      position: idx,
      standardValue: STANDARD_JEOPARDY_VALUES[idx],
      isDailyDouble: cl.isDailyDouble,
      wager: STANDARD_JEOPARDY_VALUES[idx],
      question: cl.question,
      answer: cl.answer,
    })),
  }));
  const randomBoard = state.boards[Math.floor(Math.random() * state.boards.length)];
  state.currentBoard = {
    show: "Custom",
    airDate: chosenCats.map((c) => c.name).slice(0, 3).join(" • ") + "…",
    jeopardy: { scale: "new", values: STANDARD_JEOPARDY_VALUES, categories },
    double: null,
    final: randomBoard.final,
  };
  state.teams.forEach((t) => { t.score = 0; });
  renderTeamsDisplay();
  beginRound("jeopardy");
}

function beginRound(round) {
  state.round = round;
  if (round === "final") {
    startFinalJeopardy();
    return;
  }
  // In custom mode, skip Double Jeopardy — go straight to Final after Jeopardy!
  if (round === "double" && state.mode === "custom") {
    beginRound("final");
    return;
  }
  const roundData = round === "jeopardy" ? state.currentBoard.jeopardy : state.currentBoard.double;
  const title = round === "jeopardy" ? "Jeopardy!" : "Double Jeopardy!";
  $("round-label").textContent = title;
  renderBoard(roundData);
  showScreen("game-screen");
}

function renderBoard(roundData) {
  const board = $("board");
  board.innerHTML = "";
  const { categories, values } = roundData;

  // Row 1: category headers
  for (const cat of categories) {
    const el = document.createElement("div");
    el.className = "category-cell";
    el.textContent = cat.name;
    board.appendChild(el);
  }

  // Rows 2-6: clue cells (value grid, one row per value)
  state.cellsRemaining = 0;
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < categories.length; col++) {
      const cat = categories[col];
      const clue = cat.clues[row];
      const cell = document.createElement("button");
      cell.className = "clue-cell";
      cell.textContent = fmt(values[row]);
      cell.dataset.value = values[row];
      cell.addEventListener("click", () => openClue({ cell, category: cat, clue, boardValue: values[row] }));
      board.appendChild(cell);
      state.cellsRemaining++;
    }
  }
}

// ---------- Clue modal ----------
function openClue({ cell, category, clue, boardValue }) {
  if (cell.classList.contains("used")) return;
  state.activeClue = { cell, category, clue, boardValue, wager: boardValue };

  $("clue-category").textContent = category.name;
  $("clue-value").textContent = fmt(boardValue);

  // Reset panels
  $("daily-double-splash").classList.add("hidden");
  $("wager-panel").classList.add("hidden");
  $("clue-body").classList.add("hidden");
  $("clue-answer-wrap").classList.add("hidden");
  $("btn-show-answer").classList.remove("hidden");
  $("judge-buttons").classList.add("hidden");
  $("wager-error").textContent = "";
  $("wager-input").value = "";

  $("clue-modal").classList.remove("hidden");

  if (clue.isDailyDouble) {
    showDailyDoubleFlow();
  } else {
    revealClueQuestion();
  }
}

function showDailyDoubleFlow() {
  $("daily-double-splash").classList.remove("hidden");
  setTimeout(() => {
    $("daily-double-splash").classList.add("hidden");
    showWagerPanel();
  }, 1400);
}

function showWagerPanel() {
  const roundData = state.round === "jeopardy" ? state.currentBoard.jeopardy : state.currentBoard.double;
  const roundMax = roundData.values[roundData.values.length - 1];
  const teamScore = state.teams[state.activeTeam].score;
  const maxWager = Math.max(teamScore, roundMax);
  const minWager = 5;
  const teamName = state.teams[state.activeTeam].name;

  $("wager-range").textContent = `${teamName}: between ${fmt(minWager)} and ${fmt(maxWager)}`;
  const input = $("wager-input");
  input.min = minWager;
  input.max = maxWager;
  input.value = Math.min(maxWager, roundMax);
  $("wager-panel").classList.remove("hidden");
  input.focus();
  input.select();

  $("btn-submit-wager").onclick = () => {
    const w = parseInt(input.value, 10);
    if (!Number.isFinite(w) || w < minWager || w > maxWager) {
      $("wager-error").textContent = `Enter a whole dollar amount between ${fmt(minWager)} and ${fmt(maxWager)}.`;
      return;
    }
    state.activeClue.wager = w;
    $("wager-panel").classList.add("hidden");
    revealClueQuestion();
  };
}

// ---------- Timer ----------
let clueTimerInterval = null;

function startClueTimer() {
  stopClueTimer();
  let remaining = CLUE_TIMER_SECS;
  const timerEl = $("clue-timer");
  timerEl.className = "clue-timer";
  timerEl.classList.remove("hidden");
  updateTimerDisplay(remaining);
  clueTimerInterval = setInterval(() => {
    remaining--;
    updateTimerDisplay(remaining);
    if (remaining <= 0) stopClueTimer();
  }, 1000);
}

function stopClueTimer() {
  if (clueTimerInterval) {
    clearInterval(clueTimerInterval);
    clueTimerInterval = null;
  }
}

function updateTimerDisplay(remaining) {
  const pct = Math.max(0, remaining / CLUE_TIMER_SECS);
  $("clue-timer-bar").style.width = `${pct * 100}%`;
  $("clue-timer-text").textContent = Math.max(0, remaining);
  const el = $("clue-timer");
  el.classList.toggle("warning", remaining <= 15 && remaining > 5);
  el.classList.toggle("danger",  remaining <= 5 && remaining > 0);
  el.classList.toggle("expired", remaining <= 0);
}

function revealClueQuestion() {
  const { clue, wager } = state.activeClue;
  $("clue-question").textContent = clue.question;
  $("clue-answer").textContent = clue.answer;
  $("judge-value").textContent = fmt(wager);
  $("judge-value-2").textContent = fmt(wager);
  const teamName = state.teams[state.activeTeam].name;
  $("active-team-label").textContent =
    state.teams.length > 1 ? `Scoring for: ${teamName}` : "";
  $("clue-body").classList.remove("hidden");
  startClueTimer();
}

// ---------- Judging ----------
function closeClueAndAdvance() {
  stopClueTimer();
  $("clue-timer").classList.add("hidden");
  const { cell } = state.activeClue;
  cell.classList.add("used");
  cell.disabled = true;
  $("clue-modal").classList.add("hidden");
  state.activeClue = null;
  state.cellsRemaining--;
  if (state.cellsRemaining <= 0) {
    if (state.round === "jeopardy") beginRound("double");
    else if (state.round === "double") beginRound("final");
  }
}

function judge(correct) {
  const { wager } = state.activeClue;
  const team = state.teams[state.activeTeam];
  if (correct === true) team.score += wager;
  else if (correct === false) team.score -= wager;
  state.activeTeam = (state.activeTeam + 1) % state.teams.length;
  renderTeamsDisplay();
  closeClueAndAdvance();
}

// ---------- Final Jeopardy ----------
function startFinalJeopardy() {
  const final = state.currentBoard.final;
  $("final-category").textContent = final.category;
  $("final-wager-error").textContent = "";

  const fields = $("final-wager-fields");
  fields.innerHTML = "";
  state.teams.forEach((team, i) => {
    const maxW = Math.max(0, team.score);
    const row = document.createElement("div");
    row.className = "final-wager-row";
    const label = document.createElement("label");
    label.className = "final-wager-label";
    label.textContent = team.name;
    label.setAttribute("for", `final-wager-${i}`);
    const input = document.createElement("input");
    input.className = "final-wager-input-sm";
    input.type = "number";
    input.min = 0;
    input.max = maxW;
    input.value = Math.min(maxW, Math.max(0, Math.floor(team.score / 2)));
    input.placeholder = `0 – ${fmt(maxW)}`;
    input.id = `final-wager-${i}`;
    row.appendChild(label);
    row.appendChild(input);
    fields.appendChild(row);
  });

  $("final-category-panel").classList.remove("hidden");
  $("final-clue-panel").classList.add("hidden");
  $("final-answer-wrap").classList.add("hidden");
  $("btn-final-show-answer").classList.remove("hidden");
  $("final-judge").classList.add("hidden");
  showScreen("final-screen");

  $("btn-final-wager").onclick = () => {
    const wagers = [];
    for (let i = 0; i < state.teams.length; i++) {
      const input = $(`final-wager-${i}`);
      const w = parseInt(input ? input.value : 0, 10);
      const maxW = Math.max(0, state.teams[i].score);
      if (!Number.isFinite(w) || w < 0 || w > maxW) {
        $("final-wager-error").textContent =
          `${state.teams[i].name}: enter $0 – ${fmt(maxW)}.`;
        return;
      }
      wagers.push(w);
    }
    state.finalWagers = wagers;
    $("final-category-panel").classList.add("hidden");
    $("final-clue").textContent = final.question;
    $("final-answer").textContent = final.answer;
    $("final-clue-panel").classList.remove("hidden");
  };

  $("btn-final-show-answer").onclick = () => {
    $("final-answer-wrap").classList.remove("hidden");
    $("btn-final-show-answer").classList.add("hidden");
    buildFinalJudge();
    $("final-judge").classList.remove("hidden");
  };
}

function buildFinalJudge() {
  const judgeEl = $("final-judge");
  judgeEl.innerHTML = "";
  let judgedCount = 0;

  state.teams.forEach((team, i) => {
    const row = document.createElement("div");
    row.className = "final-judge-row";
    const nameEl = document.createElement("span");
    nameEl.className = "final-judge-name";
    nameEl.textContent = team.name;
    const correctBtn = document.createElement("button");
    correctBtn.className = "judge-btn correct";
    correctBtn.textContent = "Correct";
    const wrongBtn = document.createElement("button");
    wrongBtn.className = "judge-btn wrong";
    wrongBtn.textContent = "Wrong";

    const handle = (correct) => {
      const wager = state.finalWagers[i];
      if (correct) team.score += wager;
      else team.score -= wager;
      correctBtn.disabled = true;
      wrongBtn.disabled = true;
      correctBtn.style.opacity = correct ? "1" : "0.35";
      wrongBtn.style.opacity = correct ? "0.35" : "1";
      judgedCount++;
      renderTeamsDisplay();
      if (judgedCount === state.teams.length) showEndScreen();
    };

    correctBtn.addEventListener("click", () => handle(true));
    wrongBtn.addEventListener("click", () => handle(false));
    row.appendChild(nameEl);
    row.appendChild(correctBtn);
    row.appendChild(wrongBtn);
    judgeEl.appendChild(row);
  });
}

function showEndScreen() {
  const b = state.currentBoard;
  $("end-episode").textContent = `Show #${b.show} • ${b.airDate}`;
  const scoresEl = $("end-scores");
  scoresEl.innerHTML = "";
  const maxScore = Math.max(...state.teams.map((t) => t.score));
  const sorted = [...state.teams].sort((a, b) => b.score - a.score);
  sorted.forEach((team) => {
    const isWinner = state.teams.length > 1 && team.score === maxScore;
    const row = document.createElement("div");
    row.className = "end-score-row" + (isWinner ? " winner" : "");
    const left = document.createElement("div");
    left.style.display = "flex";
    left.style.alignItems = "center";
    left.style.gap = "8px";
    const nameSpan = document.createElement("span");
    nameSpan.className = "end-score-name";
    nameSpan.textContent = team.name;
    left.appendChild(nameSpan);
    if (isWinner) {
      const badge = document.createElement("span");
      badge.className = "end-winner-badge";
      badge.textContent = "WINNER";
      left.appendChild(badge);
    }
    const scoreSpan = document.createElement("span");
    scoreSpan.className = "end-score-amount" + (team.score < 0 ? " negative" : "");
    scoreSpan.textContent = fmt(team.score);
    row.appendChild(left);
    row.appendChild(scoreSpan);
    scoresEl.appendChild(row);
  });
  showScreen("end-screen");
}

// ---------- Custom picker ----------

// Virtual scroll constants
const VCOLS = 3;
const VROW_H = 42;
const VPAD = 6;
const VBUF = 6;
// Max chips rendered per section in the grouped view (keeps the huge OG
// archive fast — the grouped view isn't virtualized). Search to see the rest.
const MAX_PER_SECTION = 60;

// Topic sections for the grouped (curated-pack) view. Order here is the
// display order; categories within each section are sorted alphabetically.
const SECTION_LABELS = {
  wordplay2: 'Wordplay & Language',
  lit2: 'Literature',
  arts2: 'Art & Stage',
  history2: 'History',
  geo2: 'Geography',
  science2: 'Science & Nature',
  tech: 'Tech, AI & Crypto',
  biz2: 'Business',
  film2: 'Film & TV',
  music2: 'Music',
  sports2: 'Sports',
  gaming: 'Gaming',
  food2: 'Food & Lifestyle',
  myth2: 'Mythology',
  news: 'News & Current Events',
  internet: 'Internet & Social',
  memes: 'Memes & Viral',
  nostalgia: '2000s/2010s Nostalgia',
  misc2: 'Potpourri',
};
const SECTION_ORDER = Object.keys(SECTION_LABELS);

let pickerFiltered = [];
let pickerActiveSet = '';
let pickerActiveTag = '';
let pickerScrollRAF = null;

function buildSetBar() {
  const bar = $("set-bar");
  bar.innerHTML = '';
  for (const set of SETS) {
    const btn = document.createElement('button');
    btn.className = 'set-btn';
    btn.textContent = set.label;
    btn.dataset.setId = set.id;
    btn.addEventListener('click', () => {
      pickerActiveSet = pickerActiveSet === set.id ? '' : set.id;
      bar.querySelectorAll('.set-btn').forEach(b =>
        b.classList.toggle('active', b.dataset.setId === pickerActiveSet)
      );
      refilter();
    });
    bar.appendChild(btn);
  }
}

function buildTagBar() {
  const bar = $("tag-bar");
  bar.innerHTML = '';
  for (const tag of TOPIC_TAGS) {
    const btn = document.createElement('button');
    btn.className = 'tag-btn';
    btn.textContent = tag.label;
    btn.dataset.tagId = tag.id;
    btn.addEventListener('click', () => {
      pickerActiveTag = pickerActiveTag === tag.id ? '' : tag.id;
      bar.querySelectorAll('.tag-btn').forEach(b =>
        b.classList.toggle('active', b.dataset.tagId === pickerActiveTag)
      );
      refilter();
    });
    bar.appendChild(btn);
  }
}

function refilter() {
  const search = state.pickerFilter.trim().toUpperCase();
  const set = pickerActiveSet ? SETS.find(s => s.id === pickerActiveSet) : null;
  const tag = pickerActiveTag ? TOPIC_TAGS.find(t => t.id === pickerActiveTag) : null;
  pickerFiltered = [];
  const cats = state.categoryIndex;
  for (let i = 0; i < cats.length; i++) {
    const cat = cats[i];
    const name = cat.name.toUpperCase();
    if (search && !name.includes(search)) continue;
    // Set filter: custom predicate or explicit tag membership.
    if (set) {
      const inSet = set.match ? set.match(cat) : (cat.tags && cat.tags.includes(set.tagId));
      if (!inSet) continue;
    }
    // Topic filter: section sub-tag OR name keyword.
    if (tag) {
      const bySection = tag.sectionTags && cat.tags &&
        tag.sectionTags.some(t => cat.tags.includes(t));
      const byName = tag.terms && tag.terms.some(t => name.includes(t));
      if (!bySection && !byName) continue;
    }
    pickerFiltered.push(i);
  }
  $('category-list').scrollTop = 0;
  renderVirtualScroll();
  updatePickerStatus();
}

// Show the grouped, topic-sectioned view only for curated packs (which carry
// topic sub-tags), on their own — not for the huge OG archive.
function isGroupedMode() {
  if (pickerActiveTag || state.pickerFilter) return false;
  const set = pickerActiveSet ? SETS.find(s => s.id === pickerActiveSet) : null;
  return !!(set && set.grouped);
}

// The topic section a category belongs to. Curated packs carry section tags;
// the untagged OG archive is classified by name keyword. Cached per category.
function topicOf(cat) {
  if (cat._topic !== undefined) return cat._topic;
  const tags = cat.tags || [];
  for (const t of SECTION_ORDER) {
    if (tags.includes(t)) { cat._topic = t; return t; }
  }
  const name = cat.name.toUpperCase();
  for (const ks of KEYWORD_SECTIONS) {
    if (ks.terms.some((term) => name.includes(term))) { cat._topic = ks.section; return ks.section; }
  }
  cat._topic = "_other";
  return cat._topic;
}

function renderVirtualScroll() {
  const list = $('category-list');
  const rowsEl = $('vscroll-rows');
  const hasFilter = !!(state.pickerFilter || pickerActiveSet || pickerActiveTag);
  const empty = $('cat-list-empty');

  if (!hasFilter) {
    empty.textContent = 'Search or pick a pack above to see categories.';
    empty.classList.remove('hidden');
    rowsEl.classList.remove('grouped');
    $('vscroll-sizer').style.height = '0';
    rowsEl.innerHTML = '';
    updatePickerStatus();
    return;
  }

  if (pickerFiltered.length === 0) {
    empty.textContent = 'No categories match.';
    empty.classList.remove('hidden');
    rowsEl.classList.remove('grouped');
    $('vscroll-sizer').style.height = '0';
    rowsEl.innerHTML = '';
    updatePickerStatus();
    return;
  }

  empty.classList.add('hidden');

  if (isGroupedMode()) {
    renderGrouped();
    return;
  }

  rowsEl.classList.remove('grouped');
  const totalRows = Math.ceil(pickerFiltered.length / VCOLS);
  const totalH = totalRows * VROW_H + VPAD * 2;
  $('vscroll-sizer').style.height = `${totalH}px`;

  const scrollTop = list.scrollTop;
  const viewH = list.clientHeight || 320;
  const firstRow = Math.max(0, Math.floor((scrollTop - VPAD) / VROW_H) - VBUF);
  const lastRow  = Math.min(totalRows - 1, Math.ceil((scrollTop - VPAD + viewH) / VROW_H) + VBUF);
  const selectedSet = new Set(state.pickerSelected);

  rowsEl.innerHTML = '';

  for (let r = firstRow; r <= lastRow; r++) {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'vrow';
    rowDiv.style.cssText = `position:absolute;top:${r * VROW_H + VPAD}px;left:${VPAD}px;right:${VPAD}px`;
    for (let c = 0; c < VCOLS; c++) {
      const fi = r * VCOLS + c;
      if (fi >= pickerFiltered.length) {
        const ph = document.createElement('div');
        ph.style.flex = '1';
        rowDiv.appendChild(ph);
        continue;
      }
      const catIdx = pickerFiltered[fi];
      const chip = document.createElement('button');
      chip.className = 'cat-chip' + (selectedSet.has(catIdx) ? ' selected' : '');
      chip.textContent = state.categoryIndex[catIdx].name;
      chip.title = state.categoryIndex[catIdx].name;
      chip.addEventListener('click', () => togglePickerCategory(catIdx));
      rowDiv.appendChild(chip);
    }
    rowsEl.appendChild(rowDiv);
  }
}

// Grouped view for curated packs: topic-section headers, each alphabetized.
function renderGrouped() {
  const rowsEl = $('vscroll-rows');
  rowsEl.classList.add('grouped');
  $('vscroll-sizer').style.height = '0';

  const groups = new Map();
  for (const idx of pickerFiltered) {
    const topic = topicOf(state.categoryIndex[idx]);
    if (!groups.has(topic)) groups.set(topic, []);
    groups.get(topic).push(idx);
  }

  const orderedTopics = SECTION_ORDER.filter(t => groups.has(t));
  for (const t of groups.keys()) if (!orderedTopics.includes(t)) orderedTopics.push(t);

  const selectedSet = new Set(state.pickerSelected);
  const frag = document.createDocumentFragment();

  for (const topic of orderedTopics) {
    const all = groups.get(topic).sort((a, b) =>
      state.categoryIndex[a].name.localeCompare(state.categoryIndex[b].name)
    );
    // Cap per section so the big OG archive stays fast; search narrows further.
    const items = all.length > MAX_PER_SECTION ? all.slice(0, MAX_PER_SECTION) : all;

    const section = document.createElement('div');
    section.className = 'cat-section';

    const head = document.createElement('div');
    head.className = 'cat-section-head';
    const label = document.createElement('span');
    label.textContent = SECTION_LABELS[topic] || 'Other';
    const count = document.createElement('span');
    count.className = 'cat-section-count';
    count.textContent = all.length.toLocaleString();
    head.appendChild(label);
    head.appendChild(count);
    section.appendChild(head);

    const grid = document.createElement('div');
    grid.className = 'cat-section-grid';
    for (const idx of items) {
      const chip = document.createElement('button');
      chip.className = 'cat-chip' + (selectedSet.has(idx) ? ' selected' : '');
      chip.textContent = state.categoryIndex[idx].name;
      chip.title = state.categoryIndex[idx].name;
      chip.addEventListener('click', () => togglePickerCategory(idx));
      grid.appendChild(chip);
    }
    section.appendChild(grid);

    if (all.length > items.length) {
      const more = document.createElement('div');
      more.className = 'cat-section-more';
      more.textContent = `+${(all.length - items.length).toLocaleString()} more — search to narrow`;
      section.appendChild(more);
    }

    frag.appendChild(section);
  }

  rowsEl.innerHTML = '';
  rowsEl.appendChild(frag);
}

function updatePickerStatus() {
  const sel = state.pickerSelected.length;
  const hasFilter = !!(state.pickerFilter || pickerActiveSet || pickerActiveTag);
  $('picker-count').textContent = hasFilter
    ? `${sel}/6 selected · ${pickerFiltered.length.toLocaleString()} matching`
    : `${sel}/6 selected · ${(state.categoryIndex || []).length.toLocaleString()} total categories`;
  $('btn-clear-sel').classList.toggle('hidden', sel === 0);
}

function openCustomPicker() {
  state.pickerSelected = [];
  state.pickerFilter = '';
  pickerActiveSet = '';
  pickerActiveTag = '';
  pickerFiltered = [];
  $('category-search').value = '';
  buildSetBar();
  buildTagBar();
  renderSlots();
  renderVirtualScroll();
  updatePickerStatus();
  showScreen('custom-screen');
  $('category-search').focus();
}

function renderSlots() {
  const slots = $("slots");
  slots.innerHTML = "";
  for (let i = 0; i < 6; i++) {
    const el = document.createElement("div");
    el.className = "slot" + (state.pickerSelected[i] != null ? " filled" : "");
    const catIdx = state.pickerSelected[i];
    if (catIdx != null) {
      el.textContent = state.categoryIndex[catIdx].name;
      el.title = "Click to remove";
      el.addEventListener("click", () => {
        state.pickerSelected.splice(i, 1);
        renderSlots();
        renderCategoryList();
      });
    } else {
      el.innerHTML = `<span>Empty<br/>Slot ${i + 1}</span>`;
    }
    slots.appendChild(el);
  }
  const ready = state.pickerSelected.length === 6;
  $("btn-custom-start").disabled = !ready;
}

function renderCategoryList() {
  // Alias for callers that used the old name
  refilter();
}

function togglePickerCategory(index) {
  const pos = state.pickerSelected.indexOf(index);
  if (pos >= 0) {
    state.pickerSelected.splice(pos, 1);
  } else {
    if (state.pickerSelected.length >= 6) return;
    state.pickerSelected.push(index);
  }
  renderSlots();
  renderVirtualScroll(); // re-paint chips without re-filtering
  updatePickerStatus();
}

function randomizePicker() {
  // Draw only from the current filter (set + tag + search). With no filter
  // active, fall back to the entire library.
  const hasFilter = !!(state.pickerFilter || pickerActiveSet || pickerActiveTag);
  const pool = hasFilter
    ? pickerFiltered
    : state.categoryIndex.map((_, i) => i);
  if (!pool.length) return;
  const chosen = new Set();
  const target = Math.min(6, pool.length);
  while (chosen.size < target) {
    chosen.add(pool[Math.floor(Math.random() * pool.length)]);
  }
  state.pickerSelected = Array.from(chosen);
  renderSlots();
  renderVirtualScroll();
  updatePickerStatus();
}

// ---------- Wire up ----------
document.addEventListener("DOMContentLoaded", () => {
  $("btn-new-game").disabled = true;
  $("btn-custom-game").disabled = true;
  showScreen("start-screen");
  boot();

  $("btn-new-game").addEventListener("click", () => openTeamSetup("random"));
  $("episode-select").addEventListener("change", (e) => {
    const val = e.target.value;
    state.selectedBoard = val === "" ? null : state.boards[parseInt(val, 10)];
  });
  $("btn-custom-game").addEventListener("click", () => openTeamSetup("custom"));
  $("btn-team-back").addEventListener("click", () => showScreen("start-screen"));
  $("btn-team-continue").addEventListener("click", confirmTeamSetup);
  document.querySelectorAll(".team-count-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      teamSetupCount = parseInt(btn.dataset.count);
      highlightTeamCountBtn(teamSetupCount);
      renderTeamNameFields(teamSetupCount);
    });
  });
  $("btn-custom-back").addEventListener("click", () => showScreen("team-screen"));
  $("btn-custom-start").addEventListener("click", startCustomGame);
  $("btn-custom-random").addEventListener("click", randomizePicker);
  $("category-search").addEventListener("input", (e) => {
    // Search narrows on top of any active set/tag (all filters AND together).
    state.pickerFilter = e.target.value;
    refilter();
  });

  $("tag-toggle").addEventListener("click", () => {
    const wrap = $("tag-wrap");
    const collapsed = wrap.classList.toggle("collapsed");
    $("tag-toggle").setAttribute("aria-expanded", String(!collapsed));
  });

  $("category-list").addEventListener("scroll", () => {
    // Grouped view is static (no virtualization), so skip re-render on scroll.
    if (isGroupedMode()) return;
    if (pickerScrollRAF) cancelAnimationFrame(pickerScrollRAF);
    pickerScrollRAF = requestAnimationFrame(renderVirtualScroll);
  });

  $("btn-clear-sel").addEventListener("click", () => {
    state.pickerSelected = [];
    renderSlots();
    renderVirtualScroll();
    updatePickerStatus();
  });

  // "Play Again" returns to start screen so the user can choose mode again
  $("btn-play-again").addEventListener("click", () => showScreen("start-screen"));

  $("btn-show-answer").addEventListener("click", () => {
    stopClueTimer();
    $("clue-answer-wrap").classList.remove("hidden");
    $("btn-show-answer").classList.add("hidden");
    $("judge-buttons").classList.remove("hidden");
  });

  $("btn-correct").addEventListener("click", () => judge(true));
  $("btn-wrong").addEventListener("click", () => judge(false));
  $("btn-skip").addEventListener("click", () => judge(null));

  // Wager Enter key
  $("wager-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter") $("btn-submit-wager").click();
  });
  // Click outside score-adjust popup to close it
  document.addEventListener("click", (e) => {
    const popup = $("score-adjust-popup");
    if (!popup.classList.contains("hidden") &&
        !popup.contains(e.target) &&
        !e.target.closest(".team-card")) {
      closeScoreAdjust();
    }
  });

  // Escape closes modal only if answer already shown (prevents skipping)
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !$("clue-modal").classList.contains("hidden")) {
      if (!$("judge-buttons").classList.contains("hidden")) {
        judge(null);
      }
    }
  });
});
