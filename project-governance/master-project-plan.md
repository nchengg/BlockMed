# Project Plan

> **Team:** Transakt  
> **Project window:** 8 June–14 August 2026  
> **Status:** Active scope complete  
> **Project lead:** Tamer  

## 1. Objective and scope

Build and present a working prototype of Blockmediary: a stablecoin documentary escrow product for SME cross-border trade.

Included in this plan:

- product, contract, application and demo work;
- market, commercial, financial and legal analysis;
- group presentation and submission work.

Excluded:

- individual-assignment work;
- trade finance or lending;
- post-MVP integrations listed under DEF-01.

## 2. Simple delivery timeline

| Phase | Timing | Main result |
|---|---|---|
| Proposal and definition | 8–21 Jun | Proposal handoff, requirements and governance baseline |
| Design and build | 22 Jun–31 Jul | Product workflow, contract, application, UX, research and strategy |
| Integration and review | 1–12 Aug | Deployment, acceptance, claims, commercial narrative and demo route |
| Submission | 13–14 Aug | Recordings, QA and upload |

## 3. Master task plan

This is the shared v3 task list used by the Project Plan, Kanban and RACI.

| ID | Task | Ownership | Start | Finish | Status | Depends on |
|---|---|---|---:|---:|---|---|
| GOV-01 | Proposal handoff | Tamer (A/R) | 8 Jun | 8 Jun | Done | — |
| GOV-02 | Requirements and governance baseline | Tamer (A); Nick and Dan (R) | 9 Jun | 21 Jun | Done | GOV-01 |
| GOV-03 | Project coordination through submission | Tamer (A/R); Dan (R) | 9 Jun | 14 Aug | Done | All active work |
| STR-01 | Market research | Tamer (A/R); Conrad and Mo (C) | 1 Jul | 7 Jul | Done | GOV-02 |
| STR-02 | Strategic analysis | Tamer (A/R); all leads (C) | 8 Jul | 14 Jul | Done | STR-01 |
| STR-03 | Strategic planning | Tamer (A/R); all leads (C) | 15 Jul | 21 Jul | Done | STR-02 |
| STR-04 | Financial and legal coordination and oversight | Tamer (A/R); Conrad and Badhri (C) | Jul 2026 | Jul 2026 | Done | STR-02 |
| PRD-01 | Product workflow and release rules | Dan (A/R); Nick (R) | 9 Jun | 10 Jul | Done | GOV-02 |
| PRD-02 | Document rules and pitch alignment | Dan (A); Nick and Badhri (R); Tamer (C) | 22 Jun | 12 Aug | Done | PRD-01 |
| TEC-01 | Smart contract and contract tests | Nick (A); Dan (R) | 15 Jun | 10 Jul | Done | PRD-01 |
| TEC-02 | Application lifecycle, authentication and persistence | Nick (A/R); Dan (R) | 22 Jun | 5 Aug | Done | TEC-01 |
| TEC-03 | Testnet deployment and onboarding gate | Nick (A); Dan (R) | 30 Jun | 10 Aug | Done | TEC-01 |
| TEC-04 | Integrated acceptance and clean-build reproducibility | Nick (A/R); Dan (R) | 3 Aug | 12 Aug | Done | TEC-02, TEC-03 |
| UX-01 | Role journeys and consolidated dashboard | Mo (A/R); Nick and Dan (C) | 22 Jun | 8 Aug | Done | PRD-01 |
| UX-02 | Canonical demo route and polish | Mo (A/R); Dan (R); Tamer (C) | 3 Aug | 12 Aug | Done | UX-01, TEC-04 |
| UX-03 | Front-end UI implementation | Mo (A/R); Nick and Dan (C); Tamer (I) | 22 Jun | 8 Aug | Done | UX-01 |
| TEC-05 | Back-end application integration | Mo (A/R); Nick (R); Dan (C); Tamer (I) | 15 Jul | 10 Aug | Done | TEC-02 |
| RISK-01 | Legal, regulatory and document research | Badhri (A/R); Tamer (C) | 9 Jun | 5 Aug | Done | GOV-02 |
| RISK-02 | Final legal and compliance claim review | Badhri (A/R); Tamer and Nick (C) | 3 Aug | 12 Aug | Done | RISK-01, PRD-02 |
| BUS-01 | Financial model, pricing and funding assumptions | Conrad (A/R); Mo (R); Tamer (C) | 9 Jun | 12 Aug | Done | STR-04 |
| BUS-02 | Customer, competitor and market case | Mo (A/R); Tamer, Conrad and Badhri (C) | 9 Jun | 12 Aug | Done | STR-01, STR-02 |
| BUS-03 | Business model and commercial narrative | Tamer (A/R); Conrad and Badhri (C) | 12 Aug | 12 Aug | Done | BUS-01, BUS-02, STR-03 |
| SUB-01 | Final deck and script | Tamer (A/R); Dan and Mo (R); other leads (C) | 27 Jul | 12 Aug | Done | PRD-02, RISK-02, BUS-03 |
| SUB-02 | Demo runbook | Dan (A/R); Nick (R); Mo (C) | 3 Aug | 12 Aug | Done | TEC-04, UX-02 |
| SUB-03 | Rehearsals and recordings | Dan (A/R); Tamer and Mo (R); Nick (C) | 10 Aug | 13 Aug | Done | SUB-01, SUB-02 |
| SUB-04 | Submission QA and upload | Tamer (A/R); Dan (R); Mo (C) | 13 Aug | 14 Aug | Done | SUB-03 |
| DEF-01 | Post-MVP integrations and production hardening | Tamer (A); technical and domain leads (C) | — | — | Deferred | After assessment |

## 4. Key milestones

| Date | Milestone | Status |
|---:|---|---|
| 8 Jun | Proposal handoff | Done |
| 10 Aug | Technical framework and smart-contract deployment on testnet | Done |
| 5 Aug | Legal, regulatory and compliance research and framework | Done |
| 14 Jul | Market research and strategic analysis | Done |
| 8 Aug | Front-end UI | Done |
| 12 Aug | Commercial and financial projection plan | Done |
| 14 Aug | Submission | Done |

## 5. Completion summary

All 26 in-scope tasks and all seven project milestones are marked Done. Post-MVP integrations and production hardening remain deferred under DEF-01.

## 6. Deferred boundary

DEF-01 combines AI/OCR, live KYC/KYB or sanctions providers, legal production agreements, human examiner operations, electronic bills of lading, mainnet hardening, partner APIs and the user-facing multi-agent runtime. These are not presented as delivered MVP capabilities.
