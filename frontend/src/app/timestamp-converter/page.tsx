"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

function parseInput(value: string): number | null {
  const v = value.trim().toLowerCase();
  if (v === "now" || v === "") return Date.now();
  const n = parseInt(value, 10);
  if (Number.isNaN(n)) return null;
  if (n < 1e12) return n * 1000;
  return n;
}

export default function TimestampConverterPage() {
  const [timestampInput, setTimestampInput] = useState("");
  const [dateInput, setDateInput] = useState("");

  const unixToHuman = useMemo(() => {
    const ms = parseInput(timestampInput);
    if (ms == null) return null;
    const d = new Date(ms);
    if (Number.isNaN(d.getTime())) return null;
    return {
      iso: d.toISOString(),
      locale: d.toLocaleString(),
      ms,
      seconds: Math.floor(ms / 1000),
    };
  }, [timestampInput]);

  const humanToUnix = useMemo(() => {
    if (!dateInput.trim()) return null;
    const d = new Date(dateInput);
    if (Number.isNaN(d.getTime())) return null;
    return { ms: d.getTime(), seconds: Math.floor(d.getTime() / 1000) };
  }, [dateInput]);

  const setNow = useCallback(() => {
    const now = Date.now();
    setTimestampInput(String(now));
    setDateInput(new Date(now).toISOString().slice(0, 16));
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-5 py-12">
        <Link
          href="/"
          className="text-primary text-sm font-medium hover:underline inline-block mb-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
        >
          ← Back
        </Link>
        <h1 className="text-3xl font-bold text-foreground mb-6">
          Timestamp converter
        </h1>
        <p className="text-muted-foreground mb-6">
          Convert Unix timestamp (seconds or ms) to date, or date to Unix.
        </p>
        <div className="space-y-6">
          <div className="rounded-2xl bg-card border border-border p-5 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold text-foreground">
              Unix → Date
            </h2>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Unix timestamp (seconds or ms, or &quot;now&quot;)
              </label>
              <input
                type="text"
                value={timestampInput}
                onChange={(e) => setTimestampInput(e.target.value)}
                placeholder="now"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground font-mono"
              />
            </div>
            <Button type="button" variant="secondary" size="sm" onClick={setNow}>
              Use now
            </Button>
            {unixToHuman && (
              <div className="text-sm space-y-1">
                <p className="text-foreground">
                  <span className="text-muted-foreground">ISO:</span>{" "}
                  {unixToHuman.iso}
                </p>
                <p className="text-foreground">
                  <span className="text-muted-foreground">Locale:</span>{" "}
                  {unixToHuman.locale}
                </p>
                <p className="text-foreground">
                  <span className="text-muted-foreground">Seconds:</span>{" "}
                  {unixToHuman.seconds}
                </p>
                <p className="text-foreground">
                  <span className="text-muted-foreground">Ms:</span>{" "}
                  {unixToHuman.ms}
                </p>
              </div>
            )}
          </div>
          <div className="rounded-2xl bg-card border border-border p-5 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold text-foreground">
              Date → Unix
            </h2>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Date / time (ISO or locale string)
              </label>
              <input
                type="datetime-local"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground"
              />
            </div>
            {humanToUnix && (
              <div className="text-sm space-y-1">
                <p className="text-foreground">
                  <span className="text-muted-foreground">Seconds:</span>{" "}
                  {humanToUnix.seconds}
                </p>
                <p className="text-foreground">
                  <span className="text-muted-foreground">Ms:</span>{" "}
                  {humanToUnix.ms}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
