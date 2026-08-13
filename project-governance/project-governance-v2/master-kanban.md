# Blockmediary Master Kanban v2.1

> **Window:** 8 June 2026 to 14 August 2026\
> **Status date:** 12 August 2026\
> **Board owner:** Tamer — CEO / Project Lead\
> **Gantt status:** [master-gantt.xlsx](master-gantt.xlsx) generated and reconciled; legacy M0–M8 schedule is superseded\
> **WIP policy:** Maximum two Doing tasks per person; Review work must be cleared before new non-critical work starts\
> **Flow:** Backlog → Design → To Do → Doing → Review → Done\
> **Exceptions:** Blocked is a flag; Deferred and Removed are terminal dispositions

## 1. How to read this board

- **Planned** dates form the reconstructed baseline.
- **Observed** is the dated repository evidence available at the status date.
- **A / R** identifies the accountable and responsible roles; the companion RACI gives full consultation and information paths.
- **Size** follows the module scale: XS up to 3 days, S 4–7 days, M 8–12 days, L 13–20 days, XL 21–30 days, XXL above 30 days.
- **Evidence** proves that an artifact exists; it does not replace integrated acceptance.
- A blank observed date means completion has not been evidenced by 12 August.

## 2. Board snapshot

| State | Count | Interpretation |
|---|---:|---|
| Done | 24 | Task-level artifact and acceptance evidence exists |
| Review | 8 | Artifact exists or work is substantially complete, but approval/testing is open |
| Doing | 6 | Active critical-path work |
| To Do | 6 | Submission work defined and ready |
| Deferred | 8 | Explicitly outside the assessed MVP |

Counts are a control snapshot, not a performance score. Submission succeeds only when the remaining critical-path items clear Review and To Do.

**Verification stamp — 12 August:** all 32 commit hashes cited by this board resolve in Git and their dates and subjects match repository history. The application suite passed 187/187 tests. Contracts were rebuilt from source with configured solc 0.8.28 and the standard compiled test run passed 21/21 tests. These checks prove cited technical evidence; they do not automatically close integrated acceptance or approval gates.

## 3. Done — evidence verified at task level

| ID | Outcome | A / R | Planned | Observed | Size | Acceptance evidence | Source / old alias |
|---|---|---|---|---|---|---|---|
| GOV-01 | Proposal handoff and assessed build gate established | Tamer / Tamer | 8 Jun | 8 Jun | XS | Proposal artifact and fixed deadline retained | `proposal/Pitch-Deck-June-8.pptx`; T1 |
| GOV-02 | Initial governance framework created | Tamer / Tamer, Dan | 9–16 Jun | 17 Jun | S | Kanban, Gantt and RACI committed | Commit `5c4daba`; T7, T8, D3 |
| GOV-03 | BRD v1.0 reconciled to delivered prototype | Tamer / Nick | 9–21 Jun | 9 Aug | M | Versioned BRD baseline exists | `docs/business-requirements.md`; `3b3e82e`; T1 |
| PRD-01 | End-to-end operating workflow documented | Dan / Dan | 9–21 Jun | 25 Jun | S | Happy path and verification layers documented | `docs/Flow Guidance/operational-flow-v1.md`; D1 |
| PRD-02 | Deal, state and deterministic release rules implemented | Dan / Nick, Dan | 15–28 Jun | 10 Jul | M | `app/lib/escrow/rules.ts` contains 428 lines and grades DOC-01–DOC-06 using GRADE, CROSS and FLAG rule kinds; relevant application tests pass | Commit `73f1bf7`; N4, D1 |
| TEC-01 | Escrow smart contract implemented | Nick / Nick, Dan | 15 Jun–5 Jul | 5 Jul | M | `contracts/contracts/Escrow.sol`, tests and Ignition deployment module exist; forced compilation from source succeeds | `36222dd`; N1 |
| TEC-02 | Contract tests and unfunded cancellation path authored | Nick / Dan | 29 Jun–10 Jul | 10 Jul | S | Six test files cover happy path, access control, state guards, refund, release/pause and cancellation; 21/21 pass in the standard compiled run | `36222dd`, `a186f98`; verified 12 Aug; N1 |
| TEC-03 | Off-chain store, API and rule-engine core implemented | Nick / Nick, Dan | 22 Jun–19 Jul | 10 Jul | L | 28 API route handlers and the lifecycle/rules core exist | `73f1bf7`, `6515a51`; N2, N3, D5 |
| TEC-04 | Buyer/seller lifecycle wired to real deal state | Nick / Nick, Dan | 6–19 Jul | 13 Jul | M | Fund, submit and verdict journeys merged | `06efff6`, `fcdfaad`; N2, N3 |
| TEC-05 | Objection, refund and audit paths implemented | Nick / Dan | 20 Jul–2 Aug | 31 Jul | M | Objection withdrawal, refund and audit commits exist | `5688cc3`, `77cf5f6`; N2, D5 |
| TEC-06 | SQL persistence, account auth and SIWE implemented | Nick / Dan, Nick | 13 Jul–2 Aug | 5 Aug | L | Prisma persistence, server sessions and SIWE wallet linking are present; application suite passes | `f8cc7a9`, `3123538`, `a2052a2`; N2, N3 |
| TEC-07 | Base Sepolia deployment evidence created | Nick / Dan | 30 Jun–5 Jul | 4 Aug deployment; 10 Aug merge | S | Deployment record identifies Base Sepolia chain ID 84532 and real test USDC configuration | `c4887db`, `3e9b4ed`; N1 |
| TEC-08 | KYB data collection and onboarding gate implemented | Nick / Dan | 20 Jul–2 Aug | 8 Aug | S | Unonboarded companies are blocked from deal creation | `10d3730`, `dc1de9f`; B1/N2 |
| UX-01 | UX foundation and dashboard flows implemented | Mo / Mo | 22 Jun–5 Jul | 9 Jul | M | Landing page and dashboard flows committed | `6dbc53a`; M1, M2 |
| UX-02 | Role-separated buyer and seller journeys implemented | Mo / Mo, Nick | 6–19 Jul | 13 Jul | M | Role isolation and wizard wiring merged | `95cfb0b`, `06efff6`; M1, M2 |
| UX-03 | Consolidated multi-deal dashboard assembled | Mo / Mo, Dan | 20 Jul–2 Aug | 8 Aug | L | Refined dashboard merged with lifecycle work | `e09bd51`, `3779262`, `c61b1a6`; M1–M3 |
| RISK-01 | UCP 600 and Incoterms source pack assembled | Badhri / Badhri | 9–14 Jun | 14 Jun | XS | Source documents and Markdown references exist | `5fe28c1`; B4 |
| RISK-02 | Legal-risk register developed | Badhri / Badhri | 9–28 Jun | 23 Jun | S | Legal-risk artifact and update history exist | `docs/legal-risk.md`; `7b18837`; B1–B4 |
| RISK-03 | Operational verification model documented | Badhri / Dan, Badhri | 15 Jun–5 Jul | 1 Jul | S | Workflow and verification model artifacts exist | `docs/verification-model-v2.md`; D1, D2 |
| RISK-04 | Trade-document template catalogue assembled | Badhri / Badhri | 22 Jun–19 Jul | 5 Aug | M | Structured document-template catalogue exists | `docs/document-templates.md`; `28c6968`; B3, D2 |
| RISK-05 | UAE licensing and corridor analysis documented | Badhri / Badhri, Tamer | 22 Jun–12 Jul | 22 Jul | S | UAE licensing research artifact exists | `docs/Dubai_Fintech_License_Requirements.md`; B4, B5 |
| BUS-01 | Financial model refined | Conrad / Conrad | 9 Jun–5 Jul | 1 Jul | M | Five-year model artifact exists | `financial-projections/Blockmediary_Financial_Model_FullRisk.xlsx`; `56e5e6a`; C1, C2 |
| BUS-02 | Customer-demographic analysis produced | Mo / Mo, Conrad | 9–28 Jun | 1 Jul | S | Customer profile research exists | `project-initialisation/customer-demographics.md`; `99400ce`; M5, M7 |
| BUS-06 | Original Business Model Canvas produced | Conrad / Tamer, Conrad, Mo | G0 handoff | 8 Jun baseline artifact | S | Eight-block canvas exists with opportunity, market, revenue, cost, channels and competition | `proposal/business-model-slide.md`; T2 |

## 4. Review — artifact exists; acceptance or sign-off remains

| ID | Outcome | A / R | Planned | Observed | Due | Size | Open acceptance condition | Evidence / old alias |
|---|---|---|---|---|---|---|---|---|
| GOV-04 | TRD and A1–A8 acceptance baseline reconciled | Tamer / Nick | 15–28 Jun | 11 Aug | 12 Aug | M | Run and record every acceptance case; remove any remaining delivered-status contradiction | `docs/technical-requirements.md`; `42aa948`; T1 |
| PRD-03 | Full document-pack and corridor release rules aligned | Dan / Nick, Badhri | 22 Jun–5 Jul | 9 Aug | 12 Aug | M | Cold test required documents and reconcile BRD language with implemented pack | `9e697cf`, `f9bbd27`, `498751d`; N4/B5 |
| PRD-04 | Final product-to-pitch traceability approved | Dan / Dan, Tamer | 27 Jul–11 Aug | 11 Aug draft | 12 Aug | S | Every script claim maps to delivered evidence or roadmap label | BRD/TRD reconciliation; commit `42aa948`; saved claims register still pending under DEC-13; T5 |
| TEC-09 | Technical acceptance A1–A8 completed | Nick / Nick, Dan | 3–11 Aug | Partial on 12 Aug | 12 Aug | S | **A1 achieved:** forced source compile and 21/21 contract tests pass. **Supporting evidence:** 187/187 application tests pass. **Open:** A2–A7 integrated authenticated walkthrough, A8 control record, production build and lint | Test/compile evidence 12 Aug; TRD §11; N1–N4/D5 |
| TEC-10 | Repository sync and clean-build reproducibility verified | Nick / Nick | 10–12 Aug | Failure confirmed 12 Aug | 12 Aug | XS | **Known failing:** Prisma postinstall loads untracked `app/.env`; no app-level example exists; npm and pnpm lockfiles compete; production build and focused lint fail | Configuration/build/lint evidence 12 Aug; D3 |
| RISK-06 | Legal/compliance claims and delivery boundary signed off | Badhri / Badhri, Tamer | 3–12 Aug | Research exists | 12 Aug | S | No legal-advice claim; live screening, TEA and examiner functions labelled roadmap | Legal and document sources; B1–B4 |
| BUS-03 | Competitor analysis verified for pitch use | Mo / Badhri, Mo | 15 Jun–5 Jul | 4 Aug | 12 Aug | S | Fees, automation and corridor claims are source-checked and not overstated | `docs/Competitor-analysis.md`; `9b9601b`; T10 |
| BUS-04 | Pricing, unit economics, funding ask and beachhead approved | Conrad / Conrad, Mo | 15 Jun–12 Jul | Model/research exist | 12 Aug | M | One assumption set is recorded and used consistently in deck and script | Financial model and customer research; C2–C4/M5/M8 |

## 5. Doing — current critical-path work

| ID | Outcome | A / R | Planned | Due | Size | Acceptance condition | Dependencies / old alias |
|---|---|---|---|---|---|---|---|
| GOV-05 | Governance, decision, risk and blocker control maintained through submission | Tamer / Tamer, Dan | 9 Jun–14 Aug | 14 Aug | L | Daily critical-path update; decisions and variances reflected in all reports | All workstreams; T7, T8, D3 |
| UX-04 | `/dashboard` approved as the single recorded product route | Mo / Mo, Dan | 3–9 Aug | 11 Aug | XS | **Overdue at 12 Aug:** team decision, route allowlist, demo accounts and exact click path must be recorded; legacy/dev/admin navigation must be excluded | TEC-09; M1–M3 |
| UX-05 | Demo polish, empty/error states and accessibility pass completed | Mo / Mo | 3–12 Aug | 12 Aug | S | Recorded path has no broken/legacy navigation; key text and states are legible | UX-04, TEC-09; M4 |
| BUS-05 | Final real-value and commercial narrative locked | Conrad / Conrad, Mo, Tamer | 27 Jul–12 Aug | 12 Aug | S | Problem, beachhead, differentiation, business model, evidence and ask use one approved story | BUS-03, BUS-04; T2, T9 |
| BUS-07 | Evidence-aligned BMC v2 approved for final pitch | Conrad / Conrad, Tamer, Mo, Badhri | 12 Aug | 12 Aug | XS | **Zero float:** close before SUB-01 or remove unresolved BMC claims; narrow beachhead, financing distinction, minimum-plus-% fee and delivered/roadmap split required | BUS-03, BUS-04, BUS-06; T2 |
| SUB-01 | Five-minute deck and timed script locked | Tamer / Tamer, all leads | 27 Jul–9 Aug | 12 Aug | M | Script is under five minutes and weights real value above technical detail | PRD-04, RISK-06, BUS-05; D4 |

## 6. To Do — defined submission work

| ID | Outcome | A / R | Planned | Due | Size | Acceptance condition | Dependencies / old alias |
|---|---|---|---|---|---|---|---|
| SUB-02 | Deterministic demo runbook and seed/reset procedure completed | Dan / Dan, Nick | 3–12 Aug | 12 Aug | S | Another member can reproduce the happy path without improvisation | TEC-09, UX-04; D4 |
| SUB-03 | Two cold end-to-end rehearsals completed | Dan / Dan, Mo | 10–13 Aug | 13 Aug | XS | Both runs complete within the timed allocation; defects and workarounds logged | SUB-01, SUB-02 |
| SUB-04 | Primary presentation recorded, edited and captioned | Dan / Dan, Mo, Tamer | 12–13 Aug | 13 Aug | S | Final render is clear, below five minutes and uses approved product claims | SUB-03 |
| SUB-05 | Fallback demo recording retained | Dan / Dan, Nick | 12–13 Aug | 13 Aug | XS | Standalone fallback opens and shows the approved workflow | SUB-02, TEC-09 |
| SUB-06 | Video link, PDF and permission QA completed independently | Tamer / Tamer, checker TBD | 13–14 Aug | 14 Aug | XS | Link works in private browser; PDF renders; filename and permissions pass | SUB-04, SUB-05 |
| SUB-07 | Main group video submission completed | Tamer / Tamer | 14 Aug | 14 Aug | XS | Submission receipt and final artifacts preserved | SUB-06 |

## 7. Deferred / post-MVP

| ID | Capability | Reason deferred | Re-entry evidence required |
|---|---|---|---|
| DEF-01 | AI/OCR document extraction | Not required for a credible deterministic prototype; delivered claim would be misleading | Extraction accuracy evaluation, failure handling and integrated acceptance |
| DEF-02 | Live KYC/KYB and sanctions providers | Provider, jurisdiction and operational responsibilities are unresolved | Provider selection, contracts, test environment and compliance approval |
| DEF-03 | Generated or counsel-approved Trade Escrow Agreement | Legal wrapper is not production-ready | Jurisdiction choice, qualified legal review and signed operating model |
| DEF-04 | Human document-examiner console and network | Research exists but the operating service is not delivered | SOP, permissions, audit model, staffing and tested console |
| DEF-05 | Electronic bill-of-lading title transfer | Legal and technical scope exceeds the academic MVP | eBL provider/legal framework and end-to-end title controls |
| DEF-06 | Mainnet, custody and production hardening | Testnet/local evidence is sufficient for the assessment prototype | Security review, key management, monitoring and production runbook |
| DEF-07 | Partner logistics, bank and compliance APIs | External coordination and reliability are outside the submission window | Selected partners, sandbox access, contracts and integration tests |
| DEF-08 | User-facing multi-agent runtime | Agent scaffold is not the same as a delivered product runtime | Approved use cases, API integration, safety controls and UX acceptance |

## 8. Blocker register

| Blocker | Affects | Owner | Original target | Status at 12 Aug | Escalation trigger |
|---|---|---|---:|---|---|
| Clean app installation fails during Prisma postinstall because `app/.env` is absent from a clone | TEC-10, SUB-02 | Nick | 12 Aug | **Confirmed/root-caused:** guard env loading and add an app-level environment template | Fix does not hold from a fresh dependency-free checkout |
| Both `package-lock.json` and `pnpm-lock.yaml` are tracked; `pnpm-workspace.yaml` also signals pnpm workspace intent | TEC-10, SUB-02 | Nick | 12 Aug | Open — choose and document one authoritative package manager/lockfile | Two machines can legitimately resolve different dependency trees |
| Production build fails because `app/dan/deals/[dealId]/page.tsx` exports invalid `DealDetailPage` | TEC-09, TEC-10, SUB-02 | Nick | 12 Aug | Open — bundling completed; TypeScript then rejected an invalid Next.js page export | Build still fails after correcting the invalid page export |
| Focused source lint reports 5 errors and 12 warnings; full lint also scans generated Prisma output | TEC-09, TEC-10 | Nick | 12 Aug | Open — fix source errors and exclude generated output separately | Focused source lint still fails |
| Canonical demo route has not been formally recorded; legacy/integrated/admin/dev routes remain reachable | UX-04, SUB-02 | Mo | 11 Aug | **Overdue:** freeze route allowlist and exact click/return path | Any recorded navigation can enter `/dashboard/legacy`, `/dashboard/integrated`, `/admin`, `/dev` or competing role surfaces |
| Delivered document scope and written requirements are not fully aligned | PRD-03, PRD-04 | Dan | 12 Aug | Open | Cold-test behaviour differs from pitch wording |
| Beachhead, fee and funding ask need one approved assumption set | BUS-04, BUS-05, SUB-01 | Conrad | 12 Aug | Open | Deck and script use different values or segments |
| Existing BMC mixes delivered MVP with AI, screening, full dispute, broad corridors and yield roadmap | BUS-07, BUS-05, SUB-01 | Conrad / Tamer | 12 Aug | **Zero float:** revise before claim freeze | Original BMC wording enters the final deck unchanged |
| Final presentation and recording evidence is not yet present | SUB-01–SUB-07 | Tamer / Dan | 13–14 Aug | Open | Rehearsal or recording misses its daily gate |

## 9. Weekly flow reconstruction

| Week | Baseline focus | Observed evidence / variance |
|---|---|---|
| G0 — 8 Jun | Proposal handoff | Proposal gate established |
| W1 — 9–14 Jun | Requirements, sources, legal scan | Source pack, legal-risk work and onboarding requirements progressed |
| W2 — 15–21 Jun | Lock BRD/governance/workflow | Governance appeared 17 Jun; BRD remained open beyond baseline |
| W3 — 22–28 Jun | Architecture, operating model, commercial definition | Roadmap, legal updates and operational-flow artifacts appeared |
| W4 — 29 Jun–5 Jul | Contract milestone and design foundation | Contract/tests delivered on baseline; finance/customer research refined |
| W5 — 6–12 Jul | Core app, roles, API and rules | Major account, API, lifecycle and test increments landed |
| W6 — 13–19 Jul | Integrate role journeys | Wizard integration and terms/UI work progressed |
| W7 — 20–26 Jul | Objection, documents and operational integration | Realistic B/L and objection-window work landed; some scope remained fluid |
| W8 — 27 Jul–2 Aug | Multi-deal dashboard and persistence | Dashboard, auth, SQL, refund and audit features assembled |
| W9 — 3–9 Aug | Testnet, onboarding, full document pack, pitch evidence | SIWE, Base deployment, onboarding and full corridor pack delivered late in the window |
| W10 — 10–14 Aug | Acceptance, BMC/claim freeze, record and submit | Requirements reconciled; 187 app and 21 contract tests pass; build/lint, BMC approval and submission package remain critical |

## 10. Achievement ledger

| Date evidenced | Achievement | State | Evidence |
|---|---|---|---|
| 8 Jun | Proposal and original commercial/BMC baseline retained | Done | Proposal artifacts and `proposal/business-model-slide.md` |
| 17 Jun | Initial governance set produced | Done | Commit `5c4daba` |
| 23 Jun–1 Jul | Legal, workflow, customer and financial evidence produced | Done | Dated `docs/`, customer and financial artifacts |
| 5 Jul | Escrow contract, deployment module and tests produced | Done | Commit `36222dd` |
| 10–13 Jul | API, rules, account roles and lifecycle journeys integrated | Done | Relevant feature and merge commits |
| 23–31 Jul | B/L model, objection, refund, audit, multi-deal and persistent-account capabilities produced | Done | Dated feature commits |
| 3–10 Aug | SIWE, Base Sepolia, onboarding gate, dashboard refinement and full corridor document pack produced | Done | Dated feature/deployment commits |
| 9–11 Aug | BRD/TRD baselined and overstatements reconciled | Done / Review | Commits `3b3e82e`, `42aa948` |
| 12 Aug | Application test suite passes | Done as test evidence | 187/187 tests across 10/10 files |
| 12 Aug | Contracts rebuild from source and the standard compiled suite passes | Done as A1 evidence | `hardhat compile --force` with solc 0.8.28; 21/21 tests via standard `hardhat test` |
| 12 Aug | BMC challenged against governance evidence | Review | BUS-06 retained; BUS-07 created for final revision |

This ledger prevents completed work from being shown as “Not Started.” It does not convert open build, lint, cold-demo or submission gates into completed achievements.

## 11. Board update protocol

At each update, the owner must:

1. move the card only when the state definition is satisfied;
2. record the observed date and evidence when entering Review or Done;
3. record a variance when planned finish is missed;
4. flag a blocker with owner and resolution date;
5. update the project plan, RACI and [master-gantt.xlsx](master-gantt.xlsx) in the same change when dates or accountability change; and
6. move non-critical additions to Deferred after scope freeze.

## 12. Verification log — 12 August 2026

Evidence is separated from card state so successful checks do not silently convert integrated Review gates into Done.

| Check | Result | Governance consequence |
|---|---|---|
| Cited commit hashes | **PASS:** all 32 unique hashes resolve; dates and subjects match repository history | Dated artifact claims are traceable; commits alone do not prove approval |
| Contract source rebuild | **PASS:** forced compile using configured solc 0.8.28 | Removes the obsolete existing-artifacts caveat |
| Contract acceptance suite | **PASS:** 21/21 tests in the standard compiled run | A1 achieved |
| Application suite | **PASS:** 187/187 tests across 10/10 files | Strong supporting evidence; does not replace A2–A7 walkthrough |
| Clean app installation | **FAIL:** Prisma postinstall expects untracked `app/.env`; no `app/.env.example` exists | TEC-10 and R-08 materialised |
| Package-manager authority | **FAIL:** npm and pnpm lockfiles are both tracked | Clean dependency-tree reproducibility not established |
| Focused source lint | **FAIL:** 5 errors, 12 warnings | Code-quality gate open |
| Production build | **FAIL:** bundling completed; TypeScript then rejected an invalid named page export | Build gate open; an earlier default build may instead stop on the workstation directory-permission issue, so the named-export defect is evidenced by the later build path |
| Deployment record | Present; Base Sepolia chain ID 84532 | Testnet evidence retained |
| Route surface | 14 page routes, including legacy/integrated/admin/dev paths | UX-04 remains overdue |
| Board arithmetic | **PASS:** 24 Done / 8 Review / 6 Doing / 6 To Do / 8 Deferred | Snapshot matches the controlled rows |
| v2.1 Gantt | **PASS:** [master-gantt.xlsx](master-gantt.xlsx) reconciles all 52 controlled cards and the 24/8/6/6/8 status snapshot | Four-report control is operational |
