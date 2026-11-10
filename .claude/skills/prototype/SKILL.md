---
name: prototype
description: Build or edit an illustrative prototype flow of screens for the Youth Justice Platform, as static HTML pages in /prototypes that open straight from file://, with matching Nunjucks templates for developers. Also re-renders the shared baseline of current pages when the app has changed.
disable-model-invocation: true
version: 1.0.0
---

# Prototype a flow of screens

Prototypes are static HTML pages under `prototypes/<name>/` that show a proposed change to the service. Each one also has a `templates/` folder of Nunjucks templates that produce the same pages, so developers can build from them. Read `prototypes/CLAUDE.md` first: its rules apply to everything here.

The starting point for every prototype is `prototypes/shared/current-pages/`, a rendered copy of the live app's pages linked into a clickable flow.

## Step 0: check in about the current pages

Before anything else, check whether `shared/current-pages` is out of date.

1. Run `npm run prototype:status`. It compares a content hash of each source a render depends on with the one recorded in `render-manifest.json`. The sources are the app (`apps/frontend`, `apps/api`, `packages/shared-types`), the render scripts and `example-data.json`. For each changed source it lists the commits since the last render and notes any uncommitted changes.
2. If it suggests a re-render, summarise what changed for the user and **ask whether to re-render**. If it reports everything up to date, say so in one line and carry on.
3. Re-render only after the user agrees, using the steps below.

### Re-rendering the current pages

All of these run from the repo root. The scripts are in `prototypes/shared/scripts/`.

1. **Example data.** The pages and scenarios are defined in `prototypes/shared/example-data.json`.
   - If app changes mean pages or scenarios need adding or changing (a new route, a new form field, a new state), propose the change to the user.
   - **Never invent example values**: ask the user, or use values from the app's own test fixtures and say where they came from.
   - Each page has a `request` (the real route to run), `links` (app href → static file; a key ending in `*` matches by prefix), a `formAction` for pages with forms, and optional `compareIgnore` selectors for content that legitimately differs from the live app (like the current time).
2. **Start the app:** `npm run start:dev`, in the background. It runs the frontend on :3000 and the API on :3001.
3. **Capture API outputs:** `npm run prototype:capture`. This posts each valid scenario to the real API and stores the response as `apiOutput`.
4. **Render:** `npm run prototype:render`. It builds the frontend, runs each page's request through the real routes, saves each template context to `shared/page-contexts/`, renders the real Nunjucks templates, and then rewrites the HTML into a static flow. That includes swapping the app's ES-module script for a classic-script build at `assets/js/index.js`. If it stops on an unmapped link or a form with no `formAction`, add the mapping to `example-data.json`. Don't loosen the script.
5. **Test run.** All three checks must pass before you report the render as done:
   - `npm run prototype:check -- prototypes/shared/current-pages`
   - `npm run prototype:compare`, which diffs each page's `<main>` text and form state against the live app
   - a browser click-through (see [Browser click-through](#browser-click-through))
6. Stop the dev servers, then show the user what changed.

## Step 1: brief

Ask with a single `AskUserQuestion` call: checkbox-style questions, not prose. Build the options from what's really there: the folders in `prototypes/`, the pages in `shared/current-pages/index.html`, and the scenarios in `example-data.json`. Skip any question the user has already answered. Ask these four:

1. **Prototype** (single choice): each existing prototype folder, to edit it, plus "New prototype". The user names a new one in "Other", and you turn it into a kebab-case folder name.
2. **Audience** (multiple choice): user research, stakeholder or policy review, handover to developers, design exploration.
3. **Screens that change** (multiple choice): the current pages from the index. Group them if there are more than four, e.g. the form with its edit and error variants. Ask the user to describe the change, and any new screens and where they sit in the flow, in the notes or "Other".
4. **Example data** (single choice): use the existing scenarios in `example-data.json` (name them), "I'll provide the values", or "Ask me for each new value as you build". Never invent values.

Follow up in a second `AskUserQuestion` call, still as checkboxes where possible, only for gaps the answers leave. For example, if the change description is missing, list likely changes as options and let "Other" take the rest.

If the chosen prototype folder already has pages, you're editing it. Read them before changing anything.

## Step 2: build the pages

1. For a new prototype, copy `prototypes/shared/current-pages/` **wholesale** into `prototypes/<name>/`, including the `assets/` folder. Every prototype carries the full flow and everything needed to open it.
2. Edit, add or remove pages by hand. Keep the copied pages' structure (header, prototype banner, footer, `assets/css/index.css`) so new pages match.
3. Base new markup on, in this order:
   1. **The app's current conventions.** Copy markup patterns from the existing pages and the app's templates (`apps/frontend/server/views/`), and use its custom classes (`apps/frontend/assets/scss/`).
   2. **MOJ Frontend** components (`@ministryofjustice/frontend`, v11).
   3. **GOV.UK Frontend** components (`govuk-frontend`, v6).

   Use each component's rendered HTML as published in its design system docs or produced by its Nunjucks macro. `assets/css/index.css` already contains all of GOV.UK Frontend and MOJ Frontend, so no extra CSS is usually needed. If some is, add it to a new file in the prototype's own `assets/` and link it relatively.
4. Navigation:
   - **Forms use `<form method="get" action="next-page.html">` with a real `<button>`.** A form can only go to one page, so each branch or error state is its own page (e.g. `check-answers-error.html`), reachable from `index.html`.
   - **JavaScript is only the app's own UI script.** Every page ends with the GOV.UK inline `js-enabled` script and `<script src="assets/js/index.js"></script>`. That file is a classic-script build of the frontend's entry point, which initialises GOV.UK and MOJ components through `data-module` attributes, so components like tabs work as in the live app.
     - Never write custom JavaScript.
     - Never use `type="module"` scripts: browsers block them from file://.
     - Never fake behaviour with scripts. Show a different state as its own page.
5. Use realistic content: the same example people, dates and values throughout the flow, so the screens tell one consistent story.
6. Write each new page's markup the way its template will render it (Step 3), so the two can match: the exact HTML each GOV.UK or MOJ macro produces, and a real `<form>` and `<button>` wherever the app would post. Where a link has no page in the prototype (e.g. other rows in a list), keep the link with `href="#"` rather than dropping it.

## Step 3: templates

Do this by default, for every prototype. Skip it only if the user asks not to have templates.

1. In `prototypes/<name>/templates/`, mirror `apps/frontend/server/views/`:
   - `pages/` and `partials/` hold only **new or changed** templates. Unchanged app pages need none.
   - For a **changed** page or partial, copy the app's file and change only what the prototype changes, so a diff against `apps/frontend` shows the change. Keep its name and its relative `extends` and `include` paths. Without the new context it should render as the app does now.
   - For a **new** page, extend `../partials/layout.njk`. Follow the app's templates: set `pageTitle` and `mainClasses`, build components with GOV.UK and MOJ Nunjucks macros, and take every value from the context. Don't hard-code example data. Put shared pieces in partials or macros, e.g. a status tag used on several pages.
   - Links and form actions point at the routes the app would have, such as `/cases/{{ case.id }}`, not the static files. Forms that change state use `method="post"`.
2. For each static page that a template renders, write `templates/contexts/<page>.json` as `{ "view": "pages/<template>", "context": { ... } }`. This holds the data the route would pass to `res.render`.
   - Use the same values as the static page.
   - Leave out the app's own locals (`applicationName` and so on), since they're added at render time.
   - For a changed app page, start from that page's context in `shared/page-contexts/` and add to it.
3. Run `npm run prototype:templates -- prototypes/<name>`.
   - It renders each context's view on top of the app's views (the prototype's templates first, then `apps/frontend/server/views`, GOV.UK Frontend and MOJ Frontend), using the app's locals and filters.
   - It compares the result's `<body>` with the static page element by element: tags, attributes and text. It ignores `href`, `action`, `method`, `src`, scripts, `[hidden]` elements and the prototype banner.
   - It must pass. When a page differs, decide which side is wrong. Usually it's hand-written markup that doesn't match a macro, or a template bug. Fix that side; don't make the template copy a mistake.
4. Write `templates/README.md` for developers:
   - a table of each template, whether it's new or changed, and which static pages use it
   - how to diff a changed template with the app's copy
   - what the contexts hold, including which values are placeholders or fixtures
   - what the templates don't cover: routes that don't exist yet, and any CSS in the prototype's `assets/` that belongs in `apps/frontend/assets/scss/`

## Step 4: banner and index

- Update the prototype banner on every page: say what this prototype is, and keep the `index.html` link.
- Rewrite `index.html`: the prototype's name, what it illustrates, the screens in flow order (each with a one-line description), and any separate error or branch pages.

## Step 5: test run

1. `npm run prototype:check -- prototypes/<name>` must pass. It checks for:
   - broken, absolute or external references
   - `type="module"` scripts
   - links that leave the folder
   - broken `#` anchors
   - pages that can't be reached from `index.html`
2. `npm run prototype:templates -- prototypes/<name>` must pass, unless the user asked for no templates.
3. Do a browser click-through of the new flow (see below).
4. Report the results and the screenshots to the user. Point them at `prototypes/<name>/index.html` to open, and at `templates/README.md` for developers.

`prototype:compare` only applies to `shared/current-pages`, since a prototype differs from the live app on purpose.

## Browser click-through

Open `file://<repo>/prototypes/<folder>/index.html` and click through the whole flow as a user would:
- every link and button
- submit each form
- each error or branch page from the index

At each step check:
- the right page loads
- GOV.UK styles and fonts are applied
- no images are missing
- the console shows no errors
- interactive components such as tabs work

Take screenshots of the key screens.

Use Claude in Chrome if it's available. If not, drive the user's installed Chrome with `playwright-core`, installed in a temporary directory, not the repo:
- set up: `npm i playwright-core` in that directory
- launch: `chromium.launch({ channel: 'chrome' })`
- log `requestfailed` and console `error` events, and save full-page screenshots
- ignore `net::ERR_ABORTED` on `favicon.svg`: Chrome cancels the favicon fetch when the script moves to the next page quickly

## Hard rules

- A prototype folder must work when zipped on its own and opened from file://:
  - no `../` out of the folder
  - no absolute `/` paths
  - no external assets (outbound `<a>` links to other websites are fine)
  - no links to other prototype folders
- Never hand-edit `shared/current-pages`, `shared/page-contexts` or `shared/render-manifest.json`. They are only changed by re-rendering, after checking in with the user.
- Don't change app code under `apps/` or `packages/` to make a prototype work. Changed templates live in the prototype's `templates/` folder, never in the app.
- Keep the templates and the static pages in step. After any change to either, run `prototype:templates` again.
