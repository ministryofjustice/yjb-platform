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

Citation format is as in [documents-list.md](documents-list.md). Anything marked ⚠️ is speculation.

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
| F3 | Create a stage, edit it, only one in progress | [AP02 L520 GE034] | 🟡 `POST/PATCH/PUT …/stages` [swagger.yaml L394–648]. The "one in progress" rule isn't stated; partial stages are per organisation [swagger.yaml L353–355] | Add the rule to the `POST …/stages` description (§4) |
| F4 | Complete (with sign-off), stop, cancel, re-open a stage | [AP02 L525–527 GE059/68/69; L858 YY026] | ❌ No status-change operation. Stage schema has no status [swagger.yaml L903–910] | `POST …/stages/{stageid}/transitions`, `StageStatus` |
| F5 | Choose destination by organisation (OU code) | [AP06 L272, L416–419] | ❌ | `GET /organisations` |
| F6 | Request caretaking transfer to the SE (all completed stages, never stopped ones) | [AP02 L874 SE001; AP06 §6.3.1] | ❌ | `POST /children/{ypid}/transfers` |
| F7 | Transfer preconditions: last stage complete and none in progress; one arrangement at a time | [AP02 L876 SE002, L877 SE020] | ❌ | `422` + `rule` on `POST …/transfers` |
| F8 | Flag case as requested / accepted / cleared | [AP02 L875 SE026] | ❌ | `Transfer.status`, `GET /children/{ypid}/transfers` |
| F9 | Automatic acknowledgement | [AP06 §6.3.2, L400] | n/a | Synchronous `201` replaces it |
| F10 | Person accepts or rejects a transfer, with a reason list | [AP06 §6.3.3, L336–347] | ❌ | `POST /transfers/{id}/acceptance`, `/rejection` |
| F11 | View assessment before deciding | [AP02 L850 YY005] | 🟡 `GET …/stages` exists, but the recipient has no access rule before acceptance | Access rule in the `POST …/transfers` description |
| F12 | No updates until accepted | [AP02 L878 SE019] | ❌ | Enforced by `Transfer.status` |
| F13 | Either side completes and shares a stage | [AP02 L882 SE004; AP06 §6.5.1] | 🟡 Either org can create stages; no sharing concept | `transitions` + `completed_shared` |
| F14 | Accept or reject a shared update, with a reason list, and reminders | [AP02 L886 SE005, L887 SE014] | ❌ | `POST …/stages/{stageid}/reviews`, `GET /reviews` |
| F15 | Identify changes in a received stage, PDF/print | [AP02 L888 SE006] | ❌ | `GET …/stages/{stageid}/changes` (JSON or PDF) |
| F16 | Caretaking statuses ('awaiting Transfer', 'Transferred', 'rejected') | [AP02 L883 SE016, L857 YY025] | ❌ | `StageStatus` (see §2 on dropping 'awaiting Transfer') |
| F17 | Home YOT ends caretaking | [AP02 L890 SE008] | ❌ | `POST /transfers/{id}/ending` |
| F18 | Role-based permission to accept or reject | [AP02 L891 SE009] | ❌ No auth model | `403` + token roles (§3 option G) |
| F19 | Attachments listed and sent separately | [AP06 L260–266; AP02 L537 GE019] | ❌ | `…/stages/{stageid}/attachments` |
| F20 | Placement via the YJB Placement Service | [AP02 L874 SE001, L484] | ❌ | `/placement-requests` ⚠️ |
| F21 | Show that the young person is in custody | [AP02 L874 SE001] | ❌ | Derived from an accepted SE `Transfer` ⚠️, or a custody field on `CompleteChild` |
| F22 | Stage payload: core + triggered modules | [AP06 L361–378 Rule 4, L506–548] | 🟡 `Stage.data` is "structure TBC" [swagger.yaml L910] | Option E |
| F23 | History / snapshots by date or stage type | [AP02 L528 GE003] | 🟡 `GET …/stages` lists stages, with no date or type filters | Add `type`, `completed_from`, `completed_to` query params (§4) |
| F24 | Audit: who changed what and when | [AP02 L536 GE015; AP06 L256] | ❌ Not described | Option H |
| F25 | Merge duplicate AssetPlus records | [AP02 L870 YY014; todo.md L17] | ❌ | `POST /children/{ypid}/merges` |
| F26 | Controlled lists (rejection reasons, stage types) | [AP06 L241–243, L336–347; AP02 L520] | ❌ | `GET /reference-data/{list}` |
| F27 | Supplier (non-AssetPlus) data travels with the case | [AP06 L249, L882–892] | ❌ | Open question Q6 |
| F28 | Agree transfer "off-system" first | [AP06 L399] | n/a | Optional `note` on `TransferRequest` |
| F29 | Interim EYE-format output for SEs not on AssetPlus | [AP02 L892 SE010] | ❌ | Open question Q8 (probably obsolete ⚠️) |

**Adjacent (noted only):**
- YOT↔YOT complete transfer: the same `Transfer` resource with `type: complete`, plus the YY017/YY004/YY013 rules [AP02 L849, L848, L868].
- Y2A feed [AP02 L811 YA001].
- YJMIS extract [AP02 L543 GE041].

---

## 2. Scope we may have missed

These are areas the current process depends on that neither `../swagger.yaml` nor the earlier draft addresses.

1. **Organisations as first-class data.** Every transfer is addressed by OU code [AP06 L416]. We need an authoritative list of YOTs, SEs and the Placement Service, and a link between users and organisations.
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
6. **Pre-population across organisations.** New stages pre-populate from the last one [AP02 L532 GE005]. If the SE's stage is rejected by the YOT, which stage does the next YOT stage pre-populate from?
7. **Concurrent stages across parties.** Today each CMS has its own "one stage in progress" rule. Cross-system locking was never built [AP02 L881 SE015 "W"]. The draft already allows partial stages per organisation and "rebases" them [swagger.yaml L353–355]. The interaction with caretaking review needs designing: what happens if the YOT has a partial stage open when the SE shares a stage?
8. **Three-way arrangements (Home YOT, Host YOT, SE).** These are real situations, but the routing rules were de-scoped [AP02 L894–897]. SE001 says updates go "between the Secure Establishment and Home YOT only" [AP02 L874]. In a central store, all three parties could see the same record. Who must review a shared stage?
9. **Placement Service as a separate client.** Placements and the SE use the same client system today but may diverge [User 2026-11-19]. That needs its own role, a work queue, and a decision step.
10. **Secure estate → YOT direction.** No source describes the SE initiating anything other than sharing a stage. Transfers between secure establishments, such as moving a young person between a YOI and an STC, aren't covered.
    > ⚠️ **Speculation:** this happens in practice and would currently need the Home YOT to end one arrangement and start another, which SE020 forces [AP02 L877].
11. **Release.** Ending caretaking is tied to leaving custody [AP02 L890 SE008]. The Leaving Custody module (Notice of Supervision/Licence, Release Arrangements) [AP02 L758 CO002] is the data that matters at that point.
12. **Attachments and their access control.** These include sensitive scanned documents [AP02 L537 GE019], with virus scanning, size limits, retention, and visibility to the caretaker.
13. **Sensitive sections and restricted access.** Some sections may be restricted locally [AP02 L535 GE014]. How do these restrictions apply to a caretaker in another organisation?
14. **Countersignature state.** Completion needs sign-off [AP02 L525 GE059], and later edits invalidate it [AP02 L563 QA013]. That needs fields or endpoints.
15. **Identifier stability inside stage data.** Offence, ASB, disposal and episode IDs are unique within one document only [AP06 L239, L662, L670]. Episodes are renumbered on merge [AP02 L870 YY014]. A central store needs stable IDs across stages.
16. **Dynamic reference data.** Offence codes are validated by each CMS [AP06 L243]. Centrally, one service has to own the list and its versions.
17. **Supplier data.** The schema carries non-AssetPlus CMS data [AP06 L249]. Should the central store hold it, pass it through, or drop it?
18. **Notifications and reminders.** These are automatic today [AP02 L852 YY019, L887 SE014, L886 SE005]. The API needs an inbox, push notifications, or both (option C).
19. **Migration and coexistence.** Some CMSs will still speak AP06 XML over Connectivity while others use the API (option F).
20. **Management information.** The YJMIS extract [AP02 L543 GE041] and the "Current Young Person ID" printed on plans [AP02 L697 PP016]. Transfer events are a likely MI need.
    > ⚠️ **Speculation.**
21. **Non-functional requirements.** These were in a separate NFR document we don't have [AP02 L178]: availability, audit retention, data protection.

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
| **E1 ★ JSON that mirrors the AP06 sections** | One object per AP06 structure (`Young_Persons_Details`, `Custody`, …), keyed by data-dictionary field references [AP06 L233–235] | Direct mapping from the current schema. Easy migration and adapter (F2). | Inherits 2014 structure and naming. Needs the Data Items workbook, which we don't have. |
| E2 Aligned to Person Standard / FHIR | Continue the draft's alignment [swagger.yaml L23, L757] down into the stage data | Interoperable with health and social care. | Big mapping effort. Much of AssetPlus has no FHIR equivalent. |
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

---

## 4. Suggested changes to existing routes in `../swagger.yaml` (not made; that file is outside this folder)

- `POST /children/{ypid}/stages`: document the "one stage in progress" rule [AP02 L520 GE034], restrict stage types by organisation type [AP02 L520], and return `422` with `rule` when a rule fails.
- `GET /children/{ypid}/stages`: add `type`, `status`, `completed_from` and `completed_to` filters for history [AP02 L528 GE003].
- `Stage` schema: add `stage_type`, `status` (`StageStatus`), `owner`, `organisation`, `created_at`, `completed_at`, and sign-off state [AP02 L522 GE066, L525 GE059].
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
| Q6 | Is supplier data (`sd*`) still needed? | [AP06 L249] |
| Q7 | Can we get the Data Items workbook 5.0 and the XSDs? | Needed for option E1 and to define `Stage.data` [documents-list.md]. |
| Q8 | Is the EYE interim format (SE010) still in use anywhere? | [AP02 L892] |
| Q9 | How do transfers between secure establishments happen today? | §2 item 10. |
| Q10 | Do practitioners need "complete now, share later" ('Completed – awaiting Transfer')? | §2 item 4. |
| Q11 | Is the stage trigger table available elsewhere? | Empty in our copy [AP02 L919]. |
| Q12 | Which of today's live systems actually implement AP06 v2.0? | The sources are 2014 specifications [AP06 L300–302]. |
