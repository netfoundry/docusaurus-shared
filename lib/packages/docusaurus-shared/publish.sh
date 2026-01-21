#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

VERSION=$(node -p "require('./package.json').version")

if npm view @netfoundry/docusaurus-shared@$VERSION version 2>/dev/null; then
  echo "Error: Version $VERSION already exists on npm"
  exit 1
fi

echo "Version $VERSION is available, proceeding..."

yarn build
yarn test
yarn publish 
