import { MORE } from "./more-categories.js?v=1";

// Drafft's built-in categories: what's up for auction. Shared by the server
// (which deals the pool) and the page (the host's category picker).
// A draft needs players x roster items, so each list is long - 8 players at
// 6 picks is 48. A short list just caps how big a draft it can hold.

const FIRST = [
  {
    id: "candy", name: "Candy", emoji: "🍬",
    items: [
      "Reese's Cups", "Snickers", "Kit Kat", "M&M's", "Twix", "Skittles", "Sour Patch Kids", "Starburst",
      "Hershey's Bar", "Milky Way", "3 Musketeers", "Butterfinger", "Baby Ruth", "Almond Joy", "Mounds", "Twizzlers",
      "Red Vines", "Swedish Fish", "Haribo Gold-Bears", "Nerds", "Nerds Gummy Clusters", "Airheads", "Laffy Taffy", "Jolly Ranchers",
      "Warheads", "Sour Punch Straws", "Trolli Worms", "Hot Tamales", "Mike and Ike", "Jelly Belly", "Tootsie Rolls", "Tootsie Pops",
      "Blow Pops", "Ring Pop", "Push Pop", "Pez", "Smarties", "SweeTarts", "Lemonheads", "Junior Mints",
      "York Peppermint Pattie", "Whoppers", "Milk Duds", "Rolo", "Heath Bar", "Toblerone", "Ferrero Rocher", "Lindt Truffles",
      "Kinder Bueno", "Cadbury Creme Egg", "Peeps", "Candy Corn", "Cotton Candy", "Fun Dip", "Pop Rocks", "Werther's",
    ],
  },
  {
    id: "fastfood", name: "Fast food chains", emoji: "🍔",
    items: [
      "McDonald's", "Burger King", "Wendy's", "Chick-fil-A", "Taco Bell", "KFC", "Popeyes", "Subway",
      "Chipotle", "Five Guys", "In-N-Out", "Shake Shack", "Whataburger", "Culver's", "Raising Cane's", "Wingstop",
      "Panda Express", "Domino's", "Pizza Hut", "Papa John's", "Little Caesars", "Jersey Mike's", "Jimmy John's", "Arby's",
      "Sonic", "Jack in the Box", "Carl's Jr.", "Hardee's", "Del Taco", "Qdoba", "Panera Bread", "Dunkin'",
      "Starbucks", "Dairy Queen", "White Castle", "Steak 'n Shake", "Zaxby's", "Bojangles", "Church's Chicken", "Krystal",
      "Firehouse Subs", "Potbelly", "Smashburger", "Sweetgreen", "Cava", "Dave's Hot Chicken", "Crumbl", "Krispy Kreme",
    ],
  },
  {
    id: "pixar", name: "Pixar & Disney movies", emoji: "🎬",
    items: [
      "Toy Story", "Toy Story 2", "Toy Story 3", "Toy Story 4", "A Bug's Life", "Monsters, Inc.", "Monsters University", "Finding Nemo",
      "Finding Dory", "The Incredibles", "Incredibles 2", "Cars", "Cars 2", "Ratatouille", "WALL-E", "Up",
      "Brave", "Inside Out", "Inside Out 2", "The Good Dinosaur", "Coco", "Onward", "Soul", "Luca",
      "Turning Red", "Elemental", "The Lion King", "Aladdin", "Beauty and the Beast", "The Little Mermaid", "Mulan", "Tarzan",
      "Hercules", "Lilo & Stitch", "The Emperor's New Groove", "Tangled", "Frozen", "Frozen II", "Moana", "Zootopia",
      "Big Hero 6", "Wreck-It Ralph", "Encanto", "Bolt", "The Princess and the Frog", "Pocahontas", "Cinderella", "Snow White",
    ],
  },
  {
    id: "cereal", name: "Breakfast cereal", emoji: "🥣",
    items: [
      "Cinnamon Toast Crunch", "Lucky Charms", "Froot Loops", "Frosted Flakes", "Cap'n Crunch", "Crunch Berries", "Cocoa Puffs", "Reese's Puffs",
      "Honey Nut Cheerios", "Cheerios", "Apple Jacks", "Trix", "Fruity Pebbles", "Cocoa Pebbles", "Corn Pops", "Golden Grahams",
      "Honey Bunches of Oats", "Rice Krispies", "Cocoa Krispies", "Frosted Mini-Wheats", "Raisin Bran", "Corn Flakes", "Special K", "Life",
      "Cinnamon Life", "Kix", "Chex", "Cookie Crisp", "Count Chocula", "Rice Chex", "Honeycomb", "Golden Crisp",
      "Oreo O's", "French Toast Crunch", "Cracklin' Oat Bran", "Basic 4", "Wheaties", "Grape-Nuts", "Granola", "Krave",
      "Smacks", "Rice Krispies Treats Cereal", "Peanut Butter Toast Crunch", "Cheerios Protein", "Mini Wheats Strawberry", "Cinnamon Chex",
    ],
  },
  {
    id: "snacks", name: "Chips & snacks", emoji: "🍿",
    items: [
      "Doritos Nacho Cheese", "Cool Ranch Doritos", "Flamin' Hot Cheetos", "Cheetos Puffs", "Takis Fuego", "Lay's Classic", "Sour Cream & Onion Lay's", "Salt & Vinegar Chips",
      "Ruffles", "Pringles", "Funyuns", "Fritos", "Tostitos", "SunChips", "Kettle Chips", "Goldfish",
      "Cheez-Its", "Ritz Crackers", "Wheat Thins", "Triscuits", "Pretzels", "Chex Mix", "Gardetto's", "Popcorn",
      "Smartfood", "Pirate's Booty", "Veggie Straws", "Hot Fries", "Bugles", "Combos", "Munchies", "Andy Capp's Hot Fries",
      "Oreos", "Chips Ahoy!", "Nutter Butters", "Pop-Tarts", "Rice Krispies Treats", "Fruit Snacks", "Fruit by the Foot", "Gushers",
      "Little Debbie Oatmeal Pie", "Zebra Cakes", "Swiss Rolls", "Honey Buns", "Twinkies", "Ding Dongs", "Uncrustables", "Lunchables",
    ],
  },
  {
    id: "drinks", name: "Drinks", emoji: "🥤",
    items: [
      "Coca-Cola", "Diet Coke", "Coke Zero", "Pepsi", "Dr Pepper", "Sprite", "7UP", "Mountain Dew",
      "Baja Blast", "Fanta Orange", "Root Beer", "Cream Soda", "Ginger Ale", "Big Red", "Crush Grape", "Sunkist",
      "Arizona Green Tea", "Snapple", "Gatorade", "Powerade", "Prime", "Red Bull", "Monster", "Celsius",
      "Capri Sun", "Kool-Aid", "Hi-C", "SunnyD", "Lemonade", "Sweet Tea", "Iced Coffee", "Cold Brew",
      "Hot Chocolate", "Chocolate Milk", "Strawberry Milk", "Bubble Tea", "Horchata", "Mango Lassi", "Smoothie", "Milkshake",
      "Orange Juice", "Apple Juice", "Coconut Water", "LaCroix", "Sparkling Water", "Liquid Death", "Yerba Mate", "Matcha Latte",
    ],
  },
  {
    id: "desserts", name: "Desserts", emoji: "🍰",
    items: [
      "Chocolate chip cookie", "Brownie", "Cheesecake", "Tiramisu", "Apple pie", "Pumpkin pie", "Key lime pie", "Pecan pie",
      "Chocolate cake", "Red velvet cake", "Carrot cake", "Tres leches", "Funfetti cake", "Ice cream sundae", "Banana split", "Milkshake",
      "Churros", "Donuts", "Cinnamon rolls", "Crème brûlée", "Flan", "Baklava", "Kunafa", "Mochi",
      "Macarons", "Éclair", "Cannoli", "Gelato", "Frozen yogurt", "Cupcake", "Lava cake", "Bread pudding",
      "Banana pudding", "Rice pudding", "Peach cobbler", "S'mores", "Funnel cake", "Beignets", "Strawberry shortcake", "Lemon bars",
      "Fudge", "Cookie dough", "Waffle cone", "Crêpes", "Gulab jamun", "Pavlova", "Panna cotta", "Ice cream sandwich",
    ],
  },
  {
    id: "foods", name: "Comfort food", emoji: "🍕",
    items: [
      "Pizza", "Cheeseburger", "Mac and cheese", "Fried chicken", "Chicken tenders", "Wings", "Tacos", "Burritos",
      "Nachos", "Quesadilla", "Spaghetti and meatballs", "Lasagna", "Chicken alfredo", "Ramen", "Pho", "Sushi",
      "Dumplings", "Orange chicken", "Fried rice", "Pad thai", "Butter chicken", "Shawarma", "Falafel", "Gyro",
      "Mansaf", "Biryani", "Grilled cheese", "BLT", "Philly cheesesteak", "Hot dog", "Corn dog", "BBQ ribs",
      "Brisket", "Pulled pork", "Steak", "Meatloaf", "Pot roast", "Chicken pot pie", "Chicken noodle soup", "Chili",
      "Mashed potatoes", "Fries", "Loaded baked potato", "Pancakes", "Waffles", "Breakfast burrito", "Bagel and cream cheese", "Chicken and waffles",
    ],
  },
  {
    id: "games", name: "Video games", emoji: "🎮",
    items: [
      "Minecraft", "Fortnite", "Roblox", "GTA V", "Red Dead Redemption 2", "The Last of Us", "God of War", "Elden Ring",
      "Zelda: Breath of the Wild", "Zelda: Tears of the Kingdom", "Super Mario Odyssey", "Mario Kart 8", "Super Smash Bros.", "Pokémon Red & Blue", "Animal Crossing", "Stardew Valley",
      "Call of Duty: MW2", "Halo 3", "Overwatch", "Valorant", "League of Legends", "Rocket League", "FIFA", "NBA 2K",
      "Wii Sports", "Tetris", "Pac-Man", "Among Us", "Fall Guys", "Hollow Knight", "Celeste", "Portal 2",
      "Skyrim", "The Witcher 3", "Cyberpunk 2077", "Spider-Man", "Batman: Arkham City", "Uncharted 2", "Halo: Combat Evolved", "Super Mario 64",
      "Sonic the Hedgehog", "Street Fighter II", "Mortal Kombat", "Guitar Hero", "Clash Royale", "Candy Crush", "Subway Surfers", "Geometry Dash",
    ],
  },
  {
    id: "heroes", name: "Superheroes & villains", emoji: "🦸",
    items: [
      "Spider-Man", "Batman", "Superman", "Wonder Woman", "Iron Man", "Captain America", "Thor", "Hulk",
      "Black Panther", "Black Widow", "Doctor Strange", "Scarlet Witch", "Wolverine", "Deadpool", "Storm", "Captain Marvel",
      "The Flash", "Aquaman", "Green Lantern", "Cyborg", "Shazam", "Ant-Man", "Hawkeye", "Vision",
      "Star-Lord", "Groot", "Rocket", "Gamora", "Thanos", "Loki", "The Joker", "Harley Quinn",
      "Venom", "Green Goblin", "Doctor Octopus", "Magneto", "Lex Luthor", "Darkseid", "Bane", "Catwoman",
      "Ultron", "Kang", "Silver Surfer", "Moon Knight", "Miles Morales", "Ghost Rider", "Daredevil", "The Punisher",
    ],
  },
  {
    id: "cartoons", name: "Cartoons", emoji: "📺",
    items: [
      "SpongeBob SquarePants", "The Simpsons", "Family Guy", "Avatar: The Last Airbender", "Adventure Time", "Regular Show", "Gravity Falls", "Phineas and Ferb",
      "Rugrats", "Hey Arnold!", "Dexter's Laboratory", "The Powerpuff Girls", "Courage the Cowardly Dog", "Ed, Edd n Eddy", "Johnny Bravo", "Scooby-Doo",
      "Tom and Jerry", "Looney Tunes", "Teen Titans", "Teen Titans Go!", "Ben 10", "Kim Possible", "The Fairly OddParents", "Jimmy Neutron",
      "Danny Phantom", "Foster's Home", "Camp Lazlo", "Chowder", "The Amazing World of Gumball", "Steven Universe", "Bluey", "Peppa Pig",
      "Arthur", "Dora the Explorer", "Pokémon", "Dragon Ball Z", "Naruto", "Rick and Morty", "Bob's Burgers", "South Park",
      "King of the Hill", "Futurama", "Bojack Horseman", "Big Mouth", "Invincible", "Arcane", "Spider-Verse", "Kung Fu Panda",
    ],
  },
  {
    id: "sitcoms", name: "TV shows", emoji: "🛋️",
    items: [
      "The Office", "Friends", "Parks and Rec", "Brooklyn Nine-Nine", "Seinfeld", "How I Met Your Mother", "The Big Bang Theory", "Modern Family",
      "New Girl", "Community", "Arrested Development", "It's Always Sunny", "Curb Your Enthusiasm", "Abbott Elementary", "Ted Lasso", "Schitt's Creek",
      "Breaking Bad", "Better Call Saul", "Game of Thrones", "House of the Dragon", "Stranger Things", "The Sopranos", "The Wire", "Succession",
      "The Bear", "Severance", "Squid Game", "Wednesday", "The Boys", "The Mandalorian", "The Last of Us", "Euphoria",
      "Grey's Anatomy", "Suits", "Prison Break", "Lost", "Dexter", "Peaky Blinders", "Ozark", "Narcos",
      "Money Heist", "Black Mirror", "Love Island", "Survivor", "The Bachelor", "Jersey Shore", "Kitchen Nightmares", "Shark Tank",
    ],
  },
  {
    id: "animals", name: "Animals", emoji: "🦁",
    items: [
      "Lion", "Tiger", "Elephant", "Giraffe", "Gorilla", "Cheetah", "Wolf", "Grizzly bear",
      "Polar bear", "Panda", "Red panda", "Koala", "Kangaroo", "Hippo", "Rhino", "Zebra",
      "Dolphin", "Orca", "Great white shark", "Octopus", "Sea otter", "Penguin", "Bald eagle", "Owl",
      "Peregrine falcon", "Flamingo", "Parrot", "Crocodile", "Komodo dragon", "King cobra", "Honey badger", "Wolverine",
      "Capybara", "Sloth", "Raccoon", "Fox", "Golden retriever", "German shepherd", "House cat", "Horse",
      "Camel", "Goat", "Axolotl", "Platypus", "Hedgehog", "Bunny", "Hamster", "Moose",
    ],
  },
  {
    id: "cities", name: "Cities to visit", emoji: "🌍",
    items: [
      "New York", "Los Angeles", "Chicago", "Miami", "Las Vegas", "New Orleans", "San Francisco", "Austin",
      "London", "Paris", "Rome", "Barcelona", "Amsterdam", "Berlin", "Lisbon", "Prague",
      "Istanbul", "Athens", "Dubai", "Amman", "Cairo", "Marrakech", "Beirut", "Doha",
      "Tokyo", "Kyoto", "Seoul", "Bangkok", "Singapore", "Hong Kong", "Bali", "Mumbai",
      "Sydney", "Melbourne", "Auckland", "Rio de Janeiro", "Buenos Aires", "Mexico City", "Cancún", "Havana",
      "Toronto", "Vancouver", "Montreal", "Cape Town", "Reykjavík", "Copenhagen", "Vienna", "Santorini",
    ],
  },
  {
    id: "athletes", name: "Athletes", emoji: "🏆",
    items: [
      "Michael Jordan", "LeBron James", "Kobe Bryant", "Stephen Curry", "Shaquille O'Neal", "Kevin Durant", "Giannis", "Nikola Jokić",
      "Victor Wembanyama", "Caitlin Clark", "Lionel Messi", "Cristiano Ronaldo", "Neymar", "Kylian Mbappé", "Erling Haaland", "Mohamed Salah",
      "Pelé", "Diego Maradona", "Zinedine Zidane", "Ronaldinho", "Tom Brady", "Patrick Mahomes", "Peyton Manning", "Jerry Rice",
      "Travis Kelce", "Shohei Ohtani", "Babe Ruth", "Derek Jeter", "Serena Williams", "Roger Federer", "Rafael Nadal", "Novak Djokovic",
      "Usain Bolt", "Michael Phelps", "Simone Biles", "Muhammad Ali", "Mike Tyson", "Floyd Mayweather", "Conor McGregor", "Tiger Woods",
      "Wayne Gretzky", "Lewis Hamilton", "Max Verstappen", "Tony Hawk", "Shaun White", "Kelly Slater", "Wilt Chamberlain", "Magic Johnson",
    ],
  },
  {
    id: "brands", name: "Brands", emoji: "🛍️",
    items: [
      "Apple", "Google", "Amazon", "Netflix", "Spotify", "Tesla", "Nike", "Adidas",
      "Jordan", "New Balance", "Converse", "Vans", "Supreme", "Gucci", "Louis Vuitton", "Prada",
      "Chanel", "Rolex", "Lululemon", "Patagonia", "The North Face", "Uniqlo", "Zara", "H&M",
      "Target", "Walmart", "Costco", "Trader Joe's", "IKEA", "LEGO", "Nintendo", "PlayStation",
      "Xbox", "Samsung", "Sony", "Disney", "Marvel", "Coca-Cola", "Red Bull", "Starbucks",
      "Ferrari", "Lamborghini", "Porsche", "BMW", "Mercedes-Benz", "Toyota", "Jeep", "Harley-Davidson",
    ],
  },
];

// the first 16, then the 200 in more-categories.js
export const CATEGORIES = [...FIRST, ...MORE];

export const byId = (id) => CATEGORIES.find((c) => c.id === id) || null;
