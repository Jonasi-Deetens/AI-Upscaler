"""Tilt-shift: fake miniature with gradient blur (sharp band, blurred top/bottom). Uses job.options: blur_radius, focus_center (0-1), focus_width (0.05-1)."""
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter


def run(job, input_path: Path, output_path: Path) -> None:
    opts = getattr(job, "options", None) or {}
    blur_radius = int(opts.get("blur_radius", 15))
    focus_center = float(opts.get("focus_center", 0.5))
    focus_width = float(opts.get("focus_width", 0.3))

    img = Image.open(input_path)
    img.load()
    if img.mode not in ("RGB", "RGBA"):
        img = img.convert("RGB")
    w, h = img.size

    # Vertical gradient: 1 in focus band, 0 outside, smooth transition
    y = np.linspace(0, 1, h)
    center = focus_center
    half = focus_width / 2.0
    # Smooth step: 1 inside [center-half, center+half], 0 outside, smooth edges
    transition = 0.05
    low = center - half
    high = center + half
    mask_1d = np.ones(h, dtype=np.float64)
    # Below low: falloff
    idx_low = y < low
    mask_1d[idx_low] = np.clip(1.0 - (low - y[idx_low]) / transition, 0, 1)
    # Above high: falloff
    idx_high = y > high
    mask_1d[idx_high] = np.clip(1.0 - (y[idx_high] - high) / transition, 0, 1)
    # Smooth the step
    mask_1d = np.maximum(0, np.minimum(1, mask_1d))
    mask_2d = np.broadcast_to(mask_1d[:, np.newaxis], (h, w))

    blurred = img.filter(ImageFilter.GaussianBlur(radius=blur_radius))
    arr_sharp = np.array(img, dtype=np.float64)
    arr_blur = np.array(blurred, dtype=np.float64)
    if arr_sharp.ndim == 2:
        blend = arr_sharp * mask_2d + arr_blur * (1 - mask_2d)
    else:
        m = mask_2d[:, :, np.newaxis]
        blend = arr_sharp * m + arr_blur * (1 - m)
    out = np.clip(blend, 0, 255).astype(np.uint8)
    result = Image.fromarray(out)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    result.save(output_path, format="PNG")
