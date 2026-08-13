# agent-tooling

The Transakt team's Claude / AI development scaffolding — **not part of the Blockmediary product** (nothing here is imported by `app/` or `contracts/`). It defines the specialist agents and workflows used to *build and run* the project.

See **[`../AGENTS.md`](../AGENTS.md)** for the full agent model and how the pieces fit together.

| Path | What's here |
|------|-------------|
| `agents/development/` | The team's build & delivery agents (`dev-*`) — project planner, proposal writer, report writer, TL;DR, data analyst, etc. |
| `agents/operations/` | The live escrow product's runtime agents (`ops-*`). The two environments never invoke each other. |
| `agents/_TEMPLATE.md` | Template to copy when adding a new agent. |
| `skills/` | One directory per workflow (`<name>/SKILL.md`) — Trigger → Input → Process → Output. |
| `tools/` | Python helpers + the sync script. |

> **Canonical sources live here.** The tool-specific `.claude/` copies are *generated* — rebuild them with `python agent-tooling/tools/sync_agents.py`. Edit the files here, never the `.claude/` copies.
