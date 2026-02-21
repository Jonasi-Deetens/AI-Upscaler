"""Rotate selected PDF pages by 90° (cw or ccw). job.options: rotation 90 | -90 | 180; pages optional 1-based list or 'all'."""
from pathlib import Path

from pypdf import PdfReader, PdfWriter


def run(job, input_path: Path, output_path: Path) -> None:
    opts = getattr(job, "options", None) or {}
    rotation = int(opts.get("rotation") or 90)
    if rotation not in (90, -90, 180, 270):
        rotation = 90
    if rotation == 270:
        rotation = -90

    pages_opt = opts.get("pages")
    if pages_opt == "all" or pages_opt is None:
        page_indices = None
    elif isinstance(pages_opt, list):
        page_indices = [int(p) - 1 for p in pages_opt if isinstance(p, (int, float)) or (isinstance(p, str) and p.isdigit())]
    else:
        page_indices = None

    reader = PdfReader(str(input_path))
    writer = PdfWriter()
    n = len(reader.pages)

    for i in range(n):
        page = reader.pages[i]
        if page_indices is None or i in page_indices:
            page = page.rotate(rotation)  # pypdf: degrees clockwise
        writer.add_page(page)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "wb") as f:
        writer.write(f)
