"""Remove password from a PDF. job.options: password (required)."""
from pathlib import Path

from pypdf import PdfReader, PdfWriter


def run(job, input_path: Path, output_path: Path) -> None:
    opts = getattr(job, "options", None) or {}
    password = opts.get("password")
    if not password:
        raise ValueError("password is required for PDF unlock")

    reader = PdfReader(str(input_path))
    try:
        reader.decrypt(password)
    except Exception as e:
        raise ValueError("Wrong password or PDF could not be decrypted") from e

    writer = PdfWriter()
    for page in reader.pages:
        writer.add_page(page)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "wb") as f:
        writer.write(f)
