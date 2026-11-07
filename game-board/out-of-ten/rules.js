// Out of Ten's rules, shared by the server (which runs the rounds) and the
// page (which explains them). An ES module, so both load the same file.
//
// One player sits in the middle and doesn't know the number (0-10).
// Everyone else does. The one in the middle throws a prompt card ("Fast
// food") at someone, who has 30 seconds to answer with something that's
// that number out of ten ("Panda Express" for a 2). After each answer the
// one in the middle says where they're at ("I'm at a 7"). Every player in
// the ring gets one card a round; the read after the last answer is the
// final guess. Then the next player sits in the middle.

export const MIN_PLAYERS = 3;
export const MAX_PLAYERS = 10;
export const LOW = 0, HIGH = 10;
export const START_READ = 5;       // where the one in the middle starts, before any answer

export const DEAL_SECS = 5;        // the number goes round the ring
export const THROW_SECS = 45;      // the one in the middle: pick a card and who gets it
export const ANSWER_SECS = 30;     // whoever caught it
export const READ_SECS = 30;       // the one in the middle: "I'm at a..."

export const POINTS = {
  closer: 2,                       // your answer moved their read closer (or kept it spot on)
  exact: 5,                        // the one in the middle, final guess spot on
  everyone: 1,                     // ...and everyone in the ring gets this too
};

export const PROMPT_MAX = 50;      // a card the one in the middle writes
export const ANSWER_MAX = 60;
export const DRAW = 3;             // prompt cards on offer each throw

// Did this read get closer? Spot on and staying spot on counts.
export function closer(before, after, target) {
  const a = Math.abs(after - target), b = Math.abs(before - target);
  return a < b || a === 0;
}
