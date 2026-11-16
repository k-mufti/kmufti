/* =========================================================================
   presence.js — tells the hub someone's here, so its tile can say
   "1 active user". Load it on a project page with the tile's slug:

     <script src="../presence.js" data-slug="jeopardy" defer></script>

   Sends a tiny heartbeat every 20s while the tab is visible, and a "leaving"
   note when the tab is hidden or closed. The id is a random string kept in
   this browser (so several tabs count as one person) — no name, nothing
   else. Counted by the Jigsaw backend, in memory only; if it's down,
   nothing here notices.
   ========================================================================= */
(function () {
  "use strict";
  const me = document.currentScript;
  const slug = me && me.dataset.slug;
  if (!slug) return;

  const URL_ = "/puzzle/api/presence";
  const KEY = "kmufti-presence-id";
  let id = "";
  try { id = localStorage.getItem(KEY) || ""; } catch {}
  if (!/^[A-Za-z0-9_-]{4,40}$/.test(id)) {
    id = "p" + Math.random().toString(36).slice(2, 12) + Date.now().toString(36);
    try { localStorage.setItem(KEY, id); } catch {}
  }

  function beat() {
    fetch(URL_, { method: "POST", body: JSON.stringify({ slug, id }), keepalive: true })
      .catch(() => {});
  }
  function leave() {
    const body = JSON.stringify({ slug, id, leave: true });
    if (!(navigator.sendBeacon && navigator.sendBeacon(URL_, body))) {
      fetch(URL_, { method: "POST", body, keepalive: true }).catch(() => {});
    }
  }

  let timer = null;
  function start() {
    if (timer) return;
    beat();
    timer = setInterval(beat, 20000);
  }
  function stop() {
    if (!timer) return;
    clearInterval(timer);
    timer = null;
    leave();
  }

  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
  window.addEventListener("pagehide", stop);
  window.addEventListener("pageshow", () => { if (!document.hidden) start(); });
  if (!document.hidden) start();
})();
