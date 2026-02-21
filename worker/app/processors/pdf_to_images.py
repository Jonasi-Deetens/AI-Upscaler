"""Extract each PDF page as PNG or JPEG; output a ZIP of images. Uses PyMuPDF. job.options: format 'png' | 'jpeg'."""
import zipfile
from pathlib import Path

from PIL import Image
import fitz


def run(job, input_path: Path, output_path: Path) -> None:
    opts = getattr(job, "options", None) or {}
    fmt = (opts.get("format") or "png").strip().lower()
    if fmt not in ("png", "jpeg", "jpg"):
        fmt = "png"
    if fmt == "jpg":
        fmt = "jpeg"

    doc = fitz.open(str(input_path))
    work_dir = output_path.parent
    output_path.parent.mkdir(parents=True, exist_ok=True)

    with zipfile.ZipFile(output_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for i in range(len(doc)):
            page = doc[i]
            pix = page.get_pixmap(dpi=150, alpha=(fmt == "png"))
            if hasattr(pix, "pil_image"):
                img = pix.pil_image()
            else:
                mode = "RGBA" if (fmt == "png" and getattr(pix, "n", 3) == 4) else "RGB"
                img = Image.frombytes(mode, (pix.width, pix.height), pix.samples)
            ext = ".png" if fmt == "png" else ".jpg"
            name = f"page_{i + 1:04d}{ext}"
            buf = work_dir / name
            img.save(str(buf), format=fmt.upper() if fmt != "jpeg" else "JPEG", quality=90 if fmt == "jpeg" else None)
            zf.write(buf, name)
            buf.unlink(missing_ok=True)
    doc.close()
