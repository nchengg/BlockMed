from pathlib import Path

from PIL import Image, ImageDraw


source_dir = Path(r"C:\Users\cwbec\BlockMed\tmp\deal-value-review\churn-client-funds-rendered")
output_dir = Path(r"C:\Users\cwbec\BlockMed\tmp\deal-value-review\churn-client-funds-contacts")
images = sorted(source_dir.glob("*.png"))

cols, rows = 2, 3
per_contact = cols * rows
thumb_w, thumb_h = 560, 320
margin, label_h = 20, 28
output_dir.mkdir(parents=True, exist_ok=True)

for batch_start in range(0, len(images), per_contact):
    batch = images[batch_start : batch_start + per_contact]
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
    contact_number = batch_start // per_contact + 1
    canvas.save(output_dir / f"contact-{contact_number}.png")

print(f"contacts={len(list(output_dir.glob('contact-*.png')))} sheets={len(images)}")
