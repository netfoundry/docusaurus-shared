#!/usr/bin/env node
/**
 * VRT wrapper that prefixes all output for clean grep/sort.
 *
 * Usage:
 *   node scripts/vrt-run.mjs test frontdoor
 *   node scripts/vrt-run.mjs reference zlan
 *   node scripts/vrt-run.mjs test openziti --filter   # Only show [VRT] lines
 */

import { spawn } from 'child_process';
import { existsSync } from 'fs';

const [,, action, product, flag] = process.argv;

if (!action || !product) {
  console.error('[VRT] Usage: vrt-run.mjs <reference|test|approve> <product> [--filter]');
  console.error('[VRT] Products: home, openziti, frontdoor, selfhosted, zrok, zlan');
  process.exit(1);
}

const config = `backstop.${product}.json`;
if (!existsSync(config)) {
  console.error(`[VRT] ERROR Config not found: ${config}`);
  console.error(`[VRT] ERROR Run: yarn vrt:generate:${product}`);
  process.exit(1);
}

const filterOnly = flag === '--filter';

console.log(`[VRT] START ${action} ${product}`);

const proc = spawn('npx', ['backstop', action, `--config=${config}`], {
  stdio: ['inherit', 'pipe', 'pipe'],
  shell: true
});

function prefixLine(line, stream) {
  const trimmed = line.trim();
  if (!trimmed) return;

  // Already prefixed with [VRT] from onReady.js
  if (trimmed.startsWith('[VRT]')) {
    console.log(trimmed);
    return;
  }

  // Skip if filtering
  if (filterOnly) return;

  // Prefix other lines
  const prefix = stream === 'err' ? '[VRT] ERR' : '[VRT] OUT';
  console.log(`${prefix} ${trimmed}`);
}

let buffer = { out: '', err: '' };

proc.stdout.on('data', (data) => {
  buffer.out += data.toString();
  const lines = buffer.out.split('\n');
  buffer.out = lines.pop(); // Keep incomplete line in buffer
  lines.forEach(line => prefixLine(line, 'out'));
});

proc.stderr.on('data', (data) => {
  buffer.err += data.toString();
  const lines = buffer.err.split('\n');
  buffer.err = lines.pop();
  lines.forEach(line => prefixLine(line, 'err'));
});

proc.on('close', (code) => {
  // Flush remaining buffers
  if (buffer.out.trim()) prefixLine(buffer.out, 'out');
  if (buffer.err.trim()) prefixLine(buffer.err, 'err');

  const status = code === 0 ? 'PASS' : 'FAIL';
  console.log(`[VRT] ${status} ${action} ${product} (exit ${code})`);
  process.exit(code);
});
