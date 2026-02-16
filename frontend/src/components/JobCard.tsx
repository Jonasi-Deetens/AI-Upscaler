"use client";

import { useState } from "react";
import type { Job } from "@/lib/types";
import { cancelJob } from "@/lib/api";
import { ExpiryCountdown } from "./ExpiryCountdown";

interface JobCardProps {
  job: Job;
  /** Called after cancel; receives updated job so parent can update list immediately */
  onCancelled?: (updatedJob: Job) => void;
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

export function JobCard({ job, onCancelled }: JobCardProps) {
  const [cancelling, setCancelling] = useState(false);

  const handleCancel = async () => {
    if (cancelling) return;
    setCancelling(true);
    try {
      const updated = await cancelJob(job.id);
      onCancelled?.(updated);
    } catch {
      setCancelling(false);
    }
  };

  const canCancel = (job.status === "queued" || job.status === "processing") && onCancelled;

  return (
    <div className="rounded-2xl bg-white/80 dark:bg-zinc-800/70 backdrop-blur-sm border border-white/90 dark:border-zinc-700/80 p-5 shadow-sm hover:shadow-md dark:hover:shadow-none dark:hover:ring-1 dark:hover:ring-zinc-600 transition-all">
      <div className="flex items-start justify-between gap-2">
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
          {job.status === "completed" && job.result_url && (
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <a
                href={job.result_url ?? ""}
                download
                className="gradient-ai inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-md shadow-violet-200/50 dark:shadow-violet-500/30 hover:shadow-violet-300/50 dark:hover:shadow-violet-500/40 transition-all"
              >
                Download
              </a>
              <ExpiryCountdown expiresAt={job.expires_at} />
            </div>
          )}
          {canCancel && (
            <div className="mt-3">
              <button
                type="button"
                onClick={handleCancel}
                disabled={cancelling}
                className="rounded-lg border border-neutral-300 dark:border-zinc-600 px-4 py-2 text-sm font-medium text-neutral-700 dark:text-zinc-300 hover:bg-neutral-100 dark:hover:bg-zinc-700 disabled:opacity-50"
              >
                {cancelling ? "Cancelling…" : "Cancel job"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
