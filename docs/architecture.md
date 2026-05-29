# Architecture

## Layers (mapped to the 7-stage "AI employee" framework)

| Layer | Framework stage | Where it lives |
|-------|-----------------|----------------|
| Role | Define the role | `agents/*.md` (canonical); `.claude/agents/*.md` (generated) |
| Workflow | Build the workflow | `skills/*/SKILL.md` (canonical); `.claude/skills/*/SKILL.md` (generated) |
| Context/memory | Add memory & context | `docs/domain-rules.md`, `docs/product-blockmediary.md`, `CLAUDE.md`, `AGENTS.md` |
| Tools | Connect tools | `tools/`, MCP servers |
| Routines | Routine stack | `/schedule`, hooks in `.claude/settings.json` |
| Review | Review & refine | evaluation harness (built in weeks 8–9) |

## Runtime split

- **Development:** Claude Code runs the agents directly from this scaffold repo. Fast
  iteration; agents and skills are just files.
- **Product:** the same agent definitions and the `run-analysis` flow are invoked through
  the Claude Agent SDK behind the Blockmediary web/dashboard UI in the downstream product
  repo. The skill is the stable seam — the UI calls the workflow, not individual agents.

## On-chain vs off-chain split

The smart contract is intentionally narrow. Most decision logic lives off-chain:

| Layer | Responsibility |
|-------|----------------|
| Smart contract escrow | Hold + release stablecoin; enforce `Draft → Funded → Released / Refunded / Disputed` state transitions |
| Off-chain workflow | Deal terms, escrow spec, document storage, OCR/AI extraction, rules engine, audit ledger |
| Authorised release function | Submit the off-chain compliance verdict on-chain |

See [product-blockmediary.md](product-blockmediary.md) for the full state model.

## Agent team

Cross-phase generalists:
- **orchestrator** — manager: routes, aggregates, decides vs. escalates.
- **data-analyst** — prepares + profiles data (always first in analysis flows).
- **report-writer** — formats results for the user (always last).

Phase-specific:
- **proposal-writer** — Proposal phase only (now → 2026-06-08).
- **project-planner** — Proposal + Build phases (sizing, RACI, Kanban, BMC).
- **personal-log** — Build + Report phases (weekly individual log; 80% individual-grade asset).

Blockmediary domain specialists (added during Build, from `_TEMPLATE.md`):
- **deal-intake** — captures sale-contract terms (uploaded contract or structured form) → produces canonical escrow specification (JSON).
- **kyc-compliance** — KYC / KYB / sanctions screening at intake plus continuous monitoring; appends to the audit ledger.
- **escrow** — smart-contract wrapper: lock funds, release, refund, state transitions. Narrow scope by design.
- **document-checker** — OCR/AI extraction of submitted trade documents + rules-engine comparison against the escrow spec; produces Compliant / Discrepant / Rejected / Escalated verdict.
- **dispute** — handles objection-window logic, valid-objection grading, amendments, waivers, refunds, escalation to the named dispute forum.
- **settlement** — executes the on-chain release or refund transaction once authorised; narrow scope (no FX, no on/off ramps in MVP).

## Two rules that prevent the common failure modes

1. **Determinism for money:** all arithmetic / amount-matching / fee math happens in `tools/` (real code), not in agent prose. LLMs miscount; code doesn't.
2. **Explicit autonomy line:** every output is tagged auto-handled vs. escalated, with a reason. Document compliance and release decisions especially — graders and (eventually) regulators want to see the trail.
