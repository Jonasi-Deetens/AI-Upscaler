"""Real-ESRGAN upscaler (general / real-world)."""
from pathlib import Path

from basicsr.utils.download_util import load_file_from_url

from app.config import settings
from app.upscalers._realesrgan_lib import upscale_rrdb

WEIGHTS_DIR = Path(__file__).resolve().parent.parent.parent / "weights"
URLS = {
    "RealESRGAN_x4plus": "https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/RealESRGAN_x4plus.pth",
    "RealESRGAN_x2plus": "https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.1/RealESRGAN_x2plus.pth",
}


def _get_model_path(model_name: str) -> str:
    WEIGHTS_DIR.mkdir(parents=True, exist_ok=True)
    path = WEIGHTS_DIR / f"{model_name}.pth"
    if path.is_file():
        return str(path)
    if model_name not in URLS:
        raise ValueError(f"Unknown model: {model_name}")
    load_file_from_url(
        url=URLS[model_name],
        model_dir=str(WEIGHTS_DIR),
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
    model_path = _get_model_path(model_name)
    upscale_rrdb(
        input_path,
        output_path,
        model_path,
        scale,
        tile,
        gpu_id=settings.real_esrgan_gpu_id,
    )
