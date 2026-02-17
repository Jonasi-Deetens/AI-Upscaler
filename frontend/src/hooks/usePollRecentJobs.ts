"use client";

import { useEffect, useRef, useCallback } from "react";
import { getRecentJobs } from "@/lib/api";
import { getCachedRecentJobs, setCachedRecentJobs } from "@/lib/recentJobsCache";
import type { Job } from "@/lib/types";

const DEFAULT_INTERVAL_MS = 2500;
const RECENT_JOBS_LIMIT = 10;

export function usePollRecentJobs(
  setJobs: (jobs: Job[]) => void,
  intervalMs = DEFAULT_INTERVAL_MS,
  limit = RECENT_JOBS_LIMIT
) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const visibleRef = useRef(true);

  const fetchJobs = useCallback(async () => {
    try {
      const jobs = await getRecentJobs(limit);
      setCachedRecentJobs(jobs);
      setJobs(jobs);
    } catch {
      // ignore
    }
  }, [setJobs, limit]);

  useEffect(() => {
    const cachedJobs = getCachedRecentJobs();
    if (cachedJobs?.length) setJobs(cachedJobs);

    const startPolling = () => {
      if (intervalRef.current) return;
      fetchJobs();
      intervalRef.current = setInterval(fetchJobs, intervalMs);
    };

    const stopPolling = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    const handleVisibility = () => {
      visibleRef.current = document.visibilityState === "visible";
      if (visibleRef.current) startPolling();
      else stopPolling();
    };

    handleVisibility();
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      stopPolling();
    };
  }, [intervalMs, limit, fetchJobs]);

  return { refetch: fetchJobs };
}
