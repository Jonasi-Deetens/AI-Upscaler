"""
Real-ESRGAN upscaler. Patches torchvision for basicsr compatibility before importing.
"""
import os
import sys
from pathlib import Path

# basicsr imports torchvision.transforms.functional_tensor (removed in torchvision 0.15+)
# Point the old module at the new one so the import succeeds
import torchvision.transforms.functional as _tv_functional
sys.modules["torchvision.transforms.functional_tensor"] = _tv_functional

import cv2
from basicsr.archs.rrdbnet_arch import RRDBNet
from basicsr.utils.download_util import load_file_from_url
from realesrgan import RealESRGANer

from app.config import settings


def get_model_path(model_name: str) -> str:
    weights_dir = Path(__file__).resolve().parent.parent.parent / "weights"
    weights_dir.mkdir(parents=True, exist_ok=True)
    path = weights_dir / f"{model_name}.pth"
    if path.is_file():
        return str(path)
    urls = {
        "RealESRGAN_x4plus": [
            "https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/RealESRGAN_x4plus.pth"
        ],
        "RealESRGAN_x2plus": [
            "https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.1/RealESRGAN_x2plus.pth"
        ],
    }
    if model_name not in urls:
        raise ValueError(f"Unknown model: {model_name}")
    for url in urls[model_name]:
        return load_file_from_url(
            url=url,
            model_dir=str(weights_dir),
            progress=True,
            file_name=f"{model_name}.pth",
        )
    return str(path)


def upscale(
    input_path: Path,
    output_path: Path,
    scale: int,
    tile: int | None = None,
) -> None:
    if scale not in (2, 4):
        raise ValueError("scale must be 2 or 4")
    tile = tile or settings.real_esrgan_tile

    model_name = "RealESRGAN_x2plus" if scale == 2 else "RealESRGAN_x4plus"
    model_path = get_model_path(model_name)

    if scale == 2:
        model = RRDBNet(
            num_in_ch=3,
            num_out_ch=3,
            num_feat=64,
            num_block=23,
            num_grow_ch=32,
            scale=2,
        )
        netscale = 2
    else:
        model = RRDBNet(
            num_in_ch=3,
            num_out_ch=3,
            num_feat=64,
            num_block=23,
            num_grow_ch=32,
            scale=4,
        )
        netscale = 4

    upsampler = RealESRGANer(
        scale=netscale,
        model_path=model_path,
        model=model,
        tile=tile,
        tile_pad=10,
        pre_pad=0,
        half=(settings.real_esrgan_gpu_id is not None),
        gpu_id=settings.real_esrgan_gpu_id,
    )

    img = cv2.imread(str(input_path), cv2.IMREAD_UNCHANGED)
    if img is None:
        raise RuntimeError(f"Failed to read image: {input_path}")

    output, _ = upsampler.enhance(img, outscale=scale)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(str(output_path), output)
