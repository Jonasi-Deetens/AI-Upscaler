"""Auto levels / auto contrast. Uses job.options: mode ('levels' | 'contrast')."""
from pathlib import Path

from PIL import Image, ImageOps


def run(job, input_path: Path, output_path: Path) -> None:
    opts = getattr(job, "options", None) or {}
    mode = opts.get("mode", "levels")

    img = Image.open(input_path)
    img.load()
    if img.mode not in ("RGB", "RGBA", "L"):
        img = img.convert("RGB")

    if mode == "levels":
        # Stretch histogram to full range (autocontrast); ImageOps.autocontrast does not support RGBA
        if img.mode == "RGBA":
            r, g, b, a = img.split()
            rgb = Image.merge("RGB", (r, g, b))
            rgb = ImageOps.autocontrast(rgb, cutoff=2)
            r, g, b = rgb.split()
            out = Image.merge("RGBA", (r, g, b, a))
        else:
            out = ImageOps.autocontrast(img, cutoff=2)
    else:
        # Equalize histogram for stronger contrast normalization
        if img.mode == "RGBA":
            r, g, b, a = img.split()
            r = ImageOps.equalize(r)
            g = ImageOps.equalize(g)
            b = ImageOps.equalize(b)
            out = Image.merge("RGBA", (r, g, b, a))
        elif img.mode == "RGB":
            r, g, b = img.split()
            r = ImageOps.equalize(r)
            g = ImageOps.equalize(g)
            b = ImageOps.equalize(b)
            out = Image.merge("RGB", (r, g, b))
        else:
            out = ImageOps.equalize(img)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    out.save(output_path, format="PNG")
