"""Merge multiple PDFs into one, or split one PDF into per-page PDFs in a ZIP. Uses job.options: action 'merge' | 'split'."""
import zipfile
from pathlib import Path

from pypdf import PdfReader, PdfWriter


def run(job, input_path: Path, output_path: Path) -> None:
    opts = getattr(job, "options", None) or {}
    action = (opts.get("action") or "merge").strip().lower()

    paths = sorted(
        [p for p in input_path.iterdir() if p.is_file()],
        key=lambda p: int(p.name) if p.name.isdigit() else 0,
    )

    if action == "merge":
        if not paths:
            raise ValueError("No PDF files to merge")
        writer = PdfWriter()
        for p in paths:
            reader = PdfReader(str(p))
            for page in reader.pages:
                writer.add_page(page)
        with open(output_path, "wb") as f:
            writer.write(f)
        return

    if action == "split":
        if len(paths) != 1:
            raise ValueError("Split requires exactly one PDF file")
        reader = PdfReader(str(paths[0]))
        output_path.parent.mkdir(parents=True, exist_ok=True)
        with zipfile.ZipFile(output_path, "w", zipfile.ZIP_DEFLATED) as zf:
            for i, page in enumerate(reader.pages):
                writer = PdfWriter()
                writer.add_page(page)
                name = f"page_{i + 1}.pdf"
                buf = Path(output_path.parent) / name
                with open(buf, "wb") as f:
                    writer.write(f)
                zf.write(buf, name)
                buf.unlink()
        return

    raise ValueError("action must be 'merge' or 'split'")
