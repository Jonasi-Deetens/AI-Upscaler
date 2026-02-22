"""HDR merge: combine 3+ bracketed exposures into one LDR image (Mertens exposure fusion)."""
from pathlib import Path

import cv2
import numpy as np


def run(job, input_path: Path, output_path: Path) -> None:
    """Merge multiple exposures (0, 1, 2, ...) using Mertens exposure fusion. input_path is dir with images."""
    paths = sorted(
        [p for p in input_path.iterdir() if p.is_file()],
        key=lambda p: int(p.name) if p.name.isdigit() else 0,
    )
    if len(paths) < 3:
        raise ValueError("hdr_merge requires at least 3 exposure images")

    imgs = []
    for p in paths:
        img = cv2.imread(str(p))
        if img is None:
            raise RuntimeError(f"Failed to read image: {p}")
        imgs.append(img)

    merger = cv2.createMergeMertens()
    result = merger.process(imgs)
    result = np.clip(result * 255, 0, 255).astype(np.uint8)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(str(output_path), result)
