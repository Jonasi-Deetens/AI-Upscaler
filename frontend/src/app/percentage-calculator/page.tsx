"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

type PctMode = "x-of-y" | "x-is-what-of-y" | "increase-decrease";

export default function PercentageCalculatorPage() {
  const [mode, setMode] = useState<PctMode>("x-of-y");
  const [x, setX] = useState("");
  const [y, setY] = useState("");
  const [z, setZ] = useState("");
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const a = parseFloat(x);
    const b = parseFloat(y);
    const c = parseFloat(z);
    if (mode === "x-of-y") {
      if (Number.isNaN(a) || Number.isNaN(b)) return null;
      return (a / 100) * b;
    }
    if (mode === "x-is-what-of-y") {
      if (Number.isNaN(a) || Number.isNaN(b) || b === 0) return null;
      return (a / b) * 100;
    }
    if (mode === "increase-decrease") {
      if (Number.isNaN(a) || Number.isNaN(c)) return null;
      return a * (1 + c / 100);
    }
    return null;
  }, [mode, x, y, z]);

  const copy = useCallback(() => {
    if (result == null) return;
    const text = String(typeof result === "number" ? (Number.isInteger(result) ? result : result.toFixed(2)) : result);
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
        <h1 className="text-3xl font-bold text-foreground mb-6">Percentage calculator</h1>
        <p className="text-muted-foreground mb-6">
          X% of Y, X is what % of Y, or increase/decrease by Z%.
        </p>
        <div className="space-y-4 max-w-md">
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="pct" checked={mode === "x-of-y"} onChange={() => setMode("x-of-y")} className="border-input" />
              <span className="text-sm text-foreground">X% of Y</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="pct" checked={mode === "x-is-what-of-y"} onChange={() => setMode("x-is-what-of-y")} className="border-input" />
              <span className="text-sm text-foreground">X is what % of Y</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="pct" checked={mode === "increase-decrease"} onChange={() => setMode("increase-decrease")} className="border-input" />
              <span className="text-sm text-foreground">Increase/decrease by Z%</span>
            </label>
          </div>
          {mode === "x-of-y" && (
            <>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">X (%)</label>
                <input type="number" value={x} onChange={(e) => setX(e.target.value)} placeholder="15" className="w-full rounded-xl border border-input bg-background px-3 py-2 text-foreground" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Y</label>
                <input type="number" value={y} onChange={(e) => setY(e.target.value)} placeholder="200" className="w-full rounded-xl border border-input bg-background px-3 py-2 text-foreground" />
              </div>
            </>
          )}
          {mode === "x-is-what-of-y" && (
            <>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">X</label>
                <input type="number" value={x} onChange={(e) => setX(e.target.value)} placeholder="25" className="w-full rounded-xl border border-input bg-background px-3 py-2 text-foreground" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Y</label>
                <input type="number" value={y} onChange={(e) => setY(e.target.value)} placeholder="200" className="w-full rounded-xl border border-input bg-background px-3 py-2 text-foreground" />
              </div>
            </>
          )}
          {mode === "increase-decrease" && (
            <>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Value</label>
                <input type="number" value={x} onChange={(e) => setX(e.target.value)} placeholder="100" className="w-full rounded-xl border border-input bg-background px-3 py-2 text-foreground" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Z (%) — positive = increase, negative = decrease</label>
                <input type="number" value={z} onChange={(e) => setZ(e.target.value)} placeholder="10" className="w-full rounded-xl border border-input bg-background px-3 py-2 text-foreground" />
              </div>
            </>
          )}
          {result != null && (
            <div className="rounded-xl border border-input bg-muted/30 p-4 space-y-2">
              <p className="text-foreground font-mono text-lg">
                {typeof result === "number" ? (Number.isInteger(result) ? result : result.toFixed(2)) : result}
                {mode === "x-is-what-of-y" && "%"}
              </p>
              <Button type="button" variant="secondary" onClick={copy}>{copied ? "Copied" : "Copy"}</Button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
