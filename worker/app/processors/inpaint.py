"""Inpainting: fill mask region using OpenCV Navier-Stokes inpainting. input_path is directory with 0=image, 1=mask (white=inpaint)."""
from pathlib import Path

import cv2
import numpy as np
from PIL import Image


def run(job, input_path: Path, output_path: Path) -> None:
    # Multi-input: input_path is directory with files 0 (image), 1 (mask)
    paths = sorted(
        [p for p in input_path.iterdir() if p.is_file()],
        key=lambda p: int(p.name) if p.name.isdigit() else 0,
    )
    if len(paths) < 2:
        raise ValueError("Inpaint requires image and mask (2 files)")
    img_path, mask_path = paths[0], paths[1]

    img = cv2.imread(str(img_path))
    if img is None:
        raise ValueError("Could not load image")
    mask_img = Image.open(mask_path)
    mask_img.load()
    mask_gray = np.array(mask_img.convert("L"))
    # OpenCV inpaint: mask non-zero = region to inpaint
    mask = (mask_gray > 127).astype(np.uint8)
    if mask.sum() == 0:
        # No region to inpaint, copy original
        cv2.imwrite(str(output_path), img)
        return

    # INPAINT_NS (Navier-Stokes) gives smoother results; radius in pixels
    radius = 3
    result = cv2.inpaint(img, mask, radius, cv2.INPAINT_NS)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(str(output_path), result)
