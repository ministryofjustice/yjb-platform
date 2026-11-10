# Changelog: prototype

Newest first. Each branch adds one entry covering its changes compared with main. Entries are never edited once they reach main.

## 1.0.0 · 2026-11-10 · prototypes/e2e_workflow
<!-- skill-hash: aec218bf36f7b9d81dd09686b8f730f478c65d49 -->

### Added
- `/prototype` builds or edits static HTML prototype flows in `prototypes/<name>/` that open from file:// and work as a standalone zip.
- Baseline of current pages: `prototypes/shared/current-pages`, rendered from the app's real routes and Nunjucks templates using `example-data.json`, with API outputs captured from the real API and links and forms rewritten into a static flow.
- Check-in step: `npm run prototype:status` compares content hashes of the app, the render scripts and `example-data.json` with those recorded at the last render, and the skill asks before re-rendering.
- Brief step: asks checkbox-style questions (prototype, audience, screens that change, example data).
- Build rules: copy the full flow from current pages; design priority is app conventions, then MOJ Frontend, then GOV.UK Frontend; GET forms; error states as separate pages; only the app's own UI JavaScript, as a classic script.
- Templates step, on by default: Nunjucks templates for new and changed pages in `prototypes/<name>/templates/`, mirroring `apps/frontend/server/views/`, with a context JSON per static page and a developer README.
- Test run: `prototype:check` link check; `prototype:templates`, which renders each template with its context and checks it matches the static page element by element; `prototype:compare` against the live app (current pages only); and a browser click-through with screenshots.
- Hard rules: no references outside the folder, no links between prototypes, never hand-edit generated files, never invent example data, templates and static pages kept in step.
