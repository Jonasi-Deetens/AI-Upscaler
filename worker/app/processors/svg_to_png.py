"""Convert SVG to PNG using cairosvg."""
from pathlib import Path

import cairosvg


def run(job, input_path: Path, output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    cairosvg.svg2png(url=str(input_path), write_to=str(output_path))
