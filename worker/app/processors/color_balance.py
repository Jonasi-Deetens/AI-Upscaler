"""Color balance: per-channel shift. Uses job.options: r, g, b (-100..100), 0 = no change."""
from pathlib import Path

from PIL import Image


def run(job, input_path: Path, output_path: Path) -> None:
    opts = getattr(job, "options", None) or {}
    r_shift = int(opts.get("r", 0))  # -100..100
    g_shift = int(opts.get("g", 0))
    b_shift = int(opts.get("b", 0))

    img = Image.open(input_path)
    img.load()
    if img.mode not in ("RGB", "RGBA"):
        img = img.convert("RGBA" if img.mode in ("P", "LA") else "RGB")

    # Map -100..100 to a multiplicative factor or additive shift.
    # Use additive: add (shift * 255/100) clamped. So 100 -> +255 (max), -100 -> -255.
    scale = 255.0 / 100.0
    r_delta = int(r_shift * scale)
    g_delta = int(g_shift * scale)
    b_delta = int(b_shift * scale)

    if img.mode == "RGBA":
        r, g, b, a = img.split()
        r = r.point(lambda x: max(0, min(255, x + r_delta)))
        g = g.point(lambda x: max(0, min(255, x + g_delta)))
        b = b.point(lambda x: max(0, min(255, x + b_delta)))
        out = Image.merge("RGBA", (r, g, b, a))
    else:
        r, g, b = img.split()
        r = r.point(lambda x: max(0, min(255, x + r_delta)))
        g = g.point(lambda x: max(0, min(255, x + g_delta)))
        b = b.point(lambda x: max(0, min(255, x + b_delta)))
        out = Image.merge("RGB", (r, g, b))

    output_path.parent.mkdir(parents=True, exist_ok=True)
    out.save(output_path, format="PNG")
