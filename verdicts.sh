#!/usr/bin/env bash
#
# Pull down the Meccha Chameleon rounds you flagged while playing. Run on your
# Mac:
#
#     ./verdicts.sh              # records + photos, into ~/Desktop/chameleon-verdicts
#     ./verdicts.sh --no-shots   # just the records, much faster
#     ./verdicts.sh somewhere/   # into a folder of your choosing
#
# The key is NOT in this file, because this repo is public. It lives in
# ~/.kmufti-devkey, outside the repo, where git can never pick it up. The
# script tells you how to create it the first time you run it.
set -e

KEYFILE="$HOME/.kmufti-devkey"
BASE="https://kmufti.com/chameleon/api"

SHOTS=1
OUT=""
for arg in "$@"; do
  case "$arg" in
    --no-shots) SHOTS=0 ;;
    -*) echo "unknown option: $arg" >&2; exit 1 ;;
    *)  OUT="$arg" ;;
  esac
done
OUT="${OUT:-$HOME/Desktop/chameleon-verdicts}"

# ---- the key ---------------------------------------------------------------
# MC_DEV_KEY in the environment wins, so a one-off run needs no file.
KEY="${MC_DEV_KEY:-}"
if [ -z "$KEY" ] && [ -f "$KEYFILE" ]; then
  KEY=$(tr -d '[:space:]' < "$KEYFILE")
fi
if [ -z "$KEY" ]; then
  cat >&2 <<MSG
No dev key found.

Put it in a file outside the repo, once:

    echo 'your-key-here' > ~/.kmufti-devkey && chmod 600 ~/.kmufti-devkey

It is deliberately not stored in this repo, which is public on GitHub.
MSG
  exit 1
fi

# ---- fetch -----------------------------------------------------------------
mkdir -p "$OUT"
JSONL="$OUT/verdicts.jsonl"

echo "→ fetching flagged rounds…"
CODE=$(curl -s -w '%{http_code}' -H "X-MC-Dev-Key: $KEY" "$BASE/verdicts" -o "$JSONL.tmp")

case "$CODE" in
  200) mv "$JSONL.tmp" "$JSONL" ;;
  403) rm -f "$JSONL.tmp"; echo "  ✗ 403 — the key is wrong. Check ~/.kmufti-devkey" >&2; exit 1 ;;
  503) rm -f "$JSONL.tmp"; echo "  ✗ 503 — flagging is switched off on the server (no MC_DEV_KEY set)" >&2; exit 1 ;;
  404) rm -f "$JSONL.tmp"; echo "  ✗ 404 — the server is running old code. Deploy, then restart kmufti-chameleon" >&2; exit 1 ;;
  *)   rm -f "$JSONL.tmp"; echo "  ✗ HTTP $CODE" >&2; exit 1 ;;
esac

TOTAL=$(grep -c . "$JSONL" || true)
if [ "$TOTAL" -eq 0 ]; then
  echo "  nothing flagged yet — play a few rounds and press BROKEN or GOOD"
  exit 0
fi

BAD=$(grep -c '"verdict":"broken"' "$JSONL" || true)
GOOD=$(grep -c '"verdict":"good"' "$JSONL" || true)
echo "  $TOTAL round(s): $BAD broken, $GOOD good"

# ---- the photos ------------------------------------------------------------
# Each record names its own picture. They are only fetched once, so running
# this again after a few more rounds costs one download per new round.
if [ "$SHOTS" -eq 1 ]; then
  mkdir -p "$OUT/shots"
  NEW=0
  # One id per line, without needing jq installed.
  for ID in $(sed -n 's/.*"id":"\([^"]*\)".*/\1/p' "$JSONL"); do
    [ -f "$OUT/shots/$ID.jpg" ] && continue
    if curl -sf -o "$OUT/shots/$ID.jpg" "$BASE/verdicts/shots/$ID.jpg?key=$KEY"; then
      NEW=$((NEW + 1))
    else
      rm -f "$OUT/shots/$ID.jpg"
      echo "  ! no photo for $ID" >&2
    fi
  done
  echo "  $NEW new photo(s)"
fi

echo "✓ $OUT"
