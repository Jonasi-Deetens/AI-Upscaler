"""Document enhancement: deskew, denoise, optional binarization. Single image in, cleaned image out."""
from pathlib import Path

import cv2
import numpy as np


def _deskew(img: np.ndarray) -> np.ndarray:
    """Correct skew using contour/minAreaRect or Hough lines."""
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY) if len(img.shape) == 3 else img
    gray = cv2.bitwise_not(gray)
    thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)[1]
    coords = np.column_stack(np.where(thresh > 0))
    if coords.size < 100:
        return img
    angle = cv2.minAreaRect(coords)[-1]
    if angle < -45:
        angle = 90 + angle
    elif angle > 45:
        angle = angle - 90
    if abs(angle) < 0.5:
        return img
    h, w = img.shape[:2]
    center = (w // 2, h // 2)
    M = cv2.getRotationMatrix2D(center, angle, 1.0)
    rotated = cv2.warpAffine(
        img, M, (w, h),
        flags=cv2.INTER_CUBIC,
        borderMode=cv2.BORDER_REPLICATE,
    )
    return rotated


def _denoise(img: np.ndarray) -> np.ndarray:
    """Reduce noise (document scans)."""
    return cv2.fastNlMeansDenoisingColored(img, None, 6, 6, 7, 21)


def _binarize(img: np.ndarray) -> np.ndarray:
    """Adaptive binarization for text clarity."""
    if len(img.shape) == 3:
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    else:
        gray = img
    binary = cv2.adaptiveThreshold(
        gray, 255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        blockSize=11,
        C=2,
    )
    return cv2.cvtColor(binary, cv2.COLOR_GRAY2BGR)


def run(job, input_path: Path, output_path: Path) -> None:
    """Deskew, denoise, and optionally binarize document image."""
    img = cv2.imread(str(input_path))
    if img is None:
        raise RuntimeError(f"Failed to read image: {input_path}")

    img = _deskew(img)
    img = _denoise(img)

    opts = getattr(job, "options", None) or {}
    if opts.get("binarize") is True:
        img = _binarize(img)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(str(output_path), img)
