# Session context: AssetPlus transfer investigation

A summary of the working context for this task, so that a later session (human or Claude) can pick it up. It deliberately leaves out restricted material: there are no quotes, requirement text or detail from the documents in `restricted-documents/`. For findings, see the files listed under "Outputs".

First written 2026-11-19 on branch `api-footprint-prototypes`. Updated twice later the same day:

- after the first commit and the arrival of new source documents
- after those new sources and the new DELETE stage route had been worked into the outputs

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
| `api-scope-and-options.md` | Coverage table (F1–F32), missed scope (§2 items 1–24), design options A–I, suggested changes to `../swagger.yaml`, open questions Q1–Q16 | **Yes**: paraphrases and citations |
| `proposed-transfer-api.yaml` | OpenAPI 3.0.4 draft (v0.0.2-draft) of **new routes only**. It references `MinimalChild` from `../swagger.yaml` and marks speculative parts `x-speculative: true` | **Yes**: short quotes and citations in descriptions |
| `session-context.md` | This file | No |

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
- reference data lists, now including case types and establishment types
- webhook subscriptions (optional)

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
- **`DELETE …/stages/{stageid}`.** It overlaps with the GE069 "cancel" requirement but, as drafted, doesn't meet it. It has no reason, it's limited by organisation rather than by owner, and it's a hard delete where GE069 keeps the audit trail. Option I in `api-scope-and-options.md` sets out four approaches. The recommendation is I3: cancel only through `…/transitions`.

## Conventions used

- Citation formats:
  - AP02 and AP06: `[<doc short ref> L<line> <requirement ID or §section>]`. Line numbers refer to the `.md` copies.
  - Workbooks: `[AP03 '<sheet>' <row or column>]` and `[PROTO '<sheet>' <row>]`. Row numbers are the spreadsheet's own row numbers.
  - XSD files: the file name without the version suffix, e.g. `[SimpleTypes L166]` or `[AssessmentTransfer L113]`.
  - Team decisions: `[User 2026-11-19]`.
- Speculation is marked with `⚠️ Speculation:` in markdown and `x-speculative: true` in the yaml.
- New API conventions follow `../swagger.yaml`: integer `ypid`, GUID `stageid`, 409 instead of 404 for ID mismatches, and no personal data in query strings. They add a `422` response whose `rule` field gives the broken requirement ID.

## Verification done

- I parsed `proposed-transfer-api.yaml` locally after the latest edits. It loads, and all 148 `$ref` occurrences resolve, including those into `../swagger.yaml`.
- A full lint with `npx @redocly/cli` hasn't been run.
- In the first session I spot-checked about 40 citations. On 2026-11-19 I re-checked 17 against the re-supplied AP02 and AP06.
- Every new XSD line citation was checked by script against the file; three wrong line numbers were found and corrected.
- Citations into `../swagger.yaml` were re-checked after the DELETE route moved its later lines; three were corrected.
- No file from `restricted-documents/` has ever been committed. The workbooks were read with a standard-library script, through temporary copies outside the repository that were deleted afterwards.
- The Mermaid diagrams haven't been rendered.

## Outstanding items

1. **Decisions needed from the team** (see `api-scope-and-options.md` §3 and §5):
   - option I: what `DELETE …/stages/{stageid}` should mean (Q13)
   - option B: how shared stages are reviewed in a central store
   - option D: how the Placement Service actually works today (Q1)
   - option E: the shape of the stage payload. This can now be worked out from the v12 XSDs, but it needs a decision on schema versioning (Q15)
2. **Documents to ask for:**
   - a data dictionary or release notes matching schema v12 (Q7)
   - OU codes for secure establishments and the Placement Service, and a current YOT list (Q14)
   - the stage trigger table (Q11)
   - the non-functional requirements
3. **Suggested changes to `../swagger.yaml`** are listed in `api-scope-and-options.md` §4, including fixes to the wording of the DELETE route. None has been made, since that file is outside this folder.
4. **Possible next pieces of work:**
   - draft a `Stage.data` structure (option E1) from the v12 XSDs
   - run a full OpenAPI lint
   - render the Mermaid diagrams
