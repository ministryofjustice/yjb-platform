# Session context: AssetPlus transfer investigation

A summary of the working context for this task, so that a later session (human or Claude) can pick it up. It deliberately leaves out restricted material: there are no quotes, requirement text or detail from the documents in `restricted-documents/`. For findings, see the files listed under "Outputs".

First written 2026-11-19 on branch `api-footprint-prototypes`. Updated twice later the same day:

- after the first commit and the arrival of new source documents
- after those new sources and the new DELETE stage route had been worked into the outputs

Updated again on 2026-11-23, after a design session (a "grill") that settled most of the open design options. See "Decisions from the design session (2026-11-23)".

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
| Review | Option B1. Stages under review are visible to all. The Home YOT is the hub in three-way cases |
| Placement Service | Its own web UI on an internal API. The public API only lets a YOT start a placement and follow it |
| Other | Inbox plus optional webhooks; a public `/history`; attachments follow the stage, with asynchronous scanning; an AP06 adapter for migration; YJB maintains the organisations list |

Seven inferences in the summary are still to be confirmed (`api-scope-and-options.md` Q21). Non-functional requirements weren't covered, by the user's choice.

## Inputs

- The restricted source documents are in `restricted-documents/`, which git ignores. `documents-list.md` lists them by title, with versions and locations:
  - AP 02 requirements (v5.0)
  - AP 03 data dictionary workbook (v5.0)
  - AP 06 case transfer schema specification (v2.0)
  - AssetPlus Prototype workbook (v8.4.1 DRAFT)
  - the 11 AssetPlus XSD files (v12.0.0)
- `../swagger.yaml` (v0.0.2) is the draft of the intended API. Its routes are:
  - `/children` (GET, POST)
  - `/children/search`
  - `/children/{ypid}`
  - `/children/{ypid}/stages`
  - `/children/{ypid}/stages/{stageid}` (GET, PATCH, PUT, DELETE). DELETE was added in commit `2234377`.
- `../todo.md` holds open design notes. One notes that a child can currently have more than one AssetPlus record.

## Outputs in this folder

| File | Contents | Contains restricted-derived material? |
| :-- | :-- | :-- |
| `documents-list.md` | Documents used, documents still missing, and gaps between the sources | Titles, versions and dates, plus a few counts and enumeration names |
| `current-process.md` | Sourced description of today's process, with Mermaid diagrams, cross-checked against the v12 XSDs and AP 03 | **Yes**: paraphrases, short quotes and controlled values |
| `api-scope-and-options.md` | Coverage table (F1–F32), missed scope (§2 items 1–26), design options A–J, suggested changes to `../swagger.yaml`, open questions Q1–Q23. Annotated with the 2026-11-23 decisions | **Yes**: paraphrases and citations |
| `proposed-transfer-api.yaml` | OpenAPI 3.0.4 draft (v0.0.3-draft) of new routes. Its description lists the recommended changes to `../swagger.yaml` and the departures from the current process. It references `MinimalChild` and `Stage` from `../swagger.yaml`, and marks speculative parts `x-speculative: true` | **Yes**: short quotes and citations in descriptions |
| `.grill-me/` (git-ignored) | The 2026-11-23 design session: summary and JSON design tree | **Yes**: citations |
| `session-context.md` | This file | No |

## Routes proposed (summary)

All of these are in `proposed-transfer-api.yaml`, revised on 2026-11-23 to match the design-session decisions:

- organisations: list, and fetch one by OU code (read-only; YJB maintains them)
- transfers: request, list, inbox, accept, reject, end
- a stage's audit history
- review of stages shared by the other party, plus a review inbox
- a stage change comparison, as JSON or PDF
- stage attachments: list, upload (asynchronous scan), fetch or download, and remove
- placement requests: start one and follow its status (the rest is internal)
- duplicate reports, and merging (YJB only)
- reference data lists, now including cancellation and duplicate-report reasons
- webhook subscriptions (optional; the inboxes are the source of truth)

The `…/transitions` route was **removed**. Status changes now happen through the stage routes in `../swagger.yaml`, as listed in the YAML's "Recommended changes".

## Main findings from the new sources (2026-11-19)

Detail and citations are in `current-process.md` §3–§6 and `api-scope-and-options.md`.

- **AP 06 describes an old schema.** It covers schema v2-0 (2014); the XSDs are v12.0.0 (2026), with a release most years. Differences that matter:
  - The message types use Accept/Reject rather than Acknowledged/Rejected.
  - There's a single list of rejection reasons.
  - Attachments are listed in a per-stage attachment index instead of `Unstructured_Data`.
  - There's a stage index that tells the receiver about every stage, including stopped and cancelled ones.
- **Caretaking statuses aren't in the schema.** 'Completed – awaiting Transfer', 'Completed – Transferred' and 'Completed – rejected' are local to each CMS.
- **Supplier data.** AP 03 defines 109 supplier-data items, but the v12 schema has no SupplierData structure.
- **Countersignatures and case types.** Each stage has two countersignatures, and a case type that limits which stage types are allowed.
- **Placement data.** The schema carries the YOT's placement *recommendation* by establishment type. It has no field for the Placement Service's decision.
- **Organisations.** Only YOT OU codes are listed (AP 03, as of 2014). Secure establishments and the Placement Service have no codes in any source.
- **Still missing:**
  - the stage→module trigger table
  - a data dictionary that matches v12
  - the non-functional requirements
  - the Interface Control Document (ICD)
  - the transfer flows document
- **`DELETE …/stages/{stageid}`.** It overlaps with the GE069 "cancel" requirement but, as drafted, doesn't meet it. It has no reason, it's limited by organisation rather than by owner, and it's a hard delete where GE069 keeps the audit trail. Option I in `api-scope-and-options.md` sets out four approaches. The recommendation was I3: cancel only through `…/transitions`. **Superseded 2026-11-23:** I2, a soft `DELETE` with a reason code [User 2026-11-23 Q12–Q14].

## Conventions used

- Citation formats:
  - AP02 and AP06: `[<doc short ref> L<line> <requirement ID or §section>]`. Line numbers refer to the `.md` copies.
  - Workbooks: `[AP03 '<sheet>' <row or column>]` and `[PROTO '<sheet>' <row>]`. Row numbers are the spreadsheet's own row numbers.
  - XSD files: the file name without the version suffix, e.g. `[SimpleTypes L166]` or `[AssessmentTransfer L113]`.
  - Team decisions: `[User 2026-11-19]`.
  - Design-session decisions: `[User 2026-11-23 Qn]`, where `Qn` is the question number in the `.grill-me/` summary.
- Speculation is marked with `⚠️ Speculation:` in markdown and `x-speculative: true` in the yaml.
- New API conventions follow `../swagger.yaml`: integer `ypid`, GUID `stageid`, 409 instead of 404 for ID mismatches, and no personal data in query strings. They add a `422` response whose `rule` field gives the broken requirement ID.

## Verification done

- I parsed `proposed-transfer-api.yaml` locally after the 2026-11-23 revision. It loads, and all 161 `$ref` occurrences resolve, including those into `../swagger.yaml` (`MinimalChild` and `Stage`). One schema, `StageStatusResponse`, isn't referenced by a route in this file; it's the proposed `200` body for `PUT` in `../swagger.yaml`.
- A full lint with `npx @redocly/cli` hasn't been run.
- In the first session I spot-checked about 40 citations. On 2026-11-19 I re-checked 17 against the re-supplied AP02 and AP06.
- Every new XSD line citation was checked by script against the file; three wrong line numbers were found and corrected.
- Citations into `../swagger.yaml` were re-checked after the DELETE route moved its later lines; three were corrected.
- No file from `restricted-documents/` has ever been committed. The workbooks were read with a standard-library script, through temporary copies outside the repository that were deleted afterwards.
- The Mermaid diagrams haven't been rendered.

## Outstanding items

1. **Decisions still needed** (see `api-scope-and-options.md` §3 and §5). Options B, C, D, F, I and J were decided on 2026-11-23. Still open:
   - option A (transfer model; A1 is still drafted), option E (the shape of `Stage.data`; E1 recommended), option G (authorisation) and option H (H1 vs H2)
   - the seven unconfirmed inferences (Q21)
   - cancellation reason codes (Q17), thresholds and periods (Q18), a Host YOT and an SE both caretaking (Q19), the response for a download before scanning finishes (Q20), attachment limits and retention (Q22)
   - how the Placement Service works today (Q1)
   - **Departures from the current process** to check with YJB or the business: no stop, no reopen, organisation-level cancel, and only partial stages can be cancelled. They're listed in the YAML's description
2. **Documents to ask for:**
   - a data dictionary or release notes matching schema v12 (Q7)
   - OU codes for secure establishments and the Placement Service, and a current YOT list (Q14)
   - the stage trigger table (Q11)
   - the non-functional requirements (Q23)
3. **Recommended changes to `../swagger.yaml`** are in two places: the YAML's description (decided on 2026-11-23) and `api-scope-and-options.md` §4 (the earlier list, annotated). None has been made, since that file is outside this folder. One inconsistency: `DELETE` expects the identifier in a request body [swagger.yaml L654], although it's in the path.
4. **Possible next pieces of work:**
   - draft a `Stage.data` structure (option E1) from the v12 XSDs
   - run a full OpenAPI lint
   - render the Mermaid diagrams
