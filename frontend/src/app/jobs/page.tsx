"use client";

import { Suspense, useMemo, useState, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { JobCard } from "@/components/JobCard";
import { usePollJobs } from "@/hooks/usePollJobs";
import { getBatchDownloadUrl } from "@/lib/api";
import type { Job } from "@/lib/types";

function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) return Promise.resolve(false);
  if (Notification.permission === "granted") return Promise.resolve(true);
  if (Notification.permission === "denied") return Promise.resolve(false);
  return Notification.requestPermission().then((p) => p === "granted");
}

function JobsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idsParam = searchParams.get("ids") ?? "";
  const ids = useMemo(
    () => idsParam.split(",").filter(Boolean),
    [idsParam]
  );
  const [jobs, setJobs] = useState<Job[]>([]);
  const { refetch } = usePollJobs(ids, setJobs);
  const prevStatusRef = useRef<Record<string, string>>({});

  useEffect(() => {
    const inProgress = ["queued", "processing"];
    const newlyCompleted = jobs.filter(
      (j) => j.status === "completed" && prevStatusRef.current[j.id] && inProgress.includes(prevStatusRef.current[j.id])
    );
    prevStatusRef.current = Object.fromEntries(jobs.map((j) => [j.id, j.status]));
    if (newlyCompleted.length === 0) return;
    requestNotificationPermission().then((granted) => {
      if (!granted) return;
      for (const job of newlyCompleted) {
        try {
          new Notification("AI Upscaler", {
            body: `${job.original_filename} is ready to download.`,
            tag: job.id,
          });
        } catch {
          // ignore
        }
      }
    });
  }, [jobs]);

  const handleCancelled = (updatedJob: Job) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === updatedJob.id ? updatedJob : j))
    );
    refetch();
  };

  const handleRetried = (newJob: Job) => {
    setJobs((prev) => [newJob, ...prev]);
    const newIds = [newJob.id, ...ids];
    router.replace(`/jobs?ids=${newIds.join(",")}`, { scroll: false });
  };

  const completedIds = useMemo(
    () => jobs.filter((j) => j.status === "completed").map((j) => j.id),
    [jobs]
  );
  const showBatchDownload = completedIds.length > 1;

  return (
    <main className="min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link
          href="/"
          className="gradient-ai-text text-sm font-medium hover:opacity-90 inline-block mb-8"
        >
          ← Back
        </Link>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-6">
          Job status
        </h1>
        {ids.length === 0 ? (
          <p className="text-neutral-600 dark:text-zinc-400">
            No job IDs. Upload images first.
          </p>
        ) : (
          <>
            {showBatchDownload && (
              <div className="mb-4">
                <a
                  href={getBatchDownloadUrl(completedIds)}
                  download
                  className="gradient-ai inline-flex items-center rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-md shadow-violet-200/50 dark:shadow-violet-500/30 hover:opacity-90 transition-all"
                >
                  Download all ({completedIds.length} files)
                </a>
              </div>
            )}
            <ul className="space-y-4">
              {jobs.map((job) => (
                <li key={job.id}>
                  <JobCard
                    job={job}
                    onCancelled={handleCancelled}
                    onRetried={handleRetried}
                  />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </main>
  );
}

function JobsFallback() {
  return (
    <main className="min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link
          href="/"
          className="gradient-ai-text text-sm font-medium hover:opacity-90 inline-block mb-8"
        >
          ← Back
        </Link>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-6">
          Job status
        </h1>
        <p className="text-neutral-600 dark:text-zinc-400">Loading…</p>
      </div>
    </main>
  );
}

export default function JobsPage() {
  return (
    <Suspense fallback={<JobsFallback />}>
      <JobsContent />
    </Suspense>
  );
}
