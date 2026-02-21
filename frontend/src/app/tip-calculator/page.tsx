"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function TipCalculatorPage() {
  const [bill, setBill] = useState("");
  const [tipPct, setTipPct] = useState("15");
  const [split, setSplit] = useState("1");
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const b = parseFloat(bill);
    const p = parseFloat(tipPct);
    const s = Math.max(1, Math.floor(parseFloat(split)) || 1);
    if (Number.isNaN(b) || b <= 0) return null;
    const tip = (b * (p / 100));
    const total = b + tip;
    return { tip, total, perPerson: total / s };
  }, [bill, tipPct, split]);

  const copy = useCallback(() => {
    if (!result) return;
    const lines = [
      `Bill: $${parseFloat(bill).toFixed(2)}`,
      `Tip (${tipPct}%): $${result.tip.toFixed(2)}`,
      `Total: $${result.total.toFixed(2)}`,
      parseFloat(split) > 1 ? `Per person (${split}): $${result.perPerson.toFixed(2)}` : null,
    ].filter(Boolean);
    navigator.clipboard.writeText(lines.join("\n")).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [result, bill, tipPct, split]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-5 py-12">
        <Link href="/" className="text-primary text-sm font-medium hover:underline inline-block mb-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded">
          ← Back
        </Link>
        <h1 className="text-3xl font-bold text-foreground mb-6">Tip calculator</h1>
        <p className="text-muted-foreground mb-6">
          Enter bill amount, tip percentage, and optional split count. See tip, total, and per person.
        </p>
        <div className="space-y-4 max-w-md">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">Bill amount ($)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={bill}
              onChange={(e) => setBill(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-foreground"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">Tip (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              step="1"
              value={tipPct}
              onChange={(e) => setTipPct(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-foreground"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">Split (people)</label>
            <input
              type="number"
              min="1"
              value={split}
              onChange={(e) => setSplit(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-foreground"
            />
          </div>
          {result && (
            <div className="rounded-xl border border-input bg-muted/30 p-4 space-y-2">
              <p className="text-foreground">Tip: <span className="font-mono">${result.tip.toFixed(2)}</span></p>
              <p className="text-foreground">Total: <span className="font-mono">${result.total.toFixed(2)}</span></p>
              {parseFloat(split) > 1 && (
                <p className="text-foreground">Per person: <span className="font-mono">${result.perPerson.toFixed(2)}</span></p>
              )}
              <Button type="button" variant="secondary" onClick={copy}>{copied ? "Copied" : "Copy"}</Button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
