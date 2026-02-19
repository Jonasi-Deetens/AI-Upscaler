"""Portrait mode: remove background, blur original, composite subject on blurred BG. Uses job.options: blur_radius."""
from pathlib import Path

from PIL import Image, ImageFilter

from app.processors import background_remove


def run(job, input_path: Path, output_path: Path) -> None:
    opts = getattr(job, "options", None) or {}
    blur_radius = int(opts.get("blur_radius", 25))

    img = Image.open(input_path)
    img.load()
    if img.mode != "RGB":
        rgb = img.convert("RGB")
    else:
        rgb = img

    work_dir = input_path.parent
    rgba_path = work_dir / "portrait_rgba.png"
    background_remove.run(input_path, rgba_path)
    subject = Image.open(rgba_path)
    subject.load()
    if subject.mode != "RGBA":
        subject = subject.convert("RGBA")
    alpha = subject.split()[3]

    blurred_bg = rgb.filter(ImageFilter.GaussianBlur(radius=blur_radius))
    subject_rgb = subject.convert("RGB")
    # Composite: subject where alpha is opaque, blurred where transparent
    out = Image.composite(subject_rgb, blurred_bg, alpha)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    out.save(output_path, format="PNG")
