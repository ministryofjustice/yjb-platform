# Prototypes

Illustrative flows of screens for the Youth Justice Platform, built as static HTML. To create or substantially change a prototype, use the `/prototype` skill (`.claude/skills/prototype/SKILL.md`). The rules below apply to any change under this folder, including quick edits.

## Layout

- `shared/`: the baseline, generated from the live app. Not a prototype.
  - `current-pages/`: the app's current pages, rendered from its real templates and linked into a static flow. New prototypes start as a copy of it.
  - `example-data.json`: the scenarios (form inputs and captured API outputs) and page definitions the render uses.
  - `page-contexts/`: the JSON context each page's template was rendered with.
  - `render-manifest.json`: the commits of the app sources the last render used.
  - `scripts/`: render, capture, link-check and compare scripts, run via the `npm run prototype:*` scripts in the root package.json.
- `<name>/`: one folder per prototype, each with its own `index.html` and `assets/`.

## Rules

- **Self-contained.** Each prototype folder must work as a zip sent to someone:
  - every page, stylesheet, font and image is inside the folder and linked with a relative path
  - no `../` out of the folder, no absolute `/` paths, no external assets
  - never link between prototype folders
  - outbound `<a>` links to other websites are fine
- **Opens from file://.** Pages are never served. Use no JavaScript (render components in their no-JS state) and no fetches.
- **Navigation.** Forms use `<form method="get" action="next-page.html">` with a real `<button>`. Error states and branches are separate pages. Every page can be reached from the folder's `index.html`, and every page carries the prototype banner linking back to it.
- **Design priority:**
  1. the app's current conventions (existing pages, `apps/frontend` templates and SCSS)
  2. MOJ Frontend
  3. GOV.UK Frontend
- **Example data is never invented.** Ask the user, or use the app's test fixtures and say so.
- **`shared/` is generated.** Don't hand-edit `current-pages/`, `page-contexts/` or `render-manifest.json`. Re-render only through `/prototype`, and only after checking with the user.
- After any change, run `npm run prototype:check -- prototypes/<folder>`.
