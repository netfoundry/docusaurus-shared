const fs = require('fs');
const path = require('path');

const cssDir = path.resolve(__dirname, '..', 'css');
const cssFiles = fs.readdirSync(cssDir).filter((f) => f.endsWith('.css'));

function selectors(file) {
    const css = fs.readFileSync(path.join(cssDir, file), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    const out = [];
    for (const m of css.matchAll(/([^{}]+)\{/g)) {
        const prelude = m[1].trim();
        if (prelude.startsWith('@')) continue;
        for (const s of prelude.split(',')) out.push(s.trim().replace(/\s+/g, ' '));
    }
    return out;
}

describe.each(cssFiles)('%s', (file) => {
    const sels = selectors(file);

    // Markdown task lists render <input type="checkbox">; a bare input rule sizes them like text fields.
    test('no bare input selector', () => {
        expect(sels.filter((s) => /^input$/.test(s))).toEqual([]);
    });

    // .clean-btn is on every Docusaurus icon button, including the code-block copy button.
    test('no unscoped .clean-btn svg selector', () => {
        expect(sels.filter((s) => /^\.clean-btn svg$/.test(s))).toEqual([]);
    });
});
