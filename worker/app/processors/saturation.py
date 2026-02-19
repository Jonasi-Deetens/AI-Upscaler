"""Adjust saturation and vibrance. Uses job.options: saturation (0-200), vibrance (0-200), 100 = no change."""
from pathlib import Path

from PIL import Image, ImageEnhance


def run(job, input_path: Path, output_path: Path) -> None:
    opts = getattr(job, "options", None) or {}
    saturation = int(opts.get("saturation", 100))  # 0-200, 100 = no change
    vibrance = int(opts.get("vibrance", 100))      # 0-200, 100 = no change

    img = Image.open(input_path)
    img.load()
    if img.mode not in ("RGB", "RGBA"):
        img = img.convert("RGBA" if img.mode in ("P", "LA") else "RGB")

    # Saturation via ImageEnhance.Color
    if saturation != 100:
        factor = saturation / 100.0
        img = ImageEnhance.Color(img).enhance(factor)

    # Simple vibrance: apply a second saturation pass with a curve that affects
    # mid-saturation pixels more (approximation: use a slight extra boost when vibrance > 100)
    if vibrance != 100:
        # Treat vibrance as a secondary saturation factor applied after the first
        factor = vibrance / 100.0
        img = ImageEnhance.Color(img).enhance(factor)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    img.save(output_path, format="PNG")
