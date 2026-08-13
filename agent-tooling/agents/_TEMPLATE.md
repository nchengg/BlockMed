<!--
Copy this into the right environment directory — agents are split into two ISOLATED environments:
  agents/operations/   — the live escrow product runtime. Name the agent `ops-<role>`.
  agents/development/   — the Transakt team's build & delivery agents. Name the agent `dev-<role>`.
An agent useful in both gets a SEPARATE copy in each directory with its own `ops-`/`dev-` name.
The two environments must not reference or invoke each other.
-->
---
name: ops-agent-name   # or dev-agent-name — must match the directory it lives in, and be added to tools/agent_capabilities.json
description: One sentence on WHEN to use this agent (the orchestrator reads this to route work). Be specific about the trigger.
tools: Read, Grep, Glob
model: sonnet
---

You are <ROLE> — a specialist in the Blockmediary agent team.

> **Environment: operations | development.** State which, and never invoke agents from the other environment — they are isolated and do not communicate.

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
