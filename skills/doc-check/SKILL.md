---
name: doc-check
description: Check merged PRs in a repo for customer-facing changes, cross-reference against existing docs, and flag what is missing, stale, or already covered
---

Check merged PRs in a product's source repo(s) for customer-facing changes. For each flagged PR, search the local doc
directory to assess whether coverage already exists, is stale, or is missing entirely. Produce an actionable report,
then optionally generate a doc draft.

## Setup

Before using this skill, configure it for your organization:

1. **Update the product registry** below with your products, source repos, auth method, and local doc paths.
2. **Set auth environment variables** as needed (see Auth section below).
3. **Update the style guide reference** in step 7 to point to your own documentation style guide.

## Invocation

```
/doc-check status
/doc-check <product>
/doc-check <product> --since YYYY-MM-DD
/doc-check <product> --draft <owner/repo#PR>
```

- `status` — show a summary table of all products and their last scan results, then exit. Does not fetch any PRs or
  update state. Regenerates `STATUS.md` from existing output files.
- `<product>` is a product name defined in your registry below
- `--since` overrides the last-checked date from state
- `--draft <owner/repo#PR>` skips the scan and generates a doc draft for a specific PR

## Product registry

Each product has one or more **source repos** (scanned for PRs) and one **local doc path** (searched for coverage).
Replace the example rows below with your own products.

| Product    | Source repos          | Auth         | Local doc path                        |
|------------|-----------------------|--------------|---------------------------------------|
| product-a  | your-org/repo-a       | gh CLI       | /path/to/product-a/docs               |
| product-b  | your-org/repo-b       | GH_TOKEN     | /path/to/product-b/docs               |
| product-c  | your-org/repo-c       | BB_EMAIL+BB_TOKEN | /path/to/product-c/docs          |

**Note on source repos vs. doc repos**: The source repos are the *product code* repositories — that's where
customer-facing changes originate. The local doc path is a separate, locally cloned *documentation* repository used
only for coverage searching (grep). You do not need the product code repos cloned locally; diffs are fetched via API.

**Bitbucket auth**: `BB_TOKEN` is an Atlassian account-level API token (generated at
id.atlassian.com/manage-profile/security/api-tokens). It covers all Bitbucket repos the account has access to.
Use with `BB_EMAIL` (the account's email address) as basic auth credentials.

**GitHub auth**: Use the `gh` CLI. Run `gh auth status` to confirm it's authenticated before running a scan.
If `gh` is not available or the user explicitly requests token-based fallback, use a personal access token via
`GH_TOKEN` env variable in curl — but prefer `gh`. For private repos that require a specific token, set the
token variable name in the Auth column of your registry and use `GH_TOKEN=<your-token-variable>` when calling `gh`.

## State file

State is stored at `~/.claude/doc-check-state.json`. One entry per **product** (not per source repo). Format:

```json
{
  "product-a": { "last_checked": "2026-03-20T15:00:00Z" },
  "product-b": { "last_checked": "2026-03-25T17:00:00Z" }
}
```

Read this file at the start of each run. Update it with the current timestamp after completing a scan.

## Step-by-step instructions

### 1. Determine the since date

- If `--since` was passed, use that date as the cutoff for all source repos
- Otherwise read `last_checked` from the state file for the given product
- **If no state exists** (first run): do not use a date cutoff — instead fetch the last 5 PRs per source repo
  (see Step 2). This avoids pulling unbounded history on first use.
- **Hard cap: never analyze more than 10 PRs in a single run** (across all source repos combined). If more are found,
  process the 10 most recent and warn the user, listing the skipped PR identifiers and suggesting `--since` to work
  backwards in chunks.

### 2. Fetch merged PRs

**Before fetching, check for a same-day re-run:** If `last_checked` exists in the state file and its date matches
today's date (ignore time), and `--since` was not passed, stop immediately and tell the user:

> Already ran today (last checked: `<timestamp>`). Use `--since YYYY-MM-DD` to re-scan from an earlier date, or
> just run it again tomorrow.

Do not fetch PRs, write a file, or update state.

**For each source repo in the product**, fetch merged PRs:

**GitHub repos:**

```bash
# Date-based (last_checked exists or --since passed):
gh pr list --repo <owner>/<repo> --state merged --limit 50 \
  --json number,title,mergedAt,body

# First run (no last_checked): fetch last 5 only
gh pr list --repo <owner>/<repo> --state merged --limit 5 \
  --json number,title,mergedAt,body
```

Filter results in Python to PRs where `mergedAt` is after the since date (when date-based).

**Bitbucket repos:**

```bash
# Date-based:
curl -s -u "$BB_EMAIL:$BB_TOKEN" \
  "https://api.bitbucket.org/2.0/repositories/<your-org>/<slug>/pullrequests?state=MERGED&sort=-updated_on&pagelen=50"

# First run: fetch last 5 only
curl -s -u "$BB_EMAIL:$BB_TOKEN" \
  "https://api.bitbucket.org/2.0/repositories/<your-org>/<slug>/pullrequests?state=MERGED&sort=-updated_on&pagelen=5"
```

Filter to PRs where `updated_on` is after the since date (when date-based).

**When a product has multiple source repos**, collect all results into one list, then apply the 10-PR hard cap to the
combined total (most recent first across repos). In the report, prefix each PR with its source repo:
`your-org/repo-a#42`, `your-org/repo-b#17`, etc.

**Monorepos**: If a source repo hosts multiple products, read the PR title, description, and diff to determine which
product it belongs to before assessing doc coverage. Mark PRs for other products as skipped with a note.

### 3. Assess each PR: customer-facing or internal?

Fetch the diff for each PR:

**GitHub:**

```bash
gh pr diff <number> --repo <owner>/<repo>
```

**Bitbucket:**

The simple `/pullrequests/<id>/diff` endpoint returns empty results. Batch-extract commit hashes from the PR list
response (fields `source.commit.hash` and `destination.commit.hash`) and construct the diff URL as:

```bash
curl -s -u "$BB_EMAIL:$BB_TOKEN" \
  "https://api.bitbucket.org/2.0/repositories/<your-org>/<slug>/diff/<your-org>/<slug>:<src_hash>%0D<dst_hash>?from_pullrequest_id=<id>&topic=true"
```

Mark as **customer-facing** (proceed to step 4) if the diff contains:

- New or changed CLI flags, commands, or subcommands
- New or changed API endpoints, request/response shapes
- New or changed config file options or environment variables
- New UI flows, screens, or settings
- Changed default behaviors
- New features called out in the PR title or description

Mark as **internal** (skip, add to skipped list) if changes are limited to:

- Tests only
- CI/CD or build configuration
- Dependency bumps with no behavior change
- Internal refactors with no user-visible effect
- The PR itself is documentation work (changes only to doc files)

### 4. Cross-reference flagged PRs against existing docs

For each customer-facing PR, search the local doc path for the product (see registry above) to determine whether
coverage already exists. Use grep and file reads — do not guess.

Extract 2–4 key terms from the PR (feature name, CLI flag, config key, endpoint name, etc.) and search for them:

```bash
grep -r "<term>" <local-doc-path> --include="*.md" --include="*.mdx" -l
```

Based on what you find, assign one of three statuses:

- **Missing** — no relevant doc content found. New doc or section needed.
- **Stale** — relevant doc found but it predates this change or describes the old behavior. Existing doc needs updating.
- **Covered** — existing doc already accurately describes the feature. No action needed.

Use judgement: a doc that mentions a feature name but doesn't cover the new flag or behavior is **stale**, not covered.
If you're uncertain, lean toward **stale** rather than **covered** — it's better to flag a false positive than miss a gap.

Dismiss **covered** PRs from the flagged list entirely (move them to a "no action needed" section).

### 5. Output the report

```
## doc-check: product-a (since 2026-03-18)

Sources: your-org/repo-a (6 PRs), your-org/repo-b (4 PRs) — 10 total · 2 need doc work · 1 already covered · 7 skipped (internal)

### Needs doc work

**your-org/repo-a#42 — Add --output flag to CLI** (merged 2026-03-20) · MISSING
- New `--output json|yaml|table` flag on all list subcommands
- No existing doc found for output formatting options
- Suggested location: reference/cli section
- `/doc-check product-a --draft your-org/repo-a#42` to generate a draft

**your-org/repo-b#17 — Dark mode toggle** (merged 2026-03-19) · STALE
- New dark/light mode toggle in settings panel
- Existing doc: `reference/ui-overview.md` — covers UI layout but not appearance settings
- `/doc-check product-a --draft your-org/repo-b#17` to generate a draft

### Already covered
- your-org/repo-a#38 — TLS cert rotation: `operations/certificates.md` covers this area and appears current

### Skipped (internal)
- your-org/repo-a#40 — Fix race condition in reconnect logic (internal bug fix)
- your-org/repo-a#39 — Go 1.22 bump (build tooling)
- your-org/repo-b#15 — Cypress test updates (tests only)
```

### 6. Offer to draft

After the report, prompt:
> Run `/doc-check <product> --draft <owner/repo#PR>` for any flagged PR, or tell me which one to draft.

### 7. Generating a draft (`--draft` mode)

When `--draft <owner/repo#PR>` is passed:

1. Fetch the PR title, description, and full diff from the specified repo
2. If the status was **stale**, read the existing doc file first — the draft should update it, not replace it
3. If the status was **missing**, write a new file from scratch
4. Identify what changed from a user perspective
5. Determine the appropriate doc type (how-to, reference, concept explanation) using Diátaxis
6. Write the draft following your organization's documentation style guide:
   - Sentence-style headers; imperative verb phrases for how-to titles
   - Active voice, second person ("you/your")
   - Backticks for CLI flags, commands, config keys, code tokens
   - 120-character line length limit
7. **Only write what the diff and PR description directly support.** Do not infer, extrapolate, or invent behavior that
   isn't shown. If the diff shows a flag exists but not what it does, say so — don't guess. If the PR description is
   vague or the diff is too large to confidently summarize, stop and ask the user to clarify before drafting. It's
   better to ask one question than to ship a plausible-sounding but wrong doc.
8. Present the full draft inline in the terminal, followed by the suggested file path, then prompt the user with these
   options:

   > **What would you like to do?**
   > - **Execute** — write the draft directly to the suggested file path in the doc repo
   > - **Edit** — describe changes and I'll update the draft before writing
   > - **Save to drafts** — save to `output/<product>/drafts/<repo>-<PR>-<slug>.md` for later without touching the doc repo

   **Do not call Edit or Write on any doc repo file until the user selects "Execute".** Saving to drafts is always safe
   and does not require confirmation.

#### Drafts folder

Drafts are saved to `output/<product>/drafts/` under the doc-check skill folder:

```
<skills-dir>/doc-check/output/<product>/drafts/<repo>-<PR>-<slug>.md
```

Example: `output/product-a/drafts/repo-a-42-add-output-flag.md`

Each draft file includes a frontmatter block for traceability:

```markdown
---
pr: <owner/repo#PR>
status: MISSING | STALE
suggested_path: <doc-repo-relative path where the file should land>
---
```

### 8. Update state

After completing a scan (not `--draft` mode), write the current ISO timestamp to `~/.claude/doc-check-state.json`
for the product that was checked (one entry per product, shared across all its source repos).

### 9. Save output

After completing a scan (not `--draft` mode), save the full report to a dated file in a per-product subdirectory
under `<skills-dir>/doc-check/output/<product>/`. Create the directory if it doesn't exist.

Filename format: `YYYY-MM-DD.md` (use today's date). If a file with that name already exists, append a counter:
`YYYY-MM-DD-2.md`, etc.

Write the report in the same markdown format shown in step 5, with a one-line header added at the top:

```
# doc-check: <product> — YYYY-MM-DD
```

### 10. Update STATUS.md

After saving the report, regenerate `STATUS.md` at the root of the doc-check skill folder:

```
<skills-dir>/doc-check/STATUS.md
```

To build it, scan the output directory for all products. For each product subdirectory, find the most recent dated
report file and parse it for:

- **Last checked**: the date from the filename (`YYYY-MM-DD`)
- **Needs work**: count of PRs in the "Needs doc work" section
- **Covered**: count of PRs in the "Already covered" section
- **Skipped**: count of PRs in the "Skipped (internal)" section

Produce a table sorted by last-checked date descending (most recently checked first), followed by any products in the
registry that have no output yet (listed as "never"):

```markdown
# Doc coverage status

Last updated: YYYY-MM-DD

| Product   | Last checked | Needs work | Covered | Skipped |
|:----------|:-------------|:-----------|:--------|:--------|
| product-a | 2026-04-06   | 2          | 1       | 5       |
| product-b | 2026-04-01   | 0          | 3       | 8       |
| product-c | never        | —          | —       | —       |
```

Overwrite `STATUS.md` completely on each run — it is always regenerated from the output files, never manually edited.
