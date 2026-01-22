const fs = require('fs');
const path = require('path');
const pkg = require('../package.json');

function collectPaths(exportsObj) {
    const files = [];
    const subpaths = [];
    for (const [subpath, target] of Object.entries(exportsObj)) {
        subpaths.push(subpath);
        if (typeof target === 'string') {
            if (!target.includes('*')) files.push(target);
        } else if (typeof target === 'object') {
            for (const val of Object.values(target)) {
                if (!val.includes('*')) files.push(val);
            }
        }
    }
    return { files, subpaths };
}

const { files: requiredFiles, subpaths: requiredSubpaths } = collectPaths(pkg.exports);

describe('package.json exports are valid', () => {
    test.each(requiredFiles)('%s exists', (relPath) => {
        const fullPath = path.resolve(__dirname, '..', relPath);
        expect(fs.existsSync(fullPath)).toBe(true);
    });

    test.each(requiredSubpaths)('%s is a valid export path', (subpath) => {
        if (subpath.includes('*')) return; // skip wildcards
        expect(subpath).toMatch(/^\./);    // should start with .
    });
});
