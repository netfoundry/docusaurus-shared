import fs from "node:fs/promises";
import path from "node:path";

const copyFile = async (src, dst) => {
  await fs.mkdir(path.dirname(dst), { recursive: true });
  await fs.copyFile(src, dst);
};

const walk = async (dir) => {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const out = [];
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...await walk(p));
    else out.push(p);
  }
  return out;
};

await fs.mkdir("dist", { recursive: true });

// css/ is NOT copied to dist/css/. The theme's getClientModules() resolves
// '../../css/theme.css' from dist/src/index.js, which lands at the package's
// source css/ folder. This lets live edits to css/*.css flow into the dev
// server without rebuilding. Published consumers still get css/ at the
// package root via the `files` allowlist in package.json.

// copy src/**/*.css -> dist/src/**/*
try {
  const files = await walk("src");
  for (const f of files) {
    if (!f.endsWith(".css")) continue;
    await copyFile(f, path.join("dist", f));
  }
} catch {}

// copy theme/**/*.css -> dist/theme/**/*
try {
  const files = await walk("theme");
  for (const f of files) {
    if (!f.endsWith(".css")) continue;
    await copyFile(f, path.join("dist", f));
  }
} catch {}
