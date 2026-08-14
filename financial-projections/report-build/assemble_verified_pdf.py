from io import BytesIO
from pathlib import Path

from pypdf import PdfReader, PdfWriter
from reportlab.lib.colors import HexColor, white
from reportlab.pdfgen import canvas


ROOT = Path(r"C:\Users\cwbec\BlockMed\tmp\financial-report")
V1 = ROOT / "render-v1" / "Blockmediary_Financial_Value_and_Commercial_Viability_Report.pdf"
V2 = ROOT / "render-v2" / "Blockmediary_Financial_Value_and_Commercial_Viability_Report.pdf"
OUT_DIR = ROOT / "render-final"
OUT = OUT_DIR / "Blockmediary_Financial_Value_and_Commercial_Viability_Report.pdf"


def page_furniture_overlay(width: float, height: float, page_number: int, page_count: int):
    stream = BytesIO()
    c = canvas.Canvas(stream, pagesize=(width, height))
    c.setFillColor(white)
    c.rect(0, 0, width, 45, fill=1, stroke=0)
    c.setFillColor(HexColor("#65788A"))
    c.setFont("Helvetica", 6.5)
    c.drawString(72, 22, "Team Transakt | BEEM063 FinTech Hackathon | 13 August 2026")
    c.drawRightString(width - 72, 22, f"Page {page_number} of {page_count}")
    c.save()
    stream.seek(0)
    return PdfReader(stream).pages[0]


def main():
    v1 = PdfReader(V1)
    v2 = PdfReader(V2)
    selected = [
        *[v2.pages[i] for i in range(0, 10)],
        *[v2.pages[i] for i in range(11, 14)],
        v1.pages[14],
        v1.pages[15],
    ]

    writer = PdfWriter()
    page_count = len(selected)
    for index, page in enumerate(selected, start=1):
        if index > 1:
            width = float(page.mediabox.width)
            height = float(page.mediabox.height)
            page.merge_page(page_furniture_overlay(width, height, index, page_count))
        writer.add_page(page)

    writer.add_metadata(
        {
            "/Title": "Blockmediary Financial Value and Commercial Viability",
            "/Author": "Team Transakt",
            "/Subject": "Financial report accompanying the BEEM063 FinTech Hackathon submission",
            "/Keywords": "Blockmediary, financial model, unit economics, commercial viability, escrow",
        }
    )
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    with OUT.open("wb") as handle:
        writer.write(handle)
    print(OUT)


if __name__ == "__main__":
    main()
