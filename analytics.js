// PostHog analytics for every page on kmufti.com.
//
// Nothing in the repo loads this: nginx adds the <script> tag to every HTML
// page it serves (sub_filter in `location /`, see deploy/nginx.conf), so new
// pages get it for free, local copies of the site send nothing, and the
// private /admin/ page never has it.
//
// PostHog itself is fetched through our own domain (/ingest/ is proxied to
// PostHog by nginx), so ad blockers that block posthog.com still let it
// through.
//
// No cookies: PostHog keeps its ids in sessionStorage, so a visit lasts until
// the tab is closed and a returning visitor is a new one. Session replay masks
// everything typed into inputs, and doesn't record <canvas> drawing.
//
// Custom events, from any page's own script:
//
//   window.track?.("puzzle_finished", { pieces: 500 });
//
// The ?. keeps it a no-op where this file isn't loaded (local copies). Calls
// made before PostHog has loaded are queued and sent once it has.
(() => {
  "use strict";
  const KEY = "phc_pPezMoHcC7wMP3FKJWkwERcHVfGnjx3e4ceuFDECKctL"; // public by design
  const queue = [];

  window.track = (event, props) => {
    if (window.posthog && window.posthog.__loaded) window.posthog.capture(event, props);
    else queue.push([event, props]);
  };

  const s = document.createElement("script");
  s.src = "/ingest/static/array.js";
  s.async = true;
  s.onload = () => {
    window.posthog.init(KEY, {
      api_host: "/ingest",
      ui_host: "https://us.posthog.com",
      persistence: "sessionStorage",
      person_profiles: "identified_only",
      session_recording: { maskAllInputs: true },
    });
    for (const [event, props] of queue.splice(0)) window.posthog.capture(event, props);
  };
  document.head.appendChild(s);
})();
