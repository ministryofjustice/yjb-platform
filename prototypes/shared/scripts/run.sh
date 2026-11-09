#!/usr/bin/env bash
# Bundles one of the TypeScript scripts in this folder with esbuild and runs it with node.
# Usage: run.sh <capture-api-outputs|render|check-links|compare-to-app> [args...]
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
SCRIPTS_DIR="$REPO_ROOT/prototypes/shared/scripts"
BUILD_DIR="$SCRIPTS_DIR/.build"
SCRIPT="$1"
shift

cd "$REPO_ROOT"
# scripts import the frontend's own code, which depends on the built shared-types package
npm run build --silent -w packages/shared-types
if [ "$SCRIPT" = "render" ]; then
  # render needs dist/server/views and the compiled CSS
  npm run build:fe --silent
fi

"$REPO_ROOT/node_modules/.bin/esbuild" "$SCRIPTS_DIR/$SCRIPT.ts" \
  --bundle --platform=node --format=cjs --packages=external --log-level=warning \
  --outfile="$BUILD_DIR/$SCRIPT.js"

# the frontend's workspace.config resolves paths from the working directory
cd "$REPO_ROOT/apps/frontend"
REPO_ROOT="$REPO_ROOT" node "$BUILD_DIR/$SCRIPT.js" "$@"
