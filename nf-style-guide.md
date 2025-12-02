# NetFoundry style guide

This guide is the single source of truth for how we communicate at NetFoundry. Whether you're writing a quick how-to
guide, an in-depth reference, UI content, or a blog post, our documentation is a direct reflection of our brand's
intelligence and reliability. Consistency in tone, voice, and style is not just a matter of good grammar; it's a vital
part of the user experience. When our docs are consistent, they're easier to read, faster to scan, and they build user
trust.

## TL;DR

- Use [sentence-style casing](#sentence-style-casing).
- Use active voice when possible, especially for how-tos.
- Use everyday language.
- Use [screenshots](#images-and-file-names) compatible with mobile devices.

## Tone and voice

- Use everyday language. Use contractions freely. Use technical terms accurately but avoid unnecessary industry jargon
  or slang that can confuse non-experts.
- Avoid pronouns but use 'you' and 'your' when needed, not "the user".
- Write steps as if you were describing them aloud to a colleague.
- Use active language whenever possible. This is especially important in how-tos and tutorials.
  - Use verb phrases for how-to titles: "Create a certificate", "Install an agent", etc.

## Headings

- Use [ATX headings](https://github.github.com/gfm/#atx-headings), and include a line space after each heading.
- For table of contents (ToC) headers, try to make them match the H1 unless you need to shorten for space, or shorten to
  reduce redundancy of terms.

### Sentence-style casing

Use sentence-style casing: Only capitalize the first word of titles and any proper nouns. When in doubt, use lowercase.
This ensures:

- Improved readability and scanning (yes, backed by typographic and cognitive science research)
- Improved accessibility
- More conversational and casual tone
- Consistency and ease of implementation

References:

- [Google developer docs style guide](https://developers.google.com/style/capitalization)
- [Microsoft style guide](https://learn.microsoft.com/en-us/style-guide/capitalization)
- [UX: Title case vs sentence case in ui](https://www.everyinteraction.com/articles/title-case-vs-sentence-case-in-ui/)
- [Letter case and text legibility in normal and low vision](https://pmc.ncbi.nlm.nih.gov/articles/PMC2016788/)
- [Writing readable content](https://www.mity.com.au/blog/writing-readable-content-and-why-all-caps-is-so-hard-to-read)
- [Readability Guidelines: Capitals](https://readabilityguidelines.co.uk/grammar-points/capital-letters/#2-use-sentence-case-in-headlines-and-subheads)

## Structure and organization

We use a Diátaxis framework. When creating content, think in terms of these four categories:

- **How-to guides** (Practical problem-solving)
  - **Goal:** To help the user *achieve a specific goal* by performing a series of steps.
  - **Description:** Prescriptive instructions that show the exact steps to solve a real-world problem. Unlike
    tutorials, they assume some existing knowledge and don't explain concepts; they just command actions.
  - **Question answered:** *How do I do X?*

- **Reference** (Information-oriented)
  - **Goal:** To *describe* the tools, APIs, and systems, answering what everything is.
  - **Description:** Technical, accurate descriptions of code, configurations, functions, or UI elements. This content
    is structured for easy look-up (like a dictionary or catalog) and is not intended to be read from start to finish.
  - **Question answered:** *What is X?*

- **Explanation (or conceptual)** (Understanding-oriented)
  - **Goal:** To help the user *understand* the background, context, and theory.
  - **Description:** Discussions that clarify a topic. They provide the "why" and connect concepts, building theoretical
    knowledge and insight rather than telling the user what to do.
  - **Question answered:** *Why does X exist?* (or, *Why is X the way it is?*)

- **Tutorials** (Learning-oriented)
  - **Goal:** To help the user *learn* by doing.
  - **Description:** Step-by-step lessons that allow the user to successfully complete a practical, simple project. They
    are focused on **teaching**, not explaining, and prioritize the shortest path to success.
  - **Question answered:** *How do I get started?*

Do your best. Not everything will be obvious or cut-and-dry.

To learn more, see:

- [Diátaxis official website](https://diataxis.fr/)
- [Better Docs with Diátaxis](https://www.youtube.com/watch?v=0BqucaRwHhA) YouTube video

## Table of contents

 For an MVP, a product should have:

- `intro.md`: The docs landing page; an overview of the product which then leads you to the getting started.
- `get-started.md`: Get up-and-running with the product; the main use case or onboarding steps so a user can get
  started. This is the most important how-to

Afterwards, you can start adding:

- how-to guides
- reference topics
- tutorials
- support/troubleshooting topics

The exact top-level buckets we use for the ToC can vary depending on the product and the context.

## Indentation

| Element        | Indentation rule                            | Rationale                                                                    |
| -------------- | ------------------------------------------- | ---------------------------------------------------------------------------- |
| Bulleted lists | Use 2-space indents for all nested items    | Adheres to the original Markdown philosophy for minimal nesting width.       |
| YAML files     | Use 2-space indents.                        | Industry standard for YAML; aligns with the bulleted list standard.          |
| Numbered lists | Use 4-space indents for all nested items.   | Recommended spacing for proper rendition by most Markdown parsers.           |

## Lists

- Lean towards no periods, but complete sentences (especially multiple sentences) should all have periods. Consistency
  is key.
- Try not to mix full sentences with 1 or 2-word bullets.

## Code, text, and UI elements

- Use **bold** for UI elements (or for terms being defined in a list). Use *italic* for emphasis. Use back ticks for
  code phrases, file paths, variables, CLI input, and other non-English terms.
- Use fenced code blocks. Make sure to include a language flag.
- Don't use "the button". Say "Click **Next**."
- Tell the user to *click* UI items. If it's a drop-down, use *select*.

## Images and file names

- A signifcant amount of readers are on mobile. Don't use images wider than 600-700 px. Shrink browsers for screenshots.
  Check the site on your phone.
- Avoid spaces in file names. Descriptive filenames in kebab-case (alphanumeric, lowercase, and with hyphens to seperate
  words) is preferable.
- Give images a descriptive alt text.

## Word choices

- Don't say please. Don't use ampsersands (unless they're in the UI or a proper noun).
- Use sign in, not log in.
  - One word (hyphenated) for adjective ("the sign-in page") and two words for verb ("sign in to your account")
- For words with an acronym, write it out on first mention with the acronym in parentheses, then use only the acronym.

## Punctuation

- Use hyphens for compound adjectives, and em dashes for a break in thought.
- Use colons to introduce or define items.
- Use oxford commas.

## Admonitions

Use them. Only use "Note:" if you have to include it somewhere an admonition can't go.

## Spacing

- Use *one* space after periods before the next word.
- Use line spaces between headers and paras, and when introducing elements like tables or lists.
- Line spacing helps make Markdown more readable.
- Establish a hard line limit of 120 characters for all body text lines in Markdown topics to improve readability on
large screens and adhere to code formatting standards. To set this, go to VS Code settings, search for `editor ruler`,
then add `120` to the `settings.json`.
