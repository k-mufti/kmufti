# kmufti.com

A little hub of small projects.

- **`/`** — the landing page: a shared-style white canvas you can draw pixels on, with an app launcher.
- **`/jeoprady/`** — **Larprady!**, a multi-team Jeopardy game with real episodes + a custom board builder.
- **`/wishlist/`** — paste a product link (or use the **+ wish** bookmarklet) and it becomes a draggable cutout on a scrapbook board, with a shopping cart + shareable list.

Almost entirely static. The only server-side piece is the wishlist backend
(`wishlist/server.js`) which scrapes link previews and proxies product images.

See [DEPLOY.md](DEPLOY.md) for hosting on a VPS with nginx.


