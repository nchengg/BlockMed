from pathlib import Path

from PIL import Image, ImageDraw
from pypdf import PdfReader

pdf_path = Path(r"C:\Users\cwbec\Downloads\Blockmediary_Deal_Value_Research_Report.pdf")
out_dir = Path(r"C:\Users\cwbec\BlockMed\tmp\pdfs\deal-value-review")

reader = PdfReader(str(pdf_path))
parts = []
for index, page in enumerate(reader.pages, start=1):
    parts.append(f"\n===== PAGE {index} =====\n")
    parts.append(page.extract_text() or "")
(out_dir / "report_text.txt").write_text("\n".join(parts), encoding="utf-8")

page_images = sorted(out_dir.glob("page-*.png"))
thumb_width = 280
thumb_height = 396
margin = 24
label_height = 28
cols = 3
rows_per_sheet = 4
per_sheet = cols * rows_per_sheet

for batch_index in range(0, len(page_images), per_sheet):
    batch = page_images[batch_index : batch_index + per_sheet]
    canvas = Image.new(
        "RGB",
        (
            margin + cols * (thumb_width + margin),
            margin + rows_per_sheet * (thumb_height + label_height + margin),
        ),
        "white",
    )
    draw = ImageDraw.Draw(canvas)
    for local_index, image_path in enumerate(batch):
        image = Image.open(image_path).convert("RGB")
        image.thumbnail((thumb_width, thumb_height))
        row, col = divmod(local_index, cols)
        x = margin + col * (thumb_width + margin)
        y = margin + row * (thumb_height + label_height + margin)
        canvas.paste(image, (x, y + label_height))
        page_num = batch_index + local_index + 1
        draw.text((x, y), f"Page {page_num}", fill="black")
    canvas.save(out_dir / f"contact-{batch_index // per_sheet + 1}.png")

print(f"pages={len(reader.pages)} text_chars={sum(len(x) for x in parts)} contact_sheets={(len(page_images) + per_sheet - 1) // per_sheet}")
