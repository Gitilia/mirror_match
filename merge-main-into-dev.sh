#!/bin/bash
# Merge main into dev to resolve conflicts before merging dev into main

set -e

echo "========================================="
echo "Merging main into dev to resolve conflicts"
echo "========================================="

cd /home/beast/Code/mirrormatch

# 1. Make sure we're on dev
echo ""
echo "Step 1: Checking out dev branch..."
git checkout dev
git pull gitea dev

# 2. Fetch latest main
echo ""
echo "Step 2: Fetching latest main..."
git fetch gitea main

# 3. Try to merge main into dev
echo ""
echo "Step 3: Merging main into dev..."
echo "This may show conflicts that need to be resolved manually."
echo ""

if git merge gitea/main --no-commit; then
  echo "✓ No conflicts! Merging..."
  git commit -m "Merge main into dev: resolve conflicts before MR"
  echo ""
  echo "✓ Merge complete! Now push dev:"
  echo "  git push gitea dev"
  echo ""
  echo "Then your MR from dev → main should work without conflicts."
else
  echo ""
  echo "⚠ Conflicts detected! You need to resolve them manually:"
  echo ""
  echo "Conflicting files:"
  git diff --name-only --diff-filter=U
  echo ""
  echo "To resolve:"
  echo "  1. Edit the conflicting files"
  echo "  2. git add <resolved-files>"
  echo "  3. git commit -m 'Merge main into dev: resolve conflicts'"
  echo "  4. git push gitea dev"
  echo ""
  echo "Then your MR from dev → main should work."
fi
