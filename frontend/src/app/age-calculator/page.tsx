"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

function diffDates(from: Date, to: Date): { years: number; months: number; days: number; totalDays: number } {
  let years = to.getFullYear() - from.getFullYear();
  let months = to.getMonth() - from.getMonth();
  let days = to.getDate() - from.getDate();
  if (days < 0) {
    months--;
    const prevMonth = new Date(to.getFullYear(), to.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }
  const totalDays = Math.floor((to.getTime() - from.getTime()) / (24 * 60 * 60 * 1000));
  return { years, months, days, totalDays };
}

export default function AgeCalculatorPage() {
  const [birth, setBirth] = useState("");
  const [asOf, setAsOf] = useState(() => new Date().toISOString().slice(0, 10));
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    if (!birth) return null;
    const from = new Date(birth);
    const to = asOf ? new Date(asOf) : new Date();
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || from > to) return null;
    return diffDates(from, to);
  }, [birth, asOf]);

  const copy = useCallback(() => {
    if (!result) return;
    const text = `Age: ${result.years} years, ${result.months} months, ${result.days} days (${result.totalDays} total days)`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [result]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-5 py-12">
        <Link href="/" className="text-primary text-sm font-medium hover:underline inline-block mb-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded">
          ← Back
        </Link>
        <h1 className="text-3xl font-bold text-foreground mb-6">Age calculator</h1>
        <p className="text-muted-foreground mb-6">
          Enter birth date to get age in years, months, and days. Optionally set &quot;as of&quot; date.
        </p>
        <div className="space-y-4 max-w-md">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">Birth date</label>
            <input type="date" value={birth} onChange={(e) => setBirth(e.target.value)} className="w-full rounded-xl border border-input bg-background px-3 py-2 text-foreground" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">As of date</label>
            <input type="date" value={asOf} onChange={(e) => setAsOf(e.target.value)} className="w-full rounded-xl border border-input bg-background px-3 py-2 text-foreground" />
          </div>
          {result && (
            <div className="rounded-xl border border-input bg-muted/30 p-4 space-y-2">
              <p className="text-foreground">{result.years} years, {result.months} months, {result.days} days</p>
              <p className="text-muted-foreground text-sm">Total: {result.totalDays} days</p>
              <Button type="button" variant="secondary" onClick={copy}>{copied ? "Copied" : "Copy"}</Button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
