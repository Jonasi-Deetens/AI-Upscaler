"""Crop image to a rectangle. Uses job.options: x, y, width, height (pixels)."""
from pathlib import Path

from PIL import Image


def run(job, input_path: Path, output_path: Path) -> None:
    opts = getattr(job, "options", None) or {}
    x = int(opts.get("x", 0))
    y = int(opts.get("y", 0))
    w = int(opts.get("width", 1))
    h = int(opts.get("height", 1))

    img = Image.open(input_path)
    img.load()
    # Clamp to image bounds
    iw, ih = img.size
    left = max(0, min(x, iw - 1))
    top = max(0, min(y, ih - 1))
    right = min(iw, left + w)
    bottom = min(ih, top + h)
    if right <= left or bottom <= top:
        raise ValueError("Crop region is empty or outside image")
    out = img.crop((left, top, right, bottom))
    output_path.parent.mkdir(parents=True, exist_ok=True)
    out.save(output_path, format="PNG")
