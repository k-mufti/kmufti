(function () {
  "use strict";

  /* =========================================================================
     The multiplayer ones (BOARD_GAMES in projects.js) on the hub: a window
     three tiles wide (one and a bit on phones) that scrolls sideways
     forever, so every one of them gets its own tile instead of hiding
     behind one "Game Board" tile. It sits in the tile grid as a band of its
     own, right after the AFTER tile's row.

     Infinite: the tiles are drawn three times over and the window starts on
     the middle set. Whenever a scroll settles in the first or last set, it
     jumps (invisibly) by one set's width back into the middle, so there's
     always more on both sides.
     ========================================================================= */

  const AFTER = "white-canvas";   // the band goes right after this tile
  const COPIES = 3;

  const apps = document.getElementById("apps");
  if (!apps || typeof BOARD_GAMES === "undefined" || !BOARD_GAMES.length) return;
  const games = BOARD_GAMES;

  /* ---------- a tile: a normal hub tile with a built cover --------------- */
  function tile(g) {
    const a = document.createElement("a");
    a.className = "app bg-tile";
    a.href = g.href;
    a.dataset.slug = g.slug;
    a.setAttribute("aria-label", g.title);
    a.title = g.title;
    // Its cover from artwork.js, like every other tile; failing that, one
    // built from its colours, name and picture (BOARD_GAMES in projects.js).
    const art = typeof ARTWORK !== "undefined" && ARTWORK[g.slug];
    if (art) {
      a.innerHTML = `<div class="app-art">${art}</div>`;
      return a;
    }
    a.innerHTML =
      `<div class="app-art"><div class="bg-cover ${g.cls}">` +
        `<div class="bg-words"><span class="bg-name"></span><span class="bg-tag"></span></div>` +
        `<div class="bg-pic">${g.art}</div>` +
      `</div></div>`;
    a.querySelector(".bg-name").textContent = g.title;
    a.querySelector(".bg-tag").textContent = g.tag;
    return a;
  }

  /* ---------- the band ---------------------------------------------------- */
  const band = document.createElement("section");
  band.className = "bg-window";
  band.dataset.look = "well";   // the sunken tray
  band.setAttribute("aria-label", "multiplayer");
  band.innerHTML = `
    <div class="bg-head"><span class="bg-label">multiplayer</span><span class="bg-rule" aria-hidden="true"></span></div>
    <div class="bg-frame">
      <button type="button" class="bg-arrow bg-prev" aria-label="scroll left">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>
      </button>
      <div class="bg-track"></div>
      <button type="button" class="bg-arrow bg-next" aria-label="scroll right">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>
      </button>
    </div>`;
  const track = band.querySelector(".bg-track");
  for (let c = 0; c < COPIES; c++) {
    games.forEach((g) => {
      const t = tile(g);
      if (c !== 1) { t.setAttribute("aria-hidden", "true"); t.tabIndex = -1; } // one real set for screen readers
      track.appendChild(t);
    });
  }

  // Right after the AFTER tile (or at the end if it's gone). Exposed so
  // layout mode (reorder.js) can put it back after shuffling tiles.
  function place() {
    const anchor = apps.querySelector(`:scope > .app[data-slug="${AFTER}"]`);
    if (anchor) anchor.after(band); else apps.appendChild(band);
  }
  window.placeBoardGames = place;
  place();

  /* ---------- scrolling --------------------------------------------------- */
  const tiles = [...track.children];
  const gap = () => parseFloat(getComputedStyle(track).columnGap) || 0;
  const step = () => tiles[0].getBoundingClientRect().width + gap();
  const setWidth = () => tiles[games.length].offsetLeft - tiles[0].offsetLeft;
  // The space before the first whole tile, where the previous one peeks in
  // (the track's scroll-padding, set in styles.css).
  const lead = () => parseFloat(getComputedStyle(track).scrollPaddingLeft) || 0;

  // Move without the smooth animation (for the invisible jumps).
  function jumpBy(dx) {
    track.style.scrollBehavior = "auto";
    track.style.scrollSnapType = "none";
    track.scrollLeft += dx;
    void track.offsetWidth;
    track.style.scrollSnapType = "";
    track.style.scrollBehavior = "";
  }
  // Keep the view inside the middle set.
  function recenter() {
    const w = setWidth();
    if (!w) return;
    if (track.scrollLeft < w * 0.5) jumpBy(w);
    else if (track.scrollLeft > w * 1.5) jumpBy(-w);
  }
  function start() {
    track.style.scrollBehavior = "auto";
    track.scrollLeft = setWidth() - lead();
    track.style.scrollBehavior = "";
  }

  band.querySelector(".bg-prev").onclick = () => track.scrollBy({ left: -step(), behavior: "smooth" });
  band.querySelector(".bg-next").onclick = () => track.scrollBy({ left: step(), behavior: "smooth" });

  // The mouse wheel steps the band one tile per flick while you're over
  // it. It only takes the wheel once you've actually moved the mouse onto
  // the band - if the page scrolls the band under a still cursor, the wheel
  // keeps scrolling the page, so nobody gets stuck on it on the way down.
  let armed = false, acc = 0, cool = 0;
  track.addEventListener("pointermove", (e) => { if (e.pointerType === "mouse") armed = true; });
  track.addEventListener("pointerleave", () => { armed = false; acc = 0; });
  track.addEventListener("wheel", (e) => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;   // sideways trackpad swipe: native
    if (!armed) return;
    e.preventDefault();
    const now = performance.now();
    if (now < cool) return;                                // one tile per flick
    acc += e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
    if (Math.abs(acc) < 30) return;
    track.scrollBy({ left: Math.sign(acc) * step(), behavior: "smooth" });
    acc = 0;
    cool = now + 380;
  }, { passive: false });

  // Recenter once a scroll has settled: `scrollend` where the browser has
  // it, otherwise a short pause in scroll events.
  if ("onscrollend" in window) {
    track.addEventListener("scrollend", recenter);
  } else {
    let idle = 0;
    track.addEventListener("scroll", () => {
      clearTimeout(idle);
      idle = setTimeout(recenter, 140);
    }, { passive: true });
  }

  // Keep the same tile at the left edge when the window changes size.
  let first = games.length;
  track.addEventListener("scroll", () => {
    const s = step();
    if (s) first = Math.round((track.scrollLeft + lead()) / s);
  }, { passive: true });
  addEventListener("resize", () => {
    track.style.scrollBehavior = "auto";
    track.scrollLeft = first * step() - lead();
    track.style.scrollBehavior = "";
    recenter();
  });

  // The first time most of the band is on screen, nudge it once.
  if ("IntersectionObserver" in window) {
    const seen = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      seen.disconnect();
      setTimeout(() => {
        band.classList.add("nudge");
        setTimeout(() => band.classList.remove("nudge"), 1200);
      }, 350);
    }, { threshold: 0.75 });
    seen.observe(band);
  }

  start();
  addEventListener("load", start);   // again once fonts and images have settled the sizes
  if (window.hubBadges) window.hubBadges();
})();
