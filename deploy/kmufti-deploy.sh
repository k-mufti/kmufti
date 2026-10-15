#!/usr/bin/env bash
#
# Pulls main onto the server and restarts any backend whose code changed.
# GitHub Actions runs this on every push to main (.github/workflows/deploy.yml);
# you can also run it by hand on the server.
#
# Installed at /usr/local/bin/kmufti-deploy (root-owned, outside the repo, so a
# push can't change what the deploy key is allowed to run). After editing this
# file, reinstall it:
#
#     sudo install -m 755 /var/www/kmufti-hub/deploy/kmufti-deploy.sh /usr/local/bin/kmufti-deploy
#
# It diffs against the last commit it deployed (kept in ~/.kmufti-deployed), not
# the commit before the pull, so a manual `git pull` in between doesn't hide a
# backend change from it.
set -euo pipefail

REPO=/var/www/kmufti-hub
MARK="$HOME/.kmufti-deployed"

# Folder -> the systemd service that runs its server.js
declare -A SERVICE=(
  [admin]=kmufti-admin
  [chameleon]=kmufti-chameleon
  [draw]=kmufti-draw
  [game-board]=kmufti-game-board
  [infinite-kitchen]=kmufti-kitchen
  [puzzle]=kmufti-puzzle
  [wishlist]=kmufti-wishlist
  [yahtzee]=kmufti-yahtzee
)

cd "$REPO"
git pull --ff-only -q
now=$(git rev-parse HEAD)
last=$(cat "$MARK" 2>/dev/null || echo "$now")
git cat-file -e "$last" 2>/dev/null || last=$now

echo "deployed $(git log --oneline -1)"
changed=$(git diff --name-only "$last" "$now")

# Only server code needs a restart: data files (recipes.json, puzzles.json...)
# are re-read by the backends, and static files are live as soon as they land.
failed=0
for dir in "${!SERVICE[@]}"; do
  if grep -qE "^$dir/([^/]+-)?server\.js$" <<<"$changed"; then
    svc=${SERVICE[$dir]}
    sudo systemctl restart "$svc"
    sleep 1
    if systemctl is-active -q "$svc"; then echo "restarted $svc"
    else echo "FAILED: $svc did not come back up"; failed=1; fi
  fi
done

if grep -q '^deploy/' <<<"$changed"; then
  echo "note: deploy/ changed - nginx config, unit files and this script are installed by hand (see DEPLOY.md)"
fi

echo "$now" > "$MARK"
exit $failed
