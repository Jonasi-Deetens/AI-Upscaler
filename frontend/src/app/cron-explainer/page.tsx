"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import cronstrue from "cronstrue";

export default function CronExplainerPage() {
  const [expr, setExpr] = useState("");

  const result = useMemo(() => {
    const s = expr.trim();
    if (!s) return null;
    try {
      return cronstrue.toString(s);
    } catch {
      return null;
    }
  }, [expr]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-5 py-12">
        <Link
          href="/"
          className="text-primary text-sm font-medium hover:underline inline-block mb-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
        >
          ← Back
        </Link>
        <h1 className="text-3xl font-bold text-foreground mb-6">Cron explainer</h1>
        <p className="text-muted-foreground mb-6">
          Enter a cron expression to see what it does (e.g. 0 9 * * 1-5).
        </p>
        <div className="space-y-4">
          <input
            type="text"
            value={expr}
            onChange={(e) => setExpr(e.target.value)}
            placeholder="0 9 * * 1-5"
            className="w-full max-w-md rounded-xl border border-input bg-background px-3 py-2 text-foreground font-mono"
          />
          {expr.trim() && result === null && (
            <p className="text-sm text-destructive">Invalid cron expression</p>
          )}
          {result && (
            <div className="rounded-2xl bg-card border border-border p-5">
              <p className="text-sm text-muted-foreground mb-1">Meaning</p>
              <p className="text-lg text-foreground">{result}</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
