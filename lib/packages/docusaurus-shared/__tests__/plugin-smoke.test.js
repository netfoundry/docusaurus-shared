const fs = require('fs');
const path = require('path');

const requiredFiles = [
    // plugin entrypoints
    'dist/plugins.cjs',
    'dist/plugins.esm.js',
    'dist/plugins.d.ts',
    'dist/docusaurus-plugins/remarkScopedPath.d.ts',

    // node entrypoints
    'dist/node.cjs',
    'dist/node.esm.js',
    'dist/node.d.ts',

    // ui entrypoints
    'dist/ui.cjs',
    'dist/ui.esm.js',
    'dist/ui.d.ts',
];

describe('Build output smoke test', () => {
    test.each(requiredFiles)('%s exists', (relPath) => {
        const fullPath = path.resolve(__dirname, '..', relPath);
        expect(fs.existsSync(fullPath)).toBe(true);
    });
});
