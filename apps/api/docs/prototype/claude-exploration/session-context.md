# Session context: AssetPlus transfer investigation

A summary of the working context for this task, so that a later session (human or Claude) can pick it up. It deliberately leaves out restricted material: there are no quotes, requirement text or detail from the documents in `restricted-documents/`. For findings, see the files listed under "Outputs".

Written 2026-11-19, on branch `api-footprint-prototypes`.

## The task

- Investigate how the AssetPlus transfer process can be improved.
- Write a high-level description of how the process works today.
- The end goal is to map out the API routes needed and make sure they cover all current functionality.
- Suggest areas of scope we may have missed, and give a variety of approaches to choose from.
- Ask questions to develop the plan.
- Cite a source for every fact and clearly mark speculation.
- Keep edits to this folder (`apps/api/docs/prototype/claude-exploration/`).
- Record documents used in `documents-list.md`, with their locations.

## Decisions from the team (2026-11-19)

| Topic | Decision |
| :-- | :-- |
| Output format | Markdown with Mermaid diagrams |
| Target architecture | **Central store**: the YJB platform holds the record, rather than case management systems (CMSs) messaging each other |
| Parties in scope | **YOT ↔ Secure Estate** mapped in full. YOT ↔ YOT and YOT → Probation noted as adjacent scope only |
| De-scoped legacy requirements | Not treated as current functionality. `../swagger.yaml` is the statement of intent for the new API |
| Relationship to `../swagger.yaml` | Draft the new routes in a separate OpenAPI file in this folder. Don't edit `../swagger.yaml` |
| YJB Placement Service | **In scope.** Placements and the Secure Estate currently use the same AssetPlus client system. In future we'd like them to be able to use different client systems |
| Other source documents | Work only from the documents already in this folder for now |

## Inputs

- The restricted source documents are in `restricted-documents/`. They're listed by title in `documents-list.md`; see that file for versions and locations.
- `../swagger.yaml` (v0.0.2) is the draft of the intended API. Its routes are: `/children` (GET, POST), `/children/search`, `/children/{ypid}`, `/children/{ypid}/stages`, `/children/{ypid}/stages/{stageid}` (GET, PATCH, PUT).
- `../todo.md` holds open design notes. One notes that a child can currently have more than one AssetPlus record.

## Outputs in this folder

| File | Contents | Contains restricted-derived material? |
| :-- | :-- | :-- |
| `documents-list.md` | Documents used, plus documents referenced but not available | Titles, versions and dates only |
| `current-process.md` | Sourced description of today's process, with Mermaid diagrams | **Yes**: paraphrases, short quotes and controlled values |
| `api-scope-and-options.md` | Coverage table, missed scope, design options A–H, suggested changes to `../swagger.yaml`, open questions | **Yes**: paraphrases and citations |
| `proposed-transfer-api.yaml` | OpenAPI 3.0.4 draft of **new routes only**. It references `MinimalChild` from `../swagger.yaml` and marks speculative parts `x-speculative: true` | **Yes**: short quotes and citations in descriptions |
| `session-context.md` | This file | No |

The quotes and phrases from restricted documents in these files were flagged to the team on 2026-11-19, grouped into: sentence-length quotes, short phrases, and controlled values/labels. **No decision has been made yet** on whether to paraphrase or remove them before committing.

## Routes proposed (summary)

All of these are in `proposed-transfer-api.yaml`. The recommended options from `api-scope-and-options.md` shape them:
- organisations
- transfers: request, list, inbox, accept, reject, end
- stage status changes: complete, stop, cancel, reopen
- review of stages shared by the other party, plus a review inbox
- a stage change comparison, as JSON or PDF
- stage attachments
- placement requests and decisions (speculative)
- merging duplicate records
- reference data lists
- webhook subscriptions (optional)

## Conventions used

- Citation format: `[<doc short ref> L<line> <requirement ID>]`. Line numbers refer to the `.md` copies. Team decisions are cited as `[User 2026-11-19]`.
- Speculation is marked with `⚠️ Speculation:` in markdown and `x-speculative: true` in the yaml.
- New API conventions follow `../swagger.yaml`: integer `ypid`, GUID `stageid`, 409 instead of 404 for ID mismatches, and no personal data in query strings. They add a `422` response whose `rule` field gives the broken requirement ID.

## Verification done

- I parsed the yaml locally: it loads, all 35 `$ref`s resolve (including those into `../swagger.yaml`), and every path parameter is declared.
- A full lint with `npx @redocly/cli` was blocked in this session and hasn't been run.
- I spot-checked about 40 citations against the source line numbers.
- The Mermaid diagrams haven't been rendered.

## Outstanding items

1. **A restricted document is staged in git.** Unstage it before any commit.
2. Decide how to handle the restricted-derived quotes in the output files.
3. A stray `~/.nvm/` folder exists inside this folder, probably from a shell command that used a literal `~`. The team hasn't cleaned it up yet.
4. Nothing from this task is committed. The repository `.claude/CLAUDE.md` was updated with general working instructions from this session (and later edited by the team).
5. Key decisions still open (see `api-scope-and-options.md` §5 for the full list):
   - how shared stages are reviewed in a central store (option B)
   - how the Placement Service actually works today (option D)
   - the shape of the stage payload, which needs documents we don't have (option E)
