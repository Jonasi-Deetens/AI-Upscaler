"""Convert HEIC/HEIF to JPEG using Pillow with pillow-heif opener."""
from pathlib import Path

import pillow_heif
from PIL import Image

pillow_heif.register_heif_opener()


def run(job, input_path: Path, output_path: Path) -> None:
    img = Image.open(input_path)
    img.load()
    if img.mode not in ("RGB", "L"):
        img = img.convert("RGB")
    output_path.parent.mkdir(parents=True, exist_ok=True)
    img.save(output_path, format="JPEG", quality=90)
