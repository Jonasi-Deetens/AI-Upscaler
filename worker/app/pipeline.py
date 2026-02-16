"""
Run the image pipeline for a job: optional denoise -> main (upscale or bg remove) -> optional face_enhance.
Single responsibility: compose steps; no DB or status updates.
"""
from pathlib import Path

import shutil
from pathlib import Path

from app.config import settings
from app.processors import background_remove, denoise, face_enhance
from app.upscalers import esrgan, real_esrgan, real_esrgan_anime, swinir

METHOD_BACKGROUND_REMOVE = "background_remove"
UPSCALE_METHODS = ("real_esrgan", "swinir", "esrgan", "real_esrgan_anime")


def run(job, input_path: Path, output_path: Path) -> None:
    """
    Run pipeline for job. job must have: method, scale, denoise_first, face_enhance.
    Reads from input_path, writes final result to output_path.
    """
    current = input_path
    work_dir = input_path.parent
    step_out = work_dir / "step.png"

    if getattr(job, "denoise_first", False):
        denoise.run(current, step_out)
        current = step_out

    if job.method == METHOD_BACKGROUND_REMOVE:
        background_remove.run(current, output_path)
        return

    step_upscaled = work_dir / "upscaled.png"
    tile = settings.real_esrgan_tile
    if job.method == "real_esrgan":
        real_esrgan.upscale(current, step_upscaled, scale=job.scale, tile=tile)
    elif job.method == "esrgan":
        esrgan.upscale(current, step_upscaled, scale=job.scale, tile=tile)
    elif job.method == "real_esrgan_anime":
        real_esrgan_anime.upscale(current, step_upscaled, scale=job.scale, tile=tile)
    elif job.method == "swinir":
        swinir.upscale(current, step_upscaled, scale=job.scale, tile=256)
    else:
        raise ValueError(f"Unknown method: {job.method}")
    current = step_upscaled

    if getattr(job, "face_enhance", False):
        face_enhance.run(current, output_path)
    else:
        shutil.copy2(current, output_path)
