#!/usr/bin/env python3
"""
Download model weights for the upscaler worker. Run once after cloning the repo.

Uses only the Python standard library so it works without installing worker deps.
Run from repo root: python worker/scripts/download_weights.py
Or from worker dir:  python scripts/download_weights.py

Optional: set HF_TOKEN for Hugging Face downloads if you get 401 Unauthorized.
"""
from pathlib import Path
import os
import sys
import urllib.request

# Repo root: script lives in worker/scripts/, so worker = script.parent.parent, repo = worker.parent
SCRIPT_DIR = Path(__file__).resolve().parent
WORKER_DIR = SCRIPT_DIR.parent
REPO_ROOT = WORKER_DIR.parent

WEIGHTS_DIR = WORKER_DIR / "weights"
GFPGAN_WEIGHTS_DIR = WORKER_DIR / "gfpgan" / "weights"

# (url, destination path relative to repo root)
DOWNLOADS = [
    # worker/weights/ – Real-ESRGAN & ESRGAN
    (
        "https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/RealESRGAN_x4plus.pth",
        WEIGHTS_DIR / "RealESRGAN_x4plus.pth",
    ),
    (
        "https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.1/RealESRGAN_x2plus.pth",
        WEIGHTS_DIR / "RealESRGAN_x2plus.pth",
    ),
    (
        "https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.2.4/RealESRGAN_x4plus_anime_6B.pth",
        WEIGHTS_DIR / "RealESRGAN_x4plus_anime_6B.pth",
    ),
    (
        "https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.1/ESRGAN_SRx4_DF2KOST_official-ff704c30.pth",
        WEIGHTS_DIR / "ESRGAN_x4.pth",
    ),
    (
        "https://github.com/TencentARC/GFPGAN/releases/download/v1.3.0/GFPGANv1.4.pth",
        WEIGHTS_DIR / "GFPGANv1.4.pth",
    ),
    # worker/gfpgan/weights/ – face detection & parsing (used by GFPGAN)
    (
        "https://huggingface.co/TencentARC/GFPGAN/resolve/main/weights/detection_Resnet50_Final.pth",
        GFPGAN_WEIGHTS_DIR / "detection_Resnet50_Final.pth",
    ),
    (
        "https://huggingface.co/TencentARC/GFPGAN/resolve/main/weights/parsing_parsenet.pth",
        GFPGAN_WEIGHTS_DIR / "parsing_parsenet.pth",
    ),
]


def download(url: str, path: Path, skip_existing: bool = True) -> bool:
    """Download url to path. Return True if downloaded, False if skipped or failed."""
    path = path.resolve()
    if skip_existing and path.is_file():
        print(f"  skip (exists): {path.name}")
        return False
    path.parent.mkdir(parents=True, exist_ok=True)
    print(f"  download: {path.name} ...", end=" ", flush=True)
    headers = {"User-Agent": "AI-Upscaler/1.0"}
    if "huggingface.co" in url:
        token = os.environ.get("HF_TOKEN") or os.environ.get("HUGGING_FACE_HUB_TOKEN")
        if token:
            headers["Authorization"] = f"Bearer {token}"
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=120) as resp:
            path.write_bytes(resp.read())
        print("ok")
        return True
    except Exception as e:
        print(f"FAILED: {e}")
        print(f"    (optional: set HF_TOKEN for Hugging Face if 401)")
        return False


def main() -> int:
    print("Downloading worker model weights into worker/weights and worker/gfpgan/weights")
    ok = 0
    for url, path in DOWNLOADS:
        if download(url, path):
            ok += 1
    if ok == 0 and not any(p.resolve().is_file() for _, p in DOWNLOADS):
        print("No weights downloaded. Check network or set HF_TOKEN for Hugging Face.")
        return 1
    print("Done.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
