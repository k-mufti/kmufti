# Writing combos for Infinite Kitchen

This is the spec for whoever writes the next batch of recipes — a person, me in
chunks, another agent, or an API call at runtime. Follow it exactly and two
batches written a month apart will still agree with each other. Consistency is
the whole product: there is no clever engine underneath, only these rules and
the pairs they produce.

The short version is at the bottom, sized to paste into a system prompt.

---

## The job

Given two items, answer with one result. A pair is **unordered** — `Salt + Water`
and `Water + Salt` are the same combo and must never be given two answers. No
rule may ever depend on which item came first.

Every pair gets an answer. There is no "nothing here", no error, no blank.

---

## 1. Picking the result

Take the **first** rule that applies.

1. **A real, well-known thing exists.** Use it. `Flour + Water = Dough`.
2. **A technique that would do nothing** → give the item back unchanged.
   `Water + Cut = Water`, `Rice + Mix = Rice`. Cutting water does nothing, so
   nothing is what happens. This is a real answer, not a failure.
3. **X + X with no natural product** → an upgrade or a bigger version of X.
   `Oil + Oil = Extra Virgin Olive Oil`, `Chicken + Chicken = Turkey`. If a
   natural product does exist, it wins: `Milk + Milk = Cream`.
4. **The stacking rules** (section 3) — a modifier onto a dish.
5. **Nothing real fits** → invent something plausible, then something funny, in
   that order. It still has to be food.

**Famous beats accurate, and the closer to the pantry, the harder that applies.**
`Oil + Onion` is Fried Onions, not Sofrito. Four steps deep, the specific,
regional, less-known answer is the better one — the player went looking for it.

**Never** a non-food prop. No Deep Fryer, no Wet Knife, no Sugar Scrub. If the
answer isn't food, something you cook with, or something in the bin, it's wrong.

---

## 2. Naming

- The name a person says out loud. **Butter**, not Churned Cream.
- Shortest common form. **Fried Rice**, not Egg Fried Rice, unless they are
  genuinely different dishes.
- No placeholder names. Never "X Base", "X Mix", "Prepared X". If `Egg + Sugar`
  really only leads to meringue, the answer is **Meringue**, not Meringue Base.
- Bin items are **one word**, always: Burnt, Mush, Slop. Never "Burnt Chicken",
  never "Slop — was Butter Chicken". The bin does not remember what it ate.
- No brand names. "Burrito Bowl", not a restaurant chain's name.

---

## 3. Stacking: modifier, head noun, neither

Every item is one of three things. These are tests, not lists — apply them to
whatever you are holding.

### Modifier — can ride in front of a dish

**Test: would a menu plausibly print "*X* Cheeseburger" or "*X* Rice"?**

- Ingredients with a flavour identity: proteins, toppings, fats, sweeteners,
  aromatics, sauces. Butter, Honey, Garlic, Bacon, Chocolate, Kimchi.
- Techniques, as participles: Grill → Grilled, Fry → Fried, Smoke → Smoked,
  Freeze → Frozen, Whip → Whipped.
- Cuisines, but only after rule 1 fails. `Korean + Beef` is **Bulgogi**, a real
  dish, not "Korean Beef". Only when no real dish exists does the cuisine ride
  in front: Korean Cheeseburger. It counts toward the cap.

### Head noun — what the dish physically is

**Test: strip every describing word and you are left with something you could
point at on a plate, and it does not change as modifiers pile on.** Burger,
Pizza, Cake, Soup, Rice, Sandwich, Fries, Taco.

Two traps:

- **A multi-word name is not automatically a stack.** Shakshuka, Mansaf,
  Biryani, Pad Thai are single units with **zero** modifiers. Nothing in them
  detaches.
- Only genuinely detachable words count. That is why
  `Pepperoni Pizza + Red Velvet Cake` works: both are heads, and pepperoni
  detaches.

### Neither — never stacks

**Test: does "*X* Burger" read as a mistake rather than a menu item?**

- Bulk staples with no flavour of their own: Water, Flour, Dough, Soil.
- Everything in the bin. Bin items absorb rather than attach: bin item plus
  anything is that bin item.
- Tools, places, and anything you do not eat.

### The stacking rules

1. **Modifier + dish** → stack it. **Four modifiers is the ceiling; the fifth
   is Slop.** Never show the player a count.
2. **Head + head, at least one with a modifier to lend** → keep one head, borrow
   the modifiers, and count them all toward the cap.
   `Pepperoni Pizza + Red Velvet Cake = Pepperoni Red Velvet Cake`.
3. **Head + head, neither with a modifier** → **Mush**. Maqluba + Mansaf are two
   finished dishes with nothing to give each other.
4. **The same modifier twice** → "Double". A third time is Slop regardless of
   the count.
5. **Word order in the output** — the input order never matters, but the name
   must come out the same every time: **cuisine → techniques → ingredients →
   head**. Any order of the same pieces gives "Korean Double Steamed Glazed
   Butter Cheeseburger".
6. **Neither + dish** → the dish comes back unchanged (rule 1.2).

---

## 4. The bin

The bin is a section of its own, and it is an input, not a dead end. Every bin
item leads somewhere.

**How things get ruined**, by the technique that ruined them:

| What you did | Result |
|---|---|
| Heat, Grill, Roast, Bake, Fry, Deep-fry, Smoke, Torch, Stir-fry on something already cooked | **Burnt** |
| Deep-fry again on top of that | **Grease** |
| Boil, Simmer, Steam past the point | **Mush** |
| Mix, Whip, Blend past the point | **Sludge** |
| Cut, Mince past the point | **Crumbs** |
| Wait on cooked food | **Leftovers**, then **Mold**, then **Rot** |
| Piling past four modifiers | **Slop** |
| Two finished dishes with nothing to lend | **Mush** |

Burning is permanent. There is no un-burning — the compost chain is the second
chance.

**Where the bin leads:** Burnt + Burnt = Ash → Charcoal → Smoke. Ash + Corn =
Nixtamal → Masa. Ash + Water = Lye → Pretzel. Leftovers → Mold → Rot → Compost →
Soil → Garden → Sprout → Vegetables. Compost + Water = Mushroom. Slop + Wait =
Pig (slop is pig feed) → Pork. Weeds + Wait = Sheep → Lamb. Slop + Bread =
Mystery Burger, which unlocks Fast Food.

**Heat undoes cold**, which is the one reversal: `Ice Cream + Heat = Milkshake`,
`Snow Cone + Heat = Simple Syrup`, `Ice + Heat = Water`.

---

## 5. What is fixed and must never be invented

**The 9 starters:** Water, Soil, Egg, Sugar, Meat, and the four starting
techniques Mix, Heat, Cut, Wait. Everything else is discovered: Meat + something
is an animal (Meat + Egg = Hen), cutting the animal gives its meat (Hen + Cut =
Chicken), and an animal + Wait is its baby (Cow + Wait = Calf).

**The 11 techniques**, each a tool in the kitchen: Cut (knife), Mix (bowl),
Blend (blender), Heat (stove), Boil (pot), Fry (pan), Bake (oven), Grill
(grill), Wait (clock), Ferment (jars), Freeze (freezer). Mincing is cutting
twice, whipping and kneading are mixing, simmering and steaming are boiling,
roasting is baking, smoking is grilling. **No combo may ever produce a new
technique.**

**The 11 cuisines**, each unlocked by its signature dish: American (Burger),
Italian (Pasta), Mexican (Tortilla), French (Crêpe), Middle Eastern (Pita),
Indian (Naan), Chinese (Dumpling), Japanese (Sushi Rice), Korean (Kimchi),
Thai (Fried Rice), Fast Food (Mystery Burger). **No combo may produce a new
cuisine.**

**Cuisines hand out nothing.** There are no gifts. Every ingredient is crafted,
most of them through the garden: Vegetables + Italian = Garlic, Fruit + French =
Apple, Beans + Indian = Lentils, Herbs + Thai = Lemongrass. A cuisine is a lens
you craft through, not a bag of presents.

**Cuisine combos must be real dishes of that cuisine.** Never a stereotype, never
a nationality joke. If that cuisine has no dish for it, it is a modifier
(section 3) or nothing.

---

## 6. Categories

Every result is one of: `ingredient`, `dish`, `technique`, `cuisine`, `trash`.
A dish can be used as an ingredient. When in doubt between ingredient and dish,
ask whether someone would order it.

---

## 7. Things that are fine, and often wanted

- **Several pairs making the same thing.** `Egg + Rice` and `Leftover Rice + Fry`
  can both be Fried Rice. No cap.
- **Dead ends.** Not every item has to lead anywhere.
- **Jokes**, as long as the result is still in the food world. Onion + Cut =
  Tears, Beef + Beef = Cow, Chicken + Chicken = Turkey are all fine. Sugar Scrub
  is not — that is a prop.
- **Depth.** Long chains are good when each link is a real thing.

---

## 8. What you do NOT have to write

`rules.js` answers four families of pair on its own, at play time, whenever no
recipe is written. Do not spend batches on these:

- **The bin absorbs.** Any bin item plus anything is that bin item.
- **Ruining what is cooked.** Cooked + a heat technique is Burnt, + Boil,
  Simmer or Steam is Mush, + Wait is Leftovers. "Cooked" is worked out from the
  recipes themselves, so nothing needs tagging.
- **Doing nothing.** Mix plus a single ingredient gives the ingredient back.
- **Stacking a flavour.** Modifier + dish composes the name, four deep, then
  Slop, in the fixed order from section 3.

A written recipe always wins over these. So write the pairs that need a cook's
judgement — `Chickpeas + Blend = Hummus`, `Eggplant + Grill = Baba Ghanoush` -
and let the rules mop up the mechanical ones.

## 9. Output format

Combos are written in the `.txt` files next to `recipes.json` (`opening.txt`,
`more.txt`, `deep1.txt`...), one per line, and `node infinite-kitchen/build.js`
turns them into `recipes.json` and runs the checker. Never edit `recipes.json`
by hand. The files also understand:

- `@ Honey` then `Fish = Teriyaki Salmon` - a row: Honey + Fish.
- `Salted Egg is Egg` - a technique on it cooks it like an egg.
- `Calf acts like Cow except Water, Cut` - Calf gets every Cow recipe it
  doesn't have, except those. Only for things that really are a kind of the
  other. `renaming Chicken to Duck` fixes names in the copies.
- `Chili is raw` - heat made it without cooking it (the sun, the sea).

Underneath, `recipes.json` holds plain unordered pairs:

```json
["Flour", "Water", "Dough"]
```

Every result also needs a line in `items`, giving its category:

```json
"Dough": "ingredient"
```

Then run the checker, which refuses duplicates with different answers, unknown
names, results with no category, unreachable items, and new techniques or
cuisines:

```bash
node infinite-kitchen/check.js
```

A batch that does not pass the checker is not finished.

---

## The short version, for a system prompt

> You write recipes for Infinite Kitchen, a food combining game. Given two
> items, answer with exactly one result, as JSON: `{"result": "...", "kind":
> "ingredient|dish|technique|cuisine|trash"}`.
>
> Pairs are unordered; the same pair must always give the same answer. Every
> pair gets an answer.
>
> Pick the first that applies: (1) a real, well-known food or ingredient — the
> famous name, not the obscure one; (2) if a technique would do nothing to the
> item, return the item unchanged (Water + Cut = Water); (3) X + X with no
> natural product is an upgraded X (Oil + Oil = Extra Virgin Olive Oil);
> (4) a modifier in front of a dish (Butter + Cheeseburger = Butter
> Cheeseburger), up to four modifiers, the fifth is "Slop"; (5) invent something
> plausible, then something funny — but always food.
>
> Never invent a technique or a cuisine. The 11 techniques and 11 cuisines are
> fixed. A cuisine plus a dish must be a real dish of that cuisine, never a
> stereotype; if there is none, the cuisine acts as a modifier.
>
> Use the name people say out loud. Never "X Base" or "X Mix". Never a non-food
> prop. Never a brand name. Bin items are one word — Burnt, Mush, Slop, Ash,
> Mold, Rot, Grease, Sludge, Crumbs, Leftovers — and never say what they used
> to be.
>
> Cooking something already cooked is Burnt. Boiling it past the point is Mush.
> Waiting on cooked food is Leftovers, then Mold, then Rot. Two finished dishes
> with no modifier to lend each other is Mush. Heat undoes cold.
>
> Stacked names come out in this order: cuisine, techniques, ingredients, head
> noun. The same modifier twice is "Double".
