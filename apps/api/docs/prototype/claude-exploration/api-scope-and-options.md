# AssetPlus transfer: API scope, gaps and options

This document does four things:

1. Lists the functions the **current** AssetPlus transfer process provides (described in [current-process.md](current-process.md)).
2. Checks whether the **intended** API ([`../swagger.yaml`](../swagger.yaml)) covers each one.
3. Proposes routes for the gaps, drafted in [proposed-transfer-api.yaml](proposed-transfer-api.yaml).
4. Sets out design options for us to choose between.

**Scope** [User 2026-11-19]:

- YJS ↔ Secure Estate caretaking, including the YJB Placement Service, mapped in full.
- YJS ↔ YJS and Y2A noted only.
- The new API is a **central store**.
- `../swagger.yaml` is our intent for the new API. Requirements marked "Wont" in AP02 are *not* treated as current functionality.

Citation format is as in [documents-list.md](documents-list.md) and [current-process.md](current-process.md). Anything marked ⚠️ is speculation.

**Updated 2026-11-19** to use the AP 03 data dictionary, the Prototype workbook and the v12.0.0 XSDs. It also covers `DELETE /children/{ypid}/stages/{stageid}`, which was added to `../swagger.yaml` in commit `2234377` (see F4 and option I).

**Updated 2026-11-23** with the decisions from a design session (Q1–Q48). They're cited as `[User 2026-11-23 Qn]`. The full record, including seven inferences still to confirm, is in `.grill-me/assetplus-api-design-20261123T1315-summary.md`. `proposed-transfer-api.yaml` (v0.0.3-draft) has been revised to match. Its description now lists the recommended changes to `../swagger.yaml` and the departures from the current process. Where a decision overrides a recommendation below, the original text is kept and marked **Decided**.

---

## 1. Function inventory and coverage

Coverage values:

- ✅ covered by `../swagger.yaml`
- 🟡 partly covered
- ❌ not covered

"Proposed" refers to routes in `proposed-transfer-api.yaml`.

| # | Current function | Source | Coverage in `../swagger.yaml` | Proposed |
| :-- | :-- | :-- | :-- | :-- |
| F1 | Identify and find a young person | [AP06 L209, L323] | ✅ `GET /children`, `POST /children/search`, `GET /children/{ypid}` [swagger.yaml L35–242] | — |
| F2 | Create a record for an unknown young person | Unknown/Known process maps [AP02 L707–735] (images only) | ✅ `POST /children` [swagger.yaml L111] | — |
| F3 | Create a stage, edit it, only one in progress. Available stage types depend on organisation type and case type | [AP02 L520 GE034; AP03 'Data Items CONSOLIDATED' row 4 cols AH–AL; AssessmentTransfer L249] | ✅ since 2026-11-24: `POST` takes `stage_type` and `case_type` and returns `422` when a rule fails [swagger.yaml L272–355, L280]; partial stages are per organisation [swagger.yaml L252–254]. Before then, the rule wasn't stated and there was no case type [swagger.yaml@2234377 L394–648] | **Decided:** one partial stage per child per organisation [User 2026-11-23 Q28]. `POST` takes `stage_type` and `case_type`, and the platform enforces both rules with `422` [Q29] (§4) |
| F4 | Complete (with sign-off), stop, cancel, re-open a stage | [AP02 L525–527 GE059/68/69; L858 YY026] | ✅ since 2026-11-24 for complete and cancel: an accepted `PUT` completes a stage [swagger.yaml L455], `DELETE` is a soft cancel with a reason code [swagger.yaml L520–526], and `Stage` has a `status` [swagger.yaml L953]. Stop and re-open were dropped. Before then, `DELETE` was a hard delete with no reason, and `Stage` had no status [swagger.yaml@2234377 L649–654, L956–963] | **Decided:** no transitions API. An accepted `PUT` completes the stage; a soft `DELETE` cancels it (option I2). Stop and re-open are dropped [User 2026-11-23 Q7, Q8, Q10–Q12] |
| F5 | Choose destination by organisation (OU code) | [AP06 L272, L416–419; AssessmentTransfer L360–365] | ❌ | `GET /organisations`, `GET /organisations/{ou_code}`. AP03 lists the 258 YJSs with OU codes [AP03 'YOT Full List']; no source lists SEs or the Placement Service. **Decided:** YJB maintains the list in the platform, and the API only reads it [User 2026-11-23 Q46] |
| F6 | Request caretaking transfer to the SE (all completed stages, never stopped ones) | [AP02 L874 SE001; AP06 §6.3.1] | ❌ | The platform creates it when the Placement Service decides [User 2026-11-23 Q35–Q37]. `POST /children/{ypid}/transfers` stays only as a speculative sketch for YJS↔YJS [User 2026-11-24 grill Q4] |
| F7 | Transfer preconditions: last stage complete and none in progress; one arrangement at a time | [AP02 L876 SE002, L877 SE020] | ❌ | `422` + `rule` on `POST …/transfers` |
| F8 | Flag case as requested / accepted / cleared | [AP02 L875 SE026] | ❌ | `Transfer.status`, `GET /children/{ypid}/transfers` |
| F9 | Automatic acknowledgement | [AP06 §6.3.2, L400] | n/a | Synchronous `201` replaces it |
| F10 | Person accepts or rejects a transfer, with a reason list | [AP06 §6.3.3, L336–347; SimpleTypes L1119–1131, L1342–1353] | ❌ | `PATCH /transfers/{id}` with `status: accepted` or `rejected` [User 2026-11-24 grill Q7]. **Decided:** an SE must accept or reject [Q1]; an SE rejection sends the placement request back to the Placement Service [Q2] and uses a separate reason list [Q8] |
| F11 | View assessment before deciding | [AP02 L850 YY005] | 🟡 `GET …/stages` exists, but the recipient has no access rule before acceptance | Access rule in the `POST …/transfers` description |
| F12 | No updates until accepted | [AP02 L878 SE019] | ❌ | Enforced by `Transfer.status` |
| F13 | Either side completes and shares a stage | [AP02 L882 SE004; AP06 §6.5.1] | 🟡 Either org can create stages; no sharing concept | An accepted `PUT` while a caretaking transfer is `accepted` gives `completed_shared` [User 2026-11-23 Q8] |
| F14 | Accept or reject a shared update, with a reason list, and reminders | [AP02 L886 SE005, L887 SE014] | ❌ | `POST …/stages/{stageid}/reviews`, `GET /reviews`. **Since 2026-11-26:** the decision must be made before the reviewer can complete its own open stage (see option B) [User 2026-11-26] |
| F15 | Identify changes in a received stage, PDF/print | [AP02 L888 SE006] | ❌ | `GET …/stages/{stageid}/changes` (JSON or PDF) |
| F16 | Caretaking statuses ('awaiting Transfer', 'Transferred', 'rejected') | [AP02 L883 SE016, L857 YY025] | ❌ | `StageStatus`. These statuses are local to each CMS today; they're not in the schema [SimpleTypes L1731–1738]. **Decided:** 'awaiting Transfer' becomes partial (`in_progress`) [User 2026-11-23 Q7]; `completed_shared` is final [Q10]; `completed_rejected` is a read-only record [Q11] |
| F17 | Home YJS ends caretaking | [AP02 L890 SE008] | ❌ | `PATCH /transfers/{id}` with `status: ended` [User 2026-11-24 grill Q7]. How SE caretaking ends needs YJB input (Q24) |
| F18 | Role-based permission to accept or reject | [AP02 L891 SE009] | ❌ No auth model | `403` + token roles (§3 option G) |
| F19 | Attachments listed and sent separately | [AP06 L260–266; AP02 L537 GE019; AssessmentTransfer L2679–2690] | ❌ | `…/stages/{stageid}/attachments`. v12 lists each file by section and document name. **Decided:** attachments follow the stage's lifecycle [User 2026-11-23 Q43], uploads are scanned asynchronously (`202`) [Q44], and `section` stays free text [Q45] |
| F20 | Placement via the YJB Placement Service | [AP02 L874 SE001, L484; AssessmentTransfer L1148–1186] | 🟡 The placement recommendation (establishment type, exclusions, notes for Placements) is stage data, so it would sit in `Stage.data`. There's no placement decision | **Decided:** the Placement Service uses its own web UI on an internal API. The public API has only `POST /children/{ypid}/placement-requests` and a `GET` for its status [User 2026-11-23 Q35–Q37] |
| F21 | Show that the young person is in custody | [AP02 L874 SE001] | ❌ | **Decided:** the CMS works it out from `GET /children/{ypid}/transfers`: an `accepted` caretaking transfer to a secure establishment. There's no indicator on the child [User 2026-11-24]. AP03 has a system-calculated "Young person currently in custody" item that is *not* transferred [AP03 'Data Dictionary Master' row 1026], which supports deriving it rather than storing it |
| F22 | Stage payload: core + triggered modules | [AP06 L361–378 Rule 4, L506–548; AssessmentTransfer L294–338] | 🟡 `Stage.data` is "structure TBC" [swagger.yaml L1028] | Option E. Now possible to work out from the v12 XSDs and AP03 |
| F23 | History / snapshots by date or stage type | [AP02 L528 GE003] | 🟡 `GET …/stages` lists stages, with no date or type filters | Add `type`, `completed_from`, `completed_to` query params (§4) |
| F24 | Audit: who changed what and when | [AP02 L536 GE015; AP06 L256] | ❌ Not described. The new DELETE route risks losing audit history (option I) | Option H. **Decided:** a public `GET …/stages/{stageid}/history` [User 2026-11-23 Q39] |
| F25 | Merge duplicate AssetPlus records | [AP02 L870 YY014; todo.md L17] | ❌ | **Decided:** one record per child [User 2026-11-23 Q25]. CMSs report suspects with `POST /children/{ypid}/duplicate-reports` [Q42]; only YJB merges, with `POST /children/{ypid}/merges` [Q27]; a merged-away `ypid` returns `308` [Q26] |
| F26 | Controlled lists (rejection reasons, stage types, case types) | [AP06 L241–243, L336–347; AP02 L520; SimpleTypes L166–184, L291–301, L1342–1353; AP03 'YJBDropDownLists'] | ❌ | `GET /reference-data/{list}` |
| F27 | Supplier (non-AssetPlus) data travels with the case | [AP06 L249, L882–892; AP03 'Data Dictionary Master' rows 1069–1177] | ❌ | Open question Q6. Not in the v12 schema |
| F28 | Agree transfer "off-system" first | [AP06 L399] | n/a | Optional `note` on `TransferRequest` |
| F29 | Interim EYE-format output for SEs not on AssetPlus | [AP02 L892 SE010] | ❌ | Open question Q8 (probably obsolete ⚠️) |
| F30 | Receiver sees an index of all the case's stages, including in-progress, stopped and cancelled ones, with their attachments | [AssessmentTransfer L336, L2667–2690; SimpleTypes L1731–1738] | 🟡 `GET …/stages` returns signed-off stages only [swagger.yaml L252] | Add a `status` filter and return cancelled stages as summaries (§4). Not yet made: left out of the 2026-11-24 changes [User 2026-11-24]. There's no `stopped` status any more [User 2026-11-23 Q12] |
| F31 | Each stage records the schema version it was written in; the schema changes every year | [AssessmentTransfer L2678, L5–71] | ❌ | **Decided:** a `schema_version` field on `Stage`; stored stages are never migrated; a grace period applies after each annual change [User 2026-11-23 Q30–Q32] |
| F32 | Countersignature of Explanations & Conclusions and of Pathways & Planning | [AssessmentTransfer L334–335, L454–472; AP02 L525 GE059] | ❌ | **Decided:** the v12 countersignature fields go in the `PUT` body, and the platform trusts them [User 2026-11-23 Q15]. The CMS locks the stage once a `PUT` is sent [Q16]; any fix or rebase needs a new sign-off [Q17, Q18] |

**Adjacent (noted only):**

- YJS↔YJS complete transfer: the same `Transfer` resource with `type: complete`, plus the YY017/YY004/YY013 rules [AP02 L849, L848, L868].
- Y2A feed [AP02 L811 YA001].
- YJMIS extract [AP02 L543 GE041].

---

## 2. Scope we may have missed

These are areas the current process depends on that neither `../swagger.yaml` nor the earlier draft addresses.

1. **Organisations as first-class data.** Every transfer is addressed by OU code [AP06 L416; AssessmentTransfer L360–365]. We need an authoritative list of YJSs, SEs and the Placement Service, and a link between users and organisations.
   - AP03 has the YJS list: OU code, organisation name and Connectivity name for 258 YJSs [AP03 'YOT Full List'].
   - No source lists the secure establishments. The schema only knows an establishment's *type* (SCH, STC or YOI) [SimpleTypes L823–829], plus a free-text establishment name on arrival in custody [AssessmentTransfer L230].
   - The AP03 list dates from 2014. YJSs have since merged and been renamed.
   > ⚠️ **Speculation:** the list is very likely out of date.

   **Decided 2026-11-23:** YJB maintains the list in the platform. The API only reads it, and retired organisations stay readable with a status [User 2026-11-23 Q46]. When YJSs merge, everything the old YJS owned moves to the new one automatically [Q47, Q48]. Where the codes come from is still open (Q14).
2. **Authorisation model.** Things that depend on organisation and role:
   - who may accept or reject [AP02 L891 SE009]
   - which stage types each organisation type may create [AP02 L520 GE034]
   - manager override [AP02 L522 GE066]
   - proxy users [AP02 L523 GE071]

   The draft relies on "organisation making the request" [swagger.yaml L252] but defines no auth.

   **Decided 2026-11-23:** CMS users authenticate to the platform as individuals [User 2026-11-23 Q14].
3. **Stage status and lifecycle.** Covered in F4/F16. Without it, the API can't enforce any transfer precondition. **Decided 2026-11-23:** status changes happen implicitly through `POST`, `PATCH`, `PUT` and `DELETE`, and there's no separate transitions call [User 2026-11-23 Q8].
4. **'Completed – awaiting Transfer' in a central store.** Today this status covers stages not yet sent, including when Connectivity fails [AP02 L857 YY025]. With a central store, sharing happens the moment a stage is completed, so the status has no clear meaning.
   > ⚠️ **Speculation:** a deliberate "complete now, share later" may still be wanted by practitioners. Confirm with users before dropping it.

   **Decided 2026-11-23:** a stage that's signed off locally but not yet accepted by the platform is still partial. The platform's acceptance of the `PUT` is what completes it [User 2026-11-23 Q7].
5. **What "delete on reject" becomes.** Today the rejecting YJS deletes the framework [AP02 L850 YY005] or stage [AP02 L863 YY009]. In a central store, does a rejected shared stage stay in the child's history? If so, who sees it, and does the next stage pre-populate from it? (See option B.)

   **Decided 2026-11-23:** a rejected stage stays as a read-only record. It's replaced by a new stage that links to it with `supersedes`, with no content copied across [User 2026-11-23 Q11, Q24]. ⚠️ Inferred, not confirmed: it stays visible to every reader. Pre-population (item 6) is still open.

   **Confirmed 2026-11-26:** the rejected stage stays in the rejecting organisation's record too, unlike YY009's deletion, and the originator replaces it with a new stage that `supersedes` it [User 2026-11-26].
6. **Pre-population across organisations.** New stages pre-populate from the last one [AP02 L532 GE005], using one of four rules per data item [AP03 'Data Item pre population rules' rows 3–9; AP03 'Data Items CONSOLIDATED' col O].
   - If the SE's stage is rejected by the YJS, which stage does the next YJS stage pre-populate from? **Partly answered 2026-11-26:** the YJS's open stage is rebased onto the rejected stage, and can record where it disagrees [User 2026-11-26]. Pre-population of a *new* stage is still open.
   - In a central store the server could apply these rules when it creates a stage, rather than every client implementing them.
   > ⚠️ **Speculation:** doing it on the server would make pre-population consistent across clients, but the API would then own a large rule set.
7. **Concurrent stages across parties.** Today each CMS has its own "one stage in progress" rule. Cross-system locking was never built [AP02 L881 SE015 "W"]. The draft already allows partial stages per organisation and "rebases" them [swagger.yaml L252–254]. The interaction with caretaking review needs designing: what happens if the YJS has a partial stage open when the SE shares a stage?

   **Decided 2026-11-23:** one partial stage per child per organisation [User 2026-11-23 Q28]. Overlapping changes are handled by the concurrency model in option J [Q3, Q4, Q18].

   **Decided 2026-11-26:** an organisation can't complete its open stage until it has reviewed every stage the other party has completed for the child, and rebased onto it. See option B [User 2026-11-26; DSYNC p1].

   **Changed 2026-11-26:** one exception to one partial stage per organisation. A stage of the Review type may be open alongside the organisation's partial stage while it takes in another organisation's completed stage, as on the slide [User 2026-11-26; DSYNC p1]. ⚠️ Inferred, not confirmed: at most one such Review stage at a time.
8. **Three-way arrangements (Home YJS, Host YJS, SE).** These are real situations, but the routing rules were de-scoped [AP02 L894–897]. SE001 says updates go "between the Secure Establishment and Home YOT only" [AP02 L874], that is, the Home YJS. In a central store, all three parties could see the same record. Who must review a shared stage? The v12 schema says the originating organisation is needed for three-way Home/Host/SE sharing [AssessmentTransfer L362], so this seems to happen in practice.

   **Decided 2026-11-23:** the Home YJS is the hub. It reviews every stage completed by the Host YJS or the SE, and its own stages are reviewed by the active caretaker [User 2026-11-23 Q34]. Still open: if a Host YJS and an SE are both active caretakers, which of them reviews the Home YJS's stages?
9. **Placement Service as a separate client.** Placements and the SE use the same client system today but may diverge [User 2026-11-19]. That needs its own role, a work queue, and a decision step.
   - The YJS's input to placement is stage data: an initial recommendation of establishment *type*, whether there's an establishment the child should not go to, and anything else Placements should know [AssessmentTransfer L1148–1186; PROTO 'Custody' rows 218–238].
   - The Placement Service's decision, meaning which establishment, appears nowhere in the schema.

   **Decided 2026-11-23:** the Placement Service uses a web UI on an internal platform API, so its work queue and decision step are internal [User 2026-11-23 Q35, Q36]. See option D.
10. **Secure estate → YJS direction.** No source describes the SE initiating anything other than sharing a stage. Transfers between secure establishments, such as moving a young person between a YOI and an STC, aren't covered.
    > ⚠️ **Speculation:** this happens in practice and would currently need the Home YJS to end one arrangement and start another, which SE020 forces [AP02 L877].
11. **Release.** Ending caretaking is tied to leaving custody [AP02 L890 SE008]. The Leaving Custody module (Notice of Supervision/Licence, Release Arrangements) [AP02 L758 CO002] is the data that matters at that point. Whether SE caretaking should end automatically on release, by the Home YJS, or by either party is open (Q24).
12. **Attachments and their access control.** These include sensitive scanned documents [AP02 L537 GE019], with virus scanning, size limits, retention, and visibility to the caretaker.

    **Decided 2026-11-23:** attachments follow the stage's lifecycle and are signed off with it [User 2026-11-23 Q43]. Uploads are scanned asynchronously (`202 Accepted`, then poll) [Q44]. `section` stays free text, with the inconsistency risk documented [Q45]. Size limits and retention are still open.
13. **Sensitive sections and restricted access.** Some sections may be restricted locally [AP02 L535 GE014]. How do these restrictions apply to a caretaker in another organisation?
14. **Countersignature state.** Completion needs sign-off [AP02 L525 GE059], and later edits invalidate it [AP02 L563 QA013]. The schema has two countersignatures per stage, one for Explanations & Conclusions and one for Pathways & Planning, each with a name, job title and date [AssessmentTransfer L334–335, L454–472]. That needs fields or endpoints.

    **Decided 2026-11-23:** the countersignatures are v12 fields in the `PUT` body, trusted by the platform [User 2026-11-23 Q15]. The CMS locks a stage once it sends the `PUT` [Q16]. Any fix after rejection, and any rebase, needs a new sign-off [Q17, Q18]. Cancelling also needs two people: the requester comes from the token, and the second signatory from an `X-Signoff-User` header [Q13, Q14].
15. **Identifier stability inside stage data.**
    - Offence, ASB, disposal and episode IDs are unique within one document only [AP06 L239, L662, L670]. Episodes are renumbered on merge [AP02 L870 YY014]. A central store needs stable IDs across stages.
    - The case itself is identified by an Assessment ID that embeds the sending CMS's own young-person ID [AssessmentTransfer L348]. The central `ypid` replaces this.
    - Migration (option F) needs a mapping from each CMS's Assessment IDs to `ypid`.
16. **Dynamic reference data.** Offence codes are validated by each CMS [AP06 L243]. Centrally, one service has to own the list and its versions. AP03 has a "Master List of Reference Data" for the static lists [AP03 'YJBDropDownLists' row 1]. But it dates from 2014, and the v12 schema has changed several lists since then (e.g. the remand decision and sentence type enumerations) [CaseTransfer L15–36].
17. **Supplier data.** AP06 carries non-AssetPlus CMS data [AP06 L249], and AP03 defines 109 such items [AP03 'Data Dictionary Master' rows 1069–1177]. The v12 schema has no SupplierData structure (see current-process.md §3.3). Should the central store hold this data, pass it through, or drop it?
18. **Notifications and reminders.** These are automatic today [AP02 L852 YY019, L887 SE014, L886 SE005]. The API needs an inbox, push notifications, or both (option C). **Decided 2026-11-23:** both (C3) [User 2026-11-23 Q38].
19. **Migration and coexistence.** Some CMSs will still speak AP06 XML over Connectivity while others use the API (option F). **Decided 2026-11-23:** an AP06 adapter (F2) [User 2026-11-23 Q40].
20. **Management information.** The YJMIS extract [AP02 L543 GE041] and the "Current Young Person ID" printed on plans [AP02 L697 PP016]. Transfer events are a likely MI need.
    > ⚠️ **Speculation.**
21. **Non-functional requirements.** These were in a separate NFR document we don't have [AP02 L178]: availability, audit retention, data protection. Not covered in the 2026-11-23 session, by the user's choice.
22. **Annual schema change and versioned stage data.**
    - The schema has had a major release most years since 2017, each tied to a financial year ("Various changes for 2027/28") [AssessmentTransfer L5–71].
    - Each entry in the stage index records the schema version of that stage [AssessmentTransfer L2678]. So one child's history mixes stages recorded under different schemas.
    - The API needs a way to version `Stage.data`, and to say whether old stages are migrated or kept as recorded.

    **Decided 2026-11-23:** stored stages are kept as recorded and never migrated [User 2026-11-23 Q30]. The version is a `schema_version` field in the `Stage` body; the user chose this over a media-type parameter [Q31]. A partial stage open across a schema change can be completed under its old version during a grace period set by YJB [Q32].
23. **Case type.** Every stage has a case type (Prevention, OOCD, Offending or a combination) [AssessmentTransfer L249; SimpleTypes L291–301]. The case type limits which stage types are allowed [AP03 'Data Items CONSOLIDATED' row 4 cols AH–AL] and which questions are shown [AP03 'Data Dictionary Master' cols U–Z]. `../swagger.yaml` has no case type. **Decided 2026-11-23:** `POST …/stages` takes `case_type`, and the platform enforces the rules [User 2026-11-23 Q29].
24. **What DELETE of a stage means.** `../swagger.yaml` deleted stages that hadn't been signed off [swagger.yaml@2234377 L649–654]. Today a stage can't be deleted, only cancelled. Cancelling keeps the audit trail and needs a reason [AP02 L527 GE069], and cancelled stages still appear in the stage index sent to other parties [SimpleTypes L1731–1738]. See option I. **Decided 2026-11-23:** option I2, a soft cancel [User 2026-11-23 Q12]. **Made 2026-11-24** [swagger.yaml L520–526].
25. **Concurrency between the CMS copy and the platform copy.** *(Added 2026-11-23.)* Practitioners work in their CMS's local copy, which saves first and then pushes to the platform [User 2026-11-23 Q1, Q2]. So the API needs version tokens, a rule for stale pushes, and safe retries. See option J.
26. **Abandoned partial stages.** *(Added 2026-11-23.)* With no stop, a partial stage that's never finished stays on the platform. **Decided:** keep it and report on stale ones; nothing expires [User 2026-11-23 Q23]. The staleness threshold, and who the report goes to, are still open.

---

## 3. Design options

Each decision has two to four options. **★** marks a recommendation. **Decided** marks a choice made on 2026-11-23; the rest are still open for discussion.

| Option | Status after 2026-11-23 |
| :-- | :-- |
| A. Transfer model | **Decided:** A1 [User 2026-11-24 grill Q3]. Status changes use `PATCH /transfers/{id}` rather than action routes [Q7] |
| B. Review | **Decided:** B1, which follows from the decisions on reopening and rejection [User 2026-11-23 Q10, Q11, Q33] |
| C. Notifications | **Decided:** C3 [Q38] |
| D. Placement Service | **Decided:** D4, a new option (below) [Q35–Q37] |
| E. Stage payload | E1 not decided. The `schema_version` field and versioning rules are decided [Q30–Q32] |
| F. Migration | **Decided:** F2 [Q40, Q41] |
| G. Authorisation | Not decided. Users authenticate as individuals [Q14] |
| H. Audit | Not formally decided. A public `/history` is decided [Q39] |
| I. DELETE | **Decided:** I2, with the reason as a query-string code [Q12–Q14] |
| J. Concurrency | **Decided** (new option, below) [Q2–Q4, Q18, Q20–Q22] |

### A. How to model a transfer or caretaking arrangement

| Option | Description | Pros | Cons |
| :-- | :-- | :-- | :-- |
| **A1 ★ Transfer resource with a state machine** | `/children/{ypid}/transfers` and `/transfers/{id}` with `requested → accepted / rejected → ended`. This is what's drafted. **Decided 2026-11-24** [User 2026-11-24 grill Q3]. | Keeps today's accept/reject step and reason codes, so it's familiar to users and CMS suppliers. Clear audit. Easy to build an inbox. | One more resource. Access rules are derived from transfer state. |
| A2 Access grants on the child | `/children/{ypid}/access` grants with `role: home \| caretaker` and `status: pending \| active`. | Generic, and reusable for other sharing (e.g. probation, or read-only access for the Placement Service). | Loses the "transfer" vocabulary practitioners use. Accept/reject has to be layered on top. |
| A3 Message-compatible endpoint | `POST /messages` takes AP06-style headers (Message_Type, Message_ID, Assessment_ID) as JSON or XML. | Easiest migration for existing CMS suppliers. | Carries the point-to-point model into a central store. Weak REST semantics. Duplicates state. |

A3 can also be used **only** as a migration adapter alongside A1 (see F).

### B. Reviewing stages shared during caretaking

| Option | Description | Pros | Cons |
| :-- | :-- | :-- | :-- |
| **B1 ★ Review resource per shared stage** | Completing a stage while caretaking is active creates a pending review for the other party (`…/reviews`, `GET /reviews`). Rejection marks it `completed_rejected`. | Same as today [AP02 L886 SE005]. Easy to audit. | A rejected stage still exists centrally, so visibility and pre-population rules are needed (§2 items 5–6). |
| B2 Proposed-change model | The other party's stage is a *proposal*. It joins the child's timeline only when accepted, like a merge request. | Rejected content never pollutes the record. Fits naturally with the draft's "rebase" idea [swagger.yaml L254]. | More complex. Changes what "completed" means for the author. |
| B3 No review: single shared record | Any party with access completes stages straight into the record. Review becomes optional notification. | Simplest, and in the spirit of a central store. | **Policy change.** Removes a control YJSs rely on. Needs YJB/business sign-off. |

**Decided 2026-11-23: B1.** A `completed_shared` stage is final: the organisation that completed it can't reopen it [User 2026-11-23 Q10]. While it's under review, every reader can see it, along with its review status [Q33]. A rejected stage stays as a read-only record and is replaced by a new stage that `supersedes` it [Q11, Q24].

**Extended 2026-11-26**, after the data-sync slide [DSYNC p1; User 2026-11-26]:

- **The decision stays a separate act by a person**, recorded with `POST …/stages/{stageid}/reviews`, as today [AP06 L400; AP02 L886 SE005]. A rejection takes a reason from the update list and an optional description, and the originator is notified with it [AP02 L886 SE005]. The user chose this over putting the decision in the reviewer's own `PATCH`/`PUT`, or having the reviewer set a marker on the other organisation's stage.
- **A decision is final.** A YJS won't turn a rejection into an acceptance. The originator may instead issue a new, amended stage that `supersedes` the rejected one.
- **Completing is blocked until the other party's stages are taken in.** The platform refuses `PUT` with `422` while the caller has a review pending, or while the other party has completed a stage that the caller's open stage hasn't been rebased onto. Rejected stages are rebased onto too, and the caller's stage can record where it disagrees. The rule applies in both directions. A superseding stage counts as new, so it must be reviewed and taken in as well.
- **`based_on`** on the stage names the single latest stage it has been rebased onto, and stands for every stage before it. The user chose this over naming the last 3 stages or using a version number for the child's list of stages. ⚠️ Inferred, not confirmed: stages are ordered by when the platform accepted their completion (`completed_at`).
- **The stage type after a review isn't fixed.** The slide shows a "Review" stage, an existing type [current-process.md L100], but the API doesn't require it (Q27).
- **A Review stage may be open alongside the reviewer's other partial stage**, an exception to one partial stage per organisation (§2 item 7). The reviewer completes the Review stage first, then rebases its other partial stage onto it [User 2026-11-26; DSYNC p1]. `data-sync-sequence.md` shows the whole flow.
- **Two-person sign-off for the decision** is unconfirmed (Q26).

> **Inconsistency:** "rebase" now has two senses. Option J uses it for merging a stale push of the *same* stage. The slide and this section use it for taking in *another organisation's* completed stage.

### C. Notifications and reminders

| Option | Description | Pros | Cons |
| :-- | :-- | :-- | :-- |
| C1 Polling inbox | `GET /transfers?direction=incoming&status=requested`, `GET /reviews?status=pending` | Simple. Every client can do it. | Latency and load. Reminders are left to the client. |
| C2 Webhooks | `POST /subscriptions` with event types | Timely. Suits CMSs with back ends. | Needs callback hosting, security and retries. Harder for small suppliers. |
| **C3 ★ Both** | The inbox is the source of truth; webhooks are optional hints | Robust. Lets suppliers adopt gradually. | Two mechanisms to maintain. |

**Decided 2026-11-23: C3** [User 2026-11-23 Q38].

**Added 2026-11-26:** the `Notification` in a `PATCH` response is sent when another organisation's partial stage is new to the caller, or has been saved since the caller was last told about it. It says the stage exists or has changed, never what's in it [User 2026-11-26]. The user chose this over notifying only on changes since the caller's own last save. That would never report an idle partial stage that was last saved before the caller started theirs.

### D. Placement Service integration ⚠️ (neither source describes the mechanism)

| Option | Description | Pros | Cons |
| :-- | :-- | :-- | :-- |
| **D1 ★ Placement requests resource** | The YJS creates `/placement-requests`. The Placement Service records a decision, which creates the SE caretaking `Transfer`. This is what's drafted. | Matches SE001 "always via the Placement Service" [AP02 L874]. Works when Placements uses a different client from the SE [User 2026-11-19]. | Adds a resource. Needs the real placement workflow confirmed. |
| D2 Placement Service as a transfer initiator | The Placement Service calls `POST /children/{ypid}/transfers` on the YJS's behalf. | Fewer resources. | Hides the placement decision. The YJS isn't the requester of its own transfer. |
| D3 Out of the API | Placement stays in its own system and calls the API only to create the transfer. | Smallest scope. | Doesn't support separating the Placement and SE clients. |
| **D4 Decided: internal placement UI, minimal public route** *(added 2026-11-23)* | The Placement Service uses a web UI on an internal platform API, not a third-party system calling the public API [User 2026-11-23 Q35, Q36]. A YJS's CMS starts a placement with `POST /children/{ypid}/placement-requests`, and follows it with a `GET` [Q37]. The decision, and the choice of establishment, happen internally, and they create the SE caretaking transfer. | The public API stays small. Placements and the SE can still use different clients. | The internal API needs its own design. The Placement Service's actual process is still unknown (Q1). |

### E. Shape of the stage payload (`Stage.data`)

| Option | Description | Pros | Cons |
| :-- | :-- | :-- | :-- |
| **E1 ★ JSON that mirrors the v12 XSD structures** | One object per `Assessment_StageStructure` child (`Young_Persons_Details`, `Placement_Recommendation`, `Arrival_In_Custody`, …) [AssessmentTransfer L294–338]. Keyed by the data-dictionary field IDs that the XSD already gives in each element's documentation [e.g. AssessmentTransfer L246; AP03 'Data Dictionary Master' col B]. Each stage carries a `schema_version` [AssessmentTransfer L2678] | Direct mapping from today's schema; we now hold the XSDs and the data dictionary. Easy migration and adapter (F2). Field IDs give a stable key for `…/changes` | Inherits naming from 2014 onwards. Changes every year (§2 item 22). AP03 is v5.0 (2014), so newer items can only be described from the XSD |
| E2 Aligned to Person Standard / FHIR | Continue the draft's alignment [swagger.yaml L23, L786] down into the stage data | Interoperable with health and social care. | Big mapping effort. Much of AssetPlus has no FHIR equivalent. |
| E3 Section sub-resources | `…/stages/{stageid}/sections/{section}` | Partial reads and writes. Fine-grained access control (§2 item 13). | Many more routes. Harder to keep stages atomic. |

### F. Migration and coexistence with AP06 CMSs

| Option | Description | Pros | Cons |
| :-- | :-- | :-- | :-- |
| F1 Big bang | Every CMS moves to the API on one date | No dual running. | High risk across many suppliers. |
| **F2 ★ AP06 adapter** | A service translates AP06 XML from Connectivity into API calls (and back) until each CMS migrates | Gradual. Suppliers move at their own pace. | Must handle full-copy semantics against a central store. The adapter is throwaway. |
| F3 Phased by organisation type | Placement and SE first (one shared client today [User 2026-11-19]), then YJSs | Starts with the smallest, most uniform group. | YJS↔SE flows are mixed-mode until the YJSs move. |

**Decided 2026-11-23: F2** [User 2026-11-23 Q40]. When the platform answers `412` (option J) to a stage that came from an AP06 CMS, the adapter replies with an AP06 "Assessment Update Rejected" message and a reason such as "Conflict in stages" [Q41; AP02 L886 SE005].

### G. Authorisation (needed by F18 and §2 item 2)

| Option | Description |
| :-- | :-- |
| **G1 ★ Organisation and role claims in the token**, with the server enforcing relationships (party to the transfer, home vs caretaker) | Simple for clients. Matches SE009, where the YJS decides which roles may accept or reject [AP02 L891 SE009], if roles are configured per organisation. |
| G2 Fine-grained policy service (e.g. ABAC) | Handles restricted sections [AP02 L535 GE014] and proxy/manager overrides cleanly. Heavier. |

### H. Audit and history

| Option | Description |
| :-- | :-- |
| **H1 ★ Stage snapshots plus an event log** | Snapshots satisfy GE003 [AP02 L528]. An append-only event log (transfer and review events, edits) satisfies GE015 [AP02 L536]. Diffs come from snapshots, as AP06 implies [AP06 L256]. |
| H2 Event sourcing for everything | The full history can be replayed. More engineering. |

Under either option, the event log must record cancelled and deleted stages. GE069 requires the audit trail to be kept when a stage is cancelled [AP02 L527], and GE015 requires every change to be auditable [AP02 L536]. See option I.

**Decided 2026-11-23:** the event log is exposed publicly as `GET …/stages/{stageid}/history`, subject to partial-stage privacy [User 2026-11-23 Q39]. H1 vs H2 hasn't been decided. ⚠️ Inferred, not confirmed: `/changes` stays alongside `/history`.

### I. What `DELETE …/stages/{stageid}` means

Before 2026-11-24, `../swagger.yaml` had a `DELETE /children/{ypid}/stages/{stageid}` [swagger.yaml@2234377 L649–701] that:

- deleted a stage that hadn't been signed off and was created by the caller's organisation [swagger.yaml@2234377 L654]
- returned `403` for a signed-off stage or another organisation's stage [swagger.yaml@2234377 L675]
- returned `200` with an empty body

**Since 2026-11-24** it's a soft cancel, as option I2 [swagger.yaml L520–526].

What today's process says:

- **A stage is never deleted, only cancelled.** Cancelling can be done only by "the stage owner who created the Assessment stage", needs a reason, hides the stage, keeps the audit trail, reverts the assessment to the previous stage, and notifies users assigned sub-sections [AP02 L527 GE069].
- **Cancelled stages stay visible as index entries.** They still appear, with status Cancelled, in the stage index that goes to the other party [AssessmentTransfer L2675; SimpleTypes L1731–1738].
- **Completed stages can be cancelled too.** A stage can be cancelled from the caretaking statuses, which are all completed [AP02 L858 YY026]. The DELETE route can't do this, because it only applies to stages that haven't been signed off.
- **Partial stages are private to their organisation.** Only the creating organisation can see a partial stage [swagger.yaml L369]. So deleting one doesn't affect other parties' copies. It does affect the history that GE015 and the stage index expect.

| Option | Description | Pros | Cons |
| :-- | :-- | :-- | :-- |
| I1 Hard delete (as drafted) | DELETE removes an unsigned stage completely | Simplest. Normal REST. Fine for a draft that was started by mistake | Breaks GE069 (no reason, no audit trail kept) and GE015. Cancelled stages disappear from the stage history. The organisation-level rule is broader than GE069's owner-only rule |
| I2 DELETE as a soft cancel | DELETE sets the stage to `cancelled`, hides it from default lists, keeps the audit and an index entry, and reverts to the previous stage. The reason goes in a request body. `cancel` is removed from `…/transitions` so there's only one way to cancel | Keeps the route the team added. Meets GE069 if a reason is required. Familiar verb for clients | OpenAPI 3.0.4 allows a body on DELETE but says its semantics aren't well defined and it should be avoided. Some proxies and client libraries drop it. A "deleted" resource that's still returned with status `cancelled` can surprise client developers. Still can't cancel completed stages (YY026) unless the signed-off restriction is relaxed |
| **I3 ★ Cancel via `…/transitions` only; no DELETE** | `POST …/stages/{stageid}/transitions {action: cancel, reason}` is the only way to cancel, from in-progress or caretaking statuses. DELETE is removed, or returns `405` | One consistent model for every status change (complete, stop, cancel, re-open). The reason travels in a normal body. Covers YY026 cancels of completed stages. Fully meets GE069 and GE015 | Removes a route the team has just added. A non-REST verb for "get rid of this" |
| I4 Both, with separate meanings | DELETE is a hard delete, allowed only for a stage with no saved content (e.g. created by mistake within a short window). `cancel` covers everything else | Handles "oops" cases cleanly | Two concepts to explain. Needs a firm, testable rule for "no saved content". Still an audit gap unless the event log records the delete |

> ⚠️ **Speculation:** I3 is recommended because GE069's required reason and kept audit trail fit a status change much better than a delete. If the team wants to keep DELETE for client convenience, I2 is the next best. Whichever is chosen, the event log (option H) should record the action.

**Decided 2026-11-23: I2, adapted.** I3 is ruled out because there's no transitions API [User 2026-11-23 Q8]. `DELETE` soft-cancels a **partial** stage [Q12]. It deals with I2's cons as follows:

- **No request body.** The reason is a code in the query string, `?reason=<code>`, from `GET /reference-data/cancellation-reasons` [Q13]. That's allowed because a code isn't personal data [session-context.md L104].
- **Two-person sign-off.** The requester comes from the auth token, and the second signatory goes in an `X-Signoff-User` header [Q14]. So anyone in the owning organisation may cancel, not just the owner [Q13].
- **Completed stages can't be cancelled.** This departs from YY026 [AP02 L858]. ⚠️ Inferred from Q10–Q12, not confirmed.
- **Gap:** no source gives the GE069 reasons as a list of codes.

### J. Concurrency between CMS copies and the platform *(added 2026-11-23)*

Practitioners work in their CMS's local copy. The CMS saves first, then pushes to the platform, and retries if the push fails [User 2026-11-23 Q1, Q2]. The platform's copy is what other organisations rely on. A change that hasn't been pushed doesn't exist for them, and the platform shows no flag for it [Q6].

**Decided** (each option was offered with alternatives, and the one closest to standard REST was labelled):

| Topic | Decision | Q |
| :-- | :-- | :-- |
| Version token | `ETag` on responses; `If-Match` on `PATCH` and `PUT` | Q20 |
| Stale push | The platform rebases it | Q3 |
| Conflict on the same field | The whole push is rejected. The later party resolves it in its CMS and pushes again; the CMS decides how to show this | Q4, Q5 |
| Stale `PUT`, no conflict | Rebased but not accepted; needs a new sign-off | Q18 |
| Status code | `412` for both outcomes, with `outcome: conflict` or `outcome: rebased` in the body; `409` keeps its single meaning | Q21 |
| Lost responses | An `Idempotency-Key` header, reused on every retry | Q22 |

⚠️ Inferred, not confirmed: a stale `PATCH` with no conflict is rebased and returns `200`.

Since 2026-11-26, "rebase" is also used for taking in another organisation's completed stage (option B). The two senses are different.

---

## 4. Suggested changes to existing routes in `../swagger.yaml`

**Updated 2026-11-24.** Most of these were made on 2026-11-24, in commit `6feec52`, through three patches in this folder (`api-patch-001-recommended-changes.patch`, `api-patch-002-shared-responses.patch`, `api-patch-003-shared-schemas.patch`). The user chose each change [User 2026-11-24]. "Changes made to `../swagger.yaml`" in the description of `proposed-transfer-api.yaml` summarises them. **Made** and **Not made** below mark each item. Citations of the old version are to `swagger.yaml@2234377`.

**Updated 2026-11-26.** A fourth patch, `api-patch-004-operation-ids.patch`, adds an `operationId` to each operation and fixes Redocly's warnings about trailing slashes on two paths, properties beside `$ref`s, and the unused `MinimalChildWithFieldNames` schema. Two of those fixes change behaviour: a `PATCH` of a stage returns `204 No Content`, or `200` with a `Notification` when someone else also has a partial stage open for the child; and `MinimalChild.DateOfBirth` is now nullable [User 2026-11-26]. The `swagger.yaml` line citations in this file were updated to the patched version.

The decisions of 2026-11-23 covered:

- implicit status changes through `POST`, `PATCH`, `PUT` and `DELETE`
- `ETag`, `If-Match` and `412`
- `Idempotency-Key`
- the soft `DELETE` with a reason code and an `X-Signoff-User` header
- new `Stage` fields
- schema-version rules (**not made**)
- `308` for merged-away `ypid`s (**not made**)

The list below is the original 2026-11-19 list, annotated where the decisions changed it.

- `POST /children/{ypid}/stages`:
  - document the "one stage in progress" rule [AP02 L520 GE034]
  - restrict stage types by organisation type [AP02 L520] and by case type [AP03 'Data Items CONSOLIDATED' row 4 cols AH–AL]
  - return `422` with `rule` when a rule fails
  - **Decided:** all three, with the rule as one partial stage per child *per organisation* [User 2026-11-23 Q28, Q29]. Also add `schema_version` [Q31] and an optional `supersedes` [Q24]. **Made 2026-11-24** [swagger.yaml L272–355]
- `GET /children/{ypid}/stages`:
  - add `type`, `status`, `completed_from` and `completed_to` filters for history [AP02 L528 GE003]
  - consider returning stopped and cancelled stages as summary entries, as the stage index does today [AssessmentTransfer L2667–2681]. There's no `stopped` status any more [User 2026-11-23 Q12]
  - **Not made** [User 2026-11-24]
- `Stage` schema: add these fields:
  - `stage_type`, with values from the v12 list [SimpleTypes L166–184]
  - `case_type` [SimpleTypes L291–301]
  - `status` (`StageStatus`)
  - `owner` and `proxy_owner` [AssessmentTransfer L266, L281; AP02 L522 GE066, L523 GE071]
  - `organisation`
  - `created_at` and `completed_at`
  - `schema_version` [AssessmentTransfer L2678]
  - the two countersignatures, each with name, job title and date [AssessmentTransfer L334–335, L454–472; AP02 L525 GE059]
  - **Decided 2026-11-23:** also `supersedes` / `superseded_by` [User 2026-11-23 Q24] and `attachment_ids` [Q43]. The countersignatures are trusted, not checked [Q15]
  - **Made 2026-11-24**, except `proxy_owner` [swagger.yaml L953–1028; User 2026-11-24]
- `PUT …/stages/{stageid}` **(added 2026-11-23):** an accepted `PUT` completes the stage. Its `200` must return the new status; before 2026-11-24 it returned only an optional `Notification` [swagger.yaml@2234377 L599–606] [User 2026-11-23 Q7, Q8]. **Made 2026-11-24**; the `Notification` was dropped from `PUT` [swagger.yaml L445–519; User 2026-11-24]
- `DELETE /children/{ypid}/stages/{stageid}` [swagger.yaml@2234377 L649–701]: decide option I first. **Decided 2026-11-23: I2** (see option I). Whichever option is chosen, these are worth fixing. **All made 2026-11-24** [swagger.yaml L520–561]:
  - The summary and description say "AssetPlus record", but the route deletes a Stage [swagger.yaml@2234377 L650, L654].
  - The description says the identifier goes in the request body, but it's in the path [swagger.yaml@2234377 L654].
  - It returns `200` with an empty body; `204 No Content` is the usual response for that.
  - "created by a user in their own organisation" reads awkwardly [swagger.yaml@2234377 L654].
  - Typo: "succesfully".
  - GE069 limits cancelling to the stage owner, not the organisation [AP02 L527]. **Decided:** keep the organisation-level rule, because the CMS runs a two-person sign-off first [User 2026-11-23 Q13].
  - It should return the stage as `cancelled`, not remove it, and take `?reason=<code>` and an `X-Signoff-User` header [Q12–Q14].
- ~~`GET /children/{ypid}`: return active transfers, or a custody indicator, so CMSs can show the case flag [AP02 L875 SE026] and "in custody" [AP02 L874 SE001].~~ **Superseded 2026-11-24:** the child resource carries neither. CMSs work out the case flag and "in custody" from `GET /children/{ypid}/transfers` [User 2026-11-24 grill Q6; User 2026-11-24].
- `PATCH`/`PUT …/stages/{stageid}`: the 403 rules [swagger.yaml L737] need to cover the caretaker's rights during an accepted caretaking transfer. **Not made** [User 2026-11-24]
- `PATCH`/`PUT …/stages/{stageid}` **(added 2026-11-26):** the blocking rule and `422` on `PUT`, and a `based_on` field on `Stage` (option B, extended 2026-11-26) [User 2026-11-26]. **Made 2026-11-26** through `api-patch-005-review-rebase.patch` [swagger.yaml L445–519, L999–1007; User 2026-11-26].
- `PATCH …/stages/{stageid}` and `POST …/stages` **(added 2026-11-26):** when the `PATCH` `Notification` is sent (option C), and the Review-stage exception to one partial stage per organisation (§2 item 7) [User 2026-11-26]. **Made 2026-11-26** through `api-patch-006-notifications-review-stage.patch` [swagger.yaml L284, L394–396, L420].
- Multiple AssetPlus records per child [todo.md L17]: decide between merging (`/merges`) and pushing stages down a level (`/children/{ypid}/assessments/{id}/stages`). This affects every stage route. **Decided 2026-11-23:** merging. A second record is an accidental duplicate, and stages stay flat [User 2026-11-23 Q25].

---

## 5. Open questions

| # | Question | Why it matters |
| :-- | :-- | :-- |
| Q1 | How does the Placement Service work today, and what system and messages does it use? | Option D is speculative without this. **Partly answered:** in future the Placement Service will use a web UI on an internal API [User 2026-11-23 Q35, Q36]. How it works *today* is still unknown. |
| Q2 | Can an SE reject an initial caretaking transfer, and on what grounds? | AP02 doesn't say; AP06 implies it can [current-process.md §4.2]. **Answered:** yes, it must accept or reject [User 2026-11-24 grill Q1]. A rejection sends the placement request back to the Placement Service [Q2]. The grounds are a separate list whose values YJB will set (Q25). |
| Q3 | Should the SE review YJS-shared stages, or only the YJS review SE-shared ones? | SE005 is one-directional [AP02 L886]. **Answered:** both. The Home YJS reviews stages from the SE, and the active caretaker reviews the Home YJS's stages [User 2026-11-23 Q34]. |
| Q4 | In a central store, should rejected shared stages stay visible? | Option B choice; §2 items 5–6. **Partly answered:** they stay as read-only records, replaced by a new stage [User 2026-11-23 Q11, Q24]. ⚠️ Visibility to everyone is inferred, not confirmed. |
| Q5 | How should three-way Home/Host/SE cases work? | §2 item 8. **Answered:** the Home YJS is the hub [User 2026-11-23 Q34]. Still open: if a Host YJS and an SE are both caretaking, which reviews the Home YJS's stages? |
| Q6 | Is supplier data (`sd*`) still needed? Was it deliberately dropped from the schema after v2.0? | AP03 defines 109 items [AP03 'Data Dictionary Master' rows 1069–1177]; v12 has no SupplierData schema [current-process.md §3.3]. |
| Q7 | ~~Can we get the Data Items workbook 5.0 and the XSDs?~~ **Answered:** both supplied on 2026-11-19 [User 2026-11-19]. Follow-up: is there a data dictionary and "accompanying documentation" that matches schema v12? | AP03 is v5.0 (2014) and the Prototype goes "up to schema v11" [PROTO 'Please Read' row 5]; option E1 needs the current item definitions. |
| Q8 | Is the EYE interim format (SE010) still in use anywhere? | [AP02 L892] |
| Q9 | How do transfers between secure establishments happen today? | §2 item 10. |
| Q10 | Do practitioners need "complete now, share later" ('Completed – awaiting Transfer')? | §2 item 4. **Answered:** no. A stage that's signed off but not yet accepted by the platform is simply partial [User 2026-11-23 Q7]. |
| Q11 | Is the stage trigger table available elsewhere? | Empty in our copy [AP02 L919]. AP03 and the Prototype don't have it either [current-process.md §3.2]. |
| Q12 | Which of today's live systems implement the case transfer schema, and at which version? | The v12 release history suggests live use ⚠️ [AssessmentTransfer L5–71], but no source names the CMSs. |
| Q13 | Which option I behaviour do we want for `DELETE …/stages/{stageid}`? | GE069 requires a reason and a kept audit trail [AP02 L527]; the route as drafted did neither [swagger.yaml@2234377 L654]. **Answered:** I2, a soft cancel [User 2026-11-23 Q12–Q14]. |
| Q14 | Where can we get OU codes for secure establishments and the Placement Service, and a current YJS list? | `GET /organisations` needs them; AP03 has YJSs only, as of 2014 [AP03 'YOT Full List']. **Partly answered:** YJB will maintain the list in the platform [User 2026-11-23 Q46]. The initial data is still needed. |
| Q15 | How should the API handle the annual schema change: version `Stage.data`, migrate old stages, or both? | §2 item 22; [AssessmentTransfer L2678]. **Answered:** version it, don't migrate, and allow a grace period [User 2026-11-23 Q30–Q32]. |
| Q16 | Is the Assessment ID's "YJS 2-letter code" a part of the 7-character OU code, or a separate code? | The two formats don't match [AssessmentTransfer L348; AP03 'YOT Full List']. Matters for migrating IDs (§2 item 15). |
| Q17 | What are the codes for cancelling a stage? *(Added 2026-11-23.)* | `DELETE` takes a reason code [User 2026-11-23 Q13], but today's reason seems to be free text [AP02 L527 GE069], and no source lists codes. **For YJB** [User 2026-11-24]. |
| Q18 | What are the thresholds and periods? *(Added 2026-11-23.)* | Staleness of partial stages, and who gets the report [Q23]; the schema-change grace period [Q32]; how long `Idempotency-Key`s are kept [Q22]. |
| Q19 | If a Host YJS and an SE are both active caretakers, which reviews the Home YJS's stages? *(Added 2026-11-23.)* | Q34 covers stages *from* the caretakers, not this case. **For YJB** [User 2026-11-24]. |
| Q20 | What should downloading an attachment return before its scan finishes? *(Added 2026-11-23.)* | `proposed-transfer-api.yaml` uses `409` as a placeholder, which overlaps the identifier-mismatch meaning. |
| Q21 | Can the seven inferences in the 2026-11-23 summary be confirmed? *(Added 2026-11-23.)* | They fill gaps the session didn't ask about directly. They're marked ⚠️ in `.grill-me/assetplus-api-design-20261123T1315-summary.md` and in this file. |
| Q22 | What are the attachment size limits and retention period? *(Added 2026-11-23.)* | §2 item 12; not covered in the session. **For YJB** [User 2026-11-24]. |
| Q23 | What are the non-functional requirements? *(Added 2026-11-23.)* | §2 item 21; deliberately not covered in the session. |
| Q24 | How should secure-estate caretaking end in a central store? *(Added 2026-11-24.)* | SE008 says the system must allow the Home YJS to end it when the young person leaves custody [AP02 L890], but doesn't rule out ending automatically on release or by the SE. Also: does the SE keep read access afterwards; what if the child leaves custody without returning to the YJS (§2 item 10); and what happens to an SE stage still in progress? Needs YJB input [User 2026-11-24 grill Q5]. |
| Q25 | What are the reasons a secure establishment can give for rejecting a transfer? *(Added 2026-11-24.)* | Today's initial-transfer list [AP06 L336–347] has no reasons about the placement itself. A separate `se-transfer-rejection-reasons` list is decided; YJB is to set its values [User 2026-11-24 grill Q8]. |
| Q26 | Does accepting or rejecting a stage shared by the other party need the same two-person sign-off as completing a stage? *(Added 2026-11-26.)* | Completing a stage needs two-person sign-off in the CMS [User 2026-11-23 Q15]. Today the YJS sets which roles may accept or reject [AP02 L891 SE009], but no source says whether two people must sign off the decision. The user believes it's needed but isn't certain. **For YJB** [User 2026-11-26]. |
| Q27 | After accepting a stage from a caretaker, which stage type does the YJS normally create next? Is it always "Review"? *(Added 2026-11-26.)* | The data-sync slide shows the YJS creating a "Review Stage" after accepting the SE's stage [DSYNC p1]. "Review" is one of the existing stage types that a YJS or SE can create [current-process.md L100; AP02 L520 GE034]. The API won't require a particular type after a review decision; this is to confirm practice. **For YJB** [User 2026-11-26]. |
