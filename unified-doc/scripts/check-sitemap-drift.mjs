#!/usr/bin/env node
/**
 * Pre-publish sitemap drift gate.
 *
 * Pass 1 — removed paths: compare new build vs baseline sitemap.
 *   Paths removed without a redirect stub → exit 1.
 *
 * Pass 2 — redirect quality: scan every stub in the build output.
 *   Stale (stub → removed page) and loops → exit 1.
 *   Chained (>1 hop) and shadowed (real page + stub) → warning only.
 *
 * Usage: node check-sitemap-drift.mjs <new-sitemap> <baseline-sitemap> <build-dir> [ignore-config]
 *
 *   new-sitemap:      freshly built sitemap.xml
 *   baseline-sitemap: previous build's sitemap.xml (from CI cache);
 *                     if absent, seeds from live prod on first run
 *   build-dir:        root of the build output (for stub inspection)
 *   ignore-config:    JSON file with { "prefixes": [...] };
 *                     defaults to sitemap-ignore.json next to this script
 *
 * Writes sitemap-drift.json next to new-sitemap on exit 1.
 * Exit 0 = clean. Exit 1 = gate failed.
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { dirname, join, resolve, basename } from 'path';
import { fileURLToPath } from 'url';

const PROD_SITEMAP_URL = 'https://netfoundry.io/docs/sitemap.xml';
const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));

// ---------- CLI args ----------

const [newSitemapPath, baselineSitemapPath, buildDir, ignoreConfigArg] = process.argv.slice(2);

if (!newSitemapPath || !baselineSitemapPath || !buildDir) {
    console.error('Usage: check-sitemap-drift.mjs <new-sitemap> <baseline-sitemap> <build-dir> [ignore-config]');
    process.exit(0);
}
if (!existsSync(newSitemapPath)) {
    console.warn(`[sitemap-drift] New sitemap not found at ${newSitemapPath}, skipping.`);
    process.exit(0);
}

// ---------- Ignore config ----------

const ignoreConfigPath = ignoreConfigArg ?? join(SCRIPT_DIR, 'sitemap-ignore.json');
let ignorePrefixes = [];
if (existsSync(ignoreConfigPath)) {
    try {
        ignorePrefixes = JSON.parse(readFileSync(ignoreConfigPath, 'utf8')).prefixes ?? [];
    } catch {
        console.warn(`[sitemap-drift] Could not parse ignore config at ${ignoreConfigPath}`);
    }
}

function shouldIgnore(p) {
    return ignorePrefixes.some(prefix => p === prefix || p.startsWith(prefix + '/'));
}

// ---------- Sitemap parsing ----------

function extractPaths(xml) {
    const paths = new Set();
    for (const match of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
        try {
            paths.add(new URL(match[1]).pathname.replace(/\/$/, '') || '/');
        } catch { /* ignore malformed */ }
    }
    return paths;
}

// ---------- Product grouping (for copy-paste output) ----------

const PRODUCTS = [
    { prefix: '/docs/openziti',   name: 'openziti',    repo: 'ziti-doc',                  fn: 'openzitiRedirects()'   },
    { prefix: '/docs/zrok',       name: 'zrok',         repo: 'zrok',                      fn: 'zrokRedirects()'       },
    { prefix: '/docs/selfhosted', name: 'selfhosted',  repo: 'k8s-on-prem-installations', fn: 'selfhostedRedirects()' },
    { prefix: '/docs/frontdoor',  name: 'frontdoor',   repo: 'frontdoor',                 fn: 'frontdoorRedirects()'  },
    { prefix: '/docs/zlan',       name: 'zlan',         repo: 'zlan',                      fn: 'zlanRedirects()'       },
];

function productFor(p) {
    return PRODUCTS.find(m => p === m.prefix || p.startsWith(m.prefix + '/'))
        ?? { prefix: '', name: 'unified-doc', repo: 'docusaurus-shared', fn: 'redirects' };
}

// ---------- Fuzzy target guess ----------

function fuzzyGuess(removedPath, newPaths) {
    const seg = removedPath.split('/').filter(Boolean).pop() ?? '';
    if (!seg || seg.length < 3) return [];
    const { prefix } = productFor(removedPath);
    return [...newPaths].filter(p => p.startsWith(prefix) && p.endsWith('/' + seg));
}

// ---------- Copy-paste output ----------

function printUnresolvedAsRedirects(unresolved, newPaths) {
    console.error('\n[sitemap-drift] Paste into the appropriate redirects() function:\n');
    const byProduct = new Map();
    for (const p of unresolved) {
        const prod = productFor(p);
        if (!byProduct.has(prod.name)) byProduct.set(prod.name, { prod, paths: [] });
        byProduct.get(prod.name).paths.push(p);
    }
    for (const { prod, paths } of byProduct.values()) {
        console.error(`  // ${prod.name} — ${prod.repo} → ${prod.fn}`);
        for (const p of paths) {
            const guesses = fuzzyGuess(p, newPaths);
            if (guesses.length === 1) {
                console.error(`  { from: '${p}', to: '${guesses[0]}' },   // ← guess — verify before using`);
            } else if (guesses.length > 1) {
                console.error(`  { from: '${p}', to: '/docs/TODO-fill-in' },   // ← guesses: ${guesses.join(', ')}`);
            } else {
                console.error(`  { from: '${p}', to: '/docs/TODO-fill-in' },`);
            }
        }
        console.error('');
    }
}

// ---------- Redirect stub scanning ----------

function buildRedirectMap(dir) {
    const map = new Map(); // fromPath → toPath
    const base = resolve(dir);

    function walk(current) {
        for (const entry of readdirSync(current, { withFileTypes: true })) {
            const full = join(current, entry.name);
            if (entry.isDirectory()) {
                walk(full);
            } else if (entry.name === 'index.html') {
                const html = readFileSync(full, 'utf8');
                // Match content="0; url=..." regardless of attribute order
                const m = html.match(/content="[^"]*\burl=([^";\s]+)/i);
                if (!m) continue;
                let toPath = m[1];
                try { toPath = new URL(toPath, 'https://x').pathname.replace(/\/$/, '') || '/'; } catch { /* keep */ }
                const fromPath = dirname(full).slice(base.length).replace(/\/$/, '') || '/';
                map.set(fromPath, toPath);
            }
        }
    }

    walk(base);
    return map;
}

// ---------- Redirect quality checks ----------

function validateRedirects(redirectMap, newPaths) {
    const stale    = []; // stub's final target not in sitemap
    const loops    = []; // redirect cycle
    const chained  = []; // >1 hop
    const shadowed = []; // stub path is also a live sitemap page

    for (const [fromPath, directTarget] of redirectMap) {
        if (shouldIgnore(fromPath)) continue;

        if (newPaths.has(fromPath)) {
            shadowed.push({ from: fromPath, to: directTarget });
        }

        // Walk the chain
        const visited = [fromPath];
        let cur = directTarget;
        let loopFound = false;

        while (redirectMap.has(cur)) {
            if (visited.includes(cur)) {
                loops.push({ from: fromPath, cycle: [...visited, cur] });
                loopFound = true;
                break;
            }
            visited.push(cur);
            cur = redirectMap.get(cur);
        }
        if (loopFound) continue;

        // visited = [fromPath, ...intermediateStubs], cur = final target
        const hops = visited.length; // 1 = direct, >1 = chained
        if (hops > 1) {
            chained.push({ from: fromPath, via: visited.slice(1), target: cur, hops });
        }

        // Stale: final target not in sitemap (ignore external URLs)
        if (!cur.startsWith('http') && !newPaths.has(cur)) {
            stale.push({ from: fromPath, to: directTarget, finalTarget: cur });
        }
    }

    return { stale, loops, chained, shadowed };
}

// ---------- Main ----------

async function main() {
    // Load baseline
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
            console.warn(`[sitemap-drift] Could not fetch baseline: ${err.message}. Skipping.`);
            process.exit(0);
        }
    }

    const newXml        = readFileSync(newSitemapPath, 'utf8');
    const baselinePaths = extractPaths(baselineXml);
    const newPaths      = extractPaths(newXml);

    // --- Pass 1: removed paths ---
    const removed    = [...baselinePaths].filter(p => !newPaths.has(p) && !shouldIgnore(p)).sort();
    const covered    = removed.filter(p =>  existsSync(join(buildDir, p, 'index.html')));
    const unresolved = removed.filter(p => !existsSync(join(buildDir, p, 'index.html')));

    if (covered.length > 0) {
        console.log(`[sitemap-drift] ${covered.length} removed path(s) covered by redirects:`);
        for (const p of covered) console.log(`  ✓ ${p}`);
    }

    // --- Pass 2: redirect quality ---
    console.log(`[sitemap-drift] Scanning redirect stubs...`);
    const redirectMap = buildRedirectMap(buildDir);
    const { stale, loops, chained, shadowed } = validateRedirects(redirectMap, newPaths);

    // Non-blocking warnings
    if (chained.length > 0) {
        console.warn(`\n[sitemap-drift] ⚠️  ${chained.length} chained redirect(s) (>1 hop — consider flattening):`);
        for (const { from, via, target, hops } of chained) {
            console.warn(`  ~ ${from} → ${[...via, target].join(' → ')}  (${hops} hops)`);
        }
    }
    if (shadowed.length > 0) {
        console.warn(`\n[sitemap-drift] ⚠️  ${shadowed.length} shadowed redirect(s) (dead config — real page wins):`);
        for (const { from, to } of shadowed) {
            console.warn(`  ~ ${from} → ${to}`);
        }
    }

    // Gate failures
    const failed = unresolved.length > 0 || stale.length > 0 || loops.length > 0;

    if (unresolved.length > 0) {
        console.error(`\n[sitemap-drift] ❌ ${unresolved.length} path(s) removed with no redirect:`);
        for (const p of unresolved) console.error(`  ✗ ${p}`);
        printUnresolvedAsRedirects(unresolved, newPaths);
    }

    if (stale.length > 0) {
        console.error(`\n[sitemap-drift] ❌ ${stale.length} stale redirect(s) — stub points to removed page:`);
        for (const { from, to, finalTarget } of stale) {
            const chain = to === finalTarget ? to : `${to} → ... → ${finalTarget}`;
            console.error(`  ✗ ${from} → ${chain}`);
        }
    }

    if (loops.length > 0) {
        console.error(`\n[sitemap-drift] ❌ ${loops.length} redirect loop(s):`);
        for (const { from, cycle } of loops) {
            console.error(`  ✗ ${from} → ${cycle.join(' → ')}  (cycle)`);
        }
    }

    if (!failed) {
        console.log(removed.length === 0
            ? '[sitemap-drift] No paths removed. All good.'
            : '[sitemap-drift] All removed paths have redirects. All good.');
        process.exit(0);
    }

    const report = {
        unresolved,
        covered,
        count: unresolved.length,
        redirectIssues: { stale, loops, chained, shadowed },
    };
    const reportPath = join(dirname(newSitemapPath), 'sitemap-drift.json');
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.error(`\n[sitemap-drift] Report written to ${reportPath}`);

    process.exit(1);
}

main();
