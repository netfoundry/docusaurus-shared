<#
.SYNOPSIS
  Publish @netfoundry/docusaurus-theme to npmjs.

.DESCRIPTION
  PowerShell mirror of publish-theme.sh. Keep the two in sync -- see
  scripts/CLAUDE.md.

  Local usage:
    ./scripts/publish-theme.ps1                # real publish
    ./scripts/publish-theme.ps1 -DryRun        # npm publish --dry-run
    ./scripts/publish-theme.ps1 -CheckOnly     # only verify version is not on npm

  Real (non-dry-run) publishes expect either:
    - npm OIDC trusted-publisher auth (CI), or
    - `npm login` already done in the current shell (local).
#>
[CmdletBinding()]
param(
  [switch]$DryRun,
  [switch]$CheckOnly
)

$ErrorActionPreference = 'Stop'

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$pkgDir   = Join-Path $repoRoot 'packages/docusaurus-theme'
$pkgJson  = Join-Path $pkgDir   'package.json'

Set-Location $repoRoot

$pkg     = Get-Content $pkgJson -Raw | ConvertFrom-Json
$name    = $pkg.name
$version = $pkg.version

Write-Host "==> Publishing $name@$version"
Write-Host "    repo root:  $repoRoot"
Write-Host "    dry run:    $DryRun"
Write-Host "    check only: $CheckOnly"

Write-Host "==> Checking npm registry for existing $name@$version"
# `npm view <pkg>@<ver> version` prints the version if it exists, empty if not.
# It can fail for a not-yet-published name -- swallow that.
$existing = & npm view "$name@$version" version 2>$null
if ($LASTEXITCODE -ne 0) { $existing = '' }
if ($existing) {
  Write-Error @"
$name@$version is already published on npm.
Bump the version in packages/docusaurus-theme/package.json before re-running.
"@
  exit 1
}
Write-Host "    not on registry -- ok to publish"

if ($CheckOnly) {
  Write-Host "==> --CheckOnly set; stopping before install/build/publish."
  exit 0
}

Write-Host "==> yarn install"
yarn install --frozen-lockfile
if ($LASTEXITCODE -ne 0) { throw "yarn install failed" }

Write-Host "==> yarn theme:build"
yarn theme:build
if ($LASTEXITCODE -ne 0) { throw "yarn theme:build failed" }

Write-Host "==> yarn test"
yarn test
if ($LASTEXITCODE -ne 0) { throw "yarn test failed" }

Write-Host "==> npm publish"
$publishArgs = @('publish','--access','public','--provenance')
if ($DryRun) { $publishArgs += '--dry-run' }

Push-Location $pkgDir
try {
  & npm @publishArgs
  if ($LASTEXITCODE -ne 0) {
    Write-Error @"
npm publish failed (exit $LASTEXITCODE).
If running in CI: confirm npm Trusted Publisher is configured for this
package + workflow (npmjs.com > package > Settings > Trusted Publishers).
If running locally: confirm 'npm whoami' returns the right account.
"@
    exit 1
  }
} finally {
  Pop-Location
}

Write-Host "==> Done."
