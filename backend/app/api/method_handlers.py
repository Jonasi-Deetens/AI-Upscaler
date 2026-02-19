"""
Per-method validation and download info. Single place per method (SRP).
Upload endpoint uses VALIDATORS and get_download_info; no if/elif in jobs.py.
"""
from __future__ import annotations

import json
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
    "resize": (_validate_resize, _download_info_resize),
    "rotate_flip": (_validate_rotate_flip, _download_info_rotate_flip),
    "crop": (_validate_crop, _download_info_crop),
    "strip_metadata": (_validate_strip_metadata, _download_info_strip_metadata),
    "denoise": (_validate_denoise, _download_info_denoise),
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
