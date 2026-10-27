(function () {
  "use strict";

  /* =========================================================================
     Cover picker, for trying out cover art. Local only: it does nothing
     unless the page is served from localhost, so it's inert on kmufti.com.

     Puts arrows on a tile's cover to flip through candidate covers (the
     one artwork.js has now, then each file in COVERS). The pick is
     remembered in this browser (localStorage). To make one permanent, point
     that tile's entry in artwork.js at the file.
     ========================================================================= */

  if (!/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname)) return;

  const COVERS = {
    bust: [
      ["before / after", "bust/covers/split.jpg"],
      ["mob portrait", "bust/covers/mob.jpg"],
      ["laser-carved", "bust/covers/laser.jpg"],
      ["chain letters", "bust/covers/chain.jpg"],
    ],
  };

  const apps = document.getElementById("apps");
  if (!apps || typeof PROJECTS === "undefined") return;

  const css = document.createElement("style");
  css.textContent = `
    .cover-pick { position: absolute; left: 50%; top: 10px; transform: translateX(-50%); z-index: 5;
      display: flex; align-items: center; gap: 4px; padding: 3px; border-radius: 999px;
      background: rgba(17,17,17,.82); color: #eee; font: 11px/1 "JetBrains Mono", ui-monospace, monospace;
      white-space: nowrap; box-shadow: 0 4px 14px rgba(0,0,0,.3); }
    .cover-pick button { font: inherit; font-size: 13px; width: 24px; height: 24px; border-radius: 50%;
      border: 0; background: #2a2a2a; color: #eee; cursor: pointer; }
    .cover-pick button:hover { background: #444; }
    .cover-pick span { padding: 0 6px; min-width: 110px; text-align: center; }
    .app-art.has-pick { position: relative; }
  `;
  document.head.appendChild(css);

  PROJECTS.forEach((p) => {
    const list = COVERS[p.slug];
    if (!list) return;
    const tile = [...apps.querySelectorAll(".app")].find((el) => el.getAttribute("href") === p.href);
    const art = tile?.querySelector(".app-art");
    if (!art) return;
    const options = [["current", null, art.innerHTML], ...list];
    const key = "kmufti-hub-cover-" + p.slug;
    let i = 0;
    try { i = Math.max(0, options.findIndex((o) => o[0] === localStorage.getItem(key))); } catch (e) { /* private mode */ }

    art.classList.add("has-pick");
    const bar = document.createElement("div");
    bar.className = "cover-pick";
    bar.innerHTML = `<button data-d="-1" aria-label="previous cover">‹</button><span></span><button data-d="1" aria-label="next cover">›</button>`;
    const label = bar.querySelector("span");

    function show() {
      const [name, src, html] = options[i];
      art.innerHTML = html || `<img src="${src}?v=${Date.now()}" alt="" />`;
      art.appendChild(bar);
      label.textContent = `${name} · ${i + 1}/${options.length}`;
      try { localStorage.setItem(key, name); } catch (e) { /* private mode */ }
    }
    // the arrows flip covers; they don't open the project
    bar.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const d = Number(e.target.dataset.d);
      if (!d) return;
      i = (i + d + options.length) % options.length;
      show();
    });
    show();
  });
})();
