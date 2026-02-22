"""AI deblur (motion deblur) via learned model. Single image in, deblurred image out."""
from pathlib import Path


def run(input_path: Path, output_path: Path) -> None:
    """Deblur image using NAFNet-based model; write result to output_path."""
    try:
        from neuro_deblur import DeblurModel
    except ImportError as e:
        raise RuntimeError(
            "neuro-deblur not installed. Add neuro-deblur to worker requirements and rebuild."
        ) from e

    import torch
    device = "cuda" if torch.cuda.is_available() else "cpu"
    model = DeblurModel(device=device)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    model.deblur_image(str(input_path), str(output_path))
