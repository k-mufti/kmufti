#!/usr/bin/env python3
"""Preprocess Jeopardy question data into boards.json for the browser game.

Sources (both are processed and merged, duplicates removed by air_date):
  1. JEOPARDY_CSV.csv  - 216k rows, shows 1-6300 (~1984-2012)
  2. ~/Downloads/jeopardy_dataset_seasons_1-41/combined_season1-41.tsv
                       - 530k rows, seasons 1-41 (~1984-2025), explicit DD column

A valid board requires:
  - Jeopardy! round:        exactly 6 categories × 5 clues each
  - Double Jeopardy! round: exactly 6 categories × 5 clues each
  - Final Jeopardy!:        exactly 1 clue

Output: boards.json sampled to MAX_BOARDS random valid episodes.
"""

import csv
import json
import random
import re
from collections import defaultdict
from pathlib import Path

HERE = Path(__file__).parent
CSV_PATH = HERE / "JEOPARDY_CSV.csv"
TSV_PATH = Path.home() / "Downloads/jeopardy_dataset_seasons_1-41/combined_season1-41.tsv"
OUT_PATH = HERE / "boards.json"
CATS_PATH = HERE / "categories.json"

MAX_BOARDS = 600
RANDOM_SEED = 42

STANDARD_VALUES = {
    ("Jeopardy!", "new"): [200, 400, 600, 800, 1000],
    ("Jeopardy!", "old"): [100, 200, 300, 400, 500],
    ("Double Jeopardy!", "new"): [400, 800, 1200, 1600, 2000],
    ("Double Jeopardy!", "old"): [200, 400, 600, 800, 1000],
}

HTML_TAG_RE = re.compile(r"<[^>]+>")


def parse_int(v: str) -> int:
    v = str(v).strip().replace("$", "").replace(",", "").split(".")[0]
    try:
        return int(v)
    except ValueError:
        return 0


def clean_text(t: str) -> str:
    t = HTML_TAG_RE.sub("", str(t))
    t = t.replace("\\'", "'").strip().strip("'\"")
    return re.sub(r"\s+", " ", t).strip()


def detect_scale(round_name: str, clues: list) -> str:
    max_v = max((c["value"] for c in clues), default=0)
    if round_name == "Jeopardy!":
        return "new" if max_v >= 600 else "old"
    return "new" if max_v >= 1200 else "old"


def build_category(clues: list, standard: list) -> list | None:
    """Assign 5 clues to board positions using standard values.
    DDs are identified by a pre-set _dd flag or by value mismatch."""
    if len(clues) != 5:
        return None
    slots = [None] * 5
    dd_candidates = []
    for clue in clues:
        if clue.get("_dd"):
            dd_candidates.append(clue)
            continue
        if clue["value"] in standard:
            pos = standard.index(clue["value"])
            if slots[pos] is None:
                slots[pos] = clue
                continue
        dd_candidates.append(clue)
    if len(dd_candidates) > 1:
        return None
    if dd_candidates:
        empty = [i for i, s in enumerate(slots) if s is None]
        if len(empty) != 1:
            return None
        slots[empty[0]] = {**dd_candidates[0], "_dd": True}
    if any(s is None for s in slots):
        return None
    return [
        {
            "position": i,
            "standardValue": standard[i],
            "isDailyDouble": bool(s.get("_dd")),
            "wager": standard[i],
            "question": s["question"],
            "answer": s["answer"],
        }
        for i, s in enumerate(slots)
    ]


def validate_episode(ep: dict) -> dict | None:
    rounds = ep["rounds"]
    if "Jeopardy!" not in rounds or "Double Jeopardy!" not in rounds:
        return None
    if ep["final"] is None:
        return None
    cleaned = {}
    for rname in ("Jeopardy!", "Double Jeopardy!"):
        cats = rounds[rname]
        if len(cats) != 6:
            return None
        all_clues = [c for cl in cats.values() for c in cl]
        scale = detect_scale(rname, all_clues)
        standard = STANDARD_VALUES[(rname, scale)]
        cat_list = []
        for cat_name, clues in cats.items():
            assigned = build_category(clues, standard)
            if assigned is None:
                return None
            cat_list.append({"name": cat_name, "clues": assigned})
        cleaned[rname] = {"scale": scale, "values": standard, "categories": cat_list}
    return {
        "show": ep.get("show", ep["air_date"]),
        "airDate": ep["air_date"],
        "jeopardy": cleaned["Jeopardy!"],
        "double": cleaned["Double Jeopardy!"],
        "final": ep["final"],
    }


# ── Source 1: JEOPARDY_CSV.csv ──────────────────────────────────────────────

def load_csv(path: Path) -> dict:
    """Returns episodes keyed by air_date (to allow dedup against TSV)."""
    episodes: dict = defaultdict(
        lambda: {"air_date": "", "show": "", "rounds": defaultdict(lambda: defaultdict(list)), "final": None}
    )
    if not path.exists():
        print(f"  [skip] {path} not found")
        return episodes
    with path.open(newline="", encoding="utf-8") as f:
        reader = csv.reader(f)
        header = [h.strip() for h in next(reader)]
        idx = {n: i for i, n in enumerate(header)}
        for row in reader:
            if len(row) < 7:
                continue
            show = row[idx["Show Number"]].strip()
            air = row[idx["Air Date"]].strip()
            rnd = row[idx["Round"]].strip()
            cat = row[idx["Category"]].strip()
            val = parse_int(row[idx["Value"]])
            q = clean_text(row[idx["Question"]])
            a = clean_text(row[idx["Answer"]])
            if not show or not cat or not q or not a:
                continue
            ep = episodes[air]
            ep["air_date"] = air
            ep["show"] = show
            if rnd == "Final Jeopardy!":
                ep["final"] = {"category": cat, "question": q, "answer": a}
            elif rnd in ("Jeopardy!", "Double Jeopardy!"):
                ep["rounds"][rnd][cat].append({"value": val, "question": q, "answer": a})
    return episodes


# ── Source 2: combined_season1-41.tsv ───────────────────────────────────────

ROUND_MAP = {"1": "Jeopardy!", "2": "Double Jeopardy!", "3": "Final Jeopardy!"}


def load_tsv(path: Path) -> dict:
    """Returns episodes keyed by air_date."""
    episodes: dict = defaultdict(
        lambda: {"air_date": "", "show": "", "rounds": defaultdict(lambda: defaultdict(list)), "final": None}
    )
    if not path.exists():
        print(f"  [skip] {path} not found")
        return episodes
    with path.open(newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f, delimiter="\t")
        for row in reader:
            air = row["air_date"].strip()
            rnd_raw = row["round"].strip()
            rnd = ROUND_MAP.get(rnd_raw)
            if not rnd:
                continue
            cat = row["category"].strip()
            val = parse_int(row["clue_value"])
            dd_val = parse_int(row["daily_double_value"])
            # In this dataset: "answer" = clue text, "question" = contestant response
            q = clean_text(row["answer"])   # clue
            a = clean_text(row["question"]) # answer
            if not air or not cat or not q or not a:
                continue
            ep = episodes[air]
            ep["air_date"] = air
            ep["show"] = air  # no show number in TSV
            if rnd == "Final Jeopardy!":
                ep["final"] = {"category": cat, "question": q, "answer": a}
            else:
                ep["rounds"][rnd][cat].append({
                    "value": val,
                    "question": q,
                    "answer": a,
                    "_dd": dd_val != 0,
                })
    return episodes


# ── Category index builder ────────────────────────────────────────────────────

def build_categories(merged: dict) -> list:
    """Scan ALL episodes (not just valid full boards) and collect every category
    that has exactly 5 clues. Deduplicate by name (first occurrence wins).
    Returns a sorted list of {name, clues:[{q,a,dd}×5]} dicts."""
    cat_map: dict[str, list] = {}  # upper(name) -> [5 clues]

    for ep in merged.values():
        for rnd_name, cats in ep["rounds"].items():
            all_clues = [c for cl in cats.values() for c in cl]
            scale = detect_scale(rnd_name, all_clues)
            standard = STANDARD_VALUES[(rnd_name, scale)]

            for cat_name, clues in cats.items():
                key = cat_name.upper()
                if key in cat_map:
                    continue
                assigned = build_category(clues, standard)
                if assigned is None:
                    continue
                cat_map[key] = {
                    "name": cat_name,
                    "clues": [
                        {"q": c["question"], "a": c["answer"], "dd": c["isDailyDouble"]}
                        for c in assigned
                    ],
                }

    result = sorted(cat_map.values(), key=lambda x: x["name"])
    return result


# ── Main ─────────────────────────────────────────────────────────────────────

def main() -> None:
    random.seed(RANDOM_SEED)

    print("Loading JEOPARDY_CSV.csv …")
    csv_eps = load_csv(CSV_PATH)
    print(f"  {len(csv_eps)} episodes")

    print("Loading combined_season1-41.tsv …")
    tsv_eps = load_tsv(TSV_PATH)
    print(f"  {len(tsv_eps)} episodes")

    # Merge: TSV takes priority (richer data); CSV fills in any air_dates not in TSV
    merged = dict(tsv_eps)
    added_from_csv = 0
    for air, ep in csv_eps.items():
        if air not in merged:
            merged[air] = ep
            added_from_csv += 1
    print(f"  {added_from_csv} additional episodes from CSV (not in TSV)")
    print(f"  {len(merged)} total unique episodes")

    # ── boards.json ──
    valid = []
    for ep in merged.values():
        board = validate_episode(ep)
        if board:
            valid.append(board)
    print(f"Valid full boards: {len(valid)}")

    random.shuffle(valid)
    sample = valid[:MAX_BOARDS]

    with OUT_PATH.open("w", encoding="utf-8") as f:
        json.dump(sample, f, ensure_ascii=False, separators=(",", ":"))
    size_mb = OUT_PATH.stat().st_size / (1024 * 1024)
    print(f"Wrote {len(sample)} boards → {OUT_PATH} ({size_mb:.2f} MB)")

    # ── categories.json ──
    print("Building full category index …")
    cats = build_categories(merged)
    print(f"  {len(cats)} unique categories")

    with CATS_PATH.open("w", encoding="utf-8") as f:
        json.dump(cats, f, ensure_ascii=False, separators=(",", ":"))
    size_mb = CATS_PATH.stat().st_size / (1024 * 1024)
    print(f"Wrote categories → {CATS_PATH} ({size_mb:.2f} MB)")


if __name__ == "__main__":
    main()
