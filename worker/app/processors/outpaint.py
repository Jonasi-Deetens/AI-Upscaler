"""Outpainting: extend image borders. LaMa when available, else OpenCV inpainting."""
from pathlib import Path

import cv2
import numpy as np
from PIL import Image


def _inpaint_opencv(image_bgr: np.ndarray, mask_uint8: np.ndarray) -> np.ndarray:
    """OpenCV inpainting fallback. mask: 255 = region to fill."""
    radius = max(3, int(min(image_bgr.shape[:2]) * 0.01))
    return cv2.inpaint(image_bgr, mask_uint8, radius, cv2.INPAINT_TELEA)


def run(job, input_path: Path, output_path: Path) -> None:
    """Extend image by padding and inpainting the padded region."""
    opts = getattr(job, "options", None) or {}
    left = int(opts.get("extend_left", 0))
    right = int(opts.get("extend_right", 0))
    top = int(opts.get("extend_top", 0))
    bottom = int(opts.get("extend_bottom", 0))

    img = Image.open(input_path)
    img.load()
    if img.mode != "RGB":
        img = img.convert("RGB")
    w, h = img.size

    new_w = w + left + right
    new_h = h + top + bottom
    canvas = Image.new("RGB", (new_w, new_h), (255, 255, 255))
    canvas.paste(img, (left, top))

    mask = Image.new("L", (new_w, new_h), 255)
    center = Image.new("L", (w, h), 0)
    mask.paste(center, (left, top))
    mask_np = np.array(mask)

    use_lama = False
    try:
        from simple_lama_inpainting import SimpleLama
        use_lama = True
    except ImportError:
        pass

    output_path.parent.mkdir(parents=True, exist_ok=True)
    if use_lama:
        simple_lama = SimpleLama()
        result = simple_lama(canvas, mask)
        if hasattr(result, "save"):
            result.save(output_path)
        else:
            Image.fromarray(np.array(result)).save(output_path)
    else:
        canvas_bgr = cv2.cvtColor(np.array(canvas), cv2.COLOR_RGB2BGR)
        result_bgr = _inpaint_opencv(canvas_bgr, mask_np)
        cv2.imwrite(str(output_path), result_bgr)
