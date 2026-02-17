"use client";

import { Suspense, useMemo, useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { JobCard } from "@/components/JobCard";
import { usePollJobs } from "@/hooks/usePollJobs";
import { getBatchDownloadUrl, getQueueStats } from "@/lib/api";
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
  const justUploaded = searchParams.get("justUploaded") === "1";
  const ids = useMemo(
    () => idsParam.split(",").filter(Boolean),
    [idsParam]
  );
  const [jobs, setJobs] = useState<Job[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);
  const onSettled = useCallback(() => setHasFetched(true), []);
  const onError = useCallback((msg: string | null) => setFetchError(msg), []);
  const { refetch } = usePollJobs(ids, setJobs, 2500, { onError, onSettled });
  const prevStatusRef = useRef<Record<string, string>>({});

  const didHandleJustUploaded = useRef(false);
  useEffect(() => {
    if (!justUploaded || ids.length === 0 || didHandleJustUploaded.current) return;
    didHandleJustUploaded.current = true;
    requestNotificationPermission();
    router.replace(`/jobs?ids=${ids.join(",")}`, { scroll: false });
  }, [justUploaded, ids, router]);

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

  const [queueStats, setQueueStats] = useState({ queued: 0, processing: 0 });
  useEffect(() => {
    const fetchStats = () => {
      getQueueStats().then(setQueueStats).catch(() => {});
    };
    fetchStats();
    const t = setInterval(fetchStats, 12000);
    return () => clearInterval(t);
  }, []);

  const showQueueHint = queueStats.queued > 0 || queueStats.processing > 0;

  return (
    <main className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <Link
          href="/"
          className="gradient-ai-text text-sm font-medium hover:opacity-90 inline-block mb-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 rounded"
        >
          ← Back
        </Link>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-6">
          Job status
        </h1>
        {showQueueHint && (
          <p className="mb-4 text-sm text-neutral-500 dark:text-zinc-400">
            {queueStats.queued} in queue, {queueStats.processing} processing.
          </p>
        )}
        {justUploaded && ids.length > 0 && (
          <p className="mb-4 rounded-xl bg-violet-100 dark:bg-violet-900/30 text-violet-800 dark:text-violet-200 px-4 py-3 text-sm">
            Your jobs are processing. We&apos;ll notify you when they&apos;re ready (if you allow notifications).
          </p>
        )}
        {ids.length === 0 ? (
          <p className="text-neutral-600 dark:text-zinc-400">
            No job IDs. Upload images first.
          </p>
        ) : fetchError ? (
          <div className="rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/20 px-4 py-4">
            <p className="text-rose-700 dark:text-rose-300 mb-3">{fetchError}</p>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => {
                setFetchError(null);
                refetch();
              }}
            >
              Retry
            </Button>
          </div>
        ) : !hasFetched && jobs.length === 0 ? (
          <ul className="space-y-4" aria-busy="true" aria-label="Loading jobs">
            {ids.map((id) => (
              <li key={id} className="rounded-2xl border border-neutral-200 dark:border-zinc-700 bg-white/80 dark:bg-zinc-800/60 p-5 animate-pulse">
                <div className="flex gap-4">
                  <div className="h-14 w-14 rounded-xl bg-neutral-200 dark:bg-zinc-700 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 rounded bg-neutral-200 dark:bg-zinc-700" />
                    <div className="h-3 w-1/2 rounded bg-neutral-200 dark:bg-zinc-700" />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <>
            {showBatchDownload && (
              <div className="mb-4">
                <Button asChild variant="cta" size="md" className="rounded-xl">
                  <a href={getBatchDownloadUrl(completedIds)} download="upscaled_batch.zip">
                    Download all as ZIP ({completedIds.length} images)
                  </a>
                </Button>
              </div>
            )}
            <ul className="space-y-4" aria-live="polite" aria-label="Job list">
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
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="h-5 w-24 rounded bg-neutral-200 dark:bg-zinc-700 animate-pulse mb-8" />
        <div className="h-9 w-48 rounded bg-neutral-200 dark:bg-zinc-700 animate-pulse mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border border-neutral-200 dark:border-zinc-700 bg-white/80 dark:bg-zinc-800/60 p-5 animate-pulse">
              <div className="flex gap-4">
                <div className="h-14 w-14 rounded-xl bg-neutral-200 dark:bg-zinc-700 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-neutral-200 dark:bg-zinc-700" />
                  <div className="h-3 w-1/2 rounded bg-neutral-200 dark:bg-zinc-700" />
                </div>
              </div>
            </div>
          ))}
        </div>
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
