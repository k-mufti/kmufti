// Build recipes.json from the hand-written combo lists:   node infinite-kitchen/build.js
//
// Each .txt file listed below holds lines like "A + B = Result [kind]".
// The kind only needs saying once per result and defaults to ingredient.
// Stops on a pair given two different answers, then runs check.js.
"use strict";

const fs = require("fs");
const path = require("path");

// opening.txt and more.txt first, then the row files (deep1.txt, deep2.txt...)
const SOURCES = ["opening.txt", "more.txt"].concat(process.env.NO_DEEP ? [] :
  fs.readdirSync(__dirname).filter((f) => /^deep\d+\.txt$/.test(f))
    .sort((a, b) => parseInt(a.slice(4)) - parseInt(b.slice(4))));

const starters = ["Water", "Soil", "Egg", "Sugar", "Meat", "Heat", "Mix", "Cut", "Wait"];
const cuisines = {
  American: "Burger", Italian: "Pasta", Mexican: "Tortilla", French: "Crêpe",
  "Middle Eastern": "Pita", Indian: "Naan", Chinese: "Dumpling", Japanese: "Sushi Rice",
  Korean: "Kimchi", Thai: "Fried Rice", "Fast Food": "Mystery Burger",
};

const items = { Water: "ingredient", Soil: "ingredient", Egg: "ingredient", Sugar: "ingredient",
  Meat: "ingredient", Heat: "technique", Mix: "technique", Cut: "technique", Wait: "technique",
  // made by rules.js rather than by a written recipe
  Burnt: "trash", Mush: "trash", Leftovers: "trash", Sludge: "trash" };
for (const c of Object.keys(cuisines)) items[c] = "cuisine";

// 23 techniques became 11. A recipe written with a merged-away technique
// now uses the one that absorbed it; when that clashes with a recipe written
// for the kept technique, the kept one wins. Recipes that made a merged-away
// technique are dropped.
const MERGED = { Mince: "Cut", Whip: "Mix", Knead: "Mix", Simmer: "Boil", Steam: "Boil",
  "Deep-fry": "Fry", "Stir-fry": "Fry", Roast: "Bake", Smoke: "Grill", Torch: "Grill",
  Cure: "Wait", Dry: "Wait" };
const fromMerged = new Set();   // pair keys that came from a merged technique

const combos = [];
const like = {};
const acts = [];    // "Calf acts like Cow except Water, Cut": copy Cow's recipes to Calf
const raw = [];
const seen = new Map();
const guessed = new Set();
const errs = [];
for (const file of SOURCES) {
  const lines = fs.readFileSync(path.join(__dirname, file), "utf8").split("\n");
  let row = null;     // "@ Honey" starts a row: "Fish = Honey Salmon" then means Honey + Fish
  lines.forEach((line, i) => {
    line = line.trim();
    if (!line || line.startsWith("#")) return;
    if (line.startsWith("@ ")) { row = line.slice(2).trim(); return; }
    if (row && !line.includes(" + ") && line.includes(" = ")) line = row + " + " + line;
    // "Rabbit acts like Chicken renaming Chicken to Rabbit": copies that
    // name the meat get the right one - Chicken Sandwich becomes Rabbit Sandwich.
    // "... prefix Veal": the name family dishes take (Veal Stew, not Calf
    // Stew); "prefix -" keeps the dish's plain name.
    const act = line.match(/^(.+?) acts like (.+?)(?: renaming (.+?) to (.+?))?(?: prefix (.+?))?(?: except (.+))?$/);
    if (act && !line.includes(" = ")) {
      acts.push({ x: act[1], y: act[2], from: act[3] || null, to: act[4] || null, prefix: act[5] || null,
        except: new Set((act[6] || "").split(",").map((t) => t.trim()).filter(Boolean)) });
      return;
    }
    const is = line.match(/^(.+?) is (.+)$/);
    if (is && !line.includes(" = ")) {
      if (is[2] === "raw") raw.push(is[1]); else like[is[1]] = is[2];
      return;
    }
    // a trailing "!" replaces an answer an earlier file gave for the pair
    const force = line.endsWith(" !");
    if (force) line = line.slice(0, -2);
    const m = line.match(/^(.+?) \+ (.+?) = (.+?)(?: \[(\w+)\])?$/);
    if (!m) return errs.push(`${file}:${i + 1}: can't read "${line}"`);
    let [, a, b, r, kind] = m;
    if (r in MERGED) return;
    const merged = a in MERGED || b in MERGED;
    a = MERGED[a] || a; b = MERGED[b] || b;
    const k = [a, b].sort().join("|");
    if (seen.has(k) && !force && seen.get(k) !== r) {
      if (merged) return;                          // the kept technique's recipe stays
      if (fromMerged.has(k)) {                     // a kept-technique line replaces a merged one
        const c = combos.find((x) => [x[0], x[1]].sort().join("|") === k);
        c[2] = r; seen.set(k, r); fromMerged.delete(k);
        if (kind) items[r] = kind; else if (!items[r]) items[r] = "ingredient";
        return;
      }
    }
    if (seen.has(k)) {
      if (force) {
        const c = combos.find((x) => [x[0], x[1]].sort().join("|") === k);
        c[2] = r; seen.set(k, r);
        if (kind) items[r] = kind; else if (!items[r]) items[r] = "ingredient";
      } else if (seen.get(k) !== r) errs.push(`${file}:${i + 1}: ${a} + ${b} is ${seen.get(k)} and ${r}`);
      return;
    }
    seen.set(k, r);
    if (merged) fromMerged.add(k);
    // a result first seen without a kind is an ingredient until a line says otherwise
    if (kind) {
      if (items[r] && items[r] !== kind && !guessed.has(r)) errs.push(`${file}:${i + 1}: ${r} is ${items[r]} and ${kind}`);
      items[r] = kind; guessed.delete(r);
    } else if (!items[r]) { items[r] = "ingredient"; guessed.add(r); }
    combos.push([a, b, r]);
  });
}
if (errs.length) { console.error(errs.join("\n")); process.exit(1); }

// "acts like": X takes every recipe Y has with something else, unless that
// pair is written by hand for X or listed as an exception ("except
// techniques" skips every technique). They run in file order, so a later
// line can build on an earlier one: Ham acts like Pork, after Pork got its
// share from somewhere else.
// Generic dishes a variant names after itself when it inherits them:
// Mango + Milk is a Mango Smoothie, not just another Smoothie.
const FAMILY = new Set(["Salad", "Stew", "Soup", "Smoothie", "Jam", "Juice", "Sorbet", "Pie", "Curry",
  "Omelette", "Frittata", "Pickle", "Chutney", "Compote", "Fritter", "Clafoutis", "Muffin", "Parfait",
  "Tart", "Cobbler", "Popsicle", "Kebab", "Gratin", "Pakora", "Tempura", "Chowder", "Ceviche", "Tagine",
  "Gumbo", "Sandwich", "Dumpling", "Fried Rice", "Taco", "Burrito", "Quesadilla", "Pizza", "Sushi",
  "Crêpe", "Cheesecake", "Ice Cream", "Milkshake", "Lassi", "Tea", "Soufflé", "Risotto", "Skewer",
  "Salsa", "Granola", "Bread Pudding", "Paella", "Pesto"]);
// ...and a few that are named another way round
const FAMILY_NAME = { Fruitcake: (x) => x + " Bread", "Candy Apple": (x) => "Caramel " + x };
// Plural items say their name in the singular in front of a dish.
const SINGULAR = { Dates: "Date", Grapes: "Grape", Berries: "Berry", Nuts: "Nut", Beans: "Bean", Peas: "Pea",
  Lentils: "Lentil", Chickpeas: "Chickpea", Chives: "Chive", Herbs: "Herb", Spices: "Spice", Seeds: "Seed",
  Oats: "Oat", Microgreens: "Microgreen", "Bean Sprouts": "Bean Sprout", "Black Beans": "Black Bean",
  "Green Beans": "Green Bean", Raisins: "Raisin" };
const sing = (n) => SINGULAR[n] || n.replace(/Berries$/, "Berry")
  .replace(/(Beans|Peas|Seeds|Sprouts|Nuts|Lentils|Chickpeas|Oats|Grapes|Dates|Chives|Herbs|Spices|Raisins|Microgreens)$/, (w) => w.slice(0, -1));
// Names that are never renamed: fish sauce is fish sauce whatever the fish.
const FIXED = new Set(["Fish Sauce", "Fish and Chips"]);
// A prefixed name that only says the dish twice goes back to the dish.
const SAME = new Set(["Cucumber Pickle", "Tomato Salsa", "Herb Pesto", "Basil Pesto"]);
// "Mango Smoothie" -> "Smoothie": named dishes then behave like their base.
const generated = new Map();
const writtenResults = new Set(combos.map((c) => c[2]));   // names a line actually wrote
const familyNamed = new Set();                               // "Mango Smoothie"-style names only
// Things that are found, not cooked: a recipe that discovers one stays with
// its own base (Fruit + Butter = Avocado must not become Apple + Butter).
const HUBS = ["Fruit", "Vegetables", "Herbs", "Beans", "Mushroom", "Onion", "Potato", "Radish", "Spices",
  "Banana", "Pumpkin", "Nuts", "Garden", "Tree", "Bush", "Sprout", "Field", "Farm", "Grass", "Forest"];
const PRODUCE = new Set(HUBS.concat(acts.filter((a) => HUBS.includes(a.y)).map((a) => a.x)));
for (const { x, y, from, to, prefix, except } of acts) {
  if (!(y in items)) { console.error(`${x} acts like ${y}, which doesn't exist`); process.exit(1); }
  if (!(x in items)) { console.error(`${x} acts like ${y}, but nothing makes ${x}`); process.exit(1); }
  for (const [a, b, r] of combos.slice()) {
    if (a !== y && b !== y) continue;
    const z = a === y ? b : a;
    if (z === y || z === x || except.has(z)) continue;
    if (except.has("techniques") && items[z] === "technique") continue;
    const k = [x, z].sort().join("|");
    if (seen.has(k)) continue;
    if (r !== y && PRODUCE.has(r)) continue;
    // a dish Y named after itself goes back to plain before X names it:
    // Squid gets Squid Ceviche from Crab's Crab Ceviche, not Crab Ceviche
    let res = r === y ? x : (familyNamed.has(r) && !writtenResults.has(r) ? generated.get(r) : r);
    if (from && !FIXED.has(res) && new RegExp("\\b" + from + "\\b").test(res)) {
      const renamed = res.replace(new RegExp("\\b" + from + "\\b"), sing(to));
      if (!(renamed in items)) items[renamed] = items[res];
      if (renamed !== res) generated.set(renamed, res);
      res = renamed;
    }
    if (r !== y && (res === r || res === generated.get(r)) && prefix !== "-" && (FAMILY_NAME[res] || FAMILY.has(res))) {
      const who = sing(prefix || x);
      const named = FAMILY_NAME[res] ? FAMILY_NAME[res](who) : who + " " + res;
      if (!SAME.has(named)) {
        if (!(named in items)) items[named] = items[res];
        generated.set(named, res);
        familyNamed.add(named);
        res = named;
      }
    }
    seen.set(k, res);
    combos.push([x, z, res]);
  }
}

// A named dish behaves like the dish it's named from - a Beet Pickle goes
// with cheese the way a Pickle does. rules.js works that out at play time
// from this map, so it costs nothing in the file.
const follows = Object.fromEntries(generated);

const out = {
  starters,
  cuisines: Object.fromEntries(Object.entries(cuisines).map(([c, d]) => [c, { unlockedBy: d, pantry: [] }])),
  items,
  like,
  follows,
  raw,
  combos,
};

// generated, compact: edit the .txt files, not this
fs.writeFileSync(path.join(__dirname, "recipes.json"), JSON.stringify(out) + "\n");
console.log(`wrote ${combos.length} combos`);
require("./check.js");
