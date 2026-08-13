# Blockmediary Master Project Plan v2.1

> **Team:** Transakt\
> **Governance window:** 8 June 2026 to 14 August 2026\
> **Baseline gate:** Group Proposal Video submitted, 8 June 2026\
> **Closing gate:** Main Group Video due, 14 August 2026\
> **Status date:** 12 August 2026\
> **Plan owner:** Tamer — CEO / Project Lead\
> **Companion reports:** [Master Kanban](master-kanban.md), [Master RACI](master-raci.md)\
> **Gantt control:** [master-gantt.xlsx](master-gantt.xlsx) is generated, task-ID aligned and verified. The legacy `../master-gantt.md` uses M0–M8 identifiers and is historical evidence only; it is not a v2.1 companion report.

## 1. Purpose

This plan reconstructs and governs the assessed group project between the first and second submissions. It intentionally shows both:

- the **reconstructed baseline**: when work should have occurred, derived from the 8 June proposal, assessment deadline, dependencies, original governance documents and available team capacity; and
- the **observed execution**: the earliest or most relevant dated evidence visible in the repository as at 12 August.

An observed date proves that an artifact or change existed in the repository on that date. It does not, by itself, prove that the output passed acceptance testing or was approved in a team meeting. Items are therefore only marked **Done** when an artifact exists and its stated task-level acceptance condition is met; cross-system acceptance remains a separate gate.

## 2. Project objective and success standard

The objective is to design, build, validate and present a credible prototype of **Blockmediary**: a programmable documentary escrow layer for SME cross-border trade in which a buyer prefunds stablecoin, a seller submits the agreed trade-document data, deterministic release rules assess compliance, and the escrow releases or refunds according to the demonstrated lifecycle.

Success on 14 August means:

1. a five-minute investor-style video and submission PDF satisfy the module brief;
2. the presentation prioritises potential real value, which represents 70% of the group-video mark;
3. the demonstrated workflow is reproducible using the approved demo route and network;
4. every material pitch claim is classified as **delivered**, **prototype-limited**, or **roadmap**;
5. the technical evidence supports the demonstrated contract, application and document-rule behaviour; and
6. the final link, permissions, PDF and upload are independently checked before submission.

## 3. Governance method

The governance design calls for four reports generated from one logical control model:

`assessment brief → deliverables → acceptance criteria → dependencies → Kanban tasks → RACI ownership → planned dates → observed evidence → Gantt`

The following controls apply:

- Task IDs are aligned across the plan, Kanban, RACI and [master-gantt.xlsx](master-gantt.xlsx); the four-report control is operational.
- Each deliverable has exactly one accountable owner.
- Each task has one accountable owner and at least one responsible owner.
- Planned dates are a reconstructed baseline, not a claim that those dates were agreed contemporaneously.
- Observed dates are supported by a file, commit, deployment record or submission artifact.
- **Done** requires task-level evidence; an integrated feature may still remain subject to the final acceptance gate.
- Unimplemented capabilities are not converted into completed work merely because research or design exists.
- Material scope changes are recorded in the decision and variance logs.

## 4. Source hierarchy

When sources disagree, the team should use the following hierarchy:

1. Module specification and assessment briefs.
2. Submission format, deadline and grading rubric in `docs/hackathon-context.md`.
3. Business Requirements Document v1.0 for agreed product intent.
4. Technical Requirements Document, current code, tests and deployment records for delivered behaviour.
5. Git history and dated project artifacts for observed execution.
6. Domain, legal, operational, market and financial supporting documents.
7. Original governance documents, used as planning evidence but not as proof of completion.

## 5. Scope boundary

### 5.1 In assessed scope

- Problem, customer and real-value proposition.
- Documentary escrow workflow and state model.
- Buyer and seller deal interaction.
- Stablecoin escrow smart contract and test evidence.
- Application API, persistence, authentication and wallet linking.
- Structured trade-document pack and deterministic release checks.
- Objection, refund and audit-trail paths demonstrated by the prototype.
- Legal, regulatory, document and corridor risk analysis.
- Market, competitor, financial and business-model evidence.
- Canonical product demonstration, presentation, recording and submission.

### 5.2 Explicitly outside the delivered MVP

- Trade financing, advances or lending.
- AI/OCR extraction presented as a delivered capability.
- Live KYC, KYB, sanctions or adverse-media provider integrations.
- Automatically generated or legally approved trade escrow agreements.
- Production document examiner network or reviewer operations.
- Electronic bill-of-lading title transfer.
- Mainnet deployment, custody operations and production security hardening.
- Production logistics, banking or compliance partner APIs.
- Multi-agent runtime presented as a completed user-facing product capability.

Research and designs for these items may be used as roadmap evidence, but not as proof of implementation.

## 6. Workstreams

| Code | Workstream | Primary accountable role | Old categories reused |
|---|---|---|---|
| GOV | Governance and requirements | CEO | T1, T6, T7, T8 |
| PRD | Product workflow and release rules | COO | D1, N4, T3, T4, T5 |
| TEC | Contract, backend, integration and acceptance | CTO | N1, N2, N3, D5 |
| UX | User experience and demo interface | CRO | M1, M2, M3, M4 |
| RISK | Legal, compliance and trade-document controls | CCO | B1, B2, B3, B4, B5, D2 |
| BUS | Market, competition, finance and commercial case | CFO for finance; CRO for market/GTM | C1–C4, M5–M8, T2, T9, T10 |
| SUB | Pitch, demo, recording and submission | CEO | D4 and presentation work |

The old codes are retained as aliases in the crosswalk; they no longer determine the structure because several old categories mixed unrelated responsibilities or assumed functionality that was later deferred.

## 7. Delivery phases

| Phase | Dates | Reconstructed baseline outcome | Exit gate |
|---|---|---|---|
| G0 — Proposal handoff | 8 Jun | Convert the submitted proposition into an executable build baseline | Proposal evidence retained and build scope opened |
| P1 — Definition | 9–21 Jun | Governance, BRD, workflow, risk sources and commercial hypotheses | Requirements and responsibilities understood |
| P2 — Design and foundation | 22 Jun–5 Jul | Architecture, escrow contract, UX foundation, document rules and operating model | Core designs approved; first technical increment available |
| P3 — Core build | 6–19 Jul | Contract/API integration, role journeys, rule engine and tests | Demonstrable escrow lifecycle on local development stack |
| P4 — Integration | 20 Jul–2 Aug | Multi-deal UI, persistence, objection/refund, audit and document-pack integration | End-to-end product surface assembled |
| P5 — Validation | 3–9 Aug | SIWE, testnet deployment, onboarding gate, full document pack, claims and pitch evidence | Candidate release ready for acceptance |
| P6 — Submission | 10–14 Aug | Scope freeze, A1–A8, rehearsal, recording, fallback and upload QA | Main group video submitted |

## 8. Deliverable register

| ID | Deliverable | Contributing tasks | Accountable | Planned gate | Status at 12 Aug | Acceptance condition |
|---|---|---|---|---|---|---|
| DEL-01 | Governance and requirements baseline | GOV-01–GOV-05 | Tamer | 21 Jun | **Achieved; maintained** | BRD/TRD, scope, decisions, owners and evidence exist; monitoring continues through submission |
| DEL-02 | Product workflow and deterministic release model | PRD-01–PRD-04 | Dan | 2 Aug | **Achieved; claim sign-off open** | Workflow, states, document rules and implemented lifecycle exist; final pitch wording remains in Review |
| DEL-03 | Escrow contract and chain evidence | TEC-01, TEC-02, TEC-07 | Nick | 5 Jul | **Achieved and test-verified** | Contracts rebuilt from source with configured solc 0.8.28; 21/21 tests passed in the standard compiled run; Base Sepolia deployment evidence is recorded |
| DEL-04 | Application and lifecycle integration | TEC-03–TEC-06, TEC-08 | Nick | 2 Aug | **Achieved and unit-tested** | Delivered lifecycle, auth, persistence and rules are present; 187 application tests passed on 12 Aug |
| DEL-05 | Technical acceptance baseline | TEC-09, TEC-10 | Nick | 12 Aug | **Partially achieved; at risk** | A1 is achieved; 187/187 application tests also pass. A2–A7 integrated walkthrough, A8 control evidence, clean app setup, lint and production build remain open |
| DEL-06 | Canonical demo interface | UX-01–UX-05 | Mo | 12 Aug | **Prototype achieved; demo approval open** | Dashboard exists and is integrated; canonical route/polish acceptance is still required |
| DEL-07 | Legal and compliance evidence | RISK-01–RISK-06 | Badhri | 12 Aug | **Research achieved; pitch sign-off open** | Standards, legal-risk, corridor and document artifacts exist; claims still require final boundary review |
| DEL-08 | Commercial and real-value case | BUS-01–BUS-07 | Conrad | 12 Aug | **Artifacts achieved; BMC revision required** | BUS-02/BUS-03 remain accountable to Mo; Conrad is accountable for integrating their approved customer and competitor evidence with the model, pricing, BMC and commercial narrative |
| DEL-09 | Demonstration package | SUB-01–SUB-05 | Dan | 13 Aug | **Not yet achieved** | Timed script, runbook, two rehearsals, primary recording and fallback must exist |
| DEL-10 | Main group submission | SUB-06–SUB-07 | Tamer | 14 Aug | **Not yet achieved** | PDF/link/permissions must pass independent QA and submission receipt must be retained |

The status wording deliberately separates **work produced** from **gate accepted**. It would be inaccurate to call the contract, application, dashboards, research or commercial artifacts “not started”; it would be equally inaccurate to call the final submission package accepted before the remaining gates pass.

## 9. Milestone baseline versus observed execution

| Milestone | Reconstructed baseline | Observed date | Variance | Evidence / interpretation |
|---|---:|---:|---:|---|
| Proposal submitted | 8 Jun | 8 Jun | 0 days | Module deadline and `proposal/Pitch-Deck-June-8.pptx` |
| Governance baseline available | 16 Jun | 17 Jun | +1 day | Initial governance commit `5c4daba` |
| BRD v1.0 locked | 21 Jun | 9 Aug | +49 days | Requirements baseline commit `3b3e82e`; scope continued to evolve |
| First escrow contract increment | 5 Jul | 5 Jul | 0 days | Contract/tests/deploy module commit `36222dd` |
| Frontend role journeys available | 19 Jul | 13 Jul | -6 days | Role, wiring and wizard merge sequence completed by 13 Jul |
| Integrated multi-deal surface | 2 Aug | 8 Aug | +6 days | Dashboard, persistence, auth and rework merged through 8 Aug |
| Base Sepolia evidence | 5 Jul | 4 Aug deployment / 10 Aug merge | +30 to +36 days | Deployment `c4887db`; integration merge `3e9b4ed` |
| Full corridor document pack | 2 Aug | 9 Aug | +7 days | Full pack/customs/certificate commits on 9 Aug |
| Requirements reconciled to prototype | 9 Aug | 11 Aug | +2 days | Status reconciliation commit `42aa948` |
| A1–A8 technical acceptance | 11 Aug | Partial on 12 Aug | Open | **A1 achieved:** contracts rebuilt from source and 21/21 tests passed. The 187/187 application tests provide strong supporting evidence; A2–A7 still need an integrated authenticated walkthrough and A8 needs a complete control record |
| Clean app setup and production build | 11 Aug | Failure reproduced 12 Aug | Open | Missing tracked `app/.env` setup, two competing lockfiles, invalid Next.js page export and focused lint failures prevent reproducibility |
| Main group video | 14 Aug | Future at status date | — | Fixed assessment deadline |

## 10. Achievement register

The following material achievements are evidenced by the repository and verification performed on 12 August:

| Area | Achievement | Evidence | Honest qualification |
|---|---|---|---|
| Governance | Proposal handoff, original Kanban/Gantt/RACI, BRD v1.0 and TRD v1.0 exist | Proposal artifact; commits `5c4daba`, `3b3e82e`, `42aa948` | Requirements were locked much later than the reconstructed baseline |
| Smart contract | Escrow lifecycle, role controls, cancellation, refund, pause and permissionless release are implemented | `npx hardhat compile --force` rebuilt the contracts from source using configured solc 0.8.28; the standard compiled `npx hardhat test` run passed **21/21 tests** | Contract compilation and behaviour are verified; this does not close the separate application clean-install gate |
| Application | Account-isolated multi-deal lifecycle, auth sessions, SIWE, SQL persistence, objection/refund/audit and document rules exist | Relevant commits and **187 passing tests across 10 files** on 12 Aug | Full production build and lint gates currently fail |
| Product/UX | Role journeys and a consolidated dashboard candidate exist | Dashboard commits through `c61b1a6` | `/dashboard` must still be formally frozen as the recording route |
| Document verification | Deterministic structured checks and the corridor document pack are implemented | Commits `9e697cf`, `f9bbd27`, `498751d` | AI/OCR, source corroboration and examiner operations are roadmap |
| Legal/compliance | Standards pack, legal-risk register, verification model, document catalogue and UAE research exist | `docs/` artifacts and dated commits | Research is not legal approval or a production licence |
| Commercial | Financial model, customer analysis, competitor analysis and first BMC exist | Financial workbook, customer note, competitor document and `proposal/business-model-slide.md` | The BMC is an achieved artifact but not an approved final business model |

### 10.1 Verification snapshot — 12 August

| Check | Result | Governance meaning |
|---|---|---|
| Application unit tests | **PASS — 187/187 tests, 10/10 files** | Strong component evidence for delivered rules, auth and lifecycle behaviour |
| Contract compile and tests | **PASS — forced source rebuild with solc 0.8.28; 21/21 tests in the standard compiled run** | A1 is achieved; application clean-install reproducibility remains a separate gate |
| Focused source lint | **FAIL — 5 errors, 12 warnings** after excluding generated Prisma output | Code-quality gate remains open; errors are primarily React effect-state rules |
| Full lint | **FAIL — 364 errors, 566 warnings** | Result is inflated by generated Prisma files, but it still cannot be reported as passing |
| Production build | **FAIL** | Bundling completed; TypeScript then rejected an invalid named export in `app/dan/deals/[dealId]/page.tsx`. The default build can stop earlier on the workstation directory-permission issue; both paths leave the build gate open |
| A1–A8 cold walkthrough | **Not fully evidenced** | Unit tests do not replace the final integrated demo acceptance run |
| Clean app installation | **FAIL — confirmed configuration/repository defect** | Prisma postinstall loads an untracked `app/.env`; no `app/.env.example` exists; npm and pnpm lockfiles compete |

## 11. BMC governance review and decision

### 11.1 Pushback against an overly negative reading

The existing BMC should not be dismissed as unusable. It successfully establishes the buyer/seller trust problem, prefunded documentary escrow mechanism, likely revenue families, operating costs, channel ideas and competitive categories. It is also valid to use the **$2.5 trillion global trade-finance gap as market context**, provided the pitch does not imply that Blockmediary supplies finance. The model's ambition is appropriate as a full-product direction.

The governance evidence also supports more than a concept: direct smart-contract custody, deterministic document rules, objection/refund paths, audit history, role-specific dashboards and Base Sepolia deployment have been built. The BMC may therefore present these as prototype achievements rather than only future plans.

### 11.2 Where the earlier criticism stands

The current BMC still cannot be approved unchanged because it combines the achieved prototype with unbuilt full-product capabilities. The following corrections are mandatory:

| Current BMC position | Governance verdict | Required pitch-safe position |
|---|---|---|
| “UCP 600 documentary credit … without the issuing bank” | Too close to claiming a bank documentary-credit instrument | “UCP 600-inspired documentary escrow using pre-agreed release rules” |
| Six-layer verification as an operational moat | Roadmap presented as current | Lead with deterministic structured checks; label OCR, carrier, human, fraud and forensic layers as roadmap |
| Phase 1 includes live KYB/KYC and full dispute | Overstates delivery | Identity capture, objection recording and refund are delivered; screening and full dispute escalation are roadmap |
| UAE + KSA plus several sectors/corridors | Too broad for a beachhead | Choose one legally validated corridor and one repeat customer profile |
| UAE–Türkiye stablecoin trade | Legally unsuitable without a validated structure | Remove from the launch canvas pending specialist legal validation |
| “Regulator-ready” | Unsupported by research alone | “Regulatory pathway assessed; production launch requires licensed partners/approval” |
| Yield on idle escrow | Conflicts with purpose-bound custody and adds investment/regulatory risk | Remove from the model |
| 0.5–1.0% alone | May not cover fixed onboarding/review costs on small trades | Use minimum fee plus percentage; human review/dispute charged separately |
| $5k–$250k first market | Conflicts with service economics and prototype £50k control | Initial repeat, low-risk trades within the accepted prototype/operating envelope |

### 11.3 Final BMC decision

**Verdict: Amber — strong strategic draft and completed project artifact, but not approved for the final pitch without a focused revision.**

The approved direction is:

> Blockmediary provides LC-like payment trust—not trade finance—for repeat SME cross-border trades through purpose-bound stablecoin escrow, deterministic documentary release rules and an auditable objection window. The beachhead should be repeat mid-market SMEs or a forwarder-led cluster in one legally validated corridor. Revenue begins with a minimum-plus-percentage deal fee; human review and partner/API services are later or conditional streams.

BUS-06 records completion of the original BMC; BUS-07 controls the evidence-aligned revision. This preserves the achievement while preventing the original canvas from being mistaken for the delivered MVP.

## 12. Critical path

The remaining critical chain is:

`requirements reconciliation → dependency/build restoration → A1–A8 acceptance → canonical /dashboard path → claim freeze → runbook → two cold rehearsals → primary and fallback recordings → PDF/link QA → submission`

Commercial and legal sign-off must join the chain before claim freeze. Work outside this chain is deferred unless it removes a demonstrated blocker.

## 13. Submission control plan: 11–14 August

| Date | Required gate | Owner | Exit evidence |
|---|---|---|---|
| 11 Aug | Scope freeze; approve `/dashboard`; reconcile repo and governance baseline — **overdue at 12 Aug** | Tamer / Nick | Decision record, clean source reference, approved demo route |
| 12 Aug | Close build/lint blockers and remaining A1–A8; revise/approve BMC and legal/commercial claims; lock script and deck | Nick / Badhri / Conrad / Tamer | Acceptance record, approved BMC/claims register, timed script, final slides |
| 13 Aug | Run two cold rehearsals; record primary and fallback; edit and caption | Dan / Mo | Rehearsal log, source recordings, final render, fallback file |
| 14 Aug | Independent link/PDF/permission QA; upload with buffer; preserve receipt | Tamer with independent checker | Private-browser check, final PDF, submission receipt |

## 14. Definition of done and evidence standard

| State | Meaning |
|---|---|
| Backlog | Valid work, not committed to the submission window |
| Design | Outcome or acceptance condition still being designed |
| To Do | Defined, sized, owned and ready to start |
| Doing | Active work within the WIP limit |
| Review | Artifact exists but approval, testing or claim reconciliation remains |
| Done | Acceptance condition met and evidence linked |
| Deferred | Intentionally outside the 14 August assessed MVP |
| Removed | Superseded or no longer required, with a recorded reason |

Acceptable evidence includes a submission receipt, approved document version, commit or pull request, passing test output, deployment record, explorer link, dated recording, rehearsal log, or signed decision entry. A narrative statement without an artifact is not sufficient.

## 15. Decision log

| ID | Date | Decision | Effect |
|---|---:|---|---|
| DEC-01 | 8 Jun | Govern only the group build from proposal handoff to main-video submission | Individual-report work is excluded from all v2 reports |
| DEC-02 | 11 Aug | Reconstruct baseline and observed execution separately | Prevents retrospective dates from being represented as contemporaneous fact |
| DEC-03 | 11 Aug | Use seven coherent workstreams and retain old IDs only as aliases | Preserves useful history without inheriting conflicting categories |
| DEC-04 | 11 Aug | Treat AI/OCR and live compliance integrations as roadmap | Pitch claims must match the deterministic prototype |
| DEC-05 | 11 Aug | Treat the Gantt as a view of the same task register | **Operational:** [master-gantt.xlsx](master-gantt.xlsx) is generated from the controlled register and reconciles dates, ownership and states |
| DEC-06 | Pending | Approve `/dashboard` as the only recorded product route | Required to avoid presenting competing legacy surfaces |
| DEC-07 | Pending | Approve local deterministic walkthrough plus Base Sepolia as separate deployment proof | Separates demo reliability from testnet evidence |
| DEC-08 | Pending | Choose one beachhead and approve pricing/ask assumptions | Required before commercial narrative freeze |
| DEC-09 | 12 Aug | Preserve the original BMC as an achieved artifact but classify it Amber pending revision | Full-product ambition remains visible while final pitch claims are aligned to delivered evidence |
| DEC-10 | 12 Aug | Record verification separately from task-owner status | Passing tests prove technical evidence without silently converting integrated Review gates to Done |
| DEC-11 | 12 Aug | Keep Conrad accountable for BUS-05 and DEL-08 integration while Mo retains BUS-02/BUS-03 accountability | Removes ambiguity between component ownership and commercial-case roll-up |
| DEC-12 | 12 Aug | Generate the task-ID-aligned v2.1 Gantt rather than cite the legacy schedule | **Resolved:** [master-gantt.xlsx](master-gantt.xlsx) is generated and verified; the legacy schedule remains historical evidence only |
| DEC-13 | Pending | Establish a saved claims register before treating claim freeze as evidenced | A claim register cannot be cited until a reviewable artifact exists |

## 16. Risk register

| ID | Risk | Likelihood | Impact | Owner | Response / trigger |
|---|---|---|---|---|---|
| R-01 | Integrated acceptance or application reproducibility fails | **Confirmed** | High | Nick | Preserve A1 as achieved; complete A2–A8 evidence; guard missing env loading, add an app-level environment template, choose one lockfile, fix invalid page export and five focused lint errors, then rerun clean install/build/acceptance |
| R-02 | Multiple UI routes create an inconsistent demo | High | High | Mo | Freeze an exact route allowlist and click path; remove/disable access to `/dashboard/legacy`, `/dashboard/integrated`, `/admin`, `/dev`, `/dan`, `/buyer` and `/seller` in the recorded build; cold-test deal-detail return paths |
| R-03 | Pitch overstates AI, compliance or examiner functionality | High | High | Tamer | Complete claim audit with Badhri and Nick before script freeze |
| R-04 | Beachhead, fee level or ask remains inconsistent | Medium | High | Conrad | Record one approved assumption set before the deck is locked |
| R-05 | Testnet or wallet behaviour fails during recording | Medium | High | Dan | Use a deterministic local walkthrough and present testnet deployment separately |
| R-06 | Recording exceeds five minutes or lacks clarity | Medium | High | Dan | Timed script, two cold rehearsals, edit to a target below five minutes |
| R-07 | Video link, PDF permission or upload fails | Low | High | Tamer | Independent private-browser test and upload buffer on 14 Aug |
| R-08 | Repository state differs across team machines | **Confirmed** | High | Nick | Clean app install is not reproducible: Prisma expects untracked `app/.env`, no app-level example exists, and npm/pnpm authority is ambiguous; correct and verify from a fresh dependency-free checkout |
| R-09 | Original BMC is presented as current delivered capability | High | High | Conrad / Tamer | Complete BUS-07; remove yield and overclaims; freeze one beachhead and fee structure |
| R-10 | Four-report governance control becomes incomplete if the v2.1 Gantt is absent or drifts from the reports | **Closed at snapshot** | Medium | Tamer | [master-gantt.xlsx](master-gantt.xlsx) is generated and reconciled; maintain it in the same change as the plan, Kanban and RACI |

## 17. Change control

From scope freeze, a change may enter the build only if it:

1. fixes a failed acceptance case;
2. removes a demonstrated recording blocker;
3. corrects a materially misleading claim; or
4. is approved by the accountable owner and does not endanger the critical path.

All other work is moved to Deferred. Any accepted change must update the Kanban task, project-plan dates, RACI ownership where affected, decision log and [master-gantt.xlsx](master-gantt.xlsx) in the same change.

## 18. Old-to-new categorisation crosswalk

| Old category | New treatment |
|---|---|
| N1 Smart contract | TEC-01, TEC-02, TEC-07, TEC-09 |
| N2 Off-chain platform | TEC-03, TEC-05, TEC-06 |
| N3 API layer | TEC-03, TEC-04, TEC-06 |
| N4 Verification engine | PRD-02, PRD-03, TEC-03, TEC-09 |
| M1–M3 Buyer/seller/review screens | UX-01–UX-04 and TEC-04–TEC-06 |
| M4 Demo polish | UX-05 and SUB-02–SUB-05 |
| B1–B4 Compliance/legal | RISK-01–RISK-06; live integrations remain deferred |
| B5 Regulatory market analysis | RISK-05 and BUS-05 |
| D1 Workflow | PRD-01–PRD-04 |
| D2 Review operations | RISK-03–RISK-04; production examiner console deferred |
| D3 Delivery cadence | GOV-02, GOV-05 |
| D4 Demo preparation | SUB-01–SUB-07 |
| D5 Backend contribution | TEC-03–TEC-06 |
| C1–C4 Finance and sizing | BUS-01, BUS-04, BUS-05, BUS-07 |
| M5–M8 GTM | BUS-02–BUS-05, BUS-07 |
| T1–T8 Strategy and oversight | GOV-01–GOV-05, PRD-01–PRD-04 |
| T2 Business Model Canvas | BUS-06 and BUS-07 |
| T9–T10 Market and competition | BUS-02, BUS-03, BUS-05, BUS-07 |

## 19. Close-out evidence pack

The group close-out pack should contain:

- final source commit and branch reference;
- tracked v2.1 project plan, Kanban, RACI and task-ID-aligned Excel Gantt;
- passing contract/application/build evidence and A1–A8 record;
- Base Sepolia deployment record and explorer evidence;
- final claim register;
- approved script, deck and demo runbook;
- primary and fallback recordings;
- final PDF and verified video link;
- independent QA checklist; and
- submission receipt.
