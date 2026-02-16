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
    <Link href={`/jobs?ids=${job.id}`} className="block gradient-border text-left transition-shadow">
      <div className="gradient-border-inner flex items-center justify-between gap-2">
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
      <section className="w-full">
        <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-white mb-4">
          Recent jobs
        </h2>
        <p className="text-neutral-500 dark:text-zinc-400">
          Loading…
        </p>
      </section>
    );
  }

  if (jobs.length === 0) {
    return (
      <section className="w-full">
        <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-white mb-4">
          Recent jobs
        </h2>
        <p className="text-neutral-500 dark:text-zinc-400">
          No jobs yet. Upload images to get started.
        </p>
      </section>
    );
  }

  return (
    <section className="w-full min-h-0 flex flex-col">
      <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-white mb-4 shrink-0">
        Recent jobs
      </h2>
      <ul className="space-y-3 min-h-0">
        {jobs.map((job) => (
          <li key={job.id}>
            <JobRow job={job} />
          </li>
        ))}
      </ul>
    </section>
  );
}
