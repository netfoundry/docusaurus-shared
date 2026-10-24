# Test-site visual regression

A [Playwright](https://playwright.dev) screenshot comparison of the test-site. Every page in [`pages.ts`](./pages.ts)
is captured in four variations (desktop light, desktop dark, mobile light, mobile dark) and compared against
baseline images. A theme change that alters how a demo page renders fails the check.

The test-site keeps one demo per page, so a failing screenshot points at one feature.

## When it fails

The workflow `test-site-visual-regression` runs on pull requests that touch `packages/docusaurus-theme/`,
`packages/test-site/`, or the root `package.json`/`yarn.lock`.

- **The change is intentional:** add the `visual-baseline-update` label to the pull request. The check passes, and
  the baselines republish when the pull request merges to `main`.
- **To see the diffs:** open the failed run, download the `test-site-visual-regression-report` artifact, unzip it,
  and open `playwright-report/index.html`. Each failed test shows the expected, actual, and diff images.

The run's summary page repeats both hints.

## Baselines live on a GitHub release

Baseline images are never committed. They are tarred into `baselines.tgz` and attached to the rolling prerelease
`test-site-vrt-baselines`.

- **Verify** pulls the tarball and compares: `--pull-baselines`.
- **Publish** regenerates the screenshots and uploads the tarball: `--update --publish-baselines`.

Both use the [`gh`](https://cli.github.com/) CLI: your `gh` auth locally, `GH_TOKEN` in CI. Until the first
baselines are published, verify passes with a note. The first merge to `main` publishes them.

### Publishing baselines by hand

Every push to `main` republishes the baselines. To publish without a merge, either:

- **Run the workflow:** Actions, `test-site-visual-regression`, Run workflow, check `publish`. Or:

  ```bash
  gh workflow run test-site-visual-regression.yml --repo netfoundry/docusaurus-shared -f publish=true
  ```

- **Run it locally**, from a clean checkout (see [Windows](#windows) for why). Your `gh` auth needs write access to
  the repo's releases:

  ```bash
  packages/test-site/visual-regression/run.sh --docker --update --publish-baselines
  ```

Whatever the checkout renders becomes the baseline every PR compares against, so publish from `main`, or from a
branch whose look you mean to keep.

## Baseline parity

Screenshots differ across Linux, Windows, and macOS (fonts, anti-aliasing). The published baselines are Linux ones,
produced in the pinned Playwright container, so publish and verify both use `--docker`. A native run on Windows or
macOS works for a quick look, but its snapshots are OS-suffixed and never published.

## Usage

Run from the repo root.

```bash
# Verify against the published baselines (the common case)
packages/test-site/visual-regression/run.sh --docker --pull-baselines

# Regenerate locally without publishing, to inspect first
packages/test-site/visual-regression/run.sh --docker --update

# Open the report from the last run
npx --prefix packages/test-site/visual-regression playwright show-report packages/test-site/visual-regression/playwright-report

# Native run against an already-running test-site (no build, no container)
packages/test-site/visual-regression/run.sh --base-url http://localhost:3000
```

### Windows

Use WSL containers instead of Docker Desktop. Pass the `wslc.exe` CLI and a Windows-form mount path:

```bash
packages/test-site/visual-regression/run.sh --docker --container-cli wslc.exe \
  --mount-path "D:/path/to/docusaurus-shared" --pull-baselines
```

The container runs `yarn install` into the mounted tree. If that tree already has a Windows `node_modules/`, yarn
can treat it as up to date and skip the Linux native binaries. Run against a clean checkout or copy.

`wslc run` can fail with `E_FAIL` while it pulls the image. Pull it first:

```powershell
wslc image pull mcr.microsoft.com/playwright:v1.64.1-noble
```

## Adding a page

Add the demo page under `packages/test-site/docs/`, then add an entry to `pages.ts`. Merge to `main` publishes its
baseline. Until then the new entry has no baseline, so label the pull request `visual-baseline-update`.
