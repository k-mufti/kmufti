// Frequency's rules, shared by the server (which keeps score) and the page
// (which draws the dial). An ES module, so both load the very same file.
//
// The dial reads 0 (far left) to 180 (far right), in degrees round the
// semicircle. The target is one gradient wedge, SPREAD degrees wide: 5
// points dead centre, sliding evenly down to 1 at its edges, to a tenth of a
// point - so a round can score 3.4, or 4.7. Outside it scores nothing.

export const SPREAD = 35;            // the whole target, in degrees
export const BAND = SPREAD / 5;      // kept for the drawing's proportions
export const WIN = 10;               // first team to 10 wins (teams game)
export const COOP_CARDS = 7;         // cards in the co-op deck
export const MAX = 5, MIN = 1;
export const PERFECT = 4.5;          // this close to 5 counts as a perfect signal

export const round1 = (x) => Math.round(x * 10) / 10;

// How many points a needle at `needle` earns against a target centred on
// `target`. Exactly on the edge still scores the 1.
export function score(needle, target) {
  const d = Math.abs(needle - target), half = SPREAD / 2;
  if (d > half) return 0;
  return round1(MAX - (MAX - MIN) * (d / half));
}

// A score's tier, for the words and colours: 4 perfect, 3 good, 2 weak, 0 none.
export function tier(points) {
  if (points >= PERFECT) return 4;
  if (points >= 3) return 3;
  if (points > 0) return 2;
  return 0;
}

// Which side of the needle the target's centre is on, as the other team
// would have to call it. Dead on the needle is neither.
export function sideOf(needle, target) {
  if (target < needle) return "left";
  if (target > needle) return "right";
  return null;
}

// A co-op game's final total, read off a scale.
export function coopRating(points) {
  if (points >= 28) return "Of one mind. Are you the same person?";
  if (points >= 24) return "Tuned in. Genuinely spooky.";
  if (points >= 20) return "On the same frequency.";
  if (points >= 16) return "Mostly in sync.";
  if (points >= 12) return "Some static on the line.";
  if (points >= 9) return "Crossed wires.";
  if (points >= 5) return "Did you two just meet?";
  return "Were you even playing the same game?";
}

// Clamp a dial reading into range, and refuse anything that isn't a number.
export function clampAngle(a) {
  a = Number(a);
  if (!Number.isFinite(a)) return null;
  return Math.min(180, Math.max(0, a));
}
