# AI Upscaler

Upscale images with AI using **Real-ESRGAN** or **SwinIR**. Built with Next.js (frontend), FastAPI (backend), and a Celery worker. Jobs are stored in Postgres, queued via Redis, and files live on local disk or S3-compatible storage.

---

## Stack

| Layer    | Tech |
|----------|------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS 4 |
| Backend  | FastAPI, Postgres (SQLAlchemy 2), Redis |
| Worker   | Celery, Real-ESRGAN, SwinIR (optional) |
| Storage  | Local filesystem or S3-compatible (e.g. MinIO/R2) |

---

## Quick start

```bash
cp .env.example .env
docker compose up --build
```

- **App**: http://localhost:3000  
- **API docs**: http://localhost:8000/docs  

Set `NEXT_PUBLIC_API_URL=http://localhost:8000` in `.env` so the browser can call the backend.

---

## Development mode (live reload)

To run with **mounted source** so code changes are reflected in the running containers without rebuilding:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

- **Frontend**: Next.js dev server (Turbopack) with hot reload; edits in `frontend/src` update in the browser immediately.
- **Backend**: Uvicorn with `--reload`; edits in `backend/app` reload the API.
- **Worker**: Code is mounted; restart the worker container to pick up Python/task changes:  
  `docker compose -f docker-compose.yml -f docker-compose.dev.yml restart worker`

The first time you bring up the dev stack, the frontend container runs `npm ci` to fill the `node_modules` volume. After you add or change dependencies (e.g. `npm install next-themes` on the host), restart the frontend so the entrypoint runs `npm ci` again: `docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build frontend`. If the module-not-found persists, remove the volume and recreate: `docker compose -f docker-compose.yml -f docker-compose.dev.yml down && docker volume rm ai-upscaler_frontend_node_modules 2>/dev/null; docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build`

---

## From upload to download: what happens and which files do it

End-to-end flow: **upload → validate → store → queue → process → result → status & download**. Each step below says what happens and which files are involved.

### High-level flow

```
User (browser)          Frontend (Next.js)        Backend (FastAPI)           Redis          Worker (Celery)
      |                         |                         |                    |                    |
      | 1. Select files,        |                         |                    |                    |
      |    scale & method       |                         |                    |                    |
      |------------------------>|                         |                    |                    |
      |                         | 2. POST /api/jobs/upload|                    |                    |
      |                         |------------------------->|                    |                    |
      |                         |                         | 3. Validate, save  |                    |
      |                         |                         |    files, create   |                    |
      |                         |                         |    job rows        |                    |
      |                         |                         | 4. enqueue task ---|------------------->|
      |                         |                         |                    |  5. upscale_task  |
      |                         |                         |                    |     runs          |
      |                         |                         |                    | 6. Download orig, |
      |                         |                         |                    |    run model,     |
      |                         |                         |                    |    upload result, |
      |                         |                         |                    |    update job     |
      |                         | 7. GET /api/jobs?ids=... |                    |                    |
      |                         |<-------------------------|                    |                    |
      | 8. Poll + show status   |                         |                    |                    |
      |<------------------------|                         |                    |                    |
      | 9. Click Download       |                         |                    |                    |
      |    GET /api/jobs/{id}/  |                         |                    |                    |
      |    download             |------------------------->| 10. stream file    |                    |
      |<---------------------------------------------------|                    |                    |
```

---

### Step 1: User selects files and options (frontend)

**What happens:** On `/upload`, the user picks images (drag/drop or file picker), scale (2× or 4×), and method (Standard = Real-ESRGAN, Detailed = SwinIR), then submits.

**Files involved:**

| File | Role |
|------|------|
| `frontend/src/app/upload/page.tsx` | Upload page: holds `files`, `scale`, `method`; on submit calls `uploadJobs()` and redirects to `/jobs?ids=...`. |
| `frontend/src/components/FileDropzone.tsx` | Handles drag/drop and file input; reports selected files to the page. |
| `frontend/src/components/ui/RadioGroup.tsx` | Reusable control for scale and method. |
| `frontend/src/lib/api.ts` | `uploadJobs(files, { scale, method })` builds `FormData` and `POST`s to `/api/jobs/upload`. |
| `frontend/src/lib/types.ts` | Types: `Job`, `UploadOptions`, `UpscaleMethod`. |

---

### Step 2: Backend receives the upload

**What happens:** FastAPI receives `POST /api/jobs/upload` with multipart form: `files[]`, `scale`, `method`.

**Files involved:**

| File | Role |
|------|------|
| `backend/app/main.py` | Mounts the jobs router and CORS; all `/api/jobs/*` go to the router. |
| `backend/app/api/jobs.py` | Defines `upload_jobs()`: reads `files`, `scale`, `method` from the request. |

---

### Step 3: Validate, store originals, create job rows

**What happens:** The upload handler checks limits (file count, size, megapixels), then for each valid file: create a job row in Postgres, then write the file to storage under `originals/{job_id}`.

**Files involved:**

| File | Role |
|------|------|
| `backend/app/api/jobs.py` | Validates: `len(files) <= max_files_per_batch`, each file size ≤ `max_mb_per_file`, and (via PIL) megapixels ≤ `max_megapixels`. Builds list of `(filename, UploadFile)` and calls `job_service.create_jobs()`. |
| `backend/app/core/config.py` | `Settings` (Pydantic): `max_files_per_batch`, `max_mb_per_file`, `max_megapixels`, `job_expiry_minutes`, storage options. |
| `backend/app/services/job_service.py` | `create_jobs(db, filenames, scale, method)`: creates one `Job` per filename (status `queued`, `original_key` set to `originals/{job.id}` after flush), commits, returns job list. |
| `backend/app/models/job.py` | SQLAlchemy `Job` model: `id`, `status`, `original_filename`, `original_key`, `result_key`, `scale`, `method`, `created_at`, `expires_at`, `error_message`. |
| `backend/app/core/database.py` | `get_db()` yields a DB session; used by the upload and other routes. |
| `backend/app/core/storage.py` | `get_storage()` returns a `StorageBackend` (e.g. `LocalStorageBackend`). Upload handler calls `storage.put(job.original_key, upload_file.file)` for each job. |

---

### Step 4: Enqueue one Celery task per job

**What happens:** For each created job, the backend sends a task to Redis so the worker will process that job.

**Files involved:**

| File | Role |
|------|------|
| `backend/app/api/jobs.py` | After storing files: `for job in jobs: enqueue_upscale(job.id)`. |
| `backend/app/core/celery_client.py` | `enqueue_upscale(job_id)`: sends task `app.tasks.upscale.upscale_task` with args `[job_id]` to the Celery broker (Redis). |
| `backend/app/core/config.py` | `celery_broker_url` (and `redis_url`) for the client. |

Response: `UploadResponse(job_ids=[...])` is returned to the frontend; the upload page redirects to `/jobs?ids=...`.

---

### Step 5: Worker picks up the task

**What happens:** A Celery worker is running and listening on the same Redis broker. It receives `upscale_task(job_id)`, loads the job from Postgres, and continues only if status is `queued`.

**Files involved:**

| File | Role |
|------|------|
| `worker/app/celery_app.py` | Celery app (broker/backend from env); discovers tasks under `app.tasks`. |
| `worker/app/tasks/upscale.py` | `upscale_task(job_id)`: `_get_job(job_id)` from Postgres; if not found or not `queued`, returns; else calls `_update_job_status(job_id, "processing")`. |
| `worker/app/db.py` | `get_db()` returns a sync SQLAlchemy session (same DB as backend). |
| `worker/app/models/job.py` | Worker’s `Job` model (same table as backend) for reading/updating. |
| `worker/app/config.py` | Worker settings: `database_url`, `redis_url`, `local_storage_path`, `max_megapixels`, `real_esrgan_tile`, etc. |

---

### Step 6: Worker runs the upscaler

**What happens:** Worker downloads the original from storage to a temp file, checks megapixels again, then calls the chosen upscaler (Real-ESRGAN or SwinIR). The upscaler writes the result to a temp file (with tiling to limit VRAM).

**Files involved:**

| File | Role |
|------|------|
| `worker/app/tasks/upscale.py` | In a temp dir: `storage.get_to_file(job.original_key, input_path)`; optional megapixel check with OpenCV; then `real_esrgan.upscale(...)` or `swinir.upscale(...)`; result at `output_path`. |
| `worker/app/storage.py` | `get_to_file(key, path)`: reads from `LOCAL_STORAGE_PATH` (same volume as backend in Docker) and writes to `path`. |
| `worker/app/upscalers/real_esrgan.py` | Loads Real-ESRGAN model (x2 or x4), runs with tiling (`real_esrgan_tile`); reads `input_path`, writes PNG to `output_path`. |
| `worker/app/upscalers/swinir.py` | Runs official SwinIR script (subprocess) for real_sr; for 2× uses 4× then downscales. Reads from a folder containing the input, writes to SwinIR’s output folder, then copies (and optionally downscales) to `output_path`. |

---

### Step 7: Worker saves the result and updates the job

**What happens:** Worker uploads the result file to storage under `results/{job_id}`, then updates the job row: `result_key` set, `status = "completed"`. On any exception it sets `status = "failed"` and `error_message`.

**Files involved:**

| File | Role |
|------|------|
| `worker/app/tasks/upscale.py` | `storage.put(result_key, open(output_path))` with `result_key = f"results/{job_id}"`; then `_update_job_status(job_id, "completed", result_key=result_key)`. On exception: `_update_job_status(job_id, "failed", error_message=str(e))`. |
| `worker/app/storage.py` | `put(key, body)`: writes the file under the same base path the backend uses, so the result is visible to the backend for download. |

---

### Step 8: User sees status and downloads

**What happens:** The frontend is on `/jobs?ids=...`. It polls `GET /api/jobs?ids=...` every few seconds. Each job is shown in a card (queued → processing → completed/failed). When completed, a download link is shown (and an expiry countdown). Clicking it calls `GET /api/jobs/{id}/download`; the backend streams the result file.

**Files involved:**

| File | Role |
|------|------|
| `frontend/src/app/jobs/page.tsx` | Reads `ids` from query; keeps `jobs` in state; uses `usePollJobs(ids, setJobs)` to poll; renders a `JobCard` per job. |
| `frontend/src/hooks/usePollJobs.ts` | Calls `getJobs(ids)` on an interval; updates state; stops polling when all jobs are `completed` or `failed`. |
| `frontend/src/lib/api.ts` | `getJobs(ids)` → `GET /api/jobs?ids=...`; download URL is `result_url` from the API or `getDownloadUrl(jobId)`. |
| `frontend/src/components/JobCard.tsx` | Shows filename, status, error (if failed), and for completed: download link (`result_url`) and `ExpiryCountdown`. |
| `frontend/src/components/ExpiryCountdown.tsx` | Takes `expires_at`; displays “Expires in Xm Ys” and “Expired” when time is up. |
| `backend/app/api/jobs.py` | `list_jobs(ids)`: `job_service.get_jobs_by_ids(db, job_ids)`; maps each job to `JobResponse` (including `result_url` when completed). `download_result(job_id)`: loads job, checks completed and not expired, then `FileResponse(storage.get_url(job.result_key), ...)`. |
| `backend/app/services/job_service.py` | `get_jobs_by_ids(db, job_ids)` and `get_job_by_id(db, job_id)` for list and download. |

---

### Background: Expired job cleanup

**What happens:** A periodic Celery Beat task runs every 5 minutes. It finds jobs with `expires_at < now`, deletes their files (original + result) from storage, then deletes the job rows.

**Files involved:**

| File | Role |
|------|------|
| `worker/app/celery_app.py` | `beat_schedule`: task `app.tasks.cleanup.cleanup_expired_task` every 300 seconds. |
| `worker/app/tasks/cleanup.py` | `cleanup_expired_task()`: select expired jobs, delete from storage (`original_key`, `result_key`), then delete those rows from the `jobs` table. |

---

## Env vars

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Postgres connection string. |
| `REDIS_URL` | Redis URL (backend and worker). |
| `CELERY_BROKER_URL` | Celery broker (typically same as `REDIS_URL`). |
| `NEXT_PUBLIC_API_URL` | Backend URL used by the browser (e.g. `http://localhost:8000`). |
| `USE_LOCAL_STORAGE` | `true` = store files on disk. |
| `LOCAL_STORAGE_PATH` | Directory for files (e.g. `/app/storage` in Docker; same path for backend and worker). |
| `JOB_EXPIRY_MINUTES` | TTL for download (default 60). |
| `MAX_FILES_PER_BATCH` | Max files per upload (default 10). |
| `MAX_MB_PER_FILE` | Max size per file in MB (default 50). |
| `MAX_MEGAPIXELS` | Max megapixels per image (default 16). |

---

## Optional: MinIO (S3-compatible storage)

```bash
docker compose --profile with-minio up
```

Use when you want S3-compatible storage; backend/worker would need S3 implementation and `USE_LOCAL_STORAGE=false` (not wired in this repo yet).

---

## Viewing worker logs

To see what the worker is doing (e.g. why a job is stuck on "Processing"):

```bash
docker compose logs -f worker
```

The worker logs each step: `downloading from storage`, `running upscaler method=...`, `uploading result`, and any exceptions.

---

## Worker: CPU vs GPU and how long it takes

By default the worker runs Real-ESRGAN on **CPU**. On CPU, 2× upscale can take **many minutes** (often 5–20+ per image); 4× or large images can take **30–60+ minutes**. Online upscalers are fast because they use **GPUs** (often under 10 seconds).

### Running the worker with GPU (NVIDIA)

**Supported hosts:** Linux with an NVIDIA GPU (e.g. Ubuntu, Debian, or a cloud VM with a GPU). **Not supported on macOS:** Docker Desktop on Mac cannot pass an NVIDIA GPU into containers for CUDA, so the GPU worker option is for Linux (or WSL2 + NVIDIA on Windows).

You need:

1. **NVIDIA GPU** and drivers on the host.
2. **Docker with GPU support**: NVIDIA Container Toolkit installed so Docker can pass the GPU into containers.
3. **GPU worker image and compose override** (included in this repo).

#### Installing the NVIDIA Container Toolkit (Linux)

**Ubuntu / Debian:**

1. Install Docker and the **NVIDIA driver** for your GPU (e.g. `sudo apt install nvidia-driver-535` or from [NVIDIA](https://www.nvidia.com/Download/index.aspx)). Reboot if needed, then run `nvidia-smi` to confirm the GPU is visible.

2. Add the NVIDIA Container Toolkit repo and install:

   ```bash
   curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | sudo gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg
   curl -s -L https://nvidia.github.io/libnvidia-container/stable/deb/nvidia-container-toolkit.list | \
     sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' | \
     sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list
   sudo apt-get update
   sudo apt-get install -y nvidia-container-toolkit
   ```

3. Configure Docker to use the NVIDIA runtime and restart Docker:

   ```bash
   sudo nvidia-ctk runtime configure --runtime=docker
   sudo systemctl restart docker
   ```

4. Verify (optional):  
   `docker run --rm --gpus all nvidia/cuda:12.1.0-base-ubuntu22.04 nvidia-smi`  
   You should see your GPU listed.

**Other distros:** See the [official install guide](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/install-guide.html).

#### Running the stack with GPU

1. From the project root, run with the GPU override so the worker uses `Dockerfile.gpu` (PyTorch + CUDA 12.1) and gets one GPU:

   ```bash
   docker compose -f docker-compose.yml -f docker-compose.gpu.yml up -d --build
   ```

   Or with dev mounts:

   ```bash
   docker compose -f docker-compose.yml -f docker-compose.dev.yml -f docker-compose.gpu.yml up -d --build
   ```

2. The worker will use `REAL_ESRGAN_GPU_ID=0` (first GPU). To use a different GPU, set `REAL_ESRGAN_GPU_ID=1` (etc.) in `.env` or in `docker-compose.gpu.yml` under `worker.environment`.

3. Rebuild the worker after changing GPU env:  
   `docker compose -f docker-compose.yml -f docker-compose.gpu.yml up -d --build worker`

Upscales will then run on the GPU and typically finish in **seconds to under a minute** instead of many minutes on CPU.

---

## Worker memory and OOM

Real-ESRGAN loads a large model and uses a lot of RAM (often 4–8 GB per run). If the worker is killed with **signal 9 (SIGKILL)** during "Running Real-ESRGAN…", the host or Docker is almost certainly **out of memory**.

- **Docker Desktop:** Increase memory in *Settings → Resources → Memory* (e.g. 8 GB).
- **docker compose:** The worker runs with `--concurrency=1` so only one upscale runs at a time, which reduces OOM risk.
- **Stuck "Processing":** A periodic task marks jobs that stay in "processing" for more than 30 minutes as **failed** with a message suggesting to try a smaller image or increase memory. Refresh the jobs page to see the updated status.

---

## Docker disk space and worker build

**Docker using a lot of disk (e.g. 40+ GB) with no containers running** is usually build cache, unused images, and old layers. Free space with:

```bash
# Remove build cache, stopped containers, unused images and networks
docker system prune -a -f
# Optional: remove unused volumes too (only if you don't need DB/storage data)
docker volume prune -f
```

After pruning, the next `docker compose build` will take longer because the worker image will rebuild from scratch.

**Worker build runs until OOM or takes forever:** The worker image installs PyTorch and heavy ML deps. The default `worker/Dockerfile` uses **CPU-only** PyTorch wheels to keep download and build smaller. If the build still OOMs:

- Increase Docker Desktop **Memory** (e.g. 8 GB) and **Disk** in *Settings → Resources*.
- Run the build when nothing else is using RAM.
- After pruning (above), try again: `docker compose build --no-cache worker`.

---

## Run without Docker

1. **Postgres & Redis** – run locally (e.g. Postgres 16, Redis 7).
2. **Backend:** `cd backend`, then `pip install -r requirements.txt`, then `uvicorn app.main:app --reload`. Migrations run automatically on startup. To run them manually (e.g. from a venv): `python -m alembic upgrade head`.
3. **Worker:** `cd worker && pip install -r requirements.txt && celery -A app.celery_app worker -B --loglevel=info --concurrency=1`
4. **Frontend:** `cd frontend && npm install && NEXT_PUBLIC_API_URL=http://localhost:8000 npm run dev`

Use the same `DATABASE_URL`, `REDIS_URL`, and (for shared files) same `LOCAL_STORAGE_PATH` for backend and worker.

---

## Containers, deployment, and making it faster

**Containers don’t get a GPU by default.** A container only has what the host gives it. So:

- **Docker on your Mac:** The host is a Linux VM; it has no NVIDIA GPU to pass through. The worker in the container runs on **CPU** and will be slow.
- **Render (and most PaaS):** Standard background workers are **CPU-only**. Render does not provide GPU instances for workers today, so if you deploy this stack on Render, the worker will also be CPU and slow.
- **To get GPU in a container** you must run the worker on a **host that has an NVIDIA GPU** and that is configured to pass it into containers (e.g. a Linux server with the [NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/install-guide.html), then use `docker-compose.gpu.yml`).

**Ways to make upscaling faster:**

1. **Run the worker on a GPU host**  
   Deploy only the **worker** (and Redis/Postgres if needed) on a provider that gives you an NVIDIA GPU, and keep the rest of the app where you like (e.g. Render for web + backend, separate GPU server or cloud GPU for the worker). Examples:
   - **RunPod**, **Vast.ai**, **Lambda Labs**: rent a GPU machine, install Docker + NVIDIA toolkit, run the worker with `docker-compose.gpu.yml`.
   - **AWS** (e.g. EC2 with a GPU instance type), **GCP**, **Azure**: same idea — GPU VM + Docker + this repo’s worker with GPU compose.
   - **Modal**, **Replicate**: serverless GPU; you’d typically replace the in-process Real-ESRGAN call with an API call to their GPU endpoint and keep the rest of your worker logic.

2. **Keep everything on Render (or similar)**  
   Then the worker stays **CPU-only** and upscales will stay slow (many minutes per image). No code change needed; it’s a platform limitation.

3. **Mac with Apple Silicon (M1/M2/M3)**  
   The Real-ESRGAN stack we use targets NVIDIA (CUDA). It does not use Apple’s Metal GPU. Running the worker **natively** on the Mac (outside Docker) would not give you Metal acceleration with the current setup. So on Mac you’re on CPU unless you offload the worker to a GPU host as in (1).

**Summary:** For fast upscaling you need the worker running on a machine with an **NVIDIA GPU** (and the GPU compose override). The container itself does not “have” a GPU unless that host provides one.

#### Serverless / zero-idle GPU (pay per job)

Instead of paying **$1–2/hr** (or ~$24–48/day) for an always-on GPU VM, you can use **serverless / on-demand GPU** platforms that spin up a GPU only when a job runs:

| Platform | Model | Typical cost |
|----------|--------|--------------|
| **RunPod Serverless** | GPU pod on demand | Pay per second; no traffic ≈ $0 |
| **Modal** | Serverless GPU functions | Pay per second; scale to zero |
| **Replicate** | Hosted models (e.g. Real-ESRGAN) | Cents per prediction |
| **Banana.dev** | Deploy your model, call via API | Pay per request |
| **Vast.ai** (on-demand) | Rent GPU by the hour, turn off when idle | ~$0.06–0.15/hr when on |

**Flow:** User uploads image → your worker (or backend) sends the image to the platform’s API → their GPU runs the upscale → you get the result back → you save it and update the job. **No traffic = almost no cost** (a few cents per job instead of $48/day).

**How to adapt this app:** Keep the current Celery worker (or a tiny “orchestrator” worker) on a cheap CPU host (e.g. Render). Instead of running Real-ESRGAN inside the worker, the worker would:

1. Download the input image from your storage (as now).
2. Call the serverless GPU provider’s API (e.g. Replicate’s Real-ESRGAN model, or a Modal/RunPod Serverless endpoint you deploy).
3. Receive the upscaled image, upload it to your storage, and update the job (as now).

So you’d replace the in-process `real_esrgan.upscale(...)` call with an HTTP (or SDK) call to the provider. The rest of the pipeline (Postgres, Redis, storage, frontend) stays the same. This is the cheapest way to get fast upscaling without renting a 24/7 GPU.

---

## License

- Real-ESRGAN: BSD-3-Clause  
- SwinIR: Apache-2.0  
