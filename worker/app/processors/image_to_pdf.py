"""Combine N images from input_dir into one PDF. Uses job.options (e.g. _input_count)."""
from pathlib import Path

import img2pdf


def run(job, input_path: Path, output_path: Path) -> None:
    # input_path is a directory with files 0, 1, 2, ...
    paths = sorted(
        [p for p in input_path.iterdir() if p.is_file()],
        key=lambda p: int(p.name) if p.name.isdigit() else 0,
    )
    if not paths:
        raise ValueError("No images to convert to PDF")

    with open(output_path, "wb") as f:
        f.write(img2pdf.convert([str(p) for p in paths]))
