<#
.SYNOPSIS
    Visual regression diff: local build vs. production

.DESCRIPTION
    Builds the docs (optional), starts the local server, captures screenshots
    of both the local build and production (https://netfoundry.io/docs), then
    diffs them with BackstopJS and opens the HTML report.

.PARAMETER SkipBuild
    Skip running build-docs.ps1 (use an existing build)

.PARAMETER Product
    Only run for one product: home, openziti, frontdoor, selfhosted, zrok, zlan
    Default: all

.PARAMETER Port
    Port that 'yarn serve' binds to. Default: 3000

.PARAMETER NoReport
    Do not open the HTML report after the run

.PARAMETER ReferenceOnly
    Only capture reference (production) screenshots; skip test/diff

.PARAMETER TestOnly
    Skip reference capture; only run local test + diff
    (requires reference screenshots to already exist)

.PARAMETER ForceReference
    Always re-capture production (reference) screenshots without prompting.
    Without this flag, the script prompts when reference shots are missing,
    and skips the reference step when they already exist.

.PARAMETER UrlFilter
    One or more URL path substrings to restrict which pages are captured.
    E.g. -UrlFilter openziti,frontdoor  or  -UrlFilter nf
    Matches any URL whose path contains the substring.

.EXAMPLE
    .\visual-diff.ps1
.EXAMPLE
    .\visual-diff.ps1 -SkipBuild
.EXAMPLE
    .\visual-diff.ps1 -SkipBuild -Product zlan
.EXAMPLE
    .\visual-diff.ps1 -SkipBuild -TestOnly -Product openziti
.EXAMPLE
    .\visual-diff.ps1 -SkipBuild -ForceReference
.EXAMPLE
    .\visual-diff.ps1 -SkipBuild -UrlFilter openziti,frontdoor
#>
param(
    [switch]$SkipBuild,
    [string]$Product = "all",
    [int]$Port = 3000,
    [switch]$NoReport,
    [switch]$ReferenceOnly,
    [switch]$TestOnly,
    [switch]$ForceReference,
    [string]$UrlFilter = "",
    [switch]$DesktopOnly
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

$ProductsAll = @("home", "openziti", "frontdoor", "selfhosted", "zrok", "zlan")

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
function Log  { param($msg) Write-Host "[vdiff] $msg" }
function Ok   { param($msg) Write-Host "[vdiff] OK  $msg" }
function Fail { param($msg) Write-Error "[vdiff] ERR $msg"; exit 1 }

function Wait-ForServer {
    $url = "http://localhost:${Port}/docs"
    $maxWait = 120
    $interval = 3
    $elapsed = 0
    Log "Waiting for server at $url ..."
    while ($true) {
        try {
            $null = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
            Ok "Server is up at $url"
            return
        } catch {
            if ($elapsed -ge $maxWait) {
                Fail "Server did not respond after ${maxWait}s. Check yarn serve output."
            }
            Start-Sleep -Seconds $interval
            $elapsed += $interval
            Log "  ...still waiting (${elapsed}s / ${maxWait}s)"
        }
    }
}

function Open-Report {
    param([string]$Path)
    if ($NoReport) { return }
    if (Test-Path $Path) {
        Log "Opening report: $Path"
        Start-Process $Path
    }
}

function Get-ProductsList {
    if ($Product -eq "all") {
        return $ProductsAll
    }
    if ($ProductsAll -notcontains $Product) {
        Fail "Unknown product '$Product'. Valid: $($ProductsAll -join ', ')"
    }
    return @($Product)
}

# ---------------------------------------------------------------------------
# Validation
# ---------------------------------------------------------------------------
if ($ReferenceOnly -and $TestOnly) {
    Fail "-ReferenceOnly and -TestOnly are mutually exclusive."
}

# ---------------------------------------------------------------------------
# Preflight — Playwright Chromium
# ---------------------------------------------------------------------------
Log "=== Preflight: Checking Playwright Chromium ==="
$chromiumExe = Get-Item "$env:LOCALAPPDATA\ms-playwright\chromium*\chrome-headless-shell-win64\chrome-headless-shell.exe" `
    -ErrorAction SilentlyContinue | Select-Object -First 1
if (-not $chromiumExe) {
    Log "Playwright Chromium not found. Installing now..."
    Push-Location $ScriptDir
    npx playwright install chromium
    if ($LASTEXITCODE -ne 0) { Fail "Failed to install Playwright Chromium. Run: npx playwright install chromium" }
    Pop-Location
    Ok "Playwright Chromium installed."
} else {
    Ok "Playwright Chromium found at $($chromiumExe.FullName)"
}

# ---------------------------------------------------------------------------
# Step 1 — Build
# ---------------------------------------------------------------------------
$buildDir = Join-Path $ScriptDir "build"
$buildExists = (Get-ChildItem -Path $buildDir -Recurse -File -ErrorAction SilentlyContinue | Measure-Object).Count -gt 0

if ($SkipBuild) {
    Log "=== Step 1/5: Skipping build (-SkipBuild) ==="
} elseif ($buildExists) {
    Write-Host ""
    Write-Host "  An existing build was found at: $buildDir" -ForegroundColor Cyan
    Write-Host ""
    $answer = Read-Host "  Rebuild docs? [y/N]"
    if ($answer -match "^[Yy]") {
        Log "=== Step 1/5: Building docs ==="
        & "$ScriptDir\build-docs.ps1" -SkipLinkedDoc
        if ($LASTEXITCODE -ne 0) {
            Write-Host "  Build failed — using existing build and continuing." -ForegroundColor Yellow
        } else {
            Ok "Build complete."
        }
    } else {
        Log "=== Step 1/5: Using existing build (user skipped rebuild) ==="
    }
} else {
    Log "=== Step 1/5: No build found — building docs ==="
    & "$ScriptDir\build-docs.ps1" -SkipLinkedDoc
    if ($LASTEXITCODE -ne 0) { Fail "Build failed and no existing build to fall back on." }
    Ok "Build complete."
}

# ---------------------------------------------------------------------------
# Step 2 — Start local server (only needed for test phase)
# ---------------------------------------------------------------------------
$ServeProcess = $null
try {

if (-not $ReferenceOnly) {
    Log "=== Step 2/5: Starting local server (yarn serve --port $Port) ==="
    $ServeLog = "$env:TEMP\visual-diff-serve.log"
    $ServeProcess = Start-Process -FilePath "cmd.exe" `
        -ArgumentList "/c", "yarn", "serve", "--port", $Port `
        -WorkingDirectory $ScriptDir `
        -RedirectStandardOutput $ServeLog `
        -RedirectStandardError "$env:TEMP\visual-diff-serve-err.log" `
        -PassThru -NoNewWindow
    Log "yarn serve started (pid $($ServeProcess.Id)). Log: $ServeLog"
    Wait-ForServer
} else {
    Log "=== Step 2/5: Skipping server (-ReferenceOnly) ==="
}

# ---------------------------------------------------------------------------
# Step 3 — Generate BackstopJS scenarios from production sitemap
# ---------------------------------------------------------------------------
Log "=== Step 3/5: Generating BackstopJS scenarios from sitemap ==="
Push-Location $ScriptDir
$generateArgs = @("scripts/generate-vrt-scenarios.mjs", $Product)
if ($UrlFilter -ne "") {
    $generateArgs += "--filter=$UrlFilter"
    Log "  URL filter: $UrlFilter"
}
if ($DesktopOnly) {
    $generateArgs += "--desktop-only"
    Log "  Desktop only (skipping tablet/mobile)"
}
$step3Time = Get-Date
node @generateArgs
if ($LASTEXITCODE -ne 0) { Fail "generate-vrt-scenarios.mjs failed" }
Ok "Scenarios generated."
Pop-Location

# Derive active product list from configs that were just written in Step 3.
# This respects -UrlFilter and -Product without relying on stale configs from prior runs.
$ProductsList = @($ProductsAll | Where-Object {
    $cfg = Join-Path $ScriptDir "backstop.$_.json"
    (Test-Path $cfg) -and ((Get-Item $cfg).LastWriteTime -gt $step3Time)
})
if ($ProductsList.Count -eq 0) { Fail "No backstop configs were generated. Check sitemap and filter." }
Log "  Active products: $($ProductsList -join ', ')"

# ---------------------------------------------------------------------------
# Step 4 — Capture screenshots (parallel per product)
# ---------------------------------------------------------------------------
Push-Location $ScriptDir

function Invoke-BackstopParallel {
    param([string[]]$Products, [string]$Action, [string]$WorkDir)

    $jobs = @{}
    foreach ($prod in $Products) {
        $config = Join-Path $WorkDir "backstop.$prod.json"
        if (-not (Test-Path $config)) {
            Log "  SKIP $prod — no config file backstop.$prod.json"
            continue
        }
        $logFile = Join-Path $env:TEMP "vdiff-$Action-$prod.log"
        Log "  queuing $Action : $prod"
        $job = Start-Job -Name "backstop-$Action-$prod" -ScriptBlock {
            param($dir, $prod, $action, $log)
            $backstop = Join-Path $dir "node_modules\.bin\backstop.cmd"
            $proc = Start-Process -FilePath "cmd.exe" `
                -ArgumentList "/c `"$backstop`" $action --config=backstop.$prod.json" `
                -WorkingDirectory $dir -Wait -PassThru `
                -RedirectStandardOutput $log `
                -RedirectStandardError "$log.err" `
                -NoNewWindow
            $proc.ExitCode
        } -ArgumentList $WorkDir, $prod, $Action, $logFile
        $jobs[$prod] = @{ Job = $job; Log = $logFile }
    }

    if ($jobs.Count -eq 0) { return }

    $allJobs = @($jobs.Values | ForEach-Object { $_.Job })
    Log "  running $($allJobs.Count) $Action job(s) in parallel..."
    $logPositions = @{}
    do {
        Start-Sleep -Seconds 2
        $running = @($allJobs | Where-Object { $_.State -eq 'Running' })
        $done    = $allJobs.Count - $running.Count
        foreach ($job in $running) {
            $prod    = $job.Name -replace "^backstop-$Action-", ""
            $logFile = $jobs[$prod].Log
            if (-not (Test-Path $logFile)) { continue }

            $allLines = Get-Content $logFile
            $startAt  = if ($logPositions.ContainsKey($prod)) { $logPositions[$prod] } else { 0 }
            $newLines  = $allLines | Select-Object -Skip $startAt
            $logPositions[$prod] = $allLines.Count

            $newLines |
                Where-Object { $_ -match '\S' } |
                Where-Object { $_ -notmatch 'BackstopTools have been installed|x Close Browser|Browser Console Log' } |
                ForEach-Object { Log "  [$prod] ($done/$($allJobs.Count) done) $_" }
        }
    } while ($running.Count -gt 0)

    foreach ($prod in $jobs.Keys | Sort-Object) {
        $entry   = $jobs[$prod]
        $ec      = Receive-Job $entry.Job
        $entry.Job | Remove-Job
        $icon    = if ($ec -eq 0) { "OK " } else { "FAIL" }
        Log "  [$icon] $prod (exit $ec)"
        foreach ($logPath in @($entry.Log, "$($entry.Log).err")) {
            if (Test-Path $logPath) {
                Get-Content $logPath | ForEach-Object { Write-Host "      $_" }
            }
        }
    }
}

$runReference = $false
if ($TestOnly) {
    Log "=== Step 4a/5: Skipping reference capture (-TestOnly) ==="
} elseif ($ForceReference) {
    Log "=== Step 4a/5: Capturing PRODUCTION screenshots (-ForceReference) ==="
    $runReference = $true
} else {
    # Auto-detect: check if reference bitmaps exist for every product in the run
    $missingRef = @()
    foreach ($prod in $ProductsList) {
        $refDir = Join-Path $ScriptDir "backstop_data\bitmaps_reference_$prod"
        $hasFiles = (Get-ChildItem -Path $refDir -Recurse -File -ErrorAction SilentlyContinue | Measure-Object).Count -gt 0
        if (-not $hasFiles) { $missingRef += $prod }
    }

    if ($missingRef.Count -gt 0) {
        Write-Host ""
        Write-Host "  No production reference screenshots found for: $($missingRef -join ', ')" -ForegroundColor Yellow
        Write-Host "  These are needed to diff against your local build." -ForegroundColor Yellow
        Write-Host ""
        $answer = Read-Host "  Capture production screenshots now? [Y/n]"
        if ($answer -eq "" -or $answer -match "^[Yy]") {
            Log "=== Step 4a/5: Capturing PRODUCTION screenshots (reference) ==="
            $runReference = $true
        } else {
            Log "=== Step 4a/5: Skipping reference capture (user declined) ==="
        }
    } else {
        Log "=== Step 4a/5: Reference screenshots exist — skipping (use -ForceReference to refresh) ==="
    }
}

if ($runReference) {
    Invoke-BackstopParallel -Products $ProductsList -Action "reference" -WorkDir $ScriptDir
    Ok "Production screenshots captured."
}

if (-not $ReferenceOnly) {
    Log "=== Step 4b/5: Capturing LOCAL screenshots (test) ==="
    Invoke-BackstopParallel -Products $ProductsList -Action "test" -WorkDir $ScriptDir
    Ok "Local screenshots captured."
} else {
    Log "=== Step 4b/5: Skipping local capture (-ReferenceOnly) ==="
}

# ---------------------------------------------------------------------------
# Step 5 — Open reports
# ---------------------------------------------------------------------------
if (-not $ReferenceOnly) {
    Log "=== Step 5/5: Opening diff reports ==="
    foreach ($prod in $ProductsList) {
        $report = Join-Path $ScriptDir "backstop_data\html_report_$prod\index.html"
        if (Test-Path $report) {
            Open-Report $report
        } else {
            Log "  No report yet for $prod ($report)"
        }
    }
} else {
    Log "=== Step 5/5: Skipping reports (-ReferenceOnly) ==="
}

Pop-Location
Log "Done."

} finally {
    Log "Stopping local server on port $Port..."
    $netstatLine = netstat -ano | Select-String ":$Port\s.*LISTENING"
    if ($netstatLine) {
        $serverPid = ($netstatLine -split '\s+')[-1]
        Log "  killing pid $serverPid (listening on port $Port)"
        Stop-Process -Id $serverPid -Force -ErrorAction SilentlyContinue
    } else {
        Log "  no process found listening on port $Port"
    }
}

