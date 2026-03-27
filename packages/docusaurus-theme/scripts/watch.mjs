/**
 * Unified watch script for local theme development.
 *
 * `tsc --watch` only recompiles TypeScript — it ignores CSS files entirely.
 * This script fills that gap by running both watchers together so a single
 * `yarn watch` command covers all file types:
 *
 *   - Spawns `tsc --watch` for TypeScript/TSX compilation into dist/
 *   - Watches src/, css/, and theme/ for .css changes and copies them into
 *     dist/ immediately, mirroring what `yarn build:css` does at build time
 *
 * Because the test-site resolves @netfoundry/docusaurus-theme via a yarn link
 * symlink directly to this package directory, any file written to dist/ is
 * instantly visible to the Docusaurus dev server — no reinstall needed.
 */
import fs from 'node:fs/promises';
import { watch } from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

// ── CSS copy (same logic as build-css.mjs) ───────────────────────────────────

const copyFile = async (src, dst) => {
  await fs.mkdir(path.dirname(dst), { recursive: true });
  await fs.copyFile(src, dst);
};

const walk = async (dir) => {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const out = [];
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else out.push(p);
  }
  return out;
};

const copyAllCss = async () => {
  for (const root of ['css', 'src', 'theme']) {
    try {
      const files = await walk(root);
      for (const f of files) {
        if (!f.endsWith('.css')) continue;
        await copyFile(f, path.join('dist', f));
      }
    } catch {}
  }
};

// ── Initial CSS copy ─────────────────────────────────────────────────────────

await copyAllCss();
console.log('[watch] CSS copied to dist/');

// ── Watch CSS files ──────────────────────────────────────────────────────────

let debounce = null;

for (const dir of ['css', 'src', 'theme']) {
  try {
    watch(dir, { recursive: true }, (_, filename) => {
      if (!filename?.endsWith('.css')) return;
      clearTimeout(debounce);
      debounce = setTimeout(async () => {
        await copyAllCss();
        console.log(`[watch] CSS updated (${filename})`);
      }, 100);
    });
  } catch {}
}

// ── Spawn tsc --watch ────────────────────────────────────────────────────────

const tsc = spawn('yarn', ['tsc', '--watch', '--preserveWatchOutput'], {
  stdio: 'inherit',
  shell: true,
});

tsc.on('exit', (code) => process.exit(code ?? 0));
