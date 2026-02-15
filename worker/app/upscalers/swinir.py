"""
SwinIR upscaler: runs official SwinIR main_test_swinir.py via subprocess.
Requires SwinIR repo at SWINIR_DIR (e.g. /app/SwinIR) with model downloaded.
"""
import os
import shutil
import subprocess
from pathlib import Path

SWINIR_DIR = Path(os.environ.get("SWINIR_DIR", "/app/SwinIR"))
REAL_SR_MODEL = "003_realSR_BSRGAN_DFO_s64w8_SwinIR-M_x4_GAN.pth"
MODEL_ZOO = SWINIR_DIR / "model_zoo" / "swinir"


def upscale(
    input_path: Path,
    output_path: Path,
    scale: int,
    tile: int | None = 256,
) -> None:
    if scale not in (2, 4):
        raise ValueError("scale must be 2 or 4")
    if not SWINIR_DIR.is_dir():
        raise RuntimeError(f"SwinIR repo not found at {SWINIR_DIR}")

    model_path = MODEL_ZOO / REAL_SR_MODEL
    if not model_path.is_file():
        raise FileNotFoundError(f"SwinIR model not found: {model_path}")

    # real_sr uses x4 model; for 2x we run 4x then downscale below
    run_scale = 4
    folder_lq = input_path.parent
    # Ensure input has a simple name for output lookup
    input_name = input_path.stem

    args = [
        "python",
        str(SWINIR_DIR / "main_test_swinir.py"),
        "--task",
        "real_sr",
        "--scale",
        str(run_scale),
        "--folder_lq",
        str(folder_lq),
        "--model_path",
        str(model_path),
    ]
    if tile:
        args.extend(["--tile", str(tile)])

    result = subprocess.run(
        args,
        cwd=str(SWINIR_DIR),
        capture_output=True,
        text=True,
        timeout=600,
    )
    if result.returncode != 0:
        raise RuntimeError(
            f"SwinIR failed: {result.stderr or result.stdout or 'unknown'}"
        )

    # Output: results/swinir_real_sr_x4/{imgname}_SwinIR.png
    save_dir = SWINIR_DIR / "results" / f"swinir_real_sr_x{run_scale}"
    out_file = save_dir / f"{input_name}_SwinIR.png"
    if not out_file.is_file():
        raise RuntimeError(f"SwinIR did not produce {out_file}")

    output_path.parent.mkdir(parents=True, exist_ok=True)
    if scale == 2 and run_scale == 4:
        # Downscale 4x -> 2x
        import cv2

        img = cv2.imread(str(out_file))
        h, w = img.shape[:2]
        half = cv2.resize(img, (w // 2, h // 2), interpolation=cv2.INTER_AREA)
        cv2.imwrite(str(output_path), half)
    else:
        shutil.copy2(out_file, output_path)
