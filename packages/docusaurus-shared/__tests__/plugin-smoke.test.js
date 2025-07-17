const fs = require('fs');
const path = require('path');

const requiredFiles = [
  'dist/index.js',
  'dist/index.js.map',
  'dist/plugins/remarkScopedPath/remarkScopedPath.js',
  'dist/plugins/remarkScopedPath/remarkScopedPath.d.ts',
];


describe('Build output smoke test', () => {
  test.each(requiredFiles)('%s exists', (relPath) => {
    const fullPath = path.resolve(__dirname, '..', relPath);
    expect(fs.existsSync(fullPath)).toBe(true);
  });
});
