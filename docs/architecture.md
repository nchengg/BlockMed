# Architecture

## Layers (mapped to the 7-stage "AI employee" framework)

| Layer | Framework stage | Where it lives |
|-------|-----------------|----------------|
| Role | Define the role | `agent-tooling/agents/{operations,development}/*.md` (canonical); `.claude/agents/{operations,development}/*.md` (generated) |
| Workflow | Build the workflow | `agent-tooling/skills/*/SKILL.md` (canonical); `.claude/skills/*/SKILL.md` (generated) |
| Context/memory | Add memory & context | `docs/domain-rules.md`, `docs/product-blockmediary.md`, `CLAUDE.md`, `AGENTS.md` |
| Tools | Connect tools | `agent-tooling/tools/`, MCP servers |
| Routines | Routine stack | `/schedule`, hooks in `.claude/settings.json` |
| Review | Review & refine | evaluation harness (built in weeks 8–9) |

## Runtime split

The agents are split into **two isolated environments** that must not reference or invoke
each other:

- **`agent-tooling/agents/development/` (`dev-*`)** — the Transakt team's build & delivery agents
  (proposal, planning, weekly log, repo briefing). Active **now**, run by Claude Code
  directly from this scaffold repo. Fast iteration; agents and skills are just files.
- **`agent-tooling/agents/operations/` (`ops-*`)** — the live escrow product runtime. The domain
  specialists and the `run-analysis` flow are invoked through the Claude Agent SDK behind
  the Blockmediary web/dashboard UI in the downstream product repo. The skill is the stable
  seam — the UI calls the workflow, not individual agents. This is a **late-stage / product**
  concern; in the MVP slice the agent runtime is cut (see `plans/mvp-slice.md`).

An agent useful in both environments (e.g. the orchestrator, data-analyst, report-writer)
gets a **separate copy in each directory** with its own `ops-`/`dev-` name — never a shared
file, never a cross-environment call.

## On-chain vs off-chain split

The smart contract is intentionally narrow. Most decision logic lives off-chain:

| Layer | Responsibility |
|-------|----------------|
| Smart contract escrow | Hold + release stablecoin; enforce `Draft → Funded → Released / Refunded / Disputed` state transitions |
| Off-chain workflow | Deal terms, escrow spec, document storage, OCR/AI extraction, rules engine, audit ledger |
| Authorised release function | Submit the off-chain compliance verdict on-chain |

See [product-blockmediary.md](product-blockmediary.md) for the full state model.

## Agent team

Two isolated environments under `agent-tooling/agents/` (`dev-*` and `ops-*` never invoke each other).

### `agent-tooling/agents/development/` — team build & delivery (active now)

- **dev-orchestrator** — manager for the dev environment: routes across `dev-*`, aggregates, decides vs. escalates.
- **dev-data-analyst** — profiles team-side datasets (fixtures, sizing, market data).
- **dev-report-writer** — produces graded deliverables: video scripts + the report reflection.
- **dev-proposal-writer** — Proposal phase only (now → 2026-06-08).
- **dev-project-planner** — Proposal + Build phases (sizing, RACI, Kanban, BMC).
- **dev-personal-log** — Build + Report phases (weekly individual log; 80% individual-grade asset).
- **dev-tldr** — daily morning repo/CI/timeline briefing for each teammate.

### `agent-tooling/agents/operations/` — live escrow product runtime (late-stage / downstream)

Cross-cutting (duplicated from dev with their own `ops-` identity):
- **ops-orchestrator** — manager for the escrow pipeline: routes `ops-*` by escrow state, applies the autonomy policy.
- **ops-data-analyst** — profiles operational datasets (document sets, KYC records, on-chain logs).
- **ops-report-writer** — formats product-runtime output for buyer/seller/reviewer (product-briefing).

Domain specialists (added during Build, from `agent-tooling/agents/_TEMPLATE.md`):
- **ops-deal-intake** — captures sale-contract terms (uploaded contract or structured form) → produces canonical escrow specification (JSON).
- **ops-kyc-compliance** — KYC / KYB / sanctions screening at intake plus continuous monitoring; appends to the audit ledger.
- **ops-escrow** — smart-contract wrapper: lock funds, release, refund, state transitions. Narrow scope by design.
- **ops-document-checker** — OCR/AI extraction of submitted trade documents + rules-engine comparison against the escrow spec; produces Compliant / Discrepant / Rejected / Escalated verdict.
- **ops-dispute** — handles objection-window logic, valid-objection grading, amendments, waivers, refunds, escalation to the named dispute forum.
- **ops-settlement** — executes the on-chain release or refund transaction once authorised; narrow scope (no FX, no on/off ramps in MVP).

## Two rules that prevent the common failure modes

1. **Determinism for money:** all arithmetic / amount-matching / fee math happens in `agent-tooling/tools/` (real code), not in agent prose. LLMs miscount; code doesn't.
2. **Explicit autonomy line:** every output is tagged auto-handled vs. escalated, with a reason. Document compliance and release decisions especially — graders and (eventually) regulators want to see the trail.
