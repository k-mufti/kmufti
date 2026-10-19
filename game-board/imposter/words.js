// Imposter's secret words, by category. Each entry is a pair of close
// cousins: a classic round deals one of the two to everyone but the
// imposter; an undercover round deals one to the crew and the other to the
// undercover player, who doesn't know their word is the odd one out.
// Shared by the server (which deals) and the page (which lists the
// categories).

export const CATEGORIES = [
  {
    id: "food", name: "Food",
    pairs: [
      ["Pizza", "Flatbread"], ["Burger", "Sandwich"], ["Sushi", "Poke bowl"], ["Taco", "Burrito"],
      ["Pancakes", "Waffles"], ["Spaghetti", "Ramen"], ["Fries", "Onion rings"], ["Donut", "Bagel"],
      ["Ice cream", "Frozen yogurt"], ["Popcorn", "Chips"], ["Hot dog", "Corn dog"], ["Salad", "Coleslaw"],
      ["Cupcake", "Muffin"], ["Croissant", "Pretzel"], ["Steak", "Ribs"], ["Mac and cheese", "Lasagna"],
      ["Chocolate", "Caramel"], ["Omelette", "Scrambled eggs"], ["Dumplings", "Spring rolls"], ["Nachos", "Quesadilla"],
      ["Cheesecake", "Tiramisu"], ["Fried chicken", "Chicken nuggets"], ["Soup", "Stew"], ["Grilled cheese", "Toastie"],
      ["Watermelon", "Pineapple"], ["Avocado toast", "Bruschetta"], ["Cereal", "Oatmeal"], ["Shawarma", "Gyro"],
    ],
  },
  {
    id: "drinks", name: "Drinks",
    pairs: [
      ["Coffee", "Tea"], ["Bubble tea", "Smoothie"], ["Lemonade", "Iced tea"], ["Hot chocolate", "Chai latte"],
      ["Orange juice", "Apple juice"], ["Milkshake", "Frappuccino"], ["Energy drink", "Soda"], ["Sparkling water", "Tonic water"],
      ["Espresso", "Cold brew"], ["Coconut water", "Sports drink"], ["Matcha", "Green tea"], ["Root beer", "Cream soda"],
    ],
  },
  {
    id: "animals", name: "Animals",
    pairs: [
      ["Dog", "Wolf"], ["Cat", "Lion"], ["Penguin", "Puffin"], ["Shark", "Dolphin"], ["Giraffe", "Zebra"],
      ["Elephant", "Rhino"], ["Owl", "Bat"], ["Frog", "Toad"], ["Snake", "Lizard"], ["Bee", "Wasp"],
      ["Horse", "Donkey"], ["Monkey", "Gorilla"], ["Turtle", "Tortoise"], ["Octopus", "Squid"], ["Kangaroo", "Koala"],
      ["Rabbit", "Hamster"], ["Eagle", "Hawk"], ["Butterfly", "Moth"], ["Panda", "Polar bear"], ["Crab", "Lobster"],
      ["Flamingo", "Peacock"], ["Cow", "Goat"], ["Sloth", "Raccoon"], ["Whale", "Seal"], ["Pigeon", "Seagull"],
    ],
  },
  {
    id: "places", name: "Places",
    pairs: [
      ["Beach", "Pool"], ["Airport", "Train station"], ["Hospital", "Pharmacy"], ["Library", "Bookstore"],
      ["Gym", "Yoga studio"], ["Cinema", "Theater"], ["Zoo", "Aquarium"], ["Supermarket", "Mall"],
      ["Classroom", "Office"], ["Church", "Museum"], ["Casino", "Arcade"], ["Camping", "Cabin"],
      ["Amusement park", "Water park"], ["Restaurant", "Food truck"], ["Hotel", "Hostel"], ["Prison", "Police station"],
      ["Farm", "Garden"], ["Bakery", "Coffee shop"], ["Stadium", "Arena"], ["Space station", "Submarine"],
      ["Wedding", "Prom"], ["Laundromat", "Car wash"], ["Hair salon", "Nail salon"], ["Volcano", "Desert"],
    ],
  },
  {
    id: "jobs", name: "Jobs",
    pairs: [
      ["Doctor", "Nurse"], ["Chef", "Baker"], ["Teacher", "Principal"], ["Pilot", "Flight attendant"],
      ["Firefighter", "Lifeguard"], ["Police officer", "Security guard"], ["Dentist", "Barber"], ["Lawyer", "Judge"],
      ["Astronaut", "Scientist"], ["Plumber", "Electrician"], ["Influencer", "Streamer"], ["Photographer", "Painter"],
      ["DJ", "Singer"], ["Magician", "Clown"], ["Farmer", "Gardener"], ["Mail carrier", "Delivery driver"],
      ["Waiter", "Bartender"], ["Vet", "Zookeeper"], ["Architect", "Builder"], ["Detective", "Spy"],
    ],
  },
  {
    id: "home", name: "Around the house",
    pairs: [
      ["Couch", "Bed"], ["Toothbrush", "Hairbrush"], ["Fridge", "Freezer"], ["Microwave", "Oven"],
      ["Pillow", "Blanket"], ["Mirror", "Window"], ["Lamp", "Candle"], ["Shower", "Bathtub"],
      ["Remote", "Phone charger"], ["Vacuum", "Broom"], ["Toaster", "Kettle"], ["Fork", "Spoon"],
      ["Doorbell", "Alarm clock"], ["Washing machine", "Dishwasher"], ["Curtains", "Blinds"], ["Rug", "Doormat"],
      ["Scissors", "Knife"], ["Umbrella", "Raincoat"], ["Keys", "Wallet"], ["Trash can", "Recycling bin"],
    ],
  },
  {
    id: "sports", name: "Sports & games",
    pairs: [
      ["Soccer", "Rugby"], ["Basketball", "Volleyball"], ["Tennis", "Badminton"], ["Baseball", "Cricket"],
      ["Golf", "Mini golf"], ["Boxing", "Wrestling"], ["Skiing", "Snowboarding"], ["Surfing", "Skateboarding"],
      ["Swimming", "Diving"], ["Chess", "Checkers"], ["Bowling", "Darts"], ["Hide and seek", "Tag"],
      ["Poker", "Blackjack"], ["Ping pong", "Air hockey"], ["Karate", "Fencing"], ["Marathon", "Sprint"],
      ["Video games", "Board games"], ["Ice hockey", "Figure skating"], ["Yoga", "Pilates"], ["Rock climbing", "Hiking"],
    ],
  },
  {
    id: "school", name: "School",
    pairs: [
      ["Homework", "Exam"], ["Pencil", "Pen"], ["Backpack", "Locker"], ["Recess", "Lunch break"],
      ["Math", "Science"], ["Field trip", "Assembly"], ["Graduation", "Prom"], ["Detention", "Principal's office"],
      ["Textbook", "Notebook"], ["Calculator", "Ruler"], ["School bus", "Carpool"], ["Group project", "Presentation"],
      ["Substitute teacher", "Student teacher"], ["Yearbook", "Class photo"], ["Spelling bee", "Science fair"], ["Gym class", "Art class"],
    ],
  },
  {
    id: "travel", name: "Travel & vehicles",
    pairs: [
      ["Plane", "Helicopter"], ["Car", "Taxi"], ["Bike", "Scooter"], ["Train", "Subway"], ["Boat", "Cruise ship"],
      ["Passport", "Boarding pass"], ["Suitcase", "Backpack"], ["Road trip", "Vacation"], ["Hot air balloon", "Parachute"],
      ["Motorcycle", "Moped"], ["Rocket", "Spaceship"], ["Tractor", "Bulldozer"], ["Ambulance", "Fire truck"],
      ["Jet lag", "Sunburn"], ["Souvenir", "Postcard"], ["Bus", "Tram"],
    ],
  },
  {
    id: "online", name: "Online",
    pairs: [
      ["Selfie", "Group photo"], ["Meme", "GIF"], ["Group chat", "Voice note"], ["Podcast", "Livestream"],
      ["Hashtag", "Emoji"], ["Wi-Fi", "Bluetooth"], ["Password", "Username"], ["Unboxing video", "Review video"],
      ["Dance trend", "Lip sync"], ["Spam", "Pop-up ad"], ["Screenshot", "Screen recording"], ["Dark mode", "Airplane mode"],
      ["Viral video", "Blooper reel"], ["Online shopping", "Food delivery"], ["Video call", "Phone call"], ["Battery low", "No signal"],
    ],
  },
  {
    id: "party", name: "Parties & holidays",
    pairs: [
      ["Birthday", "Anniversary"], ["Halloween", "Costume party"], ["Christmas", "New Year's Eve"], ["Fireworks", "Confetti"],
      ["Karaoke", "Talent show"], ["Piñata", "Party hat"], ["Sleepover", "Pajama party"], ["Barbecue", "Picnic"],
      ["Surprise party", "Baby shower"], ["Valentine's Day", "First date"], ["Easter egg hunt", "Treasure hunt"], ["Wedding cake", "Birthday cake"],
      ["Disco ball", "Strobe light"], ["Haunted house", "Escape room"], ["Concert", "Festival"], ["Thanksgiving", "Family reunion"],
    ],
  },
  {
    id: "fantasy", name: "Fantasy & sci-fi",
    pairs: [
      ["Dragon", "Dinosaur"], ["Wizard", "Witch"], ["Vampire", "Werewolf"], ["Ghost", "Zombie"], ["Unicorn", "Pegasus"],
      ["Mermaid", "Pirate"], ["Alien", "Robot"], ["Time machine", "Teleporter"], ["Superhero", "Villain"], ["Castle", "Tower"],
      ["Magic wand", "Crystal ball"], ["Fairy", "Elf"], ["Treasure map", "Secret door"], ["Invisibility", "Flying"],
      ["Spaceship", "UFO"], ["Ninja", "Samurai"], ["Mummy", "Skeleton"], ["Genie", "Fairy godmother"],
    ],
  },
  {
    id: "nature", name: "Nature & weather",
    pairs: [
      ["Rain", "Snow"], ["Thunderstorm", "Tornado"], ["Rainbow", "Sunset"], ["Mountain", "Hill"], ["Ocean", "Lake"],
      ["Forest", "Jungle"], ["Waterfall", "River"], ["Moon", "Sun"], ["Earthquake", "Tsunami"], ["Cave", "Tunnel"],
      ["Island", "Iceberg"], ["Fog", "Smoke"], ["Flower", "Tree"], ["Lightning", "Wildfire"], ["Star", "Planet"], ["Sand", "Mud"],
    ],
  },
  {
    id: "clothes", name: "Clothes & style",
    pairs: [
      ["Sneakers", "Boots"], ["Hoodie", "Sweater"], ["Jeans", "Sweatpants"], ["Sunglasses", "Glasses"], ["Hat", "Beanie"],
      ["Dress", "Skirt"], ["Pajamas", "Onesie"], ["Tie", "Bow tie"], ["Backpack", "Purse"], ["Flip-flops", "Sandals"],
      ["Earrings", "Necklace"], ["Gloves", "Mittens"], ["Swimsuit", "Shorts"], ["Tuxedo", "Suit"], ["Tattoo", "Piercing"], ["Scarf", "Bandana"],
    ],
  },
];

export const byId = (id) => CATEGORIES.find((c) => c.id === id) || null;
