# AssetPlus transfer: API scope, gaps and options

This document does four things:
1. Lists the functions the **current** AssetPlus transfer process provides (described in [current-process.md](current-process.md)).
2. Checks whether the **intended** API ([`../swagger.yaml`](../swagger.yaml)) covers each one.
3. Proposes routes for the gaps, drafted in [proposed-transfer-api.yaml](proposed-transfer-api.yaml).
4. Sets out design options for us to choose between.

**Scope** [User 2026-11-19]:
- YOT ↔ Secure Estate caretaking, including the YJB Placement Service, mapped in full.
- YOT ↔ YOT and Y2A noted only.
- The new API is a **central store**.
- `../swagger.yaml` is our intent for the new API. Requirements marked "Wont" in AP02 are *not* treated as current functionality.

Citation format is as in [documents-list.md](documents-list.md) and [current-process.md](current-process.md). Anything marked ⚠️ is speculation.

**Updated 2026-11-19** to use the AP 03 data dictionary, the Prototype workbook and the v12.0.0 XSDs. It also covers `DELETE /children/{ypid}/stages/{stageid}`, which was added to `../swagger.yaml` in commit `2234377` (see F4 and option I).

---

## 1. Function inventory and coverage

Coverage values:
- ✅ covered by `../swagger.yaml`
- 🟡 partly covered
- ❌ not covered

"Proposed" refers to routes in `proposed-transfer-api.yaml`.

| # | Current function | Source | Coverage in `../swagger.yaml` | Proposed |
| :-- | :-- | :-- | :-- | :-- |
| F1 | Identify and find a young person | [AP06 L209, L323] | ✅ `GET /children`, `POST /children/search`, `GET /children/{ypid}` [swagger.yaml L35–343] | — |
| F2 | Create a record for an unknown young person | Unknown/Known process maps [AP02 L707–735] (images only) | ✅ `POST /children` [swagger.yaml L139] | — |
| F3 | Create a stage, edit it, only one in progress. Available stage types depend on organisation type and case type | [AP02 L520 GE034; AP03 'Data Items CONSOLIDATED' row 4 cols AH–AL; AssessmentTransfer L249] | 🟡 `POST/PATCH/PUT …/stages` [swagger.yaml L394–648]. The "one in progress" rule isn't stated; partial stages are per organisation [swagger.yaml L353–355]. There's no case type | Add the rules and a `case_type` to `POST …/stages` (§4) |
| F4 | Complete (with sign-off), stop, cancel, re-open a stage | [AP02 L525–527 GE059/68/69; L858 YY026] | 🟡 `DELETE …/stages/{stageid}` removes a stage that hasn't been signed off [swagger.yaml L649–654]. That is closest to GE069 "cancel", but it differs: there's no reason, it's limited by organisation rather than owner, and it's a hard delete rather than "hidden, audit trail retained". There's no way to complete, stop or re-open, and the Stage schema has no status [swagger.yaml L956–963] | `POST …/stages/{stageid}/transitions`, `StageStatus`; option I decides how DELETE and `cancel` fit together |
| F5 | Choose destination by organisation (OU code) | [AP06 L272, L416–419; AssessmentTransfer L360–365] | ❌ | `GET /organisations`. AP03 lists the 258 YOTs with OU codes [AP03 'YOT Full List']; no source lists SEs or the Placement Service |
| F6 | Request caretaking transfer to the SE (all completed stages, never stopped ones) | [AP02 L874 SE001; AP06 §6.3.1] | ❌ | `POST /children/{ypid}/transfers` |
| F7 | Transfer preconditions: last stage complete and none in progress; one arrangement at a time | [AP02 L876 SE002, L877 SE020] | ❌ | `422` + `rule` on `POST …/transfers` |
| F8 | Flag case as requested / accepted / cleared | [AP02 L875 SE026] | ❌ | `Transfer.status`, `GET /children/{ypid}/transfers` |
| F9 | Automatic acknowledgement | [AP06 §6.3.2, L400] | n/a | Synchronous `201` replaces it |
| F10 | Person accepts or rejects a transfer, with a reason list | [AP06 §6.3.3, L336–347; SimpleTypes L1119–1131, L1342–1353] | ❌ | `POST /transfers/{id}/acceptance`, `/rejection` |
| F11 | View assessment before deciding | [AP02 L850 YY005] | 🟡 `GET …/stages` exists, but the recipient has no access rule before acceptance | Access rule in the `POST …/transfers` description |
| F12 | No updates until accepted | [AP02 L878 SE019] | ❌ | Enforced by `Transfer.status` |
| F13 | Either side completes and shares a stage | [AP02 L882 SE004; AP06 §6.5.1] | 🟡 Either org can create stages; no sharing concept | `transitions` + `completed_shared` |
| F14 | Accept or reject a shared update, with a reason list, and reminders | [AP02 L886 SE005, L887 SE014] | ❌ | `POST …/stages/{stageid}/reviews`, `GET /reviews` |
| F15 | Identify changes in a received stage, PDF/print | [AP02 L888 SE006] | ❌ | `GET …/stages/{stageid}/changes` (JSON or PDF) |
| F16 | Caretaking statuses ('awaiting Transfer', 'Transferred', 'rejected') | [AP02 L883 SE016, L857 YY025] | ❌ | `StageStatus` (see §2 on dropping 'awaiting Transfer'). These statuses are local to each CMS today; they're not in the schema [SimpleTypes L1731–1738] |
| F17 | Home YOT ends caretaking | [AP02 L890 SE008] | ❌ | `POST /transfers/{id}/ending` |
| F18 | Role-based permission to accept or reject | [AP02 L891 SE009] | ❌ No auth model | `403` + token roles (§3 option G) |
| F19 | Attachments listed and sent separately | [AP06 L260–266; AP02 L537 GE019; AssessmentTransfer L2679–2690] | ❌ | `…/stages/{stageid}/attachments`. v12 lists each file by section and document name |
| F20 | Placement via the YJB Placement Service | [AP02 L874 SE001, L484; AssessmentTransfer L1148–1186] | 🟡 The placement recommendation (establishment type, exclusions, notes for Placements) is stage data, so it would sit in `Stage.data`. There's no placement decision | `/placement-requests` ⚠️ |
| F21 | Show that the young person is in custody | [AP02 L874 SE001] | ❌ | Derived from an accepted SE `Transfer` ⚠️. AP03 has a system-calculated "Young person currently in custody" item that is *not* transferred [AP03 'Data Dictionary Master' row 1026], which supports deriving it on the server rather than storing it |
| F22 | Stage payload: core + triggered modules | [AP06 L361–378 Rule 4, L506–548; AssessmentTransfer L294–338] | 🟡 `Stage.data` is "structure TBC" [swagger.yaml L963] | Option E. Now possible to work out from the v12 XSDs and AP03 |
| F23 | History / snapshots by date or stage type | [AP02 L528 GE003] | 🟡 `GET …/stages` lists stages, with no date or type filters | Add `type`, `completed_from`, `completed_to` query params (§4) |
| F24 | Audit: who changed what and when | [AP02 L536 GE015; AP06 L256] | ❌ Not described. The new DELETE route risks losing audit history (option I) | Option H |
| F25 | Merge duplicate AssetPlus records | [AP02 L870 YY014; todo.md L17] | ❌ | `POST /children/{ypid}/merges` |
| F26 | Controlled lists (rejection reasons, stage types, case types) | [AP06 L241–243, L336–347; AP02 L520; SimpleTypes L166–184, L291–301, L1342–1353; AP03 'YJBDropDownLists'] | ❌ | `GET /reference-data/{list}` |
| F27 | Supplier (non-AssetPlus) data travels with the case | [AP06 L249, L882–892; AP03 'Data Dictionary Master' rows 1069–1177] | ❌ | Open question Q6. Not in the v12 schema |
| F28 | Agree transfer "off-system" first | [AP06 L399] | n/a | Optional `note` on `TransferRequest` |
| F29 | Interim EYE-format output for SEs not on AssetPlus | [AP02 L892 SE010] | ❌ | Open question Q8 (probably obsolete ⚠️) |
| F30 | Receiver sees an index of all the case's stages, including in-progress, stopped and cancelled ones, with their attachments | [AssessmentTransfer L336, L2667–2690; SimpleTypes L1731–1738] | 🟡 `GET …/stages` returns signed-off stages only [swagger.yaml L353] | Add a `status` filter and return stopped/cancelled stages as summaries (§4) |
| F31 | Each stage records the schema version it was written in; the schema changes every year | [AssessmentTransfer L2678, L5–71] | ❌ | `schema_version` on `Stage` (§2 item 22, option E) |
| F32 | Countersignature of Explanations & Conclusions and of Pathways & Planning | [AssessmentTransfer L334–335, L454–472; AP02 L525 GE059] | ❌ | Sign-off fields on `Stage` (§4); checked by the `complete` transition |

**Adjacent (noted only):**
- YOT↔YOT complete transfer: the same `Transfer` resource with `type: complete`, plus the YY017/YY004/YY013 rules [AP02 L849, L848, L868].
- Y2A feed [AP02 L811 YA001].
- YJMIS extract [AP02 L543 GE041].

---

## 2. Scope we may have missed

These are areas the current process depends on that neither `../swagger.yaml` nor the earlier draft addresses.

1. **Organisations as first-class data.** Every transfer is addressed by OU code [AP06 L416; AssessmentTransfer L360–365]. We need an authoritative list of YOTs, SEs and the Placement Service, and a link between users and organisations.
   - AP03 has the YOT list: OU code, organisation name and Connectivity name for 258 YOTs [AP03 'YOT Full List'].
   - No source lists the secure establishments. The schema only knows an establishment's *type* (SCH, STC or YOI) [SimpleTypes L823–829], plus a free-text establishment name on arrival in custody [AssessmentTransfer L230].
   - The AP03 list dates from 2014. YOTs have since merged and been renamed.
   > ⚠️ **Speculation:** the list is very likely out of date.
2. **Authorisation model.** Things that depend on organisation and role:
   - who may accept or reject [AP02 L891 SE009]
   - which stage types each organisation type may create [AP02 L520 GE034]
   - manager override [AP02 L522 GE066]
   - proxy users [AP02 L523 GE071]

   The draft relies on "organisation making the request" [swagger.yaml L353] but defines no auth.
3. **Stage status and lifecycle.** Covered in F4/F16. Without it, the API can't enforce any transfer precondition.
4. **'Completed – awaiting Transfer' in a central store.** Today this status covers stages not yet sent, including when Connectivity fails [AP02 L857 YY025]. With a central store, sharing happens the moment a stage is completed, so the status has no clear meaning.
   > ⚠️ **Speculation:** a deliberate "complete now, share later" may still be wanted by practitioners. Confirm with users before dropping it.
5. **What "delete on reject" becomes.** Today the rejecting YOT deletes the framework [AP02 L850 YY005] or stage [AP02 L863 YY009]. In a central store, does a rejected shared stage stay in the child's history? If so, who sees it, and does the next stage pre-populate from it? (See option B.)
6. **Pre-population across organisations.** New stages pre-populate from the last one [AP02 L532 GE005], using one of four rules per data item [AP03 'Data Item pre population rules' rows 3–9; AP03 'Data Items CONSOLIDATED' col O].
   - If the SE's stage is rejected by the YOT, which stage does the next YOT stage pre-populate from?
   - In a central store the server could apply these rules when it creates a stage, rather than every client implementing them.
   > ⚠️ **Speculation:** doing it on the server would make pre-population consistent across clients, but the API would then own a large rule set.
7. **Concurrent stages across parties.** Today each CMS has its own "one stage in progress" rule. Cross-system locking was never built [AP02 L881 SE015 "W"]. The draft already allows partial stages per organisation and "rebases" them [swagger.yaml L353–355]. The interaction with caretaking review needs designing: what happens if the YOT has a partial stage open when the SE shares a stage?
8. **Three-way arrangements (Home YOT, Host YOT, SE).** These are real situations, but the routing rules were de-scoped [AP02 L894–897]. SE001 says updates go "between the Secure Establishment and Home YOT only" [AP02 L874]. In a central store, all three parties could see the same record. Who must review a shared stage? The v12 schema says the originating organisation is needed for three-way Home/Host/SE sharing [AssessmentTransfer L362], so this seems to happen in practice.
9. **Placement Service as a separate client.** Placements and the SE use the same client system today but may diverge [User 2026-11-19]. That needs its own role, a work queue, and a decision step.
   - The YOT's input to placement is stage data: an initial recommendation of establishment *type*, whether there's an establishment the child should not go to, and anything else Placements should know [AssessmentTransfer L1148–1186; PROTO 'Custody' rows 218–238].
   - The Placement Service's decision, meaning which establishment, appears nowhere in the schema.
10. **Secure estate → YOT direction.** No source describes the SE initiating anything other than sharing a stage. Transfers between secure establishments, such as moving a young person between a YOI and an STC, aren't covered.
    > ⚠️ **Speculation:** this happens in practice and would currently need the Home YOT to end one arrangement and start another, which SE020 forces [AP02 L877].
11. **Release.** Ending caretaking is tied to leaving custody [AP02 L890 SE008]. The Leaving Custody module (Notice of Supervision/Licence, Release Arrangements) [AP02 L758 CO002] is the data that matters at that point.
12. **Attachments and their access control.** These include sensitive scanned documents [AP02 L537 GE019], with virus scanning, size limits, retention, and visibility to the caretaker.
13. **Sensitive sections and restricted access.** Some sections may be restricted locally [AP02 L535 GE014]. How do these restrictions apply to a caretaker in another organisation?
14. **Countersignature state.** Completion needs sign-off [AP02 L525 GE059], and later edits invalidate it [AP02 L563 QA013]. The schema has two countersignatures per stage, one for Explanations & Conclusions and one for Pathways & Planning, each with a name, job title and date [AssessmentTransfer L334–335, L454–472]. That needs fields or endpoints.
15. **Identifier stability inside stage data.**
    - Offence, ASB, disposal and episode IDs are unique within one document only [AP06 L239, L662, L670]. Episodes are renumbered on merge [AP02 L870 YY014]. A central store needs stable IDs across stages.
    - The case itself is identified by an Assessment ID that embeds the sending CMS's own young-person ID [AssessmentTransfer L348]. The central `ypid` replaces this.
    - Migration (option F) needs a mapping from each CMS's Assessment IDs to `ypid`.
16. **Dynamic reference data.** Offence codes are validated by each CMS [AP06 L243]. Centrally, one service has to own the list and its versions. AP03 has a "Master List of Reference Data" for the static lists [AP03 'YJBDropDownLists' row 1]. But it dates from 2014, and the v12 schema has changed several lists since then (e.g. the remand decision and sentence type enumerations) [CaseTransfer L15–36].
17. **Supplier data.** AP06 carries non-AssetPlus CMS data [AP06 L249], and AP03 defines 109 such items [AP03 'Data Dictionary Master' rows 1069–1177]. The v12 schema has no SupplierData structure (see current-process.md §3.3). Should the central store hold this data, pass it through, or drop it?
18. **Notifications and reminders.** These are automatic today [AP02 L852 YY019, L887 SE014, L886 SE005]. The API needs an inbox, push notifications, or both (option C).
19. **Migration and coexistence.** Some CMSs will still speak AP06 XML over Connectivity while others use the API (option F).
20. **Management information.** The YJMIS extract [AP02 L543 GE041] and the "Current Young Person ID" printed on plans [AP02 L697 PP016]. Transfer events are a likely MI need.
    > ⚠️ **Speculation.**
21. **Non-functional requirements.** These were in a separate NFR document we don't have [AP02 L178]: availability, audit retention, data protection.
22. **Annual schema change and versioned stage data.**
    - The schema has had a major release most years since 2017, each tied to a financial year ("Various changes for 2027/28") [AssessmentTransfer L5–71].
    - Each entry in the stage index records the schema version of that stage [AssessmentTransfer L2678]. So one child's history mixes stages recorded under different schemas.
    - The API needs a way to version `Stage.data`, and to say whether old stages are migrated or kept as recorded.
23. **Case type.** Every stage has a case type (Prevention, OOCD, Offending or a combination) [AssessmentTransfer L249; SimpleTypes L291–301]. The case type limits which stage types are allowed [AP03 'Data Items CONSOLIDATED' row 4 cols AH–AL] and which questions are shown [AP03 'Data Dictionary Master' cols U–Z]. `../swagger.yaml` has no case type.
24. **What DELETE of a stage means.** `../swagger.yaml` now deletes stages that haven't been signed off [swagger.yaml L649–654]. Today a stage can't be deleted, only cancelled. Cancelling keeps the audit trail and needs a reason [AP02 L527 GE069], and cancelled stages still appear in the stage index sent to other parties [SimpleTypes L1731–1738]. See option I.

---

## 3. Design options

Each decision has two to four options. **★** marks a recommendation; all of them are open for discussion.

### A. How to model a transfer or caretaking arrangement

| Option | Description | Pros | Cons |
| :-- | :-- | :-- | :-- |
| **A1 ★ Transfer resource with a state machine** | `/children/{ypid}/transfers` and `/transfers/{id}` with `requested → accepted / rejected → ended`. This is what's drafted. | Keeps today's accept/reject step and reason codes, so it's familiar to users and CMS suppliers. Clear audit. Easy to build an inbox. | One more resource. Access rules are derived from transfer state. |
| A2 Access grants on the child | `/children/{ypid}/access` grants with `role: home \| caretaker` and `status: pending \| active`. | Generic, and reusable for other sharing (e.g. probation, or read-only access for the Placement Service). | Loses the "transfer" vocabulary practitioners use. Accept/reject has to be layered on top. |
| A3 Message-compatible endpoint | `POST /messages` takes AP06-style headers (Message_Type, Message_ID, Assessment_ID) as JSON or XML. | Easiest migration for existing CMS suppliers. | Carries the point-to-point model into a central store. Weak REST semantics. Duplicates state. |

A3 can also be used **only** as a migration adapter alongside A1 (see F).

### B. Reviewing stages shared during caretaking

| Option | Description | Pros | Cons |
| :-- | :-- | :-- | :-- |
| **B1 ★ Review resource per shared stage** | Completing a stage while caretaking is active creates a pending review for the other party (`…/reviews`, `GET /reviews`). Rejection marks it `completed_rejected`. | Same as today [AP02 L886 SE005]. Easy to audit. | A rejected stage still exists centrally, so visibility and pre-population rules are needed (§2 items 5–6). |
| B2 Proposed-change model | The other party's stage is a *proposal*. It joins the child's timeline only when accepted, like a merge request. | Rejected content never pollutes the record. Fits naturally with the draft's "rebase" idea [swagger.yaml L355]. | More complex. Changes what "completed" means for the author. |
| B3 No review: single shared record | Any party with access completes stages straight into the record. Review becomes optional notification. | Simplest, and in the spirit of a central store. | **Policy change.** Removes a control YOTs rely on. Needs YJB/business sign-off. |

### C. Notifications and reminders

| Option | Description | Pros | Cons |
| :-- | :-- | :-- | :-- |
| C1 Polling inbox | `GET /transfers?direction=incoming&status=requested`, `GET /reviews?status=pending` | Simple. Every client can do it. | Latency and load. Reminders are left to the client. |
| C2 Webhooks | `POST /subscriptions` with event types | Timely. Suits CMSs with back ends. | Needs callback hosting, security and retries. Harder for small suppliers. |
| **C3 ★ Both** | The inbox is the source of truth; webhooks are optional hints | Robust. Lets suppliers adopt gradually. | Two mechanisms to maintain. |

### D. Placement Service integration ⚠️ (neither source describes the mechanism)

| Option | Description | Pros | Cons |
| :-- | :-- | :-- | :-- |
| **D1 ★ Placement requests resource** | The YOT creates `/placement-requests`. The Placement Service records a decision, which creates the SE caretaking `Transfer`. This is what's drafted. | Matches SE001 "always via the Placement Service" [AP02 L874]. Works when Placements uses a different client from the SE [User 2026-11-19]. | Adds a resource. Needs the real placement workflow confirmed. |
| D2 Placement Service as a transfer initiator | The Placement Service calls `POST /children/{ypid}/transfers` on the YOT's behalf. | Fewer resources. | Hides the placement decision. The YOT isn't the requester of its own transfer. |
| D3 Out of the API | Placement stays in its own system and calls the API only to create the transfer. | Smallest scope. | Doesn't support separating the Placement and SE clients. |

### E. Shape of the stage payload (`Stage.data`)

| Option | Description | Pros | Cons |
| :-- | :-- | :-- | :-- |
| **E1 ★ JSON that mirrors the v12 XSD structures** | One object per `Assessment_StageStructure` child (`Young_Persons_Details`, `Placement_Recommendation`, `Arrival_In_Custody`, …) [AssessmentTransfer L294–338]. Keyed by the data-dictionary field IDs that the XSD already gives in each element's documentation [e.g. AssessmentTransfer L246; AP03 'Data Dictionary Master' col B]. Each stage carries a `schema_version` [AssessmentTransfer L2678] | Direct mapping from today's schema; we now hold the XSDs and the data dictionary. Easy migration and adapter (F2). Field IDs give a stable key for `…/changes` | Inherits naming from 2014 onwards. Changes every year (§2 item 22). AP03 is v5.0 (2014), so newer items can only be described from the XSD |
| E2 Aligned to Person Standard / FHIR | Continue the draft's alignment [swagger.yaml L23, L810] down into the stage data | Interoperable with health and social care. | Big mapping effort. Much of AssetPlus has no FHIR equivalent. |
| E3 Section sub-resources | `…/stages/{stageid}/sections/{section}` | Partial reads and writes. Fine-grained access control (§2 item 13). | Many more routes. Harder to keep stages atomic. |

### F. Migration and coexistence with AP06 CMSs

| Option | Description | Pros | Cons |
| :-- | :-- | :-- | :-- |
| F1 Big bang | Every CMS moves to the API on one date | No dual running. | High risk across many suppliers. |
| **F2 ★ AP06 adapter** | A service translates AP06 XML from Connectivity into API calls (and back) until each CMS migrates | Gradual. Suppliers move at their own pace. | Must handle full-copy semantics against a central store. The adapter is throwaway. |
| F3 Phased by organisation type | Placement and SE first (one shared client today [User 2026-11-19]), then YOTs | Starts with the smallest, most uniform group. | YOT↔SE flows are mixed-mode until the YOTs move. |

### G. Authorisation (needed by F18 and §2 item 2)

| Option | Description |
| :-- | :-- |
| **G1 ★ Organisation and role claims in the token**, with the server enforcing relationships (party to the transfer, home vs caretaker) | Simple for clients. Matches "YOT decides roles" [AP02 L891 SE009] if roles are configured per organisation. |
| G2 Fine-grained policy service (e.g. ABAC) | Handles restricted sections [AP02 L535 GE014] and proxy/manager overrides cleanly. Heavier. |

### H. Audit and history

| Option | Description |
| :-- | :-- |
| **H1 ★ Stage snapshots plus an event log** | Snapshots satisfy GE003 [AP02 L528]. An append-only event log (transfer and review events, edits) satisfies GE015 [AP02 L536]. Diffs come from snapshots, as AP06 implies [AP06 L256]. |
| H2 Event sourcing for everything | The full history can be replayed. More engineering. |

Under either option, the event log must record cancelled and deleted stages. GE069 requires the audit trail to be kept when a stage is cancelled [AP02 L527], and GE015 requires every change to be auditable [AP02 L536]. See option I.

### I. What `DELETE …/stages/{stageid}` means

`../swagger.yaml` now has `DELETE /children/{ypid}/stages/{stageid}` [swagger.yaml L649–701]. As drafted, it:

- deletes a stage that hasn't been signed off and was created by the caller's organisation [swagger.yaml L654]
- returns `403` for a signed-off stage or another organisation's stage [swagger.yaml L675]
- returns `200` with an empty body

What today's process says:

- **A stage is never deleted, only cancelled.** Cancelling can be done only by "the stage owner who created the Assessment stage", needs a reason, hides the stage, keeps the audit trail, reverts the assessment to the previous stage, and notifies users assigned sub-sections [AP02 L527 GE069].
- **Cancelled stages stay visible as index entries.** They still appear, with status Cancelled, in the stage index that goes to the other party [AssessmentTransfer L2675; SimpleTypes L1731–1738].
- **Completed stages can be cancelled too.** A stage can be cancelled from the caretaking statuses, which are all completed [AP02 L858 YY026]. The DELETE route can't do this, because it only applies to stages that haven't been signed off.
- **Partial stages are private to their organisation.** Only the creating organisation can see a partial stage [swagger.yaml L476]. So deleting one doesn't affect other parties' copies. It does affect the history that GE015 and the stage index expect.

| Option | Description | Pros | Cons |
| :-- | :-- | :-- | :-- |
| I1 Hard delete (as drafted) | DELETE removes an unsigned stage completely | Simplest. Normal REST. Fine for a draft that was started by mistake | Breaks GE069 (no reason, no audit trail kept) and GE015. Cancelled stages disappear from the stage history. The organisation-level rule is broader than GE069's owner-only rule |
| I2 DELETE as a soft cancel | DELETE sets the stage to `cancelled`, hides it from default lists, keeps the audit and an index entry, and reverts to the previous stage. The reason goes in a request body. `cancel` is removed from `…/transitions` so there's only one way to cancel | Keeps the route the team added. Meets GE069 if a reason is required. Familiar verb for clients | OpenAPI 3.0.4 allows a body on DELETE but says its semantics aren't well defined and it should be avoided. Some proxies and client libraries drop it. A "deleted" resource that's still returned with status `cancelled` can surprise client developers. Still can't cancel completed stages (YY026) unless the signed-off restriction is relaxed |
| **I3 ★ Cancel via `…/transitions` only; no DELETE** | `POST …/stages/{stageid}/transitions {action: cancel, reason}` is the only way to cancel, from in-progress or caretaking statuses. DELETE is removed, or returns `405` | One consistent model for every status change (complete, stop, cancel, re-open). The reason travels in a normal body. Covers YY026 cancels of completed stages. Fully meets GE069 and GE015 | Removes a route the team has just added. A non-REST verb for "get rid of this" |
| I4 Both, with separate meanings | DELETE is a hard delete, allowed only for a stage with no saved content (e.g. created by mistake within a short window). `cancel` covers everything else | Handles "oops" cases cleanly | Two concepts to explain. Needs a firm, testable rule for "no saved content". Still an audit gap unless the event log records the delete |

> ⚠️ **Speculation:** I3 is recommended because GE069's required reason and kept audit trail fit a status change much better than a delete. If the team wants to keep DELETE for client convenience, I2 is the next best. Whichever is chosen, the event log (option H) should record the action.

---

## 4. Suggested changes to existing routes in `../swagger.yaml` (not made; that file is outside this folder)

- `POST /children/{ypid}/stages`:
  - document the "one stage in progress" rule [AP02 L520 GE034]
  - restrict stage types by organisation type [AP02 L520] and by case type [AP03 'Data Items CONSOLIDATED' row 4 cols AH–AL]
  - return `422` with `rule` when a rule fails
- `GET /children/{ypid}/stages`:
  - add `type`, `status`, `completed_from` and `completed_to` filters for history [AP02 L528 GE003]
  - consider returning stopped and cancelled stages as summary entries, as the stage index does today [AssessmentTransfer L2667–2681]
- `Stage` schema: add these fields:
  - `stage_type`, with values from the v12 list [SimpleTypes L166–184]
  - `case_type` [SimpleTypes L291–301]
  - `status` (`StageStatus`)
  - `owner` and `proxy_owner` [AssessmentTransfer L266, L281; AP02 L522 GE066, L523 GE071]
  - `organisation`
  - `created_at` and `completed_at`
  - `schema_version` [AssessmentTransfer L2678]
  - the two countersignatures, each with name, job title and date [AssessmentTransfer L334–335, L454–472; AP02 L525 GE059]
- `DELETE /children/{ypid}/stages/{stageid}` [swagger.yaml L649–701]: decide option I first. Whichever option is chosen, these are worth fixing:
  - The summary and description say "AssetPlus record", but the route deletes a Stage [swagger.yaml L650, L654].
  - The description says the identifier goes in the request body, but it's in the path [swagger.yaml L654].
  - It returns `200` with an empty body; `204 No Content` is the usual response for that.
  - "created by a user in their own organisation" reads awkwardly [swagger.yaml L654].
  - Typo: "succesfully".
  - GE069 limits cancelling to the stage owner, not the organisation [AP02 L527].
- `GET /children/{ypid}`: return active transfers, or a custody indicator, so CMSs can show the case flag [AP02 L875 SE026] and "in custody" [AP02 L874 SE001].
- `PATCH`/`PUT …/stages/{stageid}`: the 403 rules [swagger.yaml L554, L622] need to cover the caretaker's rights during an accepted caretaking transfer.
- Multiple AssetPlus records per child [todo.md L17]: decide between merging (`/merges`) and pushing stages down a level (`/children/{ypid}/assessments/{id}/stages`). This affects every stage route.

---

## 5. Open questions

| # | Question | Why it matters |
| :-- | :-- | :-- |
| Q1 | How does the Placement Service work today, and what system and messages does it use? | Option D is speculative without this. |
| Q2 | Can an SE reject an initial caretaking transfer, and on what grounds? | AP02 doesn't say; AP06 implies it can [current-process.md §4.2]. |
| Q3 | Should the SE review YOT-shared stages, or only the YOT review SE-shared ones? | SE005 is one-directional [AP02 L886]. |
| Q4 | In a central store, should rejected shared stages stay visible? | Option B choice; §2 items 5–6. |
| Q5 | How should three-way Home/Host/SE cases work? | §2 item 8. |
| Q6 | Is supplier data (`sd*`) still needed? Was it deliberately dropped from the schema after v2.0? | AP03 defines 109 items [AP03 'Data Dictionary Master' rows 1069–1177]; v12 has no SupplierData schema [current-process.md §3.3]. |
| Q7 | ~~Can we get the Data Items workbook 5.0 and the XSDs?~~ **Answered:** both supplied on 2026-11-19 [User 2026-11-19]. Follow-up: is there a data dictionary and "accompanying documentation" that matches schema v12? | AP03 is v5.0 (2014) and the Prototype goes "up to schema v11" [PROTO 'Please Read' row 5]; option E1 needs the current item definitions. |
| Q8 | Is the EYE interim format (SE010) still in use anywhere? | [AP02 L892] |
| Q9 | How do transfers between secure establishments happen today? | §2 item 10. |
| Q10 | Do practitioners need "complete now, share later" ('Completed – awaiting Transfer')? | §2 item 4. |
| Q11 | Is the stage trigger table available elsewhere? | Empty in our copy [AP02 L919]. AP03 and the Prototype don't have it either [current-process.md §3.2]. |
| Q12 | Which of today's live systems implement the case transfer schema, and at which version? | The v12 release history suggests live use ⚠️ [AssessmentTransfer L5–71], but no source names the CMSs. |
| Q13 | Which option I behaviour do we want for `DELETE …/stages/{stageid}`? | GE069 requires a reason and a kept audit trail [AP02 L527]; the route as drafted does neither [swagger.yaml L654]. |
| Q14 | Where can we get OU codes for secure establishments and the Placement Service, and a current YOT list? | `GET /organisations` needs them; AP03 has YOTs only, as of 2014 [AP03 'YOT Full List']. |
| Q15 | How should the API handle the annual schema change: version `Stage.data`, migrate old stages, or both? | §2 item 22; [AssessmentTransfer L2678]. |
| Q16 | Is the Assessment ID's "YJS 2-letter code" a part of the 7-character OU code, or a separate code? | The two formats don't match [AssessmentTransfer L348; AP03 'YOT Full List']. Matters for migrating IDs (§2 item 15). |
