#!/usr/bin/env bash
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Usage: $0 <site-directory>"
  exit 1
fi

WHERE=$1

if [ -e "$WHERE" ]; then
  echo "Error: '$WHERE' already exists"
  exit 1
fi

# 1. verify npm and yarn are installed
if ! command -v npm >/dev/null 2>&1; then
  echo "Error: npm is not installed. Please install Node.js and npm before proceeding."
  exit 1
fi
if ! command -v yarn >/dev/null 2>&1; then
  echo "Error: yarn is not installed. Please install Yarn before proceeding."
  exit 1
fi

# 2. create new Docusaurus site
npx create-docusaurus@latest "$WHERE" classic --skip-install --typescript

cd "$WHERE"

# 3. install dependencies
yarn install

# 4. add your published theme
yarn add @openclint/docusaurus-shared@latest

# 5. emit layout
mkdir -p src/theme/Layout && \
cat <<'EOF' > src/theme/Layout/index.tsx
import React, {type ReactNode} from 'react';
import { OpenZitiLayout, OpenZitiLayoutProps } from '@openclint/docusaurus-shared';

export default function LayoutWrapper(props: OpenZitiLayoutProps): ReactNode {
  return (
    <OpenZitiLayout starProps={{ label: "Like what you see? Give us a star on GitHub", repoUrl: 'https://github.com/openziti/ziti' }}>
      {props.children}
    </OpenZitiLayout>
  );
}
EOF

# 6. add css import
sed -i '1i@import "@openclint/docusaurus-shared/dist/index.css";' src/css/custom.css

# 7. backup and emit a basic .gitignore
cp .gitignore .gitignore.back
cat <<'EOF' >> .gitignore

# IDE files
.vscode/
.idea/
EOF

# 8. final message
echo " "
echo " --------- bootstrap complete --------- "
echo "Site created at '$WHERE'."
echo "Run 'yarn start' inside '$WHERE' to start the local dev server."
