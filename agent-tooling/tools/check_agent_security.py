"""Enforce the agent capability boundary against tools/agent_capabilities.json.

The security guarantee for the agent team is that an agent can only do what its
frontmatter `tools:` grant allows. This gate makes that boundary machine-checked
so a privilege escalation can't slip through a prose-only review.

It fails (exit 1) when, for any canonical agents/**/*.md (templates `_*.md` skipped):
  - the agent is not declared in the capability manifest;
  - its `tools:` grants a tool NOT in its approved set (privilege escalation);
  - it has an empty `tools:` line but is not approved for `*` (empty == all tools);
  - it is granted Bash/Write but has dropped its "## Boundaries" guardrails section.

Removing a tool (de-escalation) is always fine. Widening privilege requires a
deliberate edit to agent_capabilities.json — a reviewable, gateable diff.

Stdlib only — runnable locally and in CI with no dependencies.

Usage:
    python tools/check_agent_security.py
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
AGENTS = ROOT / "agents"
MANIFEST = ROOT / "tools" / "agent_capabilities.json"

GUARDRAILS_HEADING = "## boundaries"  # matches "## Boundaries" and "## Boundaries & escalation"


def parse_frontmatter(text: str) -> tuple[dict[str, str], str]:
    """Return ({key: value} from the YAML frontmatter, body-after-frontmatter)."""
    if not text.startswith("---\n"):
        return {}, text
    end = text.find("\n---\n", 4)
    if end == -1:
        return {}, text
    block = text[4:end]
    body = text[end + len("\n---\n"):]
    meta: dict[str, str] = {}
    for line in block.splitlines():
        if ":" in line:
            key, _, value = line.partition(":")
            meta[key.strip()] = value.strip()
    return meta, body


def split_tools(value: str) -> list[str]:
    return [t.strip() for t in value.split(",") if t.strip()]


def check() -> int:
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    approved: dict[str, list[str]] = manifest["agents"]
    needs_escalation = set(manifest["require_escalation_section_when_granted"])

    problems: list[str] = []
    seen: set[str] = set()

    for src in sorted(AGENTS.rglob("*.md")):
        if src.name.startswith("_"):
            continue  # templates / partials are not live agents
        rel = src.relative_to(ROOT).as_posix()
        meta, body = parse_frontmatter(src.read_text(encoding="utf-8"))
        name = meta.get("name", src.stem)
        seen.add(name)

        if name not in approved:
            problems.append(
                f"{rel}: agent '{name}' is not declared in tools/agent_capabilities.json "
                f"(add it with its approved tool set)."
            )
            continue

        allowed = approved[name]
        granted = split_tools(meta.get("tools", ""))

        if allowed == ["*"]:
            # Fully privileged by design; no superset check, but flag accidental narrowing? No — de-escalation is fine.
            continue

        if not granted:
            problems.append(
                f"{rel}: agent '{name}' has an empty `tools:` line, which grants ALL tools. "
                f"List explicit tools, or approve '*' in the manifest if that is intended."
            )
            continue

        extra = [t for t in granted if t not in allowed]
        if extra:
            problems.append(
                f"{rel}: agent '{name}' grants {extra} not in its approved set {allowed}. "
                f"Privilege escalation — if intended, widen it in tools/agent_capabilities.json."
            )

        if needs_escalation.intersection(granted):
            if GUARDRAILS_HEADING not in body.lower():
                problems.append(
                    f"{rel}: agent '{name}' is granted {sorted(needs_escalation.intersection(granted))} "
                    f"but has no '## Boundaries' guardrails section — restore its guardrails."
                )

    stale = sorted(set(approved) - seen)
    for name in stale:
        problems.append(
            f"manifest: '{name}' is in agent_capabilities.json but has no matching agent "
            f"under agents/ (remove the stale entry)."
        )

    if problems:
        print("Agent capability gate FAILED:")
        for p in problems:
            print(f"  {p}")
        print("\nManifest: tools/agent_capabilities.json")
        return 1

    print(f"Agent capability gate OK ({len(seen)} agents within approved tool sets).")
    return 0


if __name__ == "__main__":
    sys.exit(check())
