// Frequency comes in two looks: the original (Wavelenght, the default) and
// the new one (Frequency). Both are pages onto the same rooms, so switching
// keeps you in your game - the server puts you back in your room when the
// other page says hello. The pick is remembered on this device.
export const KEY = "game-board-theme";
export function goTheme(which) {
  try { localStorage.setItem(KEY, which); } catch { /* fine: it just won't stick */ }
  location.href = (which === "new" ? "../frequency/" : "../wavelenght/") + location.search + location.hash;
}
