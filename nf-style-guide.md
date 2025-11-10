# NetFoundry style guide

## Structure and organization

We use a Diátaxis framework. When creating content, think in terms of these four categories:

* **Tutorials** (Learning-oriented)
  * **Goal:** To help the user *learn* by doing.
  * **Description:** Step-by-step lessons that allow the user to successfully complete a practical, simple project. They are focused on
    **teaching**, not explaining, and prioritize the shortest path to success.
  * **Question answered:** *How do I get started?*

* **How-to guides** (Practical problem-solving)
  * **Goal:** To help the user *achieve a specific goal* by performing a series of steps.
  * **Description:** Prescriptive instructions that show the exact steps to solve a real-world problem. Unlike tutorials, they assume some
    existing knowledge and do not explain concepts; they just command actions.
  * **Question answered:** *How do I do X?*

* **Reference** (Information-oriented)
  * **Goal:** To *describe* the tools, APIs, and systems, answering what everything is.
  * **Description:** Technical, accurate descriptions of code, configurations, functions, or UI elements. This content is structured for
    easy look-up (like a dictionary or catalog) and is not intended to be read from start to finish.
  * **Question answered:** *What is X?*

* **Explanation** (Understanding-oriented)
  * **Goal:** To help the user *understand* the background, context, and theory.
  * **Description:** Discussions that clarify a topic. They provide the "why" and connect concepts, building theoretical knowledge and
    insight rather than telling the user what to do.
  * **Question answered:** *Why does X exist?* (or, *Why is X the way it is?*)
 
 ## Table of contents

 For an MVP, a product should have:

- `intro.md`: The docs landing page; an overview of the product which then leads you to the getting started.
- `getting-started.md`: Get up-and-running with the product; the main use case or onboarding steps so a user can get started. This is the most important how-to

Afterwards, you can start adding:

- how-to guides
- reference topics
- tutorials
- support/troubleshooting topics

The exact top-level buckets we use for the ToC can vary depending on the product and the context.

### End of page

You can use a "Next steps" section at the end of tutorials or how-tos, but use a "More info" section at the end of any other topics, if needed.

## Headings

- Use [ATX headings](https://github.github.com/gfm/#atx-headings), and include a line space after each heading.
- Use sentence-style casing: Only capitalize the first word of titles and any proper nouns. When in doubt, use lowercase. This ensures:
  - Improved readability and scanning (yes, backed by evidence)
  - Improved accessibility
  - More conversational and casual tone
  - Consistencty and ease of implementation]
- When linking to a page, try have the link text match the H1, unless you're using a shortened form as part of a sentence.
- For table of contents (ToC) headers, try to make them match the H1 unless you need to shorten for space, or shorten to reduce redundancy
  of terms.

## Indentation

Use 2-space indents for bulleted lists, and 4-space indents for numbered lists. Use 2-space indents for YAML files.

## Lists

- Periods for bulleted lists: consistency is key. All items should have a period if they're complete sentences. Try not to mix sentences
  with 1 or 2-word bullets.

## Code blocks

Use fenced code blocks. Make sure to include a language flag.

## Active language

Use active language whenever possible.

## UI elements

Use **bold** for UI elements. Use *italic* for emphasis. Use back ticks for code phrases and other non-English terms.

Don't use "the button". Say "Click **Next**." You *click* UI items but you *select* from drop-downs.

## Word choices

- Don't say please. Don't use ampsersands.
- Use sign in, not log in.
  - One word for adjective (the signin page) and two words for verb (sign in to your account)

## Admonitions

Use them. Only use "Note:" if you have to include it somewhere it admonition can't go.

## Spacing

- Use *one* space after periods before the next word.
- Use line spaces between headers and paras, and when introducing elements like tables or lists.
