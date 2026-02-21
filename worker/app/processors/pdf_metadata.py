"""View or strip PDF metadata. job.options: strip true | false. If strip, writes PDF with metadata cleared."""
from pathlib import Path

from pypdf import PdfReader, PdfWriter


def run(job, input_path: Path, output_path: Path) -> None:
    opts = getattr(job, "options", None) or {}
    strip = opts.get("strip") is True

    reader = PdfReader(str(input_path))
    writer = PdfWriter()

    for page in reader.pages:
        writer.add_page(page)

    if strip:
        writer.add_metadata({})
    else:
        meta = reader.metadata
        if meta:
            writer.add_metadata(dict(meta))

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "wb") as f:
        writer.write(f)
