#!/usr/bin/env python3
"""
SessionEnd hook: render the Claude Code session transcript to a human-readable
markdown file at <cwd>/.chatlog/<session-id>.md.

Reads JSON payload from stdin (hook event format) with at least:
  - session_id
  - transcript_path  (path to Claude Code's per-session JSONL)
  - cwd

Output:
  - User and assistant text only.
  - Tool calls condensed to one-line markers like "[Read] path/to/file".
  - Tool results omitted.

Idempotent: overwrites the output file on each run.
Defensive: any failure exits 0 so the harness is never disrupted.
"""
from __future__ import annotations

import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path


def render_content_block(block: dict) -> str | None:
    btype = block.get("type")
    if btype == "text":
        return (block.get("text") or "").rstrip()
    if btype == "tool_use":
        name = block.get("name", "?")
        inp = block.get("input") or {}
        if name in ("Read", "Edit", "Write"):
            summary = inp.get("file_path", "")
        elif name == "Bash":
            cmd = inp.get("command", "") or ""
            summary = cmd.splitlines()[0][:120] if cmd else ""
        elif name == "Grep":
            summary = f"pattern={inp.get('pattern', '')!r}"
        elif name == "Glob":
            summary = inp.get("pattern", "")
        elif name == "Agent":
            summary = f"{inp.get('subagent_type', '?')} — {inp.get('description', '')}"
        elif name == "Skill":
            summary = inp.get("skill", "")
        elif name == "AskUserQuestion":
            qs = inp.get("questions") or []
            summary = f"{len(qs)} question(s)"
        elif name == "TodoWrite":
            summary = "(todos)"
        else:
            summary = inp.get("description") or ""
        return f"→ [{name}] {summary}".rstrip()
    return None


def render_message(msg: dict) -> str | None:
    mtype = msg.get("type")
    if mtype not in ("user", "assistant"):
        return None

    message = msg.get("message") or {}
    content = message.get("content")
    role = "User" if mtype == "user" else "Assistant"
    ts = msg.get("timestamp", "")

    if isinstance(content, str):
        body = content.rstrip()
    elif isinstance(content, list):
        parts: list[str] = []
        for block in content:
            if not isinstance(block, dict):
                continue
            rendered = render_content_block(block)
            if rendered:
                parts.append(rendered)
        body = "\n\n".join(parts).strip()
    else:
        return None

    if not body:
        return None

    header = f"## {role}"
    if ts:
        header += f" — {ts}"
    return f"{header}\n\n{body}"


def main() -> int:
    try:
        payload = json.load(sys.stdin)
    except Exception:
        return 0

    session_id = payload.get("session_id") or "unknown-session"
    transcript_path = payload.get("transcript_path")
    cwd = payload.get("cwd") or "."

    if not transcript_path:
        return 0
    tpath = Path(transcript_path)
    if not tpath.exists():
        return 0

    out_dir = Path(cwd) / ".chatlog"
    try:
        out_dir.mkdir(parents=True, exist_ok=True)
    except Exception:
        return 0

    rendered: list[str] = []
    first_ts: str | None = None
    last_ts: str | None = None
    try:
        with tpath.open("r", encoding="utf-8") as fh:
            for line in fh:
                line = line.strip()
                if not line:
                    continue
                try:
                    msg = json.loads(line)
                except json.JSONDecodeError:
                    continue
                ts = msg.get("timestamp")
                if ts:
                    if first_ts is None:
                        first_ts = ts
                    last_ts = ts
                out = render_message(msg)
                if out:
                    rendered.append(out)
    except Exception:
        return 0

    if not rendered:
        return 0

    safe_session = re.sub(r"[^A-Za-z0-9_.-]", "_", session_id)
    out_path = out_dir / f"{safe_session}.md"

    header_lines = [
        f"# Chat log — session `{session_id}`",
        "",
        f"- **Project cwd:** `{cwd}`",
    ]
    if first_ts:
        header_lines.append(f"- **First message:** {first_ts}")
    if last_ts:
        header_lines.append(f"- **Last message:** {last_ts}")
    header_lines.append(f"- **Written:** {datetime.now(timezone.utc).isoformat()}")
    header_lines.append("")
    header_lines.append("---")
    header_lines.append("")

    output = "\n".join(header_lines) + "\n\n".join(rendered) + "\n"

    try:
        out_path.write_text(output, encoding="utf-8")
    except Exception:
        return 0

    return 0


if __name__ == "__main__":
    sys.exit(main())
