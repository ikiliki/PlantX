#!/usr/bin/env bash
# CI only. Pushes this run's screenshots to the qa-assets branch and comments the summary.
# Usage: scripts/e2e-publish.sh issue            → the open "PP regression" issue
#        scripts/e2e-publish.sh pr <number>      → that pull request
# Needs GH_TOKEN, and APP_URL / RUN_URL for the header line.
set -u
target="$1"
dir="qa/e2e/$GITHUB_RUN_ID"
base="$GITHUB_SERVER_URL/$GITHUB_REPOSITORY/blob/qa-assets/$dir"

node scripts/e2e-report.mjs "test-results/assets" "$base" "$RUN_URL (download the artifact)" || exit 0

git config user.name "github-actions[bot]"
git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
git fetch -q origin qa-assets
git worktree add -q ../qa-assets origin/qa-assets
mkdir -p "../qa-assets/$dir"
cp test-results/assets/*.png "../qa-assets/$dir/" 2>/dev/null || true
(cd ../qa-assets && git add qa && git commit -qm "UI regression screenshots, run $GITHUB_RUN_ID" && git push -q origin HEAD:qa-assets) || true

{ echo "${RUN_LABEL:+**$RUN_LABEL** · }**App:** $APP_URL · **Commit:** \`${GITHUB_SHA::7}\` · [Run]($RUN_URL)"; echo; cat test-results/summary.md; } > comment.md
cat comment.md >> "$GITHUB_STEP_SUMMARY"

if [ "$target" = "pr" ]; then
  gh pr comment "$2" --body-file comment.md
  exit 0
fi
gh label create e2e --color 5319E7 --description "Automated UI regression" 2>/dev/null || true
issue=$(gh issue list --label e2e --state open --search "PP regression in:title" --json number --jq '.[0].number')
if [ -z "$issue" ]; then
  issue=$(gh issue create --title "PP regression" --label e2e --body "Results of the automated UI regression after each PP deploy." | grep -o '[0-9]*$')
fi
gh issue comment "$issue" --body-file comment.md
