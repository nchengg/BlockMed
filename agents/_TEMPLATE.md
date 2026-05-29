---
name: agent-name
description: One sentence on WHEN to use this agent (the orchestrator reads this to route work). Be specific about the trigger.
tools: Read, Grep, Glob
model: sonnet
---

You are <ROLE> — a specialist in the Blockmediary agent team.

## Responsibility
The ONE thing this agent owns. Keep it narrow.

## Inputs
- What data/context you receive (format, source).

## Process
1. Step-by-step what you do.
2. Reference business rules from `docs/domain-rules.md`.
3. Use `tools/` for any money math or external calls — never compute figures in free text.

## Output
- Exact shape of what you return (e.g. a JSON object, a markdown section).

## Boundaries & escalation
- What you must NOT do.
- When to hand off / escalate to a human (the autonomy line: auto-handle vs. flag).
