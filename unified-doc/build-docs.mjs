#!/usr/bin/env node
// =============================================================================
// build-docs.mjs — Build the unified NetFoundry documentation site.
//
// This is the SINGLE source of truth for the unified-doc build orchestration.
// build-docs.sh and build-docs.ps1 are thin platform shims that call this file;
// do not reimplement build logic in them.
//
// Clones (or updates) all product doc repos into _remotes/, runs lint checks,
// builds SDK reference docs via ziti-doc's gendoc script, then runs a Docusaurus
// production build.
//
// USAGE
//   node build-docs.mjs [OPTIONS]
//
// OPTIONS
//   --ziti-doc-branch=BRANCH        Branch for openziti/ziti-doc                     (default: main)
//   --zrok-branch=BRANCH            Branch for openziti/zrok                          (default: main)
//   --frontdoor-branch=BRANCH       Branch for netfoundry/zrok-connector             (default: develop)
//   --selfhosted-branch=BRANCH      Branch for netfoundry/k8s-on-prem-installations  (default: main)
//   --zlan-branch=BRANCH            Branch for netfoundry/zlan                        (default: main)
//   --platform-branch=BRANCH        Branch for netfoundry/platform-doc               (default: main)
//   --data-connector-branch=BRANCH  Branch for netfoundry/nf-data-connector          (default: main)
//   --customer-connect-branch=BRANCH Branch for netfoundry/customer-connect-docs     (default: main)
//   --clean                         Wipe _remotes and .docusaurus cache before building
//   --lint-only                     Run lint checks only; skip build
//   --qualifier=VALUE               Append VALUE to output dir (e.g. --qualifier=-preview -> build-preview)
//   -l                              (gendoc) Skip linked doc generation (doxygen/wget)
//   -g                              (gendoc) Skip git clones inside gendoc
//   -c                              (gendoc) Skip clean steps inside gendoc
//   -h, --help                      Show this help and exit
//
// ENVIRONMENT VARIABLES
//   GH_ZITI_CI_REPO_ACCESS_PAT   GitHub PAT for ziti-doc and zlan (falls back to SSH)
//   BB_REPO_TOKEN_FRONTDOOR      Bitbucket token for zrok-connector (falls back to SSH)
//   BB_REPO_TOKEN_ONPREM         Bitbucket token for k8s-on-prem-installations (falls back to SSH)
//   BB_REPO_TOKEN_PLATFORM_DOC       Bitbucket token for platform-doc (falls back to SSH)
//   BB_REPO_TOKEN_DATA_CONNECTOR     Bitbucket token for nf-data-connector (falls back to SSH)
//   BB_REPO_TOKEN_CUSTOMER_CONNECT   Bitbucket token for customer-connect-docs (falls back to SSH)
//   BB_USERNAME                  Bitbucket username (default: x-token-auth)
//   DOCUSAURUS_BUILD_MASK        Hex bitmask: 0x1=openziti 0x2=frontdoor 0x4=selfhosted
//                                             0x8=zrok 0x10=zlan 0x20=platform
//                                             0x40=data-connector 0x80=llm-gateway 0x100=mcp-gateway
//                                             0x200=customer-connect 0x3FF=all (config default: 0x3FF)
//   DOCUSAURUS_PUBLISH_ENV       Set to 'prod' to use production Algolia index
//   NO_MINIFY                    Set to any value to pass --no-minify to Docusaurus
//   IS_VERCEL                    Set to 'true' on Vercel preview deployments
//
// EXAMPLES
//   node build-docs.mjs --ziti-doc-branch=my.branch.name
//   DOCUSAURUS_BUILD_MASK=0x1 node build-docs.mjs --ziti-doc-branch=my.branch.name
//   node build-docs.mjs --clean --lint-only
//   node build-docs.mjs --qualifier=-preview -l
// =============================================================================

import { spawnSync } from "node:child_process";
import {
  existsSync, readdirSync, rmSync, mkdirSync, cpSync, writeFileSync,
} from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const isWin = process.platform === "win32";
const GIT = "git";
const YARN = isWin ? "yarn.cmd" : "yarn";
const VALE = "vale";
const MDLINT = isWin ? "markdownlint.cmd" : "markdownlint";

// On Windows, markdownlint runs through cmd.exe (~8191-char command-line cap),
// so lint files in small batches there; larger batches elsewhere.
const LINT_BATCH = isWin ? 50 : 200;

const scriptDir = dirname(fileURLToPath(import.meta.url));
const remotesDir = join(scriptDir, "_remotes");

// =============================================================================
// SMALL PROCESS / FS HELPERS
// =============================================================================

// Node on Windows refuses to spawnSync a .cmd/.bat without a shell (EINVAL, since
// the CVE-2024-27980 fix). Route those through cmd.exe and quote args ourselves —
// shell:true does NOT quote array args for us. Non-.cmd/.exe commands and every
// platform other than Windows go straight through.
function spawnCompat(cmd, args, opts = {}) {
  if (isWin && /\.(cmd|bat)$/i.test(cmd)) {
    const quoted = args.map((a) =>
      /[\s"&|<>^()%!]/.test(a) ? `"${a.replace(/"/g, '""')}"` : a,
    );
    return spawnSync(cmd, quoted, { ...opts, shell: true });
  }
  return spawnSync(cmd, args, opts);
}

// Run a command, stream its output, and abort the whole build on failure
// (mirrors `set -euo pipefail`).
function run(cmd, args, opts = {}) {
  const r = spawnCompat(cmd, args, { stdio: "inherit", env: process.env, ...opts });
  if (r.error) {
    console.error(`ERROR: failed to run '${cmd}': ${r.error.message}`);
    process.exit(1);
  }
  if (r.status !== 0) {
    console.error(`ERROR: '${cmd}' exited with code ${r.status}`);
    process.exit(r.status ?? 1);
  }
  return r;
}

// Run a command and capture stdout/stderr without aborting.
function capture(cmd, args, opts = {}) {
  return spawnCompat(cmd, args, {
    encoding: "utf8", env: process.env, maxBuffer: 64 * 1024 * 1024, ...opts,
  });
}

// Is a command available on PATH?
function has(cmd) {
  const r = spawnCompat(cmd, ["--version"], { stdio: "ignore" });
  return !r.error && r.status === 0;
}

function chunk(arr, n) {
  const out = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

// =============================================================================
// ARGUMENT PARSING (mirror of build-docs.sh)
// =============================================================================

const USAGE = `Usage: node build-docs.mjs [OPTIONS] — see header of build-docs.mjs for full docs.`;

const branches = {
  zitiDoc        : "main",
  zrok           : "main",
  frontdoor      : "develop",
  selfhosted     : "main",
  zlan           : "main",
  platform       : "main",
  dataConnector  : "main",
  customerConnect: "add-docs",
};
const BRANCH_FLAG = {
  "--ziti-doc-branch": "zitiDoc",
  "--zrok-branch": "zrok",
  "--frontdoor-branch": "frontdoor",
  "--selfhosted-branch": "selfhosted",
  "--zlan-branch": "zlan",
  "--platform-branch": "platform",
  "--data-connector-branch": "dataConnector",
  "--customer-connect-branch": "customerConnect",
};

let clean = false;
let lintOnly = false;
let qualifier = "";
const otherFlags = []; // forwarded verbatim to gendoc (-l/-g/-c/...)

const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];

  const need = (flag) => {
    const v = argv[++i];
    if (v === undefined) {
      console.error(`Error: ${flag} requires a value`);
      process.exit(1);
    }
    return v;
  };

  let handled = false;
  for (const [flag, key] of Object.entries(BRANCH_FLAG)) {
    if (a === flag) { branches[key] = need(flag); handled = true; break; }
    if (a.startsWith(`${flag}=`)) { branches[key] = a.slice(flag.length + 1); handled = true; break; }
  }
  if (handled) continue;

  if (a === "--clean") { clean = true; continue; }
  if (a === "--lint-only") { lintOnly = true; continue; }
  if (a === "-h" || a === "--help") { console.log(USAGE); process.exit(0); }
  if (a === "--qualifier") { qualifier = need("--qualifier"); continue; }
  if (a.startsWith("--qualifier=")) { qualifier = a.slice("--qualifier=".length); continue; }
  if (a.startsWith("-")) { otherFlags.push(a); continue; } // gendoc passthrough
  // non-dash extra args are ignored, matching build-docs.sh
}

// =============================================================================
// BUILD CONFIGURATION BANNER
// =============================================================================

const line = "========================================";
console.log(line);
console.log("BUILD CONFIGURATION");
console.log(line);
console.log(`  BRANCH_ZITI_DOC='${branches.zitiDoc}'`);
console.log(`  BRANCH_ZROK='${branches.zrok}'`);
console.log(`  BRANCH_FRONTDOOR='${branches.frontdoor}'`);
console.log(`  BRANCH_SELFHOSTED='${branches.selfhosted}'`);
console.log(`  BRANCH_ZLAN='${branches.zlan}'`);
console.log(`  BRANCH_PLATFORM='${branches.platform}'`);
console.log(`  BRANCH_DATA_CONNECTOR='${branches.dataConnector}'`);
console.log(`  BRANCH_CUSTOMER_CONNECT='${branches.customerConnect}'`);
console.log(`  CLEAN=${clean ? 1 : 0}`);
console.log(`  IS_VERCEL='${process.env.IS_VERCEL ?? ""}'`);
console.log(`  node: ${process.version}`);
console.log(`  yarn: ${capture(YARN, ["--version"]).stdout?.trim() || "not found"}`);
console.log(line);

// =============================================================================
// clone_or_update
// =============================================================================

// Rewrite a public https URL into an authenticated one when the matching token
// env var is set; otherwise fall back to SSH. Mirrors the case block in .sh.
function authUrl(url) {
  const bbUser = process.env.BB_USERNAME || "x-token-auth";
  const gh = (path, token) => `https://x-access-token:${token}@github.com/${path}`;
  const bb = (path, token) => `https://${bbUser}:${token}@bitbucket.org/${path}`;

  if (url.includes("zlan")) {
    if (process.env.GH_ZITI_CI_REPO_ACCESS_PAT) {
      console.error("🔑 Using GH_ZITI_CI_REPO_ACCESS_PAT token for zlan");
      return gh("netfoundry/zlan.git", process.env.GH_ZITI_CI_REPO_ACCESS_PAT);
    }
    console.error("🔑 Using SSH for zlan");
    return "git@github.com:netfoundry/zlan.git";
  }
  if (url.includes("k8s-on-prem-installations")) {
    if (process.env.BB_REPO_TOKEN_ONPREM) {
      console.error("🔑 Using BB_REPO_TOKEN_ONPREM token");
      return bb("netfoundry/k8s-on-prem-installations.git", process.env.BB_REPO_TOKEN_ONPREM);
    }
    console.error("🔑 Using SSH for self-hosted");
    return "git@bitbucket.org:netfoundry/k8s-on-prem-installations.git";
  }
  if (url.includes("zrok-connector")) {
    if (process.env.BB_REPO_TOKEN_FRONTDOOR) {
      console.error("🔑 Using BB_REPO_TOKEN_FRONTDOOR token");
      return bb("netfoundry/zrok-connector.git", process.env.BB_REPO_TOKEN_FRONTDOOR);
    }
    console.error("🔑 Using SSH for frontdoor");
    return "git@bitbucket.org:netfoundry/zrok-connector.git";
  }
  if (url.includes("ziti-doc")) {
    if (process.env.GH_ZITI_CI_REPO_ACCESS_PAT) {
      console.error("🔑 Using GH_ZITI_CI_REPO_ACCESS_PAT token for ziti-doc");
      return gh("openziti/ziti-doc.git", process.env.GH_ZITI_CI_REPO_ACCESS_PAT);
    }
    console.error("🔑 Using SSH for ziti-doc");
    return "git@github.com:openziti/ziti-doc.git";
  }
  if (url.includes("platform-doc")) {
    if (process.env.BB_REPO_TOKEN_PLATFORM_DOC) {
      console.error("🔑 Using BB_REPO_TOKEN_PLATFORM_DOC token");
      return bb("netfoundry/platform-doc.git", process.env.BB_REPO_TOKEN_PLATFORM_DOC);
    }
    console.error("🔑 Using SSH for platform-doc");
    return "git@bitbucket.org:netfoundry/platform-doc.git";
  }
  if (url.includes("nf-data-connector")) {
    if (process.env.BB_REPO_TOKEN_DATA_CONNECTOR) {
      console.error("🔑 Using BB_REPO_TOKEN_DATA_CONNECTOR token");
      return bb("netfoundry/nf-data-connector.git", process.env.BB_REPO_TOKEN_DATA_CONNECTOR);
    }
    console.error("🔑 Using SSH for nf-data-connector");
    return "git@bitbucket.org:netfoundry/nf-data-connector.git";
  }
  if (url.includes("customer-connect-docs")) {
    if (process.env.BB_REPO_TOKEN_CUSTOMER_CONNECT) {
      console.error("🔑 Using BB_REPO_TOKEN_CUSTOMER_CONNECT token");
      return bb("netfoundry/customer-connect-docs.git", process.env.BB_REPO_TOKEN_CUSTOMER_CONNECT);
    }
    console.error("🔑 Using SSH for customer-connect-docs");
    return "git@bitbucket.org:netfoundry/customer-connect-docs.git";
  }
  return url; // public (e.g. openziti/zrok) — no auth needed
}

function redact(url) {
  return url.replace(/:\/\/[^@]+@/, "://[REDACTED]@");
}

function failWithBranches(branch, url) {
  console.log(`❌ Branch '${branch}' not found in ${redact(url)}`);
  console.log("👉 Available branches:");
  const ls = capture(GIT, ["ls-remote", "--heads", url]);
  for (const l of (ls.stdout || "").split("\n")) {
    const ref = l.split(/\s+/)[1];
    if (ref) console.log(ref.replace("refs/heads/", ""));
  }
  process.exit(1);
}

function cloneOrUpdate(rawUrl, dest, branch = "main") {
  const target = join(remotesDir, dest);
  const url = authUrl(rawUrl);

  if (existsSync(join(target, ".git"))) {
    console.log(`Updating '${dest}' @ '${branch}'...`);
    if (capture(GIT, ["-C", target, "remote", "set-url", "origin", url]).status !== 0) {
      capture(GIT, ["-C", target, "remote", "add", "origin", url]);
    }
    const fetched = spawnSync(GIT, ["-C", target, "fetch", "--depth", "1", "origin", branch], {
      stdio: "inherit", env: process.env,
    });
    if (fetched.status !== 0) failWithBranches(branch, url);
    const reset = spawnSync(GIT, ["-C", target, "reset", "--hard", "FETCH_HEAD"], {
      stdio: "inherit", env: process.env,
    });
    if (reset.status !== 0) failWithBranches(branch, url);
  } else if (existsSync(target)) {
    console.error(`❌ ${target} exists but is not a git repo.`);
    process.exit(1);
  } else {
    console.log(`Cloning '${dest}' @ '${branch}'...`);
    const cloned = spawnSync(
      GIT,
      ["clone", "--single-branch", "--branch", branch, "--depth", "1", url, target],
      { stdio: "inherit", env: process.env },
    );
    if (cloned.status !== 0) failWithBranches(branch, url);
  }
}

// =============================================================================
// Directory walking (used by lint, stale-artifact cleanup)
// =============================================================================

const PRUNE_DIRS = new Set([
  "node_modules", ".git", "build", "versioned_docs", "_partials", "_remotes",
]);

function* walkMarkdown(dir) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      if (PRUNE_DIRS.has(e.name)) continue;
      yield* walkMarkdown(p);
    } else if (/\.(md|mdx)$/i.test(e.name) && !e.name.startsWith("_")) {
      yield p;
    }
  }
}

// =============================================================================
// sync_versioned_remote
// =============================================================================

// Copy a remote's versioned-docs subtree up to the unified-doc site root.
// (Mirror of Invoke-SyncVersionedRemote in build-docs.ps1 -- keep in sync.)
function syncVersionedRemote(remote) {
  let remoteDir = "";
  for (const sub of ["website", "docusaurus"]) {
    const candidate = join(remotesDir, remote, sub);
    if (existsSync(candidate)) { remoteDir = candidate; break; }
  }
  if (!remoteDir) {
    console.error(`ERROR: cannot find _remotes/${remote}/{website,docusaurus}`);
    process.exit(1);
  }

  console.log(`Copying versioned docs from ${remoteDir}...`);
  for (const item of [
    `${remote}_versioned_docs`,
    `${remote}_versioned_sidebars`,
    `${remote}_versions.json`,
  ]) {
    const src = join(remoteDir, item);
    const dest = join(scriptDir, item);
    if (!existsSync(src)) {
      console.log(`  WARN: source missing: ${src} -- skipping`);
      continue;
    }
    rmSync(dest, { recursive: true, force: true });
    cpSync(src, dest, { recursive: true });
    console.log(`  copied ${item}`);
  }
}

// =============================================================================
// lint_docs
// =============================================================================

function stripAnsi(s) {
  // eslint-disable-next-line no-control-regex
  return s.replace(/\x1b\[[0-9;]*m/g, "");
}

function cleanLog(s) {
  return (s || "")
    .split(/\r?\n/)
    .map((l) => stripAnsi(l).replace(/.*[\\/]_remotes[\\/]/, "_remotes/"))
    .join("\n");
}

function lintDocs() {
  console.log("🔍 Starting Quality Checks...");

  const potentialTargets = [
    join(remotesDir, "zlan", "docusaurus", "docs"),
    join(remotesDir, "frontdoor", "docusaurus", "docs"),
    join(remotesDir, "zrok", "website", "docs"),
    join(remotesDir, "selfhosted", "docusaurus", "docs"),
    join(remotesDir, "openziti", "docusaurus", "docs"),
    join(remotesDir, "platform", "docusaurus", "docs"),
    join(remotesDir, "data-connector", "docusaurus", "docs"),
    join(remotesDir, "customer-connect", "docusaurus", "docs"),
  ];
  const validTargets = potentialTargets.filter((t) => existsSync(t));

  if (validTargets.length === 0) {
    console.log("⚠️  No documentation directories found. Skipping lint.");
    return;
  }

  console.log("🎯 Gathering file list...");
  const files = [];
  for (const t of validTargets) {
    for (const f of walkMarkdown(t)) files.push(f);
  }
  console.log(`📊 Found ${files.length} files to scan...`);
  if (files.length === 0) {
    console.log("⚠️  No files found. Skipping.");
    return;
  }

  const valeIni = join(scriptDir, "..", "docs-linter", ".vale.ini");
  const mdlintJson = join(scriptDir, "..", "docs-linter", ".markdownlint.json");

  let valeOut = "";
  if (has(VALE)) {
    console.log("📝 Running Vale...");
    for (const batch of chunk(files, LINT_BATCH)) {
      const r = capture(VALE, ["--config", valeIni, "--no-wrap", "--no-exit", ...batch], {
        timeout: 120000,
      });
      valeOut += (r.stdout || "") + (r.stderr || "");
    }
  }

  let mdOut = "";
  if (has(MDLINT)) {
    console.log("🧹 Running Markdownlint...");
    for (const batch of chunk(files, LINT_BATCH)) {
      const r = capture(MDLINT, ["--config", mdlintJson, ...batch], { timeout: 120000 });
      mdOut += (r.stdout || "") + (r.stderr || "");
    }
  }

  const valeClean = cleanLog(valeOut);
  const mdClean = cleanLog(mdOut);

  const countLines = (s, sub) => s.split("\n").filter((l) => l.includes(sub)).length;
  const vErr = countLines(valeClean, "error");
  const vWarn = countLines(valeClean, "warning");
  const vSug = countLines(valeClean, "suggestion");
  const mdErr = mdClean.split("\n").filter((l) => l.trim() !== "").length;
  const total = vErr + vWarn + vSug + mdErr;

  console.log("");
  console.log("========================================================");
  console.log("📊  QUALITY CHECK SUMMARY");
  console.log("========================================================");
  console.log(`  📄 Files Scanned:       ${files.length}`);
  console.log(`  🛑 Vale Errors:         ${vErr}`);
  console.log(`  ⚠️ Vale Warnings:       ${vWarn}`);
  console.log(`  💡 Vale Suggestions:    ${vSug}`);
  console.log(`  🧹 Markdownlint Issues: ${mdErr}`);
  console.log("--------------------------------------------------------");
  console.log(`  🚨 TOTAL ISSUES:        ${total}`);
  console.log("========================================================");
  console.log("");

  if (mdErr > 0) {
    console.log("################### MARKDOWNLINT REPORT ###################");
    console.log(mdClean.trim());
    console.log("");
  }
  if (vErr + vWarn + vSug > 0) {
    console.log("####################### VALE REPORT #######################");
    console.log(valeClean.trim());
    if (mdErr > 0) {
      console.log(`🛑 BUT WAIT! You also have ${mdErr} Markdownlint errors (see above).`);
    }
    console.log("");
  }

  console.log("✅ Quality Checks Complete.");
}

// =============================================================================
// MAIN EXECUTION
// =============================================================================

if (clean) {
  console.log("CLEAN: removing _remotes contents (preserving package.json)");
  for (const name of readdirSync(remotesDir)) {
    if (name === "package.json") continue;
    rmSync(join(remotesDir, name), { recursive: true, force: true });
  }
}

cloneOrUpdate("https://bitbucket.org/netfoundry/zrok-connector.git", "frontdoor", branches.frontdoor);
cloneOrUpdate("https://bitbucket.org/netfoundry/k8s-on-prem-installations.git", "selfhosted", branches.selfhosted);
cloneOrUpdate("https://github.com/openziti/ziti-doc.git", "openziti", branches.zitiDoc);
cloneOrUpdate("https://github.com/netfoundry/zlan.git", "zlan", branches.zlan);
cloneOrUpdate("https://github.com/openziti/zrok.git", "zrok", branches.zrok);
cloneOrUpdate("https://bitbucket.org/netfoundry/platform-doc.git", "platform", branches.platform);
cloneOrUpdate("https://bitbucket.org/netfoundry/nf-data-connector.git", "data-connector", branches.dataConnector);
cloneOrUpdate("https://bitbucket.org/netfoundry/customer-connect-docs.git", "customer-connect", branches.customerConnect);

// Remove stale Docusaurus caches/outputs left inside cloned remotes.
console.log("Cleaning stale build artifacts from remotes...");
for (const remote of (existsSync(remotesDir) ? readdirSync(remotesDir, { withFileTypes: true }) : [])) {
  if (!remote.isDirectory()) continue;
  for (const sub of ["docusaurus", "website"]) {
    for (const artifact of ["build", ".docusaurus"]) {
      const p = join(remotesDir, remote.name, sub, artifact);
      if (existsSync(p)) rmSync(p, { recursive: true, force: true });
    }
  }
}

syncVersionedRemote("zrok");
syncVersionedRemote("openziti");

lintDocs();

if (lintOnly) {
  console.log("🛑 --lint-only specified. Exiting before build.");
  process.exit(0);
}

// --- BUILD OPENZITI SDK REFERENCE DOCS (ziti-doc's gendoc) ---
const sdkTarget = join(scriptDir, "static", "openziti", "reference", "developer", "sdk");
console.log(`creating openziti SDK target if necessary at: ${sdkTarget}`);
mkdirSync(sdkTarget, { recursive: true });

const gendocEnv = { ...process.env, SDK_ROOT_TARGET: sdkTarget };
const gendocFlags = ["-d", ...otherFlags]; // -d = skip gendoc's own docusaurus build
if (isWin) {
  run("pwsh", ["-NoProfile", "-File", join(remotesDir, "openziti", "gendoc.ps1"), ...gendocFlags], {
    env: gendocEnv, cwd: scriptDir,
  });
} else {
  // Execute gendoc.sh directly so its `#!/bin/bash -eu` shebang applies (as the
  // former build-docs.sh did); running it via `bash gendoc.sh` would drop -eu.
  run(join(remotesDir, "openziti", "gendoc.sh"), gendocFlags, {
    env: gendocEnv, cwd: scriptDir,
  });
}

// --- DOCUSAURUS BUILD ---
run(YARN, ["install"], { cwd: scriptDir });

if (clean) {
  console.log("CLEAN: clearing Docusaurus cache");
  run(YARN, ["clear"], { cwd: scriptDir });
}

const now = new Date().toString();
const commitRes = capture(GIT, ["-C", scriptDir, "rev-parse", "--short", "HEAD"]);
const commit = commitRes.status === 0 && commitRes.stdout.trim() ? commitRes.stdout.trim() : "unknown";
writeFileSync(join(scriptDir, "static", "build-time.txt"), `${now}\n${commit}\n`);

const minifyFlag = process.env.NO_MINIFY ? ["--no-minify"] : [];
const outDir = `build${qualifier}`;

console.log(line);
console.log("DOCUSAURUS BUILD");
console.log(line);
console.log(`  Output dir: ${outDir}`);
console.log(`  Build mask: ${process.env.DOCUSAURUS_BUILD_MASK ?? "0x3FF (config default)"}`);
console.log(`  No-minify:  ${process.env.NO_MINIFY ? "true" : "false"}`);
console.log(line);

run(YARN, ["build", ...minifyFlag, "--out-dir", outDir], { cwd: scriptDir });
