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
// No cookies: PostHog keeps its ids in localStorage, so there is nothing to
// consent to and nothing is sent to the server on every request. Session
// replay masks everything typed into inputs, and doesn't record <canvas>
// drawing.
//
// person_profiles is "always" on purpose. With PostHog's default
// ("identified_only") a person profile is only created when you call
// posthog.identify() - and nothing here ever does, because nobody logs in. So
// every event was person-less, PostHog had no one to hang them on, and the
// whole site showed up as a single visitor wearing whichever device's
// properties it saw first. "always" gives each browser its own person.
//
// Your name (you.js / KmuftiYou) is sent as a person property, so the Persons
// list reads "Sir Pickle III" instead of a uuid. Point PostHog at it once:
// Project settings -> "Person display name" -> add `name` at the top.
//
// Deliberately NOT posthog.identify(name): names aren't unique and most are
// auto-generated, so every visitor who drew "someone's dad" would merge into
// one person - the exact bug this file used to have. The distinct id stays
// PostHog's own per-browser one; the name just hangs off it. `name_chosen`
// tells a name someone typed from one the dice dealt them.
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

  // Hand the person their name, and keep it current if they rename themselves
  // (including from another tab - you.js's onChange covers that).
  const sendName = (You) => {
    const put = () => window.posthog.setPersonProperties({
      name: You.name(),
      name_chosen: You.chosen(),
    });
    put();
    You.onChange(put);
  };

  // you.js isn't always there: this file is injected into <head> of every page
  // by nginx, while you.js is a <script> at the end of the pages that want it.
  // So look now, and once more after load for the pages where it comes later.
  const withYou = (fn) => {
    if (window.KmuftiYou) return fn(window.KmuftiYou);
    window.addEventListener("load", () => {
      if (window.KmuftiYou) fn(window.KmuftiYou);
    }, { once: true });
  };

  const s = document.createElement("script");
  s.src = "/ingest/static/array.js";
  s.async = true;
  s.onload = () => {
    window.posthog.init(KEY, {
      api_host: "/ingest",
      ui_host: "https://us.posthog.com",
      persistence: "localStorage",
      person_profiles: "always",
      session_recording: { maskAllInputs: true },
    });
    for (const [event, props] of queue.splice(0)) window.posthog.capture(event, props);
    withYou(sendName);
  };
  document.head.appendChild(s);
})();
