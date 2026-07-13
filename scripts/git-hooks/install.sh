#!/usr/bin/env bash
# One-time installer for the local pre-commit gitleaks hook.
# Run once per clone: bash scripts/git-hooks/install.sh
#
# Respects `core.hooksPath` if you've set one (local or global) — some setups
# point git at a hooks dir outside `.git/hooks/` (e.g. a machine-wide
# `~/.git-hooks/`), and installing to `.git/hooks/` in that case would be a
# silent no-op. If an existing hook is already at that path, this chains to
# it so nothing already relying on it breaks.
set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

HOOKS_DIR="$(git config --get core.hooksPath || true)"
if [ -z "$HOOKS_DIR" ]; then
  HOOKS_DIR=".git/hooks"
elif [[ "$HOOKS_DIR" != /* ]]; then
  HOOKS_DIR="$REPO_ROOT/$HOOKS_DIR"
fi
mkdir -p "$HOOKS_DIR"

TARGET="$HOOKS_DIR/pre-commit"
if [ -f "$TARGET" ] && ! grep -q "gitleaks" "$TARGET" 2>/dev/null; then
  echo "⚠️  Existing pre-commit hook found at $TARGET that isn't ours — chaining instead of overwriting."
  CHAINED="$HOOKS_DIR/pre-commit.d-gitleaks"
  cp scripts/git-hooks/pre-commit "$CHAINED"
  chmod +x "$CHAINED"
  if ! grep -q "pre-commit.d-gitleaks" "$TARGET" 2>/dev/null; then
    printf '\n# Added by levkinops ansible repo (scripts/git-hooks/install.sh)\n"%s"\n' "$CHAINED" >> "$TARGET"
  fi
else
  cp scripts/git-hooks/pre-commit "$TARGET"
  chmod +x "$TARGET"
fi

echo "✓ Installed pre-commit gitleaks hook → $TARGET"
if [ "$HOOKS_DIR" != ".git/hooks" ] && [ "$HOOKS_DIR" != "$REPO_ROOT/.git/hooks" ]; then
  echo "  (using core.hooksPath=$HOOKS_DIR — applies to every repo that shares this hooksPath)"
fi
if ! command -v gitleaks >/dev/null 2>&1; then
  echo "  Note: gitleaks isn't installed locally yet. Install it for the hook to actually run:"
  echo "    macOS:  brew install gitleaks"
  echo "    Linux:  see https://github.com/gitleaks/gitleaks#installing"
  echo "  Until then this hook is a no-op locally (CI still scans every push)."
fi
