# Blockmediary — Claude Code entry

The full project spec is in [AGENTS.md](AGENTS.md) (cross-tool, read by Codex / Cursor /
Aider / Claude Code alike). This file just adds Claude-Code-specific notes.

## Read this first

[AGENTS.md](AGENTS.md) — what the project is, where agents are defined, working conventions.

## Claude-Code-specific notes

- The Claude-native locations `.claude/agents/` and `.claude/skills/` are **generated**
  from the canonical [agents/](agents/) and [skills/](skills/) directories at the repo
  root. Do not edit files under `.claude/` — your changes will be overwritten.
- After editing anything in `agents/` or `skills/`, run:
  ```
  python tools/sync_agents.py
  ```
- A pre-commit hook (see [AGENTS.md](AGENTS.md#suggested-pre-commit-hook)) blocks
  commits when `.claude/` drifts from canonical.

## Quick links

- **Product:** Blockmediary (documentary escrow for SME cross-border trade). **Team:** Transakt.
- **Product spec:** [docs/product-blockmediary.md](docs/product-blockmediary.md) — what we're building (mirrors `Hackathon/MVP_FLOW.md` in Drive)
- **Domain rules:** [docs/domain-rules.md](docs/domain-rules.md) — business rules every agent inherits (state model, autonomy thresholds, valid objection grounds)
- **Hackathon context:** [docs/hackathon-context.md](docs/hackathon-context.md) — deadlines, grading, framework, trainers
- **Architecture:** [docs/architecture.md](docs/architecture.md) — on-chain/off-chain split, agent team
- **Specialists:** [agents/](agents/)
- **Workflows:** [skills/](skills/)
