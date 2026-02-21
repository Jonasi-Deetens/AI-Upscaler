"""Extract all embedded images from a PDF into a ZIP. Uses PyMuPDF page.get_images() + doc.extract_image()."""
import zipfile
from pathlib import Path

import fitz


def run(job, input_path: Path, output_path: Path) -> None:
    doc = fitz.open(str(input_path))
    output_path.parent.mkdir(parents=True, exist_ok=True)
    seen_xrefs: set[int] = set()
    index = 0

    with zipfile.ZipFile(output_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for page_num in range(len(doc)):
            page = doc[page_num]
            for img in page.get_images():
                xref = img[0]
                if xref in seen_xrefs:
                    continue
                seen_xrefs.add(xref)
                try:
                    base = doc.extract_image(xref)
                    ext = base.get("ext", "png")
                    if ext.lower() not in ("png", "jpg", "jpeg", "gif", "bmp", "tiff"):
                        ext = "png"
                    name = f"image_{index + 1:04d}.{ext}"
                    zf.writestr(name, base["image"])
                    index += 1
                except Exception:
                    continue
    doc.close()
