"""Preset filters: grayscale, sepia, vintage warm/cool. Uses job.options: preset."""
from pathlib import Path

from PIL import Image


def _grayscale(img: Image.Image) -> Image.Image:
    gray = img.convert("L")
    return gray.convert("RGB")


def _sepia(img: Image.Image) -> Image.Image:
    # Sepia matrix (approximate)
    # R = 0.393*R + 0.769*G + 0.189*B, etc.
    if img.mode != "RGB":
        img = img.convert("RGB")
    data = list(img.getdata())
    out = []
    for (r, g, b) in data:
        r2 = min(255, int(0.393 * r + 0.769 * g + 0.189 * b))
        g2 = min(255, int(0.349 * r + 0.686 * g + 0.168 * b))
        b2 = min(255, int(0.272 * r + 0.534 * g + 0.131 * b))
        out.append((r2, g2, b2))
    img.putdata(out)
    return img


def _vintage_warm(img: Image.Image) -> Image.Image:
    if img.mode != "RGB":
        img = img.convert("RGB")
    # Slight orange/amber tint: boost R, slight G
    r, g, b = img.split()
    r = r.point(lambda x: min(255, int(x * 1.08)))
    g = g.point(lambda x: min(255, int(x * 1.02)))
    b = b.point(lambda x: min(255, int(x * 0.95)))
    return Image.merge("RGB", (r, g, b))


def _vintage_cool(img: Image.Image) -> Image.Image:
    if img.mode != "RGB":
        img = img.convert("RGB")
    # Slight blue/cyan tint
    r, g, b = img.split()
    r = r.point(lambda x: min(255, int(x * 0.95)))
    g = g.point(lambda x: min(255, int(x * 1.02)))
    b = b.point(lambda x: min(255, int(x * 1.08)))
    return Image.merge("RGB", (r, g, b))


def run(job, input_path: Path, output_path: Path) -> None:
    opts = getattr(job, "options", None) or {}
    preset = opts.get("preset", "grayscale")

    img = Image.open(input_path)
    img.load()

    if preset == "grayscale":
        out = _grayscale(img)
    elif preset == "sepia":
        out = _sepia(img)
    elif preset == "vintage_warm":
        out = _vintage_warm(img)
    elif preset == "vintage_cool":
        out = _vintage_cool(img)
    else:
        out = _grayscale(img)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    out.save(output_path, format="PNG")
