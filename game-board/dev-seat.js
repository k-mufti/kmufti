/* =========================================================================
   Test seats - play every side of a Game Board game yourself, on localhost.

   Only does anything on localhost / 127.0.0.1; on kmufti.com it returns at
   the first line. Every game page loads it right after you.js and before
   its own app.js.

   On a game's home screen it adds a "Test solo" button that opens
   ../dev.html, the test bench: the same game several times side by side,
   one frame per player. Inside a frame (?seat=N) this script:
     - gives the frame its own player id, so the server sees N different
       people (the games keep their id in localStorage "game-board-id",
       which every frame would otherwise share);
     - names seat 1 after you and the rest "Player 2", "Player 3"...;
     - starts a room (?create=1) or joins one (?join=CODE) by itself;
     - tells the bench the room code, so it can send the others in.
   ========================================================================= */
(function () {
  const host = location.hostname;
  if (host !== "localhost" && host !== "127.0.0.1") return;

  const q = new URLSearchParams(location.search);
  const seat = parseInt(q.get("seat"), 10);
  const game = location.pathname.split("/").filter(Boolean).slice(-1)[0];

  // Not in a seat: just offer the bench.
  if (!seat) {
    document.addEventListener("DOMContentLoaded", () => {
      const a = document.createElement("a");
      a.href = `../dev.html?game=${encodeURIComponent(game)}`;
      a.textContent = "🧪 Test solo";
      a.title = "Localhost only: play every seat yourself";
      a.style.cssText = "position:fixed;right:14px;bottom:14px;z-index:99;padding:8px 14px;border-radius:999px;" +
        "background:#ffcf3f;color:#2b2000;font:600 13px system-ui,sans-serif;text-decoration:none;box-shadow:0 6px 18px rgba(0,0,0,.35)";
      document.body.appendChild(a);
      // only on the home screen, where it can't cover a game
      const home = document.getElementById("home");
      if (home) setInterval(() => { a.style.display = home.hidden ? "none" : ""; }, 400);
    });
    return;
  }

  // Its own id: game-board-id becomes game-board-id-seatN in this frame only.
  const KEY = "game-board-id", MINE = `game-board-id-seat${seat}`;
  const get = Storage.prototype.getItem, set = Storage.prototype.setItem;
  Storage.prototype.getItem = function (k) { return get.call(this, this === window.localStorage && k === KEY ? MINE : k); };
  Storage.prototype.setItem = function (k, v) { return set.call(this, this === window.localStorage && k === KEY ? MINE : k, v); };

  // Seat 1 is you; the rest get a number and a colour of their own, and
  // can't rename you by accident.
  const Y = window.KmuftiYou;
  if (Y && seat > 1) {
    const COLORS = ["#4f8cff", "#2fe08a", "#ff5a1f", "#c86bff", "#ffcf3f", "#ff4d8d", "#29c7d8"];
    let name = `Player ${seat}`;
    const color = COLORS[(seat - 2) % COLORS.length];
    Y.name = () => name;
    Y.color = () => color;
    Y.setName = (n) => (name = String(n || name).slice(0, 18));
  }

  // In or out of the room on its own, once the page is up. The games queue
  // a message until their socket is open, so a click this early is fine.
  window.addEventListener("load", () => {
    const $ = (id) => document.getElementById(id);
    const join = (q.get("join") || "").toUpperCase();
    setTimeout(() => {
      if (q.get("create") && $("createBtn")) $("createBtn").click();
      else if (join && $("joinForm")) {
        $("codeInput").value = join;
        $("joinForm").requestSubmit();
      }
    }, 300);

    // Tell the bench the room code whenever it changes.
    const chip = $("codeChip");
    if (!chip || window.parent === window) return;
    let last = "";
    const report = () => {
      const code = chip.textContent.trim();
      if (code && code !== last && !chip.hidden) { last = code; window.parent.postMessage({ devSeat: seat, code }, location.origin); }
    };
    new MutationObserver(report).observe(chip, { childList: true, characterData: true, subtree: true, attributes: true });
    report();
  });

  // A small badge so you know which seat you're looking at.
  document.addEventListener("DOMContentLoaded", () => {
    const b = document.createElement("div");
    b.textContent = seat === 1 ? "Seat 1 (you)" : `Seat ${seat}`;
    b.style.cssText = "position:fixed;right:8px;bottom:8px;z-index:99;padding:3px 9px;border-radius:999px;" +
      "background:rgba(255,207,63,.9);color:#2b2000;font:600 11px system-ui,sans-serif;pointer-events:none";
    document.body.appendChild(b);
  });
})();
