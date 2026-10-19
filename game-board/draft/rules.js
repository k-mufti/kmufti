// Draft's rules, shared by the server (which runs the draft) and the page
// (which keeps the bid buttons honest). An ES module, so both load the same
// file.
//
// 1v1: two players, the same money, five picks each. A random item comes
// up; one of you opens the bidding, the other raises or lets you have it,
// back and forth until someone lets it go.

export const PLAYERS = 2;
export const BUDGET = 20;          // dollars each
export const PICKS = 5;            // items each

export const SPIN_MS = 4800;       // the category reel (it lands with 1.5s to spare), then the first item
export const SOLD_MS = 2200;       // the "sold" moment before the next item
export const VOTE_MS = 10000;      // after the reel lands: keep it or respin, by majority (as often as you like)

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

// You can go all in: bid every dollar you have on one item. Run out of money
// and you keep whatever you've got - the empty spots stay empty.
export function maxBid(money, open) {
  if (open <= 0) return 0;
  return Math.max(0, money);
}
