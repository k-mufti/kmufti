#!/usr/bin/env bash
#
# Ship kmufti.com in one command. Run this ON YOUR MAC:
#
#     cd ~/Desktop/kmufti-hub
#     ./deploy.sh "what you changed"
#
# It commits + pushes your changes. GitHub Actions then puts them on the live
# server and restarts any backend whose server.js changed
# (.github/workflows/deploy.yml) - watch it at github.com/k-mufti/kmufti/actions
#
set -e

cd "$(dirname "$0")"          # always run from the repo root

MSG="${1:-update}"           # commit message (defaults to "update")

echo "→ committing & pushing…"
git add -A
if git diff --cached --quiet; then
  echo "  (nothing new to commit)"
else
  git commit -m "$MSG"
fi
git push

echo "✓ pushed - GitHub Actions deploys it to https://kmufti.com in about a minute"
