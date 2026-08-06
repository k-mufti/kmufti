/* Build the puzzle set for the translation game from Tatoeba's public exports.
 *
 *   node build_puzzles.js
 *
 * Downloads, per language, that language's sentences plus its links to English,
 * joins them into {foreign phrase, english meaning, language} triples, filters
 * hard for "good puzzle" qualities, and writes puzzles.json.
 *
 * Tatoeba data is CC-BY 2.0 FR (https://tatoeba.org) — attribution is in the UI.
 */
"use strict";

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const CACHE = "/tmp/tat";
const BASE = "https://downloads.tatoeba.org/exports/per_language";
const OUT = path.join(__dirname, "puzzles.json");
const PER_LANG = 220;

// Chosen for a spread of scripts and, deliberately, several confusable
// clusters (romance / scandinavian / slavic) so naming the language is a real
// challenge rather than a freebie.
const LANGS = [
  { code: "spa", name: "Spanish",    tier: 3 },
  { code: "por", name: "Portuguese", tier: 3 },
  { code: "ita", name: "Italian",    tier: 3 },
  { code: "fra", name: "French",     tier: 2 },
  { code: "deu", name: "German",     tier: 2 },
  { code: "nld", name: "Dutch",      tier: 3 },
  { code: "swe", name: "Swedish",    tier: 3 },
  { code: "dan", name: "Danish",     tier: 3 },
  { code: "fin", name: "Finnish",    tier: 2 },
  { code: "pol", name: "Polish",     tier: 2 },
  { code: "tur", name: "Turkish",    tier: 2 },
  { code: "vie", name: "Vietnamese", tier: 2 },
  { code: "ind", name: "Indonesian", tier: 3 },
  { code: "rus", name: "Russian",    tier: 1 },
  { code: "ukr", name: "Ukrainian",  tier: 3 },
  { code: "ell", name: "Greek",      tier: 1 },
  { code: "heb", name: "Hebrew",     tier: 1 },
  { code: "ara", name: "Arabic",     tier: 1 },
  { code: "hin", name: "Hindi",      tier: 1 },
  { code: "tha", name: "Thai",       tier: 1 },
  { code: "jpn", name: "Japanese",   tier: 1 },
  { code: "kor", name: "Korean",     tier: 1 },
  { code: "cmn", name: "Chinese",    tier: 2 },
];

// Tatoeba is saturated with sentences about these placeholder people; they make
// puzzles repetitive and give away word-alignment for free.
const NAME_RE = /\b(Tom|Mary|Maria|John|Bob|Ken|Jim|Alice|Nancy|Mike|Tony|Yumi|Taro|Sam|Sami|Layla|Dan|Bill|Fred|Emily|Jane|Betty|Ann|Paul|Tim|Kate|Lucy|Jack|Paula|Paulo|Marie|Hans|Karl|Ivan|Olga|Luke|Anna|Peter|Maya|Ali|Omar|Yuki|Ken'?ichi)\b/;

function sh(cmd, args) {
  return execFileSync(cmd, args, { maxBuffer: 1 << 30 });
}

function fetchAndUnpack(url, outPath) {
  if (fs.existsSync(outPath)) return outPath;
  const bz = outPath + ".bz2";
  process.stdout.write(`  ↓ ${path.basename(url)} … `);
  try {
    sh("curl", ["-sSf", "--max-time", "300", "-o", bz, url]);
    sh("bunzip2", ["-f", bz]);
    console.log("ok");
    return outPath;
  } catch (e) {
    console.log("FAILED");
    try { fs.unlinkSync(bz); } catch {}
    return null;
  }
}

// Good-puzzle heuristics: readable length, real sentence, no placeholder names,
// nothing that leaks the answer (digits, urls, latin text inside a non-latin
// language, etc).
function engOk(t) {
  if (!t || t.length < 14 || t.length > 58) return false;
  if (NAME_RE.test(t)) return false;
  if (/\d|https?:|@|_|\*/.test(t)) return false;
  if (!/[.!?]$/.test(t)) return false;
  if ((t.match(/[",;:()]/g) || []).length > 1) return false;
  const words = t.split(/\s+/);
  return words.length >= 3 && words.length <= 11;
}

function foreignOk(t, code) {
  if (!t || t.length < 6 || t.length > 70) return false;
  if (NAME_RE.test(t)) return false;
  if (/\d|https?:|@|_|\*/.test(t)) return false;
  // For non-latin scripts, require the text to actually be in that script —
  // catches mislabelled rows and romanised entries.
  const nonLatin = { rus: /[Ѐ-ӿ]/, ukr: /[Ѐ-ӿ]/, ell: /[Ͱ-Ͽ]/,
    heb: /[֐-׿]/, ara: /[؀-ۿ]/, hin: /[ऀ-ॿ]/,
    tha: /[฀-๿]/, jpn: /[぀-ヿ一-鿿]/,
    kor: /[가-힯]/, cmn: /[一-鿿]/ };
  if (nonLatin[code]) {
    if (!nonLatin[code].test(t)) return false;
    // Any Latin text inside a non-Latin script is almost always a proper noun
    // that also appears in the English — a free giveaway. Drop it.
    if (/[A-Za-z]/.test(t)) return false;
  }
  return true;
}

function loadSentences(file, filterFn) {
  const map = new Map();
  const data = fs.readFileSync(file, "utf8");
  let start = 0;
  while (start < data.length) {
    let end = data.indexOf("\n", start);
    if (end === -1) end = data.length;
    const line = data.slice(start, end);
    start = end + 1;
    const t1 = line.indexOf("\t");
    if (t1 === -1) continue;
    const t2 = line.indexOf("\t", t1 + 1);
    if (t2 === -1) continue;
    const id = line.slice(0, t1);
    const text = line.slice(t2 + 1).trim();
    if (filterFn(text)) map.set(id, text);
  }
  return map;
}

function main() {
  fs.mkdirSync(CACHE, { recursive: true });

  console.log("English sentences:");
  const engFile = fetchAndUnpack(`${BASE}/eng/eng_sentences.tsv.bz2`, path.join(CACHE, "eng_sentences.tsv"));
  if (!engFile) throw new Error("could not fetch English sentences");
  const eng = loadSentences(engFile, engOk);
  console.log(`  ${eng.size.toLocaleString()} usable English sentences\n`);

  const puzzles = [];
  const usedEng = new Set(); // keep each English meaning unique across the set

  for (const lang of LANGS) {
    console.log(`${lang.name} (${lang.code}):`);
    const sFile = fetchAndUnpack(`${BASE}/${lang.code}/${lang.code}_sentences.tsv.bz2`,
      path.join(CACHE, `${lang.code}_sentences.tsv`));
    const lFile = fetchAndUnpack(`${BASE}/${lang.code}/${lang.code}-eng_links.tsv.bz2`,
      path.join(CACHE, `${lang.code}-eng_links.tsv`));
    if (!sFile || !lFile) { console.log("  skipped\n"); continue; }

    const foreign = loadSentences(sFile, (t) => foreignOk(t, lang.code));
    const links = fs.readFileSync(lFile, "utf8").split("\n");

    const candidates = [];
    for (const line of links) {
      const tab = line.indexOf("\t");
      if (tab === -1) continue;
      const fid = line.slice(0, tab);
      const eid = line.slice(tab + 1).trim();
      const ftext = foreign.get(fid);
      if (!ftext) continue;
      const etext = eng.get(eid);
      if (!etext) continue;
      if (usedEng.has(etext)) continue;
      candidates.push([ftext, etext]);
    }

    // Deterministic shuffle so rebuilds are stable.
    let seed = 1337;
    const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
    for (let i = candidates.length - 1; i > 0; i--) {
      const j = (rnd() * (i + 1)) | 0;
      [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }

    let taken = 0;
    for (const [ftext, etext] of candidates) {
      if (taken >= PER_LANG) break;
      if (usedEng.has(etext)) continue;
      usedEng.add(etext);
      puzzles.push({ q: ftext, a: etext, l: lang.code });
      taken++;
    }
    console.log(`  ${foreign.size.toLocaleString()} sentences → ${taken} puzzles\n`);
  }

  const meta = LANGS.map((l) => ({ code: l.code, name: l.name, tier: l.tier }));
  fs.writeFileSync(OUT, JSON.stringify({ languages: meta, puzzles }));
  const kb = (fs.statSync(OUT).size / 1024).toFixed(0);
  console.log(`✓ ${puzzles.length} puzzles across ${meta.length} languages → puzzles.json (${kb} KB)`);
}

main();
