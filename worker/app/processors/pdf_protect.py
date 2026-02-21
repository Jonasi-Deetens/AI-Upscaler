"""Add password protection to a PDF. job.options: user_password (required), owner_password (optional)."""
from pathlib import Path

from pypdf import PdfReader, PdfWriter


def run(job, input_path: Path, output_path: Path) -> None:
    opts = getattr(job, "options", None) or {}
    user_password = opts.get("user_password") or ""
    owner_password = opts.get("owner_password") or ""

    reader = PdfReader(str(input_path))
    writer = PdfWriter()
    for page in reader.pages:
        writer.add_page(page)

    writer.encrypt(user_password, owner_password, algorithm="AES-256")

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "wb") as f:
        writer.write(f)
