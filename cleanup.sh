#!/usr/bin/env bash
# ─── apex-frontend cleanup ─────────────────────────────────
# Run from the apex-frontend/ directory:
#   bash cleanup.sh
# ────────────────────────────────────────────────────────────

set -e

cd "$(dirname "$0")"

echo "==> Removing duplicate Tailwind config (.ts version is kept)"
rm -f tailwind.config.js

echo "==> Removing default Vite/CRA boilerplate that nothing imports"
rm -f src/App.css                # only contains Vite landing-page CSS
rm -f src/assets/vite.svg        # default Vite logo, not referenced
rm -f src/assets/react.svg       # default React logo, not referenced
rm -f src/assets/favicon.png     # public/favicon.png is the one index.html uses

echo "==> Removing unreferenced public/ files"
rm -f public/favicon.svg         # index.html uses favicon.png, not the .svg
rm -f public/icons.svg           # not referenced as a sprite or asset anywhere

echo "==> Removing committed build output (regenerate with: npm run build)"
rm -rf build dist

echo "==> Removing pages for features dropped in the MongoDB migration"
rm -f src/pages/dashboard/CopyTrading.tsx
rm -f src/pages/admin/AdminCopyHistory.tsx
rm -f src/pages/admin/AdminPropertyInvestments.tsx
rm -f src/pages/admin/AdminAutoDeposit.tsx
rm -f src/pages/admin/AdminTeam.tsx

echo "==> Removing .DS_Store droppings"
find . -name '.DS_Store' -not -path './node_modules/*' -delete

echo "==> Done."
echo
echo "Optional next steps:"
echo "  - Replace README.md (currently the default Vite template) with a real project README."
echo "  - Add a .gitignore if you don't already have one (node_modules, build, dist, .env, .DS_Store)."
