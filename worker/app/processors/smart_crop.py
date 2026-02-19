"""Smart crop: crop to target size/ratio keeping center or saliency (variance-based). Uses job.options: width, height, aspect_ratio, mode (center|saliency)."""
from pathlib import Path

import numpy as np
from PIL import Image


def _saliency_map_grayscale(img: Image.Image) -> np.ndarray:
    """Per-pixel variance in a small window as saliency proxy (simplified)."""
    arr = np.array(img.convert("L"), dtype=np.float64)
    # Use gradient magnitude as importance: edges and texture
    gx = np.gradient(arr, axis=1)
    gy = np.gradient(arr, axis=0)
    mag = np.sqrt(gx * gx + gy * gy)
    return mag


def _best_crop_saliency(img: Image.Image, crop_w: int, crop_h: int) -> tuple[int, int]:
    """Find (x, y) so that crop (x, y, x+crop_w, y+crop_h) has maximum saliency sum."""
    sal = _saliency_map_grayscale(img)
    h, w = sal.shape
    if crop_w >= w and crop_h >= h:
        return 0, 0
    crop_w = min(crop_w, w)
    crop_h = min(crop_h, h)
    # Integral image for fast sum over rectangle
    integral = np.cumsum(np.cumsum(sal, axis=0), axis=1)
    integral = np.pad(integral, ((1, 0), (1, 0)), mode="constant", constant_values=0)
    best_sum = -1
    best_x, best_y = 0, 0
    for y in range(0, h - crop_h + 1):
        for x in range(0, w - crop_w + 1):
            s = (
                integral[y + crop_h, x + crop_w]
                - integral[y, x + crop_w]
                - integral[y + crop_h, x]
                + integral[y, x]
            )
            if s > best_sum:
                best_sum = s
                best_x, best_y = x, y
    return best_x, best_y


def run(job, input_path: Path, output_path: Path) -> None:
    opts = getattr(job, "options", None) or {}
    target_w = int(opts.get("width", 0))
    target_h = int(opts.get("height", 0))
    aspect_ratio = opts.get("aspect_ratio")
    if aspect_ratio is not None:
        aspect_ratio = float(aspect_ratio)
    mode = opts.get("mode", "saliency")

    img = Image.open(input_path)
    img.load()
    if img.mode not in ("RGB", "RGBA"):
        img = img.convert("RGB")
    w, h = img.size

    if target_w > 0 and target_h > 0:
        crop_w, crop_h = min(target_w, w), min(target_h, h)
    elif aspect_ratio is not None and aspect_ratio > 0:
        if w / h > aspect_ratio:
            crop_w = int(h * aspect_ratio)
            crop_h = h
        else:
            crop_w = w
            crop_h = int(w / aspect_ratio)
        crop_w = min(crop_w, w)
        crop_h = min(crop_h, h)
    else:
        if target_w > 0:
            crop_w = min(target_w, w)
            crop_h = int(crop_w / (w / h))
            crop_h = min(crop_h, h)
        else:
            crop_h = min(target_h, h)
            crop_w = int(crop_h * (w / h))
            crop_w = min(crop_w, w)

    if crop_w >= w and crop_h >= h:
        x, y = 0, 0
    elif mode == "center":
        x = (w - crop_w) // 2
        y = (h - crop_h) // 2
    else:
        x, y = _best_crop_saliency(img, crop_w, crop_h)

    out = img.crop((x, y, x + crop_w, y + crop_h))
    output_path.parent.mkdir(parents=True, exist_ok=True)
    out.save(output_path, format="PNG")
