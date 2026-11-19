# Session context: AssetPlus transfer investigation

A summary of the working context for this task, so that a later session (human or Claude) can pick it up. It deliberately leaves out restricted material: there are no quotes, requirement text or detail from the documents in `restricted-documents/`. For findings, see the files listed under "Outputs".

First written 2026-11-19 on branch `api-footprint-prototypes`. Updated later the same day, after the first commit and after more source documents were added.

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
| Other source documents | Work only from the documents in `restricted-documents/` and the other files listed in `documents-list.md` |

## Inputs

- The restricted source documents are in `restricted-documents/`, which git ignores. `documents-list.md` lists them by title, with versions and locations.
- On 2026-11-19 the team added three more sources, which earlier outputs did not use [User 2026-11-19]:
  - the AP 03 Data Items workbook (v5.0)
  - the AssetPlus Prototype workbook (v8.4.1 DRAFT)
  - the AssetPlus XSD files (v12.0.0)
- `../swagger.yaml` (v0.0.2) is the draft of the intended API. Its routes are:
  - `/children` (GET, POST)
  - `/children/search`
  - `/children/{ypid}`
  - `/children/{ypid}/stages`
  - `/children/{ypid}/stages/{stageid}` (GET, PATCH, PUT, DELETE). DELETE was added in commit `2234377`, after the outputs here were written.
- `../todo.md` holds open design notes. One notes that a child can currently have more than one AssetPlus record.

## Outputs in this folder

| File | Contents | Contains restricted-derived material? |
| :-- | :-- | :-- |
| `documents-list.md` | Documents used, documents still missing, and gaps between the sources | Titles, versions and dates only |
| `current-process.md` | Sourced description of today's process, with Mermaid diagrams | **Yes**: paraphrases, short quotes and controlled values |
| `api-scope-and-options.md` | Coverage table, missed scope, design options A–H, suggested changes to `../swagger.yaml`, open questions | **Yes**: paraphrases and citations |
| `proposed-transfer-api.yaml` | OpenAPI 3.0.4 draft of **new routes only**. It references `MinimalChild` from `../swagger.yaml` and marks speculative parts `x-speculative: true` | **Yes**: short quotes and citations in descriptions |
| `session-context.md` | This file | No |

The first four files were committed in `2566f35` before the team decided how to handle the quotes from restricted documents (see outstanding item 1).

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

- Citation formats:
  - AP02 and AP06: `[<doc short ref> L<line> <requirement ID or §section>]`. Line numbers refer to the `.md` copies.
  - The workbooks: `[AP03 '<sheet>' <cell or row>]` and `[PROTO '<sheet>' <cell or row>]`.
  - The schema files: `[<xsd file name> L<line>]`.
  - Team decisions: `[User 2026-11-19]`.
- Speculation is marked with `⚠️ Speculation:` in markdown and `x-speculative: true` in the yaml.
- New API conventions follow `../swagger.yaml`: integer `ypid`, GUID `stageid`, 409 instead of 404 for ID mismatches, and no personal data in query strings. They add a `422` response whose `rule` field gives the broken requirement ID.

## Verification done

- I parsed the yaml locally: it loads, all 35 `$ref`s resolve (including those into `../swagger.yaml`), and every path parameter is declared.
- A full lint with `npx @redocly/cli` was blocked in the first session and hasn't been run.
- In the first session I spot-checked about 40 citations against the source line numbers.
- The team re-supplied AP02 and AP06 on 2026-11-19. I re-checked 17 citations against the new copies and all of them still match.
- Git history has been checked: no file from `restricted-documents/` has ever been committed.
- The Mermaid diagrams haven't been rendered.

## Outstanding items

1. **Quotes from restricted documents are committed.** `2566f35` contains the sentence-length quotes, short phrases and controlled values flagged to the team on 2026-11-19. The decision on whether to paraphrase or remove them is still open. Changing them now won't remove them from history unless that commit, which hasn't been pushed, is rewritten.
2. **The new sources haven't been used yet.** The AP 03 workbook, the Prototype workbook and the XSDs are listed in `documents-list.md` but not yet worked into the other outputs. The most important follow-ups:
   - AP06 describes schema v2-0, but the XSDs are v12.0.0. Re-check what AP06 says about the payload against the XSDs, and use them to work on option E (the shape of the stage payload).
   - The v12 set has no `SupplierData.xsd`. This feeds open question Q6.
   - Check whether AP 03 or the Prototype has the stage trigger rules that are missing from AP02.
   - Update the "not available" points in `current-process.md` and `api-scope-and-options.md` (e.g. open question Q7 and §2 item 21) to reflect the new documents.
3. **The new DELETE stage route isn't in the analysis yet.** `DELETE /children/{ypid}/stages/{stageid}` in `../swagger.yaml` needs adding to coverage item F4 and option H in `api-scope-and-options.md`. The key question is whether it is a soft "cancel" that keeps the audit trail, or a hard delete. The route also has some wording issues; suggestions were given to the team on 2026-11-19 and haven't been applied, since that file is outside this folder.
4. Key decisions still open (see `api-scope-and-options.md` §5 for the full list):
   - how shared stages are reviewed in a central store (option B)
   - how the Placement Service actually works today (option D)
   - the shape of the stage payload (option E), which the v12 XSDs and AP 03 now make possible to work out
5. Earlier items now closed:
   - the restricted document that was staged was never committed
   - the stray `~/.nvm/` folder has been removed
   - the work has been committed
