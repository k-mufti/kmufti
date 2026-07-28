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

  /* Wishlist — overlapping product cards on warm paper, matching the app's
     clean white-and-ink look with its muted-green "got it" accent. */
  wishlist: `
    <svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="wl-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#f8f6f1"/>
          <stop offset="1" stop-color="#e8e2d8"/>
        </linearGradient>
        <filter id="wl-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#1a1a1a" flood-opacity="0.13"/>
        </filter>
      </defs>
      <rect width="320" height="200" fill="url(#wl-bg)"/>
      <!-- back card -->
      <g transform="rotate(7 224 100)" filter="url(#wl-shadow)">
        <rect x="184" y="44" width="104" height="118" rx="12" fill="#ffffff"/>
        <rect x="198" y="58" width="76" height="44" rx="7" fill="#ece7df"/>
        <rect x="198" y="114" width="58" height="7" rx="3.5" fill="#e0d9cf"/>
        <rect x="198" y="128" width="36" height="7" rx="3.5" fill="#e9e3da"/>
      </g>
      <!-- front card -->
      <g transform="rotate(-5 108 106)" filter="url(#wl-shadow)">
        <rect x="46" y="46" width="122" height="120" rx="14" fill="#ffffff"/>
        <rect x="58" y="58" width="98" height="52" rx="8" fill="#ece7df"/>
        <!-- product silhouette in the image area -->
        <rect x="92" y="66" width="30" height="36" rx="6" fill="#cabfb0"/>
        <!-- title + subtitle lines -->
        <rect x="58" y="122" width="72" height="8" rx="4" fill="#1a1a1a" opacity="0.82"/>
        <rect x="58" y="136" width="46" height="7" rx="3.5" fill="#cfc7bc"/>
        <!-- muted-green price pill (the app's positive accent) -->
        <rect x="58" y="150" width="46" height="16" rx="8" fill="#3f7d5a"/>
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
