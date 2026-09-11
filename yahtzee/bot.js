// One opponent, playing a decent game. Not an optimal solver -- those exist and
// they are miserable to play against, because they never make the loose,
// hopeful keep that makes a dice game fun to watch.
//
// How it thinks: for each of the 32 ways to hold a subset of five dice, roll
// the rest a few hundred times and see what the average turn is worth. Take
// the best. Same idea when choosing a box, minus the rolling.
//
// "Worth" is not just points. Three fives in the Fives box is worth more than
// the 15 it prints, because it drags you toward the 63 bonus; and putting a
// zero in Yahtzee is worth much less than the 0 it prints, because you have
// just thrown away the best box on the card.

import { CATEGORIES, UPPER, score, legalCategories, totals, UPPER_BONUS_AT } from "./rules.js";

// Roughly what an open box is worth if you keep it for later.
const POTENTIAL = {
  ones: 3, twos: 6, threes: 9, fours: 12, fives: 15, sixes: 18,
  threeKind: 22, fourKind: 24, fullHouse: 25,
  smallStraight: 30, largeStraight: 40, yahtzee: 50, chance: 22,
};

const d6 = () => 1 + Math.floor(Math.random() * 6);

// What this roll is worth if we stop now and use our best open box.
function turnValue(dice, card) {
  const legal = legalCategories(dice, card);
  let best = -Infinity;
  for (const cat of legal) best = Math.max(best, boxValue(cat, dice, card));
  return best === -Infinity ? 0 : best;
}

function boxValue(cat, dice, card) {
  const pts = score(cat, dice, card);
  let v = pts;

  // Upper boxes: measured against par, which is three of that face. Three
  // sixes is par; four is a windfall; two is a hole you have to fill later.
  const ui = UPPER.indexOf(cat);
  if (ui >= 0) {
    const face = ui + 1;
    const t = totals(card);
    const weight = t.upper >= UPPER_BONUS_AT ? 0.2 : 1.3;   // bonus already safe? relax
    v += (pts - 3 * face) * weight;
  }

  // Burning a box for nothing costs you the box, not just the points.
  if (pts === 0) v -= 0.55 * POTENTIAL[cat];

  return v;
}

// All 32 hold patterns over five dice.
const SUBSETS = (() => {
  const out = [];
  for (let m = 0; m < 32; m++)
    out.push([0, 1, 2, 3, 4].map((i) => !!(m & (1 << i))));
  return out;
})();

// Which dice to keep, given how many rolls are left after this decision.
export function chooseHolds(dice, rollsLeft, card, samples = 180) {
  if (rollsLeft <= 0) return [true, true, true, true, true];

  let bestHold = null, bestVal = -Infinity;
  for (const hold of SUBSETS) {
    const kept = dice.filter((_, i) => hold[i]);
    const toRoll = 5 - kept.length;

    let total = 0;
    for (let s = 0; s < samples; s++) {
      const trial = kept.slice();
      for (let k = 0; k < toRoll; k++) trial.push(d6());
      // A second roll still to come is worth a little more than this one shot
      // suggests, so nudge partial holds up slightly.
      total += turnValue(trial, card);
    }
    const avg = total / samples + (rollsLeft > 1 ? toRoll * 0.35 : 0);
    if (avg > bestVal) { bestVal = avg; bestHold = hold; }
  }
  return bestHold;
}

// Where to write the final roll.
export function chooseCategory(dice, card) {
  const legal = legalCategories(dice, card);
  let best = legal[0], bestVal = -Infinity;
  for (const cat of legal) {
    const v = boxValue(cat, dice, card);
    if (v > bestVal) { bestVal = v; best = cat; }
  }
  return best;
}

// A whole turn, as a plan the UI can play out one roll at a time.
export function planTurn() {
  return { rollsLeft: 3, held: [false, false, false, false, false] };
}
