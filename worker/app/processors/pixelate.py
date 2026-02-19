"""Pixelate: block averaging then nearest-neighbor upscale for clean mosaic. Uses job.options: block_size (2-128)."""
from pathlib import Path

from PIL import Image


def run(job, input_path: Path, output_path: Path) -> None:
    opts = getattr(job, "options", None) or {}
    block_size = int(opts.get("block_size", 8))

    img = Image.open(input_path)
    img.load()
    if img.mode not in ("RGB", "RGBA"):
        img = img.convert("RGB")
    w, h = img.size
    small_w = max(1, w // block_size)
    small_h = max(1, h // block_size)
    # Downscale with box/average (resize to 1/N uses averaging in PIL)
    small = img.resize((small_w, small_h), Image.Resampling.BOX)
    # Upscale with nearest for crisp blocks
    out = small.resize((w, h), Image.Resampling.NEAREST)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    out.save(output_path, format="PNG")
