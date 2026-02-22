"use client";

import { useState, useCallback } from "react";
import type { Job } from "@/lib/types";
import { cancelJob, retryJob, getDownloadUrl, getOriginalUrl, getThumbnailUrl } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { ExpiryCountdown } from "./ExpiryCountdown";
import { BeforeAfterSlider } from "./BeforeAfterSlider";

interface JobCardProps {
  job: Job;
  /** Called after cancel; receives updated job so parent can update list immediately */
  onCancelled?: (updatedJob: Job) => void;
  /** Called after retry; receives the new job so parent can add it to the list */
  onRetried?: (newJob: Job) => void;
}

const statusLabels: Record<string, string> = {
  queued: "Queued",
  processing: "Processing",
  completed: "Done",
  failed: "Failed",
  cancelled: "Cancelled",
};

/** Backend methods that have single image in + image out (before/after slider makes sense). */
const METHODS_WITH_IMAGE_COMPARE = new Set([
  "real_esrgan",
  "swinir",
  "esrgan",
  "real_esrgan_anime",
  "background_remove",
  "convert",
  "compress",
  "restore",
  "resize",
  "rotate_flip",
  "crop",
  "strip_metadata",
  "denoise",
  "blur_sharpen",
  "brightness_contrast",
  "watermark",
  "rename",
  "auto_levels",
  "saturation",
  "color_balance",
  "filters",
  "border",
  "vignette",
  "tilt_shift",
  "pixelate",
  "smart_crop",
  "background_blur",
  "inpaint",
  "object_remove",
  "deblur",
  "document_enhance",
  "ai_denoise",
  "upscale_print",
  "outpaint",
  "background_replace",
  "hdr_merge",
  "tone_map",
  "heic_to_jpg",
  "svg_to_png",
]);

function formatTime(iso: string | null): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export function JobCard({ job, onCancelled, onRetried }: JobCardProps) {
  const [cancelling, setCancelling] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [copyDone, setCopyDone] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleCancel = async () => {
    if (cancelling) return;
    setActionError(null);
    setCancelling(true);
    try {
      const updated = await cancelJob(job.id);
      onCancelled?.(updated);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Cancel failed. Try again.");
      setCancelling(false);
    }
  };

  const handleRetry = async () => {
    if (retrying) return;
    setActionError(null);
    setRetrying(true);
    try {
      const newJob = await retryJob(job.id);
      onRetried?.(newJob);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Retry failed. Try again.");
      setRetrying(false);
    }
  };

  const handleCopyLink = useCallback(() => {
    const url = typeof window !== "undefined" ? `${window.location.origin}/jobs?ids=${job.id}` : "";
    if (!url) return;
    navigator.clipboard.writeText(url).then(
      () => {
        setCopyDone(true);
        setTimeout(() => setCopyDone(false), 2000);
      },
      () => {}
    );
  }, [job.id]);

  const canCancel = (job.status === "queued" || job.status === "processing") && onCancelled;
  const canRetry = job.status === "failed" && onRetried;
  const showCompare =
    job.status === "completed" &&
    job.result_key != null &&
    job.original_key != null &&
    METHODS_WITH_IMAGE_COMPARE.has(job.method);

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start gap-4">
        {job.original_key && (
          <div className="shrink-0 w-14 h-14 rounded-xl overflow-hidden border border-border bg-muted relative">
            {/* eslint-disable-next-line @next/next/no-img-element -- dynamic API URL (thumbnail) */}
            <img
              src={getThumbnailUrl(job.id)}
              alt=""
              className="absolute inset-0 size-full object-cover"
            />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-foreground truncate">
            {job.original_filename}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {statusLabels[job.status] ?? job.status}
            {job.status === "processing" && (
              <span className="ml-2 animate-pulse">…</span>
            )}
          </p>
          {(job.started_at || job.finished_at) && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {job.started_at && <>Started {formatTime(job.started_at)}</>}
              {job.started_at && job.finished_at && " · "}
              {job.finished_at && <>Finished {formatTime(job.finished_at)}</>}
            </p>
          )}
          {job.status === "processing" &&
            job.progress != null &&
            job.progress >= 0 &&
            job.progress <= 100 && (
              <div className="mt-2 w-full max-w-xs h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${job.progress}%` }}
                />
              </div>
            )}
          {job.status_detail && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {job.status_detail}
            </p>
          )}
          {job.error_message && (
            <p className="text-sm text-destructive mt-1">
              {job.error_message}
            </p>
          )}
          {actionError && (
            <p className="text-sm text-destructive mt-1">
              {actionError}
            </p>
          )}
            {job.status === "completed" && job.result_key && (
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <Button asChild variant="cta" size="sm">
                  <a href={getDownloadUrl(job.id)} download>
                    Download
                  </a>
                </Button>
                <Button variant="secondary" size="sm" onClick={handleCopyLink}>
                  {copyDone ? "Copied!" : "Copy link"}
                </Button>
                <ExpiryCountdown expiresAt={job.expires_at} />
              </div>
            )}
            {canRetry && (
              <div className="mt-3">
                <Button variant="secondary" size="sm" onClick={handleRetry} disabled={retrying}>
                  {retrying ? "Retrying…" : "Retry"}
                </Button>
              </div>
            )}
            {canCancel && (
              <div className="mt-3">
                <Button variant="destructive" size="sm" onClick={handleCancel} disabled={cancelling}>
                  {cancelling ? "Cancelling…" : "Cancel job"}
                </Button>
              </div>
            )}
        </div>
      </div>
      {showCompare && (
        <div className="mt-4 w-full max-w-sm">
          <BeforeAfterSlider
            beforeSrc={getOriginalUrl(job.id)}
            afterSrc={getDownloadUrl(job.id)}
            beforeAlt="Original"
            afterAlt="Upscaled"
            className="aspect-video"
          />
        </div>
      )}
    </div>
  );
}
