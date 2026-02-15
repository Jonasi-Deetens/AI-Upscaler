"use client";

import Link from "next/link";
import { useState } from "react";
import { usePollRecentJobs } from "@/hooks/usePollRecentJobs";
import type { Job } from "@/lib/types";

const statusLabels: Record<string, string> = {
  queued: "Queued",
  processing: "Processing",
  completed: "Done",
  failed: "Failed",
};

function JobRow({ job }: { job: Job }) {
  return (
    <Link
      href={`/jobs?ids=${job.id}`}
      className="block rounded-xl bg-white/80 dark:bg-zinc-800/70 border border-white/90 dark:border-zinc-700/80 p-4 shadow-sm hover:shadow-md dark:hover:ring-1 dark:hover:ring-zinc-600 transition-all text-left"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-medium text-neutral-900 dark:text-zinc-100 truncate">
            {job.original_filename}
          </p>
          <p className="text-sm text-neutral-500 dark:text-zinc-400">
            {statusLabels[job.status] ?? job.status}
            {job.status === "processing" && job.status_detail && (
              <span className="ml-1">· {job.status_detail}</span>
            )}
          </p>
        </div>
        <span className="text-neutral-400 dark:text-zinc-500 shrink-0" aria-hidden>
          →
        </span>
      </div>
    </Link>
  );
}

export function JobList() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [hasFetched, setHasFetched] = useState(false);

  usePollRecentJobs((fetched) => {
    setJobs(fetched);
    setHasFetched(true);
  });

  if (!hasFetched && jobs.length === 0) {
    return (
      <section className="rounded-2xl bg-white/70 dark:bg-zinc-800/60 backdrop-blur-sm border border-white/80 dark:border-zinc-700/80 p-6 shadow-sm max-w-2xl mb-10">
        <h2 className="text-lg font-semibold text-neutral-800 dark:text-zinc-100 mb-2">
          Recent jobs
        </h2>
        <p className="text-sm text-neutral-500 dark:text-zinc-400 py-2">
          Loading…
        </p>
      </section>
    );
  }

  if (jobs.length === 0) {
    return (
      <section className="rounded-2xl bg-white/70 dark:bg-zinc-800/60 backdrop-blur-sm border border-white/80 dark:border-zinc-700/80 p-6 shadow-sm max-w-2xl mb-10">
        <h2 className="text-lg font-semibold text-neutral-800 dark:text-zinc-100 mb-2">
          Recent jobs
        </h2>
        <p className="text-sm text-neutral-500 dark:text-zinc-400 py-2">
          No jobs yet. Upload images to get started.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl bg-white/70 dark:bg-zinc-800/60 backdrop-blur-sm border border-white/80 dark:border-zinc-700/80 p-6 shadow-sm max-w-2xl mb-10">
      <h2 className="text-lg font-semibold text-neutral-800 dark:text-zinc-100 mb-4">
        Recent jobs
      </h2>
      <ul className="space-y-3">
        {jobs.map((job) => (
          <li key={job.id}>
            <JobRow job={job} />
          </li>
        ))}
      </ul>
    </section>
  );
}
