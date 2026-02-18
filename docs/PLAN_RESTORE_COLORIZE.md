# Restore & colorize – implementation plan (quality-focused)

Add one hub tool **"Restore & colorize"** using the same job pipeline as upscale, remove-bg, and compress. Use the **best available models** for high-quality results.

---

## Model choice for quality

Use a **restore-then-colorize** pipeline so each step uses a dedicated, best-in-class model.

### 1. Restoration (repair / face restore)

- **Recommended: CodeFormer**  
  - Consistently ranks at or near the top for face restoration and severely degraded images.  
  - Transformer + learned codebook; **adjustable fidelity weight** to balance quality vs. identity preservation (reduce “waxy” look by blending with original).  
  - Python: `codeformer` (e.g. [sczhou/CodeFormer](https://github.com/sczhou/CodeFormer)).  
  - Weights: download from project releases into `worker/weights/` (or equivalent); document in `worker/scripts/` or in the processor like `face_enhance.py`.

- **Alternative (already in stack): GFPGAN v1.4**  
  - Already in [worker/requirements.txt](worker/requirements.txt). Strong identity preservation, good for moderate degradation.  
  - Use if you want to avoid adding CodeFormer at first; upgrade path is to add CodeFormer later and optionally make it configurable.

**Recommendation:** Add **CodeFormer** for the restore step when targeting “best quality.” Keep GFPGAN available for face_enhance (upscale pipeline); restore processor uses CodeFormer.

### 2. Colorization (B&W → color)

- **Recommended: DeOldify**  
  - Standard choice for photo/video colorization; good skin tones and reduced artifacts.  
  - Python: `deoldify` (e.g. [jantic/DeOldify](https://github.com/jantic/DeOldify); repo archived 2024 but code and weights still used).  
  - Two main models:  
    - **Artistic:** more vibrant, best visual quality; occasional artifacts.  
    - **Stable:** more conservative, fewer glitches.  
  - For “best quality” use **Artistic**; add a simple fallback or retry with Stable if you need to handle failures.  
  - Weights: typically downloaded on first run or via script; document path and version.

**Recommendation:** Use **DeOldify (Artistic)** as the default colorizer. Optional: expose “Stable” vs “Artistic” as a job option later if you want a quality/speed or safety toggle.

### 3. Pipeline order

In `worker/app/processors/restore.py`:

1. **Restore** (CodeFormer): repair and face restore from `input_path` → write to a temp file.  
2. **Colorize** (DeOldify): read that result, colorize → write to `output_path` (PNG).

So the processor has one responsibility (“restore and colorize”) but delegates to two specialized models in sequence. No DB or job status inside the processor; pipeline/task handle that.

### 4. Dependencies and weights

- **Backend/API:** No new dependencies.  
- **Worker:**  
  - Add to [worker/requirements.txt](worker/requirements.txt):  
    - `codeformer` (or install from GitHub if no PyPI package).  
    - `deoldify` (or install from GitHub; check for PyPI).  
  - Document and, if needed, script weight downloads (e.g. CodeFormer weights, DeOldify models) under `worker/weights/` or `worker/scripts/`, similar to [worker/app/processors/face_enhance.py](worker/app/processors/face_enhance.py) and [worker/scripts/download_weights.py](worker/scripts/download_weights.py).  
- **GPU:** CodeFormer and DeOldify both benefit from GPU. Document that the worker can run CPU but will be slower; existing GPU Dockerfile can be extended if needed.

---

## Implementation outline (unchanged from original plan)

- **Backend:** Add `"restore"` to `ALLOWED_METHODS`, enforce `scale=1`, add branch in `_result_download_name_and_media_type` for `{base}_restored.png` / `image/png`. Reuse existing upload, `create_jobs`, and enqueue.
- **Worker pipeline:** Add `METHOD_RESTORE`, branch in `run()` to `restore.run(job, input_path, output_path)` (or `input_path`, `output_path` only). Task allows `restore` and shows a clear status label.
- **Processor:** New `worker/app/processors/restore.py`: run CodeFormer (restore) then DeOldify (colorize), write PNG. Lazy imports and clear `RuntimeError` if deps missing. Single public `run()`; no DB/storage/status.
- **Frontend:** New `/restore` page (same pattern as remove-bg), layout with metadata, hub entry, icon, and nav link. Jobs and download flow unchanged.

This keeps the design DRY and SRP-compliant while using the best models available for quality.
