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
const KINDS = new Set(["ingredient", "dish", "trash"]);
const NOTHING_MAX = 0.05, TRASH_MAX = 0.03, FEW_USES = 3, DEPTHS = 4;
const LIST = process.argv.includes("--list");

const items = {};
for (const e of ELEMENTS) items[e] = "ingredient";
for (const t of Object.values(TOOLS)) items[t] = "technique";

const combos = [], seen = new Map(), problems = [], nothing = [];
const lines = fs.readFileSync(path.join(__dirname, "core.txt"), "utf8").split("\n");
lines.forEach((line, i) => {
  line = line.trim();
  if (!line || line.startsWith("#")) return;
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
    if (!(res in items)) items[res] = kind || "ingredient";
    else if (kind && items[res] !== kind) problems.push(`line ${i + 1}: ${res} was already a ${items[res]}`);
  }
  combos.push([a, b, res]);
});
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
}
const unreachable = Object.keys(items).filter((n) => !depth.has(n));

// Coverage: of every pair you could try using only things within N steps,
// how many have an answer. Two tools together isn't a pair anyone makes.
const food = Object.keys(items).filter((n) => !ROOM[n]);
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

console.log(`${combos.length} combos: ${count("ingredient")} ingredients, ${count("dish")} dishes, ${count("trash")} in the bin`);
console.log("\nCoverage - pairs answered among things within N steps of the start:");
for (const c of coverage) {
  console.log(`  ${c.d} step${c.d === 1 ? " " : "s"}  ${String(c.items).padStart(4)} items  ${pct(c.total - c.gaps.length, c.total).padStart(6)}  (${c.gaps.length} of ${c.total} pairs open)`);
}
console.log(`\nNothing happens: ${nothing.length} (${pct(nothing.length, combos.length)}, limit ${NOTHING_MAX * 100}%)`);
for (const l of nothing) console.log("  " + l);
console.log(`Into the bin: ${trash} (${pct(trash, combos.length)}, limit ${TRASH_MAX * 100}%)`);
console.log(`\nUsed in fewer than ${FEW_USES} combos (fine for iconic items): ${few.length}`);
console.log("  " + (LIST ? few.map((n) => `${n} (${uses.get(n)})`).join(", ") : few.slice(0, 25).join(", ") + (few.length > 25 ? ", ..." : "")));
if (unreachable.length) console.log(`\nCan't be reached from the start: ${unreachable.join(", ")}`);
if (LIST) {
  for (const c of coverage) {
    if (!c.gaps.length) continue;
    console.log(`\nOpen pairs within ${c.d} step${c.d === 1 ? "" : "s"}:`);
    console.log("  " + c.gaps.filter((g) => !coverage[c.d - 1]?.gaps.includes(g)).join(", "));
  }
} else console.log("\n(node core.js --list for every open pair)");

const over = [];
if (nothing.length > combos.length * NOTHING_MAX) over.push(`too many [nothing] combos: ${nothing.length} is over ${NOTHING_MAX * 100}%`);
if (trash > combos.length * TRASH_MAX) over.push(`too much goes in the bin: ${trash} is over ${TRASH_MAX * 100}%`);
if (over.length) {
  console.error("\nNot written - " + over.join("; "));
  process.exit(1);
}

const out = {
  starters: ELEMENTS.concat(Object.values(TOOLS)),
  cuisines: {},
  items,
  like: {},
  follows: {},
  raw: [],
  combos,
};
// generated: edit core.txt, not this
fs.writeFileSync(path.join(__dirname, "recipes.json"), JSON.stringify(out) + "\n");
console.log("\nwrote recipes.json");
