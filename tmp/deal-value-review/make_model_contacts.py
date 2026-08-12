from pathlib import Path
from PIL import Image, ImageDraw

root = Path(r"C:\Users\cwbec\BlockMed\tmp\deal-value-review")

for stage in ("final-rendered",):
    stage_dir = root / stage
    if not stage_dir.exists():
        continue
    for edition_dir in sorted(p for p in stage_dir.iterdir() if p.is_dir() and p.name == "detailed"):
        images = sorted(edition_dir.glob("*.png"))
        if not images:
            continue
        cols, rows = 2, 3
        per_sheet = cols * rows
        thumb_w, thumb_h = 520, 300
        margin, label_h = 20, 26
        out_dir = root / f"{stage}-contacts" / edition_dir.name
        out_dir.mkdir(parents=True, exist_ok=True)
        for batch_start in range(0, len(images), per_sheet):
            batch = images[batch_start : batch_start + per_sheet]
            canvas = Image.new(
                "RGB",
                (
                    margin + cols * (thumb_w + margin),
                    margin + rows * (thumb_h + label_h + margin),
                ),
                "white",
            )
            draw = ImageDraw.Draw(canvas)
            for local_index, image_path in enumerate(batch):
                image = Image.open(image_path).convert("RGB")
                image.thumbnail((thumb_w, thumb_h))
                row, col = divmod(local_index, cols)
                x = margin + col * (thumb_w + margin)
                y = margin + row * (thumb_h + label_h + margin)
                draw.text((x, y), image_path.stem, fill="black")
                canvas.paste(image, (x, y + label_h))
            index = batch_start // per_sheet + 1
            canvas.save(out_dir / f"contact-{index}.png")
        print(f"{stage}/{edition_dir.name}: {len(images)} sheets")
