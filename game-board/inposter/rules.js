// Inposter's rules, shared by the server (which deals and scores) and the
// page (which explains them). An ES module, so both load the same file.

export const MIN_PLAYERS = 3;
export const MAX_PLAYERS = 12;

// Points, per round.
export const POINTS = {
  crewCatch: 1,        // every crewmate, when the inposter is caught
  crewSharp: 1,        // and one more for each crewmate who voted for them
  inposterEscape: 3,   // the inposter, when the crew votes out someone else
  inposterSteal: 3,    // the inposter, when caught but they guess the word
  nobodyRight: 2,      // a round with no inposter: each who voted "nobody"
};

// The settings a host can change, with their choices and defaults.
export const SETTINGS = {
  mode: { choices: ["classic", "undercover"], def: "classic" },
  clues: { choices: ["typed", "spoken"], def: "typed" },
  rounds: { choices: [1, 2, 3], def: 2 },
  talk: { choices: [45, 90, 150], def: 90 },        // seconds to discuss
  hint: { choices: ["category", "none"], def: "category" },
  chaos: { choices: [false, true], def: false },     // sometimes nobody's the inposter
  cats: { def: [] },                                 // [] means every category
};

export const TURN_SECS = 40;       // to give a typed clue
export const VOTE_SECS = 40;
export const GUESS_SECS = 40;
export const CHAOS_ODDS = 0.18;    // with chaos on, the chance of no inposter

// Words compared loosely: case, spaces, punctuation and a plural "s" don't
// count, and one slip of the finger is forgiven in a longer word.
export function norm(s) {
  return String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "").replace(/^(.{3,}?)(es|s)$/, "$1");
}
function distance(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  return d[a.length][b.length];
}
export function sameWord(guess, word) {
  const g = norm(guess), w = norm(word);
  if (!g || !w) return false;
  if (g === w) return true;
  return w.length >= 5 && distance(g, w) <= 1;
}

// A clue may not give the word away by saying it: no word of the clue may
// be the secret word (or contain a longer one), and a two-word secret can't
// appear whole.
export function givesItAway(clue, word) {
  const w = norm(word);
  if (!w) return false;
  if (/\s/.test(String(word).trim()) && norm(clue).includes(w)) return true;
  for (const t of String(clue || "").split(/[\s\-_/]+/)) {
    const c = norm(t);
    if (!c) continue;
    if (sameWord(t, word) || (w.length >= 4 && c.includes(w))) return true;
  }
  return false;
}
