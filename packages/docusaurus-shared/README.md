WHERE=/home/clint/git/github/netfoundry/docusaurus-shared/packages/docusaurus-shared/new-site

# 1. Create new Docusaurus site in TypeScript
rm -rf $WHERE
npx create-docusaurus@latest $WHERE classic --skip-install --typescript
cd $WHERE
# rm -rf blog docs src/pages src/components static
# sed -i '/blog/d;/docs/d;/pages/d' docusaurus.config.ts
yarn install

# 2. Add your published theme
yarn add @openclint/docusaurus-shared@latest

# 3 emit layout
mkdir -p $WHERE/src/theme/Layout && \
cat <<'EOF' > $WHERE/src/theme/Layout/index.tsx
import React, {type ReactNode} from 'react';
import { OpenZitiLayout, OpenZitiLayoutProps } from '@openclint/docusaurus-shared';

export default function LayoutWrapper(props: OpenZitiLayoutProps): ReactNode {
return (
<OpenZitiLayout starProps={{ label: "Like what you see? Give us a star on GitHub", repoUrl: 'https://github.com/openziti/ziti'}}>
{props.children}
</OpenZitiLayout>
);
}
EOF

# 4. add css import
sed -i '1i@import "@openclint/docusaurus-shared/dist/index.css";' $WHERE/src/css/custom.css

# 5. start dev
yarn start