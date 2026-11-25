# Session context: AssetPlus transfer investigation

A summary of the working context for this task, so that a later session (human or Claude) can pick it up. It deliberately leaves out restricted material: there are no quotes, requirement text or detail from the documents in `restricted-documents/`. For findings, see the files listed under "Outputs".

First written 2026-11-19 on branch `api-footprint-prototypes`. Updated:

- twice more on 2026-11-19, after the first commit and the arrival of new source documents, and after working them into the outputs
- on 2026-11-23, after a design session (a "grill") that settled most of the open design options
- on 2026-11-24, after a terminology change, a second design session on the transfer routes, and changes to `../swagger.yaml`. See "Work on 2026-11-24"

## The task

- Investigate how the AssetPlus transfer process can be improved.
- Write a high-level description of how the process works today.
- The end goal is to map out the API routes needed and make sure they cover all current functionality.
- Suggest areas of scope we may have missed, and give a variety of approaches to choose from.
- Ask questions to develop the plan.
- Cite a source for every fact and clearly mark speculation.
- Keep edits to this folder (`apps/api/docs/prototype/claude-exploration/`). Changes to `../swagger.yaml` are proposed as `.patch` files here, which the user applies.
- Record documents used in `documents-list.md`, with their locations.

Working rules for Claude (terminology, citations, markdownlint, REST style, commit messages and signing) are in the project's `.claude/CLAUDE.md`.

## Decisions from the team (2026-11-19)

| Topic | Decision |
| :-- | :-- |
| Output format | Markdown with Mermaid diagrams |
| Target architecture | **Central store**: the YJB platform holds the record, rather than case management systems (CMSs) messaging each other |
| Parties in scope | **YJS ↔ Secure Estate** mapped in full. YJS ↔ YJS and YJS → Probation noted as adjacent scope only |
| De-scoped legacy requirements | Not treated as current functionality. `../swagger.yaml` is the statement of intent for the new API |
| Relationship to `../swagger.yaml` | Draft the new routes in a separate OpenAPI file in this folder. Don't edit `../swagger.yaml` directly. **Since 2026-11-24:** changes to it are proposed as patches in this folder |
| YJB Placement Service | **In scope.** Placements and the Secure Estate currently use the same AssetPlus client system. In future we'd like them to be able to use different client systems |
| Other source documents | Work only from the documents in `restricted-documents/` and the other files listed in `documents-list.md` |
| Quotes from restricted documents | The quotes, phrases and controlled values committed in `2566f35` are **acceptable**. Don't raise them again. Keep using short quotes and citations in the same way |

## Decisions from the design session (2026-11-23)

The user answered 48 questions (Q1–Q48), one at a time. Where options were offered, the one closest to standard REST was labelled, because the user prefers standard HTTP means where possible. The full record is in `.grill-me/`, which git ignores:

- `assetplus-api-design-20261123T1315-summary.md`: the readable summary
- `assetplus-api-design-20261123T1315.json`: the design tree

The headline decisions:

| Topic | Decision |
| :-- | :-- |
| System of record | Central store, **agreed with YJB**. CMSs keep a local copy where practitioners work. The platform's copy is what other organisations rely on |
| Writes | The CMS saves first, then pushes. `ETag`/`If-Match`; the platform rebases stale pushes; a conflict on the same field gets `412`; retries use `Idempotency-Key` |
| Stage lifecycle | No transitions API. `POST` creates, `PATCH` saves a partial, and an **accepted `PUT` completes** the stage. A soft `DELETE` with a reason code cancels it. No stop and no reopen |
| Sign-off | Two people, in the CMS. The v12 countersignatures are trusted. The CMS locks a stage once it sends the `PUT`. Any fix or rebase needs a new sign-off |
| Records | One per child; stages stay flat. CMSs report duplicates; only YJB merges. A merged-away `ypid` returns `308` |
| Schema versions | A `schema_version` field; no migration; a grace period after each annual change |
| Review | Option B1. Stages under review are visible to all. The Home YJS is the hub in three-way cases |
| Placement Service | Its own web UI on an internal API. The public API only lets a YJS start a placement and follow it |
| Other | Inbox plus optional webhooks; a public `/history`; attachments follow the stage, with asynchronous scanning; an AP06 adapter for migration; YJB maintains the organisations list |

Seven inferences in the summary are still to be confirmed (`api-scope-and-options.md` Q21). Non-functional requirements weren't covered, by the user's choice.

## Work on 2026-11-24

### Terminology

"Youth Offending Team" (YOT) is deprecated. Every Claude-written document now says "Youth Justice Service" (YJS), and treats the two as equivalent. Source text keeps the original wording: quotes, sheet and heading names, controlled values, stage-type names and schema element names. The rule is in `.claude/CLAUDE.md`.

### Design session on the transfer routes

The user answered 12 questions on whether the transfer routes in `proposed-transfer-api.yaml` are needed (option A had never been discussed). The record is in `.grill-me/transfers-endpoints-necessity-20261124T1200-summary.md` and the matching JSON. Cited as `[User 2026-11-24 grill Qn]`.

| Topic | Decision |
| :-- | :-- |
| Transfer model | Option A1: a transfer resource with status `requested → accepted / rejected → ended` |
| Status changes | One `PATCH /transfers/{id}` replaces the accept, reject and end routes. `If-Match` is required; a stale one gets `412` (no rebase) and a missing one `428`; `Idempotency-Key` as for stages |
| Secure establishments | Must accept or reject the transfer the platform creates from a placement decision. A rejection sends the placement request back to the Placement Service (`rejected_by_establishment`), with its own reason list |
| Creating transfers | `POST /children/{ypid}/transfers` is speculative and YJS↔YJS only. A direct transfer to a secure establishment gets `422` (rule SE001) |
| Read routes | The inbox, a single transfer, and the child's list of transfers all stay. The child resource carries no transfer summary or custody indicator |
| Ending SE caretaking | Open, for YJB (Q24). Until then the Home YJS can end it, marked speculative |

### Changes to `../swagger.yaml`

The user chose, item by item, which recommendations to apply. Three patches in this folder hold them, and were applied in commit `6feec52`:

1. `swagger-recommended-changes.patch`: the stage-route decisions of 2026-11-23 (fields and `422` on `POST`, completing `PUT`, soft-cancel `DELETE`, concurrency headers and responses, new `Stage` fields, wording fixes).
2. `swagger-shared-responses.patch`: 8 shared response components; "CYPID" corrected to "OYPID"; `POST /children` rejects any `ypid` that isn't absent or null.
3. `swagger-shared-schemas.patch`: shared `DateOfBirthAccuracy`, `StageId` and `Ypid` schemas; fixes Redocly's `spec` errors.

**Not applied**, by the user's choice: schema-version rules, `308` for merged children, `GET …/stages` filters, `403` wording for caretakers, and `proxy_owner`. They're listed in `proposed-transfer-api.yaml` ("Changes made to `../swagger.yaml`") and `api-scope-and-options.md` §4.

### Other changes

- Open questions Q17 (cancellation codes), Q19 (three-way review), Q22 (attachment limits), Q24 (ending SE caretaking) and Q25 (SE rejection reasons) are marked for YJB.
- `proposed-transfer-api.yaml` now refers to `StageStatus` and `Stage` in `../swagger.yaml`, instead of keeping its own copies.

## Inputs

- The restricted source documents are in `restricted-documents/`, which git ignores. `documents-list.md` lists them by title, with versions and locations:
  - AP 02 requirements (v5.0)
  - AP 03 data dictionary workbook (v5.0)
  - AP 06 case transfer schema specification (v2.0)
  - AssetPlus Prototype workbook (v8.4.1 DRAFT)
  - the 11 AssetPlus XSD files (v12.0.0)
- The user has said that Claude may read the restricted originals directly when it needs them.
- `../swagger.yaml` (v0.0.2, changed in `6feec52`) is the draft of the intended API. Its routes are:
  - `/children` (GET, POST)
  - `/children/search`
  - `/children/{ypid}`
  - `/children/{ypid}/stages` (GET, POST)
  - `/children/{ypid}/stages/{stageid}` (GET, PATCH, PUT, DELETE)
- `../todo.md` holds open design notes. One notes that a child can currently have more than one AssetPlus record.

## Outputs in this folder

| File | Contents | Contains restricted-derived material? |
| :-- | :-- | :-- |
| `documents-list.md` | Documents used, documents still missing, and gaps between the sources | Titles, versions and dates, plus a few counts and enumeration names |
| `current-process.md` | Sourced description of today's process, with Mermaid diagrams, cross-checked against the v12 XSDs and AP 03 | **Yes**: paraphrases, short quotes and controlled values |
| `api-scope-and-options.md` | Coverage table (F1–F32), missed scope (§2 items 1–26), design options A–J, changes to `../swagger.yaml` (§4, marked made or not made), open questions Q1–Q25 | **Yes**: paraphrases and citations |
| `proposed-transfer-api.yaml` | OpenAPI 3.0.4 draft (v0.0.4-draft) of new routes. Its description summarises the changes made to `../swagger.yaml`, those still recommended, and the departures from the current process. It refers to `MinimalChild`, `Stage` and `StageStatus` in `../swagger.yaml`, and marks speculative parts `x-speculative: true` | **Yes**: short quotes and citations in descriptions |
| `swagger-recommended-changes.patch`, `swagger-shared-responses.patch`, `swagger-shared-schemas.patch` | The three patches applied to `../swagger.yaml` in `6feec52`, each with notes at the top | No |
| `.grill-me/` (git-ignored) | The 2026-11-23 and 2026-11-24 design sessions: summaries and JSON design trees | **Yes**: citations |
| `session-context.md` | This file | No |

## Routes proposed (summary)

All of these are in `proposed-transfer-api.yaml`:

- organisations: list, and fetch one by OU code (read-only; YJB maintains them)
- transfers: list a child's transfers, an inbox, fetch one, and `PATCH` to accept, reject or end. Creating one directly is speculative and YJS↔YJS only
- a stage's audit history
- review of stages shared by the other party, plus a review inbox
- a stage change comparison, as JSON or PDF
- stage attachments: list, upload (asynchronous scan), fetch or download, and remove
- placement requests: start one and follow its status, including rejections by establishments (the rest is internal)
- duplicate reports, and merging (YJB only)
- reference data lists, including cancellation, duplicate-report and SE transfer rejection reasons
- webhook subscriptions (optional; the inboxes are the source of truth)

Status changes to stages happen through the stage routes in `../swagger.yaml`.

## Main findings from the new sources (2026-11-19)

Detail and citations are in `current-process.md` §3–§6 and `api-scope-and-options.md`.

- **AP 06 describes an old schema.** It covers schema v2-0 (2014); the XSDs are v12.0.0 (2026), with a release most years. Differences that matter:
  - The message types use Accept/Reject rather than Acknowledged/Rejected.
  - There's a single list of rejection reasons.
  - Attachments are listed in a per-stage attachment index instead of `Unstructured_Data`.
  - There's a stage index that tells the receiver about every stage, including stopped and cancelled ones.
- **Caretaking statuses aren't in the schema.** They're local to each CMS.
- **Supplier data.** AP 03 defines 109 supplier-data items, but the v12 schema has no SupplierData structure.
- **Countersignatures and case types.** Each stage has two countersignatures, and a case type that limits which stage types are allowed.
- **Placement data.** The schema carries the YJS's placement *recommendation* by establishment type. It has no field for the Placement Service's decision.
- **Organisations.** Only YJS OU codes are listed (AP 03, as of 2014). Secure establishments and the Placement Service have no codes in any source.
- **Still missing:**
  - the stage→module trigger table
  - a data dictionary that matches v12
  - the non-functional requirements
  - the Interface Control Document (ICD)
  - the transfer flows document
- **`DELETE …/stages/{stageid}`.** As first drafted it was a hard delete, which didn't meet the cancel requirement. Decided 2026-11-23 as option I2, a soft cancel; **made 2026-11-24** in `6feec52`.

## Conventions used

- Citation formats:
  - AP02 and AP06: `[<doc short ref> L<line> <requirement ID or §section>]`. Line numbers refer to the `.md` copies.
  - Workbooks: `[AP03 '<sheet>' <row or column>]` and `[PROTO '<sheet>' <row>]`. Row numbers are the spreadsheet's own row numbers.
  - XSD files: the file name without the version suffix, e.g. `[SimpleTypes L166]` or `[AssessmentTransfer L113]`.
  - `../swagger.yaml`: `[swagger.yaml L<line>]` for the current version, and `[swagger.yaml@2234377 L<line>]` for the version before 2026-11-24.
  - Team decisions: `[User 2026-11-19]`.
  - Design-session decisions: `[User 2026-11-23 Qn]` and `[User 2026-11-24 grill Qn]`, where `Qn` is the question number in the `.grill-me/` summaries. Other decisions from 2026-11-24: `[User 2026-11-24]`.
- Speculation is marked with `⚠️ Speculation:` in markdown and `x-speculative: true` in the yaml.
- New API conventions follow `../swagger.yaml`: integer `ypid`, GUID `stageid`, 409 instead of 404 for ID mismatches, and no personal data in query strings. They add a `422` response whose `rule` field gives the broken requirement ID.

## Verification done

- `proposed-transfer-api.yaml` and `../swagger.yaml` both pass Redocly's `spec` rule (`npx @redocly/cli@1.25.0 lint`), and every `$ref` resolves, including those from `proposed-transfer-api.yaml` into `../swagger.yaml`. The remaining Redocly findings are the same in both files and were there before: no security scheme, no `operationId`s, empty `servers`, and (in `../swagger.yaml`) trailing slashes on two paths.
- Each patch was checked with `git apply --check`, and applying all three in order to `swagger.yaml@2234377` gives exactly the version committed in `6feec52`.
- `swagger.yaml` line citations were updated or pinned to `2234377` on 2026-11-24; the current ones were checked against the file.
- All Markdown in this folder passes markdownlint with the repo-root `.markdownlint.jsonc`.
- In the first session about 40 citations were spot-checked; 17 more against the re-supplied AP02 and AP06 on 2026-11-19. Every XSD line citation was checked by script.
- No file from `restricted-documents/` has ever been committed.
- The Mermaid diagrams haven't been rendered.

## Outstanding items

1. **Questions for YJB:** Q17 (cancellation codes), Q19 (three-way review), Q22 (attachment limits and retention), Q24 (how SE caretaking ends), Q25 (SE rejection reasons); and the "Departures from the current process" in the YAML's description (no stop, no reopen, organisation-level cancel, only partial stages can be cancelled).
2. **Facts someone needs to supply** (owner not yet decided): how the Placement Service works today (Q1), supplier data (Q6), a v12 data dictionary (Q7), the EYE format (Q8), transfers between secure establishments (Q9), the stage trigger table (Q11), live CMS versions (Q12), OU codes (Q14), the "YJS 2-letter code" (Q16).
3. **Design decisions still open:** option E (the shape of `Stage.data`; E1 recommended), option G (authorisation) and access control per child, option H (H1 vs H2), the seven inferences from 2026-11-23 (Q21), the download response before scanning finishes (Q20), thresholds and periods (Q18), and non-functional requirements (Q23).
4. **Recommendations for `../swagger.yaml` not yet made:** schema-version rules, `308` for merged children, `GET …/stages` filters, `403` wording for caretakers.
5. **Possible next pieces of work:**
   - draft a `Stage.data` structure (option E1) from the v12 XSDs
   - a grill-me session on authorisation (option G)
   - render the Mermaid diagrams
