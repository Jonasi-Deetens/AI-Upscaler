"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

const COMMON_TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Toronto",
  "America/Vancouver",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Amsterdam",
  "Europe/Moscow",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Asia/Hong_Kong",
  "Asia/Singapore",
  "Asia/Dubai",
  "Australia/Sydney",
  "Australia/Melbourne",
  "Pacific/Auckland",
];

function getTimezones(): string[] {
  if (typeof Intl !== "undefined" && "supportedValuesOf" in Intl) {
    try {
      const list = (Intl as unknown as { supportedValuesOf(key: string): string[] }).supportedValuesOf("timeZone");
      const set = new Set([...COMMON_TIMEZONES, ...list]);
      return Array.from(set).sort();
    } catch {
      return COMMON_TIMEZONES.slice().sort();
    }
  }
  return COMMON_TIMEZONES.slice().sort();
}

function formatInTimezone(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    dateStyle: "medium",
    timeStyle: "long",
  }).format(date);
}

export default function TimezoneConverterPage() {
  const [fromTz, setFromTz] = useState("UTC");
  const [toTz, setToTz] = useState("America/New_York");
  const [dateTimeInput, setDateTimeInput] = useState("");
  const [useNow, setUseNow] = useState(true);

  const timezones = useMemo(() => getTimezones(), []);

  const sourceDate = useMemo(() => {
    if (useNow) return new Date();
    if (!dateTimeInput.trim()) return null;
    const d = new Date(dateTimeInput);
    return Number.isNaN(d.getTime()) ? null : d;
  }, [useNow, dateTimeInput]);

  const result = useMemo(() => {
    if (!sourceDate) return null;
    return {
      from: formatInTimezone(sourceDate, fromTz),
      to: formatInTimezone(sourceDate, toTz),
    };
  }, [sourceDate, fromTz, toTz]);

  const setNow = useCallback(() => {
    setUseNow(true);
    const now = new Date();
    setDateTimeInput(now.toISOString().slice(0, 16));
  }, []);

  const copyResult = useCallback(() => {
    if (!result) return;
    const text = `${fromTz}: ${result.from}\n${toTz}: ${result.to}`;
    navigator.clipboard.writeText(text);
  }, [result, fromTz, toTz]);

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
          Timezone converter
        </h1>
        <p className="text-muted-foreground mb-6">
          Convert a time from one timezone to another. Use current time or enter a date and time.
        </p>
        <div className="space-y-6 max-w-xl">
          <div className="space-y-2">
            <label htmlFor="fromTz" className="text-sm font-medium text-foreground">
              From timezone
            </label>
            <select
              id="fromTz"
              value={fromTz}
              onChange={(e) => setFromTz(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {timezones.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="useNow"
                checked={useNow}
                onChange={(e) => setUseNow(e.target.checked)}
                className="h-4 w-4 rounded border-border"
              />
              <label htmlFor="useNow" className="text-sm font-medium text-foreground">
                Use current time
              </label>
            </div>
            {!useNow && (
              <>
                <label htmlFor="dateTime" className="text-sm font-medium text-foreground block mt-2">
                  Date and time (your device local)
                </label>
                <input
                  id="dateTime"
                  type="datetime-local"
                  value={dateTimeInput}
                  onChange={(e) => setDateTimeInput(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </>
            )}
            <Button type="button" variant="ghost" size="sm" onClick={setNow} className="mt-2">
              Set to now
            </Button>
          </div>
          <div className="space-y-2">
            <label htmlFor="toTz" className="text-sm font-medium text-foreground">
              To timezone
            </label>
            <select
              id="toTz"
              value={toTz}
              onChange={(e) => setToTz(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {timezones.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </div>
          {result && (
            <div className="rounded-xl border border-border bg-card p-4 space-y-2">
              <p className="text-sm text-muted-foreground">{fromTz}</p>
              <p className="font-medium text-foreground">{result.from}</p>
              <p className="text-sm text-muted-foreground mt-3">{toTz}</p>
              <p className="font-medium text-foreground">{result.to}</p>
              <Button type="button" variant="secondary" size="sm" onClick={copyResult} className="mt-3">
                Copy result
              </Button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
