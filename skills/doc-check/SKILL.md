---
name: doc-check
description: Check merged PRs in a repo for customer-facing changes, cross-reference against existing docs, and flag what is missing, stale, or already covered
---

Check merged PRs in a product's source repo(s) for customer-facing changes. For each flagged PR, search the local doc
directory to assess whether coverage already exists, is stale, or is missing entirely. Produce an actionable report,
then optionally generate a doc draft.

## Invocation

```
/doc-check status
/doc-check <product>
/doc-check <product> --since YYYY-MM-DD
/doc-check <product> --draft <owner/repo#PR>
```

- `status` — show a summary table of all products and their last scan results, then exit. Does not fetch any PRs or
  update state. Regenerates `STATUS.md` from existing output files.
- `<product>` is one of: `zrok`, `ziti-doc`, `zlan`, `k8s-on-prem-installations`, `platform-doc`, `zrok-connector`
- `--since` overrides the last-checked date from state
- `--draft <owner/repo#PR>` skips the scan and generates a doc draft for a specific PR (e.g., `--draft openziti/ziti#4821`)

## Product registry

Each product has one or more **source repos** (scanned for PRs) and one **local doc path** (searched for coverage).

| Product                   | Source repos                                          | Auth              | Local doc path                                          |
|---------------------------|-------------------------------------------------------|-------------------|---------------------------------------------------------|
| zrok                      | openziti/zrok                                         | gh CLI (public)   | /root/nf-docs/zrok/website/docs                         |
| ziti-doc                  | openziti/ziti, openziti/ziti-console                  | gh CLI (public)   | /root/nf-docs/ziti-doc/docusaurus/docs                  |
| zlan                      | netfoundry/zlan                                       | gh CLI (private)  | /root/nf-docs/zlan/docusaurus/docs                      |
| k8s-on-prem-installations | netfoundry/k8s-on-prem-installations                  | BB_EMAIL+BB_TOKEN | /root/nf-docs/k8s-on-prem-installations/docusaurus/docs |
| platform-doc              | netfoundry/netfoundry-ui, netfoundry/core-management, netfoundry/gateway, netfoundry/customer-connect *(in dev)*, netfoundry/integrations, netfoundry/network-auth | BB_EMAIL+BB_TOKEN | /root/nf-docs/platform-doc/docusaurus/docs |
| zrok-connector            | netfoundry/zrok-connector                             | BB_EMAIL+BB_TOKEN | /root/nf-docs/zrok-connector/docusaurus/docs            |

**Note on source repos vs. doc repos**: The source repos are the *product code* repositories — that's where
customer-facing changes originate. The local doc path is a separate, locally cloned *documentation* repository used
only for coverage searching (grep). You do not need the product code repos cloned locally; diffs are fetched via API.

**Bitbucket auth**: `BB_TOKEN` is an Atlassian account-level API token (generated at
id.atlassian.com/manage-profile/security/api-tokens). It covers all Bitbucket repos the account has access to.
Use with `BB_EMAIL` (the account's email address) as basic auth credentials.

**GitHub auth**: Use the `gh` CLI. Run `gh auth status` to confirm it's authenticated before running a scan.
If `gh` is not available or the user explicitly requests token-based fallback, use a personal access token via
`-H "Authorization: token $GH_TOKEN"` in curl — but prefer `gh`.

## State file

State is stored at `~/.claude/doc-check-state.json`. One entry per **product** (not per source repo). Format:

```json
{
  "zrok": { "last_checked": "2026-03-20T15:00:00Z" },
  "ziti-doc": { "last_checked": "2026-03-25T17:00:00Z" }
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
  "https://api.bitbucket.org/2.0/repositories/netfoundry/<slug>/pullrequests?state=MERGED&sort=-updated_on&pagelen=50"

# First run: fetch last 5 only
curl -s -u "$BB_EMAIL:$BB_TOKEN" \
  "https://api.bitbucket.org/2.0/repositories/netfoundry/<slug>/pullrequests?state=MERGED&sort=-updated_on&pagelen=5"
```

Filter to PRs where `updated_on` is after the since date (when date-based).

**When a product has multiple source repos**, collect all results into one list, then apply the 10-PR hard cap to the
combined total (most recent first across repos). In the report, prefix each PR with its source repo:
`openziti/ziti#4821`, `openziti/ziti-console#512`, etc.

**Special case — `netfoundry/netfoundry-ui`**: This is a monorepo hosting both the NF Console UI (V7/V8) and the
Frontdoor UI. When scanning it, read the PR title, description, and diff to determine which product it belongs to
before assessing doc coverage:

- PRs touching Frontdoor UI code → cross-reference against `zrok-connector/docusaurus/docs`
- PRs touching NF Console UI code → cross-reference against `platform-doc/docusaurus/docs`
- PRs touching shared infrastructure (build tooling, design system, auth scaffolding) → mark as **internal**

When running `/doc-check platform-doc`, skip any `netfoundry-ui` PRs that are clearly Frontdoor-only — note them in
the report as "Skipped (Frontdoor — run `/doc-check zrok-connector`)". When running `/doc-check zrok-connector`,
apply the same logic in reverse.

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
  "https://api.bitbucket.org/2.0/repositories/netfoundry/<slug>/diff/netfoundry/<slug>:<src_hash>%0D<dst_hash>?from_pullrequest_id=<id>&topic=true"
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
## doc-check: ziti-doc (since 2026-03-18)

Sources: openziti/ziti (6 PRs), openziti/ziti-console (4 PRs) — 10 total · 2 need doc work · 1 already covered · 7 skipped (internal)

### Needs doc work

**openziti/ziti#4821 — Add --output flag to ziti edge list** (merged 2026-03-20) · MISSING
- New `--output json|yaml|table` flag on all `ziti edge list` subcommands
- No existing doc found for output formatting options
- Suggested location: reference/cli section
- `/doc-check ziti-doc --draft openziti/ziti#4821` to generate a draft

**openziti/ziti-console#512 — Dark mode toggle** (merged 2026-03-19) · STALE
- New dark/light mode toggle in ZAC settings panel
- Existing doc: `reference/zac-overview.md` — covers UI layout but not appearance settings
- `/doc-check ziti-doc --draft openziti/ziti-console#512` to generate a draft

### Already covered
- openziti/ziti#4815 — TLS cert rotation: `operations/certificates.md` covers this area and appears current

### Skipped (internal)
- openziti/ziti#4818 — Fix race condition in router reconnect (internal bug fix)
- openziti/ziti#4816 — Go 1.22 bump (build tooling)
- openziti/ziti-console#509 — Cypress test updates (tests only)
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
6. Write the draft following the NetFoundry style guide:
   - Sentence-style headers; imperative verb phrases for how-to titles
   - Active voice, "you/your", no "please"
   - Backticks for CLI flags, commands, config keys, code tokens
   - Short descriptive alt text for images (no underscores, no filenames as alt text)
   - 120-character line length limit
7. Present the full draft inline in the terminal, followed by the suggested file path, then prompt the user with these
   options:

   > **What would you like to do?**
   > - **Execute** — write the draft directly to the suggested file path in the doc repo
   > - **Edit** — describe changes and I'll update the draft before writing
   > - **Save to drafts** — save to `output/<product>/drafts/<repo>-<PR>-<slug>.md` for later without touching the doc repo

   **Do not call Edit or Write on any doc repo file until the user selects "Execute".** Saving to drafts is always safe
   and does not require confirmation.

#### Drafts folder

Drafts are saved to `output/<product>/drafts/` under the doc-check output directory:

```
/root/nf-docs/.claude/skills/doc-check/output/<product>/drafts/<repo>-<PR>-<slug>.md
```

Example: `output/platform-doc/drafts/netfoundry-ui-2479-download-usage-report.md`

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
under `/root/nf-docs/.claude/skills/doc-check/output/<product>/`. Create the directory if it doesn't exist.

Filename format: `YYYY-MM-DD.md` (use today's date). If a file with that name already exists, append a counter:
`YYYY-MM-DD-2.md`, etc.

Write the report in the same markdown format shown in step 5, with a one-line header added at the top:

```
# doc-check: <product> — YYYY-MM-DD
```

### 10. Update STATUS.md

After saving the report, regenerate `STATUS.md` at the root of the skills/doc-check folder:

```
/root/nf-docs/.claude/skills/doc-check/STATUS.md
```

To build it, scan the output directory for all products. For each product subdirectory, find the most recent dated
report file and parse it for:

- **Last checked**: the date from the filename (`YYYY-MM-DD`)
- **Needs work**: count of PRs in the "Needs doc work" section
- **Covered**: count of PRs in the "Already covered" section
- **Skipped**: count of PRs in the "Skipped (internal)" section

Produce a table sorted by last-checked date descending (most recently checked first), followed by any products in the
registry that have no output yet (listed as "Never run"):

```markdown
# Doc coverage status

Last updated: YYYY-MM-DD

| Product                   | Last checked | Needs work | Covered | Skipped |
|:--------------------------|:-------------|:-----------|:--------|:--------|
| zrok                      | 2026-04-06   | 2          | 1       | 5       |
| platform-doc              | 2026-04-01   | 0          | 3       | 8       |
| ziti-doc                  | 2026-03-25   | 1          | 2       | 6       |
| zlan                      | never        | —          | —       | —       |
| k8s-on-prem-installations | never        | —          | —       | —       |
| zrok-connector            | never        | —          | —       | —       |
```

Overwrite `STATUS.md` completely on each run — it is always regenerated from the output files, never manually edited.
