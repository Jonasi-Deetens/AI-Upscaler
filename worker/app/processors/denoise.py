"""Denoise image (OpenCV). Used as optional pre-step before upscale."""
from pathlib import Path

import cv2


def run(input_path: Path, output_path: Path) -> None:
    """Reduce noise; write result to output_path."""
    img = cv2.imread(str(input_path))
    if img is None:
        raise RuntimeError(f"Failed to read image: {input_path}")
    # Positional args: src, dst, h, hForColorComponents, templateWindowSize, searchWindowSize
    out = cv2.fastNlMeansDenoisingColored(img, None, 6, 6, 7, 21)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(str(output_path), out)
