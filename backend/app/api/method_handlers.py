"""
Per-method validation and download info. Single place per method (SRP).
Upload endpoint uses VALIDATORS and get_download_info; no if/elif in jobs.py.
"""
from __future__ import annotations

import json
import re
from typing import Any

from fastapi import HTTPException

DOWNLOAD_MEDIA_TYPES = {"webp": "image/webp", "png": "image/png", "jpeg": "image/jpeg"}

CONVERT_TARGET_FORMATS = ("webp", "png", "jpeg")
COMPRESS_TARGET_FORMATS = ("webp", "jpeg")


def _base_name(job) -> str:
    base, _ = (
        job.original_filename.rsplit(".", 1)
        if "." in job.original_filename
        else (job.original_filename, "")
    )
    return base


# ---- validate: (scale, job_kwargs) ----

def _validate_convert(
    scale: int,
    denoise_first: bool,
    face_enhance: bool,
    target_format: str | None,
    quality: str | None,
    options: dict | None,
) -> tuple[int, dict[str, Any]]:
    if not target_format or target_format not in CONVERT_TARGET_FORMATS:
        raise HTTPException(
            400,
            detail=f"target_format required for convert, one of: {', '.join(CONVERT_TARGET_FORMATS)}",
        )
    quality_int: int | None = None
    if quality not in (None, ""):
        try:
            quality_int = int(quality)
            if quality_int < 1 or quality_int > 100:
                raise HTTPException(400, detail="quality must be between 1 and 100")
        except ValueError:
            raise HTTPException(400, detail="quality must be a number between 1 and 100")
    return 1, {
        "denoise_first": denoise_first,
        "face_enhance": face_enhance,
        "target_format": target_format,
        "quality": quality_int,
        "options": None,
    }


def _validate_compress(
    scale: int,
    denoise_first: bool,
    face_enhance: bool,
    target_format: str | None,
    quality: str | None,
    options: dict | None,
) -> tuple[int, dict[str, Any]]:
    if not target_format or target_format not in COMPRESS_TARGET_FORMATS:
        raise HTTPException(
            400,
            detail=f"target_format required for compress, one of: {', '.join(COMPRESS_TARGET_FORMATS)}",
        )
    if quality in (None, ""):
        raise HTTPException(400, detail="quality required for compress (1–100)")
    try:
        quality_int = int(quality)
        if quality_int < 1 or quality_int > 100:
            raise HTTPException(400, detail="quality must be between 1 and 100")
    except ValueError:
        raise HTTPException(400, detail="quality must be a number between 1 and 100")
    return 1, {
        "denoise_first": denoise_first,
        "face_enhance": face_enhance,
        "target_format": target_format,
        "quality": quality_int,
        "options": None,
    }


def _validate_background_remove(
    scale: int,
    denoise_first: bool,
    face_enhance: bool,
    target_format: str | None,
    quality: str | None,
    options: dict | None,
) -> tuple[int, dict[str, Any]]:
    if scale != 1:
        raise HTTPException(400, detail="scale must be 1 for background remove")
    return 1, {
        "denoise_first": denoise_first,
        "face_enhance": face_enhance,
        "target_format": None,
        "quality": None,
        "options": None,
    }


def _validate_restore(
    scale: int,
    denoise_first: bool,
    face_enhance: bool,
    target_format: str | None,
    quality: str | None,
    options: dict | None,
) -> tuple[int, dict[str, Any]]:
    if scale != 1:
        raise HTTPException(400, detail="scale must be 1 for restore")
    return 1, {
        "denoise_first": denoise_first,
        "face_enhance": face_enhance,
        "target_format": None,
        "quality": None,
        "options": None,
    }


def _validate_object_remove(
    scale: int,
    denoise_first: bool,
    face_enhance: bool,
    target_format: str | None,
    quality: str | None,
    options: dict | None,
) -> tuple[int, dict[str, Any]]:
    if scale != 1:
        raise HTTPException(400, detail="scale must be 1 for object_remove")
    return 1, {
        "denoise_first": denoise_first,
        "face_enhance": face_enhance,
        "target_format": None,
        "quality": None,
        "options": options if options else {},
    }


def _validate_deblur(
    scale: int,
    denoise_first: bool,
    face_enhance: bool,
    target_format: str | None,
    quality: str | None,
    options: dict | None,
) -> tuple[int, dict[str, Any]]:
    if scale != 1:
        raise HTTPException(400, detail="scale must be 1 for deblur")
    return 1, {
        "denoise_first": denoise_first,
        "face_enhance": face_enhance,
        "target_format": None,
        "quality": None,
        "options": options if options else {},
    }


def _validate_document_enhance(
    scale: int,
    denoise_first: bool,
    face_enhance: bool,
    target_format: str | None,
    quality: str | None,
    options: dict | None,
) -> tuple[int, dict[str, Any]]:
    if scale != 1:
        raise HTTPException(400, detail="scale must be 1 for document_enhance")
    opts = options or {}
    binarize = opts.get("binarize") is True
    return 1, {
        "denoise_first": False,
        "face_enhance": False,
        "target_format": None,
        "quality": None,
        "options": {"binarize": binarize},
    }


def _validate_ai_denoise(
    scale: int,
    denoise_first: bool,
    face_enhance: bool,
    target_format: str | None,
    quality: str | None,
    options: dict | None,
) -> tuple[int, dict[str, Any]]:
    if scale != 1:
        raise HTTPException(400, detail="scale must be 1 for ai_denoise")
    return 1, {
        "denoise_first": denoise_first,
        "face_enhance": face_enhance,
        "target_format": None,
        "quality": None,
        "options": options if options else {},
    }


PAPER_PRESETS = ("A4", "A3")
PRINT_DPI_MIN, PRINT_DPI_MAX = 72, 600


def _validate_upscale_print(
    scale: int,
    denoise_first: bool,
    face_enhance: bool,
    target_format: str | None,
    quality: str | None,
    options: dict | None,
) -> tuple[int, dict[str, Any]]:
    if scale != 1:
        raise HTTPException(400, detail="scale must be 1 for upscale_print")
    opts = options or {}
    paper = (opts.get("paper_preset") or "").strip().upper()
    width_mm = opts.get("width_mm")
    height_mm = opts.get("height_mm")
    if paper and paper not in PAPER_PRESETS:
        raise HTTPException(400, detail=f"paper_preset must be one of: {', '.join(PAPER_PRESETS)}")
    if not paper and (width_mm is None or height_mm is None):
        raise HTTPException(400, detail="Provide paper_preset (A4, A3) or width_mm and height_mm")
    if paper:
        # A4 = 210×297 mm, A3 = 297×420 mm
        if paper == "A4":
            width_mm, height_mm = 210, 297
        else:
            width_mm, height_mm = 297, 420
    else:
        try:
            width_mm = int(width_mm)
            height_mm = int(height_mm)
            if width_mm < 1 or width_mm > 2000 or height_mm < 1 or height_mm > 2000:
                raise HTTPException(400, detail="width_mm and height_mm must be between 1 and 2000")
        except (TypeError, ValueError):
            raise HTTPException(400, detail="width_mm and height_mm must be integers")
    dpi = opts.get("dpi", 300)
    try:
        dpi = int(dpi)
        if dpi < PRINT_DPI_MIN or dpi > PRINT_DPI_MAX:
            raise HTTPException(400, detail=f"dpi must be between {PRINT_DPI_MIN} and {PRINT_DPI_MAX}")
    except (TypeError, ValueError):
        raise HTTPException(400, detail=f"dpi must be an integer between {PRINT_DPI_MIN} and {PRINT_DPI_MAX}")
    return 1, {
        "denoise_first": False,
        "face_enhance": False,
        "target_format": None,
        "quality": None,
        "options": {"width_mm": width_mm, "height_mm": height_mm, "dpi": dpi},
    }


def _validate_hdr_merge(
    scale: int,
    denoise_first: bool,
    face_enhance: bool,
    target_format: str | None,
    quality: str | None,
    options: dict | None,
) -> tuple[int, dict[str, Any]]:
    if scale != 1:
        raise HTTPException(400, detail="scale must be 1 for hdr_merge")
    return 1, {
        "denoise_first": denoise_first,
        "face_enhance": face_enhance,
        "target_format": None,
        "quality": None,
        "options": options if options else {},
    }


def _validate_tone_map(
    scale: int,
    denoise_first: bool,
    face_enhance: bool,
    target_format: str | None,
    quality: str | None,
    options: dict | None,
) -> tuple[int, dict[str, Any]]:
    if scale != 1:
        raise HTTPException(400, detail="scale must be 1 for tone_map")
    return 1, {
        "denoise_first": denoise_first,
        "face_enhance": face_enhance,
        "target_format": None,
        "quality": None,
        "options": options if options else {},
    }


def _validate_background_replace(
    scale: int,
    denoise_first: bool,
    face_enhance: bool,
    target_format: str | None,
    quality: str | None,
    options: dict | None,
) -> tuple[int, dict[str, Any]]:
    if scale != 1:
        raise HTTPException(400, detail="scale must be 1 for background_replace")
    return 1, {
        "denoise_first": denoise_first,
        "face_enhance": face_enhance,
        "target_format": None,
        "quality": None,
        "options": options if options else {},
    }


def _validate_outpaint(
    scale: int,
    denoise_first: bool,
    face_enhance: bool,
    target_format: str | None,
    quality: str | None,
    options: dict | None,
) -> tuple[int, dict[str, Any]]:
    if scale != 1:
        raise HTTPException(400, detail="scale must be 1 for outpaint")
    opts = options or {}
    extend_left = int(opts.get("extend_left", 0))
    extend_right = int(opts.get("extend_right", 0))
    extend_top = int(opts.get("extend_top", 0))
    extend_bottom = int(opts.get("extend_bottom", 0))
    if any(x < 0 for x in (extend_left, extend_right, extend_top, extend_bottom)):
        raise HTTPException(400, detail="extend values must be non-negative")
    if extend_left + extend_right + extend_top + extend_bottom == 0:
        raise HTTPException(400, detail="At least one of extend_left, extend_right, extend_top, extend_bottom must be positive")
    total = extend_left + extend_right + extend_top + extend_bottom
    if total > 2000:
        raise HTTPException(400, detail="Total extension (sum of extend_*) must be at most 2000 pixels")
    return 1, {
        "denoise_first": False,
        "face_enhance": False,
        "target_format": None,
        "quality": None,
        "options": {
            "extend_left": extend_left,
            "extend_right": extend_right,
            "extend_top": extend_top,
            "extend_bottom": extend_bottom,
        },
    }


def _validate_upscale(
    scale: int,
    denoise_first: bool,
    face_enhance: bool,
    target_format: str | None,
    quality: str | None,
    options: dict | None,
) -> tuple[int, dict[str, Any]]:
    if scale not in (2, 4):
        raise HTTPException(400, detail="scale must be 2 or 4")
    return scale, {
        "denoise_first": denoise_first,
        "face_enhance": face_enhance,
        "target_format": None,
        "quality": None,
        "options": None,
    }


RESIZE_FIT_VALUES = ("inside", "exact", "fill")


def _validate_resize(
    scale: int,
    denoise_first: bool,
    face_enhance: bool,
    target_format: str | None,
    quality: str | None,
    options: dict | None,
) -> tuple[int, dict[str, Any]]:
    if not options:
        raise HTTPException(400, detail="resize requires options with max_width and/or max_height")
    max_width = options.get("max_width")
    max_height = options.get("max_height")
    if max_width is None and max_height is None:
        raise HTTPException(400, detail="resize requires at least one of max_width, max_height")
    if max_width is not None:
        try:
            w = int(max_width)
            if w < 1 or w > 16384:
                raise HTTPException(400, detail="max_width must be between 1 and 16384")
        except (TypeError, ValueError):
            raise HTTPException(400, detail="max_width must be a positive integer")
    if max_height is not None:
        try:
            h = int(max_height)
            if h < 1 or h > 16384:
                raise HTTPException(400, detail="max_height must be between 1 and 16384")
        except (TypeError, ValueError):
            raise HTTPException(400, detail="max_height must be a positive integer")
    fit = options.get("fit", "inside")
    if fit not in RESIZE_FIT_VALUES:
        raise HTTPException(400, detail=f"fit must be one of: {', '.join(RESIZE_FIT_VALUES)}")
    return 1, {
        "denoise_first": False,
        "face_enhance": False,
        "target_format": None,
        "quality": None,
        "options": {
            "max_width": int(max_width) if max_width is not None else None,
            "max_height": int(max_height) if max_height is not None else None,
            "fit": fit,
        },
    }


ROTATE_VALUES = (0, 90, 180, 270)


def _validate_rotate_flip(
    scale: int,
    denoise_first: bool,
    face_enhance: bool,
    target_format: str | None,
    quality: str | None,
    options: dict | None,
) -> tuple[int, dict[str, Any]]:
    opts = options or {}
    rotate = opts.get("rotate", 0)
    try:
        rotate = int(rotate)
        if rotate not in ROTATE_VALUES:
            raise HTTPException(400, detail="rotate must be 0, 90, 180, or 270")
    except (TypeError, ValueError):
        raise HTTPException(400, detail="rotate must be 0, 90, 180, or 270")
    flip_h = bool(opts.get("flip_h", False))
    flip_v = bool(opts.get("flip_v", False))
    return 1, {
        "denoise_first": False,
        "face_enhance": False,
        "target_format": None,
        "quality": None,
        "options": {"rotate": rotate, "flip_h": flip_h, "flip_v": flip_v},
    }


def _validate_crop(
    scale: int,
    denoise_first: bool,
    face_enhance: bool,
    target_format: str | None,
    quality: str | None,
    options: dict | None,
) -> tuple[int, dict[str, Any]]:
    if not options:
        raise HTTPException(400, detail="crop requires options with x, y, width, height")
    for key in ("x", "y", "width", "height"):
        if key not in options:
            raise HTTPException(400, detail=f"crop requires option: {key}")
    try:
        x = int(options["x"])
        y = int(options["y"])
        w = int(options["width"])
        h = int(options["height"])
        if x < 0 or y < 0 or w < 1 or h < 1:
            raise HTTPException(400, detail="crop x,y must be >= 0; width, height must be >= 1")
    except (TypeError, ValueError):
        raise HTTPException(400, detail="crop x, y, width, height must be integers")
    return 1, {
        "denoise_first": False,
        "face_enhance": False,
        "target_format": None,
        "quality": None,
        "options": {"x": x, "y": y, "width": w, "height": h},
    }


def _validate_strip_metadata(
    scale: int,
    denoise_first: bool,
    face_enhance: bool,
    target_format: str | None,
    quality: str | None,
    options: dict | None,
) -> tuple[int, dict[str, Any]]:
    return 1, {
        "denoise_first": False,
        "face_enhance": False,
        "target_format": None,
        "quality": None,
        "options": options if options else {},
    }


def _validate_denoise(
    scale: int,
    denoise_first: bool,
    face_enhance: bool,
    target_format: str | None,
    quality: str | None,
    options: dict | None,
) -> tuple[int, dict[str, Any]]:
    return 1, {
        "denoise_first": False,
        "face_enhance": False,
        "target_format": None,
        "quality": None,
        "options": options if options else {},
    }


BLUR_SHARPEN_MODES = ("blur", "sharpen")


def _validate_blur_sharpen(
    scale: int,
    denoise_first: bool,
    face_enhance: bool,
    target_format: str | None,
    quality: str | None,
    options: dict | None,
) -> tuple[int, dict[str, Any]]:
    opts = options or {}
    mode = opts.get("mode", "blur")
    if mode not in BLUR_SHARPEN_MODES:
        raise HTTPException(400, detail=f"mode must be one of: {', '.join(BLUR_SHARPEN_MODES)}")
    radius = 3
    strength = 1.5
    if mode == "blur":
        r = opts.get("radius", 3)
        try:
            radius = int(r) if r is not None else 3
            if radius < 1 or radius > 50:
                raise HTTPException(400, detail="radius must be between 1 and 50")
        except (TypeError, ValueError):
            raise HTTPException(400, detail="radius must be an integer between 1 and 50")
    else:
        s = opts.get("strength", 1.5)
        try:
            strength = float(s) if s is not None else 1.5
            if strength < 0.5 or strength > 5:
                raise HTTPException(400, detail="strength must be between 0.5 and 5")
        except (TypeError, ValueError):
            raise HTTPException(400, detail="strength must be a number between 0.5 and 5")
    return 1, {
        "denoise_first": False,
        "face_enhance": False,
        "target_format": None,
        "quality": None,
        "options": {"mode": mode, "radius": radius, "strength": strength},
    }


def _validate_brightness_contrast(
    scale: int,
    denoise_first: bool,
    face_enhance: bool,
    target_format: str | None,
    quality: str | None,
    options: dict | None,
) -> tuple[int, dict[str, Any]]:
    opts = options or {}
    try:
        brightness = int(opts.get("brightness", 0))
        if brightness < -100 or brightness > 100:
            raise HTTPException(400, detail="brightness must be between -100 and 100")
    except (TypeError, ValueError):
        raise HTTPException(400, detail="brightness must be an integer between -100 and 100")
    try:
        contrast = int(opts.get("contrast", 100))
        if contrast < 0 or contrast > 200:
            raise HTTPException(400, detail="contrast must be between 0 and 200")
    except (TypeError, ValueError):
        raise HTTPException(400, detail="contrast must be an integer between 0 and 200")
    return 1, {
        "denoise_first": False,
        "face_enhance": False,
        "target_format": None,
        "quality": None,
        "options": {"brightness": brightness, "contrast": contrast},
    }


WATERMARK_POSITIONS = ("center", "top_left", "top_right", "bottom_left", "bottom_right")


def _validate_watermark(
    scale: int,
    denoise_first: bool,
    face_enhance: bool,
    target_format: str | None,
    quality: str | None,
    options: dict | None,
) -> tuple[int, dict[str, Any]]:
    opts = options or {}
    text = opts.get("text", "").strip() if opts.get("text") else ""
    if not text:
        raise HTTPException(400, detail="text is required for watermark")
    position = (opts.get("position") or "center").strip() or "center"
    if position not in WATERMARK_POSITIONS:
        raise HTTPException(400, detail=f"position must be one of: {', '.join(WATERMARK_POSITIONS)}")
    try:
        opacity = int(opts.get("opacity", 80))
        if opacity < 0 or opacity > 100:
            raise HTTPException(400, detail="opacity must be between 0 and 100")
    except (TypeError, ValueError):
        raise HTTPException(400, detail="opacity must be an integer between 0 and 100")
    try:
        font_size = int(opts.get("font_size", 36))
        if font_size < 12 or font_size > 120:
            raise HTTPException(400, detail="font_size must be between 12 and 120")
    except (TypeError, ValueError):
        raise HTTPException(400, detail="font_size must be an integer between 12 and 120")
    return 1, {
        "denoise_first": False,
        "face_enhance": False,
        "target_format": None,
        "quality": None,
        "options": {"text": text, "position": position, "opacity": opacity, "font_size": font_size},
    }


def _sanitize_prefix(prefix: str) -> str:
    """Allow only alphanumeric, underscore, hyphen for safe filenames."""
    return re.sub(r"[^\w\-]", "_", prefix).strip("_") or ""


def _validate_rename(
    scale: int,
    denoise_first: bool,
    face_enhance: bool,
    target_format: str | None,
    quality: str | None,
    options: dict | None,
) -> tuple[int, dict[str, Any]]:
    opts = options or {}
    raw = (opts.get("prefix") or "").strip()
    prefix = _sanitize_prefix(raw) if raw else ""
    return 1, {
        "denoise_first": False,
        "face_enhance": False,
        "target_format": None,
        "quality": None,
        "options": {"prefix": prefix},
    }


# ---- download_info: (download_filename, media_type) ----

def _download_info_convert(job) -> tuple[str, str]:
    base = _base_name(job)
    ext = getattr(job, "target_format", None) or "png"
    return f"{base}_converted.{ext}", DOWNLOAD_MEDIA_TYPES.get(ext, "application/octet-stream")


def _download_info_compress(job) -> tuple[str, str]:
    base = _base_name(job)
    ext = getattr(job, "target_format", None) or "webp"
    return f"{base}_compressed.{ext}", DOWNLOAD_MEDIA_TYPES.get(ext, "application/octet-stream")


def _download_info_restore(job) -> tuple[str, str]:
    return f"{_base_name(job)}_restored.png", "image/png"


def _download_info_object_remove(job) -> tuple[str, str]:
    return f"{_base_name(job)}_object_removed.png", "image/png"


def _download_info_deblur(job) -> tuple[str, str]:
    return f"{_base_name(job)}_deblurred.png", "image/png"


def _download_info_document_enhance(job) -> tuple[str, str]:
    return f"{_base_name(job)}_document.png", "image/png"


def _download_info_ai_denoise(job) -> tuple[str, str]:
    return f"{_base_name(job)}_ai_denoised.png", "image/png"


def _download_info_upscale_print(job) -> tuple[str, str]:
    opts = getattr(job, "options", None) or {}
    dpi = opts.get("dpi", 300)
    return f"{_base_name(job)}_print_{dpi}dpi.png", "image/png"


def _download_info_outpaint(job) -> tuple[str, str]:
    return f"{_base_name(job)}_outpainted.png", "image/png"


def _download_info_background_replace(job) -> tuple[str, str]:
    return f"{_base_name(job)}_background_replaced.png", "image/png"


def _download_info_hdr_merge(job) -> tuple[str, str]:
    return f"{_base_name(job)}_hdr.png", "image/png"


def _download_info_tone_map(job) -> tuple[str, str]:
    return f"{_base_name(job)}_tone_mapped.png", "image/png"


def _download_info_upscale(job) -> tuple[str, str]:
    return f"{_base_name(job)}_upscaled.png", "image/png"


def _download_info_background_remove(job) -> tuple[str, str]:
    return f"{_base_name(job)}_upscaled.png", "image/png"  # same as upscale (PNG result)


def _download_info_resize(job) -> tuple[str, str]:
    return f"{_base_name(job)}_resized.png", "image/png"


def _download_info_rotate_flip(job) -> tuple[str, str]:
    return f"{_base_name(job)}_rotated.png", "image/png"


def _download_info_crop(job) -> tuple[str, str]:
    return f"{_base_name(job)}_cropped.png", "image/png"


def _download_info_strip_metadata(job) -> tuple[str, str]:
    return f"{_base_name(job)}_stripped.png", "image/png"


def _download_info_denoise(job) -> tuple[str, str]:
    return f"{_base_name(job)}_denoised.png", "image/png"


def _download_info_blur_sharpen(job) -> tuple[str, str]:
    base = _base_name(job)
    opts = getattr(job, "options", None) or {}
    suffix = "sharpened" if opts.get("mode") == "sharpen" else "blurred"
    return f"{base}_{suffix}.png", "image/png"


def _download_info_brightness_contrast(job) -> tuple[str, str]:
    return f"{_base_name(job)}_adjusted.png", "image/png"


def _download_info_watermark(job) -> tuple[str, str]:
    return f"{_base_name(job)}_watermarked.png", "image/png"


def _download_info_rename(job) -> tuple[str, str]:
    """Worker outputs PNG; download name uses prefix + base name with .png."""
    base = _base_name(job)
    opts = getattr(job, "options", None) or {}
    prefix = (opts.get("prefix") or "").strip()
    prefix = _sanitize_prefix(prefix) if prefix else ""
    if prefix:
        download_name = f"{prefix}_{base}.png"
    else:
        download_name = f"{base}_renamed.png"
    return download_name, "image/png"


AUTO_LEVELS_MODES = ("levels", "contrast")


def _validate_auto_levels(
    scale: int,
    denoise_first: bool,
    face_enhance: bool,
    target_format: str | None,
    quality: str | None,
    options: dict | None,
) -> tuple[int, dict[str, Any]]:
    opts = options or {}
    mode = (opts.get("mode") or "levels").strip() or "levels"
    if mode not in AUTO_LEVELS_MODES:
        raise HTTPException(400, detail=f"mode must be one of: {', '.join(AUTO_LEVELS_MODES)}")
    return 1, {
        "denoise_first": False,
        "face_enhance": False,
        "target_format": None,
        "quality": None,
        "options": {"mode": mode},
    }


def _download_info_auto_levels(job) -> tuple[str, str]:
    return f"{_base_name(job)}_auto_levels.png", "image/png"


def _validate_saturation(
    scale: int,
    denoise_first: bool,
    face_enhance: bool,
    target_format: str | None,
    quality: str | None,
    options: dict | None,
) -> tuple[int, dict[str, Any]]:
    opts = options or {}
    try:
        saturation = int(opts.get("saturation", 100))
        if saturation < 0 or saturation > 200:
            raise HTTPException(400, detail="saturation must be between 0 and 200")
    except (TypeError, ValueError):
        raise HTTPException(400, detail="saturation must be an integer between 0 and 200")
    try:
        vibrance = int(opts.get("vibrance", 100))
        if vibrance < 0 or vibrance > 200:
            raise HTTPException(400, detail="vibrance must be between 0 and 200")
    except (TypeError, ValueError):
        raise HTTPException(400, detail="vibrance must be an integer between 0 and 200")
    return 1, {
        "denoise_first": False,
        "face_enhance": False,
        "target_format": None,
        "quality": None,
        "options": {"saturation": saturation, "vibrance": vibrance},
    }


def _download_info_saturation(job) -> tuple[str, str]:
    return f"{_base_name(job)}_saturation.png", "image/png"


def _validate_color_balance(
    scale: int,
    denoise_first: bool,
    face_enhance: bool,
    target_format: str | None,
    quality: str | None,
    options: dict | None,
) -> tuple[int, dict[str, Any]]:
    opts = options or {}
    for key in ("r", "g", "b"):
        try:
            val = int(opts.get(key, 0))
            if val < -100 or val > 100:
                raise HTTPException(400, detail=f"{key} must be between -100 and 100")
        except (TypeError, ValueError):
            raise HTTPException(400, detail=f"{key} must be an integer between -100 and 100")
    r = int(opts.get("r", 0))
    g = int(opts.get("g", 0))
    b = int(opts.get("b", 0))
    return 1, {
        "denoise_first": False,
        "face_enhance": False,
        "target_format": None,
        "quality": None,
        "options": {"r": r, "g": g, "b": b},
    }


def _download_info_color_balance(job) -> tuple[str, str]:
    return f"{_base_name(job)}_color_balance.png", "image/png"


FILTER_PRESETS = ("grayscale", "sepia", "vintage_warm", "vintage_cool")


def _validate_filters(
    scale: int,
    denoise_first: bool,
    face_enhance: bool,
    target_format: str | None,
    quality: str | None,
    options: dict | None,
) -> tuple[int, dict[str, Any]]:
    opts = options or {}
    preset = (opts.get("preset") or "grayscale").strip() or "grayscale"
    if preset not in FILTER_PRESETS:
        raise HTTPException(400, detail=f"preset must be one of: {', '.join(FILTER_PRESETS)}")
    return 1, {
        "denoise_first": False,
        "face_enhance": False,
        "target_format": None,
        "quality": None,
        "options": {"preset": preset},
    }


def _download_info_filters(job) -> tuple[str, str]:
    return f"{_base_name(job)}_filtered.png", "image/png"


def _validate_border(
    scale: int,
    denoise_first: bool,
    face_enhance: bool,
    target_format: str | None,
    quality: str | None,
    options: dict | None,
) -> tuple[int, dict[str, Any]]:
    opts = options or {}
    try:
        padding = int(opts.get("padding", 20))
        if padding < 0 or padding > 500:
            raise HTTPException(400, detail="padding must be between 0 and 500")
    except (TypeError, ValueError):
        raise HTTPException(400, detail="padding must be an integer between 0 and 500")
    color = (opts.get("color") or "#ffffff").strip() or "#ffffff"
    if not (len(color) == 7 and color[0] == "#" and all(c in "0123456789abcdefABCDEF" for c in color[1:])):
        color = "#ffffff"
    try:
        width = int(opts.get("width", 0))
        if width < 0 or width > 100:
            raise HTTPException(400, detail="width must be between 0 and 100")
    except (TypeError, ValueError):
        raise HTTPException(400, detail="width must be an integer between 0 and 100")
    return 1, {
        "denoise_first": False,
        "face_enhance": False,
        "target_format": None,
        "quality": None,
        "options": {"padding": padding, "color": color, "width": width},
    }


def _download_info_border(job) -> tuple[str, str]:
    return f"{_base_name(job)}_bordered.png", "image/png"


def _layout_to_rows_cols(layout: str) -> tuple[int, int]:
    if layout == "2x2":
        return 2, 2
    if layout == "3x3":
        return 3, 3
    if layout == "1x4":
        return 1, 4
    if layout == "2x3":
        return 2, 3
    if layout == "3x2":
        return 3, 2
    return 2, 2


COLLAGE_LAYOUTS = ("2x2", "3x3", "1x4", "2x3", "3x2")


def _validate_collage(
    scale: int,
    denoise_first: bool,
    face_enhance: bool,
    target_format: str | None,
    quality: str | None,
    options: dict | None,
) -> tuple[int, dict[str, Any]]:
    opts = options or {}
    layout = (opts.get("layout") or "2x2").strip() or "2x2"
    if layout not in COLLAGE_LAYOUTS:
        raise HTTPException(400, detail=f"layout must be one of: {', '.join(COLLAGE_LAYOUTS)}")
    rows, cols = _layout_to_rows_cols(layout)
    try:
        spacing = int(opts.get("spacing", 10))
        if spacing < 0 or spacing > 100:
            raise HTTPException(400, detail="spacing must be between 0 and 100")
    except (TypeError, ValueError):
        raise HTTPException(400, detail="spacing must be an integer between 0 and 100")
    background = (opts.get("background") or "#ffffff").strip() or "#ffffff"
    if not (len(background) == 7 and background[0] == "#" and all(c in "0123456789abcdefABCDEF" for c in background[1:])):
        background = "#ffffff"
    job_opts = {"layout": layout, "grid_rows": rows, "grid_cols": cols, "spacing": spacing, "background": background}
    return 1, {
        "denoise_first": False,
        "face_enhance": False,
        "target_format": None,
        "quality": None,
        "options": job_opts,
    }


def _download_info_collage(job) -> tuple[str, str]:
    return "collage.png", "image/png"


def _validate_image_to_pdf(
    scale: int,
    denoise_first: bool,
    face_enhance: bool,
    target_format: str | None,
    quality: str | None,
    options: dict | None,
) -> tuple[int, dict[str, Any]]:
    return 1, {
        "denoise_first": False,
        "face_enhance": False,
        "target_format": None,
        "quality": None,
        "options": options or {},
    }


def _download_info_image_to_pdf(job) -> tuple[str, str]:
    return "document.pdf", "application/pdf"


def _validate_vignette(
    scale: int,
    denoise_first: bool,
    face_enhance: bool,
    target_format: str | None,
    quality: str | None,
    options: dict | None,
) -> tuple[int, dict[str, Any]]:
    opts = options or {}
    try:
        strength = int(opts.get("strength", 50))
        if strength < 0 or strength > 100:
            raise HTTPException(400, detail="strength must be between 0 and 100")
    except (TypeError, ValueError):
        raise HTTPException(400, detail="strength must be an integer between 0 and 100")
    try:
        radius = int(opts.get("radius", 70))
        if radius < 0 or radius > 100:
            raise HTTPException(400, detail="radius must be between 0 and 100")
    except (TypeError, ValueError):
        raise HTTPException(400, detail="radius must be an integer between 0 and 100")
    return 1, {
        "denoise_first": False,
        "face_enhance": False,
        "target_format": None,
        "quality": None,
        "options": {"strength": strength, "radius": radius},
    }


def _download_info_vignette(job) -> tuple[str, str]:
    return f"{_base_name(job)}_vignette.png", "image/png"


def _validate_tilt_shift(
    scale: int,
    denoise_first: bool,
    face_enhance: bool,
    target_format: str | None,
    quality: str | None,
    options: dict | None,
) -> tuple[int, dict[str, Any]]:
    opts = options or {}
    try:
        blur_radius = int(opts.get("blur_radius", 15))
        if blur_radius < 2 or blur_radius > 80:
            raise HTTPException(400, detail="blur_radius must be between 2 and 80")
    except (TypeError, ValueError):
        raise HTTPException(400, detail="blur_radius must be an integer between 2 and 80")
    try:
        focus_center = float(opts.get("focus_center", 0.5))
        if focus_center < 0 or focus_center > 1:
            raise HTTPException(400, detail="focus_center must be between 0 and 1")
    except (TypeError, ValueError):
        raise HTTPException(400, detail="focus_center must be a number between 0 and 1")
    try:
        focus_width = float(opts.get("focus_width", 0.3))
        if focus_width < 0.05 or focus_width > 1:
            raise HTTPException(400, detail="focus_width must be between 0.05 and 1")
    except (TypeError, ValueError):
        raise HTTPException(400, detail="focus_width must be a number between 0.05 and 1")
    return 1, {
        "denoise_first": False,
        "face_enhance": False,
        "target_format": None,
        "quality": None,
        "options": {"blur_radius": blur_radius, "focus_center": focus_center, "focus_width": focus_width},
    }


def _download_info_tilt_shift(job) -> tuple[str, str]:
    return f"{_base_name(job)}_tilt_shift.png", "image/png"


def _validate_pixelate(
    scale: int,
    denoise_first: bool,
    face_enhance: bool,
    target_format: str | None,
    quality: str | None,
    options: dict | None,
) -> tuple[int, dict[str, Any]]:
    opts = options or {}
    try:
        block_size = int(opts.get("block_size", 8))
        if block_size < 2 or block_size > 128:
            raise HTTPException(400, detail="block_size must be between 2 and 128")
    except (TypeError, ValueError):
        raise HTTPException(400, detail="block_size must be an integer between 2 and 128")
    return 1, {
        "denoise_first": False,
        "face_enhance": False,
        "target_format": None,
        "quality": None,
        "options": {"block_size": block_size},
    }


def _download_info_pixelate(job) -> tuple[str, str]:
    return f"{_base_name(job)}_pixelated.png", "image/png"


def _validate_smart_crop(
    scale: int,
    denoise_first: bool,
    face_enhance: bool,
    target_format: str | None,
    quality: str | None,
    options: dict | None,
) -> tuple[int, dict[str, Any]]:
    opts = options or {}
    try:
        width = int(opts.get("width", 0))
        height = int(opts.get("height", 0))
        aspect_ratio = opts.get("aspect_ratio")
        if aspect_ratio is not None:
            aspect_ratio = float(aspect_ratio)
            if aspect_ratio < 0.1 or aspect_ratio > 10:
                raise HTTPException(400, detail="aspect_ratio must be between 0.1 and 10")
    except (TypeError, ValueError):
        raise HTTPException(400, detail="width, height, and aspect_ratio must be numbers")
    if width < 0 or height < 0:
        raise HTTPException(400, detail="width and height must be non-negative")
    if width == 0 and height == 0 and aspect_ratio is None:
        raise HTTPException(400, detail="provide width, height, or aspect_ratio")
    mode = (opts.get("mode") or "saliency").strip() or "saliency"
    if mode not in ("center", "saliency"):
        raise HTTPException(400, detail="mode must be 'center' or 'saliency'")
    return 1, {
        "denoise_first": False,
        "face_enhance": False,
        "target_format": None,
        "quality": None,
        "options": {"width": width, "height": height, "aspect_ratio": aspect_ratio, "mode": mode},
    }


def _download_info_smart_crop(job) -> tuple[str, str]:
    return f"{_base_name(job)}_smart_crop.png", "image/png"


def _validate_background_blur(
    scale: int,
    denoise_first: bool,
    face_enhance: bool,
    target_format: str | None,
    quality: str | None,
    options: dict | None,
) -> tuple[int, dict[str, Any]]:
    opts = options or {}
    try:
        blur_radius = int(opts.get("blur_radius", 25))
        if blur_radius < 5 or blur_radius > 100:
            raise HTTPException(400, detail="blur_radius must be between 5 and 100")
    except (TypeError, ValueError):
        raise HTTPException(400, detail="blur_radius must be an integer between 5 and 100")
    return 1, {
        "denoise_first": False,
        "face_enhance": False,
        "target_format": None,
        "quality": None,
        "options": {"blur_radius": blur_radius},
    }


def _download_info_background_blur(job) -> tuple[str, str]:
    return f"{_base_name(job)}_portrait.png", "image/png"


def _validate_inpaint(
    scale: int,
    denoise_first: bool,
    face_enhance: bool,
    target_format: str | None,
    quality: str | None,
    options: dict | None,
) -> tuple[int, dict[str, Any]]:
    return 1, {
        "denoise_first": False,
        "face_enhance": False,
        "target_format": None,
        "quality": None,
        "options": options or {},
    }


def _download_info_inpaint(job) -> tuple[str, str]:
    return f"{_base_name(job)}_inpainted.png", "image/png"


def _validate_pdf_merge_split(
    scale: int,
    denoise_first: bool,
    face_enhance: bool,
    target_format: str | None,
    quality: str | None,
    options: dict | None,
) -> tuple[int, dict[str, Any]]:
    opts = options or {}
    action = (opts.get("action") or "merge").strip().lower()
    if action not in ("merge", "split"):
        raise HTTPException(400, detail="action must be 'merge' or 'split'")
    return 1, {
        "denoise_first": False,
        "face_enhance": False,
        "target_format": None,
        "quality": None,
        "options": {"action": action},
    }


def _download_info_pdf_merge_split(job) -> tuple[str, str]:
    opts = getattr(job, "options", None) or {}
    action = (opts.get("action") or "merge").strip().lower()
    if action == "split":
        return "pages.zip", "application/zip"
    return "merged.pdf", "application/pdf"


def _validate_compress_pdf(
    scale: int,
    denoise_first: bool,
    face_enhance: bool,
    target_format: str | None,
    quality: str | None,
    options: dict | None,
) -> tuple[int, dict[str, Any]]:
    return 1, {
        "denoise_first": False,
        "face_enhance": False,
        "target_format": None,
        "quality": None,
        "options": options if options else {},
    }


def _download_info_compress_pdf(job) -> tuple[str, str]:
    base = _base_name(job)
    return f"{base}_compressed.pdf", "application/pdf"


def _validate_pdf_to_images(
    scale: int,
    denoise_first: bool,
    face_enhance: bool,
    target_format: str | None,
    quality: str | None,
    options: dict | None,
) -> tuple[int, dict[str, Any]]:
    opts = options or {}
    fmt = (opts.get("format") or "png").strip().lower()
    if fmt not in ("png", "jpeg", "jpg"):
        fmt = "png"
    return 1, {
        "denoise_first": False,
        "face_enhance": False,
        "target_format": None,
        "quality": None,
        "options": {"format": fmt},
    }


def _download_info_pdf_to_images(job) -> tuple[str, str]:
    return "pages.zip", "application/zip"


def _validate_pdf_metadata(
    scale: int,
    denoise_first: bool,
    face_enhance: bool,
    target_format: str | None,
    quality: str | None,
    options: dict | None,
) -> tuple[int, dict[str, Any]]:
    opts = options or {}
    strip = opts.get("strip") is True
    return 1, {
        "denoise_first": False,
        "face_enhance": False,
        "target_format": None,
        "quality": None,
        "options": {"strip": strip},
    }


def _download_info_pdf_metadata(job) -> tuple[str, str]:
    base = _base_name(job)
    return f"{base}_metadata.pdf", "application/pdf"


def _validate_pdf_rotate(
    scale: int,
    denoise_first: bool,
    face_enhance: bool,
    target_format: str | None,
    quality: str | None,
    options: dict | None,
) -> tuple[int, dict[str, Any]]:
    opts = options or {}
    rotation = int(opts.get("rotation") or 90)
    if rotation not in (90, -90, 180, 270):
        rotation = 90
    pages = opts.get("pages")
    return 1, {
        "denoise_first": False,
        "face_enhance": False,
        "target_format": None,
        "quality": None,
        "options": {"rotation": rotation, "pages": pages},
    }


def _download_info_pdf_rotate(job) -> tuple[str, str]:
    base = _base_name(job)
    return f"{base}_rotated.pdf", "application/pdf"


def _validate_pdf_reorder(
    scale: int,
    denoise_first: bool,
    face_enhance: bool,
    target_format: str | None,
    quality: str | None,
    options: dict | None,
) -> tuple[int, dict[str, Any]]:
    opts = options or {}
    order = opts.get("page_order")
    if not order or not isinstance(order, list):
        raise HTTPException(400, detail="page_order must be a list of 1-based page numbers")
    return 1, {
        "denoise_first": False,
        "face_enhance": False,
        "target_format": None,
        "quality": None,
        "options": {"page_order": order},
    }


def _download_info_pdf_reorder(job) -> tuple[str, str]:
    base = _base_name(job)
    return f"{base}_reordered.pdf", "application/pdf"


def _validate_pdf_unlock(
    scale: int,
    denoise_first: bool,
    face_enhance: bool,
    target_format: str | None,
    quality: str | None,
    options: dict | None,
) -> tuple[int, dict[str, Any]]:
    opts = options or {}
    password = opts.get("password")
    if password is None or (isinstance(password, str) and not password.strip()):
        raise HTTPException(400, detail="password is required for PDF unlock")
    return 1, {
        "denoise_first": False,
        "face_enhance": False,
        "target_format": None,
        "quality": None,
        "options": {"password": password if isinstance(password, str) else str(password)},
    }


def _download_info_pdf_unlock(job) -> tuple[str, str]:
    base = _base_name(job)
    return f"{base}_unlocked.pdf", "application/pdf"


def _validate_pdf_protect(
    scale: int,
    denoise_first: bool,
    face_enhance: bool,
    target_format: str | None,
    quality: str | None,
    options: dict | None,
) -> tuple[int, dict[str, Any]]:
    opts = options or {}
    user_password = opts.get("user_password")
    if user_password is None or (isinstance(user_password, str) and not user_password.strip()):
        raise HTTPException(400, detail="user_password is required for PDF protect")
    owner_password = opts.get("owner_password")
    if owner_password is not None and isinstance(owner_password, str) and not owner_password.strip():
        owner_password = None
    return 1, {
        "denoise_first": False,
        "face_enhance": False,
        "target_format": None,
        "quality": None,
        "options": {
            "user_password": user_password if isinstance(user_password, str) else str(user_password),
            "owner_password": owner_password if owner_password is None else str(owner_password),
        },
    }


def _download_info_pdf_protect(job) -> tuple[str, str]:
    base = _base_name(job)
    return f"{base}_protected.pdf", "application/pdf"


def _validate_pdf_remove_pages(
    scale: int,
    denoise_first: bool,
    face_enhance: bool,
    target_format: str | None,
    quality: str | None,
    options: dict | None,
) -> tuple[int, dict[str, Any]]:
    opts = options or {}
    pages_to_remove = opts.get("pages_to_remove")
    if not pages_to_remove or not isinstance(pages_to_remove, list):
        raise HTTPException(400, detail="pages_to_remove must be a list of 1-based page numbers")
    try:
        normalized = [int(p) for p in pages_to_remove if p is not None]
    except (TypeError, ValueError):
        raise HTTPException(400, detail="pages_to_remove must contain integers")
    if any(p < 1 for p in normalized):
        raise HTTPException(400, detail="page numbers must be >= 1")
    return 1, {
        "denoise_first": False,
        "face_enhance": False,
        "target_format": None,
        "quality": None,
        "options": {"pages_to_remove": normalized},
    }


def _download_info_pdf_remove_pages(job) -> tuple[str, str]:
    base = _base_name(job)
    return f"{base}_removed.pdf", "application/pdf"


def _validate_pdf_extract_images(
    scale: int,
    denoise_first: bool,
    face_enhance: bool,
    target_format: str | None,
    quality: str | None,
    options: dict | None,
) -> tuple[int, dict[str, Any]]:
    return 1, {
        "denoise_first": False,
        "face_enhance": False,
        "target_format": None,
        "quality": None,
        "options": options if options else {},
    }


def _download_info_pdf_extract_images(job) -> tuple[str, str]:
    return "images.zip", "application/zip"


def _validate_heic_to_jpg(
    scale: int,
    denoise_first: bool,
    face_enhance: bool,
    target_format: str | None,
    quality: str | None,
    options: dict | None,
) -> tuple[int, dict[str, Any]]:
    return 1, {
        "denoise_first": False,
        "face_enhance": False,
        "target_format": None,
        "quality": None,
        "options": options if options else {},
    }


def _download_info_heic_to_jpg(job) -> tuple[str, str]:
    base = _base_name(job)
    return f"{base}.jpg", "image/jpeg"


def _validate_svg_to_png(
    scale: int,
    denoise_first: bool,
    face_enhance: bool,
    target_format: str | None,
    quality: str | None,
    options: dict | None,
) -> tuple[int, dict[str, Any]]:
    return 1, {
        "denoise_first": False,
        "face_enhance": False,
        "target_format": None,
        "quality": None,
        "options": options if options else {},
    }


def _download_info_svg_to_png(job) -> tuple[str, str]:
    base = _base_name(job)
    return f"{base}.png", "image/png"


def _validate_favicon(
    scale: int,
    denoise_first: bool,
    face_enhance: bool,
    target_format: str | None,
    quality: str | None,
    options: dict | None,
) -> tuple[int, dict[str, Any]]:
    return 1, {
        "denoise_first": False,
        "face_enhance": False,
        "target_format": None,
        "quality": None,
        "options": options if options else {},
    }


def _download_info_favicon(job) -> tuple[str, str]:
    return "favicon.ico", "image/x-icon"


def _validate_ocr(
    scale: int,
    denoise_first: bool,
    face_enhance: bool,
    target_format: str | None,
    quality: str | None,
    options: dict | None,
) -> tuple[int, dict[str, Any]]:
    return 1, {
        "denoise_first": False,
        "face_enhance": False,
        "target_format": None,
        "quality": None,
        "options": options or {},
    }


def _download_info_ocr(job) -> tuple[str, str]:
    base = _base_name(job)
    return f"{base}.txt", "text/plain; charset=utf-8"


# Registry: method -> (validate_fn, download_info_fn)
METHOD_HANDLERS: dict[str, tuple[Any, Any]] = {
    "real_esrgan": (_validate_upscale, _download_info_upscale),
    "swinir": (_validate_upscale, _download_info_upscale),
    "esrgan": (_validate_upscale, _download_info_upscale),
    "real_esrgan_anime": (_validate_upscale, _download_info_upscale),
    "background_remove": (_validate_background_remove, _download_info_background_remove),
    "convert": (_validate_convert, _download_info_convert),
    "compress": (_validate_compress, _download_info_compress),
    "restore": (_validate_restore, _download_info_restore),
    "object_remove": (_validate_object_remove, _download_info_object_remove),
    "deblur": (_validate_deblur, _download_info_deblur),
    "document_enhance": (_validate_document_enhance, _download_info_document_enhance),
    "ai_denoise": (_validate_ai_denoise, _download_info_ai_denoise),
    "upscale_print": (_validate_upscale_print, _download_info_upscale_print),
    "outpaint": (_validate_outpaint, _download_info_outpaint),
    "background_replace": (_validate_background_replace, _download_info_background_replace),
    "hdr_merge": (_validate_hdr_merge, _download_info_hdr_merge),
    "tone_map": (_validate_tone_map, _download_info_tone_map),
    "resize": (_validate_resize, _download_info_resize),
    "rotate_flip": (_validate_rotate_flip, _download_info_rotate_flip),
    "crop": (_validate_crop, _download_info_crop),
    "strip_metadata": (_validate_strip_metadata, _download_info_strip_metadata),
    "denoise": (_validate_denoise, _download_info_denoise),
    "blur_sharpen": (_validate_blur_sharpen, _download_info_blur_sharpen),
    "brightness_contrast": (_validate_brightness_contrast, _download_info_brightness_contrast),
    "watermark": (_validate_watermark, _download_info_watermark),
    "rename": (_validate_rename, _download_info_rename),
    "auto_levels": (_validate_auto_levels, _download_info_auto_levels),
    "saturation": (_validate_saturation, _download_info_saturation),
    "color_balance": (_validate_color_balance, _download_info_color_balance),
    "filters": (_validate_filters, _download_info_filters),
    "border": (_validate_border, _download_info_border),
    "collage": (_validate_collage, _download_info_collage),
    "image_to_pdf": (_validate_image_to_pdf, _download_info_image_to_pdf),
    "vignette": (_validate_vignette, _download_info_vignette),
    "tilt_shift": (_validate_tilt_shift, _download_info_tilt_shift),
    "pixelate": (_validate_pixelate, _download_info_pixelate),
    "smart_crop": (_validate_smart_crop, _download_info_smart_crop),
    "background_blur": (_validate_background_blur, _download_info_background_blur),
    "inpaint": (_validate_inpaint, _download_info_inpaint),
    "pdf_merge_split": (_validate_pdf_merge_split, _download_info_pdf_merge_split),
    "compress_pdf": (_validate_compress_pdf, _download_info_compress_pdf),
    "pdf_to_images": (_validate_pdf_to_images, _download_info_pdf_to_images),
    "pdf_metadata": (_validate_pdf_metadata, _download_info_pdf_metadata),
    "pdf_rotate": (_validate_pdf_rotate, _download_info_pdf_rotate),
    "pdf_reorder": (_validate_pdf_reorder, _download_info_pdf_reorder),
    "pdf_unlock": (_validate_pdf_unlock, _download_info_pdf_unlock),
    "pdf_protect": (_validate_pdf_protect, _download_info_pdf_protect),
    "pdf_remove_pages": (_validate_pdf_remove_pages, _download_info_pdf_remove_pages),
    "pdf_extract_images": (_validate_pdf_extract_images, _download_info_pdf_extract_images),
    "heic_to_jpg": (_validate_heic_to_jpg, _download_info_heic_to_jpg),
    "svg_to_png": (_validate_svg_to_png, _download_info_svg_to_png),
    "favicon": (_validate_favicon, _download_info_favicon),
    "ocr": (_validate_ocr, _download_info_ocr),
}

ALLOWED_METHODS = tuple(METHOD_HANDLERS.keys())


def validate_upload(
    method: str,
    scale: int,
    denoise_first: bool,
    face_enhance: bool,
    target_format: str | None,
    quality: str | None,
    options: dict | None,
) -> tuple[int, dict[str, Any]]:
    if method not in METHOD_HANDLERS:
        raise HTTPException(400, detail=f"method must be one of: {', '.join(ALLOWED_METHODS)}")
    validate_fn, _ = METHOD_HANDLERS[method]
    return validate_fn(scale, denoise_first, face_enhance, target_format, quality, options)


def get_download_info(job) -> tuple[str, str]:
    entry = METHOD_HANDLERS.get(job.method)
    download_info_fn = entry[1] if entry else _download_info_upscale
    return download_info_fn(job)


def parse_options_form(options_raw: str | None) -> dict | None:
    if options_raw is None or not options_raw.strip():
        return None
    try:
        data = json.loads(options_raw)
        return data if isinstance(data, dict) else None
    except json.JSONDecodeError:
        raise HTTPException(400, detail="options must be valid JSON object")
