#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   NPM_TOKEN=xxx ./scripts/publish-npm.sh
#   ./scripts/publish-npm.sh xxx
#   NPM_TOKEN=xxx NPM_OTP=123456 ./scripts/publish-npm.sh

TOKEN="${NPM_TOKEN:-${1:-}}"
REGISTRY="https://registry.npmjs.org/"
TMP_NPMRC="/tmp/orbcafe.npmrc"
PKG_NAME="$(node -p "require('./package.json').name")"
PKG_VERSION="$(node -p "require('./package.json').version")"

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

if npm_config_cache=/tmp/.npm-cache npm_config_userconfig="${TMP_NPMRC}" npm view "${PKG_NAME}@${PKG_VERSION}" version >/dev/null 2>&1; then
  echo "Error: ${PKG_NAME}@${PKG_VERSION} is already published on npm."
  echo "Bump package.json version before publishing."
  exit 1
fi

PUBLISH_ARGS=(publish --access public)
if [[ -n "${NPM_OTP:-}" ]]; then
  PUBLISH_ARGS+=(--otp "${NPM_OTP}")
fi

echo "Publishing ${PKG_NAME}@${PKG_VERSION} ..."
npm_config_cache=/tmp/.npm-cache \
npm_config_userconfig="${TMP_NPMRC}" \
npm "${PUBLISH_ARGS[@]}"
