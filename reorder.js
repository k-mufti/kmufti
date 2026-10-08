(function () {
  "use strict";

  /* =========================================================================
     Layout mode, for trying out tile orders. Local only: it does nothing
     unless the page is served from localhost, so it's inert on kmufti.com.

     Drag tiles to rearrange them (mouse or touch). The order is remembered
     in this browser (localStorage) across reloads; the panel in the corner
     shows it, copies it, resets it, and turns layout mode off so the tiles
     open their projects again. To make an order permanent, reorder
     PROJECTS in projects.js to match.
     ========================================================================= */

  if (!/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname)) return;

  const KEY = "kmufti-hub-order";
  const apps = document.getElementById("apps");
  if (!apps || typeof PROJECTS === "undefined") return;

  // app.js builds the tiles in PROJECTS order; label each with its slug
  const tiles = [...apps.children];
  tiles.forEach((el, i) => { if (PROJECTS[i]) el.dataset.slug = PROJECTS[i].slug; });
  const defaultOrder = PROJECTS.map((p) => p.slug);

  const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) { return null; } };
  const write = (o) => { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) { /* private mode */ } };
  const current = () => [...apps.children].map((el) => el.dataset.slug).filter(Boolean);

  function apply(order) {
    const bySlug = new Map([...apps.children].map((el) => [el.dataset.slug, el]));
    for (const slug of order) { const el = bySlug.get(slug); if (el) { apps.appendChild(el); bySlug.delete(slug); } }
    for (const el of bySlug.values()) apps.appendChild(el);   // anything new goes last
  }
  const saved = read();
  if (saved) apply(saved);

  // ---------- the panel ----------
  const css = document.createElement("style");
  css.textContent = `
    .reorder-panel { position: fixed; right: 16px; bottom: 16px; z-index: 1000; width: 250px;
      background: #111; color: #eee; border-radius: 12px; padding: 12px 14px 12px;
      font: 12px/1.5 "JetBrains Mono", ui-monospace, monospace; box-shadow: 0 10px 30px rgba(0,0,0,.3); }
    .reorder-panel h4 { margin: 0 0 6px; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #9f9; font-weight: 500; }
    .reorder-panel ol { margin: 6px 0 10px; padding-left: 20px; color: #ccc; }
    .reorder-panel .row { display: flex; gap: 6px; flex-wrap: wrap; }
    .reorder-panel button { font: inherit; font-size: 11px; background: #2a2a2a; color: #eee; border: 1px solid #444;
      border-radius: 6px; padding: 4px 8px; cursor: pointer; }
    .reorder-panel button:hover { background: #3a3a3a; }
    .reorder-panel .hint { color: #888; font-size: 11px; margin: 0; }
    body.reordering #apps .app { cursor: grab; }
    body.reordering #apps .app * { pointer-events: none; }
    #apps .app.reorder-ghost { opacity: .35; }
    #apps .app.reorder-chosen { transform: scale(1.03); }
    #apps .app.reorder-drag { cursor: grabbing; }
  `;
  document.head.appendChild(css);

  const panel = document.createElement("div");
  panel.className = "reorder-panel";
  panel.innerHTML = `
    <h4>layout mode · local only</h4>
    <p class="hint">drag the tiles. the order is remembered in this browser.</p>
    <ol></ol>
    <div class="row">
      <button data-act="copy">copy order</button>
      <button data-act="reset">reset</button>
      <button data-act="toggle">off</button>
    </div>`;
  document.body.appendChild(panel);
  const list = panel.querySelector("ol"), toggleBtn = panel.querySelector('[data-act="toggle"]');
  const titleOf = new Map(PROJECTS.map((p) => [p.slug, p.title]));
  function showOrder() {
    list.innerHTML = current().map((s) => `<li>${titleOf.get(s) || s}</li>`).join("");
  }
  showOrder();

  let on = true;
  document.body.classList.add("reordering");
  panel.addEventListener("click", async (e) => {
    const act = e.target.dataset.act;
    if (act === "copy") {
      const text = current().map((s, i) => `${i + 1}. ${titleOf.get(s) || s} (${s})`).join("\n");
      try { await navigator.clipboard.writeText(text); e.target.textContent = "copied"; }
      catch (err) { prompt("Copy this:", text); }
      setTimeout(() => (e.target.textContent = "copy order"), 1200);
    } else if (act === "reset") {
      try { localStorage.removeItem(KEY); } catch (err) { /* ignore */ }
      apply(defaultOrder);
      showOrder();
    } else if (act === "toggle") {
      on = !on;
      document.body.classList.toggle("reordering", on);
      sortable?.option("disabled", !on);
      toggleBtn.textContent = on ? "off" : "on";
    }
  });

  // While rearranging, a tile is something to move, not a link to follow.
  apps.addEventListener("click", (e) => { if (on && e.target.closest(".app")) e.preventDefault(); }, true);

  // ---------- dragging (SortableJS) ----------
  let sortable = null;
  const s = document.createElement("script");
  s.src = "https://cdn.jsdelivr.net/npm/sortablejs@1.15.3/Sortable.min.js";
  s.onload = () => {
    sortable = new Sortable(apps, {
      animation: 180,
      ghostClass: "reorder-ghost",
      chosenClass: "reorder-chosen",
      dragClass: "reorder-drag",
      onEnd() { write(current()); showOrder(); },
    });
  };
  document.head.appendChild(s);
})();
