"""Upscale image to print resolution: target physical size (mm) + DPI → pixel dimensions."""
from pathlib import Path

from PIL import Image

from app.config import settings
from app.upscalers import real_esrgan


def _mm_to_pixels(mm: float, dpi: int) -> int:
    return round(mm * dpi / 25.4)


def run(job, input_path: Path, output_path: Path) -> None:
    """Upscale image so it reaches target print dimensions (mm × dpi), then resize to exact pixels."""
    opts = getattr(job, "options", None) or {}
    width_mm = int(opts.get("width_mm", 210))
    height_mm = int(opts.get("height_mm", 297))
    dpi = int(opts.get("dpi", 300))

    target_w = _mm_to_pixels(width_mm, dpi)
    target_h = _mm_to_pixels(height_mm, dpi)

    img = Image.open(input_path)
    img.load()
    w, h = img.size
    scale_needed = max(target_w / w, target_h / h)

    work_dir = input_path.parent
    current_path = input_path
    current_scale = 1.0
    tile = settings.real_esrgan_tile

    while current_scale < scale_needed:
        step_out = work_dir / "print_step.png"
        if scale_needed / current_scale >= 4:
            scale_this = 4
        else:
            scale_this = 2
        real_esrgan.upscale(current_path, step_out, scale=scale_this, tile=tile)
        current_path = step_out
        current_scale *= scale_this

    img_final = Image.open(current_path)
    img_final.load()
    if img_final.mode != "RGB" and img_final.mode != "RGBA":
        img_final = img_final.convert("RGB")
    resized = img_final.resize((target_w, target_h), Image.Resampling.LANCZOS)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    resized.save(output_path, format="PNG")
