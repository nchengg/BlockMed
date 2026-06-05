---
name: run-analysis
description: Run an end-to-end analysis over a Blockmediary dataset — load and profile it, run the relevant domain specialist (deal-intake / kyc-compliance / escrow / document-checker / dispute / settlement), and produce a user-facing report. Use when asked to "analyze", "run the pipeline", or generate a briefing from data in data/.
---

# run-analysis — the core workflow

This is the reference Trigger → Input → Process → Output flow. Copy it to build others
(e.g. `weekly-briefing`, `trade-origination`, `escrow-release`).

## Trigger
User invokes `/run-analysis` with a dataset name, or a routine fires it on a schedule.

## Input
- Dataset under `data/` (default: most recent CSV).
- Business rules from `docs/domain-rules.md` (escrow state model, valid objection grounds, autonomy thresholds).

> **Environment: operations.** This workflow runs the live escrow pipeline and routes only `ops-*` agents. The development-environment equivalents (`dev-*`) are never used here.

## Process
1. Delegate to the **ops-data-analyst** agent → get a clean data profile.
2. Delegate to the relevant **Blockmediary domain agent** (`ops-deal-intake` / `ops-kyc-compliance` / `ops-escrow` / `ops-document-checker` / `ops-dispute` / `ops-settlement` — pick based on the escrow state the dataset reflects) → get findings + compliance verdict (Compliant / Discrepant / Rejected / Escalated).
3. Apply the autonomy rule from `docs/domain-rules.md`: separate auto-handled items from those needing the document reviewer or dispute resolver.
4. Delegate to the **ops-report-writer** agent → format for the target audience.

## Output
- A markdown report (and/or a structured object for the UI) containing: headline,
  findings with reasons, prioritized actions, and an "escalated for review" section.

## Notes
- Keep numeric computation in `tools/`; agents orchestrate and explain, scripts compute.
- This skill is the seam between the agent backend and the product UI — the UI calls the
  same flow via the Agent SDK in production.
