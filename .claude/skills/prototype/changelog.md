# Changelog: prototype

Newest first. Each branch adds one entry covering its changes compared with main. Entries are never edited once they reach main.

## 1.0.0 · 2026-11-09 · prototypes/e2e_workflow
<!-- skill-hash: 97c78a1cbebea1a6ab1b8b8a2fc7b5b57ac8d248 -->

### Added
- `/prototype` builds or edits static HTML prototype flows in `prototypes/<name>/` that open from file:// and work as a standalone zip.
- Baseline of current pages: `prototypes/shared/current-pages`, rendered from the app's real routes and Nunjucks templates using `example-data.json`, with API outputs captured from the real API and links and forms rewritten into a static flow.
- Check-in step: compares `render-manifest.json` with the app's latest commits and asks before re-rendering.
- Brief step: asks checkbox-style questions (prototype, audience, screens that change, example data).
- Build rules: copy the full flow from current pages; design priority is app conventions, then MOJ Frontend, then GOV.UK Frontend; GET forms; error states as separate pages; only the app's own UI JavaScript, as a classic script.
- Test run: `prototype:check` link check, `prototype:compare` against the live app (current pages only), and a browser click-through with screenshots.
- Hard rules: no references outside the folder, no links between prototypes, never hand-edit generated files, never invent example data.
