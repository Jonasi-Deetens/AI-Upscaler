"""Replace background: subject (0) + background image (1). Segment subject with rembg, composite onto background."""
import io
from pathlib import Path

from PIL import Image


def run(job, input_path: Path, output_path: Path) -> None:
    """Composite subject (rembg) onto background image. input_path is dir with 0=subject, 1=background."""
    try:
        from rembg import remove
    except ImportError as e:
        raise RuntimeError(
            "rembg not installed. Add rembg to worker requirements and rebuild."
        ) from e

    paths = sorted(
        [p for p in input_path.iterdir() if p.is_file()],
        key=lambda p: int(p.name) if p.name.isdigit() else 0,
    )
    if len(paths) < 2:
        raise ValueError("background_replace requires subject and background (2 files)")
    subject_path, bg_path = paths[0], paths[1]

    with open(subject_path, "rb") as f:
        subject_data = f.read()
    out_data = remove(subject_data)
    subject = Image.open(io.BytesIO(out_data))
    subject = subject.convert("RGBA")

    background = Image.open(bg_path)
    background = background.convert("RGB")
    bw, bh = background.size
    sw, sh = subject.size

    scale = min(bw / sw, bh / sh, 1.0)
    if scale < 1.0:
        nw, nh = int(sw * scale), int(sh * scale)
        subject = subject.resize((nw, nh), Image.Resampling.LANCZOS)
        sw, sh = nw, nh

    x = (bw - sw) // 2
    y = (bh - sh) // 2

    canvas = Image.new("RGB", (bw, bh))
    canvas.paste(background, (0, 0))
    canvas.paste(subject, (x, y), subject)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(output_path, format="PNG")
