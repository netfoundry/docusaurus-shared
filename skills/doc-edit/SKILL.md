---
name: doc-edit
description: >
  Apply NetFoundry's writing style guide (casing, headings, tone, word choice, punctuation, Diátaxis structure)
  to any documentation, how-to guide, reference page, tutorial, blog post, or UI copy in this repo. Use this
  skill whenever drafting new Markdown/MDX content for the docs site, editing an existing doc page, reviewing
  a doc PR or diff for style, or when the user asks to "check this against our style guide," "clean up this
  doc," "write a how-to," "review this page," or anything touching heading casing, list formatting, em dashes,
  "sign in" vs "log in," acronyms, or screenshot sizing. Trigger even if the user doesn't say "style guide"
  explicitly — any writing or editing of user-facing docs in this repo should go through this checklist.
---

# NetFoundry style guide

NetFoundry docs are a direct reflection of the brand's intelligence and reliability. Consistent tone, voice, and
style make docs easier to read, faster to scan, and more trustworthy. This skill packages that style guide as a
checklist to apply while **writing** new content and while **reviewing** existing content in this repo.


## How to use this skill

- **Writing a new page:** work through "Structure and organization" first to pick the right Diátaxis category,
  then apply the rest of the checklist as you draft, not as a cleanup pass afterward.
- **Reviewing or editing a page/PR:** read the page once for structure and tone, then do a second pass checking
  the mechanical rules (casing, punctuation, word choice) line by line. Flag violations with the specific rule,
  not just "this reads oddly."
- **Fast-scan checklist:** before signing off on any doc, confirm each of these is true. If any is unclear, jump
  to the matching section below for the full rule.
  - [ ] Headings use sentence-style casing.
  - [ ] Only one H1, and it matches `sidebar_label` in frontmatter (or is intentionally shortened for nav).
  - [ ] How-to titles/headings are imperative ("Create a certificate"), not gerunds ("Creating a certificate").
  - [ ] No em dashes (`—` immediately adjacent to text); if unavoidable, spaced.
  - [ ] "Sign in," not "log in." "Zero trust," no hyphen.
  - [ ] Acronyms spelled out on first use.
  - [ ] UI elements are **bold**; code/paths/CLI input are in `backticks`.
  - [ ] Fenced code blocks have a language flag.
  - [ ] Screenshots are 600-700px wide max.
  - [ ] No "please," no stray ampersands.

## Structure and organization: pick the right category first

This repo follows the [Diátaxis](https://diataxis.fr/) framework. Before writing a word, decide which of these
four categories the page belongs to. Diátaxis rules a lot of the style decisions below (heading mood, tone,
how much explanation to include), so getting this right first saves rework.

| Category | Answers | Goal | Tone |
|---|---|---|---|
| **How-to guide** | How do I do X? | Help the user achieve a specific goal via steps | Prescriptive; assumes some existing knowledge, doesn't explain concepts, just commands actions |
| **Reference** | What is X? | Describe tools, APIs, systems for look-up | Dictionary/catalog style, not meant to be read start to finish |
| **Explanation / conceptual** | Why does X exist? / Why is X this way? | Build understanding of background and theory | Connects concepts, gives the "why," doesn't tell the user what to do |
| **Tutorial** | How do I get started? | Teach by doing, via a simple practical project | Shortest path to success; teaching, not explaining |

Not every page will be a clean fit; use judgment.

**Table of contents for a new product/section**, in order: `intro.md` (landing page/overview) → `get-started.md`
(the single most important how-to: get up and running) → then how-to guides, reference topics, tutorials, and
support/troubleshooting topics as the content grows. The exact top-level buckets can vary by product.

## Headings

- Use [ATX headings](https://github.github.com/gfm/#atx-headings) (`#`, `##`, ...) with a blank line after each one.
- Exactly one H1 per topic.
- The H1 and the sidebar label (`sidebar_label` in frontmatter) should match. If they must differ, shorten the
  sidebar label rather than the H1. It's fine for the label to be shorter when space is tight in the nav, or
  when it would otherwise repeat the parent category's name (e.g. "Overview" under a category that already
  names the topic).
- **How-to titles and headings: imperative verb phrases.** "Create a certificate," "Install an agent." Gerunds
  ("Creating a certificate") read as passive and are only acceptable in conceptual topics, never in how-tos or
  reference.
- **Sidebar category/bucket labels: noun phrases, not verbs.** "Deployments," "Identity providers,"
  "Topologies." Save imperative phrases for leaf how-to pages that actually walk through a task — a category
  label isn't a task.

### Sentence-style casing

Capitalize only the first word and proper nouns. When unsure, use lowercase. This is deliberate, not just a
preference: it reads faster, scans better, feels more conversational, and is easier to apply consistently than
title case. Applies to headings, sidebar labels, and UI element names you're describing.

- Right: "Configure a posture check"
- Wrong: "Configure a Posture Check" / "Configure A Posture Check"

## Voice and tone

- Active voice, especially in how-tos: "Click **Create**" not "The **Create** button should be clicked."
- Everyday language: direct, conversational, contractions welcome. Use technical terms accurately, but skip
  jargon or slang that would confuse a non-expert reader.
- Plain sentence structure. Precise technical terms, no literary flourishes, no cleverness.
- Avoid pronouns generally, but use "you" and "your" for the reader — never "the user."

## Lists

- Lean toward no periods on short bullets, but any bullet with a complete sentence (especially multiple
  sentences) gets periods. Pick one convention per list and stay consistent within it.
- Don't mix full-sentence bullets with 1-2 word bullets in the same list — it reads unevenly. If some items need
  a sentence, expand the short ones to match, or restructure.

### Indentation

| Element | Indent | Why |
|---|---|---|
| Bulleted lists | 2 spaces for nested items | Minimal nesting width, per Markdown convention |
| YAML files | 2 spaces | Industry standard |
| Numbered lists | 4 spaces for nested items | Needed for correct rendering in most Markdown parsers |

## Code, text, and UI elements

- **Bold** for UI elements, and for terms being defined in a list.
- *Italic* for emphasis.
- `Backticks` for code phrases, file paths, variables, CLI input, and other non-English tokens.
- Fenced code blocks always get a language flag (` ```bash `, ` ```yaml `, and so on) — never a bare fence.
- Don't write "the button." Name it: "Click **Next**."
- The verb for UI interaction is *click* for buttons/links/checkboxes, *select* for dropdowns.

## Images and screenshots

A large share of readers are on mobile. Keep screenshots at 600-700px wide max — shrink the browser window
before capturing. To verify a page renders well on mobile, either check it on a phone, or use Chrome DevTools:
open DevTools (F12 or Ctrl+Shift+I / Cmd+Option+I), toggle the device toolbar (phone/tablet icon), then pick a
device preset or enter a width like 414px.

## Word choices

- No "please." No ampersands, unless one appears in a UI label or a proper noun.
- **"Sign in," not "log in."** Signing in means actively entering a system and verifying identity; "log"
  historically means creating a record. This also matches most modern tech-doc style guides.
  - Adjective form is one hyphenated word: "the sign-in page." Verb form is two words: "sign in to your account."
- **Acronyms:** spell out on first mention with the acronym in parentheses, then use only the acronym after
  that. Example: "zero trust network access (ZTNA)," then "ZTNA" from then on.
- **"Zero trust," no hyphen** — even as a compound adjective ("zero trust network access"). This is a
  NetFoundry branding call that deliberately overrides the usual compound-adjective hyphenation rule. Don't
  touch file paths, slugs, or code tokens that already contain a hyphenated `zero-trust` — that's a different
  namespace, not prose.

## Punctuation

- Hyphenate compound adjectives ("well-known issue," "browser-based client") — except "zero trust," see above.
- **Avoid em dashes in new writing.** Prefer rewriting as two sentences, or a colon (to introduce/define) or a
  comma (for an aside) instead. If an em dash is genuinely the best tool, space it: `word — word`, never
  `word—word`. When reviewing existing text, an unspaced em dash (`word—word`) is a real violation to fix; a
  correctly spaced em dash (`word — word`) already meets the fallback rule, so treat it as a style nit at most,
  not a required fix.
- Colons introduce or define; don't use them where a comma or period would do.
- Oxford commas, always.
- **Slashes:** no spaces joining single words (`Debian/Ubuntu`, `TCP/UDP`, `on/off`). Spaces joining multi-word
  phrases (`New York / New Jersey`). When both sides are code phrases, space them too, even if each side is one
  token — it keeps the pair wrappable in tables: `` `FOO` / `BAR` ``, not `` `FOO`/`BAR` ``.

## Admonitions

Use Docusaurus admonitions (`:::tip`, `:::note`, `:::caution`, and so on) instead of inline "Note:" text.
Reserve a bare "Note:" prefix for places an admonition block can't go, like inside a table cell or a list item,
and even there look for a way to avoid it first.

## Spacing

- One space after a period, not two.
- A blank line between headings and paragraphs, and before/after tables and lists.
- 120-character line limit on body text in Markdown files. In VS Code: Settings → search `editor ruler` → add
  `120` to `settings.json`.

## Applying this during a review

When reviewing a diff or an existing page, call out violations with the specific rule broken, and propose the
fix inline rather than just flagging the problem — for example: "Heading uses title case ('Configure Your
Network') — should be sentence case: 'Configure your network'." Group findings by section so the author can
work through them in the order they appear in the file.
