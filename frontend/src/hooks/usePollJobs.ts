"use client";

import { useEffect, useRef, useCallback } from "react";
import { getJobs } from "@/lib/api";
import type { Job } from "@/lib/types";

interface UsePollJobsOptions {
  onError?: (message: string | null) => void;
  onSettled?: () => void;
}

export function usePollJobs(
  ids: string[],
  setJobs: (jobs: Job[]) => void,
  intervalMs = 2500,
  options?: UsePollJobsOptions
) {
  const { onError, onSettled } = options ?? {};
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const visibleRef = useRef(true);

  const fetchJobs = useCallback(async () => {
    if (ids.length === 0) return;
    try {
      const jobs = await getJobs(ids);
      setJobs(jobs);
      onError?.(null);
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
    } catch (e) {
      onError?.(e instanceof Error ? e.message : "Failed to fetch jobs");
    } finally {
      onSettled?.();
    }
  }, [ids.join(","), setJobs, onError, onSettled]);

  useEffect(() => {
    if (ids.length === 0) return;

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
  }, [ids.join(","), intervalMs, fetchJobs]);

  return { refetch: fetchJobs };
}
