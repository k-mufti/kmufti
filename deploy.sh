#!/usr/bin/env bash
#
# Ship kmufti.com in one command. Run this ON YOUR MAC:
#
#     cd ~/Desktop/kmufti-hub
#     ./deploy.sh "what you changed"
#
# It commits + pushes your changes, then pulls them onto the live server.
# No passwords (SSH key), no sudo (you own the repo on the server).
#
# NOTE: if you changed wishlist/server.js (the backend), also run once:
#     ssh ubuntu@15.204.244.251 "sudo systemctl restart kmufti-wishlist"
#
set -e

VPS="ubuntu@15.204.244.251"
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

echo "→ pulling on the server…"
ssh "$VPS" "cd /var/www/kmufti-hub && git pull"

echo "✓ live at https://kmufti.com"
