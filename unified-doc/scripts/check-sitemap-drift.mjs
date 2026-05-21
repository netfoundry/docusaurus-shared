#!/usr/bin/env node
/**
 * Pre-publish sitemap drift gate.
 *
 * Compares the newly built sitemap against the baseline from the previous build.
 * For each path removed from the new build, checks whether a redirect stub exists
 * in the build output (`plugin-client-redirects` writes `<path>/index.html` stubs).
 * Unresolved removals (path gone, no stub) cause a hard exit 1, aborting the publish
 * before any files reach the server.
 *
 * Usage: node check-sitemap-drift.mjs <new-sitemap> <baseline-sitemap> <build-dir>
 *
 * - new-sitemap:      path to the freshly built sitemap.xml
 * - baseline-sitemap: path to the previous build's sitemap.xml (from CI cache);
 *                     if absent, seeds from live prod on first run
 * - build-dir:        root of the build output (for redirect stub checks)
 *
 * Writes sitemap-drift.json next to new-sitemap on exit 1 for the alert step.
 * Exit 0 = clean. Exit 1 = unresolved removals found.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';

const PROD_SITEMAP_URL = 'https://netfoundry.io/docs/sitemap.xml';

const [newSitemapPath, baselineSitemapPath, buildDir] = process.argv.slice(2);

if (!newSitemapPath || !baselineSitemapPath || !buildDir) {
    console.error('Usage: check-sitemap-drift.mjs <new-sitemap> <baseline-sitemap> <build-dir>');
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
            const p = url.pathname.replace(/\/$/, '') || '/';
            paths.add(p);
        } catch {
            // ignore malformed URLs
        }
    }
    return paths;
}

// Paths removed intentionally — not real doc pages, expected churn
const IGNORE_PREFIXES = [
    '/docs/openziti/blog',
    '/docs/openziti/1.x',
    '/docs/openziti/tags',
    '/docs/openziti/category',
];

function shouldIgnore(p) {
    return IGNORE_PREFIXES.some(prefix => p === prefix || p.startsWith(prefix + '/'));
}

function hasRedirectStub(p) {
    // plugin-client-redirects writes <build-dir>/<path>/index.html for each redirect
    return existsSync(join(buildDir, p, 'index.html'));
}

async function main() {
    let baselineXml;

    if (existsSync(baselineSitemapPath)) {
        console.log(`[sitemap-drift] Using cached baseline: ${baselineSitemapPath}`);
        baselineXml = readFileSync(baselineSitemapPath, 'utf8');
    } else {
        console.log(`[sitemap-drift] No cached baseline — seeding from ${PROD_SITEMAP_URL}`);
        try {
            const res = await fetch(PROD_SITEMAP_URL);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            baselineXml = await res.text();
        } catch (err) {
            console.warn(`[sitemap-drift] Could not fetch baseline: ${err.message}. Skipping check.`);
            process.exit(0);
        }
    }

    const newXml      = readFileSync(newSitemapPath, 'utf8');
    const baselinePaths = extractPaths(baselineXml);
    const newPaths      = extractPaths(newXml);

    const removed = [...baselinePaths]
        .filter(p => !newPaths.has(p) && !shouldIgnore(p))
        .sort();

    if (removed.length === 0) {
        console.log('[sitemap-drift] No paths removed. All good.');
        process.exit(0);
    }

    const covered    = removed.filter(p =>  hasRedirectStub(p));
    const unresolved = removed.filter(p => !hasRedirectStub(p));

    if (covered.length > 0) {
        console.log(`[sitemap-drift] ${covered.length} removed path(s) covered by redirects:`);
        for (const p of covered) console.log(`  ✓ ${p}`);
    }

    if (unresolved.length === 0) {
        console.log('[sitemap-drift] All removed paths have redirects. All good.');
        process.exit(0);
    }

    console.error(`[sitemap-drift] ❌ ${unresolved.length} path(s) removed with no redirect:`);
    for (const p of unresolved) console.error(`  ✗ ${p}`);
    console.error('[sitemap-drift] Add redirects for the above paths, then rebuild.');

    const report = { unresolved, covered, count: unresolved.length };
    const reportPath = join(dirname(newSitemapPath), 'sitemap-drift.json');
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.error(`[sitemap-drift] Report written to ${reportPath}`);

    process.exit(1);
}

main();
