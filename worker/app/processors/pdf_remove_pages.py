"""Remove specified pages from a PDF. job.options: pages_to_remove (1-based list e.g. [2, 5, 7])."""
from pathlib import Path

from pypdf import PdfReader, PdfWriter


def run(job, input_path: Path, output_path: Path) -> None:
    opts = getattr(job, "options", None) or {}
    to_remove = opts.get("pages_to_remove")
    if not to_remove or not isinstance(to_remove, list):
        raise ValueError("pages_to_remove must be a list of 1-based page numbers")

    remove_set = set(int(p) for p in to_remove if p is not None and (isinstance(p, (int, float)) or (isinstance(p, str) and p.isdigit())))
    reader = PdfReader(str(input_path))
    n = len(reader.pages)
    indices_to_keep = [i for i in range(n) if (i + 1) not in remove_set]
    if not indices_to_keep:
        raise ValueError("At least one page must remain; cannot remove all pages")

    writer = PdfWriter()
    for i in indices_to_keep:
        writer.add_page(reader.pages[i])

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "wb") as f:
        writer.write(f)
