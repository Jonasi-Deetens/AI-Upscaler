"""Add text watermark. Uses job.options: text, position, opacity, font_size."""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


def _get_font(size: int):
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
        "C:/Windows/Fonts/arial.ttf",
    ]
    for path in candidates:
        try:
            return ImageFont.truetype(path, size)
        except OSError:
            continue
    return ImageFont.load_default()


def run(job, input_path: Path, output_path: Path) -> None:
    opts = getattr(job, "options", None) or {}
    text = opts.get("text", "")
    position = opts.get("position", "center")
    opacity = int(opts.get("opacity", 80))  # 0-100
    font_size = int(opts.get("font_size", 36))

    img = Image.open(input_path)
    img.load()
    if img.mode != "RGBA":
        img = img.convert("RGBA")
    base = img.copy()

    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    font = _get_font(font_size)
    # Get bbox to position text
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    padding = max(10, font_size // 3)
    x = y = 0
    if position == "center":
        x = (img.width - tw) // 2
        y = (img.height - th) // 2
    elif position == "top_left":
        x = padding
        y = padding
    elif position == "top_right":
        x = img.width - tw - padding
        y = padding
    elif position == "bottom_left":
        x = padding
        y = img.height - th - padding
    elif position == "bottom_right":
        x = img.width - tw - padding
        y = img.height - th - padding
    else:
        x = (img.width - tw) // 2
        y = (img.height - th) // 2

    alpha = int(255 * opacity / 100)
    # Dark outline for visibility, then white text on top
    for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
        draw.text((x + dx, y + dy), text, font=font, fill=(0, 0, 0, alpha))
    draw.text((x, y), text, font=font, fill=(255, 255, 255, alpha))

    out = Image.alpha_composite(base, overlay)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    out.save(output_path, format="PNG")
