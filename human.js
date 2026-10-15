// The "are you human" check (Cloudflare Turnstile), for pages that write to a
// backend. Load it before the page's own script:
//
//   <script src="/human.js?v=1"></script>
//
// and send protected writes through human.fetch() instead of fetch(). It's
// fetch with one extra step: if the server answers 401 (this browser hasn't
// passed the check yet), it runs the check and tries the request once more.
//
// The check starts in the background as soon as the page loads, so usually it
// is done before the first write. It's invisible unless Cloudflare wants a
// click, in which case a small box shows in the bottom corner. Passing it
// sets a cookie that lasts a day (see human/server.js).
(() => {
  "use strict";
  const API = "/human/api";
  let pending = null, running = false;

  function loadTurnstile() {
    if (window.turnstile) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      s.async = true;
      s.onload = resolve;
      s.onerror = () => reject(new Error("Turnstile didn't load"));
      document.head.appendChild(s);
    });
  }

  function box() {
    let el = document.getElementById("human-check");
    if (!el) {
      el = document.createElement("div");
      el.id = "human-check";
      el.style.cssText = "position:fixed;right:12px;bottom:12px;z-index:2147483647";
      document.body.appendChild(el);
    }
    return el;
  }

  // Resolves once this browser holds a good cookie, or the check is off.
  // A failure clears `pending`, so the next protected write tries again.
  function check(again) {
    if (pending && (running || !again)) return pending;
    running = true;
    pending = (async () => {
      const s = await fetch(API + "/status", { cache: "no-store" }).then((r) => r.json());
      if (!s.on || (s.human && !again)) return;
      await loadTurnstile();
      const token = await new Promise((resolve, reject) => {
        const id = window.turnstile.render(box(), {
          sitekey: s.sitekey,
          appearance: "interaction-only",
          callback: (t) => { window.turnstile.remove(id); resolve(t); },
          "error-callback": () => { window.turnstile.remove(id); reject(new Error("check failed")); },
        });
      });
      const r = await fetch(API + "/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (!r.ok) throw new Error("check failed");
    })()
      .catch((e) => { pending = null; throw e; })
      .finally(() => { running = false; });
    return pending;
  }

  async function humanFetch(url, opts) {
    if (pending) await pending.catch(() => {}); // a check under way: let it land first
    const r = await fetch(url, opts);
    if (r.status !== 401) return r;
    await check(true);
    return fetch(url, opts);
  }

  window.human = { fetch: humanFetch, check };
  const start = () => check().catch(() => { /* retried on the first protected write */ });
  if (document.body) start(); else document.addEventListener("DOMContentLoaded", start);
})();
