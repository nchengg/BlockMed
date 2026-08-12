# Blockmediary Master RACI v2.1

> **Window:** 8 June 2026 to 14 August 2026\
> **Status date:** 12 August 2026\
> **Owner:** Tamer — CEO / Project Lead\
> **Rule:** Every row has exactly one **A**. A person may also be Responsible on the same row.
> **Gantt status:** v2.1 workbook pending; any date/owner change must be queued for reconciliation until it exists.

## 1. Team roles

| Person | Role | Governance responsibility |
|---|---|---|
| Tamer | CEO / Project Lead | Scope, decisions, consolidated narrative and submission |
| Nick | CTO | Technical architecture, integration, acceptance and reproducibility |
| Conrad | CFO | Financial model, unit economics, pricing assumptions and funding ask |
| Dan | COO | Product workflow, delivery operations, demo runbook and recording orchestration |
| Badhri | CCO | Legal, compliance, document controls and regulatory claim review |
| Mo | CRO | User experience, customer/beachhead case, GTM and interface polish |

## 2. RACI definitions

| Code | Meaning |
|---|---|
| R | Performs or coordinates the work and supplies evidence |
| A | Owns the outcome, approves completion and is answerable for the gate |
| C | Provides input before the decision or approval |
| I | Receives the decision or status after it is made |

Where a cell contains **A/R**, the accountable owner is also directly responsible. Blank cells are intentionally outside the required communication path.

## 3. Deliverable-level RACI

| Deliverable / task group | Task IDs | Tamer | Nick | Conrad | Dan | Badhri | Mo |
|---|---|---|---|---|---|---|---|
| Proposal handoff and governance baseline | GOV-01, GOV-02 | **A/R** | C | I | R | I | I |
| BRD, TRD and governance control | GOV-03–GOV-05 | **A** | R | C | R | C | C |
| Product workflow and state model | PRD-01, PRD-02 | C | C | I | **A/R** | C | C |
| Document-pack and pitch traceability | PRD-03, PRD-04 | C | R | I | **A/R** | R | C |
| Escrow contract and testnet evidence | TEC-01, TEC-02, TEC-07 | I | **A** | I | R | C | I |
| Application, lifecycle and identity integration | TEC-03–TEC-06, TEC-08 | I | **A** | I | R | C | C |
| Technical acceptance and clean-build gate | TEC-09, TEC-10 | I | **A/R** | I | R | I | C |
| UX foundation and role journeys | UX-01, UX-02 | C | C | I | C | I | **A/R** |
| Canonical dashboard and demo polish | UX-03–UX-05 | C | C | I | R | I | **A/R** |
| Regulatory and legal evidence | RISK-01, RISK-02, RISK-05 | C | I | I | C | **A/R** | I |
| Verification and document controls | RISK-03, RISK-04 | I | C | I | R | **A/R** | C |
| Final legal/compliance claim review | RISK-06 | C | C | I | I | **A/R** | C |
| Financial model and assumption set | BUS-01, BUS-04 | C | I | **A/R** | I | C | R |
| Customer, beachhead and competitor evidence | BUS-02, BUS-03 | C | I | C | I | R | **A/R** |
| Consolidated real-value case | BUS-05 | R | I | **A/R** | C | C | R |
| BMC baseline and evidence-aligned revision | BUS-06, BUS-07 | R | C | **A/R** | C | C | R |
| Script, deck and claim freeze | SUB-01 | **A/R** | C | C | R | C | R |
| Runbook, rehearsals and recordings | SUB-02–SUB-05 | C | R | I | **A/R** | I | R |
| Submission QA and upload | SUB-06, SUB-07 | **A/R** | I | I | R | I | C |

### Accountability audit

All 19 rows above contain exactly one **A**. Any ownership change must preserve that rule and update the task-level register below.

DEL-08 is a legitimate parent-deliverable roll-up, not a transfer of component accountability: BUS-02 and BUS-03 remain accountable to Mo. Conrad is accountable for integrating their approved customer and competitor evidence with the financial model, pricing, BMC and consolidated commercial case.

## 4. Task accountability register

| Task | Accountable | Responsible | Required approval / handoff |
|---|---|---|---|
| GOV-01 Proposal handoff | Tamer | Tamer | Retain proposal evidence and open assessed build window |
| GOV-02 Governance baseline | Tamer | Tamer, Dan | Team informed of controls and task structure |
| GOV-03 BRD v1.0 | Tamer | Nick | CEO approves product scope; all leads consulted |
| GOV-04 TRD and A1–A8 baseline | Tamer | Nick | CTO confirms technical truth; CEO approves status language |
| GOV-05 Governance monitoring | Tamer | Tamer, Dan | COO supplies delivery state; all leads escalate blockers |
| PRD-01 Operating workflow | Dan | Dan | CTO/CCO/CRO consulted before approval |
| PRD-02 State and release rules | Dan | Nick, Dan | CTO supplies implementation; CCO consulted on rule meaning |
| PRD-03 Document-pack alignment | Dan | Nick, Badhri | Cold-test evidence handed to product and pitch owners |
| PRD-04 Product-to-pitch traceability | Dan | Dan, Tamer | CTO/CCO validate delivered and roadmap labels |
| TEC-01 Escrow contract | Nick | Nick, Dan | Contract review and tests required |
| TEC-02 Contract tests/cancel path | Nick | Dan | Results handed to TEC-09 |
| TEC-03 API/rules core | Nick | Nick, Dan | Integrated route and rules evidence required |
| TEC-04 Lifecycle wiring | Nick | Nick, Dan | Product owner validates intended sequence |
| TEC-05 Objection/refund/audit | Nick | Dan | Acceptance evidence handed to runbook owner |
| TEC-06 SQL/auth/SIWE | Nick | Dan, Nick | Isolation and identity checks required |
| TEC-07 Base Sepolia deployment | Nick | Dan | Deployment address/network evidence retained |
| TEC-08 Onboarding gate | Nick | Dan | CCO reviews claims; live compliance is not implied |
| TEC-09 A1–A8 acceptance | Nick | Nick, Dan | Results approved before recording |
| TEC-10 Reproducibility | Nick | Nick | Approved commit and clean-build log handed to Dan |
| UX-01 UX foundation | Mo | Mo | Product workflow consulted |
| UX-02 Role journeys | Mo | Mo, Nick | CTO validates role/state integration |
| UX-03 Consolidated dashboard | Mo | Mo, Dan | Approved candidate handed to UX-04 |
| UX-04 Canonical route | Mo | Mo, Dan | Tamer records decision; Dan updates runbook |
| UX-05 Demo polish | Mo | Mo | Dan accepts recorded path readiness |
| RISK-01 Standards source pack | Badhri | Badhri | Sources identified for future claim checks |
| RISK-02 Legal-risk register | Badhri | Badhri | Tamer informed of material pitch constraints |
| RISK-03 Verification model | Badhri | Dan, Badhri | Product/technical teams consulted |
| RISK-04 Document templates | Badhri | Badhri | Requirements handed to PRD-03 |
| RISK-05 UAE/corridor research | Badhri | Badhri, Tamer | Only verified statements enter pitch |
| RISK-06 Legal/compliance claim review | Badhri | Badhri, Tamer | Signed claim register handed to SUB-01 |
| BUS-01 Financial model | Conrad | Conrad | Assumptions traceable and reviewable |
| BUS-02 Customer analysis | Mo | Mo, Conrad | One beachhead recommendation handed to BUS-04 |
| BUS-03 Competitor analysis | Mo | Badhri, Mo | Claims source-checked before use |
| BUS-04 Pricing/economics/ask | Conrad | Conrad, Mo | One approved assumption set handed to BUS-05 |
| BUS-05 Real-value case | Conrad | Conrad, Mo, Tamer | Approved narrative handed to SUB-01 |
| BUS-06 Original BMC | Conrad | Tamer, Conrad, Mo | Preserve as achieved baseline artifact; do not imply final approval |
| BUS-07 Evidence-aligned BMC v2 | Conrad | Conrad, Tamer, Mo, Badhri | CEO approves narrative; CCO validates regulatory/corridor wording; hand to SUB-01 |
| SUB-01 Deck and script | Tamer | Tamer, all leads | Each lead signs off claims in their domain |
| SUB-02 Demo runbook | Dan | Dan, Nick | CTO validates setup/reset; Mo validates click path |
| SUB-03 Rehearsals | Dan | Dan, Mo | Defects escalated immediately to accountable owner |
| SUB-04 Primary recording | Dan | Dan, Mo, Tamer | Tamer approves final narrative and duration |
| SUB-05 Fallback recording | Dan | Dan, Nick | Open/test check before final QA |
| SUB-06 Submission QA | Tamer | Tamer, independent checker | Private-browser evidence required |
| SUB-07 Main group submission | Tamer | Tamer | Receipt distributed to team |

## 5. Milestone gate ownership

| Gate | Date | Accountable | Required sign-offs | Evidence / status at 12 Aug |
|---|---:|---|---|---|
| Proposal handoff | 8 Jun | Tamer | Submission artifact retained | `proposal/Pitch-Deck-June-8.pptx` retained |
| Governance and workstream baseline | 17 Jun observed | Tamer | Dan confirms cadence; all leads acknowledge ownership | Commit `5c4daba` |
| Contract increment | 5 Jul observed | Nick | Tests authored and product workflow understood | Source rebuilt with solc 0.8.28; 21/21 tests pass |
| Integrated candidate | 8–10 Aug observed | Nick | Dan/Mo confirm workflow and interface candidate | Commits `c61b1a6`, `3e9b4ed` |
| Scope and demo-route freeze | 11 Aug | Tamer | Nick, Dan and Mo | **Overdue:** canonical route allowlist and click path not formally approved |
| Acceptance and claim freeze | 12 Aug | Nick for technical; Tamer for narrative | Badhri, Conrad, Dan and Mo sign their domains | **Partial:** A1 achieved; A2–A8 evidence, build/lint and domain claim approvals remain open |
| BMC revision and commercial freeze | 12 Aug | Conrad | Tamer, Mo and Badhri approve final positioning and assumptions | **Zero float:** BUS-07 open and blocks SUB-01 claim freeze |
| Recording package | 13 Aug | Dan | Tamer approves primary; Nick approves fallback reproducibility | Not evidenced at status date |
| Main-video submission | 14 Aug | Tamer | Independent QA complete and receipt retained | Future at status date |

## 6. Escalation and handoff rules

| Situation | First owner | Escalation / handoff |
|---|---|---|
| Technical acceptance fails | Nick | Dan supplies reproduction; Tamer decides fix versus scope reduction |
| Clean setup or dependency tree differs across machines | Nick | Select one package manager; correct app environment bootstrap; reproduce from a fresh dependency-free checkout before handing the runbook to Dan |
| Document rule conflicts with legal interpretation | Badhri | Dan and Nick adjust product/claim; Tamer records decision |
| UX path does not match accepted lifecycle | Mo | Dan specifies workflow; Nick resolves technical blocker |
| Commercial values conflict across artifacts | Conrad | Mo supplies market rationale; Tamer freezes one assumption set |
| BMC describes roadmap as delivered | Conrad | Nick validates delivery status; Badhri validates regulatory language; Tamer removes or relabels claim |
| Pitch claim lacks evidence | Domain owner | Reword as prototype limitation or roadmap; Tamer approves final wording |
| Critical-path task misses its daily gate | Accountable owner | Escalate immediately to Tamer; move non-critical work to Deferred |
| Recording or testnet becomes unstable | Dan | Switch to approved deterministic path and retained fallback |
| Link/upload/permission problem | Tamer | Use submission buffer; retain screenshots and receipt |

## 7. RACI change control

An accountability change is valid only when:

1. the new accountable person explicitly accepts the outcome;
2. the row still contains exactly one A;
3. the Kanban task and project plan are updated in the same change;
4. any affected handoff is recorded; and
5. the change does not conceal an overdue or incomplete task.

Until `master-gantt.xlsx` exists, the same owner/date change must be logged for Gantt reconciliation and the four-report control must remain classified as not operational. Once generated, the Gantt must be updated in the same change.

## 8. Delivered-artifact accountability map

This map identifies who is answerable for acceptance and maintenance of each artifact group; it does not claim that the accountable owner was the sole author.

| Accountable owner | Role | Principal artifacts and outstanding handoffs |
|---|---|---|
| Nick | CTO | `contracts/contracts/Escrow.sol`; six contract test files; Base Sepolia deployment record; 28 application API route handlers; `app/lib/escrow/`; `app/prisma/`; CI configuration; clean-install/build evidence outstanding |
| Dan | COO | `docs/Flow Guidance/operational-flow-v1.md`; `docs/Flow Guidance/deal-flow-stages.md`; demo runbook, rehearsal log and recording package outstanding |
| Badhri | CCO | `docs/legal-risk.md`; `docs/UCP600.md`; `docs/Incoterms2020.md`; `docs/document-templates.md`; UAE licensing research; final claim sign-off outstanding |
| Mo | CRO | Landing/dashboard UX; `docs/Competitor-analysis.md`; `project-initialisation/customer-demographics.md`; canonical route approval and polish acceptance outstanding |
| Conrad | CFO | Financial model; `proposal/sizing.md`; original BMC; evidence-aligned BMC, pricing and funding-ask assumption freeze outstanding |
| Tamer | CEO | BRD; TRD; v2.1 governance set; final claims control; submission evidence; task-ID-aligned Gantt outstanding |

An owner attached to a Done task without corresponding artifact or acceptance evidence is a reporting defect. Component accountability remains with the task owner even where another owner integrates it into a parent deliverable.
