import { readFileSync, writeFileSync } from 'fs';

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url)));
writeFileSync('src/version.ts', `export const version = '${pkg.version}';\n`);
