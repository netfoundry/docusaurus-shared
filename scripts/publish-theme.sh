#!/usr/bin/env bash
#
# Publish @netfoundry/docusaurus-theme to npmjs.
#
# Local usage:
#   ./scripts/publish-theme.sh [--dry-run]
#
# In CI this is invoked by .github/workflows/pubshared.yml. For real
# (non-dry-run) publishes the script expects OIDC trusted-publisher auth
# to be configured on npm; locally you can either use --dry-run or have
# `npm login` already done in your shell.
#
# Exits non-zero if the version in package.json is already published.

set -euo pipefail

DRY_RUN=0
for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=1 ;;
    *) echo "unknown arg: $arg" >&2; exit 2 ;;
  esac
done

repo_root="$(cd "$(dirname "$0")/.." && pwd)"
pkg_dir="$repo_root/packages/docusaurus-theme"
cd "$repo_root"

name="$(node -p "require('./packages/docusaurus-theme/package.json').name")"
version="$(node -p "require('./packages/docusaurus-theme/package.json').version")"

echo "==> Publishing $name@$version"
echo "    repo root: $repo_root"
echo "    dry run:   $DRY_RUN"

echo "==> Checking npm registry for existing $name@$version"
# `npm view <pkg>@<ver> version` prints the version if it exists, empty if not.
# It fails (non-zero) for a not-yet-published package name -- swallow that.
existing="$(npm view "${name}@${version}" version 2>/dev/null || true)"
if [ -n "$existing" ]; then
  echo "ERROR: $name@$version is already published on npm. Bump the version in" >&2
  echo "       packages/docusaurus-theme/package.json before re-running." >&2
  exit 1
fi
echo "    not on registry -- ok to publish"

echo "==> yarn install"
yarn install --frozen-lockfile

echo "==> yarn theme:build"
yarn theme:build

echo "==> yarn test"
yarn test

echo "==> npm publish"
publish_args=(--access public --provenance)
if [ "$DRY_RUN" -eq 1 ]; then
  publish_args+=(--dry-run)
fi
( cd "$pkg_dir" && npm publish "${publish_args[@]}" )

echo "==> Done."
