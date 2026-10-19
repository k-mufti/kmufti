// Wavelength is the original look of the same game Frequency plays: the
// server keeps one set of rules (../frequency/rules.js), so a room can mix
// players on either look. This page only needs what draws the dial.
export { BAND, tier } from "../frequency/rules.js?v=3";
export const POINTS = [1, 3, 5, 3, 1];     // what each band is worth, roughly: it slides from 5 to 1
