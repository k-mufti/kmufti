/* =========================================================================
   You — one name (and one colour) for the whole of kmufti.com.

   Every game lives on the same origin, so they can all read the same
   localStorage. This file owns the two keys; games load it with a plain
   <script src="../you.js"> before their own code and use:

     KmuftiYou.name()          your name (a random one until you pick one)
     KmuftiYou.setName(n)      change it everywhere; returns what was saved
     KmuftiYou.color()         your colour, e.g. for a cursor
     KmuftiYou.onChange(fn)    fn({ name, color }) when it changes, including
                               from another tab

   The first visit after this shipped adopts a name you already had from
   Jigsaw or Yahtzee, so nobody gets renamed.
   ========================================================================= */
(function () {
  const NAME = "kmufti-name";
  const COLOR = "kmufti-color";
  const MAX = 18;

  /* ---------- Random names, for anyone who hasn't picked one ----------
     Five flavours, mixed: oddly specific strangers, overqualified jobs,
     pompous food nobility, junk-drawer objects and 2009 gamertags. Some are
     built from parts (hundreds of combinations), some are hand-written
     because a combination would read wrong. Everything fits in MAX. */
  const pick = (a) => a[(Math.random() * a.length) | 0];

  // Oddly specific strangers -- best in multiplayer: "someone's dad placed
  // 40 pieces".
  const STRANGERS = [
    "someone's dad", "someone's mom", "someone's uncle", "someone's aunt", "someone's cousin",
    "someone's grandma", "someone's landlord", "someone's dentist", "someone's ex", "someone's boss",
    "guy with 3 coffees", "the new intern", "your old roommate", "man who just woke", "lady at bus stop",
    "kid in the back", "guy who said hi", "girl with a kite", "the quiet one", "the loud neighbor",
    "man in a cape", "a tall stranger", "guy from the gym", "your lab partner", "the substitute",
    "the night janitor", "last one to leave", "a confused tourist", "the dog walker", "your barista",
    "man with a map", "lady with a parrot", "guy on a scooter", "the group chat", "your mailman",
    "a former child", "the plus one", "an extra", "the understudy", "the guy with dip",
    "the designated dad", "kid who ate glue", "your pen pal", "the wedding DJ", "a hall monitor",
    "the class pet", "your tax guy", "a man named Steve", "a woman named Pam", "someone's sidekick",
    "the guy in the hat", "a regular", "the new kid", "a mall Santa", "the backup singer",
  ];

  // Overqualified (or under-) job titles: modifier + job.
  const JOB_MODS = [
    "substitute", "retired", "part-time", "freelance", "assistant", "junior", "certified", "unpaid",
    "former", "amateur", "regional", "senior", "acting", "honorary", "weekend", "off-duty", "volunteer",
    "head", "chief", "aspiring", "emergency", "travel", "backup", "night shift",
  ];
  const JOBS = [
    "wizard", "magician", "ghost", "pirate", "astronaut", "mermaid", "lifeguard", "dragon", "vampire",
    "knight", "mime", "detective", "cowboy", "ninja", "goblin", "jester", "clown", "witch", "sheriff",
    "spy", "werewolf", "sorcerer", "gladiator", "yeti", "oracle", "bard", "monk", "duck", "pharaoh",
    "lumberjack", "superhero", "villain", "cryptid", "time traveler", "alien", "goose",
  ];
  const JOB_ODDS = [
    "assistant to a cat", "regional duck lord", "CEO of naps", "top intern", "mayor of nowhere",
    "a pigeon's manager", "minister of snacks", "head of vibes", "office ghost", "VP of chaos",
  ];

  // Pompous titles, edible names.
  const FOODS = [
    "Pickle", "Dumpling", "Toast", "Crouton", "Waffle", "Biscuit", "Noodle", "Pretzel", "Meatball",
    "Nugget", "Turnip", "Radish", "Pancake", "Muffin", "Bagel", "Taco", "Burrito", "Gnocchi", "Pierogi",
    "Brisket", "Custard", "Crumpet", "Kebab", "Falafel", "Samosa", "Mochi", "Ravioli", "Scone", "Tater",
    "Churro", "Wonton", "Strudel", "Cabbage", "Parsnip", "Brioche", "Macaron", "Tofu", "Kimchi",
  ];
  const TITLES = [
    (f) => "Sir " + f, (f) => "Lady " + f, (f) => "Baron von " + f, (f) => "Duke of " + f,
    (f) => "Duchess of " + f, (f) => "Count " + f, (f) => "Dame " + f, (f) => f + " the Great",
    (f) => "Sir " + f + " III", (f) => "Lord " + f, (f) => "Captain " + f, (f) => "Dr. " + f,
    (f) => "Prince " + f, (f) => "Queen " + f, (f) => f + " the Bold", (f) => "Archduke " + f,
    (f) => "Mx. " + f, (f) => "Saint " + f, (f) => f + " Jr.", (f) => "Grand " + f,
  ];

  // The junk drawer.
  const JUNK = [
    "spare key", "loose battery", "mystery cable", "one sock", "expired coupon", "bent paperclip",
    "dead pen", "rubber band", "birthday candle", "takeout menu", "half a crayon", "soy sauce packet",
    "IKEA allen key", "old phone charger", "broken umbrella", "lone screw", "tangled earbuds",
    "sticky note", "gift card ($0)", "a single button", "dried up glue", "warranty card",
    "random magnet", "rogue twist tie", "spare fuse", "matchbook", "a used stamp", "lucky penny",
    "old receipt", "tiny screwdriver", "loose marble", "ketchup packet", "remote (no batts)",
    "mini flashlight", "chopsticks", "wobbly thumbtack", "ancient gum", "a mystery key",
  ];

  // 2009, the year everyone was xXsomethingXx.
  const TAG_WORDS = [
    "pancake", "soup", "toast", "waffle", "noodle", "pickle", "goblin", "potato", "gremlin", "nugget",
    "taco", "muffin", "bean", "llama", "ghost", "cheese", "pizza", "sushi", "frog", "dino", "turtle",
    "shrimp", "moose", "tater", "bagel", "pigeon", "raccoon", "nacho",
  ];
  const yy = () => String((Math.random() * 99) | 0).padStart(2, "0");
  const TAGS = [
    (w) => "xX" + w + "Xx", (w) => w + "_" + yy(), (w) => "~*" + w + "_queen*~", (w) => w + "slayer" + yy(),
    (w) => "x_" + w + "_x", (w) => w + "200" + ((Math.random() * 10) | 0), (w) => "lil_" + w,
    (w) => "the_real_" + w, (w) => w + "lord69", (w) => "sk8r_" + w, (w) => "~" + w + "~",
    (w) => "xx" + w + "4lyfe", (w) => "MC " + w, (w) => w + "Master" + yy(), (w) => "DJ " + w,
  ];

  // How often each flavour comes up.
  const FLAVOURS = [
    [32, () => pick(STRANGERS)],
    [14, () => pick(JOB_MODS) + " " + pick(JOBS)],
    [4, () => pick(JOB_ODDS)],
    [20, () => pick(TITLES)(pick(FOODS))],
    [12, () => pick(JUNK)],
    [18, () => pick(TAGS)(pick(TAG_WORDS))],
  ];
  const FLAVOUR_TOTAL = FLAVOURS.reduce((t, [w]) => t + w, 0);
  function randomName() {
    for (let tries = 0; tries < 40; tries++) {
      let r = Math.random() * FLAVOUR_TOTAL, make = FLAVOURS[0][1];
      for (const [w, f] of FLAVOURS) { if ((r -= w) < 0) { make = f; break; } }
      const n = make();
      if (n.length <= MAX) return n;        // built ones can run long; just draw again
    }
    return pick(STRANGERS);
  }

  const COLORS = ["#e8b45e", "#7fae52", "#5fb4e8", "#e2604f", "#c58ce0", "#4fd0b0", "#f0a83a", "#e87fa8", "#8fa8f0", "#d8d24a"];
  const read = (k) => { try { return localStorage.getItem(k) || ""; } catch { return ""; } };
  const write = (k, v) => { try { localStorage.setItem(k, v); } catch { /* private mode */ } };
  const clean = (n) => String(n || "").replace(/\s+/g, " ").trim().slice(0, MAX);

  // Before there was one name, Jigsaw and Yahtzee each kept their own.
  // Jigsaw's always exists once you've visited (it generated one), so a
  // name you typed into Yahtzee wins over it.
  let name = clean(read(NAME)) || clean(read("yahtzee-name")) || clean(read("kmufti-puzzle-name"));
  if (!name) name = randomName();
  write(NAME, name);

  let color = read(COLOR) || read("kmufti-puzzle-color");
  if (!/^#[0-9a-f]{6}$/i.test(color)) color = pick(COLORS);
  write(COLOR, color);

  const listeners = new Set();
  const emit = () => listeners.forEach((fn) => { try { fn({ name, color }); } catch (e) { console.error(e); } });

  // Another tab changed it: pick that up here too.
  window.addEventListener("storage", (e) => {
    if (e.key === NAME && clean(e.newValue) && clean(e.newValue) !== name) { name = clean(e.newValue); emit(); }
    if (e.key === COLOR && /^#[0-9a-f]{6}$/i.test(e.newValue || "") && e.newValue !== color) { color = e.newValue; emit(); }
  });

  window.KmuftiYou = {
    MAX,
    name: () => name,
    color: () => color,
    setName(n) {
      const v = clean(n);
      if (!v || v === name) return name;
      name = v;
      write(NAME, name);
      emit();
      return name;
    },
    // A fresh random name, for the "surprise me" button.
    randomName,
    onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); },
  };
})();
