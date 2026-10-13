// Wavelenght's rules, shared by the server (which keeps score) and the page
// (which draws the dial). An ES module, so both load the very same file.
//
// The dial reads 0 (far left) to 180 (far right), in degrees round the
// semicircle. The target is five bands side by side - 2, 3, 4, 3, 2 - each
// BAND degrees wide, so the 4 sits in the middle.

export const BAND = 7;               // degrees per band; the whole target is 35
export const WIN = 10;               // first team to 10 wins (teams game)
export const COOP_CARDS = 7;         // cards in the co-op deck
export const POINTS = [2, 3, 4, 3, 2];

// How many points a needle at `needle` earns against a target centred on
// `target`. Exactly on a band edge counts as the better band.
export function score(needle, target) {
  const d = Math.abs(needle - target);
  if (d <= BAND / 2) return 4;
  if (d <= BAND * 1.5) return 3;
  if (d <= BAND * 2.5) return 2;
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
  if (points >= 22) return "Of one mind. Are you the same person?";
  if (points >= 19) return "Tuned in. Genuinely spooky.";
  if (points >= 16) return "On the same wavelength.";
  if (points >= 13) return "Mostly in sync.";
  if (points >= 10) return "Some static on the line.";
  if (points >= 7) return "Crossed wires.";
  if (points >= 4) return "Did you two just meet?";
  return "Were you even playing the same game?";
}

// Clamp a dial reading into range, and refuse anything that isn't a number.
export function clampAngle(a) {
  a = Number(a);
  if (!Number.isFinite(a)) return null;
  return Math.min(180, Math.max(0, a));
}
