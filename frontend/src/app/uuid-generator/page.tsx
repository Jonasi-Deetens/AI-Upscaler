"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function UuidGeneratorPage() {
  const [count, setCount] = useState(1);
  const [uuids, setUuids] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const generate = useCallback(() => {
    const list: string[] = [];
    for (let i = 0; i < count; i++) {
      list.push(crypto.randomUUID());
    }
    setUuids(list);
    setCopied(false);
  }, [count]);

  const copyOne = useCallback((uuid: string) => {
    navigator.clipboard.writeText(uuid).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, []);

  const copyAll = useCallback(() => {
    if (uuids.length === 0) return;
    navigator.clipboard.writeText(uuids.join("\n")).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [uuids]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-5 py-12">
        <Link
          href="/"
          className="text-primary text-sm font-medium hover:underline inline-block mb-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
        >
          ← Back
        </Link>
        <h1 className="text-3xl font-bold text-foreground mb-6">UUID generator</h1>
        <p className="text-muted-foreground mb-6">
          Generate UUID v4 (random). Uses crypto.randomUUID().
        </p>
        <div className="space-y-6">
          <div className="rounded-2xl bg-card border border-border p-5 shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Count (1–20)
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={count}
                onChange={(e) =>
                  setCount(
                    Math.min(20, Math.max(1, parseInt(e.target.value, 10) || 1))
                  )
                }
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground"
              />
            </div>
          </div>
          <Button type="button" variant="cta" onClick={generate}>
            Generate
          </Button>
          {uuids.length > 0 && (
            <div className="space-y-3">
              <ul className="space-y-2">
                {uuids.map((uuid, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2 font-mono text-sm"
                  >
                    <span className="break-all text-foreground">{uuid}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => copyOne(uuid)}
                    >
                      Copy
                    </Button>
                  </li>
                ))}
              </ul>
              {uuids.length > 1 && (
                <Button type="button" variant="secondary" onClick={copyAll}>
                  {copied ? "Copied" : "Copy all"}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
