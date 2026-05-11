#!/usr/bin/env node
/**
 * Generates static/llms.txt — served at https://netfoundry.io/docs/llms.txt
 *
 * Walks source markdown from each product's docs directory, extracts frontmatter
 * and headings, and writes a structured index for AI agents.
 *
 * Runs after all remotes are cloned (build-docs.sh calls this before yarn build).
 */

import { readFileSync, readdirSync, statSync, writeFileSync, existsSync } from 'fs';
import { join, relative, extname, basename, dirname } from 'path';
import { fileURLToPath } from 'url';
// @netfoundry/docusaurus-theme's dist uses bare specifiers (no .js extensions) that raw
// Node ESM can't resolve. Import the compiled products module directly as a workaround.
import { PRODUCTS as THEME_PRODUCTS } from '../node_modules/@netfoundry/docusaurus-theme/dist/src/products.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const unifiedDocDir = join(__dirname, '..');
const BASE_URL = 'https://netfoundry.io/docs';

// Maps theme product id → URL slug and docs source directory.
// slug differs from id only for 'console', which is served at /docs/platform/.
const DOCS_DIRS = {
    openziti:   { slug: 'openziti',   dir: '_remotes/openziti/docusaurus/docs'   },
    selfhosted: { slug: 'selfhosted', dir: '_remotes/selfhosted/docusaurus/docs' },
    console:    { slug: 'platform',   dir: '_remotes/platform/docusaurus/docs'   },
    frontdoor:  { slug: 'frontdoor',  dir: '_remotes/frontdoor/docusaurus/docs'  },
    zrok:       { slug: 'zrok',       dir: '_remotes/zrok/website/docs'          },
    zlan:       { slug: 'zlan',       dir: '_remotes/zlan/docusaurus/docs'       },
};

const PRODUCTS = [
    ...Object.entries(DOCS_DIRS).map(([id, { slug, dir }]) => {
        const p = THEME_PRODUCTS[id];
        return { slug, name: p.label, description: p.description, docsDir: join(unifiedDocDir, dir) };
    }),
    // data-connector is not yet in the theme registry; add it manually for now.
    {
        slug: 'dataconnector',
        name: 'NetFoundry Data Connector',
        description: 'Streams events from an OpenZiti controller and fans them out to multiple configurable output destinations.',
        docsDir: join(unifiedDocDir, '_remotes/data-connector/docusaurus/docs'),
    },
];

function parseFrontmatter(content) {
    const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!match) return {};
    const fm = match[1];
    const result = {};
    const titleMatch = fm.match(/^title:\s*['"]?(.*?)['"]?\s*$/m);
    if (titleMatch) result.title = titleMatch[1].trim();
    const descMatch = fm.match(/^description:\s*['"]?(.*?)['"]?\s*$/m);
    if (descMatch) result.description = descMatch[1].trim();
    const slugMatch = fm.match(/^slug:\s*['"]?(.*?)['"]?\s*$/m);
    if (slugMatch) result.slug = slugMatch[1].trim();
    return result;
}

function extractH1(content) {
    const body = content.replace(/^---[\s\S]*?---\r?\n/, '');
    const match = body.match(/^#\s+(.+)$/m);
    return match ? match[1].trim() : null;
}

function fileToUrlPath(relPath) {
    let p = relPath.replace(/\\/g, '/').replace(/\.(md|mdx)$/, '');
    if (p === 'index' || p.endsWith('/index')) {
        p = p === 'index' ? '' : p.slice(0, -'/index'.length);
    }
    return p;
}

function collectEntries(docsDir, productSlug) {
    const entries = [];

    function walk(dir) {
        let items;
        try {
            items = readdirSync(dir);
        } catch {
            return;
        }
        for (const item of items.sort()) {
            const fullPath = join(dir, item);
            const stat = statSync(fullPath);
            if (stat.isDirectory()) {
                walk(fullPath);
                continue;
            }
            const ext = extname(item);
            if (ext !== '.md' && ext !== '.mdx') continue;
            if (basename(item).startsWith('_')) continue;

            const content = readFileSync(fullPath, 'utf8');
            const fm = parseFrontmatter(content);
            const title = fm.title || extractH1(content);
            if (!title) continue;

            const relPath = relative(docsDir, fullPath);
            let urlPath;
            if (fm.slug) {
                urlPath = fm.slug === '/' ? '' : fm.slug.replace(/^\//, '');
            } else {
                urlPath = fileToUrlPath(relPath);
            }

            const url = urlPath
                ? `${BASE_URL}/${productSlug}/${urlPath}`
                : `${BASE_URL}/${productSlug}`;

            entries.push({ title, description: fm.description || null, url });
        }
    }

    walk(docsDir);
    return entries;
}

function formatEntry({ title, description, url }) {
    return description
        ? `- [${title}](${url}): ${description}`
        : `- [${title}](${url})`;
}

console.log('Generating static/llms.txt...');

const sections = [];

for (const product of PRODUCTS) {
    if (!existsSync(product.docsDir)) {
        console.warn(`  WARN: docs dir not found for ${product.name}, skipping`);
        continue;
    }
    const entries = collectEntries(product.docsDir, product.slug);
    if (entries.length === 0) {
        console.warn(`  WARN: no entries found for ${product.name}`);
        continue;
    }
    sections.push({ product, entries });
    console.log(`  ${product.name}: ${entries.length} pages`);
}

const productList = sections.map(({ product }) => product.name).join(', ');

const lines = [
    '# NetFoundry Documentation',
    '',
    '> Documentation for NetFoundry products and the OpenZiti open-source zero trust networking framework.',
    '',
    `This index covers ${productList}. All URLs resolve under https://netfoundry.io/docs.`,
    '',
];

for (const { product, entries } of sections) {
    lines.push(`## ${product.name}`);
    lines.push('');
    lines.push(product.description);
    lines.push('');
    for (const entry of entries) {
        lines.push(formatEntry(entry));
    }
    lines.push('');
}

const output = lines.join('\n');
const outPath = process.argv[2] ?? join(unifiedDocDir, 'static/llms.txt');
writeFileSync(outPath, output, 'utf8');
console.log(`✅ Wrote static/llms.txt (${output.split('\n').length} lines, ${(output.length / 1024).toFixed(1)} KB)`);
