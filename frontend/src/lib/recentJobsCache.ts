import type { Job } from "./types";

let cached: Job[] | undefined;

/**
 * Return cached recent jobs (e.g. for instant display while refetching).
 */
export function getCachedRecentJobs(): Job[] | undefined {
  return cached;
}

/**
 * Store recent jobs in memory for the next getCachedRecentJobs().
 */
export function setCachedRecentJobs(jobs: Job[]): void {
  cached = jobs;
}
