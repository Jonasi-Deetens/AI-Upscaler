"""
Run the image pipeline for a job. Dispatches to a per-method runner (registry).
Single responsibility: compose steps; no DB or status updates.
"""
from pathlib import Path

import shutil

from app.config import settings
from app.processors import background_remove, blur_sharpen, brightness_contrast, convert, crop, denoise, face_enhance, rename, resize, restore, rotate_flip, strip_metadata, watermark
from app.upscalers import esrgan, real_esrgan, real_esrgan_anime, swinir

METHOD_BACKGROUND_REMOVE = "background_remove"
METHOD_CONVERT = "convert"
METHOD_COMPRESS = "compress"
METHOD_RESTORE = "restore"
UPSCALE_METHODS = ("real_esrgan", "swinir", "esrgan", "real_esrgan_anime")


def _run_convert(job, input_path: Path, output_path: Path) -> None:
    convert.run(
        input_path,
        output_path,
        target_format=getattr(job, "target_format", "png"),
        quality=getattr(job, "quality", None),
    )


def _run_compress(job, input_path: Path, output_path: Path) -> None:
    convert.run(
        input_path,
        output_path,
        target_format=getattr(job, "target_format", "webp"),
        quality=getattr(job, "quality", 85),
    )


def _run_restore(job, input_path: Path, output_path: Path) -> None:
    restore.run(input_path, output_path)


def _run_resize(job, input_path: Path, output_path: Path) -> None:
    resize.run(job, input_path, output_path)


def _run_rotate_flip(job, input_path: Path, output_path: Path) -> None:
    rotate_flip.run(job, input_path, output_path)


def _run_crop(job, input_path: Path, output_path: Path) -> None:
    crop.run(job, input_path, output_path)


def _run_strip_metadata(job, input_path: Path, output_path: Path) -> None:
    strip_metadata.run(job, input_path, output_path)


def _run_denoise(job, input_path: Path, output_path: Path) -> None:
    denoise.run(input_path, output_path)


def _run_blur_sharpen(job, input_path: Path, output_path: Path) -> None:
    blur_sharpen.run(job, input_path, output_path)


def _run_brightness_contrast(job, input_path: Path, output_path: Path) -> None:
    brightness_contrast.run(job, input_path, output_path)


def _run_watermark(job, input_path: Path, output_path: Path) -> None:
    watermark.run(job, input_path, output_path)


def _run_rename(job, input_path: Path, output_path: Path) -> None:
    rename.run(job, input_path, output_path)


def _run_background_remove(job, input_path: Path, output_path: Path) -> None:
    current = input_path
    work_dir = input_path.parent
    step_out = work_dir / "step.png"
    if getattr(job, "denoise_first", False):
        denoise.run(current, step_out)
        current = step_out
    background_remove.run(current, output_path)


def _run_upscale(job, input_path: Path, output_path: Path) -> None:
    current = input_path
    work_dir = input_path.parent
    step_out = work_dir / "step.png"
    step_upscaled = work_dir / "upscaled.png"
    tile = settings.real_esrgan_tile

    if getattr(job, "denoise_first", False):
        denoise.run(current, step_out)
        current = step_out

    if job.method == "real_esrgan":
        real_esrgan.upscale(current, step_upscaled, scale=job.scale, tile=tile)
    elif job.method == "esrgan":
        esrgan.upscale(current, step_upscaled, scale=job.scale, tile=tile)
    elif job.method == "real_esrgan_anime":
        real_esrgan_anime.upscale(current, step_upscaled, scale=job.scale, tile=tile)
    elif job.method == "swinir":
        swinir.upscale(current, step_upscaled, scale=job.scale, tile=256)
    else:
        raise ValueError(f"Unknown upscale method: {job.method}")

    current = step_upscaled
    if getattr(job, "face_enhance", False):
        face_enhance.run(current, output_path)
    else:
        shutil.copy2(current, output_path)


METHOD_RUNNERS: dict = {
    METHOD_CONVERT: _run_convert,
    METHOD_COMPRESS: _run_compress,
    METHOD_RESTORE: _run_restore,
    "resize": _run_resize,
    "rotate_flip": _run_rotate_flip,
    "crop": _run_crop,
    "strip_metadata": _run_strip_metadata,
    "denoise": _run_denoise,
    "blur_sharpen": _run_blur_sharpen,
    "brightness_contrast": _run_brightness_contrast,
    "watermark": _run_watermark,
    "rename": _run_rename,
    METHOD_BACKGROUND_REMOVE: _run_background_remove,
    "real_esrgan": _run_upscale,
    "swinir": _run_upscale,
    "esrgan": _run_upscale,
    "real_esrgan_anime": _run_upscale,
}


def run(job, input_path: Path, output_path: Path) -> None:
    """
    Run pipeline for job. job must have: method, scale, denoise_first, face_enhance.
    For convert: target_format, optional quality. For compress: target_format, quality.
    Reads from input_path, writes final result to output_path.
    """
    runner = METHOD_RUNNERS.get(job.method)
    if runner is None:
        raise ValueError(f"Unknown method: {job.method}")
    runner(job, input_path, output_path)
