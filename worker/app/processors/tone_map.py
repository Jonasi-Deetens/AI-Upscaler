"""Tone mapping: single image LDR tone mapping (Reinhard) for balanced exposure."""
from pathlib import Path

import cv2
import numpy as np


def run(job, input_path: Path, output_path: Path) -> None:
    """Apply Reinhard tone mapping to a single image for balanced exposure."""
    img = cv2.imread(str(input_path))
    if img is None:
        raise RuntimeError(f"Failed to read image: {input_path}")

    img_float = img.astype(np.float32) / 255.0
    tonemap = cv2.createTonemapReinhard(gamma=1.5)
    result = tonemap.process(img_float)
    result = np.clip(result * 255, 0, 255).astype(np.uint8)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(str(output_path), result)
