"use client";

import { useEffect, useRef, useCallback } from "react";
import { getJobs } from "@/lib/api";
import type { Job } from "@/lib/types";

export function usePollJobs(
  ids: string[],
  setJobs: (jobs: Job[]) => void,
  intervalMs = 2500
) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchJobs = useCallback(async () => {
    if (ids.length === 0) return;
    try {
      const jobs = await getJobs(ids);
      setJobs(jobs);
      const allTerminal = jobs.every(
        (j) =>
          j.status === "completed" ||
          j.status === "failed" ||
          j.status === "cancelled"
      );
      if (allTerminal && intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    } catch {
      // ignore
    }
  }, [ids.join(","), setJobs]);

  useEffect(() => {
    if (ids.length === 0) return;
    fetchJobs();
    intervalRef.current = setInterval(fetchJobs, intervalMs);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [ids.join(","), intervalMs, fetchJobs]);

  return { refetch: fetchJobs };
}
