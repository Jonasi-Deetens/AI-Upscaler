"""Shared Real-ESRGAN / RRDB inference. Used by real_esrgan and real_esrgan_anime."""
import sys
from pathlib import Path

import torchvision.transforms.functional as _tv_functional

sys.modules["torchvision.transforms.functional_tensor"] = _tv_functional

import cv2
from basicsr.archs.rrdbnet_arch import RRDBNet
from realesrgan import RealESRGANer


def upscale_rrdb(
    input_path: Path,
    output_path: Path,
    model_path: str,
    scale: int,
    tile: int,
    gpu_id: int | None = None,
    num_block: int = 23,
) -> None:
    """Run RRDBNet upscale. scale must be 2 or 4; model must match. num_block=6 for anime 6B."""
    if scale not in (2, 4):
        raise ValueError("scale must be 2 or 4")
    model = RRDBNet(
        num_in_ch=3,
        num_out_ch=3,
        num_feat=64,
        num_block=num_block,
        num_grow_ch=32,
        scale=scale,
    )
    upsampler = RealESRGANer(
        scale=scale,
        model_path=model_path,
        model=model,
        tile=tile,
        tile_pad=10,
        pre_pad=0,
        half=(gpu_id is not None),
        gpu_id=gpu_id,
    )
    img = cv2.imread(str(input_path), cv2.IMREAD_UNCHANGED)
    if img is None:
        raise RuntimeError(f"Failed to read image: {input_path}")
    output, _ = upsampler.enhance(img, outscale=scale)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(str(output_path), output)
