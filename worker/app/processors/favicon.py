"""Generate favicon.ico with 16x16, 32x32, 48x48 from an image."""
from pathlib import Path

from PIL import Image

SIZES = [(16, 16), (32, 32), (48, 48)]


def run(job, input_path: Path, output_path: Path) -> None:
    img = Image.open(input_path)
    img.load()
    if img.mode not in ("RGB", "RGBA"):
        img = img.convert("RGBA")
    output_path.parent.mkdir(parents=True, exist_ok=True)
    img.save(output_path, format="ICO", sizes=SIZES)
