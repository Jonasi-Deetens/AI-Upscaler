"""Restore and colorize: face/photo restoration (GFPGAN) then optional colorization.

Single responsibility: read image from input_path, run restore (and colorize if available),
write result PNG to output_path. No DB or status updates.

Restore step uses GFPGAN (same as face_enhance). Colorization (e.g. DeOldify) can be
integrated later for B&W → color; until then output is restored only.
"""
from pathlib import Path

import cv2


def run(input_path: Path, output_path: Path) -> None:
    """Restore image (GFPGAN); optionally colorize if a colorizer is available."""
    try:
        from gfpgan import GFPGANer
        from basicsr.utils.download_util import load_file_from_url
    except ImportError as e:
        raise RuntimeError(
            "GFPGAN not installed. Add gfpgan to worker requirements and rebuild."
        ) from e

    weights_dir = Path(__file__).resolve().parent.parent.parent / "weights"
    weights_dir.mkdir(parents=True, exist_ok=True)
    model_path = weights_dir / "GFPGANv1.4.pth"
    if not model_path.is_file():
        load_file_from_url(
            url="https://github.com/TencentARC/GFPGAN/releases/download/v1.3.0/GFPGANv1.4.pth",
            model_dir=str(weights_dir),
            progress=True,
            file_name="GFPGANv1.4.pth",
        )

    restorer = GFPGANer(model_path=str(model_path), upscale=1, arch="clean", channel_multiplier=2)
    img = cv2.imread(str(input_path), cv2.IMREAD_COLOR)
    if img is None:
        raise RuntimeError(f"Failed to read image: {input_path}")

    _, _, restored = restorer.enhance(img, has_aligned=False, only_center_face=False, paste_back=True)

    work_dir = input_path.parent
    step_restored = work_dir / "restored_step.png"
    output_path.parent.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(str(step_restored), restored)

    # Optional colorization: if DeOldify (or another colorizer) is available, run it.
    # Until then we output the restored image only.
    try:
        _colorize(step_restored, output_path)
    except Exception:
        # No colorizer or colorization failed; use restored result as final output
        import shutil
        shutil.copy2(step_restored, output_path)


def _colorize(input_path: Path, output_path: Path) -> None:
    """Run colorization on image if deoldify is available. Raises if not installed or on failure."""
    # DeOldify uses fastai and requires weights; optional for now.
    try:
        from deoldify.visualize import get_image_colorizer
    except ImportError:
        raise RuntimeError("DeOldify not installed; skipping colorization") from None

    root_folder = Path(__file__).resolve().parent.parent.parent / "weights" / "DeOldify"
    root_folder.mkdir(parents=True, exist_ok=True)
    colorizer = get_image_colorizer(root_folder=root_folder, render_factor=35, artistic=True)
    result = colorizer.get_transformed_image(
        str(input_path), render_factor=35, post_process=True, watermarked=False
    )
    result.save(str(output_path))
