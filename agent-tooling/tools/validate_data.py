"""Validate every JSON / JSONL fixture under data/.

Catches malformed fixtures before they reach an agent or the rules engine.
Stdlib only — runnable locally and in CI with no dependencies.

Usage:
    python tools/validate_data.py        # exit 1 if any file fails to parse
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

# This script lives at agent-tooling/tools/; data/ stays at the repo root, so go
# up three levels (tools/ -> agent-tooling/ -> repo root).
ROOT = Path(__file__).resolve().parent.parent.parent
DATA = ROOT / "data"


def check_json(path: Path) -> str | None:
    try:
        json.loads(path.read_text(encoding="utf-8"))
        return None
    except (json.JSONDecodeError, UnicodeDecodeError) as exc:
        return f"{path.relative_to(ROOT).as_posix()}: {exc}"


def check_jsonl(path: Path) -> str | None:
    try:
        lines = path.read_text(encoding="utf-8").splitlines()
    except UnicodeDecodeError as exc:
        return f"{path.relative_to(ROOT).as_posix()}: {exc}"
    for n, line in enumerate(lines, start=1):
        if not line.strip():
            continue
        try:
            json.loads(line)
        except json.JSONDecodeError as exc:
            return f"{path.relative_to(ROOT).as_posix()}:{n}: {exc}"
    return None


def main() -> int:
    if not DATA.exists():
        print("No data/ directory — nothing to validate.")
        return 0

    problems: list[str] = []
    checked = 0

    for path in sorted(DATA.rglob("*.json")):
        checked += 1
        if (err := check_json(path)) is not None:
            problems.append(err)

    for path in sorted(DATA.rglob("*.jsonl")):
        checked += 1
        if (err := check_jsonl(path)) is not None:
            problems.append(err)

    if problems:
        print(f"Validated {checked} file(s) — {len(problems)} invalid:")
        for p in problems:
            print(f"  {p}")
        return 1

    print(f"Validated {checked} file(s) — all valid.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
