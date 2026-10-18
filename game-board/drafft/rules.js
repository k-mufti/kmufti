// Drafft's rules, shared by the server (which runs the draft) and the page
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
export const VOTE_MS = 8000;       // after the reel lands: keep it, or both vote to respin (as often as you like)

// You can go all in: bid every dollar you have on one item. Run out of money
// and you keep whatever you've got - the empty spots stay empty.
export function maxBid(money, open) {
  if (open <= 0) return 0;
  return Math.max(0, money);
}
