"""Vignette: darken corners with smooth radial falloff. Uses job.options: strength (0-100), radius (0-100, center bright)."""
from pathlib import Path

import numpy as np
from PIL import Image


def run(job, input_path: Path, output_path: Path) -> None:
    opts = getattr(job, "options", None) or {}
    strength = int(opts.get("strength", 50)) / 100.0  # 0-1
    radius_pct = int(opts.get("radius", 70)) / 100.0  # 0-1, fraction of half-diagonal that stays bright

    img = Image.open(input_path)
    img.load()
    if img.mode not in ("RGB", "RGBA"):
        img = img.convert("RGB")
    arr = np.array(img, dtype=np.float64)
    h, w = arr.shape[:2]
    cy, cx = h / 2.0, w / 2.0
    half_diag = np.sqrt(cx * cx + cy * cy)
    radius = half_diag * radius_pct

    y = np.arange(h, dtype=np.float64)
    x = np.arange(w, dtype=np.float64)
    yy, xx = np.meshgrid(y, x, indexing="ij")
    dist = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2)
    # Smooth falloff: 1 at center, 0 at/beyond radius. Use squared for softer edge.
    t = np.clip(dist / radius, 0, 1)
    factor = 1.0 - strength * (1.0 - (1.0 - t) ** 2)  # smooth parabola
    if arr.ndim == 3:
        factor = factor[:, :, np.newaxis]
    out = np.clip(arr * factor, 0, 255).astype(np.uint8)
    result = Image.fromarray(out)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    result.save(output_path, format="PNG")
