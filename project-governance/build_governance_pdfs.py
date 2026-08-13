#!/usr/bin/env python3
"""Regenerate the governance PDFs from their markdown sources.

    Final Delivery/master-raci.md        -> Final Delivery/master-raci.pdf
    Final Delivery/master-kanban.md      -> Final Delivery/master-kanban.pdf
    master-project-plan.md               -> master-project-plan.pdf

The markdown is the source of truth. Never hand-edit a PDF: change the .md and rerun

    python3 project-governance/build_governance_pdfs.py

Requires a Chromium browser (Brave/Chrome/Edge) and pypdf. Output is A4 landscape and
reproduces the existing house template: navy header bar, title block, meta strip parsed
from the leading blockquote, navy (or status-coloured) table headers, status pills, and a
footer carrying the team, status and page number.

Page numbers are stamped by rendering a second, transparent overlay PDF with one page per
content page and merging it — Chromium's CLI cannot emit a custom footer directly.
"""
import os
import re
import shutil
import subprocess
import sys
import tempfile

from pypdf import PdfReader, PdfWriter

HERE = os.path.dirname(os.path.abspath(__file__))

DOCS = [
    os.path.join(HERE, "Final Delivery", "master-raci.md"),
    os.path.join(HERE, "Final Delivery", "master-kanban.md"),
    os.path.join(HERE, "master-project-plan.md"),
]

# H1 -> the short name used in the big title ("Blockmediary <name>")
TITLE_NAME = {
    "RACI Matrix": "RACI",
    "Kanban Board": "Kanban",
    "Project Plan": "Project Plan",
}

# section heading -> table header colour, for the kanban's status columns
SECTION_ACCENT = {"done": "green", "deferred": "grey"}

PILL = {"done": "green", "deferred": "grey"}

CHROME_CANDIDATES = [
    "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
]

CSS = """
@page { size: A4 landscape; margin: 0; }
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: 297mm; }
body {
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  color: #1B2430; font-size: 7.5pt; line-height: 1.35;
  -webkit-print-color-adjust: exact; print-color-adjust: exact;
  padding: 17mm 13mm 16mm 13mm;
}
/* fixed bars repeat on every printed page */
.topbar {
  position: fixed; top: 0; left: 0; right: 0; height: 9.5mm;
  background: #12293F; color: #FFFFFF;
  font-size: 8pt; font-weight: 700; letter-spacing: 0.06em;
  padding: 0 13mm; display: flex; align-items: center;
}
.botbar {
  position: fixed; bottom: 0; left: 13mm; right: 13mm; height: 11mm;
  border-top: 0.5pt solid #D9E1E8; color: #6B7C8D; font-size: 7pt;
  display: flex; align-items: center;
}
/* title block */
.label {
  background: #2B4A66; color: #FFFFFF; font-size: 7.5pt; font-weight: 700;
  letter-spacing: 0.09em; padding: 2.6mm 4mm;
}
.title {
  background: #12293F; color: #FFFFFF; text-align: center;
  font-size: 25pt; font-weight: 700; letter-spacing: -0.01em; padding: 5mm 4mm 5.6mm;
}
/* meta strip */
.meta { display: flex; border: 0.5pt solid #D9E1E8; border-top: none; margin-bottom: 7mm; }
.meta div { flex: 1; padding: 3mm 4mm; background: #F4F7FA; border-right: 0.5pt solid #D9E1E8; }
.meta div:last-child { border-right: none; }
.meta .k { color: #7C8DA0; font-size: 6.5pt; font-weight: 700; letter-spacing: 0.09em; }
.meta .v { color: #12293F; font-size: 9.5pt; font-weight: 700; margin-top: 1.4mm; }
/* headings */
h2 { color: #12293F; font-size: 14pt; font-weight: 700; margin: 6mm 0 2.4mm; }
h2:first-of-type { margin-top: 0; }
h3 { color: #12293F; font-size: 10pt; font-weight: 700; margin: 4mm 0 1.6mm; }
p  { margin: 0 0 2mm; font-size: 8pt; }
ul { list-style: none; margin: 0 0 2.5mm; }
li { font-size: 8pt; padding-left: 3.4mm; text-indent: -3.4mm; margin-bottom: 0.6mm; }
li::before { content: "- "; color: #1B2430; }
/* tables */
table { width: 100%; border-collapse: collapse; margin-bottom: 3mm; }
/* Repeat the header row when a table spans a page break, and never split a row across
   one. Deliberately NOT using `table { page-break-inside: avoid }`: forcing whole tables
   onto fresh pages pushes these documents from 2 pages to 3. Letting a table flow and
   repeating its header preserves the original 2/2/3 pagination. */
thead { display: table-header-group; }
h2, h3 { page-break-after: avoid; }
th {
  background: #12293F; color: #FFFFFF; font-size: 7pt; font-weight: 700;
  text-align: center; padding: 1.9mm 1.6mm;
}
th.green { background: #2E7D32; }
th.grey  { background: #7E8B99; }
/* Row density is load-bearing: the 28-row task table must fit one page, or the RACI
   runs to 3 pages instead of 2. Do not increase this padding without re-checking the
   page counts printed by this script (expected: 2 / 2 / 3). */
td {
  font-size: 7.2pt; padding: 1.15mm 2mm; text-align: center;
  border-bottom: 0.5pt solid #E4EAF0;
}
tr:nth-child(even) td { background: #F4F7FA; }
td.l { text-align: left; }
td.pill { color: #FFFFFF; font-weight: 700; }
td.pill-green { background: #2E7D32 !important; }
td.pill-grey  { background: #7E8B99 !important; }
"""


def find_chrome():
    for p in CHROME_CANDIDATES:
        if os.path.exists(p):
            return p
    for name in ("chromium", "google-chrome", "brave-browser"):
        p = shutil.which(name)
        if p:
            return p
    sys.exit("No Chromium browser found — install Chrome, Brave or Edge.")


def esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def inline(s):
    """**bold** and `code` only — that is all these documents use."""
    s = esc(s)
    s = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", s)
    s = re.sub(r"`(.+?)`", r"<code>\1</code>", s)
    return s


def split_row(line):
    return [c.strip() for c in line.strip().strip("|").split("|")]


def parse(md):
    """-> (h1, [(key, value)], [blocks]) where a block is ('h2'|'h3'|'p'|'ul'|'table', data)."""
    lines = md.split("\n")
    h1, meta, blocks = "", [], []
    i = 0

    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        if not stripped:
            i += 1
            continue

        if stripped.startswith("# ") and not h1:
            h1 = stripped[2:].strip()
            i += 1
            continue

        # leading blockquote carries the meta strip
        if stripped.startswith(">"):
            body = stripped.lstrip(">").strip()
            m = re.match(r"\*\*(.+?):\*\*\s*(.*)", body)
            if m:
                meta.append((m.group(1).strip(), m.group(2).strip()))
            i += 1
            continue

        if stripped.startswith("### "):
            blocks.append(("h3", stripped[4:].strip()))
            i += 1
            continue

        if stripped.startswith("## "):
            blocks.append(("h2", stripped[3:].strip()))
            i += 1
            continue

        # table: a header row followed by an alignment row
        if stripped.startswith("|") and i + 1 < len(lines) and re.match(
                r"^\|[\s:|-]+\|$", lines[i + 1].strip()):
            header = split_row(stripped)
            i += 2
            rows = []
            while i < len(lines) and lines[i].strip().startswith("|"):
                rows.append(split_row(lines[i].strip()))
                i += 1
            blocks.append(("table", (header, rows)))
            continue

        if stripped.startswith("- "):
            items = []
            while i < len(lines) and lines[i].strip().startswith("- "):
                items.append(lines[i].strip()[2:].strip())
                i += 1
            blocks.append(("ul", items))
            continue

        para = []
        while i < len(lines) and lines[i].strip() and not lines[i].strip()[0] in "#|>-":
            para.append(lines[i].strip())
            i += 1
        if para:
            blocks.append(("p", " ".join(para)))

    return h1, meta, blocks


def render_table(header, rows, accent):
    """Left-align the first two columns (ID / Task); pill any Status cell."""
    try:
        status_col = [h.lower() for h in header].index("status")
    except ValueError:
        status_col = -1

    cls = f' class="{accent}"' if accent else ""
    out = ["<table><thead><tr>"]
    out += [f"<th{cls}>{inline(h)}</th>" for h in header]
    out.append("</tr></thead><tbody>")
    for r in rows:
        out.append("<tr>")
        for j, cell in enumerate(r):
            classes = []
            if j < 2 and len(header) > 3:
                classes.append("l")
            if j == status_col and cell.lower() in PILL:
                classes += ["pill", f"pill-{PILL[cell.lower()]}"]
            c = f' class="{" ".join(classes)}"' if classes else ""
            out.append(f"<td{c}>{inline(cell)}</td>")
        out.append("</tr>")
    out.append("</tbody></table>")
    return "".join(out)


def build_html(h1, meta, blocks):
    name = TITLE_NAME.get(h1, h1)
    status = next((v for k, v in meta if k.lower() == "status"), "")
    team = next((v for k, v in meta if k.lower() == "team"), "Transakt")

    body = []
    accent = None
    for kind, data in blocks:
        if kind == "h2":
            accent = SECTION_ACCENT.get(data.strip().lower())
            body.append(f"<h2>{inline(data)}</h2>")
        elif kind == "h3":
            body.append(f"<h3>{inline(data)}</h3>")
        elif kind == "p":
            body.append(f"<p>{inline(data)}</p>")
        elif kind == "ul":
            body.append("<ul>" + "".join(f"<li>{inline(x)}</li>" for x in data) + "</ul>")
        elif kind == "table":
            body.append(render_table(data[0], data[1], accent))

    meta_html = "".join(
        f'<div><div class="k">{esc(k.upper())}</div><div class="v">{esc(v)}</div></div>'
        for k, v in meta)

    return f"""<!doctype html><html><head><meta charset="utf-8">
<title>{esc(h1)}</title><style>{CSS}</style></head><body>
<div class="topbar">BLOCKMEDIARY&nbsp;&nbsp;|&nbsp;&nbsp;PROJECT GOVERNANCE V3</div>
<div class="botbar">{esc(team)}&nbsp;&nbsp;|&nbsp;&nbsp;{esc(status)}</div>
<div class="label">{esc(h1.upper())}</div>
<div class="title">Blockmediary {esc(name)}</div>
<div class="meta">{meta_html}</div>
{"".join(body)}
</body></html>"""


def overlay_html(n):
    """One transparent page per content page, carrying only the page number."""
    pages = "".join(
        f'<div class="pg"><div class="num">Page {i + 1}</div></div>' for i in range(n))
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>
@page {{ size: A4 landscape; margin: 0; }}
* {{ box-sizing: border-box; margin: 0; padding: 0; }}
body {{ font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; }}
.pg {{ width: 297mm; height: 210mm; position: relative; page-break-after: always; }}
.pg:last-child {{ page-break-after: auto; }}
.num {{ position: absolute; right: 13mm; bottom: 4.6mm;
        font-size: 7pt; color: #6B7C8D; }}
</style></head><body>{pages}</body></html>"""


def to_pdf(chrome, html, out):
    with tempfile.TemporaryDirectory() as tmp:
        src = os.path.join(tmp, "doc.html")
        with open(src, "w", encoding="utf-8") as f:
            f.write(html)
        subprocess.run(
            [chrome, "--headless", "--disable-gpu", "--no-pdf-header-footer",
             f"--print-to-pdf={out}", src],
            check=True, capture_output=True)


def main():
    chrome = find_chrome()
    for md_path in DOCS:
        with open(md_path, encoding="utf-8") as f:
            h1, meta, blocks = parse(f.read())

        out = os.path.splitext(md_path)[0] + ".pdf"
        with tempfile.TemporaryDirectory() as tmp:
            content = os.path.join(tmp, "content.pdf")
            numbers = os.path.join(tmp, "numbers.pdf")

            to_pdf(chrome, build_html(h1, meta, blocks), content)
            n = len(PdfReader(content).pages)
            to_pdf(chrome, overlay_html(n), numbers)

            base, nums = PdfReader(content), PdfReader(numbers)
            writer = PdfWriter()
            for i, page in enumerate(base.pages):
                page.merge_page(nums.pages[i])
                writer.add_page(page)
            with open(out, "wb") as f:
                writer.write(f)

        print(f"{os.path.relpath(out, HERE):45s} {n} pages")


if __name__ == "__main__":
    main()
