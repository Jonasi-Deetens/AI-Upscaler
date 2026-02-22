"""
Run the image pipeline for a job. Dispatches to a per-method runner (registry).
Single responsibility: compose steps; no DB or status updates.
"""
from pathlib import Path

import shutil

from app.config import settings
from app.processors import (
    ai_denoise,
    auto_levels,
    background_blur,
    background_remove,
    background_replace,
    hdr_merge,
    tone_map,
    blur_sharpen,
    border,
    brightness_contrast,
    collage,
    color_balance,
    compress_pdf,
    convert,
    crop,
    deblur,
    denoise,
    document_enhance,
    face_enhance,
    favicon,
    filters,
    heic_to_jpg,
    image_to_pdf,
    inpaint,
    object_remove,
    ocr,
    pdf_merge_split,
    pdf_metadata,
    pdf_protect,
    pdf_extract_images,
    pdf_remove_pages,
    pdf_reorder,
    pdf_rotate,
    pdf_to_images,
    pdf_unlock,
    pixelate,
    rename,
    resize,
    restore,
    rotate_flip,
    saturation,
    smart_crop,
    strip_metadata,
    svg_to_png,
    tilt_shift,
    outpaint,
    upscale_print,
    vignette,
    watermark,
)
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


def _run_vignette(job, input_path: Path, output_path: Path) -> None:
    vignette.run(job, input_path, output_path)


def _run_tilt_shift(job, input_path: Path, output_path: Path) -> None:
    tilt_shift.run(job, input_path, output_path)


def _run_pixelate(job, input_path: Path, output_path: Path) -> None:
    pixelate.run(job, input_path, output_path)


def _run_smart_crop(job, input_path: Path, output_path: Path) -> None:
    smart_crop.run(job, input_path, output_path)


def _run_background_blur(job, input_path: Path, output_path: Path) -> None:
    background_blur.run(job, input_path, output_path)


def _run_inpaint(job, input_path: Path, output_path: Path) -> None:
    inpaint.run(job, input_path, output_path)


def _run_object_remove(job, input_path: Path, output_path: Path) -> None:
    object_remove.run(job, input_path, output_path)


def _run_deblur(job, input_path: Path, output_path: Path) -> None:
    deblur.run(input_path, output_path)


def _run_document_enhance(job, input_path: Path, output_path: Path) -> None:
    document_enhance.run(job, input_path, output_path)


def _run_ai_denoise(job, input_path: Path, output_path: Path) -> None:
    ai_denoise.run(job, input_path, output_path)


def _run_upscale_print(job, input_path: Path, output_path: Path) -> None:
    upscale_print.run(job, input_path, output_path)


def _run_outpaint(job, input_path: Path, output_path: Path) -> None:
    outpaint.run(job, input_path, output_path)


def _run_pdf_merge_split(job, input_path: Path, output_path: Path) -> None:
    pdf_merge_split.run(job, input_path, output_path)


def _run_compress_pdf(job, input_path: Path, output_path: Path) -> None:
    compress_pdf.run(job, input_path, output_path)


def _run_pdf_to_images(job, input_path: Path, output_path: Path) -> None:
    pdf_to_images.run(job, input_path, output_path)


def _run_pdf_metadata(job, input_path: Path, output_path: Path) -> None:
    pdf_metadata.run(job, input_path, output_path)


def _run_pdf_rotate(job, input_path: Path, output_path: Path) -> None:
    pdf_rotate.run(job, input_path, output_path)


def _run_pdf_reorder(job, input_path: Path, output_path: Path) -> None:
    pdf_reorder.run(job, input_path, output_path)


def _run_pdf_unlock(job, input_path: Path, output_path: Path) -> None:
    pdf_unlock.run(job, input_path, output_path)


def _run_pdf_protect(job, input_path: Path, output_path: Path) -> None:
    pdf_protect.run(job, input_path, output_path)


def _run_pdf_extract_images(job, input_path: Path, output_path: Path) -> None:
    pdf_extract_images.run(job, input_path, output_path)


def _run_pdf_remove_pages(job, input_path: Path, output_path: Path) -> None:
    pdf_remove_pages.run(job, input_path, output_path)


def _run_heic_to_jpg(job, input_path: Path, output_path: Path) -> None:
    heic_to_jpg.run(job, input_path, output_path)


def _run_svg_to_png(job, input_path: Path, output_path: Path) -> None:
    svg_to_png.run(job, input_path, output_path)


def _run_favicon(job, input_path: Path, output_path: Path) -> None:
    favicon.run(job, input_path, output_path)


def _run_ocr(job, input_path: Path, output_path: Path) -> None:
    ocr.run(job, input_path, output_path)


def _run_background_remove(job, input_path: Path, output_path: Path) -> None:
    current = input_path
    work_dir = input_path.parent
    step_out = work_dir / "step.png"
    if getattr(job, "denoise_first", False):
        denoise.run(current, step_out)
        current = step_out
    background_remove.run(current, output_path)


def _run_background_replace(job, input_path: Path, output_path: Path) -> None:
    background_replace.run(job, input_path, output_path)


def _run_hdr_merge(job, input_path: Path, output_path: Path) -> None:
    hdr_merge.run(job, input_path, output_path)


def _run_tone_map(job, input_path: Path, output_path: Path) -> None:
    tone_map.run(job, input_path, output_path)


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
    "vignette": _run_vignette,
    "tilt_shift": _run_tilt_shift,
    "pixelate": _run_pixelate,
    "smart_crop": _run_smart_crop,
    "background_blur": _run_background_blur,
    "inpaint": _run_inpaint,
    "object_remove": _run_object_remove,
    "deblur": _run_deblur,
    "document_enhance": _run_document_enhance,
    "ai_denoise": _run_ai_denoise,
    "upscale_print": _run_upscale_print,
    "outpaint": _run_outpaint,
    "pdf_merge_split": _run_pdf_merge_split,
    "compress_pdf": _run_compress_pdf,
    "pdf_to_images": _run_pdf_to_images,
    "pdf_metadata": _run_pdf_metadata,
    "pdf_rotate": _run_pdf_rotate,
    "pdf_reorder": _run_pdf_reorder,
    "pdf_unlock": _run_pdf_unlock,
    "pdf_protect": _run_pdf_protect,
    "pdf_extract_images": _run_pdf_extract_images,
    "pdf_remove_pages": _run_pdf_remove_pages,
    "heic_to_jpg": _run_heic_to_jpg,
    "svg_to_png": _run_svg_to_png,
    "favicon": _run_favicon,
    "ocr": _run_ocr,
    METHOD_BACKGROUND_REMOVE: _run_background_remove,
    "background_replace": _run_background_replace,
    "hdr_merge": _run_hdr_merge,
    "tone_map": _run_tone_map,
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
