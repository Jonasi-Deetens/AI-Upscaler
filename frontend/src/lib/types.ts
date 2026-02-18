export type JobStatus = "queued" | "processing" | "completed" | "failed" | "cancelled";

export type UpscaleMethod = "real_esrgan" | "real_esrgan_anime" | "esrgan" | "swinir";

export type ConvertTargetFormat = "webp" | "png" | "jpeg";

export interface Job {
  id: string;
  status: JobStatus;
  original_filename: string;
  original_key: string | null;
  result_key: string | null;
  result_url: string | null;
  original_url: string | null;
  thumbnail_url: string | null;
  progress: number | null;
  scale: number;
  method: string;
  created_at: string;
  expires_at: string;
  started_at: string | null;
  finished_at: string | null;
  error_message: string | null;
  status_detail: string | null;
}

export interface UploadOptions {
  scale: 2 | 4;
  method: UpscaleMethod;
}
