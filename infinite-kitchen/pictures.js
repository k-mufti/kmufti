// Finds a picture for every piece of food, from Wikipedia.
//
//   node pictures.js           look up anything that doesn't have one yet
//   node pictures.js --all     look everything up again
//   node pictures.js Egg Kimchi  just these
//   node pictures.js --from old.json   the items in another recipe list
//
// Each item gets the lead photo of the Wikipedia article that best matches
// its name, and pictures.json keeps where that photo lives. The game loads
// the photo straight from Wikimedia, so nothing big is kept here.
//
// How an article is chosen, first hit wins:
//   1. pictures-fix.txt, where a wrong pick is put right by hand
//   2. the article with exactly that name
//   3. a search for "<name> food", then for the name alone, keeping only
//      articles that share a word with it
//   4. the name without its first word, so a Butter Cheeseburger falls back
//      to a Cheeseburger
// Nothing found means no picture, and the game prints the name instead.
"use strict";

const fs = require("fs");
const path = require("path");

const OUT = path.join(__dirname, "pictures.json");
const FIX = path.join(__dirname, "pictures-fix.txt");
const API = "https://en.wikipedia.org/w/api.php?";
const UA = "kmufti-hub Infinite Kitchen picture finder (themuftyman@gmail.com)";
const SIZE = 400;

// not a photo of food: drawings, logos, maps and the like
const BAD_FILE = /\.svg|\.gif|\.tiff?\b|logo|map\b|karte|flag|diagram|chart|icon|seal|coat.of.arms|wordmark|signature|portrait|structure|formula|molecule/i;
const SMALL_WORDS = new Set(["and", "of", "the", "with", "in", "a", "on", "de", "au", "la", "food"]);

// --from <file> looks up another recipe list's items, leaving the game's alone
const FROM = process.argv.includes("--from") ? process.argv[process.argv.indexOf("--from") + 1] : path.join(__dirname, "recipes.json");
const data = JSON.parse(fs.readFileSync(FROM, "utf8"));
const FOOD = Object.entries(data.items).filter(([, k]) => k !== "technique" && k !== "cuisine").map(([n]) => n);

const fixes = new Map();
if (fs.existsSync(FIX)) {
  for (const line of fs.readFileSync(FIX, "utf8").split("\n")) {
    const m = line.replace(/#.*/, "").match(/^(.+?)\s*=\s*(.+?)\s*$/);
    if (m) fixes.set(m[1], m[2]);
  }
}

async function api(params) {
  for (let tries = 0; ; tries++) {
    // a request that never answers would hang the whole run, so give up on it and try again
    let r = null;
    try {
      r = await fetch(API + new URLSearchParams({ format: "json", formatversion: 2, ...params }), { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(20000) });
      if (r.ok) return await r.json();
    } catch (e) {
      if (tries > 6) throw e;
    }
    if (tries > 6) throw new Error(`Wikipedia said ${r.status}`);
    await new Promise((res) => setTimeout(res, 1000 * 2 ** tries));
  }
}
// An article about a person, a band, a team or a place is never the food,
// however well its title matches (LaCroix once found an actress).
const NOT_FOOD = /\b(actor|actress|singer|rapper|musician|band|footballer|player|politician|athlete|wrestler|model|comedian|writer|author|director|producer|businessman|businesswoman|television|film|album|song|novel|video game|town|city|village|county|municipality|river|mountain|island|district|neighbou?rhood|ranch|company|born)\b/i;
const IMAGE = { prop: "pageimages|pageprops", piprop: "thumbnail", pithumbsize: SIZE, ppprop: "disambiguation|wikibase-shortdesc" };
const usable = (p) => p && !p.missing && !(p.pageprops && "disambiguation" in p.pageprops) && p.thumbnail
  && !NOT_FOOD.test(p.pageprops?.["wikibase-shortdesc"] || "") && !BAD_FILE.test(decodeURIComponent(p.thumbnail.source));
// keep just the part after wikimedia.org/wikipedia/ - the game puts the rest back
const short = (src) => src.replace(/^https:\/\/[^/]+\/wikipedia\//, "").replace(/\?.*$/, "");

const words = (s) => s.toLowerCase().normalize("NFD").replace(/[^a-z ]/g, " ").split(/\s+/)
  .filter((w) => w.length > 2 && !SMALL_WORDS.has(w)).map((w) => w.replace(/(es|s)$/, ""));
const shares = (name, title) => { const t = new Set(words(title)); return words(name).some((w) => t.has(w)); };

// many exact titles at once
async function exact(names) {
  const out = new Map();
  for (let i = 0; i < names.length; i += 50) {
    const batch = names.slice(i, i + 50);
    const d = await api({ action: "query", redirects: 1, titles: batch.join("|"), ...IMAGE });
    const to = new Map();
    for (const n of d.query.normalized || []) to.set(n.from, n.to);
    const via = (t) => { for (const r of d.query.redirects || []) if (r.from === t) return r.to; return t; };
    const pages = new Map((d.query.pages || []).map((p) => [p.title, p]));
    for (const n of batch) {
      const p = pages.get(via(to.get(n) || n));
      if (usable(p)) out.set(n, { title: p.title, src: short(p.thumbnail.source) });
    }
  }
  return out;
}
async function search(name, q) {
  const d = await api({ action: "query", generator: "search", gsrsearch: q, gsrlimit: 8, ...IMAGE });
  const pages = (d.query?.pages || []).sort((a, b) => a.index - b.index);
  const p = pages.find((p) => usable(p) && shares(name, p.title));
  return p ? { title: p.title, src: short(p.thumbnail.source) } : null;
}
async function find(name) {
  if (fixes.has(name)) {
    const t = fixes.get(name);
    if (t === "-") return null;
    return (await exact([t])).get(t) || null;
  }
  let found = (await search(name, `${name} food`)) || (await search(name, name));
  const rest = name.split(" ").slice(1).join(" ");
  if (!found && rest) found = (await exact([rest])).get(rest) || (await search(rest, `${rest} food`));
  return found;
}

async function main() {
  const args = process.argv.slice(2);
  const all = args.includes("--all");
  const only = args.filter((a, i) => !a.startsWith("--") && args[i - 1] !== "--from");
  const have = !all && fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, "utf8")) : {};
  const todo = only.length ? only : FOOD.filter((n) => !(n in have));
  console.log(`Looking up ${todo.length} of ${FOOD.length} items...`);

  const plain = await exact(todo.filter((n) => !fixes.has(n)));
  let done = 0, failed = 0;
  const next = [...todo];
  async function worker() {
    for (let n; (n = next.shift()) !== undefined;) {
      try {
        const hit = (!fixes.has(n) && plain.get(n)) || (await find(n));
        have[n] = hit ? hit.src : null;
        if (only.length) console.log(`${n} -> ${hit ? `${hit.title} (${hit.src.split("/").pop()})` : "nothing"}`);
      } catch (e) {
        failed++;                      // left out, so the next run tries it again
        console.log(`  ${n}: ${e.message}`);
      }
      if (++done % 200 === 0) { console.log(`  ${done}/${todo.length}`); write(have); }
    }
  }
  await Promise.all([1, 2].map(worker));      // any more and Wikipedia starts saying no
  const got = write(have);
  console.log(`${got} of ${FOOD.length} have a picture; the rest show their name.`);
  if (failed) console.log(`${failed} lookups failed - run it again to retry them.`);
}
// saved as it goes, so a long run that stops halfway keeps what it found
// Items that leave the game keep their picture: recipes get rewritten, and
// a name that comes back shouldn't have to be looked up again.
function write(have) {
  fs.writeFileSync(OUT, JSON.stringify(have, null, 0).replace(/","/g, '",\n"'));
  return FOOD.filter((n) => have[n]).length;
}
main().catch((e) => { console.error(e); process.exit(1); });
