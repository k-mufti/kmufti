// Turns core.txt into recipes.json for the game, then reports how complete
// the set is.
//
//   node infinite-kitchen/core.js           build and print the report
//   node infinite-kitchen/core.js --list    ...and list every gap, too
//
// core.txt names the tools as they stand in the room (Stove, Knife...);
// the game knows them by what they do (Heat, Cut...), so they're swapped
// here. Every tool is out from the start, so they're all starters, along
// with the six elements.
//
// Cuisines are cookbooks on the shelf, used like tools once unlocked:
//   Cuisine: Italian                     there is an Italian cookbook
//   Italian: Pizza, Lasagna, Gelato      these are Italian - making any of
//                                        them unlocks it, and their cards
//                                        get the Italian stripe
//   Bread + Italian = Focaccia           what the cookbook does to food
//
// Two limits keep the set honest, and the build fails past either:
//   - "nothing happens" (Water + Knife = Water) has to be marked [nothing]
//     on purpose, and stays under NOTHING_MAX of all combos
//   - the bin stays under TRASH_MAX of all combos
"use strict";
const fs = require("fs");
const path = require("path");

const ELEMENTS = ["Water", "Grain", "Plant", "Animal", "Salt", "Sugar"];
const TOOLS = {
  Stove: "Heat", Oven: "Bake", Pot: "Boil", Knife: "Cut", Blender: "Blend", Clock: "Wait", Fridge: "Freeze",
};
const ROOM = Object.fromEntries(Object.entries(TOOLS).map(([room, tech]) => [tech, room]));
const KINDS = new Set(["ingredient", "dish", "drink", "trash"]);
const NOTHING_MAX = 0.05, TRASH_MAX = 0.03, FEW_USES = 3, DEPTHS = 4;
const LIST = process.argv.includes("--list");

const items = {};
for (const e of ELEMENTS) items[e] = "ingredient";
for (const t of Object.values(TOOLS)) items[t] = "technique";

const combos = [], seen = new Map(), problems = [], nothing = [];
const cuisines = {};          // cuisine -> its dishes and drinks
const cuisineLines = [];
const marked = {};           // results given a [kind] somewhere
const lines = fs.readFileSync(path.join(__dirname, "core.txt"), "utf8").split("\n");
lines.forEach((line, i) => {
  line = line.trim();
  if (!line || line.startsWith("#")) return;
  const c = line.match(/^Cuisine: (.+)$/);
  if (c) {
    if (c[1] in items) problems.push(`line ${i + 1}: ${c[1]} is already a ${items[c[1]]}`);
    cuisines[c[1]] = [];
    items[c[1]] = "cuisine";
    return;
  }
  // "Italian: Pizza, Lasagna" - read once every combo is in, so the names exist
  const t = line.match(/^([^+=]+?): (.+)$/);
  if (t) return cuisineLines.push([i + 1, t[1], t[2].split(",").map((n) => n.trim())]);
  const m = line.match(/^(.+?) \+ (.+?) = (.+?)(?: \[(\w+)\])?$/);
  if (!m) return problems.push(`line ${i + 1}: can't read "${line}"`);
  const [a, b] = [m[1], m[2]].map((n) => TOOLS[n] || n);
  const [res, kind] = [m[3], m[4]];
  const k = [a, b].sort().join(" + ");
  if (seen.has(k)) return problems.push(`line ${i + 1}: ${k} already makes ${seen.get(k)}`);
  seen.set(k, res);
  // the item comes back unchanged: only allowed when it's marked on purpose
  if (res === a || res === b) {
    if (kind !== "nothing") problems.push(`line ${i + 1}: ${line} gives back what went in - mark it [nothing] if that's really the answer`);
    nothing.push(line);
  } else {
    if (kind === "nothing") problems.push(`line ${i + 1}: [nothing] but ${res} is new`);
    else if (kind && !KINDS.has(kind)) problems.push(`line ${i + 1}: unknown kind [${kind}]`);
    // the [kind] can sit on any one of a result's lines, not just the first
    if (kind) {
      if (marked[res] && marked[res] !== kind) problems.push(`line ${i + 1}: ${res} was already marked [${marked[res]}]`);
      marked[res] = kind;
      items[res] = kind;
    } else if (!(res in items)) items[res] = "ingredient";
  }
  combos.push([a, b, res]);
});
const cuisineOf = {};
for (const [ln, c, names] of cuisineLines) {
  if (!cuisines[c]) { problems.push(`line ${ln}: no "Cuisine: ${c}" line`); continue; }
  for (const n of names) {
    if (!(n in items)) problems.push(`line ${ln}: nothing makes ${n}`);
    else if (items[n] !== "dish" && items[n] !== "drink") problems.push(`line ${ln}: ${n} is a ${items[n]} - only dishes and drinks belong to a cuisine`);
    else if (cuisineOf[n]) problems.push(`line ${ln}: ${n} is already ${cuisineOf[n]}`);
    else { cuisineOf[n] = c; cuisines[c].push(n); }
  }
}
for (const [c, list] of Object.entries(cuisines)) if (!list.length) problems.push(`${c} has no dishes, so it can never unlock`);
// every input has to be something you can actually get
for (const [a, b] of combos) {
  for (const n of [a, b]) if (!(n in items)) problems.push(`${a} + ${b}: nothing makes ${n}`);
}
if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}

/* ---------- the report ---------- */
const show = (n) => ROOM[n] || n;

// How many steps from the start each item is: the elements and tools are 0,
// and a result is one more than the deeper of the two things it takes.
const depth = new Map(Object.keys(items).filter((n) => ELEMENTS.includes(n) || ROOM[n]).map((n) => [n, 0]));
for (let changed = true; changed;) {
  changed = false;
  for (const [a, b, r] of combos) {
    if (!depth.has(a) || !depth.has(b)) continue;
    const d = Math.max(depth.get(a), depth.get(b)) + 1;
    if (!depth.has(r) || d < depth.get(r)) { depth.set(r, d); changed = true; }
  }
  // a cookbook is in hand as soon as the first of its dishes is
  for (const [c, list] of Object.entries(cuisines)) {
    for (const dish of list) {
      if (depth.has(dish) && (!depth.has(c) || depth.get(dish) < depth.get(c))) { depth.set(c, depth.get(dish)); changed = true; }
    }
  }
}
const unreachable = Object.keys(items).filter((n) => !depth.has(n));

// Coverage: of every pair you could try using only things within N steps,
// how many have an answer. Two tools together isn't a pair anyone makes.
const food = Object.keys(items).filter((n) => !ROOM[n] && items[n] !== "cuisine");
const tools = Object.keys(ROOM);
const coverage = [];
for (let d = 0; d <= DEPTHS; d++) {
  const near = food.filter((n) => depth.get(n) <= d);
  const gaps = [];
  let total = 0;
  for (let i = 0; i < near.length; i++) {
    for (let j = i; j < near.length; j++) {
      total++;
      if (!seen.has([near[i], near[j]].sort().join(" + "))) gaps.push(`${near[i]} + ${near[j]}`);
    }
    for (const t of tools) {
      total++;
      if (!seen.has([near[i], t].sort().join(" + "))) gaps.push(`${near[i]} + ${show(t)}`);
    }
  }
  coverage.push({ d, items: near.length, total, gaps });
}

// what each item is an input to
const uses = new Map(food.map((n) => [n, 0]));
for (const [a, b, r] of combos) {
  if (r === a || r === b) continue;
  for (const n of new Set([a, b])) if (uses.has(n)) uses.set(n, uses.get(n) + 1);
}
const few = food.filter((n) => uses.get(n) < FEW_USES).sort((x, y) => uses.get(x) - uses.get(y));

const trash = combos.filter(([, , r]) => items[r] === "trash").length;
const pct = (x, of) => (of ? Math.round((x / of) * 1000) / 10 : 0) + "%";
const count = (k) => Object.values(items).filter((v) => v === k).length;

console.log(`${combos.length} combos: ${count("ingredient")} ingredients, ${count("dish")} dishes, ${count("drink")} drinks, ${count("trash")} in the bin`);
console.log("\nCoverage - pairs answered among things within N steps of the start:");
for (const c of coverage) {
  console.log(`  ${c.d} step${c.d === 1 ? " " : "s"}  ${String(c.items).padStart(4)} items  ${pct(c.total - c.gaps.length, c.total).padStart(6)}  (${c.gaps.length} of ${c.total} pairs open)`);
}
console.log(`\nNothing happens: ${nothing.length} (${pct(nothing.length, combos.length)}, limit ${NOTHING_MAX * 100}%)`);
for (const l of nothing) console.log("  " + l);
console.log(`Into the bin: ${trash} (${pct(trash, combos.length)}, limit ${TRASH_MAX * 100}%)`);
console.log(`\nUsed in fewer than ${FEW_USES} combos (fine for iconic items): ${few.length}`);
console.log("  " + (LIST ? few.map((n) => `${n} (${uses.get(n)})`).join(", ") : few.slice(0, 25).join(", ") + (few.length > 25 ? ", ..." : "")));
if (Object.keys(cuisines).length) {
  console.log("\nCookbooks - its dishes, the soonest one to make, combos that use the book:");
  for (const [c, list] of Object.entries(cuisines)) {
    const first = list.filter((d) => depth.has(d)).sort((x, y) => depth.get(x) - depth.get(y))[0];
    const n = combos.filter(([a, b]) => a === c || b === c).length;
    console.log(`  ${c.padEnd(15)} ${String(list.length).padStart(3)} dishes   soonest: ${(first || "-").padEnd(14)} (${depth.get(c) ?? "-"} steps)  ${String(n).padStart(3)} combos`);
  }
}
if (unreachable.length) console.log(`\nCan't be reached from the start: ${unreachable.join(", ")}`);
if (LIST) {
  for (const c of coverage) {
    if (!c.gaps.length) continue;
    console.log(`\nOpen pairs within ${c.d} step${c.d === 1 ? "" : "s"}:`);
    console.log("  " + c.gaps.filter((g) => !coverage[c.d - 1]?.gaps.includes(g)).join(", "));
  }
} else console.log("\n(node core.js --list for every open pair)");

// Red flags - things a quick batch tends to get wrong:
//  - a cuisine's named dish two steps from the start: two everyday things
//    should make something plain (Rice + Meat = Rice and Meat), not a
//    regional dish, or the cookbooks unlock in the first minute
//  - one result reached by many routes: usually a lazy repeat
const shallow = Object.keys(cuisineOf).filter((n) => depth.get(n) <= 2);
const routes = new Map();
for (const [a, b, r] of combos) if (r !== a && r !== b && items[a] !== "cuisine" && items[b] !== "cuisine") routes.set(r, (routes.get(r) || 0) + 1);
const many = [...routes].filter(([, n]) => n >= 5).sort((x, y) => y[1] - x[1]);
console.log(`\nRed flags:`);
console.log(`  cuisine dishes within 2 steps: ${shallow.length ? shallow.map((n) => `${n} (${cuisineOf[n]})`).join(", ") : "none"}`);
console.log(`  results with 5+ routes: ${many.length ? many.map(([n, k]) => `${n} ${k}`).join(", ") : "none"}`);

// The catalog: every food we want in the game, by aisle, menu and occasion.
const CATALOG = path.join(__dirname, "catalog.txt");
if (fs.existsSync(CATALOG)) {
  const sections = [];
  for (const line of fs.readFileSync(CATALOG, "utf8").split("\n")) {
    const h = line.match(/^## (.+)$/);
    if (h) sections.push({ name: h[1], items: [] });
    else if (sections.length && line.trim() && !line.startsWith("#")) sections.at(-1).items.push(...line.split(",").map((n) => n.trim()).filter(Boolean));
  }
  const all = new Set(sections.flatMap((x) => x.items));
  const have = [...all].filter((n) => n in items).length;
  console.log(`\nCatalog - ${have} of ${all.size} foods in the game (${pct(have, all.size)}):`);
  for (const x of sections) {
    const missing = x.items.filter((n) => !(n in items));
    console.log(`  ${x.name.padEnd(42)} ${String(x.items.length - missing.length).padStart(3)} / ${String(x.items.length).padEnd(3)}` + (LIST && missing.length ? `  missing: ${missing.join(", ")}` : ""));
  }
}

const over = [];
if (nothing.length > combos.length * NOTHING_MAX) over.push(`too many [nothing] combos: ${nothing.length} is over ${NOTHING_MAX * 100}%`);
if (trash > combos.length * TRASH_MAX) over.push(`too much goes in the bin: ${trash} is over ${TRASH_MAX * 100}%`);
if (over.length) {
  console.error("\nNot written - " + over.join("; "));
  process.exit(1);
}

const out = {
  starters: ELEMENTS.concat(Object.values(TOOLS)),
  cuisines: Object.fromEntries(Object.entries(cuisines).map(([c, list]) => [c, { dishes: list, pantry: [] }])),
  items,
  like: {},
  follows: {},
  raw: [],
  combos,
};
// generated: edit core.txt, not this
const json = JSON.stringify(out) + "\n";
fs.writeFileSync(path.join(__dirname, "recipes.json"), json);

// Browsers keep recipes.json (and app.js) for an hour, so a new set needs a
// new address or players keep the old one. Stamp both with a hash of the set.
const stamp = require("crypto").createHash("sha1").update(json).digest("hex").slice(0, 8);
const restamp = (file, re, to) => {
  const f = path.join(__dirname, file), was = fs.readFileSync(f, "utf8"), now = was.replace(re, to);
  if (now !== was) fs.writeFileSync(f, now);
};
restamp("app.js", /recipes\.json\?v=[\w]+/, `recipes.json?v=${stamp}`);
restamp("index.html", /app\.js\?v=[\w]+/, `app.js?v=${stamp}`);
console.log("\nwrote recipes.json");
