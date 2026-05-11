#!/usr/bin/env node
/**
 * Wipe every node_modules folder and the root yarn.lock, then run a fresh
 * `yarn install` so the workspace resolves cleanly from scratch.
 *
 * Use this when:
 *  - A dep version mismatch is causing yarn to pull a stale npm copy instead
 *    of symlinking the local workspace (the "@netfoundry/docusaurus-theme 0.10.20
 *    leaked in" class of bug).
 *  - You upgraded a Docusaurus major/minor and need the lockfile rebuilt.
 *  - You suspect node_modules drift and want a definitive reset.
 *
 * Not meant for routine use -- a full reinstall takes ~30 seconds and rebuilds
 * native bindings.
 */

import {rm} from 'node:fs/promises';
import {existsSync, readdirSync, statSync} from 'node:fs';
import {join, resolve} from 'node:path';
import {spawn} from 'node:child_process';

const root = resolve(import.meta.dirname, '..');

const targets = [
    join(root, 'node_modules'),
    join(root, 'yarn.lock'),
    join(root, 'unified-doc', 'node_modules'),
];

const packagesDir = join(root, 'packages');
if (existsSync(packagesDir)) {
    for (const name of readdirSync(packagesDir)) {
        const p = join(packagesDir, name, 'node_modules');
        if (existsSync(p)) targets.push(p);
    }
}

console.log('Removing:');
for (const t of targets) {
    if (!existsSync(t)) continue;
    const kind = statSync(t).isDirectory() ? 'dir ' : 'file';
    console.log(`  ${kind}  ${t.slice(root.length + 1)}`);
    await rm(t, {recursive: true, force: true});
}

console.log('\nRunning `yarn install`...\n');
const child = spawn('yarn', ['install'], {cwd: root, stdio: 'inherit', shell: true});
child.on('exit', (code) => process.exit(code ?? 0));
