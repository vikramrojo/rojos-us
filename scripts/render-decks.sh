#!/usr/bin/env bash
# Rasterise the pitch decks in public/pitch/*.pdf to WebP slides.
#
# Output is committed, not built. The decks change rarely, and keeping this out
# of the build means CI needs neither poppler nor a headless canvas — it just
# serves files already in the repo. Re-run when a deck changes.
#
# Requires: poppler (pdftocairo) and libwebp (cwebp).
#   brew install poppler webp
set -euo pipefail
cd "$(dirname "$0")/.."

WIDTH=${WIDTH:-1600}
QUALITY=${QUALITY:-80}

for bin in pdftocairo cwebp; do
  command -v "$bin" >/dev/null || { echo "missing $bin — brew install poppler webp"; exit 1; }
done

total=0
for pdf in public/pitch/*.pdf; do
  slug=$(basename "$pdf" .pdf)
  out="public/pitch/$slug"
  rm -rf "$out"; mkdir -p "$out"

  tmp=$(mktemp -d)
  pdftocairo -png -scale-to-x "$WIDTH" -scale-to-y -1 "$pdf" "$tmp/p"

  n=0
  for png in "$tmp"/p-*.png; do
    n=$((n + 1))
    printf -v idx "%02d" "$n"
    cwebp -quiet -q "$QUALITY" -m 6 "$png" -o "$out/$idx.webp"
  done
  rm -rf "$tmp"

  kb=$(du -sk "$out" | cut -f1)
  total=$((total + kb))
  printf "  %-38s %2d slides %6d KB   (pdf %5d KB)\n" \
    "$slug" "$n" "$kb" "$(( $(wc -c < "$pdf") / 1024 ))"
done
printf "  %-38s %10d KB total\n" "" "$total"
