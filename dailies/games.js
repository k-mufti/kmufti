// Every game on the All games page. Add one by adding a line, then run
// `node dailies/fetch-thumbs.js` to grab its share image.
// id: stable key (saved in people's lists, so never rename one).
// cat: one of the CATS keys below — the order here is the order of the rows.
const CATS = {
  words: "Words",
  geo: "Maps",
  logic: "Logic & Numbers",
  sports: "Sports",
  film: "Film & TV",
  music: "Music",
  history: "History",
  trivia: "Trivia",
  gaming: "Gaming",
  kmufti: "Made here",
};

const GAMES = [
  // Words
  { id: "wordle", name: "Wordle", by: "NYT", cat: "words", url: "https://www.nytimes.com/games/wordle/index.html", blurb: "Guess the five-letter word in six tries." },
  { id: "connections", name: "Connections", by: "NYT", cat: "words", url: "https://www.nytimes.com/games/connections", blurb: "Sort sixteen words into four secret groups." },
  { id: "strands", name: "Strands", by: "NYT", cat: "words", url: "https://www.nytimes.com/games/strands", blurb: "Find the themed words hiding in a letter grid." },
  { id: "spelling-bee", name: "Spelling Bee", by: "NYT", cat: "words", url: "https://www.nytimes.com/puzzles/spelling-bee", blurb: "Make words from seven letters. Always use the middle one." },
  { id: "mini", name: "The Mini", by: "NYT", cat: "words", url: "https://www.nytimes.com/crosswords/game/mini", blurb: "A five-by-five crossword. About a minute." },
  { id: "letter-boxed", name: "Letter Boxed", by: "NYT", cat: "words", url: "https://www.nytimes.com/puzzles/letter-boxed", blurb: "Chain words round the sides of a square." },
  { id: "quordle", name: "Quordle", by: "Merriam-Webster", cat: "words", url: "https://www.merriam-webster.com/games/quordle/", blurb: "Four Wordles at once, nine guesses." },
  { id: "dordle", name: "Dordle", by: "zaratustra", cat: "words", url: "https://zaratustra.itch.io/dordle", blurb: "Two Wordles at once, seven guesses." },
  { id: "octordle", name: "Octordle", by: "Britannica", cat: "words", url: "https://www.britannica.com/games/octordle/", blurb: "Eight Wordles at once. Thirteen guesses." },
  { id: "sedecordle", name: "Sedecordle", by: "sedecordle.com", cat: "words", url: "https://sedecordle.com/", blurb: "Sixteen Wordles at once, 21 guesses." },
  { id: "duotrigordle", name: "Duotrigordle", by: "duotrigordle.com", cat: "words", url: "https://duotrigordle.com/", blurb: "Thirty-two Wordles at once. Good luck." },
  { id: "waffle", name: "Waffle", by: "wafflegame.net", cat: "words", url: "https://wafflegame.net/daily", blurb: "Swap letters until all six words line up." },
  { id: "squareword", name: "Squareword", by: "squareword.org", cat: "words", url: "https://squareword.org/", blurb: "Fill a five-by-five grid of words, Wordle-style." },
  { id: "phrazle", name: "Phrazle", by: "Solitaired", cat: "words", url: "https://solitaired.com/phrazle", blurb: "Guess the everyday phrase in six tries." },
  { id: "phoodle", name: "Phoodle", by: "phoodle.net", cat: "words", url: "https://www.phoodle.net/", blurb: "A Wordle where every answer is food." },
  { id: "contexto", name: "Contexto", by: "contexto.me", cat: "words", url: "https://contexto.me/", blurb: "Find the secret word by how close in meaning your guesses are." },
  { id: "semantle", name: "Semantle", by: "semantle.com", cat: "words", url: "https://semantle.com/", blurb: "Like Contexto, but you get a similarity score." },
  { id: "squaredle", name: "Squaredle", by: "squaredle.app", cat: "words", url: "https://squaredle.app/", blurb: "Find every word in a little letter grid." },
  { id: "minute-cryptic", name: "Minute Cryptic", by: "minutecryptic.com", cat: "words", url: "https://www.minutecryptic.com/", blurb: "One tiny cryptic crossword clue a day." },
  { id: "bracket-city", name: "Bracket City", by: "The Atlantic", cat: "words", url: "https://www.theatlantic.com/games/bracket-city/", blurb: "Solve clues nested inside clues, inside out." },
  { id: "keyword", name: "Keyword", by: "Washington Post", cat: "words", url: "https://www.washingtonpost.com/games/keyword/", blurb: "One word that fills the gap in six others." },
  { id: "typeshift", name: "Typeshift", by: "Puzzmo", cat: "words", url: "https://www.puzzmo.com/play/typeshift", blurb: "Slide columns of letters to spell words." },
  { id: "spelltower", name: "Spelltower", by: "Puzzmo", cat: "words", url: "https://www.puzzmo.com/play/spelltower", blurb: "Spell words to clear a tower of letters." },
  { id: "weaver", name: "Weaver", by: "wordwormdormdork", cat: "words", url: "https://wordwormdormdork.com/", blurb: "Change one letter at a time to get from word to word." },
  { id: "crossclimb", name: "Crossclimb", by: "LinkedIn", cat: "words", url: "https://www.linkedin.com/games/crossclimb/", blurb: "A word ladder built from trivia clues." },
  { id: "pinpoint", name: "Pinpoint", by: "LinkedIn", cat: "words", url: "https://www.linkedin.com/games/pinpoint/", blurb: "Guess the category from as few words as you can." },
  { id: "redactle", name: "Redactle", by: "redactle.net", cat: "words", url: "https://redactle.net/", blurb: "Uncover a hidden Wikipedia article one word at a time." },

  // Maps
  { id: "worldle", name: "Worldle", by: "teuteuf", cat: "geo", url: "https://worldle.teuteuf.fr/", blurb: "Name the country from its outline." },
  { id: "globle", name: "Globle", by: "globle-game.com", cat: "geo", url: "https://globle-game.com/", blurb: "Find the mystery country. Hotter colours mean closer." },
  { id: "globle-capitals", name: "Globle: Capitals", by: "globle-capitals.com", cat: "geo", url: "https://globle-capitals.com/", blurb: "Globle, but for capital cities." },
  { id: "travle", name: "Travle", by: "travle.earth", cat: "geo", url: "https://travle.earth/", blurb: "Connect two countries through the ones in between." },
  { id: "flagle", name: "Flagle", by: "flagle.io", cat: "geo", url: "https://www.flagle.io/", blurb: "Reveal a flag piece by piece." },
  { id: "tradle", name: "Tradle", by: "OEC", cat: "geo", url: "https://oec.world/en/games/tradle", blurb: "Guess the country from what it exports." },
  { id: "countryle", name: "Countryle", by: "countryle.com", cat: "geo", url: "https://countryle.com/", blurb: "Guess the country from its continent, population and climate." },
  { id: "statele", name: "Statele", by: "teuteuf", cat: "geo", url: "https://statele.teuteuf.fr/", blurb: "Name the US state from its outline." },
  { id: "maptap", name: "MapTap", by: "maptap.gg", cat: "geo", url: "https://maptap.gg/", blurb: "Tap where each place is on the map." },
  { id: "geogrid", name: "GeoGrid", by: "geogridgame.com", cat: "geo", url: "https://www.geogridgame.com/", blurb: "Fill a grid with countries that fit each row and column." },
  { id: "foodguessr", name: "FoodGuessr", by: "foodguessr.com", cat: "geo", url: "https://www.foodguessr.com/", blurb: "Guess where in the world each dish comes from." },
  { id: "geoguessr-daily", name: "GeoGuessr Daily", by: "GeoGuessr", cat: "geo", url: "https://www.geoguessr.com/daily-challenges", blurb: "Dropped somewhere on Street View. Where are you? Needs an account." },
  { id: "gerrymandle", name: "Gerrymandle", by: "gerrymandle.com", cat: "geo", url: "https://gerrymandle.com/", blurb: "Draw the district lines to swing the election." },

  // Logic & Numbers
  { id: "queens", name: "Queens", by: "LinkedIn", cat: "logic", url: "https://www.linkedin.com/games/queens/", blurb: "One crown per row, column and colour." },
  { id: "tango", name: "Tango", by: "LinkedIn", cat: "logic", url: "https://www.linkedin.com/games/tango/", blurb: "Fill the grid with suns and moons." },
  { id: "zip", name: "Zip", by: "LinkedIn", cat: "logic", url: "https://www.linkedin.com/games/zip/", blurb: "Draw one path through every cell, in number order." },
  { id: "patches", name: "Patches", by: "LinkedIn", cat: "logic", url: "https://www.linkedin.com/games/patches/", blurb: "Split the grid into patches of the right size." },
  { id: "mini-sudoku", name: "Mini Sudoku", by: "LinkedIn", cat: "logic", url: "https://www.linkedin.com/games/mini-sudoku/", blurb: "A quick six-by-six sudoku." },
  { id: "nyt-sudoku", name: "Sudoku", by: "NYT", cat: "logic", url: "https://www.nytimes.com/puzzles/sudoku", blurb: "The classic, in easy, medium and hard." },
  { id: "pips", name: "Pips", by: "NYT", cat: "logic", url: "https://www.nytimes.com/games/pips", blurb: "Place dominoes to meet every condition." },
  { id: "tiles", name: "Tiles", by: "NYT", cat: "logic", url: "https://www.nytimes.com/puzzles/tiles", blurb: "A calm pattern-matching puzzle." },
  { id: "murdle", name: "Murdle", by: "G. T. Karber", cat: "logic", url: "https://murdle.com/", blurb: "Solve a tiny murder mystery with logic." },
  { id: "nerdle", name: "Nerdle", by: "nerdlegame.com", cat: "logic", url: "https://www.nerdlegame.com/", blurb: "Wordle, but it's an equation." },
  { id: "mathler", name: "Mathler", by: "mathler.com", cat: "logic", url: "https://www.mathler.com/", blurb: "Find the equation that makes the number." },
  { id: "primel", name: "Primel", by: "converged.yt", cat: "logic", url: "https://converged.yt/primel/", blurb: "Wordle with five-digit prime numbers." },
  { id: "hexcodle", name: "Hexcodle", by: "hexcodle.com", cat: "logic", url: "https://hexcodle.com/", blurb: "Guess the hex code of today's colour." },
  { id: "colorfle", name: "Colorfle", by: "colorfle.com", cat: "logic", url: "https://colorfle.com/", blurb: "Mix colours to match the target." },
  { id: "dialed", name: "Dialed", by: "dialed.gg", cat: "logic", url: "https://dialed.gg/", blurb: "See a colour for a moment, then recreate it from memory." },
  { id: "echo-chess", name: "Echo Chess", by: "echochess.com", cat: "logic", url: "https://echochess.com/", blurb: "Your piece turns into whatever it captures. Clear the board." },
  { id: "chesscom-daily", name: "Daily Chess Puzzle", by: "Chess.com", cat: "logic", url: "https://www.chess.com/daily-chess-puzzle", blurb: "One chess puzzle a day." },
  { id: "lichess-daily", name: "Lichess Puzzle", by: "Lichess", cat: "logic", url: "https://lichess.org/training/daily", blurb: "The Lichess puzzle of the day." },

  // Sports
  { id: "connections-sports", name: "Connections: Sports", by: "The Athletic", cat: "sports", url: "https://www.nytimes.com/athletic/connections-sports-edition/", blurb: "Connections, but every group is sports." },
  { id: "immaculate-grid", name: "Immaculate Grid", by: "Sports Reference", cat: "sports", url: "https://www.sports-reference.com/immaculate-grid/", blurb: "Name baseball players who fit each row and column." },
  { id: "immaculate-football", name: "Immaculate Grid: Football", by: "Sports Reference", cat: "sports", url: "https://www.sports-reference.com/immaculate-grid/football", blurb: "The grid, for NFL players." },
  { id: "immaculate-basketball", name: "Immaculate Grid: Basketball", by: "Sports Reference", cat: "sports", url: "https://www.sports-reference.com/immaculate-grid/basketball/", blurb: "The grid, for basketball players." },
  { id: "poeltl", name: "Poeltl", by: "dunk.zone", cat: "sports", url: "https://poeltl.dunk.zone/", blurb: "Guess the NBA player from team, height and more." },
  { id: "weddle", name: "Weddle", by: "weddlegame.com", cat: "sports", url: "https://www.weddlegame.com/", blurb: "Wordle for NFL players." },
  { id: "who-are-ya", name: "Who Are Ya?", by: "playfootball.games", cat: "sports", url: "https://playfootball.games/who-are-ya/", blurb: "Guess the footballer from their club, nation and age." },

  // Film & TV
  { id: "framed", name: "Framed", by: "framed.wtf", cat: "film", url: "https://framed.wtf/", blurb: "Name the movie from six stills." },
  { id: "actorle", name: "Actorle", by: "actorle.com", cat: "film", url: "https://actorle.com/", blurb: "Guess the actor from their filmography." },
  { id: "emovi", name: "Emovi", by: "teuteuf", cat: "film", url: "https://emovi.teuteuf.fr/", blurb: "Guess the movie from emojis." },
  { id: "boxoffice", name: "Box Office Game", by: "boxofficega.me", cat: "film", url: "https://boxofficega.me/", blurb: "Guess how much each film made at the box office." },

  // Music
  { id: "bandle", name: "Bandle", by: "bandle.app", cat: "music", url: "https://bandle.app/", blurb: "Name the song as the band adds one instrument at a time." },
  { id: "songless", name: "Songless", by: "lessgames.com", cat: "music", url: "https://lessgames.com/songless", blurb: "Name the song from the shortest clip you can." },
  { id: "spotle", name: "Spotle", by: "spotle.io", cat: "music", url: "https://spotle.io/", blurb: "Guess the artist from their Spotify stats." },
  { id: "heardle80s", name: "Heardle 80s", by: "heardle80s.com", cat: "music", url: "https://heardle80s.com/", blurb: "Name the 80s hit from its intro." },
  { id: "guess-the-audio", name: "GuessTheAudio", by: "guesstheaudio.com", cat: "music", url: "https://guesstheaudio.com/", blurb: "Name the track from a short clip." },

  // History
  { id: "timeguessr", name: "TimeGuessr", by: "timeguessr.com", cat: "history", url: "https://timeguessr.com/", blurb: "Where and when was this photo taken?" },
  { id: "whentaken", name: "WhenTaken", by: "whentaken.com", cat: "history", url: "https://whentaken.com/", blurb: "Guess the place and year of each photo." },
  { id: "chronophoto", name: "Chronophoto", by: "chronophoto.app", cat: "history", url: "https://www.chronophoto.app/", blurb: "Guess the year a photo was taken." },
  { id: "chronofive", name: "ChronoFive", by: "chronofive.com", cat: "history", url: "https://chronofive.com/", blurb: "A daily history puzzle." },

  // Trivia
  { id: "costcodle", name: "Costcodle", by: "costcodle.com", cat: "trivia", url: "https://costcodle.com/", blurb: "Guess the price of a Costco item." },
  { id: "metazooa", name: "Metazooa", by: "metazooa.com", cat: "trivia", url: "https://metazooa.com/", blurb: "Find the mystery animal through the tree of life." },
  { id: "metaflora", name: "Metaflora", by: "metazooa.com", cat: "trivia", url: "https://flora.metazooa.com/", blurb: "Metazooa, but for plants." },
  { id: "catfishing", name: "Catfishing", by: "catfishing.net", cat: "trivia", url: "https://catfishing.net/", blurb: "Guess the Wikipedia article from its categories." },
  { id: "thrice", name: "Thrice", by: "Geeks Who Drink", cat: "trivia", url: "https://thrice.geekswhodrink.com/", blurb: "Trivia where every answer comes with three clues." },
  { id: "artle", name: "Artle", by: "National Gallery of Art", cat: "trivia", url: "https://www.nga.gov/artle.html", blurb: "Name the artist from four of their works." },

  // Gaming
  { id: "guess-the-game", name: "GuessThe.Game", by: "guessthe.game", cat: "gaming", url: "https://guessthe.game/", blurb: "Name the video game from screenshots." },
  { id: "gamedle", name: "Gamedle", by: "gamedle.wtf", cat: "gaming", url: "https://www.gamedle.wtf/", blurb: "A daily video game guessing quiz." },
  { id: "pokedoku", name: "PokeDoku", by: "pokedoku.com", cat: "gaming", url: "https://pokedoku.com/", blurb: "Fill the grid with Pokémon that fit each clue." },
  { id: "squirdle", name: "Squirdle", by: "fireblend", cat: "gaming", url: "https://squirdle.fireblend.com/", blurb: "Guess the Pokémon from its stats." },
  { id: "loldle", name: "LoLdle", by: "loldle.net", cat: "gaming", url: "https://loldle.net/", blurb: "Guess the League of Legends champion." },

  // Made here
  { id: "chameleon", name: "Meccha Chameleon", by: "kmufti.com", cat: "kmufti", url: "../chameleon/", blurb: "A blank figure is hiding in today's photo. Find it fast." },
  { id: "real-or-fake", name: "Real or Fake", by: "kmufti.com", cat: "kmufti", url: "../real-or-fake/", blurb: "Ten headlines. Some happened, some are satire or AI." },
];

// What "Add the popular ones" puts on an empty list.
const STARTER = ["wordle", "connections", "strands", "mini", "worldle", "chameleon"];
