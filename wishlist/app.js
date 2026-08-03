(function () {
  "use strict";

  const STORAGE_KEY = "kmufti_wishlist_items_v3"; // v3: free-positioned scrapbook
  const UNFURL_ENDPOINT = "api/unfurl";
  const IMG_PROXY = "api/img?src="; // server-side image proxy (beats hotlink blocks)

  const form = document.getElementById("add-form");
  const input = document.getElementById("add-input");
  const addBtn = document.getElementById("add-btn");
  const statusEl = document.getElementById("add-status");
  const template = document.getElementById("card-template");
  const collage = document.getElementById("collage");
  const emptyNote = document.getElementById("empty-note");
  const cartFab = document.getElementById("cart-fab");
  const cartBadge = document.getElementById("cart-badge");
  const cartPanel = document.getElementById("cart-panel");
  const cartList = document.getElementById("cart-list");
  const cartEmpty = document.getElementById("cart-empty");
  const cartSummary = document.getElementById("cart-summary");
  const cartActions = document.getElementById("cart-actions");
  const cartClose = document.getElementById("cart-close");
  const cartClear = document.getElementById("cart-clear");
  const cartShare = document.getElementById("cart-share");

  // ---------- Storage ----------
  function loadItems() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  function saveItems() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    // Notify other open wishlist tabs (covers add / move / delete uniformly,
    // since every change goes through here). More reliable than the storage
    // event alone, which can miss a write made during a new tab's load.
    if (syncChannel) { try { syncChannel.postMessage("changed"); } catch {} }
  }

  let items = loadItems();

  // ---------- Cross-tab sync ----------
  let syncChannel = null;
  try { syncChannel = new BroadcastChannel("kmufti_wishlist_sync"); } catch {}
  let syncPending = false;
  function syncFromOtherTabs() {
    if (syncPending) return;
    if (document.querySelector(".item.dragging")) return; // don't disrupt a drag
    syncPending = true;
    requestAnimationFrame(() => {
      syncPending = false;
      items = loadItems();
      render();
    });
  }
  if (syncChannel) syncChannel.addEventListener("message", syncFromOtherTabs);

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }
  function domainFromUrl(url) {
    try {
      return new URL(url).hostname.replace(/^www\./, "");
    } catch {
      return "";
    }
  }
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  // Pull a number + currency symbol out of a price string like "$1,299.00".
  function parsePrice(str) {
    if (!str) return { value: null, currency: "" };
    const s = String(str);
    const symMatch = s.match(/[$€£¥]/);
    const num = s.replace(/[^0-9.]/g, "");
    const v = parseFloat(num);
    return { value: isFinite(v) ? v : null, currency: symMatch ? symMatch[0] : "" };
  }

  // ---------- Scrapbook placement ----------
  // Positions are stored width-relative (fx, fw in 0..1) so they scale with the
  // canvas; ypx is absolute vertical. A new item is dropped at whichever of
  // several random candidate spots overlaps the fewest existing items.
  function placeItem(item, count) {
    const W = collage.clientWidth || 1000;
    item.fw = 0.13 + Math.random() * 0.07; // ~13–20% of canvas width
    item.rot = (Math.random() * 2 - 1) * 13;

    const rPx = (item.fw * W) / 2;
    const vSpan = Math.max(360, 120 + count * 78); // canvas grows with items
    const placed = items.filter((it) => it !== item && it.fx != null);

    let best = null;
    let bestScore = Infinity;
    for (let t = 0; t < 30; t++) {
      const fx = 0.08 + Math.random() * 0.84;
      const yPx = 90 + Math.random() * vSpan;
      const cxPx = fx * W;
      let overlap = 0;
      for (const o of placed) {
        const oR = (o.fw * W) / 2;
        const dist = Math.hypot(cxPx - o.fx * W, yPx - o.ypx);
        overlap += Math.max(0, rPx + oR - dist);
      }
      if (overlap < bestScore) {
        bestScore = overlap;
        best = { fx, ypx: yPx };
        if (overlap === 0) break;
      }
    }
    item.fx = best.fx;
    item.ypx = best.ypx;
  }

  function ensurePlacements() {
    items.forEach((it, i) => {
      if (it.fx == null || it.ypx == null || it.fw == null) placeItem(it, items.length);
    });
  }

  // ---------- Rendering ----------
  function render() {
    collage.innerHTML = "";
    const boardItems = items.filter((it) => !it.inCart);
    emptyNote.style.display = boardItems.length ? "none" : "block";
    ensurePlacements();
    boardItems.forEach((item) => collage.appendChild(renderItem(item)));
    layout();
    updateCartFab();
    if (!cartPanel.hidden) renderCartPanel();
  }

  function layout() {
    const W = collage.clientWidth || 1000;
    let maxY = 0;
    collage.querySelectorAll(".item").forEach((node) => {
      const item = items.find((it) => it.id === node.dataset.id);
      if (!item) return;
      const wPx = clamp(item.fw * W, 90, 260);
      node.style.left = item.fx * W + "px";
      node.style.top = item.ypx + "px";
      node.style.width = wPx + "px";
      node.style.setProperty("--rot", item.rot.toFixed(2) + "deg");
      if (item.ypx > maxY) maxY = item.ypx;
    });
    collage.style.height = (items.length ? maxY + 220 : 0) + "px";
  }

  function renderItem(item) {
    const node = template.content.firstElementChild.cloneNode(true);
    node.dataset.id = item.id;
    if (item.bought) node.classList.add("item--bought");

    const link = node.querySelector(".item-link");
    link.href = item.url;

    const img = node.querySelector(".item-img");
    const fallback = node.querySelector(".item-fallback");
    const glyph = node.querySelector(".item-glyph");
    if (item.image) {
      // Load the image directly first (no-referrer helps with some CDNs). If it
      // fails — usually hotlink protection — retry through our server proxy,
      // which sends a same-origin Referer. Only then fall back to the glyph.
      let stage = 0;
      img.referrerPolicy = "no-referrer";
      img.addEventListener("error", () => {
        if (stage === 0 && /^https?:/i.test(item.image)) {
          stage = 1;
          img.src = IMG_PROXY + encodeURIComponent(item.image);
        } else {
          img.hidden = true;
          fallback.classList.add("show");
        }
      });
      img.src = item.image;
    } else {
      img.hidden = true;
      fallback.classList.add("show");
    }
    glyph.textContent = (item.domain || item.title || "?").charAt(0).toUpperCase();

    node.querySelector(".item-title").textContent = item.title || item.url;
    node.querySelector(".item-price").textContent = item.price || "";

    node.querySelector(".item-remove").addEventListener("pointerdown", (e) => {
      e.stopPropagation(); // don't start a drag
    });
    node.querySelector(".item-remove").addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      removeItem(item.id);
    });

    node.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      item.bought = !item.bought;
      node.classList.toggle("item--bought", item.bought);
      saveItems();
    });

    // We drive navigation ourselves (see enableDrag), so the anchor's own
    // click never fires a second navigation. Also block native link dragging.
    link.addEventListener("click", (e) => e.preventDefault());
    link.addEventListener("dragstart", (e) => e.preventDefault());

    enableDrag(node, item);
    return node;
  }

  function removeItem(id) {
    items = items.filter((it) => it.id !== id);
    saveItems();
    render();
  }

  // ---------- Shopping cart ----------
  function updateCartFab() {
    const n = items.reduce((a, it) => a + (it.inCart ? 1 : 0), 0);
    cartBadge.textContent = n;
    cartBadge.hidden = n === 0;
  }

  function bumpCart() {
    cartFab.classList.remove("cart-fab--bump");
    void cartFab.offsetWidth; // reflow so the animation can restart
    cartFab.classList.add("cart-fab--bump");
  }

  function addToCart(item) {
    if (item.inCart) return;
    item.inCart = true;
    saveItems();
    render(); // pulls it off the board, refreshes badge + panel
    bumpCart();
  }

  function removeFromCart(id) {
    const it = items.find((x) => x.id === id);
    if (!it) return;
    it.inCart = false;
    it.fx = null; it.ypx = null; it.fw = null; // re-drop cleanly on the board
    saveItems();
    render();
  }

  function clearCart() {
    items.forEach((it) => {
      if (it.inCart) { it.inCart = false; it.fx = null; it.ypx = null; it.fw = null; }
    });
    saveItems();
    render();
  }

  function toggleCartPanel(force) {
    const open = force != null ? force : cartPanel.hidden;
    cartPanel.hidden = !open;
    cartFab.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : ""; // lock scroll behind the screen
    if (open) {
      renderCartPanel();
      cartPanel.scrollTop = 0;
    }
  }

  function cartGlyphThumb(item) {
    const g = document.createElement("div");
    g.className = "cart-thumb-glyph";
    g.textContent = (item.domain || item.title || "?").charAt(0).toUpperCase();
    return g;
  }

  function renderCartRow(item) {
    const row = document.createElement("div");
    row.className = "cart-row";

    if (item.image) {
      const img = document.createElement("img");
      img.className = "cart-thumb";
      img.alt = "";
      img.referrerPolicy = "no-referrer";
      let stage = 0;
      img.addEventListener("error", () => {
        if (stage === 0 && /^https?:/i.test(item.image)) {
          stage = 1;
          img.src = IMG_PROXY + encodeURIComponent(item.image);
        } else {
          img.replaceWith(cartGlyphThumb(item));
        }
      });
      img.src = item.image;
      row.appendChild(img);
    } else {
      row.appendChild(cartGlyphThumb(item));
    }

    const body = document.createElement("div");
    body.className = "cart-row-body";
    const title = document.createElement("a");
    title.className = "cart-row-title";
    title.href = item.url;
    title.target = "_blank";
    title.rel = "noopener noreferrer";
    title.textContent = item.title || item.url;
    const price = document.createElement("button");
    price.type = "button";
    const parsed = parsePrice(item.price);
    price.className = "cart-row-price" + (parsed.value == null ? " none" : "");
    price.textContent = item.price || "+ add price";
    price.title = "Click to edit price";
    price.addEventListener("click", (e) => {
      e.stopPropagation();
      editPrice(item, price);
    });
    body.appendChild(title);
    body.appendChild(price);
    row.appendChild(body);

    const rm = document.createElement("button");
    rm.className = "cart-row-remove";
    rm.innerHTML = "&times;";
    rm.title = "Remove from cart";
    rm.setAttribute("aria-label", "Remove from cart");
    rm.addEventListener("click", () => removeFromCart(item.id));
    row.appendChild(rm);

    return row;
  }

  // Inline price editing — swap the price button for a text field.
  function editPrice(item, el) {
    const input = document.createElement("input");
    input.type = "text";
    input.className = "cart-price-input";
    input.value = item.price || "";
    input.placeholder = "$0.00";
    el.replaceWith(input);
    input.focus();
    input.select();
    let done = false;
    const commit = () => {
      if (done) return;
      done = true;
      const parsed = parsePrice(input.value);
      item.price = parsed.value != null ? (parsed.currency || "$") + parsed.value.toFixed(2) : "";
      saveItems();
      renderCartPanel();
    };
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); commit(); }
      else if (e.key === "Escape") { done = true; renderCartPanel(); }
    });
    input.addEventListener("blur", commit);
  }

  function renderCartSummary(inCart) {
    cartSummary.innerHTML = "";
    if (inCart.length === 0) return;

    let total = 0, priced = 0;
    const curCount = {};
    inCart.forEach((it) => {
      const p = parsePrice(it.price);
      if (p.value != null) { total += p.value; priced++; }
      if (p.currency) curCount[p.currency] = (curCount[p.currency] || 0) + 1;
    });
    const sym = Object.keys(curCount).sort((a, b) => curCount[b] - curCount[a])[0] || "$";
    const mixed = Object.keys(curCount).length > 1;
    const unpriced = inCart.length - priced;
    const avg = priced ? total / priced : 0;
    const fmt = (n) => sym + n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const totalRow = document.createElement("div");
    totalRow.className = "cart-total-row";
    const tl = document.createElement("span");
    tl.className = "cart-total-label";
    tl.textContent = "Total";
    const tv = document.createElement("span");
    tv.className = "cart-total-value";
    tv.textContent = fmt(total);
    totalRow.appendChild(tl);
    totalRow.appendChild(tv);
    cartSummary.appendChild(totalRow);

    const stats = document.createElement("div");
    stats.className = "cart-stats";
    const add = (text, warn) => {
      const s = document.createElement("span");
      if (warn) s.className = "warn";
      s.textContent = text;
      stats.appendChild(s);
    };
    add(`${inCart.length} item${inCart.length === 1 ? "" : "s"}`);
    if (priced) add(`avg ${fmt(avg)}`);
    if (unpriced) add(`${unpriced} without a price`, true);
    if (mixed) add("mixed currencies", true);
    cartSummary.appendChild(stats);
  }

  // Tidy a scraped product title (share text only). Peels off store/category
  // segments and descriptor tails, then keeps the meatiest chunk.
  const KNOWN_STORES = /^(amazon|ebay|etsy|walmart|target|best ?buy|newegg|aliexpress|wayfair|nordstrom|macy'?s|shein|temu|nike|adidas|hollister|abercrombie|lululemon|zara|uniqlo)\b/i;

  function isStoreSegment(seg, brand) {
    const s = seg.trim();
    if (!s) return true;
    if (/[a-z0-9-]+\.(com|net|org|co|io|shop)\b/i.test(s)) return true; // bare domain
    const short = s.split(" ").length <= 3 && s.length <= 22;
    if (short && KNOWN_STORES.test(s)) return true;
    if (short && brand && brand.length > 2 &&
        s.toLowerCase().replace(/[^a-z0-9]/g, "").startsWith(brand)) return true;
    return false;
  }

  function cleanTitle(it) {
    const raw = (it.title || "").replace(/\s+/g, " ").trim();
    if (!raw) return domainFromUrl(it.url) || it.url;
    const brand = (domainFromUrl(it.url).split(".")[0] || "").toLowerCase();

    // 1) split on strong separators into segments
    const segs = raw.split(/\s*[|–—·›»]\s*/).map((s) => s.trim()).filter(Boolean);
    // 2) drop store-looking segments (categories fall away via longest-wins)
    let kept = segs.filter((s) => !isStoreSegment(s, brand));
    if (!kept.length) kept = segs;
    // 3) keep the longest remaining segment — usually the product name
    let t = kept.reduce((a, b) => (b.length > a.length ? b : a), "");
    // 4) trim tails: spaced-colon/hyphen category, comma descriptor, spec parens
    //    (spaced colon keeps names like "Star Wars: X-Wing" intact)
    t = t.split(" : ")[0].split(" - ")[0].split(",")[0].split("(")[0];
    t = t.replace(/\s+/g, " ").trim();
    // 5) cap length on a word boundary
    if (t.length > 48) {
      const words = t.split(" ");
      let out = words[0] || "";
      for (let i = 1; i < words.length; i++) {
        if ((out + " " + words[i]).length > 48) break;
        out += " " + words[i];
      }
      t = out.trim() + "…";
    }
    return t || domainFromUrl(it.url) || it.url;
  }

  // Build a clean, text-message-ready summary of the cart. The pretty list and
  // the (unavoidably ugly) links are kept in separate blocks.
  function buildShareText() {
    const inCart = items.filter((it) => it.inCart);
    if (!inCart.length) return "";
    let total = 0;
    const curCount = {};
    inCart.forEach((it) => {
      const p = parsePrice(it.price);
      if (p.value != null) total += p.value;
      if (p.currency) curCount[p.currency] = (curCount[p.currency] || 0) + 1;
    });
    const sym = Object.keys(curCount).sort((a, b) => curCount[b] - curCount[a])[0] || "$";
    const count = inCart.length;
    const rule = "──────────────";

    // Blank line between each item; links kept as a compact numbered block.
    const itemBlock = inCart
      .map((it) => `◦ ${cleanTitle(it)}${it.price ? "  —  " + it.price : ""}`)
      .join("\n\n");
    const linkBlock = inCart.map((it, i) => `${i + 1}. ${it.url}`).join("\n");

    return [
      `🛍️  my wish list (thanks in advance)`,
      `${count} item${count === 1 ? "" : "s"} · ${sym}${total.toFixed(2)}`,
      rule,
      itemBlock,
      rule,
      "🔗 links",
      linkBlock,
    ].join("\n");
  }

  async function shareCart() {
    const text = buildShareText();
    if (!text) return;
    let ok = false;
    try {
      await navigator.clipboard.writeText(text);
      ok = true;
    } catch {
      // Fallback for older/insecure contexts.
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        ok = document.execCommand("copy");
        document.body.removeChild(ta);
      } catch { ok = false; }
    }
    cartShare.textContent = ok ? "copied to clipboard!" : "couldn't copy";
    cartShare.classList.toggle("copied", ok);
    setTimeout(() => {
      cartShare.textContent = "copy list to share";
      cartShare.classList.remove("copied");
    }, 2000);
  }

  function renderCartPanel() {
    const inCart = items.filter((it) => it.inCart);
    cartEmpty.hidden = inCart.length > 0;
    cartActions.hidden = inCart.length === 0;
    cartList.innerHTML = "";
    inCart.forEach((it) => cartList.appendChild(renderCartRow(it)));
    renderCartSummary(inCart);
  }

  // ---------- Free-drag repositioning ----------
  // Uses transform (compositor-only, no layout reflow) for the live drag and
  // drops the blend-mode/filter while moving, so dragging stays smooth even
  // with many overlapping items. Moves are coalesced to one rAF per frame.
  function enableDrag(node, item) {
    let startX, startY, startLeft, startTop, W;
    let dx = 0, dy = 0, rafId = null;
    let cartRect = null, overCart = false;
    let dragging = false;

    const baseTransform = () =>
      `translate(-50%, -50%) rotate(${item.rot.toFixed(2)}deg)`;

    function applyOffset() {
      rafId = null;
      node.style.transform =
        `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) rotate(${item.rot.toFixed(2)}deg)`;
    }

    // Drag is driven by document-level listeners (not pointer capture), so it
    // keeps tracking even if the pointer leaves the node or the browser drops
    // capture — which was causing drags to lag and snap back to the origin.
    function onMove(e) {
      if (!dragging) return;
      dx = e.clientX - startX;
      dy = e.clientY - startY;
      if (!node._dragMoved && Math.hypot(dx, dy) > 4) node._dragMoved = true;
      if (!node._dragMoved) return;
      const newLeft = clamp(startLeft + dx, W * 0.04, W * 0.96);
      const newTop = Math.max(40, startTop + dy);
      dx = newLeft - startLeft;
      dy = newTop - startTop;
      const nowOver =
        e.clientX >= cartRect.left && e.clientX <= cartRect.right &&
        e.clientY >= cartRect.top && e.clientY <= cartRect.bottom;
      if (nowOver !== overCart) {
        overCart = nowOver;
        cartFab.classList.toggle("cart-fab--over", overCart);
        cartFab.classList.toggle("cart-fab--armed", !overCart);
      }
      if (!rafId) rafId = requestAnimationFrame(applyOffset);
    }

    function stopDrag() {
      dragging = false;
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointercancel", onCancel);
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      node.classList.remove("dragging");
      collage.classList.remove("dragging-active");
      cartFab.classList.remove("cart-fab--over", "cart-fab--armed");
      document.body.style.userSelect = "";
    }

    function onUp() {
      if (!dragging) return;
      const moved = node._dragMoved;
      const droppedOnCart = moved && overCart;
      stopDrag();
      if (droppedOnCart) {
        node.style.transform = baseTransform();
        addToCart(item);
        return;
      }
      if (moved) {
        // commit the new position
        item.fx = clamp((startLeft + dx) / W, 0.04, 0.96);
        item.ypx = Math.max(40, startTop + dy);
        node.style.left = item.fx * W + "px";
        node.style.top = item.ypx + "px";
        saveItems();
        layout(); // grow canvas if dragged downward
      }
      node.style.transform = baseTransform();
      if (!moved) {
        // a clean press-release with no movement = open the product link
        window.open(item.url, "_blank", "noopener");
      }
    }

    function onCancel() {
      if (!dragging) return;
      stopDrag();
      node.style.transform = baseTransform(); // only a genuine cancel resets
    }

    node.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      if (e.target.closest(".item-remove")) return;
      e.preventDefault(); // stop native link-drag / text selection
      W = collage.clientWidth || 1000;
      startX = e.clientX;
      startY = e.clientY;
      startLeft = item.fx * W;
      startTop = item.ypx;
      dx = 0;
      dy = 0;
      node._dragMoved = false;
      cartRect = cartFab.getBoundingClientRect();
      overCart = false;
      dragging = true;
      node.classList.add("dragging");
      collage.classList.add("dragging-active"); // drop blend-mode for smoothness
      cartFab.classList.add("cart-fab--armed");
      document.body.style.userSelect = "none";
      document.addEventListener("pointermove", onMove);
      document.addEventListener("pointerup", onUp);
      document.addEventListener("pointercancel", onCancel);
    });
  }

  // ---------- Add via unfurl ----------
  function setStatusMsg(msg, kind) {
    statusEl.textContent = msg;
    statusEl.className = "add-status" + (kind ? " " + kind : "");
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const url = input.value.trim();
    if (!url) return;

    let parsedUrl;
    try {
      parsedUrl = new URL(url);
      if (!/^https?:$/.test(parsedUrl.protocol)) throw new Error("bad protocol");
    } catch {
      setStatusMsg("that doesn't look like a valid link", "error");
      return;
    }

    addBtn.disabled = true;
    setStatusMsg("fetching product info…");

    let meta = { title: "", image: "", price: "", domain: "" };
    let fetchFailed = false;
    try {
      const res = await fetch(UNFURL_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: parsedUrl.href }),
      });
      if (res.ok) meta = await res.json();
      else fetchFailed = true;
    } catch {
      fetchFailed = true;
    }

    const newItem = {
      id: uid(),
      url: parsedUrl.href,
      title: meta.title || parsedUrl.hostname,
      image: meta.image || "",
      price: meta.price || "",
      domain: meta.domain || domainFromUrl(parsedUrl.href),
      addedAt: new Date().toISOString(),
      bought: false,
      fx: null,
      ypx: null,
      fw: null,
      rot: 0,
    };
    placeItem(newItem, items.length + 1);
    items.push(newItem);
    saveItems();
    render();

    input.value = "";
    addBtn.disabled = false;
    if (fetchFailed) {
      setStatusMsg("added — but couldn't grab an image for that site", "error");
      setTimeout(() => setStatusMsg(""), 3000);
    } else {
      setStatusMsg("added ✓", "ok");
      setTimeout(() => setStatusMsg(""), 2000);
    }
  });

  // Reposition on resize (positions are width-relative)
  let resizeRAF = null;
  window.addEventListener("resize", () => {
    if (resizeRAF) cancelAnimationFrame(resizeRAF);
    resizeRAF = requestAnimationFrame(layout);
  });

  // Backup path: the storage event also fires in other same-origin tabs.
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY) syncFromOtherTabs();
  });

  // ---------- Add via query params (used by the bookmarklet) ----------
  // The bookmarklet reads OG tags on the product page in the user's own browser
  // (which sees the real page, no bot block) and redirects here with:
  //   ?add=1&url=...&title=...&image=...
  function buildItemFromParams(params) {
    const url = params.get("url");
    if (!url) return null;
    let parsedUrl;
    try {
      parsedUrl = new URL(url);
      if (!/^https?:$/.test(parsedUrl.protocol)) return null;
    } catch {
      return null;
    }
    return {
      id: uid(),
      url: parsedUrl.href,
      title: params.get("title") || parsedUrl.hostname,
      image: params.get("image") || "",
      price: params.get("price") || "",
      domain: domainFromUrl(parsedUrl.href),
      addedAt: new Date().toISOString(),
      bought: false,
      fx: null,
      ypx: null,
      fw: null,
      rot: 0,
    };
  }

  function addIngestedItem(newItem) {
    placeItem(newItem, items.length + 1);
    items.push(newItem);
    saveItems();
    render();
  }

  const CURRENT_BMV = "4"; // bump whenever the bookmarklet code changes

  function reportAdd(newItem, bmv) {
    console.log("[wishlist] added:", {
      url: newItem.url,
      title: newItem.title,
      hasImage: !!newItem.image,
      bmv: bmv,
      price: newItem.price || "(empty)",
    });
    if (bmv !== CURRENT_BMV) {
      setStatusMsg(
        'added — but your "+ wish" is OUTDATED (v' + (bmv || "0") + '). Reload this page, then drag a fresh "+ wish" to your bookmarks bar (delete the old one) so prices come out right.',
        "error"
      );
    } else if (!newItem.price) {
      setStatusMsg("added — the page didn't show a price. Click the price in the cart to type one.", "error");
    } else {
      setStatusMsg("added — price: " + newItem.price, "ok");
    }
    setTimeout(() => setStatusMsg(""), 9000);
  }

  function ingestQueryParams() {
    const params = new URLSearchParams(location.search);
    if (params.get("add") !== "1") return;
    const newItem = buildItemFromParams(params);
    if (!newItem) return;
    const bmv = params.get("bmv") || "0";
    // clean the URL so a refresh doesn't add the item again
    history.replaceState({}, "", location.pathname);
    addIngestedItem(newItem);
    reportAdd(newItem, bmv);
  }

  // ---------- Bookmarklet ----------
  // Set the bookmarklet anchor's href to a javascript: URL that, when clicked
  // on any product page, opens this wishlist with pre-extracted metadata.
  // Image lookup: OG/Twitter tags first, then common product-image elements
  // (Amazon etc. don't expose og:image), then the largest image on the page.
  function setupBookmarklet() {
    const link = document.getElementById("bookmarklet");
    if (!link) return;
    const target = location.origin + location.pathname;
    // Kept as a single line so it survives being dragged to the bookmarks bar.
    const code =
      "javascript:(function(){" +
        "function q(s){var e=document.querySelector(s);return e?(e.content||e.href||''):''}" +
        "function I(){" +
          "var i=q('meta[property=\"og:image:secure_url\"]')||q('meta[property=\"og:image\"]')||q('meta[name=\"twitter:image\"]')||q('meta[name=\"twitter:image:src\"]')||q('link[rel=\"image_src\"]');" +
          "if(i)return i;" +
          "var S=['#landingImage','#imgBlkFront','#ebooksImgBlkFront','#main-image','img[data-old-hires]','#imageBlock img','#imgTagWrapperId img'],k,e,u;" +
          "for(k=0;k<S.length;k++){e=document.querySelector(S[k]);if(e){u=e.getAttribute('data-old-hires')||e.currentSrc||e.src;if(u)return u;}}" +
          "var b='',a=0,m=document.images,j,im,ar;" +
          "for(j=0;j<m.length;j++){im=m[j];ar=im.naturalWidth*im.naturalHeight;if(ar>a&&im.src&&/^https?:/.test(im.src)){a=ar;b=im.src;}}" +
          "return b;" +
        "}" +
        "function V(e){return !!(e&&(e.offsetWidth||e.offsetHeight||(e.getClientRects&&e.getClientRects().length)))}" +
        "function K(e){var n=e,i=0,t,c,d;while(n&&i<4){t=(n.tagName||'').toLowerCase();if(t=='del'||t=='s'||t=='strike')return true;c=((typeof n.className=='string'?n.className:'')+' '+(n.id||'')).toLowerCase();if(/strike|compare|original|msrp|rrp|slash|-was|was-/.test(c))return true;try{d=getComputedStyle(n);if(/line-through/.test(d.textDecorationLine||d.textDecoration||''))return true;}catch(_){}n=n.parentElement;i++;}return false}" +
        "function P(){" +
          "function norm(s){return s.replace(/[\\uff10-\\uff19]/g,function(d){return String.fromCharCode(d.charCodeAt(0)-65248)}).replace(/\\uffe5/g,'\\u00a5').replace(/\\uff04/g,'$').replace(/\\uffe1/g,'\\u00a3');}" +
          "var re=/[$\\u20ac\\u00a3\\u00a5\\uffe5\\uff04]\\s?[0-9\\uff10-\\uff19][0-9.,\\uff10-\\uff19]*/;" +
          "var az=document.querySelector('.a-price .a-offscreen,.priceToPay .a-offscreen');" +
          "if(az){var am=(az.textContent||'').match(re);if(am)return norm(am[0]).replace(/\\s/g,'');}" +
          "var N=document.querySelectorAll('span,b,strong,ins,p,h1,h2,h3,div,[itemprop=\"price\"]'),i,e,t,m,v,fs,B='',bf=-1;" +
          "for(i=0;i<N.length;i++){e=N[i];t=(e.getAttribute&&e.getAttribute('content'))||e.textContent||'';if(!t){continue}t=t.replace(/\\s+/g,' ').trim();if(!t||t.length>16)continue;if(!V(e)||K(e))continue;m=t.match(re);if(!m)continue;var mn=norm(m[0]);v=parseFloat(mn.replace(/[^0-9.]/g,''));if(!(v>0))continue;fs=0;try{fs=parseFloat(getComputedStyle(e).fontSize)||0;}catch(_){}if(fs>bf){bf=fs;B=mn.replace(/\\s/g,'');}}" +
          "if(B)return B;" +
          "var M={USD:'$',EUR:'\\u20ac',GBP:'\\u00a3',JPY:'\\u00a5',CAD:'$',AUD:'$'};" +
          "var a=q('meta[property=\"product:price:amount\"]')||q('meta[property=\"og:price:amount\"]')||q('meta[itemprop=\"price\"]');" +
          "var c=q('meta[property=\"product:price:currency\"]')||q('meta[property=\"og:price:currency\"]');" +
          "if(a)return (M[c]||'$')+a;" +
          "var L=document.querySelectorAll('script[type=\"application/ld+json\"]'),k,j,ar,x,o,f;" +
          "for(k=0;k<L.length;k++){try{j=JSON.parse(L[k].textContent);ar=Array.isArray(j)?j:(j['@graph']||[j]);for(x=0;x<ar.length;x++){f=ar[x]&&ar[x].offers;if(f){o=Array.isArray(f)?f[0]:f;if(o&&o.price)return (M[o.priceCurrency]||'$')+o.price;}}}catch(_){}}" +
          "return '';" +
        "}" +
        "var t=q('meta[property=\"og:title\"]')||document.title;" +
        "var p=new URLSearchParams({add:'1',bmv:'4',url:location.href,title:t,image:I(),price:P()});" +
        "window.open('" + target + "?'+p.toString(),'_blank');" +
      "})();";
    link.setAttribute("href", code);
    // Prevent an accidental click (before it's dragged) from doing nothing weird
    link.addEventListener("click", (e) => {
      e.preventDefault();
      setStatusMsg("drag me to your bookmarks bar", "");
      setTimeout(() => setStatusMsg(""), 2500);
    });
  }

  // ---------- Cart controls ----------
  cartFab.addEventListener("click", () => toggleCartPanel());
  cartClose.addEventListener("click", () => toggleCartPanel(false));
  cartClear.addEventListener("click", clearCart);
  cartShare.addEventListener("click", shareCart);
  // Click away from the panel (but not on the cart button) closes it.
  document.addEventListener("pointerdown", (e) => {
    if (cartPanel.hidden) return;
    if (cartPanel.contains(e.target) || cartFab.contains(e.target)) return;
    toggleCartPanel(false);
  });

  ingestQueryParams();
  setupBookmarklet();
  render();
})();
