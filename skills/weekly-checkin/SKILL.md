---
name: weekly-checkin
description: Recurring Monday-plan / Friday-log workflow during the Build phase (2026-06-08 → 2026-08-14). Maintains the personal log that feeds 60% of the individual-report grade. Also lightly touches the Kanban board.
---

# weekly-checkin — Build phase recurring workflow

This skill protects the highest-leverage academic asset: the weekly personal log.
Skipping a week means reconstructing it later from memory — graders detect this.

## Trigger
- Monday morning: `/weekly-checkin --mode=plan`
- Friday afternoon: `/weekly-checkin --mode=log`
- Or, with `/schedule`, two recurring cron entries: Mondays 09:00, Fridays 17:00.

## Input
- Mode (`plan` or `log`).
- For `plan`: the user's intentions for the upcoming week (free-text, will be probed).
- For `log`: the user's actual contributions (free-text, plus optional `git log` / Drive recent files as evidence).
- `docs/hackathon-context.md` (phase + week-number reference).

## Process

### Monday — plan mode
1. **Orchestrator** confirms phase = Build (between 2026-06-08 and 2026-08-14). Otherwise warn but proceed.
2. Delegate to **personal-log** in Monday mode → append `### Planned` block for the week.
3. Delegate to **project-planner** → reconcile this week's planned items against the active RACI + Kanban. Move cards from To-Do → Doing where appropriate.
4. Surface conflicts: anything the user planned that has no Kanban card, or any Kanban card stalled >2 weeks.

### Friday — log mode
1. **Orchestrator** confirms phase = Build.
2. Optionally collect evidence: `git log --author="<user>" --since="last Monday"`, Drive `list_recent_files` (if MCP wired in this repo at the time), meeting notes.
3. Delegate to **personal-log** in Friday mode → append `### Done` / `### Variance` / `### Learning` blocks.
4. Delegate to **project-planner** → update Kanban (Doing → Review / Done), reconcile sizing vs actual.
5. Report the running word count toward the 1,000-word §2 target.

## Output
- Updated `proposal/personal-log.md` with the new week's entries.
- Updated Kanban / RACI artefacts (if changed).
- A one-paragraph status to surface to the user: this-week progress, log word count, anything off-track.

## Notes
- Never edit prior weeks' log entries (academic-integrity rule — see `personal-log.md`).
- If a week is genuinely missed, log it as missed rather than backfilled. Authenticity scores higher than completeness here.
- The personal log lives in the git repo, NOT in Drive — the log is the user's individual artefact and should be versioned alongside the code they produced.
