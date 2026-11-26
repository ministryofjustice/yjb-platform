# Documents list

Documents used in this exploration of the AssetPlus transfer process. Paths are relative to this folder (`apps/api/docs/prototype/claude-exploration/`).

This list gives titles, versions, dates and locations only. It contains no content from the restricted documents beyond the version metadata needed to identify them.

Last updated 2026-11-26, when the user added `data-sync-api-path.pdf` [User 2026-11-26]. On 2026-11-19 the team added AP 03, the AssetPlus Prototype workbook and the AssetPlus XSD files to `restricted-documents/` [User 2026-11-19].

## Documents used

| Short ref | Title | Version / date | Location | Restricted? | Notes |
| :-- | :-- | :-- | :-- | :-- | :-- |
| AP02 | AssetPlus Framework High Level Requirements (YJS) | v5.0. The cover says August 2014. The change log entry for v5.0 is dated 17/06/2014 [AP02 L34] | `restricted-documents/AP 02 - AssetPlus Framework High Level Requirements v5.0.md` | Yes | Primary source for business rules on transfer (YY\*, SE\* and YA\* requirements, L805–897) and on stages (GE\*). Cited as `[AP02 L<line> <ReqID>]`. |
| AP02 (PDF) | As above, PDF original | v5.0 | `restricted-documents/AP 02 - AssetPlus Framework High Level Requirements v5.0.pdf` | Yes | Source of the .md conversion. Not cited directly; line numbers refer to the .md. |
| AP03 | AssetPlus Framework Data Items External | v5.0. The latest row in its 'Version History' sheet is version 5, dated 26/09/2014 (stored as Excel date serial 41908) | `restricted-documents/AP 03 - AssetPlus Framework Data Items External v5.0.xlsm` | Yes | **New.** This is the "Data Items workbook" that AP02 and AP06 refer to [AP02 L156; AP06 L52 Ref 1, L203]. It includes the 'Data Dictionary Master' sheet that AP06 means by "data dictionary" [AP06 L207]. Cited as `[AP03 '<sheet>' <cell or row>]`. |
| PROTO | AssetPlus Prototype | v8.4.1 DRAFT, going by the file name. The file was last modified 2026-07-08 (file properties) | `restricted-documents/AssetPlus Prototype v8.4.1 DRAFT.xlsx` | Yes | **New.** A later version of the Prototype that AP02 and AP06 cite as v8.0 [AP02 L142; AP06 L53 Ref 2, L205]. Has a sheet per section and module, including 'Custody', 'Leaving Custody', 'YOT - YOT' and 'Acronyms'. Cited as `[PROTO '<sheet>' <cell or row>]`. See gap 2. |
| XSD | AssetPlus XML schema files (11 files) | v12.0.0, dated 2026-11-02 [AssessmentTransfer-v12-0-0.xsd L5]. `CommonSimpleTypes` is v1.3 [CommonSimpleTypes-v1-3.xsd L11] | `restricted-documents/assetplus-schema-xsd/` | Yes | **New.** The machine-readable schema that AP06 describes [AP06 L284–297]. Files: AssessmentTransfer, CaseTransfer, coreRecord, HearingOffencesAndDisposals, PersonalFamilyAndSocialFactors, SelfAssessment, SimpleTypes, LanguageList and NationalityList (all `-v12-0-0`), plus `CommonSimpleTypes-v1-3.xsd` and `YJMIS-CMS-Schema 12-0-0.xsd`. Cited by file name without the version suffix, e.g. `[SimpleTypes L166]` or `[AssessmentTransfer L113]`. See gaps 1, 3, 4, 8 and 9. |
| AP06 | YJB AssetPlus Case Transfer Schema Specification | v2.0, 26 September 2014 | `restricted-documents/AP 06 - YJB AssetPlus Case Transfer Schema Specification v2.0.md` | Yes | Primary source for the message-level transfer mechanism: Connectivity, message types, headers, rejection reasons and payload structure. Cited as `[AP06 L<line> §<section>]`. Describes schema v2-0, not the v12.0.0 we now hold (gap 1). |
| SWAGGER | Prototype API (draft API footprint) | v0.0.3 since `cb7e26e`. Changed on 2026-11-24 in commit `6feec52`, by applying the first three `swagger-*.patch` files in this folder, and on 2026-11-26 in commit `7248bc2`, by applying `swagger-operation-ids.patch`. The version before 2026-11-24 is commit `2234377`, which added `DELETE /children/{ypid}/stages/{stageid}` | `../swagger.yaml` | No | The **intended** new API (central store). Used to judge coverage. Not edited directly; changes are proposed as patches in this folder. Cited as `[swagger.yaml L<line>]` for the current version, and `[swagger.yaml@2234377 L<line>]` for the version before 2026-11-24. |
| DSYNC | "The recommendation we're taking forward": the data-sync API path | One slide, numbered 8, from a larger deck. No date, author or version. Added 2026-11-26 [User 2026-11-26] | `data-sync-api-path.pdf` | No: marked "OFFICIAL - FOR PUBLIC RELEASE" | **New.** A swimlane diagram of the recommended flow between a YJS, the Placement Service, an SE and the platform, with the API calls at each step. Red text marks new behaviour. The other slides of the deck were context for other stakeholders and aren't needed [User 2026-11-26]. Cited as `[DSYNC p1]`. See the user's clarifications below the table. |
| TODO | To do notes for the prototype API | n/a | `../todo.md` | No | Open design notes, e.g. a child having more than one AssetPlus record. Cited as `[todo.md L<line>]`. |
| USER | Answers given by the team during planning, and by the user in later sessions | 2026-11-19, 2026-11-23, 2026-11-24, 2026-11-26 | Conversations with Claude; the 2026-11-23 and 2026-11-24 design sessions are recorded in `.grill-me/` (git-ignored) | No | Cited as `[User 2026-11-19]`, `[User 2026-11-23 Qn]`, `[User 2026-11-24 grill Qn]`, `[User 2026-11-24]` or `[User 2026-11-26]`. |

**How to read DSYNC** [User 2026-11-26]:

- API calls missing from the diagram, such as `POST /children`, were left out for brevity.
- "Partial updates sync with AssetPlus as metadata" is loose wording. `../swagger.yaml` is correct: `PATCH` saves the partial stage itself.
- The other party's notification that a partial stage exists reveals that the stage exists, not what's in it.
- The placement and transfer steps are deliberately simplified. For the current work, they don't need to match the transfer design.
- "Rebase" means bringing another organisation's newly completed stage into an open partial stage that's still in progress.
- "De-doop" means de-duplication. The detail of it isn't needed for the current work.

The YJMIS data-return schema (`YJMIS-CMS-Schema 12-0-0.xsd`) is about management information, not transfer [YJMIS-CMS-Schema 12-0-0.xsd L3]. It's relevant only to the adjacent YJMIS extract [AP02 L543 GE041].

## Documents referenced by the sources but still not available

| Title | Referenced at | What it would tell us |
| :-- | :-- | :-- |
| Interface Control Document (ICD) | AP06 L312, L411 | Message versioning and the Connectivity envelope. AP06 calls it "now outdated" [AP06 L312] |
| AssetPlus Transfer flows document | AP02 L857 (YY025) | Detailed transfer status flows |
| AssetPlus Non Functional Requirements v1.1 | AP02 L136, L178 | Performance, security and availability requirements |
| YOT Assessment stages and trigger rules table | AP02 L919 (heading only, empty in this copy) | Which stage triggers which module |
| Documentation that accompanies XSD v12.0.0 | AssessmentTransfer-v12-0-0.xsd L5–6 (and similar entries in the other v12 files) | What changed in each schema release. Each history entry says "see accompanying documentation" |
| AssetPlus Change Request / Notice to Suppliers No. 2015-004 | AssessmentTransfer-v12-0-0.xsd L81 | Why the schema changed at v2.2 (2015-03-02) |
| PDF original of AP06 | n/a | Only the .md conversion is in `restricted-documents/`. AP06's diagrams are images [earlier version of this file, commit `2566f35`] |

The trigger-rules table isn't in AP03 or PROTO either. AP03 gives stage rules for each data item, not a table of stages and modules [AP03 'Data Items CONSOLIDATED' col N]. PROTO says it doesn't depict assessment stages [PROTO 'Please Read' rows 15–16]. Its 'Navigation' sheets have no cell content.

## Gaps and inconsistencies between these documents

1. **AP06 describes a much older schema than the one we hold.** AP06 describes schema v2-0 [AP06 L288, L300]. The XSDs are v12.0.0, and their change history runs from v2.0 (2014-09-15) to v12.0.0 (2026-11-02) [AssessmentTransfer-v12-0-0.xsd L5–88]. Anything in AP06 about payload structure should be checked against the v12 files before we rely on it.
2. **The Prototype file name doesn't match its own version history.** The file is named v8.4.1 DRAFT, but the highest version in its 'Version control' sheet is 8.3 [PROTO 'Version control', column A]. AP02 and AP06 both cite v8.0 [AP02 L142; AP06 L53].
3. **There's no `SupplierData.xsd`.** AP06 lists a SupplierData schema [AP06 L297], but it isn't among the v12 files, and none of the v12 files declares an element whose name starts with `sd` (checked by text search). Either supplier data was removed from the schema after 2014, or the file wasn't supplied. This matters for open question Q6 in `api-scope-and-options.md`.
4. **The XSD set differs from AP06's list in other ways.**
   - `CaseTransfer-v12-0-0.xsd` and `YJMIS-CMS-Schema 12-0-0.xsd` are not in AP06's list [AP06 L288–297].
   - AP06 doesn't version `CoreRecord.xsd` in its name; the v12 file is `coreRecord-v12-0-0.xsd`, with a lower-case "c".
5. **One XSD has a release date that looks wrong.** `HearingOffencesAndDisposals-v12-0-0.xsd` dates v12.0.0 as 2025-11-02 [L5]. Every other v12 file says 2026-11-02, and in the same file v11.0.1 is dated 2025-12-03 [L8]. 2025-11-02 is probably a typo for 2026-11-02.
6. **AP03 may have been edited after its last recorded version.** Its file properties show a last-modified date of 2024-06-07, but the latest 'Version History' entry is from 2014 [AP03 'Version History', last row]. It's possible that later edits weren't recorded.
7. **Corrected citations.**
   - Earlier drafts cited AP06's "Related documents" table as L50–51. The rows are actually at L52–53. `current-process.md` and `api-scope-and-options.md` don't use those line numbers, so nothing else needs fixing.
   - Commit `2234377` inserted the DELETE route at `../swagger.yaml` L649, which moved everything after it down by 53 lines. Citations of the `Stage` schema and the Person Standard note were updated in `api-scope-and-options.md` at the time.
   - Commit `6feec52` (2026-11-24) changed `../swagger.yaml` throughout. Citations that describe the earlier version now say `swagger.yaml@2234377`; the rest were moved to the new line numbers.
   - Commit `7248bc2` (2026-11-26) moved most lines of `../swagger.yaml` again. The unpinned citations were moved to the new line numbers in the same commit.
8. **The data dictionary is older than the schema.** AP03 is v5.0 (2014) [AP03 'Version History' last row], and the Prototype reflects requirements "up to schema v11" [PROTO 'Please Read' row 5]. The XSDs are v12.0.0 [AssessmentTransfer L5]. So no document we hold describes all v12 data items; the "accompanying documentation" each XSD release refers to would [AssessmentTransfer L5–6].
9. **Organisation code formats don't match.** AP03's YJS list uses 7-character OU codes, e.g. `F00BK00` [AP03 'YOT Full List' row 2]. The v12 Assessment ID expects a "YJS 2-letter code" [AssessmentTransfer L348]. No source lists codes for secure establishments or the Placement Service.
