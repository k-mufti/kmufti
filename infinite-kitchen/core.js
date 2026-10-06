// Turns core.txt into recipes.json for the game.
//
//   node infinite-kitchen/core.js
//
// core.txt names the tools as they stand in the room (Stove, Knife...);
// the game knows them by what they do (Heat, Cut...), so they're swapped
// here. Every tool is out from the start, so they're all starters, along
// with the six elements.
"use strict";
const fs = require("fs");
const path = require("path");

const ELEMENTS = ["Water", "Grain", "Plant", "Animal", "Salt", "Sugar"];
const TOOLS = {
  Stove: "Heat", Oven: "Bake", Pot: "Boil", Pan: "Fry", Grill: "Grill", Knife: "Cut",
  Bowl: "Mix", Blender: "Blend", Clock: "Wait", Fridge: "Freeze", Jars: "Ferment",
};
const KINDS = new Set(["ingredient", "dish", "trash"]);

const items = {};
for (const e of ELEMENTS) items[e] = "ingredient";
for (const t of Object.values(TOOLS)) items[t] = "technique";

const combos = [], seen = new Map(), problems = [];
const lines = fs.readFileSync(path.join(__dirname, "core.txt"), "utf8").split("\n");
lines.forEach((line, i) => {
  line = line.trim();
  if (!line || line.startsWith("#")) return;
  const m = line.match(/^(.+?) \+ (.+?) = (.+?)(?: \[(\w+)\])?$/);
  if (!m) return problems.push(`line ${i + 1}: can't read "${line}"`);
  const [a, b] = [m[1], m[2]].map((n) => TOOLS[n] || n);
  const [res, kind] = [m[3], m[4]];
  if (kind && !KINDS.has(kind)) problems.push(`line ${i + 1}: unknown kind [${kind}]`);
  if (!(res in items)) items[res] = kind || "ingredient";
  else if (kind && items[res] !== kind) problems.push(`line ${i + 1}: ${res} was already a ${items[res]}`);
  const k = [a, b].sort().join(" + ");
  if (seen.has(k)) return problems.push(`line ${i + 1}: ${k} already makes ${seen.get(k)}`);
  seen.set(k, res);
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
const count = (k) => Object.values(items).filter((v) => v === k).length;
console.log(`wrote ${combos.length} combos: ${count("ingredient")} ingredients, ${count("dish")} dishes, ${count("trash")} in the bin`);
