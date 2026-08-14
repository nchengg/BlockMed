from __future__ import annotations

from io import BytesIO
from pathlib import Path
import subprocess
import sys

from pypdf import PdfReader


ROOT = Path(r"C:\Users\cwbec\BlockMed")
OUT = ROOT / "tmp" / "financial-report" / "source-text"
SUBMISSION = ROOT / "docs" / "PDFs For Submission"
BRIEF_GIT_REF = "55073b1^:module-specification/beem063 Hackathon Main Presentation Brief 2026.pdf"


def extract(reader: PdfReader, label: str) -> None:
    lines = [f"SOURCE: {label}", f"PAGES: {len(reader.pages)}", ""]
    for number, page in enumerate(reader.pages, start=1):
        lines.append(f"=== PAGE {number} ===")
        lines.append((page.extract_text() or "").strip())
        lines.append("")
    (OUT / f"{label}.txt").write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for pdf in sorted(SUBMISSION.glob("*.pdf")):
        extract(PdfReader(str(pdf)), pdf.stem)

    brief_bytes = subprocess.check_output(
        ["git", "show", BRIEF_GIT_REF], cwd=ROOT
    )
    extract(PdfReader(BytesIO(brief_bytes)), "BEEM063_Main_Presentation_Brief_2026")

    for path in sorted(OUT.glob("*.txt")):
        pages = sum(1 for line in path.read_text(encoding="utf-8").splitlines() if line.startswith("=== PAGE "))
        print(f"{path.name}: {pages} pages, {path.stat().st_size:,} bytes")


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    main()
