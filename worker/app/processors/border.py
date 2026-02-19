"""Add border/padding. Uses job.options: padding (px), color (hex), width (frame width, 0 = no frame)."""
from pathlib import Path

from PIL import Image, ImageDraw


def _hex_to_rgb(hex_str: str) -> tuple[int, int, int]:
    hex_str = hex_str.lstrip("#")
    if len(hex_str) == 6:
        return (int(hex_str[0:2], 16), int(hex_str[2:4], 16), int(hex_str[4:6], 16))
    return (255, 255, 255)


def run(job, input_path: Path, output_path: Path) -> None:
    opts = getattr(job, "options", None) or {}
    padding = int(opts.get("padding", 20))
    color_hex = (opts.get("color") or "#ffffff").strip() or "#ffffff"
    width = int(opts.get("width", 0))

    img = Image.open(input_path)
    img.load()
    if img.mode not in ("RGB", "RGBA"):
        img = img.convert("RGBA" if img.mode in ("P", "LA") else "RGB")

    w, h = img.size
    bg = _hex_to_rgb(color_hex)
    if img.mode == "RGBA":
        fill = (*bg, 255)
    else:
        fill = bg

    new_w = w + 2 * padding
    new_h = h + 2 * padding
    out = Image.new(img.mode, (new_w, new_h), fill)
    out.paste(img, (padding, padding))

    if width > 0 and img.mode == "RGB":
        draw = ImageDraw.Draw(out)
        for i in range(width):
            draw.rectangle([i, i, new_w - 1 - i, new_h - 1 - i], outline=fill)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    out.save(output_path, format="PNG")
