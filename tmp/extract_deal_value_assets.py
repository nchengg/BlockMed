from pathlib import Path

from PIL import Image, ImageDraw, ImageFont
from pypdf import PdfReader


PDF = Path(r"C:\Users\cwbec\BlockMed\docs\Blockmediary_Deal_Value_Research_Report.pdf")
OUT = Path(r"C:\Users\cwbec\BlockMed\tmp\pdfs\deal_value_assets")
OUT.mkdir(parents=True, exist_ok=True)

reader = PdfReader(PDF)
images = list(reader.pages[0].images)
thumbs = []
for index, image_file in enumerate(images, 1):
    image = image_file.image.convert("RGB")
    path = OUT / f"asset-{index:02d}.png"
    image.save(path)
    thumb = image.copy()
    thumb.thumbnail((420, 220))
    card = Image.new("RGB", (440, 260), "white")
    x = (440 - thumb.width) // 2
    y = 30 + (220 - thumb.height) // 2
    card.paste(thumb, (x, y))
    draw = ImageDraw.Draw(card)
    draw.text((10, 7), f"asset-{index:02d}  {image.width}x{image.height}", fill="black")
    thumbs.append(card)

cols = 2
rows = (len(thumbs) + cols - 1) // cols
sheet = Image.new("RGB", (cols * 440, rows * 260), "#dddddd")
for index, card in enumerate(thumbs):
    sheet.paste(card, ((index % cols) * 440, (index // cols) * 260))
sheet.save(OUT / "contact-sheet.png")
print(f"Extracted {len(images)} assets")
