"""AI denoise: NAFNet when available, else OpenCV fastNlMeans. Single image in, denoised out."""
from pathlib import Path

import cv2
import numpy as np
from PIL import Image


def _denoise_opencv(input_path: Path, output_path: Path) -> None:
    """OpenCV denoising fallback (fastNlMeansDenoisingColored)."""
    img = cv2.imread(str(input_path))
    if img is None:
        raise RuntimeError(f"Failed to read image: {input_path}")
    # Reasonable strength for photo denoising
    # Positional args for compatibility across OpenCV versions (4.x keyword names vary)
    result = cv2.fastNlMeansDenoisingColored(img, None, 10, 10, 7, 21)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(str(output_path), result)


def run(job, input_path: Path, output_path: Path) -> None:
    """Denoise image; use NAFNet if available, else OpenCV."""
    use_nafnet = False
    try:
        from nafnetlib import DenoiseProcessor
        use_nafnet = True
    except ImportError:
        pass

    if use_nafnet:
        import torch
        device = "cuda" if torch.cuda.is_available() else "cpu"
        weights_dir = Path(__file__).resolve().parent.parent.parent / "weights" / "nafnet"
        weights_dir.mkdir(parents=True, exist_ok=True)
        processor = DenoiseProcessor(
            model_id="sidd_width64",
            model_dir=str(weights_dir),
            device=device,
        )
        image = Image.open(input_path).convert("RGB")
        result = processor.process(image)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        if hasattr(result, "save"):
            result.save(output_path)
        else:
            Image.fromarray(np.asarray(result)).save(output_path)
    else:
        _denoise_opencv(input_path, output_path)
