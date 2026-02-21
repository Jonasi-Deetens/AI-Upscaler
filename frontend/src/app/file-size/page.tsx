"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

const UNITS = ["B", "KB", "MB", "GB", "TB"] as const;
const FACTOR = 1024;

function toBytes(val: number, fromUnit: string): number {
  const i = UNITS.indexOf(fromUnit as (typeof UNITS)[number]);
  return i === -1 ? val : val * Math.pow(FACTOR, i);
}

function fromBytes(b: number): { value: number; unit: string }[] {
  return UNITS.map((unit, i) => ({ value: b / Math.pow(FACTOR, i), unit }));
}

export default function FileSizePage() {
  const [value, setValue] = useState("");
  const [fromUnit, setFromUnit] = useState<(typeof UNITS)[number]>("KB");
  const [copied, setCopied] = useState(false);

  const results = useMemo(() => {
    const v = parseFloat(value);
    if (Number.isNaN(v) || v < 0) return null;
    return fromBytes(toBytes(v, fromUnit));
  }, [value, fromUnit]);

  const copy = useCallback(() => {
    if (!results) return;
    navigator.clipboard.writeText(results.map((r) => r.value.toFixed(2) + " " + r.unit).join("\n")).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [results]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-5 py-12">
        <Link href="/" className="text-primary text-sm font-medium hover:underline inline-block mb-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded">
          ← Back
        </Link>
        <h1 className="text-3xl font-bold text-foreground mb-6">File size converter</h1>
        <p className="text-muted-foreground mb-6">
          Convert between bytes, KB, MB, GB, TB (1024-based).
        </p>
        <div className="space-y-4 max-w-md">
          <div className="flex gap-2">
            <input type="number" min="0" step="any" value={value} onChange={(e) => setValue(e.target.value)} placeholder="1" className="flex-1 rounded-xl border border-input bg-background px-3 py-2 text-foreground" />
            <select value={fromUnit} onChange={(e) => setFromUnit(e.target.value as (typeof UNITS)[number])} className="rounded-xl border border-input bg-background px-3 py-2 text-foreground">
              {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          {results && (
            <div className="rounded-xl border border-input bg-muted/30 p-4 space-y-2">
              {results.map((r) => <p key={r.unit} className="text-foreground font-mono">{r.value.toFixed(2)} {r.unit}</p>)}
              <Button type="button" variant="secondary" onClick={copy}>{copied ? "Copied" : "Copy"}</Button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
