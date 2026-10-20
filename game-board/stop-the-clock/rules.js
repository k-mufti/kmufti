// Stop the Clock's rules, shared by the server (which runs the turns) and
// the page (which runs your stopwatch). An ES module, so both load the
// same file.
//
// Each round has a target time. Players take turns: start the clock, then
// stop it as close to the target as you can - with no digits to look at.
// Closest in the round scores most. Five rounds, then the standings.

export const MIN_PLAYERS = 1;      // you can play alone; it's more fun with people
export const MAX_PLAYERS = 10;
export const ROUNDS = 5;

export const INTRO_MS = 3200;      // the round's target, big, before the first turn
export const START_SECS = 30;      // to tap Start on your turn (then you're skipped)
export const RESULT_MS = 4200;     // your time counting up, before the next turn
export const PERFECT_MS = 10;      // within this of the target is a perfect stop

// Targets, in seconds: a mix of round ones and tricky ones.
export const TARGETS = [1, 2, 3, 5, 7, 10, 12, 15, 20, 30, 1.5, 2.5, 4.44, 6.66, 7.77, 9.99, 11.11, 13.5, 3.33, 8.88];

// Points in a round: one for every player you beat, and a bonus for perfect.
export const PERFECT_BONUS = 3;

export const fmt = (ms) => (ms / 1000).toFixed(2);
export const fmtOff = (ms) => `${ms >= 0 ? "+" : "−"}${(Math.abs(ms) / 1000).toFixed(2)}s`;
