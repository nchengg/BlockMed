# Master Gantt — Blockmediary

> **SUPERSEDED — historical baseline only.** This 8 June schedule uses legacy M0–M8 identifiers and is not the current v2.1 task-controlled Gantt. See `project-governance-v2/master-gantt.xlsx` when generated.

> **Version:** v2 (legacy numbering) · **Date:** 8 June 2026 · **Owner:** Tamer (CEO)
> **Window:** Mon 9 Jun → Thu 14 Aug 2026 (10 weeks)
> **Legend:** █ = active work · ░ = light / handover · ◆ = milestone

## Milestones

| ID | Milestone | Week |
|---|---|---|
| M0 | Proposal video submitted (8/10 secured) | 8 Jun ✅ |
| M1 | BRD v1.0 locked | W2 |
| M2 | Smart contract on Base Sepolia | W4 |
| M3 | Frontend MVP demo-ready | W7 |
| M4 | Full happy-path integration | W8 |
| M5 | Main video submission | 14 Aug |

---

## Schedule

| Task | W1<br>9 Jun | W2<br>16 Jun | W3<br>23 Jun | W4<br>30 Jun | W5<br>7 Jul | W6<br>14 Jul | W7<br>21 Jul | W8<br>28 Jul | W9<br>4 Aug | W10<br>11 Aug |
|---|---|---|---|---|---|---|---|---|---|---|
| **N1. Smart contract** | █ | █ | █ | █◆ | ░ | ░ | █ | █ | ░ | |
| **N2. Off-chain platform** | █ | █ | █ | █ | █ | █ | █ | █ | ░ | |
| **N3. API layer** | | █ | █ | █ | █ | █ | █ | █ | ░ | |
| **N4. Doc verification engine** | | | █ | █ | █ | █ | █ | █ | ░ | |
| **M1. Buyer dashboard** | | █ | █ | █ | █ | █ | █◆ | █ | ░ | |
| **M2. Seller dashboard** | | █ | █ | █ | █ | █ | █◆ | █ | ░ | |
| **M3. Review console** | | | █ | █ | █ | █ | █ | █ | ░ | |
| **M4. Demo polish** | | | | | | | █ | █ | █ | ░ |
| **B1. KYB/KYC framework** | █ | █ | █ | █ | █ | █ | █ | ░ | | |
| **B2. Sanctions + screening** | | █ | █ | █ | █ | █ | ░ | | | |
| **B3. Trade Escrow Agreement** | █ | █ | █ | █ | █ | ░ | | | | |
| **B4. Regulatory mapping** | █ | █ | █ | █ | █ | ░ | | | | |
| **B5. Market analysis (reg)** | █ | █ | █ | ░ | | | | | | |
| **D1. Workflow design** | █ | █ | █ | ░ | | | | | | |
| **D2. Doc review console (ops)** | | █ | █ | █ | █ | █ | ░ | | | |
| **D3. Sprint cadence** | █ | █ | █ | █ | █ | █ | █ | █ | █ | █ |
| **D4. Demo prep orchestration** | | | | | | | █ | █ | █◆ | █◆ |
| **D5. Backend contribution** | | █ | █ | █ | █ | █ | █ | █ | ░ | |
| **C1. Financial model** | █ | █ | █ | █ | ░ | ░ | █ | █ | ░ | |
| **C2. Unit economics** | | █ | █ | █ | ░ | | | █ | | |
| **C3. Funding ask** | █ | █ | ░ | | | | █ | █ | █ | ░ |
| **C4. Market analysis (size)** | █ | █ | █ | ░ | | | | | | |
| **M5. Beachhead refinement** | █ | █ | █ | ░ | | | | | | |
| **M6. Forwarder BD** | █ | █ | █ | █ | █ | █ | █ | █ | █ | █ |
| **M7. Customer discovery** | █ | █ | █ | █ | █ | █ | ░ | | | |
| **M8. Pricing** | | █ | █ | █ | █ | ░ | | | | |
| **T1. BRD ownership** | █ | █◆ | ░ | ░ | | | | | | |
| **T2. Business Model Canvas** | █ | █ | █ | ░ | | | | | | |
| **T3. Pain & Gain model** | █ | █ | █ | ░ | | | | | | |
| **T4. Sketch pad** | | █ | █ | █ | █ | ░ | | | | |
| **T5. Critic pad** | | | █ | █ | █ | █ | ░ | | | |
| **T6. Strategy implementation** | █ | █ | █ | █ | █ | ░ | | | | |
| **T7. Execution oversight** | █ | █ | █ | █ | █ | █ | █ | █ | █ | █ |
| **T8. Monitoring** | █ | █ | █ | █ | █ | █ | █ | █ | █ | █ |
| **T9. Consolidated market** | | █ | █ | █ | ░ | | | | | |
| **T10. Competitive analysis** | | █ | █ | █ | ░ | | | █ | ░ | |

---

## Critical-path observations

1. **W1–W2 is BRD-resolution week.** Most workstreams cannot be sized properly until T1 is locked. Team's first priority.
2. **W4 smart contract milestone is tight.** Three weeks for a working escrow on Base Sepolia is achievable but not generous — CTO to sanity-check.
3. **W7 frontend MVP** depends on backend N1+N2+N3 being demo-stable. Any backend slippage costs frontend.
4. **W8 full happy-path integration** is the most fragile point. Anything missing from B1/B2/B3 by W7 puts the demo at risk.
5. **W9–W10 is demo finalisation + submission only.** Treat end of W8 as effective feature freeze.
