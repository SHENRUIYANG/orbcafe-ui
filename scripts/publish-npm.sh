#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   NPM_TOKEN=xxx ./scripts/publish-npm.sh
#   ./scripts/publish-npm.sh xxx

TOKEN="${NPM_TOKEN:-${1:-}}"
REGISTRY="https://registry.npmjs.org/"
TMP_NPMRC="/tmp/orbcafe.npmrc"

if [[ -z "${TOKEN}" ]]; then
  echo "Error: missing NPM token."
  echo "Usage: NPM_TOKEN=xxx ./scripts/publish-npm.sh"
  echo "   or: ./scripts/publish-npm.sh xxx"
  exit 1
fi

cleanup() {
  rm -f "${TMP_NPMRC}"
}
trap cleanup EXIT

cat > "${TMP_NPMRC}" <<EOF
registry=${REGISTRY}
//registry.npmjs.org/:_authToken=${TOKEN}
always-auth=true
EOF

npm_config_cache=/tmp/.npm-cache \
npm_config_userconfig="${TMP_NPMRC}" \
npm whoami

npm_config_cache=/tmp/.npm-cache \
npm_config_userconfig="${TMP_NPMRC}" \
npm publish --access public
