"""Collage: N images from input_dir into one grid. Uses job.options: layout, grid_rows, grid_cols, spacing, background."""
from pathlib import Path

from PIL import Image


def _hex_to_rgb(hex_str: str) -> tuple[int, int, int]:
    hex_str = hex_str.lstrip("#")
    if len(hex_str) == 6:
        return (int(hex_str[0:2], 16), int(hex_str[2:4], 16), int(hex_str[4:6], 16))
    return (255, 255, 255)


def run(job, input_path: Path, output_path: Path) -> None:
    opts = getattr(job, "options", None) or {}
    rows = int(opts.get("grid_rows", 2))
    cols = int(opts.get("grid_cols", 2))
    spacing = int(opts.get("spacing", 10))
    background = _hex_to_rgb((opts.get("background") or "#ffffff").strip() or "#ffffff")

    # input_path is a directory with files 0, 1, 2, ...
    paths = sorted(
        [p for p in input_path.iterdir() if p.is_file()],
        key=lambda p: int(p.name) if p.name.isdigit() else 0,
    )
    if len(paths) < rows * cols:
        raise ValueError(f"Not enough images: got {len(paths)}, need {rows * cols}")

    images = []
    for p in paths[: rows * cols]:
        img = Image.open(p)
        img.load()
        if img.mode != "RGB":
            img = img.convert("RGB")
        images.append(img)

    cell_w = max(im.width for im in images)
    cell_h = max(im.height for im in images)
    out_w = cols * cell_w + (cols + 1) * spacing
    out_h = rows * cell_h + (rows + 1) * spacing

    out = Image.new("RGB", (out_w, out_h), background)
    for idx, img in enumerate(images):
        row = idx // cols
        col = idx % cols
        x = spacing + col * (cell_w + spacing)
        y = spacing + row * (cell_h + spacing)
        # Center image in cell if smaller
        px = x + (cell_w - img.width) // 2
        py = y + (cell_h - img.height) // 2
        out.paste(img, (px, py))

    output_path.parent.mkdir(parents=True, exist_ok=True)
    out.save(output_path, format="PNG")
