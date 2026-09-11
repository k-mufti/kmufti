// Yahtzee, the rules only. No dice, no DOM, no opponent -- give it five
// numbers and a scorecard and it tells you what things are worth.
//
// Kept separate on purpose: the server has to score moves too, and it cannot
// import a file that reaches for `document`. Same file runs in both.

export const UPPER = ["ones", "twos", "threes", "fours", "fives", "sixes"];
export const LOWER = [
  "threeKind", "fourKind", "fullHouse",
  "smallStraight", "largeStraight", "yahtzee", "chance",
];
export const CATEGORIES = [...UPPER, ...LOWER];

export const LABELS = {
  ones: "Aces", twos: "Twos", threes: "Threes",
  fours: "Fours", fives: "Fives", sixes: "Sixes",
  threeKind: "Three of a kind", fourKind: "Four of a kind",
  fullHouse: "Full house", smallStraight: "Small straight",
  largeStraight: "Large straight", yahtzee: "YAHTZEE", chance: "Chance",
};

export const HINTS = {
  ones: "Count and add only aces", twos: "Count and add only twos",
  threes: "Count and add only threes", fours: "Count and add only fours",
  fives: "Count and add only fives", sixes: "Count and add only sixes",
  threeKind: "Add all dice", fourKind: "Add all dice",
  fullHouse: "25", smallStraight: "Four in a row — 30",
  largeStraight: "Five in a row — 40", yahtzee: "Five alike — 50",
  chance: "Add all dice",
};

export const UPPER_BONUS_AT = 63;
export const UPPER_BONUS = 35;
export const YAHTZEE_BONUS = 100;

export function emptyCard() {
  const card = { yahtzeeBonuses: 0 };
  for (const c of CATEGORIES) card[c] = null;
  return card;
}

const counts = (dice) => {
  const c = [0, 0, 0, 0, 0, 0, 0];
  for (const d of dice) c[d]++;
  return c;
};
const sum = (dice) => dice.reduce((a, b) => a + b, 0);

export const isYahtzee = (dice) => dice.length === 5 && counts(dice).some((n) => n === 5);

// The joker rule only switches on once the Yahtzee box has been used -- with a
// 50 in it or with a zero. Rolling a second Yahtzee before then is just a
// Yahtzee, and you score it as one.
export const jokerActive = (dice, card) => isYahtzee(dice) && card.yahtzee !== null;

export function score(cat, dice, card = null) {
  const c = counts(dice);
  const joker = card ? jokerActive(dice, card) : false;

  switch (cat) {
    case "ones": case "twos": case "threes":
    case "fours": case "fives": case "sixes": {
      const face = UPPER.indexOf(cat) + 1;
      return c[face] * face;
    }
    case "threeKind":
      return c.some((n) => n >= 3) || joker ? sum(dice) : 0;
    case "fourKind":
      return c.some((n) => n >= 4) || joker ? sum(dice) : 0;
    case "fullHouse":
      // Officially five alike is NOT a full house on its own -- it only counts
      // as one through the joker rule, once Yahtzee is already used up.
      if (joker) return 25;
      return c.includes(3) && c.includes(2) ? 25 : 0;
    case "smallStraight": {
      if (joker) return 30;
      const has = (a, b, c2, d) => c[a] && c[b] && c[c2] && c[d];
      return has(1, 2, 3, 4) || has(2, 3, 4, 5) || has(3, 4, 5, 6) ? 30 : 0;
    }
    case "largeStraight": {
      if (joker) return 40;
      const run = (s) => [0, 1, 2, 3, 4].every((k) => c[s + k]);
      return run(1) || run(2) ? 40 : 0;
    }
    case "yahtzee":
      return isYahtzee(dice) ? 50 : 0;
    case "chance":
      return sum(dice);
    default:
      throw new Error("unknown category " + cat);
  }
}

// Which boxes this roll is actually allowed to go in. Almost always "any open
// one" -- the exception is a joker, which is forced into its own upper box if
// that box is still free.
export function legalCategories(dice, card) {
  const open = CATEGORIES.filter((c) => card[c] === null);
  if (!jokerActive(dice, card)) return open;

  const own = UPPER[dice[0] - 1];
  if (card[own] === null) return [own];                 // forced
  const lower = LOWER.filter((c) => card[c] === null);
  return lower.length ? lower : open;                   // else any lower, else eat a zero
}

// Does scoring this roll here also earn the 100-point bonus chip?
export const earnsYahtzeeBonus = (dice, card) =>
  isYahtzee(dice) && card.yahtzee === 50;

export function applyScore(card, cat, dice) {
  const next = { ...card };
  if (earnsYahtzeeBonus(dice, card)) next.yahtzeeBonuses = card.yahtzeeBonuses + 1;
  next[cat] = score(cat, dice, card);
  return next;
}

export function totals(card) {
  const upper = UPPER.reduce((a, c) => a + (card[c] ?? 0), 0);
  const bonus = upper >= UPPER_BONUS_AT ? UPPER_BONUS : 0;
  const lower = LOWER.reduce((a, c) => a + (card[c] ?? 0), 0);
  const yb = card.yahtzeeBonuses * YAHTZEE_BONUS;
  return {
    upper, bonus, lower, yahtzeeBonus: yb,
    upperTotal: upper + bonus,
    grand: upper + bonus + lower + yb,
    toBonus: Math.max(0, UPPER_BONUS_AT - upper),
  };
}

export const isComplete = (card) => CATEGORIES.every((c) => card[c] !== null);
