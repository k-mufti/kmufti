// 21 Questions' rules, shared by the server (which runs the rounds) and the
// page (which explains them). An ES module, so both load the same file.
//
// One player is the answerer and types any secret. Everyone else takes
// turns asking yes/no questions - or guessing, which uses up a question
// too. Guess it within 21 and you win the round; if nobody does, the
// answerer stumped you all. Then the next player is the answerer.

export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 10;
export const QUESTIONS = 21;

export const SECRET_SECS = 90;     // the answerer, to type a secret
export const ASK_SECS = 60;        // an asker, to ask or guess (then the turn passes)
export const ANSWER_SECS = 45;     // the answerer, to answer (then it's "not sure")

export const POINTS = {
  guess: 2,                        // the asker who guesses it
  stump: 3,                        // the answerer, if nobody does in 21
};

// What the answerer can say. A guess gets right or wrong instead.
export const ANSWERS = ["yes", "no", "sometimes", "unsure"];
export const LABEL = { yes: "Yes", no: "No", sometimes: "Sometimes", unsure: "Not sure", right: "Right!", wrong: "Wrong" };

// A guess that matches the secret (case, spaces, punctuation, "a/an/the"
// and a plural "s" don't count) is right without the answerer saying so.
export function norm(s) {
  return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/^(a|an|the)\s+/, "").replace(/[^a-z0-9]/g, "").replace(/^(.{3,}?)(es|s)$/, "$1");
}
export const sameThing = (guess, secret) => !!norm(guess) && norm(guess) === norm(secret);
