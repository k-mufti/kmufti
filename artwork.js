/* =========================================================================
   Per-app tile artwork, keyed by a project's `slug` (see projects.js).
   Each value is an inline SVG drawn on a 320×200 canvas; it's dropped into
   the tile and scaled to fill. An app with no entry here falls back to a
   simple gradient tile automatically — so custom art is optional.
   ========================================================================= */
const ARTWORK = {
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
      <!-- Square box centred on the tile so the 90° rotation can't clip it:
           the figure's long axis ends up spanning the tile's width. -->
      <g transform="rotate(90 160 100)">
        <image href="images/meccha-pose2.png" x="-5" y="-65" width="330" height="330"
               preserveAspectRatio="xMidYMid meet"/>
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
};
