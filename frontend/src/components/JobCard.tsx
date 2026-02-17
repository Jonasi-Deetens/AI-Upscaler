"use client";

import { useState, useCallback } from "react";
import type { Job } from "@/lib/types";
import { cancelJob, retryJob } from "@/lib/api";
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
  const showCompare = job.status === "completed" && job.original_url && job.result_url;

  return (
    <div className="rounded-2xl gradient-border p-[1px] bg-white/80 dark:bg-zinc-800/70 backdrop-blur-sm shadow-sm hover:shadow-md dark:hover:ring-1 dark:hover:ring-zinc-600 transition-all">
      <div className="gradient-border-inner rounded-2xl p-5">
        <div className="flex items-start gap-4">
          {job.thumbnail_url && (
            <div className="shrink-0 w-14 h-14 rounded-xl overflow-hidden gradient-border p-0">
              <div className="gradient-border-inner w-full h-full p-0 rounded-[0.65rem] relative min-h-0">
                {/* eslint-disable-next-line @next/next/no-img-element -- dynamic API URL (thumbnail) */}
                <img
                  src={job.thumbnail_url}
                  alt=""
                  className="absolute inset-0 size-full object-cover"
                />
              </div>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-neutral-900 dark:text-zinc-100 truncate">
              {job.original_filename}
            </p>
            <p className="text-sm text-neutral-500 dark:text-zinc-400 mt-1">
              {statusLabels[job.status] ?? job.status}
              {job.status === "processing" && (
                <span className="ml-2 animate-pulse">…</span>
              )}
            </p>
            {(job.started_at || job.finished_at) && (
              <p className="text-xs text-neutral-400 dark:text-zinc-500 mt-0.5">
                {job.started_at && <>Started {formatTime(job.started_at)}</>}
                {job.started_at && job.finished_at && " · "}
                {job.finished_at && <>Finished {formatTime(job.finished_at)}</>}
              </p>
            )}
            {job.status === "processing" &&
              job.progress != null &&
              job.progress >= 0 &&
              job.progress <= 100 && (
                <div className="mt-2 w-full max-w-xs h-1.5 rounded-full bg-neutral-200 dark:bg-zinc-700 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-violet-500 dark:bg-violet-400 transition-all duration-300"
                    style={{ width: `${job.progress}%` }}
                  />
                </div>
              )}
            {job.status_detail && (
              <p className="text-sm text-neutral-600 dark:text-zinc-300 mt-0.5">
                {job.status_detail}
              </p>
            )}
            {job.error_message && (
              <p className="text-sm text-rose-600 dark:text-rose-400 mt-1">
                {job.error_message}
              </p>
            )}
            {actionError && (
              <p className="text-sm text-rose-600 dark:text-rose-400 mt-1">
                {actionError}
              </p>
            )}
            {job.status === "completed" && job.result_url && (
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <Button asChild variant="cta" size="sm">
                  <a href={job.result_url} download>
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
              beforeSrc={job.original_url!}
              afterSrc={job.result_url!}
              beforeAlt="Original"
              afterAlt="Upscaled"
              className="aspect-video"
            />
          </div>
        )}
      </div>
    </div>
  );
}
