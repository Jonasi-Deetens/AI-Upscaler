"""Rotate and/or flip image. Uses job.options: rotate (0|90|180|270), flip_h, flip_v."""
from pathlib import Path

from PIL import Image


def run(job, input_path: Path, output_path: Path) -> None:
    opts = getattr(job, "options", None) or {}
    rotate = int(opts.get("rotate", 0))
    flip_h = bool(opts.get("flip_h", False))
    flip_v = bool(opts.get("flip_v", False))

    img = Image.open(input_path)
    img.load()
    if img.mode in ("P",):
        img = img.convert("RGBA")

    if rotate == 90:
        img = img.transpose(Image.Transpose.ROTATE_270)
    elif rotate == 180:
        img = img.transpose(Image.Transpose.ROTATE_180)
    elif rotate == 270:
        img = img.transpose(Image.Transpose.ROTATE_90)

    if flip_h:
        img = img.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
    if flip_v:
        img = img.transpose(Image.Transpose.FLIP_TOP_BOTTOM)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    img.save(output_path, format="PNG")
