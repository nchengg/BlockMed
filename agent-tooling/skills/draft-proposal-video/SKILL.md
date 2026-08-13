---
name: draft-proposal-video
description: Produce the 5-minute proposal video script + supporting pitch-deck outline for the BEEM063 2026-06-08 submission. Run once per major revision; expect 2–3 rounds.
---

# draft-proposal-video — Proposal phase workflow

One-shot to produce the deliverable for the **first submission (2026-06-08)**.
Time-bounded: run only during the Proposal phase (today through 2026-06-08).

## Trigger
User invokes `/draft-proposal-video`, optionally with `--revision N` for follow-up passes.

## Input
- Product concept (one paragraph). Required.
- Team roster with skills. Required.
- Any market research / competitor notes already collected.
- `docs/hackathon-context.md` — load before anything else.

> **Environment: development.** This workflow uses only `dev-*` agents (team build & delivery). It never invokes operations (`ops-*`) agents.

## Process
1. **dev-orchestrator** confirms phase = Proposal and current date ≤ 2026-06-08. If not, abort with a phase-mismatch message.
2. Delegate to **dev-project-planner** to produce a 10-week timeline + RACI matrix + Business Model Canvas — these supply the Feasibility (40%) evidence and the Knowledge-applied (40%) evidence.
3. Delegate to **dev-proposal-writer** to produce the 14-slide deck outline + beachhead persona + TAM/SAM/SOM with sourced numbers — these supply the FinTech-environment (20%) evidence and the Solution narrative.
4. Delegate to **dev-report-writer** in `proposal-video-script` mode to turn (2) + (3) into a ~750-word spoken script with slide cues, calibrated to 5 minutes.
5. dev-orchestrator runs the **rubric check** — for each of the three grading criteria, name which slides / script lines satisfy it. Surface gaps explicitly.

## Output
A single deliverable bundle written to `proposal/proposal-video/`:

- `script.md` — the spoken script with slide cues.
- `deck-outline.md` — 14-slide bullet content (Tony Wood template).
- `evidence-map.md` — rubric coverage map (Feasibility / Knowledge / FinTech-env → which slide+line).
- `gaps.md` — what's still `[needs research]` or `[needs team decision]`.

## Notes
- Never auto-submit. The orchestrator surfaces the bundle for human review; the user uploads to ele.
- The deck-outline maps 1:1 to Tony's template — don't reorder unless the user explicitly asks.
- The evidence-map is what saves a borderline grade. Always produce it.
