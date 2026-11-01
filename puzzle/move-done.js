// Moves solved puzzles from images/puzzles-queue/ to images/done-puzzles/.
//
// Run once a day by .github/workflows/puzzle-done.yml, which commits the move.
// The list of solved puzzles lives on the server, so it's fetched from the
// live site. A puzzle only moves if it was solved AFTER it was last added to
// the queue - so one dragged back from done-puzzles for a replay stays put
// until it has actually been played again.
//
//   node puzzle/move-done.js [archive-url]     (stages the moves with git mv)
"use strict";

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { scan, DONE_DIR } = require("./catalog");

const ROOT = __dirname;
const URL = process.argv[2] || "https://kmufti.com/puzzle/api/archive";
const git = (...args) => execFileSync("git", args, { cwd: ROOT, encoding: "utf8" }).trim();

(async () => {
  const res = await fetch(URL);
  if (!res.ok) throw new Error(`${URL}: ${res.status}`);
  const shelf = await res.json();
  const lastSolved = (id) => Math.max(0, ...shelf.filter((e) => e.id === id).map((e) => e.finishedAt));

  let moved = 0;
  for (const q of scan(ROOT).queue) {
    // When this file last landed in the queue folder (a commit that added it there).
    const added = Number(git("log", "-1", "--no-renames", "--diff-filter=A", "--format=%ct", "--", q.image)) * 1000;
    if (!added) continue; // not committed yet
    const solved = lastSolved(q.id);
    if (solved <= added) continue;
    const dest = path.posix.join(DONE_DIR, q.file);
    if (fs.existsSync(path.join(ROOT, dest))) git("rm", "-q", "--", dest); // an older copy from before a replay
    git("mv", "--", q.image, dest);
    console.log(`done: ${q.title} (${q.id}), solved ${new Date(solved).toISOString().slice(0, 10)}`);
    moved++;
  }
  console.log(moved ? `moved ${moved}` : "nothing to move");
})().catch((e) => { console.error(e.message); process.exit(1); });
