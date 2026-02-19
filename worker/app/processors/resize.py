"""Resize image to max dimensions or exact size. Uses job.options: max_width, max_height, fit."""
from pathlib import Path

from PIL import Image


def run(job, input_path: Path, output_path: Path) -> None:
    opts = getattr(job, "options", None) or {}
    max_width = opts.get("max_width")
    max_height = opts.get("max_height")
    fit = opts.get("fit", "inside")

    img = Image.open(input_path)
    img.load()
    if img.mode in ("P", "LA"):
        img = img.convert("RGBA")
    elif img.mode != "RGB" and img.mode != "RGBA":
        img = img.convert("RGB")

    w, h = img.size
    if max_width is None and max_height is None:
        out = img
    else:
        if max_width is None:
            max_width = w
        if max_height is None:
            max_height = h
        max_width = int(max_width)
        max_height = int(max_height)

        if fit == "inside":
            # Fit inside box, preserve aspect ratio
            ratio = min(max_width / w, max_height / h)
            nw, nh = round(w * ratio), round(h * ratio)
            if (nw, nh) == (w, h):
                out = img
            else:
                out = img.resize((nw, nh), Image.Resampling.LANCZOS)
        elif fit == "exact":
            out = img.resize((max_width, max_height), Image.Resampling.LANCZOS)
        else:  # fill: cover box, center crop
            ratio = max(max_width / w, max_height / h)
            nw, nh = round(w * ratio), round(h * ratio)
            resized = img.resize((nw, nh), Image.Resampling.LANCZOS)
            left = (nw - max_width) // 2
            top = (nh - max_height) // 2
            out = resized.crop((left, top, left + max_width, top + max_height))
    output_path.parent.mkdir(parents=True, exist_ok=True)
    out.save(output_path, format="PNG")
