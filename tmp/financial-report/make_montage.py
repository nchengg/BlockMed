from pathlib import Path
from PIL import Image, ImageOps, ImageDraw

src = Path(r"C:\Users\cwbec\BlockMed\tmp\financial-report\source-covers")
files = [
    ("Legal & Compliance", src / "legal.png"),
    ("Deal Value Research", src / "deal-value.png"),
    ("DIFC / VARA Readiness", src / "readiness.png"),
    ("Competitor Analysis", src / "competitor.png"),
    ("Trade Escrow Agreement", src / "agreement.png"),
]
thumb_w, thumb_h = 360, 466
label_h = 36
canvas = Image.new("RGB", (thumb_w * 3 + 60, (thumb_h + label_h) * 2 + 50), "#e9edf2")
draw = ImageDraw.Draw(canvas)
for idx, (label, path) in enumerate(files):
    img = Image.open(path).convert("RGB")
    img.thumbnail((thumb_w - 24, thumb_h - 24), Image.Resampling.LANCZOS)
    x0 = 20 + (idx % 3) * (thumb_w + 10)
    y0 = 18 + (idx // 3) * (thumb_h + label_h + 8)
    x = x0 + (thumb_w - img.width) // 2
    y = y0 + label_h + (thumb_h - img.height) // 2
    canvas.paste(img, (x, y))
    draw.text((x0 + 8, y0 + 8), label, fill="#0b2545")
    draw.rectangle((x0, y0 + label_h, x0 + thumb_w, y0 + label_h + thumb_h), outline="#aeb8c4", width=1)
canvas.save(src / "submission-pack-covers.png")

