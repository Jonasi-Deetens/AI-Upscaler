"""OCR: extract text from image(s) or PDF. Uses Tesseract; PDF pages rendered with PyMuPDF."""
from pathlib import Path

import pytesseract
from PIL import Image

# Optional: PyMuPDF for PDF → images (fitz)
try:
    import fitz
except ImportError:
    fitz = None


def _ocr_image(image_path: Path) -> str:
    img = Image.open(image_path)
    if img.mode != "RGB":
        img = img.convert("RGB")
    return pytesseract.image_to_string(img) or ""


def _ocr_pdf(input_path: Path) -> str:
    if fitz is None:
        raise RuntimeError("OCR for PDF requires PyMuPDF (pip install pymupdf)")
    doc = fitz.open(input_path)
    parts = []
    try:
        for i in range(len(doc)):
            page = doc[i]
            pix = page.get_pixmap(dpi=150)
            if hasattr(pix, "pil_image"):
                img = pix.pil_image()
            else:
                mode = "RGB" if getattr(pix, "n", 3) == 3 else "RGBA"
                img = Image.frombytes(mode, (pix.width, pix.height), pix.samples)
            if img.mode != "RGB":
                img = img.convert("RGB")
            text = pytesseract.image_to_string(img) or ""
            if text.strip():
                parts.append(text)
    finally:
        doc.close()
    return "\n\n".join(parts)


def run(job, input_path: Path, output_path: Path) -> None:
    data = input_path.read_bytes()
    is_pdf = data.startswith(b"%PDF")
    if is_pdf:
        text = _ocr_pdf(input_path)
    else:
        text = _ocr_image(input_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(text, encoding="utf-8")
