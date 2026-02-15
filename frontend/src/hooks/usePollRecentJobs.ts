"use client";

import { useEffect, useRef, useCallback } from "react";
import { getRecentJobs } from "@/lib/api";
import type { Job } from "@/lib/types";

const DEFAULT_INTERVAL_MS = 2500;

export function usePollRecentJobs(
  setJobs: (jobs: Job[]) => void,
  intervalMs = DEFAULT_INTERVAL_MS
) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchJobs = useCallback(async () => {
    try {
      const jobs = await getRecentJobs();
      setJobs(jobs);
    } catch {
      // ignore
    }
  }, [setJobs]);

  useEffect(() => {
    fetchJobs();
    intervalRef.current = setInterval(fetchJobs, intervalMs);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [intervalMs, fetchJobs]);

  return { refetch: fetchJobs };
}
