"""
Run the image pipeline for a job. Dispatches to a per-method runner (registry).
Single responsibility: compose steps; no DB or status updates.
"""
from pathlib import Path

import shutil

from app.config import settings
from app.processors import auto_levels, background_remove, blur_sharpen, border, brightness_contrast, collage, color_balance, convert, crop, denoise, face_enhance, filters, image_to_pdf, rename, resize, restore, rotate_flip, saturation, strip_metadata, watermark
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


def _run_auto_levels(job, input_path: Path, output_path: Path) -> None:
    auto_levels.run(job, input_path, output_path)


def _run_saturation(job, input_path: Path, output_path: Path) -> None:
    saturation.run(job, input_path, output_path)


def _run_color_balance(job, input_path: Path, output_path: Path) -> None:
    color_balance.run(job, input_path, output_path)


def _run_filters(job, input_path: Path, output_path: Path) -> None:
    filters.run(job, input_path, output_path)


def _run_border(job, input_path: Path, output_path: Path) -> None:
    border.run(job, input_path, output_path)


def _run_collage(job, input_path: Path, output_path: Path) -> None:
    collage.run(job, input_path, output_path)


def _run_image_to_pdf(job, input_path: Path, output_path: Path) -> None:
    image_to_pdf.run(job, input_path, output_path)


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
    "auto_levels": _run_auto_levels,
    "saturation": _run_saturation,
    "color_balance": _run_color_balance,
    "filters": _run_filters,
    "border": _run_border,
    "collage": _run_collage,
    "image_to_pdf": _run_image_to_pdf,
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
