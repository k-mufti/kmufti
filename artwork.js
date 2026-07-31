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
      <rect width="320" height="200" fill="url(#mc-bg)"/>
      <!-- the blank white figure, hero behind the text -->
      <g transform="translate(115,8) scale(0.41)" fill="url(#mc-fig)" opacity="0.9">
        <rect x="66" y="262" width="42" height="164" rx="21"/>
        <rect x="112" y="262" width="42" height="164" rx="21"/>
        <rect x="34" y="150" width="38" height="150" rx="19" transform="rotate(7 53 225)"/>
        <rect x="148" y="150" width="38" height="150" rx="19" transform="rotate(-7 167 225)"/>
        <rect x="52" y="106" width="116" height="196" rx="56"/>
        <circle cx="110" cy="72" r="38"/>
      </g>
      <!-- FIND MECCHA — Anton, red, filling the tile -->
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
};
