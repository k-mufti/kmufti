// Imposter's rules, shared by the server (which deals and scores) and the
// page (which explains them). An ES module, so both load the same file.

export const MIN_PLAYERS = 3;
export const MAX_PLAYERS = 12;

// Points, per round.
export const POINTS = {
  crewCatch: 1,        // every crewmate, when the imposter is caught
  crewSharp: 1,        // and one more for each crewmate who voted for them
  imposterEscape: 3,   // the imposter, when the crew votes out someone else
  imposterSteal: 3,    // the imposter, when caught but they guess the word
};

// One way to play, no settings: the imposter gets no word but knows the
// category, clues are typed, three clue rounds (or fewer, if enough of you
// vote early), then 90 seconds to talk it out.
export const ROUNDS = 3;
export const TALK_SECS = 90;
export const SPIN_MS = 4800;       // the category reel, landing with 1.5s to spare
export const RESPIN_MS = 10000;    // after it lands: keep it or spin again, by majority

// Keeping or respinning the category takes a majority: more than half of
// the players (both of two). If the clock runs out first, whichever side
// has more votes wins, and a tie keeps it.
export const majority = (n) => Math.floor(n / 2) + 1;
export function spinOutcome(votes, n, timeUp) {
  const respin = votes.filter((v) => v === "respin").length;
  const keep = votes.filter((v) => v === "keep").length;
  if (respin >= majority(n)) return "respin";
  if (keep >= majority(n)) return "keep";
  if (timeUp) return respin > keep ? "respin" : "keep";
  return null;
}

export const TURN_SECS = 40;       // to give a typed clue
export const VOTE_SECS = 40;
export const GUESS_SECS = 40;
export const VOTE_EARLY = 0.75;    // this share of the round tapping "vote now" skips straight to the vote
export const voteNeed = (n) => Math.max(1, Math.ceil(n * VOTE_EARLY));

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
