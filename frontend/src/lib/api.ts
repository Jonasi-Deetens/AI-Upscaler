import type { Job, UploadOptions } from "./types";

/** Options for upload (upscale, convert, background_remove, resize, etc.). */
export interface UploadOptionsExtended {
  scale: number;
  method: string;
  denoise_first?: boolean;
  face_enhance?: boolean;
  target_format?: string;
  quality?: number;
  /** Method-specific params (resize, crop, rotate_flip, etc.). Sent as JSON. */
  options?: Record<string, unknown>;
}

// Browser calls the backend at this URL. Set in .env as NEXT_PUBLIC_API_URL=http://localhost:8000.
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

/** Return the configured API base URL (for ApiBanner / health check). */
export function getApiBase(): string {
  return API_BASE;
}

/** Ping the API health endpoint; returns true if reachable. */
export async function checkHealth(): Promise<boolean> {
  try {
    const base = API_BASE || "";
    const res = await fetch(`${base}/api/health`, { method: "GET" });
    return res.ok;
  } catch {
    return false;
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  const contentType = res.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    return res.json() as Promise<T>;
  }
  return undefined as T;
}

export async function uploadJobs(
  files: File[],
  options: UploadOptions
): Promise<{ job_ids: string[] }> {
  const form = new FormData();
  form.append("scale", String(options.scale));
  form.append("method", options.method);
  for (const file of files) {
    form.append("files", file);
  }
  const res = await fetch(`${API_BASE}/api/jobs/upload`, {
    method: "POST",
    body: form,
  });
  return handleResponse<{ job_ids: string[] }>(res);
}

export async function getJobs(ids: string[]): Promise<Job[]> {
  if (ids.length === 0) return [];
  const res = await fetch(
    `${API_BASE}/api/jobs?ids=${encodeURIComponent(ids.join(","))}`
  );
  return handleResponse<Job[]>(res);
}

/** Fetch recent jobs (no ids filter). Used for the homepage job list. */
export async function getRecentJobs(limit = 50): Promise<Job[]> {
  const res = await fetch(`${API_BASE}/api/jobs?limit=${limit}`);
  return handleResponse<Job[]>(res);
}

export function getDownloadUrl(jobId: string): string {
  return `${API_BASE}/api/jobs/${jobId}/download`;
}

/** Original image URL (for before/after). Use this instead of job.original_url so it works behind proxy. */
export function getOriginalUrl(jobId: string): string {
  return `${API_BASE}/api/jobs/${jobId}/original`;
}

/** Thumbnail URL. Use this instead of job.thumbnail_url so it works behind proxy. */
export function getThumbnailUrl(jobId: string): string {
  return `${API_BASE}/api/jobs/${jobId}/thumbnail`;
}

export async function cancelJob(jobId: string): Promise<Job> {
  const res = await fetch(`${API_BASE}/api/jobs/${jobId}/cancel`, {
    method: "POST",
  });
  return handleResponse<Job>(res);
}

/** Upload with optional progress callback (called with 0–100 when done). */
export async function uploadJobsWithProgress(
  files: File[],
  options: UploadOptionsExtended,
  onProgress?: (percent: number) => void
): Promise<{ job_ids: string[] }> {
  const form = new FormData();
  form.append("scale", String(options.scale));
  form.append("method", options.method);
  form.append("denoise_first", options.denoise_first === true ? "true" : "false");
  form.append("face_enhance", options.face_enhance === true ? "true" : "false");
  if (options.target_format != null) form.append("target_format", options.target_format);
  if (options.quality != null) form.append("quality", String(options.quality));
  if (options.options != null && Object.keys(options.options).length > 0) {
    form.append("options", JSON.stringify(options.options));
  }
  for (const file of files) {
    form.append("files", file);
  }
  const res = await fetch(`${API_BASE}/api/jobs/upload`, { method: "POST", body: form });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  onProgress?.(100);
  const data = (await res.json()) as { job_ids: string[] };
  return data;
}

export async function getQueueStats(): Promise<{ queued: number; processing: number }> {
  const res = await fetch(`${API_BASE}/api/jobs/queue-stats`);
  return handleResponse<{ queued: number; processing: number }>(res);
}

export function getBatchDownloadUrl(ids: string[]): string {
  return `${API_BASE}/api/jobs/batch-download?ids=${encodeURIComponent(ids.join(","))}`;
}

export async function retryJob(jobId: string): Promise<Job> {
  const res = await fetch(`${API_BASE}/api/jobs/${jobId}/retry`, { method: "POST" });
  return handleResponse<Job>(res);
}
