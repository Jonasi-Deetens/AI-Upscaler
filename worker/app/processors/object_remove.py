"""AI object removal: LaMa when available, else OpenCV inpainting. Multi-input: image + mask (white = remove)."""
from pathlib import Path

import cv2
import numpy as np
from PIL import Image


def _inpaint_opencv(image_bgr: np.ndarray, mask_uint8: np.ndarray) -> np.ndarray:
    """OpenCV inpainting fallback (Telea). mask: 255 = region to fill."""
    radius = max(3, int(min(image_bgr.shape[:2]) * 0.01))
    return cv2.inpaint(image_bgr, mask_uint8, radius, cv2.INPAINT_TELEA)


def run(job, input_path: Path, output_path: Path) -> None:
    """Run inpainting: fill mask region (white = inpaint). input_path is dir with 0=image, 1=mask."""
    paths = sorted(
        [p for p in input_path.iterdir() if p.is_file()],
        key=lambda p: int(p.name) if p.name.isdigit() else 0,
    )
    if len(paths) < 2:
        raise ValueError("object_remove requires image and mask (2 files)")
    img_path, mask_path = paths[0], paths[1]

    image = Image.open(img_path)
    image.load()
    if image.mode != "RGB":
        image = image.convert("RGB")
    image_bgr = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)

    mask_img = Image.open(mask_path)
    mask_img.load()
    mask_gray = mask_img.convert("L")
    mask_uint8 = np.array(mask_gray.point(lambda x: 255 if x > 127 else 0, mode="L"))
    if (image_bgr.shape[1], image_bgr.shape[0]) != (mask_uint8.shape[1], mask_uint8.shape[0]):
        mask_uint8 = cv2.resize(
            mask_uint8, (image_bgr.shape[1], image_bgr.shape[0]), interpolation=cv2.INTER_NEAREST
        )

    output_path.parent.mkdir(parents=True, exist_ok=True)
    use_lama = False
    try:
        from simple_lama_inpainting import SimpleLama
        use_lama = True
    except ImportError:
        pass

    if use_lama:
        simple_lama = SimpleLama()
        result = simple_lama(image, Image.fromarray(mask_uint8))
        if hasattr(result, "save"):
            result.save(output_path, format="PNG")
        else:
            Image.fromarray(np.array(result)).save(output_path, format="PNG")
    else:
        result_bgr = _inpaint_opencv(image_bgr, mask_uint8)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        cv2.imwrite(str(output_path), result_bgr)
