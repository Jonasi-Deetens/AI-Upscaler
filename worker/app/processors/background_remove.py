"""Remove background (rembg). Produces PNG with alpha."""
import io
from pathlib import Path

from PIL import Image


def run(input_path: Path, output_path: Path) -> None:
    """Remove background; write RGBA PNG to output_path."""
    try:
        from rembg import remove
    except ImportError as e:
        raise RuntimeError(
            "rembg not installed. Add rembg to worker requirements and rebuild."
        ) from e

    with open(input_path, "rb") as f:
        data = f.read()
    out_data = remove(data)
    img = Image.open(io.BytesIO(out_data))
    output_path.parent.mkdir(parents=True, exist_ok=True)
    img.save(output_path, "PNG")
