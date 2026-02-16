# AI Upscaler – Feature roadmap

Planned features, aligned with the stack (Next.js 15, FastAPI, Celery, Postgres, Redis, local/S3) and principles: **functional React**, **AI-themed UI** (gradient borders, clean layout), **no sign-up** for core flows.

---

## 1. Before/after on job result page

**Goal:** Let users compare original vs upscaled in the UI using the existing `BeforeAfterSlider`.

**Backend**
- Add `GET /api/jobs/{job_id}/original` that serves the stored original file (same auth/expiry semantics as download: job must exist; no need for auth if job ID is the secret).
- Extend `JobResponse` (and frontend `Job` type) with `original_url` when the job has `original_key` (e.g. `{base}/api/jobs/{id}/original`), so the client can load both images.

**Frontend**
- On the jobs page, for each **completed** job with `result_url` and `original_url`, render a `BeforeAfterSlider` with `beforeSrc={original_url}` and `afterSrc={result_url}` (or use result_url as download and a proxy URL that serves the file for the img; ensure CORS/cookie if needed).
- Reuse existing `BeforeAfterSlider`; keep gradient-border styling. Optional: collapse to a single “Compare” area per job to avoid clutter.

**Principles:** Reuse components; no new dependencies; RESTful, idempotent GET for originals.

---

## 2. Thumbnails in job list

**Goal:** Show a small preview (original or result) in each job row so lists are easier to scan.

**Backend**
- Add `GET /api/jobs/{job_id}/thumbnail` that returns a small image (e.g. 120px wide):
  - If job completed: resize/crop from result (or serve result with `Accept`/query for thumbnail; or generate on first request and cache key like `thumbnails/{job_id}`).
  - Else: resize from original.
- Alternatively: worker generates a thumbnail when job completes and stores it (e.g. `thumbnails/{job_id}`); backend serves it. Keeps backend simple (no PIL in API).
- Add `thumbnail_url` to `JobResponse` when available (e.g. `{base}/api/jobs/{id}/thumbnail`).

**Frontend**
- In `JobList` (landing) and `JobCard` (jobs page): show a small thumbnail next to the filename. Use gradient-border wrapper for the thumbnail to match the AI theme.
- Fallback: no thumbnail (e.g. “—” or icon) when `thumbnail_url` is null (e.g. still processing or failed).

**Principles:** Optional, progressive enhancement; thumbnail generation can be async (worker) to avoid blocking the main pipeline.

---

## 3. Batch download (ZIP)

**Goal:** For a set of jobs (e.g. same batch), one “Download all” that returns a ZIP.

**Backend**
- Add `POST /api/jobs/batch-download` (or `GET /api/jobs/batch-download?ids=id1,id2,...`) that:
  - Accepts a list of job IDs (same user/session semantics as today: no auth, IDs are the secret).
  - Validates all jobs exist, completed, not expired.
  - Streams a ZIP containing each result file with a safe name (e.g. `{original_basename}_upscaled.png`).
- Use streaming ZIP (e.g. Python `zipfile` with BytesIO or streaming response) to avoid loading all files into memory.

**Frontend**
- On jobs page, when multiple jobs are shown and at least one is completed, show a “Download all” button that calls the batch-download endpoint and triggers download of the ZIP (e.g. `window.location.href = url` or fetch + blob + object URL).
- Style as primary CTA (e.g. gradient-ai) when there are completed jobs; disable or hide when none.

**Principles:** Same security model as single download; no accounts required; clear UX for batch usage.

---

## 4. Live job progress

**Goal:** Show clearer progress (e.g. “Upscaling…”, “Face enhance…”) so users know the app is working.

**Current state:** Worker already sets `status_detail` (e.g. “Downloading image…”, “Upscaling…”, “Uploading result…”); API and frontend types expose it; `JobCard` shows it.

**Planned**
- **Frontend:** Ensure `status_detail` is always visible when present (already in `JobCard`; in `JobList` hero cards, show it if needed). Optional: short, human-readable labels per step (e.g. map “Uploading result…” → “Almost done…”).
- **Worker (optional):** Add a numeric progress field (0–100) if we want a progress bar later: e.g. `job.progress = 50` and expose in API/frontend. Not required for “live progress” wording; `status_detail` is enough for v1.

**Principles:** No new infra; reuse existing `status_detail` and polling.

---

## 5. Notify when done

**Goal:** User can get notified when a job completes so they don’t have to keep refreshing.

**Option A – In-app only (simplest)**
- Use the browser Notification API: when the user is on the jobs page (or app) and a job moves to “completed”, request notification permission once and show “Job X is ready” if permission granted. No backend change.

**Option B – Email (optional, later)**
- Add optional “Email when ready” field (e.g. one-time email input, not account). Backend stores it on the job or in a small table; worker or a small task sends one email on completion. Use a transactional provider (e.g. Resend, SendGrid) and keep it optional.

**Recommendation:** Implement Option A first (in-app notifications when tab is open); add Option B only if you need email.

**Principles:** No sign-up; optional; minimal backend change for Option A.

---

## 6. Share link for completed job

**Goal:** Time-limited link (e.g. same 1-hour expiry as the result) that opens the job result page so users can share or open on another device.

**Backend**
- No new endpoint: job ID in URL is already the “secret”. Ensure `GET /api/jobs?ids={id}` and `GET /api/jobs/{id}/download` (and original/thumbnail if added) work when opened in a new session (no cookie required). Already the case if APIs are stateless.

**Frontend**
- On job detail (jobs page) or in JobCard when status is completed, add a “Copy link” button that copies to clipboard a URL like `https://{origin}/jobs?ids={job.id}`. Optional: show a short toast “Link copied (valid for 1 hour)”.
- Style as secondary (e.g. btn-ai-secondary or text + icon) to keep “Download” primary.

**Principles:** No new backend; reuse expiry; link is the secret.

---

## 7. Presets (Photo, Anime, Document)

**Goal:** One-click presets that set method and options so most users don’t need to configure.

**Backend**
- No change: presets are frontend-only (method + scale + denoise_first + face_enhance).

**Frontend**
- On upload page, add preset chips or dropdown (e.g. “Photo”, “Anime”, “Document”, “Custom”):
  - **Photo:** method `real_esrgan`, scale 4, denoise optional, face_enhance optional.
  - **Anime:** method `real_esrgan_anime`, scale 4, denoise off, face_enhance off.
  - **Document:** method `swinir`, scale 2 or 4, denoise on, face_enhance off.
  - **Custom:** current form (user picks everything).
- Selecting a preset updates the form state; “Custom” reveals all controls. Keep existing method/scale/options visible when Custom is selected; optional: hide advanced options when a preset is selected.

**Principles:** Purely UX; no API change; keep power users supported via Custom.

---

## 8. Retry failed jobs

**Goal:** Let users retry a failed job (same inputs/options) without re-uploading.

**Backend**
- Add `POST /api/jobs/{job_id}/retry` that:
  - Loads the job; returns 4xx if not failed (e.g. only `status == 'failed'`).
  - Creates a new job with same `original_key` (or re-reads original from storage), same scale/method/options, and enqueues it; returns the new `JobResponse`.
  - Does not delete or modify the old job (keep for history).

**Frontend**
- In `JobCard`, when `job.status === 'failed'`, show a “Retry” button that calls `retryJob(job.id)`, then either redirect to the new job (e.g. append new id to `ids` and refetch) or show the new job in the list.
- Style as secondary or link; keep “Cancel” only for queued/processing.

**Principles:** Immutable jobs; retry = new job; reuse existing upload/celery flow.

---

## Implementation order (suggested)

| Order | Feature                 | Notes                                      |
|-------|-------------------------|--------------------------------------------|
| 1     | Before/after on result | High impact; needs `original_url` + slider |
| 2     | Thumbnails in list      | Improves scan-ability; needs thumbnail API |
| 3     | Share link (copy URL)   | Quick win; no backend change               |
| 4     | Presets on upload       | Quick win; frontend only                   |
| 5     | Retry failed jobs       | Backend + button; clear value              |
| 6     | Batch download          | Backend streaming ZIP + “Download all”     |
| 7     | In-app “job ready” notif| Frontend only; Notification API            |
| 8     | Live progress polish    | Already partly there; optional progress %  |

---

## Out of scope for this roadmap

- **Accounts / auth:** Deferred; link-based and optional email are enough for now.
- **Longer retention:** Would require storage policy and possibly accounts later.
- **WebSocket/SSE for status:** Optional later; polling is acceptable for current scale.
