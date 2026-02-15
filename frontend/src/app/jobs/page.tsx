"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { JobCard } from "@/components/JobCard";
import { usePollJobs } from "@/hooks/usePollJobs";
import type { Job } from "@/lib/types";

function JobsContent() {
  const searchParams = useSearchParams();
  const idsParam = searchParams.get("ids") ?? "";
  const ids = useMemo(
    () => idsParam.split(",").filter(Boolean),
    [idsParam]
  );
  const [jobs, setJobs] = useState<Job[]>([]);
  const { refetch } = usePollJobs(ids, setJobs);

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
          <ul className="space-y-4">
            {jobs.map((job) => (
              <li key={job.id}>
                <JobCard job={job} onCancelled={refetch} />
              </li>
            ))}
          </ul>
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
