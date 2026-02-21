"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

const DEFAULT_TITLE = "AI Upscaler";

export default function RandomNumberPage() {
  useEffect(() => {
    document.title = "Random number — AI Upscaler";
    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, []);
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(100);
  const [integer, setInteger] = useState(true);
  const [result, setResult] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const generate = useCallback(() => {
    const rawLo = Number(min);
    const rawHi = Number(max);
    const lo = Math.min(
      Number.isFinite(rawLo) ? rawLo : 0,
      Number.isFinite(rawHi) ? rawHi : 100
    );
    const hi = Math.max(
      Number.isFinite(rawLo) ? rawLo : 0,
      Number.isFinite(rawHi) ? rawHi : 100
    );
    if (integer) {
      const n = Math.floor(lo + Math.random() * (hi - lo + 1));
      setResult(n);
    } else {
      const n = lo + Math.random() * (hi - lo);
      setResult(n);
    }
  }, [min, max, integer]);

  const copy = useCallback(() => {
    if (result === null) return;
    const text = integer ? String(Math.round(result)) : String(result);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [result, integer]);

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
          Random number
        </h1>
        <p className="text-muted-foreground mb-6">
          Generate a random number between min and max. Integer or float.
        </p>
        <div className="space-y-4 max-w-md">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Min
              </label>
              <input
                type="number"
                value={min}
                onChange={(e) => setMin(Number(e.target.value))}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Max
              </label>
              <input
                type="number"
                value={max}
                onChange={(e) => setMax(Number(e.target.value))}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="type"
                checked={integer}
                onChange={() => setInteger(true)}
                className="border-input"
              />
              <span className="text-sm text-foreground">Integer</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="type"
                checked={!integer}
                onChange={() => setInteger(false)}
                className="border-input"
              />
              <span className="text-sm text-foreground">Float</span>
            </label>
          </div>
          <Button type="button" variant="primary" onClick={generate}>
            Generate
          </Button>
          {result !== null && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-lg font-mono text-foreground" aria-live="polite">
                {integer
                  ? Math.round(result)
                  : Number(result.toFixed(4))}
              </span>
              <Button type="button" variant="secondary" size="sm" onClick={copy}>
                {copied ? "Copied" : "Copy"}
              </Button>
              {copied && (
                <span className="sr-only" aria-live="polite">Copied to clipboard</span>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
