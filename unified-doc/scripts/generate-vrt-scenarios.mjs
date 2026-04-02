#!/usr/bin/env node
/**
 * Generates BackstopJS scenarios from the production sitemap.
 *
 * Usage:
 *   node scripts/generate-vrt-scenarios.mjs [product]
 *
 * Products: openziti, frontdoor, selfhosted, zrok, zlan, home, all
 *
 * Examples:
 *   node scripts/generate-vrt-scenarios.mjs openziti   # Only OpenZiti pages
 *   node scripts/generate-vrt-scenarios.mjs all        # All products
 */

import { writeFileSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = join(__dirname, '..');

const SITEMAP_URL = 'https://netfoundry.io/docs/sitemap.xml';
const PRODUCTION_BASE = 'https://netfoundry.io/docs';
const LOCAL_BASE = 'http://localhost:3000/docs';

// Product definitions with URL patterns
const PRODUCTS = {
  home: {
    label: 'Home Portal',
    pattern: /^https:\/\/netfoundry\.io\/docs\/?$/,
    include: (url) => url === 'https://netfoundry.io/docs/' || url === 'https://netfoundry.io/docs'
  },
  openziti: {
    label: 'OpenZiti',
    pattern: /\/openziti\//,
    include: (url) => url.includes('/openziti/')
  },
  frontdoor: {
    label: 'Frontdoor',
    pattern: /\/frontdoor\//,
    include: (url) => url.includes('/frontdoor/')
  },
  selfhosted: {
    label: 'Self-Hosted',
    pattern: /\/selfhosted\//,
    include: (url) => url.includes('/selfhosted/')
  },
  zrok: {
    label: 'zrok',
    pattern: /\/zrok\//,
    include: (url) => url.includes('/zrok/')
  },
  zlan: {
    label: 'zLAN',
    pattern: /\/zlan\//,
    include: (url) => url.includes('/zlan/')
  }
};

// URLs to exclude
const EXCLUDE_PATTERNS = [
  /\/blog\//,              // Blog posts
  /\/blog$/,               // Blog index
  /\/zrok\/\d+\.\d+/,      // zrok versioned docs (e.g., /zrok/0.4/, /zrok/1.0/)
  /\/tags\//,              // Tag pages
  /\/page\/\d+/,           // Pagination pages
  /\/search/,              // Search page
];

function shouldExclude(url) {
  return EXCLUDE_PATTERNS.some(pattern => pattern.test(url));
}

async function fetchSitemap() {
  console.log(`Fetching sitemap from ${SITEMAP_URL}...`);
  const response = await fetch(SITEMAP_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch sitemap: ${response.status}`);
  }
  return response.text();
}

function parseUrls(sitemapXml) {
  // Simple regex extraction - works for standard sitemaps
  const urlRegex = /<loc>([^<]+)<\/loc>/g;
  const urls = [];
  let match;
  while ((match = urlRegex.exec(sitemapXml)) !== null) {
    urls.push(match[1]);
  }
  return urls;
}

function categorizeUrls(urls) {
  const categorized = {
    home: [],
    openziti: [],
    frontdoor: [],
    selfhosted: [],
    zrok: [],
    zlan: [],
    other: []
  };

  for (const url of urls) {
    if (shouldExclude(url)) continue;

    let matched = false;
    for (const [product, config] of Object.entries(PRODUCTS)) {
      if (config.include(url)) {
        categorized[product].push(url);
        matched = true;
        break;
      }
    }
    if (!matched) {
      categorized.other.push(url);
    }
  }

  return categorized;
}

function urlToScenario(url) {
  // Convert production URL to local URL
  const localUrl = url.replace(PRODUCTION_BASE, LOCAL_BASE);

  // Create a compact label from the URL path: zlan->guides->firewall_configuration
  const path = url.replace(PRODUCTION_BASE, '').replace(/^\//, '') || 'home';
  const label = path.split('/').join('->') || 'home';

  return {
    label,
    url: localUrl,
    referenceUrl: url,
    delay: 500,
    misMatchThreshold: 0.5,
    requireSameDimensions: false
  };
}

function generateBackstopConfig(scenarios, product, { desktopOnly = false } = {}) {
  const viewports = desktopOnly
    ? [{ label: 'desktop', width: 1920, height: 1080 }]
    : [
        { label: 'desktop', width: 1920, height: 1080 },
        { label: 'tablet', width: 768, height: 1024 },
        { label: 'mobile', width: 375, height: 812 }
      ];

  return {
    id: `netfoundry-docs-${product}`,
    viewports,
    onBeforeScript: 'puppet/onBefore.js',
    onReadyScript: 'puppet/onReady.js',
    scenarios,
    paths: {
      bitmaps_reference: `backstop_data/bitmaps_reference_${product}`,
      bitmaps_test: `backstop_data/bitmaps_test_${product}`,
      engine_scripts: 'backstop_data/engine_scripts',
      html_report: `backstop_data/html_report_${product}`,
      ci_report: `backstop_data/ci_report_${product}`
    },
    report: ['CI'],
    engine: 'playwright',
    engineOptions: {
      browser: 'chromium',
      args: ['--no-sandbox']
    },
    asyncCaptureLimit: 20,
    asyncCompareLimit: 50,
    debug: false,
    debugWindow: false,
    scenarioLogsInReports: false,
    resembleOutputOptions: {
      errorColor: { red: 255, green: 0, blue: 255 },
      errorType: 'movement',
      transparency: 0.3,
      ignoreAntialiasing: true
    }
  };
}

async function main() {
  const args = process.argv.slice(2);
  const product = args.find(a => !a.startsWith('--')) || 'all';

  // --filter=openziti,nf,frontdoor  — keep only URLs whose path contains one of these substrings
  const filterArg = args.find(a => a.startsWith('--filter='));
  const urlFilters = filterArg
    ? filterArg.replace('--filter=', '').split(',').map(s => s.trim()).filter(Boolean)
    : [];

  const desktopOnly = args.includes('--desktop-only');

  if (urlFilters.length > 0) {
    console.log(`URL filters active: ${urlFilters.join(', ')}`);
  }

  function applyUrlFilters(urls) {
    if (urlFilters.length === 0) return urls;
    return urls.filter(url => urlFilters.some(f => url.includes(f)));
  }

  if (product !== 'all' && !PRODUCTS[product]) {
    console.error(`Unknown product: ${product}`);
    console.error(`Available: ${Object.keys(PRODUCTS).join(', ')}, all`);
    process.exit(1);
  }

  try {
    const sitemapXml = await fetchSitemap();
    const allUrls = parseUrls(sitemapXml);
    console.log(`Found ${allUrls.length} total URLs in sitemap`);

    const categorized = categorizeUrls(allUrls);

    // Print summary
    console.log('\nURL counts by product (after filtering):');
    for (const [prod, urls] of Object.entries(categorized)) {
      if (urls.length > 0) {
        console.log(`  ${prod}: ${urls.length} pages`);
      }
    }

    if (product === 'all') {
      // Generate separate config files for each product
      for (const [prod, urls] of Object.entries(categorized)) {
        if (urls.length === 0 || prod === 'other') continue;

        const filtered = applyUrlFilters(urls);
        if (filtered.length === 0) {
          console.log(`\nSkipping ${prod} — no URLs match filter`);
          continue;
        }

        const scenarios = filtered.map(urlToScenario);
        const config = generateBackstopConfig(scenarios, prod, { desktopOnly });
        const outputPath = join(ROOT_DIR, `backstop.${prod}.json`);
        writeFileSync(outputPath, JSON.stringify(config, null, 2));
        console.log(`\nGenerated ${outputPath} with ${scenarios.length} scenarios`);
      }
    } else {
      // Generate config for single product
      const urls = applyUrlFilters(categorized[product] || []);
      if (urls.length === 0) {
        console.error(`No URLs found for product: ${product}${urlFilters.length ? ` (with filter: ${urlFilters.join(', ')})` : ''}`);
        process.exit(1);
      }

      const scenarios = urls.map(urlToScenario);
      const config = generateBackstopConfig(scenarios, product);
      const outputPath = join(ROOT_DIR, `backstop.${product}.json`);
      writeFileSync(outputPath, JSON.stringify(config, null, 2));
      console.log(`\nGenerated ${outputPath} with ${scenarios.length} scenarios`);
    }

    console.log('\nDone! Run tests with:');
    if (product === 'all') {
      console.log('  yarn vrt:reference:openziti && yarn vrt:test:openziti');
      console.log('  yarn vrt:reference:frontdoor && yarn vrt:test:frontdoor');
      console.log('  etc.');
    } else {
      console.log(`  yarn vrt:reference:${product}`);
      console.log(`  yarn vrt:test:${product}`);
    }

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
