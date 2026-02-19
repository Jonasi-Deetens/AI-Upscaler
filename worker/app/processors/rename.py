"""Pass-through: copy image to output as PNG. Filename is determined by backend get_download_info."""
from pathlib import Path

from PIL import Image


def run(job, input_path: Path, output_path: Path) -> None:
    img = Image.open(input_path)
    img.load()
    if img.mode not in ("RGB", "RGBA"):
        img = img.convert("RGBA" if img.mode in ("P", "LA") else "RGB")
    output_path.parent.mkdir(parents=True, exist_ok=True)
    img.save(output_path, format="PNG")
