# Documents list

Documents used in this exploration of the AssetPlus transfer process. Paths are relative to this folder (`apps/api/docs/prototype/claude-exploration/`).

## Documents used

| Short ref | Title | Version / date | Location | Restricted? | Notes |
| :-- | :-- | :-- | :-- | :-- | :-- |
| AP02 | AssetPlus Framework High Level Requirements (YOT) | v5.0. The cover says August 2014; the change log entry for v5.0 is dated 17/06/2014 | `restricted-documents/AP 02 - AssetPlus Framework High Level Requirements v5.0.md` | Yes | Primary source for business rules on transfer (YY\*, SE\*, YA\* requirements, L840–897 and L805–813) and on stages (GE\*). Cited as `[AP02 L<line> <ReqID>]`. |
| AP02 (PDF) | As above, PDF original | v5.0 | `restricted-documents/AP 02 - AssetPlus Framework High Level Requirements v5.0.pdf` | Yes | Source of the .md conversion. Not cited directly; line numbers refer to the .md. |
| AP06 | YJB AssetPlus Case Transfer Schema Specification | v2.0, 26 September 2014 | `restricted-documents/AP 06 - YJB AssetPlus Case Transfer Schema Specification v2.0.md` | Yes | Primary source for the message-level transfer mechanism: Connectivity, message types, headers, rejection reasons, payload structure. Cited as `[AP06 L<line> §<section>]`. |
| SWAGGER | Prototype API (draft API footprint) | v0.0.2 | `../swagger.yaml` | No | The **intended** new API (central store). Used to judge coverage. Read only; not edited. Cited as `[swagger.yaml L<line>]`. |
| TODO | To do notes for the prototype API | n/a | `../todo.md` | No | Open design notes, e.g. a child having more than one AssetPlus record. Cited as `[todo.md L<line>]`. |
| USER | Answers given by the team during planning, 19 Nov 2026 | 2026-11-19 | This conversation | No | Cited as `[User 2026-11-19]`. |

## Documents referenced by the sources but not available

These documents are cited by AP02 or AP06 but are not in this folder. Any detail they hold, such as which data items move in a transfer, is a known gap.

| Title | Referenced at | What it would tell us |
| :-- | :-- | :-- |
| AssetPlus Framework Data Items External 5.0 (Data Items workbook / "Data Dictionary Master") | AP02 L156, L176; AP06 L50, L203–207 | Field-level data dictionary, including which items are included in case transfer |
| AssetPlus Case Transfer XSD files (AssessmentTransfer v2-0.xsd and related) | AP06 L286–297 | The machine-readable schema; AP06 only describes it, and its diagrams are images |
| AssetPlus Prototype v8.0 (Excel) | AP02 L142; AP06 L51, L205 | Screen/section layout, YOT to YOT module content, full acronym list |
| Interface Control Document (ICD) | AP06 L312, L411 | Message versioning and Connectivity envelope. AP06 describes it as "now outdated" |
| AssetPlus Transfer flows document | AP02 L857 (YY025) | Detailed transfer status flows |
| AssetPlus Non Functional Requirements v1.1 | AP02 L178 | Performance, security and availability requirements |
| YOT Assessment stages and trigger rules table | AP02 L919 (heading only, empty in this copy) | Which stage triggers which module |
