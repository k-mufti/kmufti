(function () {
  "use strict";

  /* =========================================================================
     kmufti.com — the app launcher. Tiles are injected from projects.js, with
     optional per-app cover art from artwork.js.

     The shared pixel canvas that used to sit behind these tiles now lives on
     as its own project: white-canvas/ (backed by draw/server.js).
     ========================================================================= */

  const appsWrap = document.getElementById("apps");
  const projects = typeof PROJECTS !== "undefined" ? PROJECTS : [];

  projects.forEach((p) => {
    const live = p.status !== "soon";
    const el = document.createElement(live ? "a" : "div");
    el.className = "app" + (live ? "" : " soon");
    if (live) el.href = p.href;

    const art = document.createElement("div");
    art.className = "app-art";
    const custom = (typeof ARTWORK !== "undefined" && ARTWORK[p.slug]) ? ARTWORK[p.slug] : null;
    art.innerHTML = custom
      || `<div class="app-art-fallback" style="background:${p.accentBg || "#111"}">${p.title.charAt(0)}</div>`;

    const label = document.createElement("div");
    label.className = "app-label";
    label.textContent = p.title;

    el.appendChild(art);
    el.appendChild(label);

    if (!live) {
      const sub = document.createElement("div");
      sub.className = "app-sub";
      sub.textContent = "soon";
      el.appendChild(sub);
    }

    appsWrap.appendChild(el);
  });
})();
