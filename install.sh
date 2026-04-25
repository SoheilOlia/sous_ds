#!/usr/bin/env bash
#
# sous-ds · one-line installer
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/SoheilOlia/sous_ds/main/install.sh | bash
#
# Options (env vars):
#   SOUS_DS_VERSION     release tag to install (default: v0.5.0)
#   SOUS_DS_REPO        repo slug (default: SoheilOlia/sous_ds)
#   SOUS_DS_DEST        target dir (default: .)
#   SOUS_DS_INCLUDE_CI  copy .github/workflows/design.yml when set to 1
#
# Refuses to clobber an existing contract.

set -euo pipefail

VERSION="${SOUS_DS_VERSION:-v0.5.0}"
REPO="${SOUS_DS_REPO:-SoheilOlia/sous_ds}"
DEST="${SOUS_DS_DEST:-.}"
INCLUDE_CI="${SOUS_DS_INCLUDE_CI:-0}"

BOLD=$(printf '\033[1m')
DIM=$(printf '\033[2m')
RESET=$(printf '\033[0m')
GREEN=$(printf '\033[32m')
RED=$(printf '\033[31m')

echo
echo "  ${BOLD}sous-ds${RESET} · scaffold"
echo "  ────────────────────"
echo "  ${DIM}version${RESET}  $VERSION"
echo "  ${DIM}repo${RESET}     $REPO"
echo "  ${DIM}dest${RESET}     $DEST"
echo

for cmd in curl tar; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "  ${RED}✗${RESET} $cmd is required but not installed"
    exit 1
  fi
done

mkdir -p "$DEST"
cd "$DEST"

CONFLICTS=()
for f in DESIGN.md AGENTS.md ANIMATION_RULES.md SKILL.md tokens.css design-tokens.json; do
  [ -e "$f" ] && CONFLICTS+=("$f")
done
if [ ${#CONFLICTS[@]} -gt 0 ]; then
  echo "  ${RED}✗${RESET} Files already exist:"
  for c in "${CONFLICTS[@]}"; do
    echo "     · $c"
  done
  echo
  echo "  Remove them first or install into a subdirectory:"
  echo "     SOUS_DS_DEST=./design-system bash install.sh"
  exit 1
fi

TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

TAR_URL="https://github.com/$REPO/archive/refs/tags/$VERSION.tar.gz"
echo "  ${DIM}→${RESET} downloading $TAR_URL"
curl -fsSL "$TAR_URL" | tar -xz -C "$TMP"

ROOT=$(find "$TMP" -maxdepth 1 -type d \( -name "sous_ds-*" -o -name "sous-ds-*" \) | head -1)
if [ -z "$ROOT" ]; then
  echo "  ${RED}✗${RESET} could not find extracted tarball root"
  exit 1
fi

echo "  ${DIM}→${RESET} installing contract files"
for f in \
  DESIGN.md AGENTS.md ANIMATION_RULES.md SKILL.md \
  TASTE_LOG.md CHANGELOG.md CONTRIBUTING.md INSTALL.md \
  quality-evaluator.md refusals.json README.md LICENSE \
  design-tokens.json tokens.css preview.html
do
  if [ -f "$ROOT/$f" ]; then
    cp "$ROOT/$f" .
    echo "     ${GREEN}+${RESET} $f"
  fi
done

for d in components scripts examples; do
  if [ -d "$ROOT/$d" ]; then
    mkdir -p "$d"
    cp -R "$ROOT/$d/." "$d/"
    echo "     ${GREEN}+${RESET} $d/"
  fi
done

if [ "$INCLUDE_CI" = "1" ] && [ -f "$ROOT/.github/workflows/design.yml" ]; then
  mkdir -p .github/workflows
  cp "$ROOT/.github/workflows/design.yml" .github/workflows/design.yml
  echo "     ${GREEN}+${RESET} .github/workflows/design.yml"
fi

echo
echo "  ${GREEN}✓${RESET} sous-ds installed into $DEST"
echo
echo "  ${BOLD}Next:${RESET}"
echo "    1. Read DESIGN.md and AGENTS.md"
echo "    2. Reference tokens.css from your app root"
echo "    3. ${DIM}npx @google/design.md lint DESIGN.md${RESET}"
echo "    4. ${DIM}node scripts/lint.mjs components/ preview.html${RESET}"
echo "    5. ${DIM}npm run pack:check${RESET}"
echo
