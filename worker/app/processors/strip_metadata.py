"""Remove EXIF and other metadata from image. Outputs PNG without metadata."""
from pathlib import Path

from PIL import Image


def run(job, input_path: Path, output_path: Path) -> None:
    img = Image.open(input_path)
    img.load()
    # Convert to RGB or RGBA so we write a clean image without EXIF
    if img.mode in ("P", "LA"):
        img = img.convert("RGBA")
    elif img.mode not in ("RGB", "RGBA"):
        img = img.convert("RGB")
    output_path.parent.mkdir(parents=True, exist_ok=True)
    img.save(output_path, format="PNG")
