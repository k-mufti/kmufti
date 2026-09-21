// The four mechanical rules, for pairs nobody has written a recipe for.
//
// These do not invent food. They only do the things that are the same every
// time and would otherwise need tens of thousands of hand-written lines:
//
//   1. the bin absorbs       Burnt + Pizza = Burnt
//   2. ruining what's cooked Roast Chicken + Grill = Burnt, + Boil = Mush,
//                            + Wait = Leftovers
//   3. doing nothing         Mix + Garlic = Garlic
//   4. stacking a flavour    Butter + Cheeseburger = Butter Cheeseburger,
//                            up to four, then Slop
//
// Anything that needs a cook's judgement - Chickpeas + Blend is Hummus, not
// "Blended Chickpeas" - stays hand-written in recipes.json, and a written
// recipe always wins: these only run when the pair has no recipe at all.
//
// The same file runs in the browser and under node (the pruner uses it to
// find written combos these rules would have produced anyway).
"use strict";

(function (root) {
  const HEAT = ["Heat", "Grill", "Roast", "Bake", "Fry", "Deep-fry", "Smoke", "Torch", "Stir-fry"];
  const WET = ["Boil", "Simmer", "Steam"];

  // When two bin items meet, the worse one wins.
  const BIN_ORDER = ["Leftovers", "Dishwater", "Crumbs", "Husk", "Grease", "Sludge", "Mush", "Burnt", "Mold",
                     "Rot", "Scraps", "Compost", "Soil", "Ash", "Charcoal", "Soap", "Slop", "Poison"];

  const PARTICIPLE = {
    Grill: "Grilled", Fry: "Fried", "Deep-fry": "Deep-Fried", Bake: "Baked", Roast: "Roasted",
    Smoke: "Smoked", Freeze: "Frozen", Whip: "Whipped", Boil: "Boiled", Steam: "Steamed",
    Simmer: "Simmered", Mince: "Minced", Cure: "Cured", Dry: "Dried", Blend: "Blended",
    Knead: "Kneaded", "Stir-fry": "Stir-Fried", Torch: "Torched", Ferment: "Fermented",
  };

  // Bulk things with no flavour of their own: nobody orders a Flour Pizza.
  const NOT_A_FLAVOUR = new Set(["Water", "Ice", "Flour", "Dough", "Soil", "Salt", "Sugar", "Oil",
    "Milk", "Seeds", "Sprout", "Tree", "Garden", "Weeds", "Vegetables", "Fruit", "Beans", "Nuts",
    "Bread Flour", "00 Flour", "Still Water", "Sparkling Water", "Ice Water", "Brine", "Ocean",
    "Lye", "Nixtamal", "Masa", "Pastry Dough", "Pasta Dough", "Tortilla Dough", "Pretzel Dough",
    "Batter", "Cake Batter", "Pancake Batter", "Cookie Dough", "Dough Balls", "Seasoning"]);

  const MAX_MODS = 4;   // the fifth is Slop

  // Things heat melts, sets loose or splits rather than cooks. Heat + Panna
  // Cotta = Cream undoes something; it doesn't make cream "cooked" - which
  // would stop Cream + Whip being Whipped Cream.
  const MELTS = new Set(["Ice", "Ice Cream", "Snow Cone", "Panna Cotta", "Milk Foam", "Aspic",
    "Soda", "Buttercream", "Compound Butter", "Cultured Butter", "Salted Butter", "Butter",
    "Greek Yogurt", "Yogurt", "Lassi", "Sour Cream", "Hollandaise", "Mayonnaise", "Thousand Island",
    "Icing", "Cotton Candy", "Rock Candy", "Frozen Yogurt", "Slushie", "Shaved Ice"]);

  // Split a name back into the flavours someone stacked and the dish
  // underneath, so a reload doesn't lose count. The dish underneath has to be
  // a name recipes.json actually writes, and the split that keeps the LONGEST
  // written name wins - otherwise "Tomato Grilled Cheese" would read as
  // Tomato + Grilled on top of plain Cheese, and Grilled Cheese would come
  // apart in the player's hands.
  const isMod = (piece, ctx) => {
    const bare = piece.replace(/^Double /, "");
    return ctx.isModifier(bare) || ctx.kindOf(bare) === "cuisine" ||
           Object.values(PARTICIPLE).includes(bare);
  };

  function parse(name, ctx) {
    // If a written recipe makes this name by putting one item in front of
    // another - Pizza + Pepperoni = Pepperoni Pizza - then it IS a stack, and
    // the recipe says so. Grilled Cheese comes from a cheese sandwich and a
    // grill, so it stays in one piece. That is the difference, and the data
    // knows it without anyone tagging anything.
    const split = ctx.splitOf && ctx.splitOf(name);
    if (split) {
      const under = parse(split.head, ctx);
      return { mods: under.mods.concat([split.mod]), head: under.head };
    }
    if (ctx.isWritten(name)) return { mods: [], head: name };

    const words = name.split(" ");
    for (let i = 0; i < words.length; i++) {
      const head = words.slice(i).join(" ");
      if (!ctx.isWritten(head)) continue;
      const mods = [];
      let j = 0, ok = true;
      while (j < i) {
        let took = 0;
        for (let take = Math.min(3, i - j); take >= 1; take--) {
          const piece = words.slice(j, j + take).join(" ");
          if (isMod(piece, ctx)) { mods.push(piece); j += take; took = take; break; }
        }
        if (!took) { ok = false; break; }
      }
      if (ok) return { mods, head };
    }
    return { mods: [], head: name };
  }

  const rank = (m, ctx) =>
    ctx.kindOf(m.replace(/^Double /, "")) === "cuisine" ? 0
    : Object.values(PARTICIPLE).includes(m.replace(/^Double /, "")) ? 1 : 2;

  // ctx: { kindOf(name), isCooked(name), isModifier(name) }
  function make(a, b, ctx) {
    const ka = ctx.kindOf(a), kb = ctx.kindOf(b);

    // 1. the bin absorbs whatever it touches
    if (ka === "trash" || kb === "trash") {
      if (ka === "trash" && kb === "trash") {
        const ia = BIN_ORDER.indexOf(a), ib = BIN_ORDER.indexOf(b);
        return { result: ia >= ib ? a : b, kind: "trash" };
      }
      return { result: ka === "trash" ? a : b, kind: "trash" };
    }

    const tech = ka === "technique" ? a : kb === "technique" ? b : null;
    const thing = tech === a ? b : tech === b ? a : null;

    if (tech && thing && ctx.kindOf(thing) !== "technique" && ctx.kindOf(thing) !== "cuisine") {
      // 2. cooking what is already cooked, and leaving it out. A stacked name
      // counts as cooked when the dish under it is: Tomato Grilled Cheese is
      // still a grilled cheese.
      if (ctx.isCooked(thing) || ctx.isCooked(parse(thing, ctx).head)) {
        if (HEAT.includes(tech)) return { result: "Burnt", kind: "trash" };
        if (WET.includes(tech)) return { result: "Mush", kind: "trash" };
        if (tech === "Wait") return { result: "Leftovers", kind: "trash" };
      }
      // 3. stirring one thing on its own does nothing
      if (tech === "Mix") return { result: thing, kind: ctx.kindOf(thing) };
    }

    // 4. a technique on a raw ingredient: grilled garlic, minced parsley.
    //    Only the techniques that plainly describe what you did - Wait and
    //    Ferment are left alone, because Milk + Wait is Yogurt, not "Aged
    //    Milk", and that is a judgement call for a person.
    if (tech && thing && ctx.kindOf(thing) === "ingredient" && !ctx.isCooked(thing) &&
        PARTICIPLE[tech] && tech !== "Ferment" && ctx.isModifier(thing)) {
      return { result: PARTICIPLE[tech] + " " + thing, kind: "ingredient" };
    }

    // 5. two techniques with no written recipe make no new technique, and a
    //    cuisine cannot cook: in both cases the technique is what is left.
    if (ka === "cuisine" && kb === "cuisine" && a === b) {
      return { result: a, kind: "cuisine" };      // one cuisine, still itself
    }
    if (ka === "technique" && kb === "technique") {
      return { result: a <= b ? a : b, kind: "technique" };
    }
    if (tech && (ka === "cuisine" || kb === "cuisine")) {
      return { result: tech, kind: "technique" };
    }

    // 6. a flavour in front of a dish
    const dish = ka === "dish" ? a : kb === "dish" ? b : null;
    const other = dish === a ? b : dish === b ? a : null;
    if (dish && other) {
      const ko = ctx.kindOf(other);

      // 7. two finished dishes: one keeps its head, the other lends whatever
      //    flavours it has. Two bare names have nothing to give each other.
      if (ko === "dish") {
        const A = parse(dish, ctx), B = parse(other, ctx);
        const lender = B.mods.length ? B : A.mods.length ? A : null;
        if (!lender) return { result: "Mush", kind: "trash" };
        const keeper = lender === B ? A : B;
        const mods = keeper.mods.concat(lender.mods.filter((m) => !keeper.mods.includes(m)));
        if (mods.length > MAX_MODS) return { result: "Slop", kind: "trash" };
        mods.sort((x, y) => rank(x, ctx) - rank(y, ctx));
        return { result: mods.join(" ") + " " + keeper.head, kind: "dish" };
      }

      let mod = null;
      if (ko === "cuisine") mod = other;
      else if (ko === "technique") mod = PARTICIPLE[other] || null;
      else if (ko === "ingredient" && ctx.isModifier(other)) mod = other;
      // 8. a bulk staple does nothing to a finished dish
      if (!mod) return ko === "ingredient" ? { result: dish, kind: "dish" } : null;

      const { mods, head } = parse(dish, ctx);
      if (mods.length >= MAX_MODS) return { result: "Slop", kind: "trash" };
      const already = mods.findIndex((m) => m === mod || m === "Double " + mod);
      let next;
      if (already === -1) next = mods.concat([mod]);
      else if (mods[already] === mod) next = mods.map((m, i) => (i === already ? "Double " + m : m));
      else return { result: "Slop", kind: "trash" };       // a third helping
      next.sort((x, y) => rank(x, ctx) - rank(y, ctx));
      return { result: next.join(" ") + " " + head, kind: "dish" };
    }

    return null;    // nothing mechanical to say: this one needs writing by hand
  }

  // What counts as already cooked, worked out from the recipes rather than
  // tagged by hand. Something is cooked when a recipe puts heat on it
  // directly (Heat + Chicken = Roast Chicken), or when EVERY way of making it
  // starts from something cooked. That "every" matters: Brine can be made
  // raw from Salt + Water, so dissolving a salt crust into it doesn't make
  // brine - or the ocean, or the fish in it - count as cooked.
  //
  // Recipes that hand back one of their own inputs (Brine + Cut = Brine)
  // cook nothing and are ignored, and `starters`, techniques and cuisines
  // are never cooked however a recipe re-makes them.
  function cookedSet(combos, items, starters) {
    const raw = new Set(starters || []);
    const made = new Map();
    for (const [a, b, r] of combos) {
      if (a === r || b === r) continue;
      if (!made.has(r)) made.set(r, []);
      made.get(r).push([a, b]);
    }
    const skip = (r) => {
      const k = items[r];
      return k === "trash" || k === "technique" || k === "cuisine" || raw.has(r);
    };
    const cooked = new Set();
    for (const [r, srcs] of made) {
      if (!skip(r) && srcs.some(([a, b]) =>
        (HEAT.includes(a) && !MELTS.has(b)) || (HEAT.includes(b) && !MELTS.has(a)))) cooked.add(r);
    }
    for (let changed = true; changed;) {
      changed = false;
      for (const [r, srcs] of made) {
        if (cooked.has(r) || skip(r)) continue;
        if (srcs.every(([a, b]) => cooked.has(a) || cooked.has(b))) { cooked.add(r); changed = true; }
      }
    }
    return cooked;
  }

  // name -> { mod, head } for every written name that is one item in front
  // of another.
  function splitMap(combos, items) {
    const m = new Map();
    for (const [a, b, r] of combos) {
      if (r === a + " " + b && items[b]) m.set(r, { mod: a, head: b });
      else if (r === b + " " + a && items[a]) m.set(r, { mod: b, head: a });
    }
    return m;
  }

  const API = { make, cookedSet, parse, splitMap, MELTS, HEAT, WET, PARTICIPLE, NOT_A_FLAVOUR, MAX_MODS };
  root.KitchenRules = API;
  if (typeof module !== "undefined" && module.exports) module.exports = API;
})(typeof window !== "undefined" ? window : globalThis);
