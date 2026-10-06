/* =========================================================================
   Per-app tile artwork, keyed by a project's `slug` (see projects.js).
   Each value is an inline SVG drawn on a 320×200 canvas; it's dropped into
   the tile and scaled to fill. An app with no entry here falls back to a
   simple gradient tile automatically — so custom art is optional.
   ========================================================================= */
const ARTWORK = {
  /* Jigsaw — the word, big, on the table it's played on: dark oak, a pool of
     lamp light, and the game's own display face, finished like the pieces
     themselves (cream card with a speckled grain and a thick cut edge). */
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
        <!-- The word's finish: cream card lit from above, card-fibre speckle
             kept inside the letters, then a shadow onto the table. -->
        <linearGradient id="pz-ink" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#fffaf1"/>
          <stop offset="1" stop-color="#e6dac6"/>
        </linearGradient>
        <filter id="pz-card" x="-10%" y="-20%" width="120%" height="150%">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="4" result="noise"/>
          <feColorMatrix in="noise" type="matrix" result="speck"
                         values="0 0 0 0 0.42  0 0 0 0 0.3  0 0 0 0 0.18  0.7 0 0 0 -0.3"/>
          <feComposite in="speck" in2="SourceAlpha" operator="in" result="grain"/>
          <feMerge result="card"><feMergeNode in="SourceGraphic"/><feMergeNode in="grain"/></feMerge>
          <feDropShadow in="card" dx="0" dy="4" stdDeviation="3.5" flood-color="#000000" flood-opacity="0.55"/>
        </filter>
        <!-- Two loose pieces, cut with the same knob geometry the real game
             uses: one interior piece and one edge piece with a flat top. -->
        <path id="pz-pc-a" d="M0,0C5.6,0 14,1.23 12.32,1.23C8.96,1.23 8.96,5.88 14,5.88C19.04,5.88 19.04,1.23 15.68,1.23C14,1.23 22.4,0 28,0C28,5.6 29.23,14 29.23,12.32C29.23,8.96 33.88,8.96 33.88,14C33.88,19.04 29.23,19.04 29.23,15.68C29.23,14 28,22.4 28,28C22.4,28 14,29.23 15.68,29.23C19.04,29.23 19.04,33.88 14,33.88C8.96,33.88 8.96,29.23 12.32,29.23C14,29.23 5.6,28 0,28C0,22.4 1.23,14 1.23,15.68C1.23,19.04 5.88,19.04 5.88,14C5.88,8.96 1.23,8.96 1.23,12.32C1.23,14 0,5.6 0,0Z"/>
        <path id="pz-pc-b" d="M0,0C9.33,0 18.67,0 28,0C28,5.6 26.77,14 26.77,12.32C26.77,8.96 22.12,8.96 22.12,14C22.12,19.04 26.77,19.04 26.77,15.68C26.77,14 28,22.4 28,28C22.4,28 14,26.77 15.68,26.77C19.04,26.77 19.04,22.12 14,22.12C8.96,22.12 8.96,26.77 12.32,26.77C14,26.77 5.6,28 0,28C0,22.4 -1.23,14 -1.23,15.68C-1.23,19.04 -5.88,19.04 -5.88,14C-5.88,8.96 -1.23,8.96 -1.23,12.32C-1.23,14 0,5.6 0,0Z"/>
      </defs>
      <rect width="320" height="200" fill="url(#pz-wood)"/>
      <rect width="320" height="200" fill="url(#pz-grain)"/>
      <rect width="320" height="200" fill="url(#pz-lamp)"/>
      <g font-family="'Super Stamped', Georgia, serif" font-size="84" letter-spacing="1" text-anchor="middle" filter="url(#pz-card)">
        <!-- the card's cut edge, showing below each letter -->
        <text x="160" y="134" fill="#b9a587">Jigsaw</text>
        <text x="160" y="130" fill="url(#pz-ink)">Jigsaw</text>
      </g>
      <!-- Two pieces left lying on the table in the clear space above and
           below the word, in the same card finish: cut edge, grain, shadow. -->
      <g transform="translate(262,12) rotate(14) scale(1.15)" filter="url(#pz-card)">
        <use href="#pz-pc-a" fill="#b9a587" transform="translate(0,2.6)"/>
        <use href="#pz-pc-a" fill="url(#pz-ink)"/>
      </g>
      <g transform="translate(34,158) rotate(-16) scale(1.1)" filter="url(#pz-card)">
        <use href="#pz-pc-b" fill="#a8946f" transform="translate(0,2.7)"/>
        <use href="#pz-pc-b" fill="#d8cab2"/>
      </g>
    </svg>`,

  /* Jeoprady — a Jeopardy-style game board: gold values on deep blue. */
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

  /* Wishlist — a stylized price tag in the app's muted green, reading "wish"
     in its own display face (Fraunces italic), word and sparkle in the same
     warm paper colour as the background. */
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
      <!-- tilted, and scaled up about its own centre so it fills the tile -->
      <g transform="translate(160 102) rotate(-8) scale(1.2) translate(-152 -102)">
        <!-- tag body -->
        <g filter="url(#wl-shadow)">
          <path d="M74 50 L250 50 Q270 50 270 72 L270 132 Q270 154 250 154 L74 154 L34 102 Z" fill="#3f7d5a" stroke="#3a3632" stroke-width="1.8" stroke-linejoin="round"/>
        </g>
        <!-- punch hole -->
        <circle cx="60" cy="102" r="11" fill="#f2ede4"/>
        <circle cx="60" cy="102" r="11" fill="none" stroke="#3a3632" stroke-width="1.5"/>
        <!-- sparkle accent -->
        <g transform="translate(256,62) scale(0.95)"><path d="M0,-9 L2.4,-2.6 L9,-2.6 L3.6,1.3 L5.6,8 L0,3.6 L-5.6,8 L-3.6,1.3 L-9,-2.6 L-2.4,-2.6 Z" fill="#f7f3ec" stroke="#3a3632" stroke-width="2" stroke-linejoin="round" paint-order="stroke"/></g>
        <!-- the word, in the app's Fraunces italic display face -->
        <text x="172" y="125" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="700" font-style="italic" font-size="66" fill="#f7f3ec" stroke="#3a3632" stroke-width="3" stroke-linejoin="round" paint-order="stroke">wish</text>
      </g>
    </svg>`,

  /* Meccha Chameleon — the blank white figure behind bold "FIND MECCHA" in
     the game's own Anton display face (MECCHA in a mix of the title's letter colours),
     on the game's near-black. */
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
        <!-- six different colours picked from across the game's MECCHA
             CHAMELEON title, none repeated -->
        <text x="160" y="170" font-size="84" textLength="306" lengthAdjust="spacingAndGlyphs"><tspan fill="#a8e10c">M</tspan><tspan fill="#8b45d6">E</tspan><tspan fill="#ff8a1f">C</tspan><tspan fill="#58c4f0">C</tspan><tspan fill="#e5189c">H</tspan><tspan fill="#ffd21f">A</tspan></text>
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

  /* White Canvas — a wall already covered in random pixels, with a clean white
     patch where the word itself is spelled in a diagonal rainbow sweep, all in
     the canvas's real palette colours. */
  'white-canvas': `
    <svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <rect width="320" height="200" fill="#ffffff"/>
      <g shape-rendering="crispEdges">
        <path fill="#fb0000" d="M24 -1h7v7h-7zM73 -1h7v7h-7zM101 -1h7v7h-7zM164 -1h7v7h-7zM220 -1h7v7h-7zM248 -1h7v7h-7zM262 -1h7v7h-7zM115 6h7v7h-7zM87 13h7v7h-7zM269 13h7v7h-7zM45 20h7v7h-7zM94 20h7v7h-7zM38 27h7v7h-7zM87 27h7v7h-7zM199 27h7v7h-7zM318 27h7v7h-7zM52 34h7v7h-7zM66 34h7v7h-7zM115 34h7v7h-7zM17 41h7v7h-7zM73 41h7v7h-7zM38 48h7v7h-7zM45 48h7v7h-7zM241 48h7v7h-7zM164 55h7v7h-7zM297 55h7v7h-7zM304 55h7v7h-7zM297 69h7v7h-7zM10 83h7v7h-7zM318 97h7v7h-7zM304 104h7v7h-7zM-4 118h7v7h-7zM297 125h7v7h-7zM-4 132h7v7h-7zM311 132h7v7h-7zM241 146h7v7h-7zM283 146h7v7h-7zM73 153h7v7h-7zM248 153h7v7h-7zM304 153h7v7h-7zM73 160h7v7h-7zM136 160h7v7h-7zM185 160h7v7h-7zM311 160h7v7h-7zM-4 167h7v7h-7zM3 167h7v7h-7zM10 167h7v7h-7zM262 167h7v7h-7zM283 167h7v7h-7zM10 174h7v7h-7zM101 174h7v7h-7zM143 174h7v7h-7zM192 174h7v7h-7zM234 174h7v7h-7zM318 174h7v7h-7zM45 181h7v7h-7zM59 181h7v7h-7zM255 181h7v7h-7zM73 188h7v7h-7zM157 188h7v7h-7zM164 188h7v7h-7zM227 188h7v7h-7zM241 188h7v7h-7zM290 188h7v7h-7zM227 195h7v7h-7z"/>
        <path fill="#ff4400" d="M31 -1h7v7h-7zM52 -1h7v7h-7zM108 -1h7v7h-7zM129 -1h7v7h-7zM143 -1h7v7h-7zM185 -1h7v7h-7zM318 -1h7v7h-7zM38 6h7v7h-7zM80 6h7v7h-7zM101 6h7v7h-7zM262 6h7v7h-7zM10 13h7v7h-7zM17 13h7v7h-7zM101 13h7v7h-7zM213 13h7v7h-7zM227 13h7v7h-7zM262 13h7v7h-7zM80 20h7v7h-7zM178 20h7v7h-7zM-4 27h7v7h-7zM290 27h7v7h-7zM3 34h7v7h-7zM31 34h7v7h-7zM59 34h7v7h-7zM94 34h7v7h-7zM122 34h7v7h-7zM206 34h7v7h-7zM213 34h7v7h-7zM262 34h7v7h-7zM276 34h7v7h-7zM115 41h7v7h-7zM150 48h7v7h-7zM164 48h7v7h-7zM290 48h7v7h-7zM311 48h7v7h-7zM80 55h7v7h-7zM129 55h7v7h-7zM3 62h7v7h-7zM311 111h7v7h-7zM3 125h7v7h-7zM10 132h7v7h-7zM10 139h7v7h-7zM227 139h7v7h-7zM255 139h7v7h-7zM283 139h7v7h-7zM318 139h7v7h-7zM94 146h7v7h-7zM220 146h7v7h-7zM3 153h7v7h-7zM10 153h7v7h-7zM45 153h7v7h-7zM52 153h7v7h-7zM234 153h7v7h-7zM290 153h7v7h-7zM318 153h7v7h-7zM10 160h7v7h-7zM38 160h7v7h-7zM59 160h7v7h-7zM164 160h7v7h-7zM80 167h7v7h-7zM290 167h7v7h-7zM17 174h7v7h-7zM255 174h7v7h-7zM-4 181h7v7h-7zM17 181h7v7h-7zM94 181h7v7h-7zM150 188h7v7h-7zM192 188h7v7h-7zM311 188h7v7h-7zM24 195h7v7h-7zM45 195h7v7h-7zM87 195h7v7h-7zM185 195h7v7h-7zM262 195h7v7h-7z"/>
        <path fill="#ffaf0d" d="M3 -1h7v7h-7zM283 -1h7v7h-7zM304 -1h7v7h-7zM31 6h7v7h-7zM234 6h7v7h-7zM38 13h7v7h-7zM59 13h7v7h-7zM66 20h7v7h-7zM122 20h7v7h-7zM185 20h7v7h-7zM227 20h7v7h-7zM318 20h7v7h-7zM3 27h7v7h-7zM10 27h7v7h-7zM66 27h7v7h-7zM94 27h7v7h-7zM143 27h7v7h-7zM24 34h7v7h-7zM80 34h7v7h-7zM157 34h7v7h-7zM269 34h7v7h-7zM3 41h7v7h-7zM45 41h7v7h-7zM164 41h7v7h-7zM45 55h7v7h-7zM143 55h7v7h-7zM150 55h7v7h-7zM157 55h7v7h-7zM171 55h7v7h-7zM213 55h7v7h-7zM269 55h7v7h-7zM290 55h7v7h-7zM304 62h7v7h-7zM3 83h7v7h-7zM10 97h7v7h-7zM297 97h7v7h-7zM17 104h7v7h-7zM-4 111h7v7h-7zM3 111h7v7h-7zM10 111h7v7h-7zM213 139h7v7h-7zM10 146h7v7h-7zM45 146h7v7h-7zM66 146h7v7h-7zM122 146h7v7h-7zM150 146h7v7h-7zM94 153h7v7h-7zM115 153h7v7h-7zM178 153h7v7h-7zM269 153h7v7h-7zM129 160h7v7h-7zM171 160h7v7h-7zM192 160h7v7h-7zM283 160h7v7h-7zM241 167h7v7h-7zM276 167h7v7h-7zM3 174h7v7h-7zM115 174h7v7h-7zM122 174h7v7h-7zM227 174h7v7h-7zM24 181h7v7h-7zM129 181h7v7h-7zM213 181h7v7h-7zM248 181h7v7h-7zM10 188h7v7h-7zM171 188h7v7h-7zM276 195h7v7h-7z"/>
        <path fill="#ffde00" d="M94 -1h7v7h-7zM136 -1h7v7h-7zM192 -1h7v7h-7zM255 -1h7v7h-7zM66 6h7v7h-7zM129 6h7v7h-7zM220 6h7v7h-7zM255 6h7v7h-7zM101 20h7v7h-7zM136 20h7v7h-7zM311 20h7v7h-7zM17 27h7v7h-7zM31 27h7v7h-7zM-4 34h7v7h-7zM10 34h7v7h-7zM136 34h7v7h-7zM24 41h7v7h-7zM185 41h7v7h-7zM234 41h7v7h-7zM276 41h7v7h-7zM290 41h7v7h-7zM-4 48h7v7h-7zM3 48h7v7h-7zM80 48h7v7h-7zM157 48h7v7h-7zM171 48h7v7h-7zM185 48h7v7h-7zM199 48h7v7h-7zM24 55h7v7h-7zM-4 69h7v7h-7zM17 69h7v7h-7zM311 69h7v7h-7zM3 76h7v7h-7zM304 125h7v7h-7zM311 125h7v7h-7zM59 139h7v7h-7zM122 139h7v7h-7zM192 139h7v7h-7zM269 139h7v7h-7zM290 139h7v7h-7zM80 146h7v7h-7zM143 146h7v7h-7zM199 146h7v7h-7zM31 153h7v7h-7zM31 160h7v7h-7zM157 160h7v7h-7zM199 160h7v7h-7zM248 160h7v7h-7zM38 167h7v7h-7zM59 167h7v7h-7zM178 167h7v7h-7zM185 167h7v7h-7zM199 167h7v7h-7zM80 174h7v7h-7zM185 174h7v7h-7zM213 174h7v7h-7zM290 174h7v7h-7zM297 174h7v7h-7zM87 181h7v7h-7zM143 188h7v7h-7zM269 188h7v7h-7zM108 195h7v7h-7zM129 195h7v7h-7zM136 195h7v7h-7zM255 195h7v7h-7z"/>
        <path fill="#bbff00" d="M290 -1h7v7h-7zM3 6h7v7h-7zM213 6h7v7h-7zM276 6h7v7h-7zM-4 13h7v7h-7zM234 13h7v7h-7zM290 13h7v7h-7zM3 20h7v7h-7zM115 20h7v7h-7zM213 20h7v7h-7zM262 20h7v7h-7zM73 27h7v7h-7zM80 27h7v7h-7zM171 34h7v7h-7zM255 34h7v7h-7zM304 34h7v7h-7zM94 41h7v7h-7zM136 41h7v7h-7zM59 48h7v7h-7zM73 48h7v7h-7zM304 69h7v7h-7zM318 69h7v7h-7zM304 76h7v7h-7zM318 125h7v7h-7zM73 139h7v7h-7zM164 139h7v7h-7zM304 139h7v7h-7zM52 146h7v7h-7zM318 146h7v7h-7zM59 153h7v7h-7zM66 153h7v7h-7zM101 153h7v7h-7zM164 153h7v7h-7zM241 153h7v7h-7zM297 153h7v7h-7zM3 160h7v7h-7zM45 160h7v7h-7zM115 160h7v7h-7zM178 160h7v7h-7zM213 160h7v7h-7zM227 160h7v7h-7zM255 160h7v7h-7zM290 160h7v7h-7zM318 160h7v7h-7zM164 167h7v7h-7zM318 167h7v7h-7zM66 174h7v7h-7zM94 174h7v7h-7zM129 174h7v7h-7zM150 174h7v7h-7zM206 174h7v7h-7zM269 174h7v7h-7zM3 181h7v7h-7zM66 181h7v7h-7zM73 181h7v7h-7zM220 181h7v7h-7zM283 188h7v7h-7zM73 195h7v7h-7zM101 195h7v7h-7zM213 195h7v7h-7zM290 195h7v7h-7zM318 195h7v7h-7z"/>
        <path fill="#62d42d" d="M-4 -1h7v7h-7zM59 -1h7v7h-7zM73 6h7v7h-7zM171 6h7v7h-7zM206 6h7v7h-7zM304 6h7v7h-7zM52 13h7v7h-7zM150 13h7v7h-7zM157 13h7v7h-7zM171 13h7v7h-7zM38 20h7v7h-7zM59 20h7v7h-7zM283 20h7v7h-7zM115 27h7v7h-7zM136 27h7v7h-7zM38 34h7v7h-7zM101 34h7v7h-7zM178 34h7v7h-7zM192 34h7v7h-7zM290 34h7v7h-7zM38 41h7v7h-7zM150 41h7v7h-7zM171 41h7v7h-7zM220 41h7v7h-7zM24 48h7v7h-7zM101 48h7v7h-7zM136 48h7v7h-7zM143 48h7v7h-7zM192 48h7v7h-7zM269 48h7v7h-7zM73 55h7v7h-7zM262 55h7v7h-7zM297 76h7v7h-7zM304 83h7v7h-7zM3 118h7v7h-7zM24 139h7v7h-7zM248 139h7v7h-7zM38 146h7v7h-7zM185 146h7v7h-7zM206 146h7v7h-7zM213 146h7v7h-7zM234 146h7v7h-7zM248 146h7v7h-7zM297 146h7v7h-7zM227 153h7v7h-7zM80 160h7v7h-7zM297 160h7v7h-7zM192 167h7v7h-7zM255 167h7v7h-7zM157 174h7v7h-7zM164 174h7v7h-7zM178 174h7v7h-7zM220 174h7v7h-7zM241 174h7v7h-7zM192 181h7v7h-7zM185 188h7v7h-7zM283 195h7v7h-7z"/>
        <path fill="#075327" d="M10 -1h7v7h-7zM115 -1h7v7h-7zM122 -1h7v7h-7zM157 -1h7v7h-7zM241 -1h7v7h-7zM297 -1h7v7h-7zM157 6h7v7h-7zM31 13h7v7h-7zM80 13h7v7h-7zM17 20h7v7h-7zM143 20h7v7h-7zM150 20h7v7h-7zM199 20h7v7h-7zM241 20h7v7h-7zM276 20h7v7h-7zM304 20h7v7h-7zM101 27h7v7h-7zM262 27h7v7h-7zM269 27h7v7h-7zM276 27h7v7h-7zM283 27h7v7h-7zM311 27h7v7h-7zM150 34h7v7h-7zM304 41h7v7h-7zM-4 55h7v7h-7zM52 55h7v7h-7zM101 55h7v7h-7zM115 55h7v7h-7zM311 62h7v7h-7zM318 76h7v7h-7zM304 90h7v7h-7zM220 139h7v7h-7zM234 139h7v7h-7zM276 139h7v7h-7zM101 146h7v7h-7zM164 146h7v7h-7zM178 146h7v7h-7zM192 146h7v7h-7zM290 146h7v7h-7zM129 153h7v7h-7zM171 153h7v7h-7zM276 153h7v7h-7zM94 160h7v7h-7zM108 167h7v7h-7zM150 167h7v7h-7zM248 167h7v7h-7zM-4 174h7v7h-7zM38 174h7v7h-7zM248 174h7v7h-7zM31 181h7v7h-7zM52 181h7v7h-7zM178 181h7v7h-7zM304 181h7v7h-7zM199 188h7v7h-7zM178 195h7v7h-7z"/>
        <path fill="#34dcd3" d="M136 6h7v7h-7zM178 6h7v7h-7zM199 6h7v7h-7zM290 6h7v7h-7zM318 6h7v7h-7zM73 13h7v7h-7zM185 13h7v7h-7zM206 13h7v7h-7zM241 13h7v7h-7zM-4 20h7v7h-7zM52 20h7v7h-7zM87 20h7v7h-7zM171 20h7v7h-7zM192 20h7v7h-7zM45 27h7v7h-7zM206 27h7v7h-7zM297 27h7v7h-7zM17 34h7v7h-7zM199 34h7v7h-7zM227 34h7v7h-7zM234 34h7v7h-7zM241 34h7v7h-7zM248 34h7v7h-7zM311 34h7v7h-7zM17 48h7v7h-7zM66 48h7v7h-7zM108 48h7v7h-7zM178 48h7v7h-7zM206 48h7v7h-7zM248 48h7v7h-7zM31 55h7v7h-7zM108 55h7v7h-7zM192 55h7v7h-7zM241 55h7v7h-7zM318 83h7v7h-7zM3 104h7v7h-7zM17 111h7v7h-7zM311 118h7v7h-7zM297 132h7v7h-7zM17 139h7v7h-7zM80 139h7v7h-7zM108 139h7v7h-7zM206 139h7v7h-7zM241 139h7v7h-7zM73 146h7v7h-7zM115 146h7v7h-7zM262 146h7v7h-7zM269 146h7v7h-7zM213 153h7v7h-7zM66 160h7v7h-7zM262 160h7v7h-7zM52 167h7v7h-7zM73 167h7v7h-7zM122 167h7v7h-7zM108 174h7v7h-7zM136 174h7v7h-7zM262 174h7v7h-7zM206 181h7v7h-7zM213 188h7v7h-7zM276 188h7v7h-7zM297 188h7v7h-7zM66 195h7v7h-7zM157 195h7v7h-7zM164 195h7v7h-7zM192 195h7v7h-7z"/>
        <path fill="#1caffd" d="M45 -1h7v7h-7zM87 -1h7v7h-7zM150 -1h7v7h-7zM269 -1h7v7h-7zM311 -1h7v7h-7zM10 6h7v7h-7zM87 6h7v7h-7zM150 6h7v7h-7zM283 6h7v7h-7zM24 13h7v7h-7zM115 13h7v7h-7zM206 20h7v7h-7zM255 20h7v7h-7zM108 27h7v7h-7zM164 27h7v7h-7zM255 27h7v7h-7zM87 34h7v7h-7zM10 41h7v7h-7zM31 41h7v7h-7zM59 41h7v7h-7zM87 41h7v7h-7zM143 41h7v7h-7zM192 41h7v7h-7zM199 41h7v7h-7zM213 41h7v7h-7zM10 48h7v7h-7zM276 55h7v7h-7zM283 55h7v7h-7zM10 62h7v7h-7zM-4 76h7v7h-7zM311 76h7v7h-7zM297 90h7v7h-7zM3 97h7v7h-7zM17 97h7v7h-7zM304 97h7v7h-7zM311 97h7v7h-7zM318 111h7v7h-7zM17 118h7v7h-7zM297 118h7v7h-7zM304 118h7v7h-7zM17 125h7v7h-7zM17 132h7v7h-7zM304 132h7v7h-7zM38 139h7v7h-7zM52 139h7v7h-7zM87 139h7v7h-7zM94 139h7v7h-7zM115 139h7v7h-7zM136 139h7v7h-7zM178 139h7v7h-7zM171 146h7v7h-7zM255 146h7v7h-7zM304 146h7v7h-7zM-4 153h7v7h-7zM185 153h7v7h-7zM199 153h7v7h-7zM87 160h7v7h-7zM143 160h7v7h-7zM234 160h7v7h-7zM269 160h7v7h-7zM24 167h7v7h-7zM31 167h7v7h-7zM45 167h7v7h-7zM129 167h7v7h-7zM157 167h7v7h-7zM52 174h7v7h-7zM171 174h7v7h-7zM276 174h7v7h-7zM304 174h7v7h-7zM108 181h7v7h-7zM290 181h7v7h-7zM3 188h7v7h-7zM24 188h7v7h-7zM38 188h7v7h-7zM220 188h7v7h-7zM255 188h7v7h-7zM3 195h7v7h-7zM17 195h7v7h-7zM38 195h7v7h-7z"/>
        <path fill="#003eff" d="M66 -1h7v7h-7zM178 -1h7v7h-7zM213 -1h7v7h-7zM227 -1h7v7h-7zM234 -1h7v7h-7zM-4 6h7v7h-7zM45 6h7v7h-7zM52 6h7v7h-7zM108 6h7v7h-7zM122 6h7v7h-7zM185 6h7v7h-7zM269 6h7v7h-7zM3 13h7v7h-7zM122 13h7v7h-7zM178 13h7v7h-7zM192 13h7v7h-7zM304 13h7v7h-7zM73 20h7v7h-7zM59 27h7v7h-7zM122 27h7v7h-7zM129 27h7v7h-7zM171 27h7v7h-7zM45 34h7v7h-7zM73 34h7v7h-7zM108 34h7v7h-7zM143 34h7v7h-7zM185 34h7v7h-7zM241 41h7v7h-7zM94 48h7v7h-7zM213 48h7v7h-7zM227 48h7v7h-7zM178 55h7v7h-7zM220 55h7v7h-7zM234 55h7v7h-7zM17 76h7v7h-7zM3 90h7v7h-7zM297 104h7v7h-7zM297 111h7v7h-7zM31 139h7v7h-7zM45 139h7v7h-7zM311 146h7v7h-7zM206 153h7v7h-7zM17 160h7v7h-7zM122 160h7v7h-7zM73 174h7v7h-7zM38 181h7v7h-7zM101 181h7v7h-7zM171 181h7v7h-7zM234 181h7v7h-7zM45 188h7v7h-7zM94 188h7v7h-7zM234 195h7v7h-7zM269 195h7v7h-7z"/>
        <path fill="#6400ff" d="M17 -1h7v7h-7zM199 -1h7v7h-7zM206 -1h7v7h-7zM24 6h7v7h-7zM59 6h7v7h-7zM143 6h7v7h-7zM94 13h7v7h-7zM255 13h7v7h-7zM297 13h7v7h-7zM311 13h7v7h-7zM31 20h7v7h-7zM290 20h7v7h-7zM24 27h7v7h-7zM178 27h7v7h-7zM185 27h7v7h-7zM241 27h7v7h-7zM304 27h7v7h-7zM164 34h7v7h-7zM101 41h7v7h-7zM227 41h7v7h-7zM262 48h7v7h-7zM283 48h7v7h-7zM304 48h7v7h-7zM66 55h7v7h-7zM206 55h7v7h-7zM248 55h7v7h-7zM-4 62h7v7h-7zM-4 90h7v7h-7zM10 118h7v7h-7zM262 139h7v7h-7zM297 139h7v7h-7zM24 146h7v7h-7zM31 146h7v7h-7zM129 146h7v7h-7zM150 153h7v7h-7zM311 153h7v7h-7zM220 160h7v7h-7zM276 160h7v7h-7zM87 167h7v7h-7zM101 167h7v7h-7zM115 167h7v7h-7zM234 167h7v7h-7zM297 167h7v7h-7zM24 174h7v7h-7zM59 174h7v7h-7zM283 174h7v7h-7zM80 181h7v7h-7zM136 181h7v7h-7zM241 181h7v7h-7zM297 181h7v7h-7zM87 188h7v7h-7zM122 188h7v7h-7zM136 188h7v7h-7zM178 188h7v7h-7zM234 188h7v7h-7zM248 188h7v7h-7zM262 188h7v7h-7zM31 195h7v7h-7zM150 195h7v7h-7zM206 195h7v7h-7zM241 195h7v7h-7zM248 195h7v7h-7zM297 195h7v7h-7z"/>
        <path fill="#ff00b7" d="M94 6h7v7h-7zM241 6h7v7h-7zM311 6h7v7h-7zM164 13h7v7h-7zM248 13h7v7h-7zM276 13h7v7h-7zM283 13h7v7h-7zM10 20h7v7h-7zM129 20h7v7h-7zM269 20h7v7h-7zM150 27h7v7h-7zM192 27h7v7h-7zM283 34h7v7h-7zM297 34h7v7h-7zM-4 41h7v7h-7zM52 41h7v7h-7zM122 41h7v7h-7zM311 41h7v7h-7zM31 48h7v7h-7zM87 48h7v7h-7zM129 48h7v7h-7zM10 55h7v7h-7zM94 55h7v7h-7zM122 55h7v7h-7zM136 55h7v7h-7zM318 55h7v7h-7zM17 62h7v7h-7zM297 83h7v7h-7zM304 111h7v7h-7zM66 139h7v7h-7zM129 139h7v7h-7zM17 146h7v7h-7zM87 146h7v7h-7zM157 146h7v7h-7zM227 146h7v7h-7zM276 146h7v7h-7zM220 153h7v7h-7zM262 153h7v7h-7zM150 160h7v7h-7zM17 167h7v7h-7zM171 167h7v7h-7zM220 167h7v7h-7zM227 167h7v7h-7zM304 167h7v7h-7zM87 174h7v7h-7zM150 181h7v7h-7zM199 181h7v7h-7zM227 181h7v7h-7zM276 181h7v7h-7zM311 181h7v7h-7zM318 181h7v7h-7zM115 188h7v7h-7zM129 188h7v7h-7zM318 188h7v7h-7zM52 195h7v7h-7zM59 195h7v7h-7zM115 195h7v7h-7zM143 195h7v7h-7zM304 195h7v7h-7zM311 195h7v7h-7z"/>
        <path fill="#ff8bf6" d="M164 6h7v7h-7zM227 6h7v7h-7zM248 6h7v7h-7zM45 13h7v7h-7zM108 13h7v7h-7zM129 13h7v7h-7zM199 13h7v7h-7zM108 20h7v7h-7zM227 27h7v7h-7zM248 27h7v7h-7zM80 41h7v7h-7zM178 41h7v7h-7zM206 41h7v7h-7zM248 41h7v7h-7zM255 41h7v7h-7zM262 41h7v7h-7zM283 41h7v7h-7zM318 41h7v7h-7zM52 48h7v7h-7zM115 48h7v7h-7zM276 48h7v7h-7zM3 55h7v7h-7zM17 55h7v7h-7zM59 55h7v7h-7zM87 55h7v7h-7zM199 55h7v7h-7zM311 55h7v7h-7zM10 76h7v7h-7zM10 104h7v7h-7zM311 104h7v7h-7zM318 104h7v7h-7zM318 118h7v7h-7zM-4 125h7v7h-7zM3 132h7v7h-7zM318 132h7v7h-7zM101 139h7v7h-7zM311 139h7v7h-7zM3 146h7v7h-7zM24 153h7v7h-7zM87 153h7v7h-7zM108 153h7v7h-7zM255 153h7v7h-7zM-4 160h7v7h-7zM241 160h7v7h-7zM304 160h7v7h-7zM311 174h7v7h-7zM122 181h7v7h-7zM157 181h7v7h-7zM185 181h7v7h-7zM-4 188h7v7h-7zM31 188h7v7h-7zM66 188h7v7h-7zM101 188h7v7h-7zM304 188h7v7h-7zM80 195h7v7h-7zM122 195h7v7h-7zM220 195h7v7h-7z"/>
        <path fill="#000000" d="M38 -1h7v7h-7zM171 -1h7v7h-7zM276 -1h7v7h-7zM17 6h7v7h-7zM143 13h7v7h-7zM220 13h7v7h-7zM318 13h7v7h-7zM164 20h7v7h-7zM234 20h7v7h-7zM248 20h7v7h-7zM52 27h7v7h-7zM157 27h7v7h-7zM220 27h7v7h-7zM234 27h7v7h-7zM129 34h7v7h-7zM220 34h7v7h-7zM318 34h7v7h-7zM108 41h7v7h-7zM129 41h7v7h-7zM269 41h7v7h-7zM297 41h7v7h-7zM234 48h7v7h-7zM297 48h7v7h-7zM227 55h7v7h-7zM318 62h7v7h-7zM3 69h7v7h-7zM10 69h7v7h-7zM-4 83h7v7h-7zM10 90h7v7h-7zM311 90h7v7h-7zM-4 104h7v7h-7zM199 139h7v7h-7zM136 146h7v7h-7zM122 153h7v7h-7zM136 153h7v7h-7zM157 153h7v7h-7zM24 160h7v7h-7zM52 160h7v7h-7zM94 167h7v7h-7zM136 167h7v7h-7zM206 167h7v7h-7zM269 167h7v7h-7zM31 174h7v7h-7zM45 174h7v7h-7zM10 181h7v7h-7zM115 181h7v7h-7zM262 181h7v7h-7zM269 181h7v7h-7zM52 188h7v7h-7zM59 188h7v7h-7zM80 188h7v7h-7zM206 188h7v7h-7zM94 195h7v7h-7zM171 195h7v7h-7z"/>
        <path fill="#898989" d="M80 -1h7v7h-7zM192 6h7v7h-7zM297 6h7v7h-7zM66 13h7v7h-7zM136 13h7v7h-7zM24 20h7v7h-7zM157 20h7v7h-7zM220 20h7v7h-7zM297 20h7v7h-7zM213 27h7v7h-7zM66 41h7v7h-7zM157 41h7v7h-7zM122 48h7v7h-7zM220 48h7v7h-7zM255 48h7v7h-7zM318 48h7v7h-7zM38 55h7v7h-7zM185 55h7v7h-7zM255 55h7v7h-7zM297 62h7v7h-7zM17 83h7v7h-7zM311 83h7v7h-7zM17 90h7v7h-7zM318 90h7v7h-7zM-4 97h7v7h-7zM10 125h7v7h-7zM-4 139h7v7h-7zM3 139h7v7h-7zM143 139h7v7h-7zM150 139h7v7h-7zM157 139h7v7h-7zM171 139h7v7h-7zM185 139h7v7h-7zM-4 146h7v7h-7zM59 146h7v7h-7zM108 146h7v7h-7zM17 153h7v7h-7zM38 153h7v7h-7zM80 153h7v7h-7zM143 153h7v7h-7zM192 153h7v7h-7zM283 153h7v7h-7zM101 160h7v7h-7zM108 160h7v7h-7zM206 160h7v7h-7zM66 167h7v7h-7zM143 167h7v7h-7zM213 167h7v7h-7zM311 167h7v7h-7zM199 174h7v7h-7zM143 181h7v7h-7zM164 181h7v7h-7zM283 181h7v7h-7zM17 188h7v7h-7zM108 188h7v7h-7zM-4 195h7v7h-7zM10 195h7v7h-7zM199 195h7v7h-7z"/>
        <rect x="24" y="62" width="273" height="77" fill="#ffffff"/>

        <rect x="45" y="76" width="7" height="7" fill="#fb0000"/>
        <rect x="52" y="76" width="7" height="7" fill="#fb0000"/>
        <rect x="59" y="76" width="7" height="7" fill="#fb0000"/>
        <rect x="38" y="83" width="7" height="7" fill="#fb0000"/>
        <rect x="66" y="83" width="7" height="7" fill="#ff4400"/>
        <rect x="38" y="90" width="7" height="7" fill="#fb0000"/>
        <rect x="38" y="97" width="7" height="7" fill="#fb0000"/>
        <rect x="38" y="104" width="7" height="7" fill="#ff4400"/>
        <rect x="38" y="111" width="7" height="7" fill="#ff4400"/>
        <rect x="66" y="111" width="7" height="7" fill="#ffaf0d"/>
        <rect x="45" y="118" width="7" height="7" fill="#ffaf0d"/>
        <rect x="52" y="118" width="7" height="7" fill="#ffaf0d"/>
        <rect x="59" y="118" width="7" height="7" fill="#ffaf0d"/>
        <rect x="87" y="76" width="7" height="7" fill="#ffaf0d"/>
        <rect x="94" y="76" width="7" height="7" fill="#ffaf0d"/>
        <rect x="101" y="76" width="7" height="7" fill="#ffaf0d"/>
        <rect x="80" y="83" width="7" height="7" fill="#ffaf0d"/>
        <rect x="108" y="83" width="7" height="7" fill="#ffde00"/>
        <rect x="80" y="90" width="7" height="7" fill="#ffaf0d"/>
        <rect x="108" y="90" width="7" height="7" fill="#ffde00"/>
        <rect x="80" y="97" width="7" height="7" fill="#ffaf0d"/>
        <rect x="87" y="97" width="7" height="7" fill="#ffaf0d"/>
        <rect x="94" y="97" width="7" height="7" fill="#ffde00"/>
        <rect x="101" y="97" width="7" height="7" fill="#ffde00"/>
        <rect x="108" y="97" width="7" height="7" fill="#ffde00"/>
        <rect x="80" y="104" width="7" height="7" fill="#ffaf0d"/>
        <rect x="108" y="104" width="7" height="7" fill="#bbff00"/>
        <rect x="80" y="111" width="7" height="7" fill="#ffde00"/>
        <rect x="108" y="111" width="7" height="7" fill="#bbff00"/>
        <rect x="80" y="118" width="7" height="7" fill="#ffde00"/>
        <rect x="108" y="118" width="7" height="7" fill="#bbff00"/>
        <rect x="122" y="76" width="7" height="7" fill="#ffde00"/>
        <rect x="150" y="76" width="7" height="7" fill="#bbff00"/>
        <rect x="122" y="83" width="7" height="7" fill="#ffde00"/>
        <rect x="129" y="83" width="7" height="7" fill="#bbff00"/>
        <rect x="150" y="83" width="7" height="7" fill="#bbff00"/>
        <rect x="122" y="90" width="7" height="7" fill="#bbff00"/>
        <rect x="136" y="90" width="7" height="7" fill="#bbff00"/>
        <rect x="150" y="90" width="7" height="7" fill="#62d42d"/>
        <rect x="122" y="97" width="7" height="7" fill="#bbff00"/>
        <rect x="143" y="97" width="7" height="7" fill="#62d42d"/>
        <rect x="150" y="97" width="7" height="7" fill="#62d42d"/>
        <rect x="122" y="104" width="7" height="7" fill="#bbff00"/>
        <rect x="150" y="104" width="7" height="7" fill="#62d42d"/>
        <rect x="122" y="111" width="7" height="7" fill="#bbff00"/>
        <rect x="150" y="111" width="7" height="7" fill="#34dcd3"/>
        <rect x="122" y="118" width="7" height="7" fill="#62d42d"/>
        <rect x="150" y="118" width="7" height="7" fill="#34dcd3"/>
        <rect x="164" y="76" width="7" height="7" fill="#62d42d"/>
        <rect x="192" y="76" width="7" height="7" fill="#34dcd3"/>
        <rect x="164" y="83" width="7" height="7" fill="#62d42d"/>
        <rect x="192" y="83" width="7" height="7" fill="#34dcd3"/>
        <rect x="164" y="90" width="7" height="7" fill="#62d42d"/>
        <rect x="192" y="90" width="7" height="7" fill="#34dcd3"/>
        <rect x="164" y="97" width="7" height="7" fill="#34dcd3"/>
        <rect x="192" y="97" width="7" height="7" fill="#1caffd"/>
        <rect x="164" y="104" width="7" height="7" fill="#34dcd3"/>
        <rect x="192" y="104" width="7" height="7" fill="#1caffd"/>
        <rect x="171" y="111" width="7" height="7" fill="#34dcd3"/>
        <rect x="185" y="111" width="7" height="7" fill="#1caffd"/>
        <rect x="178" y="118" width="7" height="7" fill="#1caffd"/>
        <rect x="213" y="76" width="7" height="7" fill="#1caffd"/>
        <rect x="220" y="76" width="7" height="7" fill="#1caffd"/>
        <rect x="227" y="76" width="7" height="7" fill="#1caffd"/>
        <rect x="206" y="83" width="7" height="7" fill="#1caffd"/>
        <rect x="234" y="83" width="7" height="7" fill="#003eff"/>
        <rect x="206" y="90" width="7" height="7" fill="#1caffd"/>
        <rect x="234" y="90" width="7" height="7" fill="#003eff"/>
        <rect x="206" y="97" width="7" height="7" fill="#1caffd"/>
        <rect x="213" y="97" width="7" height="7" fill="#003eff"/>
        <rect x="220" y="97" width="7" height="7" fill="#003eff"/>
        <rect x="227" y="97" width="7" height="7" fill="#003eff"/>
        <rect x="234" y="97" width="7" height="7" fill="#003eff"/>
        <rect x="206" y="104" width="7" height="7" fill="#003eff"/>
        <rect x="234" y="104" width="7" height="7" fill="#6400ff"/>
        <rect x="206" y="111" width="7" height="7" fill="#003eff"/>
        <rect x="234" y="111" width="7" height="7" fill="#6400ff"/>
        <rect x="206" y="118" width="7" height="7" fill="#003eff"/>
        <rect x="234" y="118" width="7" height="7" fill="#6400ff"/>
        <rect x="255" y="76" width="7" height="7" fill="#003eff"/>
        <rect x="262" y="76" width="7" height="7" fill="#6400ff"/>
        <rect x="269" y="76" width="7" height="7" fill="#6400ff"/>
        <rect x="276" y="76" width="7" height="7" fill="#6400ff"/>
        <rect x="248" y="83" width="7" height="7" fill="#003eff"/>
        <rect x="248" y="90" width="7" height="7" fill="#6400ff"/>
        <rect x="255" y="97" width="7" height="7" fill="#6400ff"/>
        <rect x="262" y="97" width="7" height="7" fill="#ff00b7"/>
        <rect x="269" y="97" width="7" height="7" fill="#ff00b7"/>
        <rect x="276" y="104" width="7" height="7" fill="#ff00b7"/>
        <rect x="276" y="111" width="7" height="7" fill="#ff8bf6"/>
        <rect x="248" y="118" width="7" height="7" fill="#ff00b7"/>
        <rect x="255" y="118" width="7" height="7" fill="#ff00b7"/>
        <rect x="262" y="118" width="7" height="7" fill="#ff00b7"/>
        <rect x="269" y="118" width="7" height="7" fill="#ff8bf6"/>
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

  /* Yahtzee — the table it's played on: green felt with a real nap, lit
     from above, two glossy ivory dice thrown either side of the word. The
     word is finished like the dice (ivory, a thick edge, a shadow on the
     cloth). Anton is already loaded for the hub. */
  yahtzee: `
    <svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="yz-felt" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#177a4c"/>
          <stop offset="0.55" stop-color="#0f5c39"/>
          <stop offset="1" stop-color="#083b25"/>
        </linearGradient>
        <radialGradient id="yz-lamp" cx="0.5" cy="0.42" r="0.7">
          <stop offset="0" stop-color="#d7ffe8" stop-opacity="0.22"/>
          <stop offset="0.6" stop-color="#d7ffe8" stop-opacity="0.04"/>
          <stop offset="1" stop-color="#021a0e" stop-opacity="0.35"/>
        </radialGradient>
        <!-- dice + word: ivory plastic, lit from the top left -->
        <linearGradient id="yz-ivory" x1="0.1" y1="0" x2="0.7" y2="1">
          <stop offset="0" stop-color="#ffffff"/>
          <stop offset="0.55" stop-color="#f4f0e6"/>
          <stop offset="1" stop-color="#d9d2c1"/>
        </linearGradient>
        <radialGradient id="yz-sheen" cx="0.3" cy="0.22" r="0.6">
          <stop offset="0" stop-color="#ffffff" stop-opacity="0.85"/>
          <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
        </radialGradient>
        <!-- pips are drilled in: dark where the lip shades them, lighter on
             the far wall that catches the light -->
        <radialGradient id="yz-pip" cx="0.38" cy="0.36" r="0.7">
          <stop offset="0" stop-color="#07090a"/>
          <stop offset="0.7" stop-color="#1b2023"/>
          <stop offset="1" stop-color="#4b5257"/>
        </radialGradient>
        <linearGradient id="yz-word" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#ffffff"/>
          <stop offset="0.5" stop-color="#f6f2e8"/>
          <stop offset="1" stop-color="#ddd6c5"/>
        </linearGradient>
        <!-- felt nap: fine noise tinted to the cloth, a dark and a light pass -->
        <filter id="yz-nap" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" seed="7" result="n"/>
          <feColorMatrix in="n" type="matrix" result="dark"
                         values="0 0 0 0 0.01  0 0 0 0 0.12  0 0 0 0 0.06  -1.1 0 0 0 0.62"/>
          <feColorMatrix in="n" type="matrix" result="light"
                         values="0 0 0 0 0.6  0 0 0 0 0.95  0 0 0 0 0.75  0.9 0 0 0 -0.5"/>
          <feMerge><feMergeNode in="dark"/><feMergeNode in="light"/></feMerge>
        </filter>
        <filter id="yz-soft" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="0.9"/>
        </filter>
        <filter id="yz-drop" x="-45%" y="-45%" width="190%" height="190%">
          <feDropShadow dx="0" dy="2" stdDeviation="1.2" flood-color="#021209" flood-opacity="0.55"/>
          <feDropShadow dx="0" dy="6" stdDeviation="5" flood-color="#021209" flood-opacity="0.45"/>
        </filter>
      </defs>

      <rect width="320" height="200" fill="url(#yz-felt)"/>
      <rect width="320" height="200" filter="url(#yz-nap)" opacity="0.5"/>
      <rect width="320" height="200" fill="url(#yz-lamp)"/>

      <!-- two dice, thrown: a five low on the left, a three high on the right -->
      <g transform="translate(10,110) rotate(-14 28.0 28.0) scale(0.9655)" filter="url(#yz-drop)">
        <rect y="4" width="58" height="58" rx="13" fill="#a59d89"/>
        <rect width="58" height="58" rx="13" fill="url(#yz-ivory)"/>
        <rect width="58" height="58" rx="13" fill="url(#yz-sheen)"/>
        <rect x="0.8" y="0.8" width="56.4" height="56.4" rx="12.2" fill="none" stroke="#ffffff" stroke-opacity="0.8" stroke-width="1.6"/>
        <path d="M2.5 29 L2.5 15 Q2.5 2.5 15 2.5 L43 2.5 Q50 2.5 52 5 Q30 8 18 18 Q8 27 2.5 29 Z" fill="#ffffff" opacity="0.55"/>
        <path d="M8 22 Q9 9 22 8" fill="none" stroke="#ffffff" stroke-width="3.6" stroke-linecap="round" filter="url(#yz-soft)"/>
        <g fill="url(#yz-pip)"><circle cx="16" cy="16" r="5.4"/><circle cx="42" cy="16" r="5.4"/><circle cx="29" cy="29" r="5.4"/><circle cx="16" cy="42" r="5.4"/><circle cx="42" cy="42" r="5.4"/></g>
      </g>
      <g transform="translate(250,30) rotate(17 25.0 25.0) scale(0.8621)" filter="url(#yz-drop)">
        <rect y="4" width="58" height="58" rx="13" fill="#a59d89"/>
        <rect width="58" height="58" rx="13" fill="url(#yz-ivory)"/>
        <rect width="58" height="58" rx="13" fill="url(#yz-sheen)"/>
        <rect x="0.8" y="0.8" width="56.4" height="56.4" rx="12.2" fill="none" stroke="#ffffff" stroke-opacity="0.8" stroke-width="1.6"/>
        <path d="M2.5 29 L2.5 15 Q2.5 2.5 15 2.5 L43 2.5 Q50 2.5 52 5 Q30 8 18 18 Q8 27 2.5 29 Z" fill="#ffffff" opacity="0.55"/>
        <path d="M8 22 Q9 9 22 8" fill="none" stroke="#ffffff" stroke-width="3.6" stroke-linecap="round" filter="url(#yz-soft)"/>
        <g fill="url(#yz-pip)"><circle cx="16" cy="16" r="5.4"/><circle cx="29" cy="29" r="5.4"/><circle cx="42" cy="42" r="5.4"/></g>
      </g>

      <!-- the word, in the dice's own ivory with a thick edge -->
      <g font-family="Anton, Impact, sans-serif" font-size="92" letter-spacing="3" text-anchor="middle" filter="url(#yz-drop)">
        <text x="160" y="143" fill="#a59d89">DICE</text>
        <text x="160" y="139" fill="url(#yz-word)">DICE</text>
      </g>
    </svg>`,

  /* Infinite Kitchen — the game's Tuscan kitchen: a dark walnut counter lit
     from the window, the title in Fraunces italic (brass "Infinite", cream
     "Kitchen" with a thick edge), and one real recipe from the game laid out
     in its own paper pantry chips, the result still marked new. */
  'infinite-kitchen': `
    <svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ik-wood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#5a3822"/>
          <stop offset="0.5" stop-color="#3a2415"/>
          <stop offset="1" stop-color="#22140a"/>
        </linearGradient>
        <!-- long walnut grain running across the board -->
        <filter id="ik-grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.006 0.22" numOctaves="3" seed="5" result="n"/>
          <feColorMatrix in="n" type="matrix"
                         values="0 0 0 0 0.09  0 0 0 0 0.05  0 0 0 0 0.02  1.6 0 0 0 -0.55"/>
        </filter>
        <radialGradient id="ik-window" cx="0.18" cy="0.05" r="0.95">
          <stop offset="0" stop-color="#ffd9a0" stop-opacity="0.32"/>
          <stop offset="0.55" stop-color="#ffd9a0" stop-opacity="0.06"/>
          <stop offset="1" stop-color="#0d0703" stop-opacity="0.45"/>
        </radialGradient>
        <linearGradient id="ik-cream" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#fffaf0"/>
          <stop offset="1" stop-color="#ecdcbd"/>
        </linearGradient>
        <linearGradient id="ik-brass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#e8cb8a"/>
          <stop offset="1" stop-color="#b48a42"/>
        </linearGradient>
        <linearGradient id="ik-paper" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#fbf1dc"/>
          <stop offset="1" stop-color="#f4e6c8"/>
        </linearGradient>
        <filter id="ik-drop" x="-15%" y="-30%" width="130%" height="170%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#0d0703" flood-opacity="0.65"/>
        </filter>
        <filter id="ik-chip" x="-20%" y="-40%" width="140%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="1.6" flood-color="#140a00" flood-opacity="0.5"/>
        </filter>
      </defs>

      <rect width="320" height="200" fill="url(#ik-wood)"/>
      <rect width="320" height="200" filter="url(#ik-grain)"/>
      <rect width="320" height="200" fill="url(#ik-window)"/>

      <!-- the title -->
      <g font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="700" text-anchor="middle" filter="url(#ik-drop)">
        <text x="160" y="58" font-size="34" fill="url(#ik-brass)" letter-spacing="0.5">Infinite</text>
        <text x="160" y="124" font-size="70" fill="#b39468">Kitchen</text>
        <text x="160" y="121" font-size="70" fill="url(#ik-cream)">Kitchen</text>
      </g>

      <!-- Flour + Water = Dough, in the pantry's paper chips -->
      <g font-family="Inter, system-ui, sans-serif" font-weight="500">
        <g filter="url(#ik-chip)"><rect x="47.5" y="148" width="50" height="24" rx="4" fill="url(#ik-paper)" stroke="#c9b28a"/></g>
        <text x="57.5" y="164.5" font-size="12.5" fill="#2b2219">Flour</text>
        <text x="109.5" y="165" text-anchor="middle" font-size="17" fill="#f7efdf">+</text>
        <g filter="url(#ik-chip)"><rect x="121.5" y="148" width="56" height="24" rx="4" fill="url(#ik-paper)" stroke="#c9b28a"/></g>
        <text x="131.5" y="164.5" font-size="12.5" fill="#2b2219">Water</text>
        <text x="189.5" y="165" text-anchor="middle" font-size="17" fill="#f7efdf">=</text>
        <g filter="url(#ik-chip)"><rect x="201.5" y="148" width="71" height="24" rx="4" fill="url(#ik-paper)" stroke="#c9b28a"/></g>
        <text x="211.5" y="164.5" font-size="12.5" fill="#2b2219">Dough</text>
        <circle cx="259.5" cy="160.0" r="3" fill="#b5462f"/>
      </g>
      <!-- a little spilt flour -->
      <g fill="#fbf1dc" opacity="0.55"><circle cx="69.5" cy="181.6" r="1.2"/><circle cx="70.4" cy="181.1" r="1.0"/><circle cx="52.9" cy="181.1" r="1.0"/><circle cx="90.7" cy="176.9" r="0.7"/><circle cx="47.1" cy="184.1" r="1.1"/><circle cx="44.1" cy="185.8" r="1.3"/><circle cx="82.0" cy="182.2" r="0.6"/><circle cx="42.4" cy="181.3" r="0.5"/><circle cx="53.3" cy="178.4" r="0.5"/><circle cx="70.3" cy="180.4" r="1.2"/><circle cx="73.7" cy="182.4" r="0.9"/><circle cx="82.6" cy="180.6" r="0.7"/><circle cx="103.4" cy="186.0" r="1.2"/><circle cx="85.4" cy="179.2" r="0.7"/></g>
    </svg>`,
  /* Destroy — the word half blown away: a chunk bitten out of it, pixel
     fire where the rocket landed, and a few loose letters on the floor. */
  destroy: `
    <svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <mask id="ds-bite">
          <rect width="320" height="200" fill="#fff"/>
          <path d="M214 58 L236 70 L252 62 L262 84 L278 90 L268 110 L276 128 L252 132 L240 146 L226 128 L206 124 L212 104 L200 88 Z" fill="#000"/>
        </mask>
      </defs>
      <rect width="320" height="200" fill="#0b0b0f"/>
      <g mask="url(#ds-bite)">
        <text x="160" y="128" text-anchor="middle" font-family="Anton, Impact, sans-serif" font-size="70"
              letter-spacing="2" fill="#7a1f0b" transform="translate(4,4)">DESTROY</text>
        <text x="160" y="128" text-anchor="middle" font-family="Anton, Impact, sans-serif" font-size="70"
              letter-spacing="2" fill="#ff6a3d">DESTROY</text>
      </g>
      <g>
        <rect x="228" y="90" width="12" height="12" fill="#fff3b0"/>
        <rect x="240" y="96" width="9" height="9" fill="#ffc23d"/>
        <rect x="219" y="102" width="9" height="9" fill="#ffc23d"/>
        <rect x="246" y="84" width="6" height="6" fill="#ff7a1a"/>
        <rect x="231" y="78" width="6" height="6" fill="#ff7a1a"/>
        <rect x="252" y="108" width="6" height="6" fill="#b8341b"/>
        <rect x="212" y="90" width="6" height="6" fill="#b8341b"/>
        <rect x="237" y="112" width="6" height="6" fill="#ff7a1a"/>
        <rect x="258" y="74" width="3" height="3" fill="#ffd166"/>
        <rect x="204" y="76" width="3" height="3" fill="#ffd166"/>
        <rect x="266" y="98" width="3" height="3" fill="#ffd166"/>
      </g>
      <g font-family="Anton, Impact, sans-serif" font-size="22" fill="#ff6a3d">
        <text transform="translate(236,184) rotate(24)">R</text>
        <text transform="translate(266,186) rotate(-68)">O</text>
      </g>
      <rect x="0" y="186" width="320" height="14" fill="#16161d"/>
    </svg>`,
};
