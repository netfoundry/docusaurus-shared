#!/usr/bin/env node
/**
 * Compares the newly built sitemap against the live production sitemap.
 * Any path present in production but absent from the new build is a potential
 * broken link — it should either get a redirect or the removal is intentional.
 *
 * Usage: node check-sitemap-drift.mjs <new-sitemap-path>
 *
 * Writes a JSON report to <new-sitemap-dir>/sitemap-drift.json if paths were removed.
 * Always exits 0 — never blocks the build.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const PROD_SITEMAP_URL = 'https://netfoundry.io/docs/sitemap.xml';

const newSitemapPath = process.argv[2];
if (!newSitemapPath) {
    console.error('Usage: check-sitemap-drift.mjs <new-sitemap-path>');
    process.exit(0);
}

if (!existsSync(newSitemapPath)) {
    console.warn(`[sitemap-drift] New sitemap not found at ${newSitemapPath}, skipping.`);
    process.exit(0);
}

function extractPaths(xml) {
    const paths = new Set();
    for (const match of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
        try {
            const url = new URL(match[1]);
            // Normalize: strip trailing slash except for root
            const p = url.pathname.replace(/\/$/, '') || '/';
            paths.add(p);
        } catch {
            // ignore malformed URLs
        }
    }
    return paths;
}

// Paths to ignore — removed intentionally or not real doc pages
const IGNORE_PREFIXES = [
    '/docs/openziti/blog',
    '/docs/openziti/1.x',
    '/docs/openziti/tags',
    '/docs/openziti/category',
];

function shouldIgnore(p) {
    return IGNORE_PREFIXES.some(prefix => p === prefix || p.startsWith(prefix + '/'));
}

async function main() {
    // Fetch production sitemap
    let prodXml;
    try {
        const res = await fetch(PROD_SITEMAP_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        prodXml = await res.text();
    } catch (err) {
        console.warn(`[sitemap-drift] Could not fetch production sitemap: ${err.message}. Skipping.`);
        process.exit(0);
    }

    const newXml = readFileSync(newSitemapPath, 'utf8');

    const prodPaths = extractPaths(prodXml);
    const newPaths  = extractPaths(newXml);

    const removed = [...prodPaths]
        .filter(p => !newPaths.has(p) && !shouldIgnore(p))
        .sort();

    if (removed.length === 0) {
        console.log('[sitemap-drift] No paths removed. All good.');
        process.exit(0);
    }

    console.warn(`[sitemap-drift] ⚠️  ${removed.length} path(s) removed from the new build:`);
    for (const p of removed) console.warn(`  - ${p}`);

    const report = { removed, count: removed.length };
    const reportPath = join(dirname(newSitemapPath), 'sitemap-drift.json');
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.warn(`[sitemap-drift] Report written to ${reportPath}`);

    process.exit(0);
}

main();
