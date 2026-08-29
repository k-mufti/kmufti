/* =========================================================================
   Per-app tile artwork, keyed by a project's `slug` (see projects.js).
   Each value is an inline SVG drawn on a 320×200 canvas; it's dropped into
   the tile and scaled to fill. An app with no entry here falls back to a
   simple gradient tile automatically — so custom art is optional.
   ========================================================================= */
const ARTWORK = {
  /* Jigsaw — the word on the table it's played on: dark oak, a pool of lamp
     light, and the game's own display face in white. */
  puzzle: `
    <svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="pz-wood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#3a2717"/>
          <stop offset="0.48" stop-color="#26180b"/>
          <stop offset="1" stop-color="#140d06"/>
        </linearGradient>
        <radialGradient id="pz-lamp" cx="0.5" cy="0.44" r="0.62">
          <stop offset="0" stop-color="#ffce8c" stop-opacity="0.16"/>
          <stop offset="1" stop-color="#ffce8c" stop-opacity="0"/>
        </radialGradient>
        <pattern id="pz-grain" width="7" height="200" patternUnits="userSpaceOnUse">
          <rect x="0" y="0" width="1" height="200" fill="#000000" opacity="0.2"/>
          <rect x="3" y="0" width="1" height="200" fill="#ffe9c8" opacity="0.035"/>
        </pattern>
        <filter id="pz-drop" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="2" stdDeviation="2.2" flood-color="#000000" flood-opacity="0.55"/>
        </filter>
        <!-- Two loose pieces, cut with the same knob geometry the real game
             uses: one interior piece and one edge piece with a flat top. -->
        <path id="pz-pc-a" d="M0,0C5.6,0 14,1.23 12.32,1.23C8.96,1.23 8.96,5.88 14,5.88C19.04,5.88 19.04,1.23 15.68,1.23C14,1.23 22.4,0 28,0C28,5.6 29.23,14 29.23,12.32C29.23,8.96 33.88,8.96 33.88,14C33.88,19.04 29.23,19.04 29.23,15.68C29.23,14 28,22.4 28,28C22.4,28 14,29.23 15.68,29.23C19.04,29.23 19.04,33.88 14,33.88C8.96,33.88 8.96,29.23 12.32,29.23C14,29.23 5.6,28 0,28C0,22.4 1.23,14 1.23,15.68C1.23,19.04 5.88,19.04 5.88,14C5.88,8.96 1.23,8.96 1.23,12.32C1.23,14 0,5.6 0,0Z"/>
        <path id="pz-pc-b" d="M0,0C9.33,0 18.67,0 28,0C28,5.6 26.77,14 26.77,12.32C26.77,8.96 22.12,8.96 22.12,14C22.12,19.04 26.77,19.04 26.77,15.68C26.77,14 28,22.4 28,28C22.4,28 14,26.77 15.68,26.77C19.04,26.77 19.04,22.12 14,22.12C8.96,22.12 8.96,26.77 12.32,26.77C14,26.77 5.6,28 0,28C0,22.4 -1.23,14 -1.23,15.68C-1.23,19.04 -5.88,19.04 -5.88,14C-5.88,8.96 -1.23,8.96 -1.23,12.32C-1.23,14 0,5.6 0,0Z"/>
      </defs>
      <rect width="320" height="200" fill="url(#pz-wood)"/>
      <rect width="320" height="200" fill="url(#pz-grain)"/>
      <rect width="320" height="200" fill="url(#pz-lamp)"/>
      <text x="160" y="112" text-anchor="middle" fill="#ffffff"
            font-family="'Super Stamped', Georgia, serif" font-size="54" letter-spacing="1">Jigsaw</text>
      <!-- Two pieces left lying on the table, bottom left. -->
      <g filter="url(#pz-drop)">
        <g transform="translate(16,124) rotate(-13) scale(1.5)">
          <use href="#pz-pc-a" fill="#efe6d8"/>
          <use href="#pz-pc-a" fill="none" stroke="#160d05" stroke-opacity="0.38" stroke-width="0.8"/>
        </g>
        <g transform="translate(84,152) rotate(27) scale(1.15)">
          <use href="#pz-pc-b" fill="#c9b99f"/>
          <use href="#pz-pc-b" fill="none" stroke="#160d05" stroke-opacity="0.38" stroke-width="1"/>
        </g>
      </g>
    </svg>`,

  /* Larprady — a Jeopardy-style game board: gold values on deep blue. */
  jeoprady: `
    <svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lp-cell" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#1731d8"/>
          <stop offset="1" stop-color="#0a1a9e"/>
        </linearGradient>
      </defs>
      <rect width="320" height="200" fill="#050a38"/>
      <g>
        <rect x="14" y="14" width="92" height="52" rx="4" fill="url(#lp-cell)"/>
        <rect x="114" y="14" width="92" height="52" rx="4" fill="url(#lp-cell)"/>
        <rect x="214" y="14" width="92" height="52" rx="4" fill="url(#lp-cell)"/>
        <rect x="14" y="74" width="92" height="52" rx="4" fill="url(#lp-cell)"/>
        <rect x="114" y="74" width="92" height="52" rx="4" fill="url(#lp-cell)"/>
        <rect x="214" y="74" width="92" height="52" rx="4" fill="url(#lp-cell)"/>
        <rect x="14" y="134" width="92" height="52" rx="4" fill="url(#lp-cell)"/>
        <rect x="114" y="134" width="92" height="52" rx="4" fill="url(#lp-cell)"/>
        <rect x="214" y="134" width="92" height="52" rx="4" fill="url(#lp-cell)"/>
      </g>
      <g font-family="Georgia, 'Times New Roman', serif" font-weight="700" font-size="21" text-anchor="middle" fill="#ffce4a">
        <text x="60" y="48">$200</text><text x="160" y="48">$200</text><text x="260" y="48">$200</text>
        <text x="60" y="108">$400</text><text x="160" y="108">$400</text><text x="260" y="108">$400</text>
        <text x="60" y="168">$600</text><text x="160" y="168">$600</text><text x="260" y="168">$600</text>
      </g>
    </svg>`,

  /* Wishlist — a stylized price tag reading "wish" in the app's own display
     face (Fraunces italic), on warm paper with its muted-green accent. */
  wishlist: `
    <svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="wl-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#f7f3ec"/>
          <stop offset="1" stop-color="#e7e0d4"/>
        </linearGradient>
        <filter id="wl-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="5" stdDeviation="7" flood-color="#1a1a1a" flood-opacity="0.16"/>
        </filter>
      </defs>
      <rect width="320" height="200" fill="url(#wl-bg)"/>
      <g transform="rotate(-8 160 102)">
        <!-- tag body -->
        <g filter="url(#wl-shadow)">
          <path d="M74 50 L250 50 Q270 50 270 72 L270 132 Q270 154 250 154 L74 154 L34 102 Z" fill="#ffffff"/>
        </g>
        <!-- punch hole -->
        <circle cx="60" cy="102" r="11" fill="#efe9e0"/>
        <circle cx="60" cy="102" r="11" fill="none" stroke="#cbc2b5" stroke-width="2"/>
        <!-- green sparkle accent -->
        <g transform="translate(256,62) scale(0.95)"><path d="M0,-9 L2.4,-2.6 L9,-2.6 L3.6,1.3 L5.6,8 L0,3.6 L-5.6,8 L-3.6,1.3 L-9,-2.6 L-2.4,-2.6 Z" fill="#3f7d5a"/></g>
        <!-- the word, in the app's Fraunces italic display face -->
        <text x="172" y="125" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="700" font-style="italic" font-size="66" fill="#26211b">wish</text>
      </g>
    </svg>`,

  /* Meccha Chameleon — the blank white figure behind bold red "FIND MECCHA"
     in the game's own Anton display face, on the game's near-black. */
  chameleon: `
    <svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="mc-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#18171d"/>
          <stop offset="1" stop-color="#0b0a0e"/>
        </linearGradient>
        <linearGradient id="mc-fig" x1="0.3" y1="0.15" x2="0.72" y2="1">
          <stop offset="0" stop-color="#ffffff"/>
          <stop offset="1" stop-color="#c9c9c9"/>
        </linearGradient>
        <filter id="mc-tsh" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.5"/>
        </filter>
      </defs>
      <rect width="320" height="200" fill="#000000"/>
      <!-- The real 3D figure (pose 2), exported straight from the game's own
           renderer, laid on its side across the tile. -->
      <!-- Square box centred on the tile so the rotation can't clip it: the
           figure's long axis spans the tile's width. 270° = 90° + a 180° flip,
           so he lies the other way round. -->
      <g transform="rotate(270 160 100)">
        <image href="images/meccha-pose2.png?v=2" x="-5" y="-65" width="330" height="330"
               preserveAspectRatio="xMidYMid meet"/>
      </g>
      <!-- FIND MECCHA — Anton, red, over the figure -->
      <g fill="#e23b2e" font-family="Anton, sans-serif" text-anchor="middle" filter="url(#mc-tsh)">
        <text x="160" y="84" font-size="54" textLength="150" lengthAdjust="spacingAndGlyphs">FIND</text>
        <text x="160" y="170" font-size="84" textLength="306" lengthAdjust="spacingAndGlyphs">MECCHA</text>
      </g>
    </svg>`,

  /* Keyboard — a bed of keycaps with a couple of accent keys. */
  keyboard: `
    <svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="kb-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#30303a"/>
          <stop offset="1" stop-color="#16161b"/>
        </linearGradient>
      </defs>
      <rect width="320" height="200" fill="url(#kb-bg)"/>
      <g fill="#ececf1">
        <rect x="19" y="34" width="30" height="34" rx="6"/><rect x="55" y="34" width="30" height="34" rx="6"/><rect x="91" y="34" width="30" height="34" rx="6"/><rect x="127" y="34" width="30" height="34" rx="6"/><rect x="163" y="34" width="30" height="34" rx="6"/><rect x="199" y="34" width="30" height="34" rx="6"/><rect x="235" y="34" width="30" height="34" rx="6"/><rect x="271" y="34" width="30" height="34" rx="6"/>
        <rect x="19" y="76" width="30" height="34" rx="6"/><rect x="55" y="76" width="30" height="34" rx="6"/><rect x="127" y="76" width="30" height="34" rx="6"/><rect x="163" y="76" width="30" height="34" rx="6"/><rect x="199" y="76" width="30" height="34" rx="6"/><rect x="235" y="76" width="30" height="34" rx="6"/><rect x="271" y="76" width="30" height="34" rx="6"/>
        <rect x="19" y="118" width="30" height="34" rx="6"/><rect x="55" y="118" width="30" height="34" rx="6"/><rect x="91" y="118" width="30" height="34" rx="6"/><rect x="127" y="118" width="30" height="34" rx="6"/><rect x="163" y="118" width="30" height="34" rx="6"/><rect x="271" y="118" width="30" height="34" rx="6"/>
      </g>
      <rect x="91" y="76" width="30" height="34" rx="6" fill="#8fb4f2"/>
      <rect x="199" y="118" width="66" height="34" rx="6" fill="#e2a1a1"/>
      <rect x="80" y="160" width="160" height="26" rx="6" fill="#d7d7df"/>
    </svg>`,

  /* White Canvas — a mostly-blank wall with pixels being placed on it, drawn
     in the canvas's real 16-colour palette. */
  'white-canvas': `
    <svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <rect width="320" height="200" fill="#ffffff"/>
      <g shape-rendering="crispEdges">
        <rect x="40" y="34" width="10" height="10" fill="#fb0000"/>
        <rect x="50" y="34" width="10" height="10" fill="#ff4400"/>
        <rect x="60" y="34" width="10" height="10" fill="#ffaf0d"/>
        <rect x="50" y="44" width="10" height="10" fill="#ffde00"/>
        <rect x="60" y="44" width="10" height="10" fill="#bbff00"/>
        <rect x="70" y="44" width="10" height="10" fill="#62d42d"/>
        <rect x="60" y="54" width="10" height="10" fill="#075327"/>

        <rect x="132" y="72" width="10" height="10" fill="#34dcd3"/>
        <rect x="142" y="72" width="10" height="10" fill="#1caffd"/>
        <rect x="152" y="72" width="10" height="10" fill="#003eff"/>
        <rect x="142" y="82" width="10" height="10" fill="#6400ff"/>
        <rect x="152" y="82" width="10" height="10" fill="#ff00b7"/>
        <rect x="162" y="82" width="10" height="10" fill="#ff8bf6"/>
        <rect x="152" y="92" width="10" height="10" fill="#000000"/>
        <rect x="162" y="92" width="10" height="10" fill="#898989"/>

        <rect x="228" y="126" width="10" height="10" fill="#ffde00"/>
        <rect x="238" y="126" width="10" height="10" fill="#fb0000"/>
        <rect x="238" y="136" width="10" height="10" fill="#003eff"/>
        <rect x="248" y="136" width="10" height="10" fill="#62d42d"/>

        <rect x="86" y="146" width="10" height="10" fill="#1caffd"/>
        <rect x="96" y="146" width="10" height="10" fill="#6400ff"/>
        <rect x="96" y="156" width="10" height="10" fill="#ff4400"/>

        <rect x="196" y="30" width="10" height="10" fill="#898989"/>
        <rect x="206" y="40" width="10" height="10" fill="#34dcd3"/>
        <rect x="264" y="60" width="10" height="10" fill="#ff00b7"/>
        <rect x="34" y="104" width="10" height="10" fill="#ffaf0d"/>
        <rect x="274" y="168" width="10" height="10" fill="#075327"/>
        <rect x="120" y="176" width="10" height="10" fill="#ffde00"/>
      </g>
    </svg>`,

  /* Lost in Translation — the two-pane translator, mystery phrase on the left,
     a question mark where the meaning should be. */
  translate: `
    <svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <rect width="320" height="200" fill="#f1f3f4"/>
      <rect x="22" y="30" width="276" height="140" rx="10" fill="#ffffff" stroke="#dadce0"/>
      <line x1="160" y1="30" x2="160" y2="170" stroke="#dadce0"/>
      <line x1="22" y1="62" x2="298" y2="62" stroke="#dadce0"/>
      <!-- active tab underlines -->
      <rect x="36" y="59" width="62" height="3" fill="#1a73e8"/>
      <rect x="174" y="59" width="46" height="3" fill="#1a73e8"/>
      <g font-family="Inter, sans-serif" font-size="9" fill="#5f6368">
        <text x="36" y="52">Detect language</text>
        <text x="174" y="52">English</text>
      </g>
      <!-- mystery phrase (script-ish glyph blocks) -->
      <g fill="#202124">
        <rect x="36" y="80" width="30" height="9" rx="2"/>
        <rect x="70" y="80" width="46" height="9" rx="2"/>
        <rect x="36" y="97" width="52" height="9" rx="2"/>
        <rect x="92" y="97" width="26" height="9" rx="2"/>
        <rect x="36" y="114" width="38" height="9" rx="2"/>
      </g>
      <!-- the unknown meaning -->
      <text x="212" y="122" font-family="Inter, sans-serif" font-size="64"
            font-weight="300" fill="#1a73e8" text-anchor="middle">?</text>
    </svg>`,
};
