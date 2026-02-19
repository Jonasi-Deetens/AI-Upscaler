"""Adjust brightness and contrast. Uses job.options: brightness (-100..100), contrast (0..200)."""
from pathlib import Path

from PIL import Image, ImageEnhance


def run(job, input_path: Path, output_path: Path) -> None:
    opts = getattr(job, "options", None) or {}
    brightness = int(opts.get("brightness", 0))  # -100..100, 0 = no change
    contrast = int(opts.get("contrast", 100))     # 0..200, 100 = no change

    img = Image.open(input_path)
    img.load()
    if img.mode not in ("RGB", "RGBA"):
        img = img.convert("RGBA" if img.mode in ("P", "LA") else "RGB")

    # Brightness: 0 -> factor 1.0; -100 -> 0; 100 -> 2.0
    if brightness != 0:
        factor = (100 + brightness) / 100.0
        img = ImageEnhance.Brightness(img).enhance(factor)
    # Contrast: 100 -> factor 1.0; 0 -> 0; 200 -> 2.0
    if contrast != 100:
        factor = contrast / 100.0
        img = ImageEnhance.Contrast(img).enhance(factor)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    img.save(output_path, format="PNG")
