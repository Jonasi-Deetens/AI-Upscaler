"""Format conversion: decode image, encode to target format with optional quality."""
from pathlib import Path

from PIL import Image


def run(
    input_path: Path,
    output_path: Path,
    target_format: str,
    quality: int | None = None,
) -> None:
    """
    Read image from input_path, encode to target_format, write to output_path.
    target_format: webp, png, or jpeg. quality: 1-100 for webp/jpeg; ignored for png.
    """
    img = Image.open(input_path)
    if img.mode in ("RGBA", "LA", "P") and target_format == "jpeg":
        img = img.convert("RGB")
    elif img.mode not in ("RGB", "RGBA") and target_format != "jpeg":
        img = img.convert("RGBA" if img.mode in ("RGBA", "LA", "P") else "RGB")

    output_path.parent.mkdir(parents=True, exist_ok=True)
    save_kw: dict = {}
    if target_format in ("webp", "jpeg") and quality is not None:
        save_kw["quality"] = quality
    if target_format == "jpeg":
        fmt = "JPEG"
    elif target_format == "webp":
        fmt = "WEBP"
    else:
        fmt = "PNG"

    img.save(output_path, format=fmt, **save_kw)
