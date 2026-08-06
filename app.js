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

  /* ---------- The DVD screensaver -----------------------------------------
     Constant velocity, perfect reflections off the viewport edges, and a new
     colour on every wall hit. It rides behind the mounting board, so it slides
     under the tiles and reappears on the other side.
     Hitting an exact corner is, as ever, the whole point. */
  const dvd = document.getElementById("dvd");
  const dvdText = document.getElementById("dvd-text");
  if (dvd) {
    // The canvas palette, so the logo belongs to the rest of the site.
    const COLORS = [
      "#fb0000", "#ff4400", "#ffaf0d", "#ffde00", "#bbff00", "#62d42d",
      "#075327", "#34dcd3", "#1caffd", "#003eff", "#6400ff", "#ff8bf6",
      "#ff00b7", "#898989",
    ];

    const SPEED = 96;            // px per second, like the real thing: slow
    let ci = (Math.random() * COLORS.length) | 0;
    let w = 0, h = 0, W = 0, H = 0;
    let x = 0, y = 0;
    let vx = SPEED, vy = SPEED;
    let corners = 0;

    function measure() {
      const r = dvd.getBoundingClientRect();
      w = r.width || 150; h = r.height || 44;
      // Fall back through to sane numbers so a zero-sized viewport (some
      // embedded/offscreen contexts report 0) can't collapse the bounds.
      W = window.innerWidth || document.documentElement.clientWidth || 1024;
      H = window.innerHeight || document.documentElement.clientHeight || 768;
      x = Math.min(x, Math.max(0, W - w));
      y = Math.min(y, Math.max(0, H - h));
    }

    function recolor() {
      ci = (ci + 1 + ((Math.random() * (COLORS.length - 1)) | 0)) % COLORS.length;
      dvd.style.color = COLORS[ci];
    }

    measure();
    x = Math.random() * Math.max(1, W - w);
    y = Math.random() * Math.max(1, H - h);
    vx = Math.random() < 0.5 ? -SPEED : SPEED;
    vy = Math.random() < 0.5 ? -SPEED : SPEED;
    dvd.style.color = COLORS[ci];

    let last = 0;
    function step(ts) {
      if (!last) last = ts;
      const dt = Math.min(64, ts - last) / 1000; // clamp so tab-switches don't teleport it
      last = ts;

      x += vx * dt;
      y += vy * dt;

      let hitX = false, hitY = false;
      const maxX = Math.max(0, W - w);
      const maxY = Math.max(0, H - h);

      if (x <= 0) { x = 0; vx = Math.abs(vx); hitX = true; }
      else if (x >= maxX) { x = maxX; vx = -Math.abs(vx); hitX = true; }

      if (y <= 0) { y = 0; vy = Math.abs(vy); hitY = true; }
      else if (y >= maxY) { y = maxY; vy = -Math.abs(vy); hitY = true; }

      if (hitX || hitY) recolor();
      if (hitX && hitY) {
        // A true corner. Mark the occasion.
        corners++;
        console.log(`%c★ CORNER HIT #${corners}`, "font-weight:700;font-size:14px");
        dvdText.classList.remove("corner");
        void dvdText.offsetWidth; // restart the animation
        dvdText.classList.add("corner");
      }

      dvd.style.transform = `translate(${x}px, ${y}px)`;
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);

    let rz = null;
    window.addEventListener("resize", () => {
      clearTimeout(rz);
      rz = setTimeout(measure, 120);
    });
  }
})();
