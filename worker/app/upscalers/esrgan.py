"""
Original ESRGAN upscaler (deep RRDBNet from the ESRGAN paper).
Uses the same RRDBNet architecture as Real-ESRGAN but with the original
ESRGAN pre-trained weights. Good for illustrations/anime-style images.
4× only in the model; 2× is done by 4× then downscale.
"""
import os
import sys
from pathlib import Path

import torchvision.transforms.functional as _tv_functional

sys.modules["torchvision.transforms.functional_tensor"] = _tv_functional

import cv2
from basicsr.archs.rrdbnet_arch import RRDBNet
from basicsr.utils.download_util import load_file_from_url
from realesrgan import RealESRGANer

from app.config import settings

# Official ESRGAN x4 model (RRDB, DF2KOST training)
ESRGAN_X4_URL = (
    "https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.1/"
    "ESRGAN_SRx4_DF2KOST_official-ff704c30.pth"
)
WEIGHTS_DIR = Path(__file__).resolve().parent.parent.parent / "weights"


def _get_esrgan_x4_path() -> str:
    WEIGHTS_DIR.mkdir(parents=True, exist_ok=True)
    path = WEIGHTS_DIR / "ESRGAN_x4.pth"
    if path.is_file():
        return str(path)
    load_file_from_url(
        url=ESRGAN_X4_URL,
        model_dir=str(WEIGHTS_DIR),
        progress=True,
        file_name="ESRGAN_x4.pth",
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

    # Original ESRGAN is 4× only; for 2× we run 4× then downscale
    run_scale = 4
    model_path = _get_esrgan_x4_path()

    model = RRDBNet(
        num_in_ch=3,
        num_out_ch=3,
        num_feat=64,
        num_block=23,
        num_grow_ch=32,
        scale=4,
    )
    upsampler = RealESRGANer(
        scale=4,
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

    out_img, _ = upsampler.enhance(img, outscale=run_scale)

    if scale == 2:
        h, w = out_img.shape[:2]
        out_img = cv2.resize(out_img, (w // 2, h // 2), interpolation=cv2.INTER_AREA)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(str(output_path), out_img)
