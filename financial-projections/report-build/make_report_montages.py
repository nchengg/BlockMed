from pathlib import Path
import sys
from PIL import Image, ImageDraw, ImageFont


ROOT = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(r"C:\Users\cwbec\BlockMed\tmp\financial-report\render-v1")
pages = sorted(ROOT.glob("page-*.png"), key=lambda p: int(p.stem.split("-")[-1]))
font = ImageFont.truetype(r"C:\Windows\Fonts\arialbd.ttf", 24)
thumb_w, thumb_h = 700, 906
gap, label_h = 24, 42

for group_start in range(0, len(pages), 4):
    group = pages[group_start:group_start + 4]
    canvas = Image.new("RGB", (thumb_w * 2 + gap * 3, (thumb_h + label_h) * 2 + gap * 3), "#DDE3E9")
    draw = ImageDraw.Draw(canvas)
    for idx, page in enumerate(group):
        image = Image.open(page).convert("RGB")
        image.thumbnail((thumb_w, thumb_h), Image.Resampling.LANCZOS)
        col, row = idx % 2, idx // 2
        x0 = gap + col * (thumb_w + gap)
        y0 = gap + row * (thumb_h + label_h + gap)
        draw.text((x0, y0), f"Page {group_start + idx + 1}", font=font, fill="#19344D")
        x = x0 + (thumb_w - image.width) // 2
        y = y0 + label_h + (thumb_h - image.height) // 2
        canvas.paste(image, (x, y))
        draw.rectangle((x, y, x + image.width, y + image.height), outline="#8A98A8", width=1)
    canvas.save(ROOT / f"montage-{group_start + 1:02d}-{group_start + len(group):02d}.png")

print(f"Created {(len(pages) + 3) // 4} montages for {len(pages)} pages")
