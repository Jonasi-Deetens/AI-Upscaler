"""Face enhancement via GFPGAN. Optional post-step after upscale."""
from pathlib import Path

import cv2


def run(input_path: Path, output_path: Path) -> None:
    """Enhance faces in image; write result to output_path."""
    try:
        from gfpgan import GFPGANer
        from basicsr.utils.download_util import load_file_from_url
    except ImportError as e:
        raise RuntimeError(
            "GFPGAN not installed. Add gfpgan to worker requirements and rebuild."
        ) from e

    weights_dir = Path(__file__).resolve().parent.parent.parent / "weights"
    weights_dir.mkdir(parents=True, exist_ok=True)
    model_path = weights_dir / "GFPGANv1.4.pth"
    if not model_path.is_file():
        load_file_from_url(
            url="https://github.com/TencentARC/GFPGAN/releases/download/v1.3.0/GFPGANv1.4.pth",
            model_dir=str(weights_dir),
            progress=True,
            file_name="GFPGANv1.4.pth",
        )

    restorer = GFPGANer(model_path=str(model_path), upscale=1, arch="clean", channel_multiplier=2)
    img = cv2.imread(str(input_path), cv2.IMREAD_COLOR)
    if img is None:
        raise RuntimeError(f"Failed to read image: {input_path}")

    _, _, output = restorer.enhance(img, has_aligned=False, only_center_face=False, paste_back=True)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(str(output_path), output)
