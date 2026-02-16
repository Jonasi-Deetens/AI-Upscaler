"""Real-ESRGAN anime upscaler. Optimized for anime / illustrations."""
import shutil
import cv2
from pathlib import Path

from basicsr.utils.download_util import load_file_from_url

from app.config import settings
from app.upscalers._realesrgan_lib import upscale_rrdb

WEIGHTS_DIR = Path(__file__).resolve().parent.parent.parent / "weights"
ANIME_URL = (
    "https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.2.4/"
    "RealESRGAN_x4plus_anime_6B.pth"
)
MODEL_NAME = "RealESRGAN_x4plus_anime_6B"


def _get_model_path() -> str:
    WEIGHTS_DIR.mkdir(parents=True, exist_ok=True)
    path = WEIGHTS_DIR / f"{MODEL_NAME}.pth"
    if path.is_file():
        return str(path)
    load_file_from_url(
        url=ANIME_URL,
        model_dir=str(WEIGHTS_DIR),
        progress=True,
        file_name=f"{MODEL_NAME}.pth",
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
    model_path = _get_model_path()
    # Anime model is 4× only; for 2× we run 4× then downscale
    run_scale = 4
    tmp_out = output_path.parent / "anime_4x.png"
    upscale_rrdb(
        input_path,
        tmp_out,
        model_path,
        run_scale,
        tile,
        gpu_id=settings.real_esrgan_gpu_id,
        num_block=6,
    )
    output_path.parent.mkdir(parents=True, exist_ok=True)
    if scale == 2:
        img = cv2.imread(str(tmp_out))
        h, w = img.shape[:2]
        img = cv2.resize(img, (w // 2, h // 2), interpolation=cv2.INTER_AREA)
        cv2.imwrite(str(output_path), img)
    else:
        shutil.copy2(tmp_out, output_path)
