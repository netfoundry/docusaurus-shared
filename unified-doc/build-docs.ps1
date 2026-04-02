#Requires -Version 5.1
<#
.SYNOPSIS
    Builds the unified NetFoundry documentation site.

.DESCRIPTION
    Clones (or updates) all product doc repos into _remotes/, runs lint checks,
    builds SDK reference docs via ziti-doc's gendoc.sh, then runs a Docusaurus
    production build.

    Auth: token env vars are used when set; otherwise falls back to SSH key auth.
    Token env vars: GH_ZITI_CI_REPO_ACCESS_PAT, BB_REPO_TOKEN_ONPREM,
                    BB_REPO_TOKEN_FRONTDOOR, BB_USERNAME.

.EXAMPLE
    .\build-docs.ps1 -ZitiDocBranch my.branch.name

.EXAMPLE
    .\build-docs.ps1 -ZitiDocBranch my.branch.name -BuildMask 0x1 -SkipLinkedDoc

.EXAMPLE
    .\build-docs.ps1 -Clean -Qualifier "-preview"
#>
[CmdletBinding()]
param(
    # Branch to clone for each remote repo
    [string]$ZitiDocBranch    = "main",
    [string]$ZrokBranch       = "main",
    [string]$FrontdoorBranch  = "develop",
    [string]$SelfhostedBranch = "main",
    [string]$ZlanBranch       = "main",

    # Remove all _remotes content and .docusaurus cache before building
    [switch]$Clean,

    # Run lint checks only; skip the Docusaurus build
    [switch]$LintOnly,

    # Pass -l to gendoc.sh: skip doxygen/wget SDK reference doc generation
    [switch]$SkipLinkedDoc,

    # Pass --no-minify to Docusaurus build
    [switch]$NoMinify,

    # Appended to the output directory name: e.g. "-preview" -> "build-preview"
    [string]$Qualifier = "",

    # Docusaurus build mask (hex). 0x1=openziti, 0x2=frontdoor, 0x4=selfhosted,
    # 0x8=zrok, 0x10=zlan, 0xFF=all
    [string]$BuildMask = "0xFF"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$scriptDir  = Split-Path -Parent $MyInvocation.MyCommand.Path
$remotesDir = Join-Path $scriptDir "_remotes"

# ─── HELPERS ──────────────────────────────────────────────────────────────────

function Write-Separator([string]$Title = "") {
    Write-Host "========================================"
    if ($Title) { Write-Host $Title; Write-Host "========================================" }
}

# Builds an authenticated clone URL. Falls back to $SshUrl when the token var is unset.
function Get-RepoUrl {
    param(
        [string]$DefaultHttpsUrl,
        [string]$TokenEnvVar,
        [string]$SshUrl,
        # For Bitbucket: username env var (defaults to "x-token-auth")
        [string]$UsernameEnvVar = ""
    )

    $token = [System.Environment]::GetEnvironmentVariable($TokenEnvVar)
    if ($token) {
        $user = "x-access-token"
        if ($UsernameEnvVar) {
            $u = [System.Environment]::GetEnvironmentVariable($UsernameEnvVar)
            if ($u) { $user = $u } else { $user = "x-token-auth" }
        }
        $uri = [Uri]$DefaultHttpsUrl
        return "$($uri.Scheme)://${user}:${token}@$($uri.Host)$($uri.AbsolutePath)"
    }
    return $SshUrl
}

# Clones $Url into _remotes\$Dest at $Branch (depth 1).
# If the clone fails and an existing repo is present, does fetch + reset instead.
# On any unrecoverable error, lists available remote branches and exits.
function Invoke-CloneOrUpdate {
    param(
        [string]$Url,
        [string]$Dest,
        [string]$Branch
    )

    $target = Join-Path $remotesDir $Dest
    $redactedUrl = $Url -replace '://[^@]+@', '://[REDACTED]@'
    Write-Host "bd clone_or_update: dest='$Dest' branch='$Branch' url='$redactedUrl'"

    if (Test-Path (Join-Path $target ".git")) {
        Write-Host "bd existing repo detected; fetching branch '$Branch'"
        git -C $target remote set-url origin $Url 2>&1 | Out-Null
        if ($LASTEXITCODE -ne 0) {
            git -C $target remote add origin $Url 2>&1 | Out-Null
        }
        git -C $target fetch --depth 1 origin $Branch
        if ($LASTEXITCODE -ne 0) {
            Write-Host "ERROR: Branch '$Branch' not found in $redactedUrl"
            Write-Host "Available branches:"
            git ls-remote --heads $Url | ForEach-Object {
                ($_ -split '\s+')[1] -replace 'refs/heads/', ''
            }
            exit 1
        }
        git -C $target reset --hard FETCH_HEAD 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Failed to reset '$target' to FETCH_HEAD"
        }
        Write-Host "bd fetch+reset succeeded"
        return
    } elseif (Test-Path $target) {
        Write-Host "ERROR: $target exists but is not a git repo"
        Get-ChildItem $target | Format-List Name
        exit 1
    } else {
        Write-Host "bd cloning branch '$Branch' -> '$target'"
        git clone --single-branch --branch $Branch --depth 1 $Url $target
        if ($LASTEXITCODE -ne 0) {
            Write-Host "ERROR: Clone failed. Available branches in $redactedUrl :"
            git ls-remote --heads $Url | ForEach-Object {
                ($_ -split '\s+')[1] -replace 'refs/heads/', ''
            }
            exit 1
        }
        Write-Host "bd clone succeeded"
    }
}

# Copies zrok's versioned-docs artifacts from _remotes\zrok\website\ into the
# unified-doc root, where Docusaurus expects to find them.
# (Equivalent to sync-versioned-remote.sh)
function Invoke-SyncVersionedRemote([string]$Remote) {
    $remoteWebsite = Join-Path $remotesDir "$Remote\website"
    Write-Host "Syncing versioned docs from $remoteWebsite..."

    foreach ($item in @("${Remote}_versioned_docs", "${Remote}_versioned_sidebars")) {
        $dest = Join-Path $scriptDir $item
        Remove-Item -Recurse -Force $dest -ErrorAction SilentlyContinue
        Copy-Item -Recurse (Join-Path $remoteWebsite $item) $dest
        Write-Host "  Copied $item"
    }

    $versionsFile = "${Remote}_versions.json"
    Copy-Item (Join-Path $remoteWebsite $versionsFile) (Join-Path $scriptDir $versionsFile)
    Write-Host "  Copied $versionsFile"
}

function Invoke-LintDocs {
    Write-Host "Starting quality checks..."

    $potentialTargets = @(
        (Join-Path $remotesDir "zlan\docusaurus\docs"),
        (Join-Path $remotesDir "frontdoor\docusaurus\docs"),
        (Join-Path $remotesDir "zrok\website\docs"),
        (Join-Path $remotesDir "selfhosted\docusaurus\docs"),
        (Join-Path $remotesDir "openziti\docusaurus\docs")
    )
    $targets = $potentialTargets | Where-Object { Test-Path $_ }

    if (-not $targets) {
        Write-Host "No documentation directories found. Skipping lint."
        return
    }

    $valeIni    = Join-Path $scriptDir "..\docs-linter\.vale.ini"
    $mdlintJson = Join-Path $scriptDir "..\docs-linter\.markdownlint.json"

    $valeOk   = $null -ne (Get-Command vale          -ErrorAction SilentlyContinue)
    $mdlintOk = $null -ne (Get-Command markdownlint  -ErrorAction SilentlyContinue)

    $valeErrors = 0; $valeWarnings = 0; $valeSugg = 0; $mdErrors = 0

    if ($valeOk) {
        Write-Host "Running Vale..."
        $valeOut = & vale --config $valeIni --no-wrap --no-exit @targets 2>&1
        $valeErrors   = ($valeOut | Select-String "\berror\b"      | Measure-Object).Count
        $valeWarnings = ($valeOut | Select-String "\bwarning\b"    | Measure-Object).Count
        $valeSugg     = ($valeOut | Select-String "\bsuggestion\b" | Measure-Object).Count
        if ($valeErrors + $valeWarnings + $valeSugg -gt 0) {
            $valeOut | Write-Host
        }
    }

    if ($mdlintOk) {
        Write-Host "Running markdownlint..."
        $mdOut    = & markdownlint --config $mdlintJson @targets 2>&1
        $mdErrors = ($mdOut | Measure-Object).Count
        if ($mdErrors -gt 0) { $mdOut | Write-Host }
    }

    $total = $valeErrors + $valeWarnings + $valeSugg + $mdErrors
    Write-Host ""
    Write-Host "========================================================"
    Write-Host "  QUALITY CHECK SUMMARY"
    Write-Host "========================================================"
    Write-Host "  Files: (by directory)"
    $targets | ForEach-Object { Write-Host "    $_" }
    Write-Host "  Vale Errors:         $valeErrors"
    Write-Host "  Vale Warnings:       $valeWarnings"
    Write-Host "  Vale Suggestions:    $valeSugg"
    Write-Host "  Markdownlint Issues: $mdErrors"
    Write-Host "  TOTAL ISSUES:        $total"
    Write-Host "========================================================"
}

# ─── MAIN ─────────────────────────────────────────────────────────────────────

Write-Separator "BUILD CONFIGURATION"
Write-Host "  ZitiDocBranch:    $ZitiDocBranch"
Write-Host "  ZrokBranch:       $ZrokBranch"
Write-Host "  FrontdoorBranch:  $FrontdoorBranch"
Write-Host "  SelfhostedBranch: $SelfhostedBranch"
Write-Host "  ZlanBranch:       $ZlanBranch"
Write-Host "  Clean:            $Clean"
Write-Host "  LintOnly:         $LintOnly"
Write-Host "  SkipLinkedDoc:    $SkipLinkedDoc"
Write-Host "  NoMinify:         $NoMinify"
Write-Host "  Qualifier:        '$Qualifier'"
Write-Host "  BuildMask:        $BuildMask"
Write-Host "  IS_VERCEL:        $($env:IS_VERCEL)"

if ($Clean) {
    Write-Host "CLEAN: removing _remotes contents (preserving package.json)"
    Get-ChildItem $remotesDir -Exclude "package.json" |
        Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
}

# ─── RESOLVE AUTHENTICATED URLS ───────────────────────────────────────────────

$urlZitiDoc    = Get-RepoUrl `
    -DefaultHttpsUrl "https://github.com/openziti/ziti-doc.git" `
    -TokenEnvVar     "GH_ZITI_CI_REPO_ACCESS_PAT" `
    -SshUrl          "git@github.com:openziti/ziti-doc.git"

$urlZlan       = Get-RepoUrl `
    -DefaultHttpsUrl "https://github.com/netfoundry/zlan.git" `
    -TokenEnvVar     "GH_ZITI_CI_REPO_ACCESS_PAT" `
    -SshUrl          "git@github.com:netfoundry/zlan.git"

$urlFrontdoor  = Get-RepoUrl `
    -DefaultHttpsUrl "https://bitbucket.org/netfoundry/zrok-connector.git" `
    -TokenEnvVar     "BB_REPO_TOKEN_FRONTDOOR" `
    -SshUrl          "git@bitbucket.org:netfoundry/zrok-connector.git" `
    -UsernameEnvVar  "BB_USERNAME"

$urlSelfhosted = Get-RepoUrl `
    -DefaultHttpsUrl "https://bitbucket.org/netfoundry/k8s-on-prem-installations.git" `
    -TokenEnvVar     "BB_REPO_TOKEN_ONPREM" `
    -SshUrl          "git@bitbucket.org:netfoundry/k8s-on-prem-installations.git" `
    -UsernameEnvVar  "BB_USERNAME"

$urlZrok = "https://github.com/openziti/zrok.git"   # public; no auth needed

# ─── CLONE / UPDATE REMOTES ───────────────────────────────────────────────────

Invoke-CloneOrUpdate $urlFrontdoor   "frontdoor"  $FrontdoorBranch
Invoke-CloneOrUpdate $urlSelfhosted  "selfhosted" $SelfhostedBranch
Invoke-CloneOrUpdate $urlZitiDoc     "openziti"   $ZitiDocBranch
Invoke-CloneOrUpdate $urlZlan        "zlan"       $ZlanBranch
Invoke-CloneOrUpdate $urlZrok        "zrok"       $ZrokBranch

# Remove stale Docusaurus caches and build outputs from inside the cloned remotes.
# A leftover .docusaurus/ or build/ from a prior run can confuse the unified-doc build.
Get-ChildItem $remotesDir -Recurse -Directory -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -in 'build', '.docusaurus' } |
    Where-Object { $_.FullName -match '(\\docusaurus|\\website)(\\build|\\\.docusaurus)$' } |
    ForEach-Object {
        Write-Host "Removing stale artifact: $($_.FullName)"
        Remove-Item $_.FullName -Recurse -Force
    }

# ─── SYNC VERSIONED DOCS ──────────────────────────────────────────────────────

Invoke-SyncVersionedRemote "zrok"

# ─── LINT ─────────────────────────────────────────────────────────────────────

Invoke-LintDocs

if ($LintOnly) {
    Write-Host "-LintOnly specified. Exiting before build."
    exit 0
}

# ─── SDK REFERENCE DOCS (ziti-doc's gendoc.sh) ────────────────────────────────
# gendoc.sh is always called with -d (skip its own Docusaurus build; unified-doc
# handles that). Pass -l as well when -SkipLinkedDoc is set (skips doxygen/wget).

$sdkTarget = Join-Path $scriptDir "static\openziti\reference\developer\sdk"
New-Item -ItemType Directory -Force -Path $sdkTarget | Out-Null
$env:SDK_ROOT_TARGET = $sdkTarget

$gendocScript = Join-Path $remotesDir "openziti\gendoc.ps1"
$gendocFlags  = @("-d")
if ($SkipLinkedDoc) { $gendocFlags += "-l" }

Write-Host "Running gendoc.ps1 $($gendocFlags -join ' ')..."
& pwsh -NoProfile -File $gendocScript @gendocFlags
if ($LASTEXITCODE -ne 0) {
    Write-Error "gendoc.ps1 failed with exit code $LASTEXITCODE"
}

# ─── DOCUSAURUS BUILD ─────────────────────────────────────────────────────────

Push-Location $scriptDir
try {
    & yarn install
    if ($LASTEXITCODE -ne 0) { Write-Error "yarn install failed" }

    if ($Clean) {
        Write-Host "CLEAN: clearing Docusaurus cache"
        & yarn clear
    }

    # Stamp build time and commit into static/ for diagnostics
    $now    = Get-Date -Format "ddd MMM dd HH:mm:ss UTC yyyy" -AsUTC
    $commit = git -C $scriptDir rev-parse --short HEAD 2>$null
    if (-not $commit) { $commit = "unknown" }
    "$now`n$commit" | Set-Content (Join-Path $scriptDir "static\build-time.txt")

    $env:DOCUSAURUS_BUILD_MASK = $BuildMask

    $outDir    = "build$Qualifier"
    $buildArgs = @("build", "--out-dir", $outDir)
    if ($NoMinify) { $buildArgs += "--no-minify" }

    Write-Separator "DOCUSAURUS BUILD"
    Write-Host "  Output dir:  $outDir"
    Write-Host "  Build mask:  $BuildMask"
    Write-Host "  No-minify:   $NoMinify"

    & yarn @buildArgs
    if ($LASTEXITCODE -ne 0) { Write-Error "yarn build failed" }
} finally {
    Pop-Location
}
