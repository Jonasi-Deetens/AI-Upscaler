"""Reorder PDF pages. job.options: page_order 1-based list e.g. [3, 1, 2]."""
from pathlib import Path

from pypdf import PdfReader, PdfWriter


def run(job, input_path: Path, output_path: Path) -> None:
    opts = getattr(job, "options", None) or {}
    order = opts.get("page_order")
    if not order or not isinstance(order, list):
        raise ValueError("page_order must be a list of 1-based page numbers")

    reader = PdfReader(str(input_path))
    n = len(reader.pages)
    indices = []
    for p in order:
        i = int(p) - 1 if isinstance(p, (int, float)) else (int(p) - 1 if isinstance(p, str) and p.isdigit() else -1)
        if 0 <= i < n:
            indices.append(i)

    if len(indices) != n:
        raise ValueError("page_order must contain each page exactly once (1-based)")

    writer = PdfWriter()
    for i in indices:
        writer.add_page(reader.pages[i])

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "wb") as f:
        writer.write(f)
