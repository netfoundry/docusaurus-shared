#Requires -Version 5.1
<#
.SYNOPSIS
    Thin Windows shim for the unified NetFoundry documentation build.

.DESCRIPTION
    All build logic lives in build-docs.mjs, the single cross-platform source of
    truth (shared with build-docs.sh). This script only maps its PowerShell-style
    parameters onto build-docs.mjs flags/env vars so existing Windows callers
    (e.g. visual-diff.ps1 -SkipLinkedDoc) keep working unchanged.

    Run `node build-docs.mjs --help` for the full option/env-var reference.

.EXAMPLE
    .\build-docs.ps1 -ZitiDocBranch my.branch.name

.EXAMPLE
    .\build-docs.ps1 -ZitiDocBranch my.branch.name -BuildMask 0x1 -SkipLinkedDoc

.EXAMPLE
    .\build-docs.ps1 -Clean -Qualifier "-preview"
#>
[CmdletBinding()]
param(
    # Branch to clone for each remote repo (only forwarded when explicitly set)
    [string]$ZitiDocBranch       = "main",
    [string]$ZrokBranch          = "main",
    [string]$FrontdoorBranch     = "develop",
    [string]$SelfhostedBranch    = "main",
    [string]$ZlanBranch          = "main",
    [string]$PlatformBranch      = "main",
    [string]$DataConnectorBranch = "main",
    [string]$CustomerConnectBranch = "main",

    # Remove all _remotes content and .docusaurus cache before building
    [switch]$Clean,

    # Run lint checks only; skip the Docusaurus build
    [switch]$LintOnly,

    # Skip doxygen/wget SDK reference doc generation (forwards -l to gendoc)
    [switch]$SkipLinkedDoc,

    # Pass --no-minify to Docusaurus build
    [switch]$NoMinify,

    # Appended to the output directory name: e.g. "-preview" -> "build-preview"
    [string]$Qualifier = "",

    # Docusaurus build mask (hex). 0x1=openziti, 0x2=frontdoor, 0x4=selfhosted,
    # 0x8=zrok, 0x10=zlan, 0x20=platform, 0x40=data-connector,
    # 0x80=llm-gateway, 0x100=mcp-gateway, 0x200=customer-connect, 0x3FF=all.
    # Only forwarded (as $env:DOCUSAURUS_BUILD_MASK) when explicitly set;
    # otherwise build-docs.mjs lets docusaurus.config.ts default it (0x3FF).
    [string]$BuildMask = "0x3FF"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$mjs       = Join-Path $scriptDir "build-docs.mjs"

# Map PowerShell params -> build-docs.mjs flags. Only forward params the caller
# explicitly passed so build-docs.mjs owns the defaults (single source of truth).
$mjsArgs = @()
if ($PSBoundParameters.ContainsKey('ZitiDocBranch'))        { $mjsArgs += "--ziti-doc-branch=$ZitiDocBranch" }
if ($PSBoundParameters.ContainsKey('ZrokBranch'))           { $mjsArgs += "--zrok-branch=$ZrokBranch" }
if ($PSBoundParameters.ContainsKey('FrontdoorBranch'))      { $mjsArgs += "--frontdoor-branch=$FrontdoorBranch" }
if ($PSBoundParameters.ContainsKey('SelfhostedBranch'))     { $mjsArgs += "--selfhosted-branch=$SelfhostedBranch" }
if ($PSBoundParameters.ContainsKey('ZlanBranch'))           { $mjsArgs += "--zlan-branch=$ZlanBranch" }
if ($PSBoundParameters.ContainsKey('PlatformBranch'))       { $mjsArgs += "--platform-branch=$PlatformBranch" }
if ($PSBoundParameters.ContainsKey('DataConnectorBranch'))  { $mjsArgs += "--data-connector-branch=$DataConnectorBranch" }
if ($PSBoundParameters.ContainsKey('CustomerConnectBranch')){ $mjsArgs += "--customer-connect-branch=$CustomerConnectBranch" }
if ($Clean)         { $mjsArgs += "--clean" }
if ($LintOnly)      { $mjsArgs += "--lint-only" }
if ($SkipLinkedDoc) { $mjsArgs += "-l" }
if ($Qualifier)     { $mjsArgs += "--qualifier=$Qualifier" }

# Env-var controls, matching build-docs.sh semantics.
if ($NoMinify)                                     { $env:NO_MINIFY = "1" }
if ($PSBoundParameters.ContainsKey('BuildMask'))   { $env:DOCUSAURUS_BUILD_MASK = $BuildMask }

& node $mjs @mjsArgs
exit $LASTEXITCODE
