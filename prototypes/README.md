# Prototypes

Clickable prototypes of proposed changes to the Youth Justice Platform, built as plain HTML pages.

## Viewing and sharing

- Open a prototype by double-clicking `index.html` in its folder. It runs straight from your computer, with no server or internet connection needed.
- To share one, zip its folder and send it. Each folder contains everything it needs, and the person you send it to can open `index.html` the same way.
- Every page has a "Prototype" banner, with a link back to the list of screens.

## Folders

| Folder | What it is |
|---|---|
| `shared/current-pages/` | The live service's current pages, rendered from the app's real templates with example data and linked into a clickable flow. Every new prototype starts as a copy of this. |
| `shared/` (everything else) | The example data, the render scripts, and the records they produce. These are generated, so don't edit them by hand. |
| `<name>/` | One prototype per folder |

## Making or changing a prototype

Use Claude Code and run `/prototype`. It will:
- check whether `shared/current-pages` is out of date, and ask before re-rendering it
- ask which prototype you're working on, who it's for, and which screens change
- build the pages, then click through the flow to check it works

The rules it follows are in `prototypes/CLAUDE.md`, and the full process is in `.claude/skills/prototype/SKILL.md`.

## Commands

Run these from the repo root:

| Command | What it does |
|---|---|
| `npm run prototype:status` | Shows whether `shared/current-pages` is out of date with the app, the render scripts or the example data |
| `npm run prototype:capture` | Runs each example scenario through the real API and saves the results to `shared/example-data.json`. Needs the API running (`npm run start:dev`). |
| `npm run prototype:render` | Rebuilds `shared/current-pages` from the app's templates and the example data |
| `npm run prototype:check -- prototypes/<folder>` | Checks that a prototype folder is self-contained: every link works, nothing points outside the folder, and every page can be reached from `index.html` |
| `npm run prototype:compare` | Compares `shared/current-pages` with the running app (`npm run start:dev`) |

## Changes to the skills

The Claude skills in `.claude/skills/` each keep a `changelog.md`. After changing a skill, run `/skill-changelog` to record the change. Pull requests that change a skill without updating its changelog fail the "Skill changelogs" check.
