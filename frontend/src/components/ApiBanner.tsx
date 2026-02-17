"use client";

import { useEffect, useState } from "react";
import { getApiBase, checkHealth } from "@/lib/api";

export function ApiBanner() {
  const [issue, setIssue] = useState<"missing" | "unreachable" | null>(null);

  useEffect(() => {
    const base = getApiBase();
    if (!base) {
      setIssue("missing");
      return;
    }
    checkHealth().then((ok) => {
      if (!ok) setIssue("unreachable");
    });
  }, []);

  if (!issue) return null;

  return (
    <div
      role="alert"
      className="bg-amber-100 dark:bg-amber-900/40 border-b border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 px-4 py-2 text-center text-sm"
    >
      {issue === "missing"
        ? "API URL not configured. Set NEXT_PUBLIC_API_URL in .env."
        : "Cannot reach the API. Check that the backend is running."}
    </div>
  );
}
