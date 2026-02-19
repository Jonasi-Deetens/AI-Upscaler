"""Blur or sharpen image. Uses job.options: mode ('blur'|'sharpen'), radius (1-50), strength (0.5-5)."""
from pathlib import Path

from PIL import Image, ImageFilter


def run(job, input_path: Path, output_path: Path) -> None:
    opts = getattr(job, "options", None) or {}
    mode = opts.get("mode", "blur")
    radius = int(opts.get("radius", 3))
    strength = float(opts.get("strength", 1.5))

    img = Image.open(input_path)
    img.load()
    if img.mode not in ("RGB", "RGBA"):
        img = img.convert("RGBA" if img.mode in ("P", "LA") else "RGB")

    if mode == "blur":
        out = img.filter(ImageFilter.GaussianBlur(radius=radius))
    else:
        # UnsharpMask: radius, percent (strength ~100-300), threshold
        percent = int(strength * 100)
        out = img.filter(ImageFilter.UnsharpMask(radius=min(radius, 5), percent=percent, threshold=2))

    output_path.parent.mkdir(parents=True, exist_ok=True)
    out.save(output_path, format="PNG")
