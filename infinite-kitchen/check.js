// Check recipes.json before shipping it:   node infinite-kitchen/check.js
//
// recipes.json is hand-edited (or pasted in from a batch someone else wrote),
// so this catches the mistakes that would otherwise only show up in play:
//
//   - a pair listed twice with two different results
//   - a combo that uses a name nothing makes and no pantry gives (a typo)
//   - a result with no entry in "items", so the game can't tell what it is
//   - a cuisine's signature dish that can't be cooked
//   - a pantry ingredient a cuisine hands out that could be crafted instead
//   - anything that can't be reached from the starting pantry at all
//
// Exits non-zero if anything is wrong, so it can gate a deploy.
"use strict";

const fs = require("fs");
const path = require("path");
const R = require("./rules.js");

const data = JSON.parse(fs.readFileSync(path.join(__dirname, "recipes.json"), "utf8"));
const { starters, cuisines, items, combos } = data;
const errs = [];
const key = (a, b) => [a, b].sort().join("|");

const seen = new Map();
for (const [a, b, r] of combos) {
  const k = key(a, b);
  if (seen.has(k) && seen.get(k) !== r) errs.push(`conflict: ${a} + ${b} = ${seen.get(k)} or ${r}?`);
  seen.set(k, r);
}

const results = new Set(combos.map((c) => c[2]));
const given = new Set(Object.values(cuisines).flatMap((c) => c.pantry));
const exists = (n) => starters.includes(n) || results.has(n) || given.has(n) || n in cuisines;

for (const [a, b, r] of combos) {
  if (!(r in items)) errs.push(`"${r}" has no entry in items (ingredient, dish, technique or cuisine?)`);
}
for (const [c, v] of Object.entries(cuisines)) {
  if (!results.has(v.unlockedBy)) errs.push(`${c} is unlocked by ${v.unlockedBy}, which can't be cooked`);
  for (const p of v.pantry) if (results.has(p)) errs.push(`${c} hands out ${p}, but ${p} can be crafted`);
}

// Play it forward: start with the pantry, keep combining everything you have,
// and unlock a cuisine the moment its dish shows up. The mechanical rules
// count too - Burnt has no written recipe, you get it by overcooking - but
// only when they land on a name the file already knows, so the walk can't
// wander off into every stacked name there could ever be.
const cooked = R.cookedSet(combos, items, starters);
const written = new Set(Object.keys(items));
const splits = R.splitMap(combos, items);
const ctx = {
  kindOf: (n) => items[n] || "ingredient",
  isWritten: (n) => written.has(n),
  splitOf: (n) => splits.get(n) || null,
  isCooked: (n) => cooked.has(n),
  isModifier: (n) => {
    const k = items[n];
    return (k === "ingredient" || k === "dish") && !R.NOT_A_FLAVOUR.has(n);
  },
};
const have = new Set(starters);
for (let changed = true; changed;) {
  changed = false;
  for (const [c, v] of Object.entries(cuisines)) {
    if (have.has(v.unlockedBy) && !have.has(c)) {
      have.add(c); v.pantry.forEach((p) => have.add(p)); changed = true;
    }
  }
  for (const [a, b, r] of combos) {
    if (have.has(a) && have.has(b) && !have.has(r)) { have.add(r); changed = true; }
  }
  const list = [...have];
  for (let i = 0; i < list.length; i++) {
    for (let j = i; j < list.length; j++) {
      const m = R.make(list[i], list[j], ctx);
      if (m && m.result in items && !have.has(m.result)) { have.add(m.result); changed = true; }
    }
  }
}
for (const [a, b] of combos) {
  for (const x of [a, b]) {
    if (!have.has(x)) errs.push(`"${x}" is used in ${a} + ${b}, but nothing makes it`);
  }
}
const stuck = [...Object.keys(items)].filter((r) => !have.has(r));
if (stuck.length) errs.push("can't be reached from the starting pantry: " + stuck.join(", "));

const count = (k) => Object.values(items).filter((v) => v === k).length;
if (errs.length) {
  console.error(errs.join("\n"));
  process.exit(1);
}
console.log(`ok: ${combos.length} combos, ${count("ingredient")} ingredients, ${count("dish")} dishes, ` +
            `${count("technique")} techniques, ${count("cuisine")} cuisines, ${count("trash")} in the bin`);
