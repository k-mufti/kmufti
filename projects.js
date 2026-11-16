// Add a new project by adding one object here — the card renders automatically.
const PROJECTS = [
  {
    slug: "infinite-kitchen",
    title: "Infinite Kitchen",
    description: "Start with six elements and combine them into every food there is — flour and water make dough, and it never runs out.",
    tags: ["game", "craft", "js"],
    accent: "#c9a45c",
    accentBg: "linear-gradient(135deg, #4a2e1c 0%, #2a190e 100%)",
    href: "infinite-kitchen/",
    status: "live",
  },
  {
    slug: "chameleon",
    title: "Meccha Chameleon",
    description: "A blank figure is hiding in today's photo. Find it as fast as you can — your time and your click count are the only score. One a day.",
    tags: ["game", "daily", "js"],
    accent: "#ffffff",
    accentBg: "linear-gradient(135deg, #e23b2e 0%, #7b1e14 100%)",
    href: "chameleon/",
    status: "live",
  },
  {
    slug: "real-or-fake",
    title: "Real or Fake",
    description: "Ten headlines a day. Some really happened, the rest are satire or made up by AI. Call each one before the stamp comes down.",
    tags: ["game", "daily", "news"],
    accent: "#b3261e",
    accentBg: "linear-gradient(135deg, #f4efe4 0%, #e2d9c4 100%)",
    href: "real-or-fake/",
    status: "live",
  },
  {
    slug: "puzzle",
    title: "Jigsaw",
    description: "One jigsaw puzzle that everybody shares. Watch other people move the pieces in real time, and when it's finished a new one drops on the table.",
    tags: ["game", "realtime", "js"],
    accent: "#d8a45c",
    accentBg: "linear-gradient(135deg, #332215 0%, #150e07 100%)",
    href: "puzzle/",
    status: "live",
  },
  {
    slug: "yahtzee",
    title: "Yahtzee",
    description: "Five red casino dice on blue velvet, thrown with real physics \u2014 they bounce for themselves. Play a full scorecard against the bot.",
    tags: ["game", "3d", "js"],
    accent: "#e8b64c",
    accentBg: "linear-gradient(135deg, #1e22a6 0%, #070622 100%)",
    href: "yahtzee/",
    status: "live",
  },
  {
    slug: "white-canvas",
    title: "White Canvas",
    description: "A shared pixel wall. Everyone draws on the same canvas, live — and every pixel stays.",
    tags: ["toy", "realtime", "js"],
    accent: "#003eff",
    accentBg: "linear-gradient(135deg, #ffffff 0%, #e6e4e0 100%)",
    href: "white-canvas/",
    status: "live",
  },
  {
    slug: "destroy",
    title: "Destroy",
    description: "Every word is a platform and every picture is a target. Jetpack, rockets, a laser — take any web page apart.",
    tags: ["game", "toy", "js"],
    accent: "#ff6a3d",
    accentBg: "linear-gradient(135deg, #1a1a22 0%, #0b0b0f 100%)",
    href: "destroy/",
    status: "live",
  },
  {
    slug: "bust",
    title: "Don Marbleone",
    description: "A marble don in gold aviators, an iced-out grill, Cuban links and a diamond medallion, on leopard print. Five weapons, pistol to rocket launcher: shoot the bling off him, carve the stone; restore runs it all backwards.",
    tags: ["game", "3d", "js"],
    accent: "#e8bd68",
    accentBg: "linear-gradient(135deg, #3a2410 0%, #0a0705 100%)",
    href: "bust/",
    status: "live",
  },
  {
    slug: "wishlist",
    title: "Wishlist",
    description: "Paste any product link and it unfurls into a clean card — title, image, and price scraped automatically.",
    tags: ["tool", "node", "js"],
    accent: "#3f7d5a",
    accentBg: "linear-gradient(135deg, #f8f6f1 0%, #e4ddd2 100%)",
    href: "wishlist/",
    status: "live",
  },
  {
    slug: "jeopardy",
    title: "Jeopardy!",
    description: "A multi-team Jeopardy game with 600 real episodes, a custom board builder, and a growing library of original modern/nostalgia categories.",
    tags: ["game", "trivia", "js"],
    accent: "#ffcc00",
    accentBg: "linear-gradient(135deg, #060ce9 0%, #020556 100%)",
    href: "jeopardy/",
    status: "live",
  },
  {
    slug: "translate",
    title: "Lost in Translation",
    description: "A phrase in a mystery language. Guess what it means \u2014 and which language it is.",
    tags: ["game", "language", "js"],
    accent: "#1a73e8",
    accentBg: "linear-gradient(135deg, #ffffff 0%, #e8f0fe 100%)",
    href: "translate/",
    status: "live",
  },
];

/* =========================================================================
   The board games — shown on the hub in their own window under the tiles
   (three tiles wide, scrolling sideways), rather than hidden behind one
   "Game Board" tile. Each `slug` is also what that game's page reports to
   presence.js, so its tile can say "1 active user". `cls` picks the cover
   colours in styles.css; `art` is the picture on the cover.
   ========================================================================= */
const BOARD_GAMES = [
  {
    slug: "wavelength", title: "Wavelength", tag: "read your friends' minds",
    href: "game-board/wavelength/", cls: "wave",
    art: `<svg viewBox="-100 -100 200 108" aria-hidden="true">
      <circle r="96" fill="#fbfaf6"/><circle r="90" fill="#1d3d5c"/><circle r="84" fill="#f4efe4"/>
      <path d="M0 0L-27 -80A84 84 0 0 1 -12 -83Z" fill="#f3b52f"/>
      <path d="M0 0L-12 -83A84 84 0 0 1 3 -84Z" fill="#ee7a33"/>
      <path d="M0 0L3 -84A84 84 0 0 1 18 -82Z" fill="#a8d4e6"/>
      <path d="M0 0L18 -82A84 84 0 0 1 32 -78Z" fill="#ee7a33"/>
      <path d="M0 0L32 -78A84 84 0 0 1 45 -71Z" fill="#f3b52f"/>
      <rect x="-100" y="0" width="200" height="8" fill="#1d3d5c"/>
      <rect x="-100" y="-3" width="18" height="6" rx="3" fill="#7fd8c3"/>
      <rect x="82" y="-3" width="18" height="6" rx="3" fill="#7fd8c3"/>
      <path d="M-2.5 0L0 -80L2.5 0Z" fill="#d8342b" transform="rotate(12)"/>
      <circle r="14" fill="#d8342b"/>
    </svg>`,
  },
  {
    slug: "imposter", title: "Imposter", tag: "one of you is faking it",
    href: "game-board/imposter/", cls: "imp",
    art: `<svg viewBox="0 0 120 96" aria-hidden="true">
      <rect x="10" y="22" width="44" height="62" rx="7" fill="#f6f0ff" transform="rotate(-12 32 53)"/>
      <rect x="66" y="22" width="44" height="62" rx="7" fill="#f6f0ff" transform="rotate(12 88 53)"/>
      <rect x="38" y="14" width="44" height="64" rx="7" fill="#ff3d6e"/>
      <text x="60" y="58" text-anchor="middle" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="34" fill="#fff">?</text>
    </svg>`,
  },
  {
    slug: "out-of-ten", title: "Out of Ten.", tag: "give 'em a 7",
    href: "game-board/out-of-ten/", cls: "ten",
    art: `<svg viewBox="0 0 120 96" aria-hidden="true">
      <rect x="54" y="16" width="46" height="66" rx="6" fill="#fff" transform="rotate(12 77 49)"/>
      <text x="84" y="58" text-anchor="middle" font-family="Helvetica Neue,Helvetica,Arial,sans-serif" font-weight="700" font-size="12" fill="#000" transform="rotate(12 77 49)">Fake</text>
      <text x="84" y="71" text-anchor="middle" font-family="Helvetica Neue,Helvetica,Arial,sans-serif" font-weight="700" font-size="12" fill="#000" transform="rotate(12 77 49)">Panda.</text>
      <rect x="18" y="12" width="46" height="66" rx="6" fill="#000" stroke="#fff" stroke-width="2.5" transform="rotate(-8 41 45)"/>
      <text x="41" y="56" text-anchor="middle" font-family="Helvetica Neue,Helvetica,Arial,sans-serif" font-weight="700" font-size="28" fill="#fff" transform="rotate(-8 41 45)">10</text>
    </svg>`,
  },
  {
    slug: "draft", title: "Draft", tag: "bid on the best of it",
    href: "game-board/draft/", cls: "drf",
    art: `<svg viewBox="0 0 120 96" aria-hidden="true">
      <rect x="6" y="40" width="34" height="44" rx="6" fill="#20262e"/>
      <rect x="43" y="22" width="34" height="62" rx="6" fill="#ff5a1f"/>
      <rect x="80" y="48" width="34" height="36" rx="6" fill="#20262e"/>
      <text x="60" y="64" text-anchor="middle" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="30" fill="#fff">$</text>
      <text x="23" y="68" text-anchor="middle" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="15" fill="#2fe08a">$</text>
      <text x="97" y="72" text-anchor="middle" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="13" fill="#2fe08a">$</text>
    </svg>`,
  },
  {
    slug: "21-questions", title: "21 Questions", tag: "guess it in 21",
    href: "game-board/21-questions/", cls: "tq",
    art: `<svg viewBox="0 0 120 96" aria-hidden="true">
      <rect x="14" y="8" width="92" height="84" rx="6" fill="#fbf6e9"/>
      <path d="M14 30h92M14 46h92M14 62h92M14 78h92" stroke="#b9d3ec" stroke-width="1.5"/>
      <path d="M32 8v84" stroke="#e4572e" stroke-width="1.5"/>
      <text x="69" y="62" text-anchor="middle" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="34" fill="#1f2a44">21</text>
      <text x="92" y="88" text-anchor="middle" font-family="Arial,sans-serif" font-weight="900" font-size="11" fill="#2a9d5c" transform="rotate(-8 92 88)">YES</text>
    </svg>`,
  },
  {
    slug: "stop-the-clock", title: "Stop the Clock", tag: "no peeking",
    href: "game-board/stop-the-clock/", cls: "clk",
    art: `<svg viewBox="0 0 120 96" aria-hidden="true">
      <rect x="52" y="18" width="16" height="8" rx="2" fill="#0f9a43"/>
      <rect x="10" y="26" width="100" height="58" rx="16" fill="#22e06b"/>
      <text x="60" y="66" text-anchor="middle" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="28" fill="#06280f">10.00</text>
    </svg>`,
  },
];
