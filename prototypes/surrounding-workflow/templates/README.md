# Templates: surrounding workflow

Nunjucks templates for this prototype's new and changed pages, laid out like `apps/frontend/server/views/` so they can be copied straight in. `npm run prototype:templates -- prototypes/surrounding-workflow` renders each one and checks it produces the same page as the static HTML.

## What's here

| File | Status | Used by |
| --- | --- | --- |
| `partials/layout.njk` | Changed | Every page. Adds the primary navigation under the header when a page sets `primaryNavigation`. |
| `partials/primary-navigation.njk` | New | Caseload and Notifications, with an unread count from `unreadNotifications` |
| `partials/case-status-tag.njk` | New | `caseStatusTag(status)` macro: `first-calculation-needed`, `check-needed`, `mismatch`, `checked` |
| `pages/caseload.njk` | New | `dashboard.html` |
| `pages/notifications.njk` | New | `notifications.html` |
| `pages/case.njk` | New | `case-first-calculation.html`, `case-check-calculation.html` (the next action depends on `case.status`) |
| `pages/new-calculation.njk` | Changed | `case-calculate*.html`, `case-check-calculate*.html`. Unchanged without `case`. |
| `pages/calculation-breakdown.njk` | Changed | `case-results.html`, `case-check-results.html`. Unchanged without `case`. |
| `pages/calculation-saved.njk` | New | `calculation-saved.html` |
| `pages/check-comparison.njk` | New | `check-match.html`, `check-mismatch.html` (the outcome follows from `comparison.rows`) |
| `pages/check-complete.njk` | New | `check-complete.html` |

To see what a changed template changes, diff it with the app's copy, e.g. `diff apps/frontend/server/views/pages/new-calculation.njk prototypes/surrounding-workflow/templates/pages/new-calculation.njk`.

## Contexts

`contexts/<page>.json` holds the view and the data each static page was rendered with, i.e. what its route would pass to `res.render`. The app's own locals (`applicationName` and so on) are added at render time. Every page also gets `user` and `unreadNotifications`, which would come from middleware.

Values in square brackets are placeholders, not example data. The sentence and calculated dates are the app's test fixture (`apps/api/routes/sentenceCalculator.test.ts`).

## Not in the templates

- **Routes and links.** Hrefs and form actions point at routes the app doesn't have yet (`/cases/:id`, `/cases/:id/calculate`, `/cases/:id/check`, `/notifications`). Forms that change state use `POST`.
- **Styles.** `app-count-card` and `app-notification` are in the prototype's `assets/css/prototype.css`. They belong in a new file under `apps/frontend/assets/scss/components/`.
