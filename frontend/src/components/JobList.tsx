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
    <Link href={`/jobs?ids=${job.id}`} className="block border border-border rounded-lg bg-card text-left transition-shadow hover:border-primary/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
      <div className="flex items-center gap-3 p-2">
        {job.thumbnail_url ? (
          <div className="shrink-0 w-10 h-10 rounded-lg overflow-hidden bg-muted relative">
            {/* eslint-disable-next-line @next/next/no-img-element -- dynamic API URL (thumbnail) */}
            <img
              src={job.thumbnail_url}
              alt=""
              className="absolute inset-0 size-full object-cover"
            />
          </div>
        ) : (
          <div className="shrink-0 w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground text-xs">
            —
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-medium text-foreground truncate">
            {job.original_filename}
          </p>
          <p className="text-sm text-muted-foreground">
            {statusLabels[job.status] ?? job.status}
            {job.status === "processing" && job.status_detail && (
              <span className="ml-1">· {job.status_detail}</span>
            )}
          </p>
        </div>
        <span className="text-muted-foreground shrink-0" aria-hidden>
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
        <p className="text-muted-foreground">
          Loading…
        </p>
      </section>
    );
  }

  if (jobs.length === 0) {
    return (
      <section className="w-full">
        <p className="text-muted-foreground">
          No jobs yet. Upload images to get started.
        </p>
      </section>
    );
  }

  return (
    <section className="w-full min-h-0 flex flex-col">
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
