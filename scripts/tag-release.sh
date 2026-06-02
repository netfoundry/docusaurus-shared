#!/usr/bin/env bash
#
# Tag a release for @netfoundry/docusaurus-theme.
#
# Reads the version from packages/docusaurus-theme/package.json and creates +
# pushes an annotated git tag vX.Y.Z. Intended to run right after a successful
# npm publish so each published version has a matching tag.
#
# Local usage:
#   ./scripts/tag-release.sh [--dry-run] [--remote origin]
#
# In CI this is invoked by .github/workflows/pubshared.yml after the publish
# step. The job needs `permissions: contents: write` so the checkout token can
# push the tag.
#
# Exits non-zero if the tag already exists (locally or on the remote) so we
# never silently clobber a release tag.

set -euo pipefail

DRY_RUN=0
REMOTE="origin"
while [ $# -gt 0 ]; do
  case "$1" in
    --dry-run) DRY_RUN=1 ;;
    --remote) shift; REMOTE="${1:?--remote needs a value}" ;;
    *) echo "unknown arg: $1" >&2; exit 2 ;;
  esac
  shift
done

repo_root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$repo_root"

version="$(node -p "require('./packages/docusaurus-theme/package.json').version")"
tag="v$version"

echo "==> Tagging release $tag"
echo "    remote:  $REMOTE"
echo "    dry run: $DRY_RUN"

# Refuse to clobber an existing tag (local or remote).
if git rev-parse -q --verify "refs/tags/$tag" >/dev/null; then
  echo "ERROR: tag $tag already exists locally. Bump the version before re-running." >&2
  exit 1
fi
if git ls-remote --exit-code --tags "$REMOTE" "refs/tags/$tag" >/dev/null 2>&1; then
  echo "ERROR: tag $tag already exists on $REMOTE. Bump the version before re-running." >&2
  exit 1
fi

# Annotated tags need a committer identity. Use the existing one if configured
# (local or global, e.g. on a maintainer's machine); otherwise fall back to the
# GitHub Actions bot identity for CI runs. This never overrides a real identity.
if ! git config user.name  >/dev/null 2>&1; then git config user.name  "github-actions[bot]"; fi
if ! git config user.email >/dev/null 2>&1; then git config user.email "41898282+github-actions[bot]@users.noreply.github.com"; fi

if [ "$DRY_RUN" -eq 1 ]; then
  echo "    [dry-run] would run: git tag -a $tag -m \"$tag\""
  echo "    [dry-run] would run: git push $REMOTE $tag"
  echo "==> Done (dry-run)."
  exit 0
fi

git tag -a "$tag" -m "$tag"
git push "$REMOTE" "$tag"
echo "==> Done."
