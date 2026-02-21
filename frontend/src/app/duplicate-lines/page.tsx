"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

const DEFAULT_TITLE = "AI Upscaler";

type SortOption = "none" | "a-z" | "z-a" | "random";

function processLines(text: string, sort: SortOption): string {
  const lines = text.split(/\r?\n/);
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const line of lines) {
    if (seen.has(line)) continue;
    seen.add(line);
    unique.push(line);
  }
  if (sort === "a-z") unique.sort((a, b) => a.localeCompare(b));
  else if (sort === "z-a") unique.sort((a, b) => b.localeCompare(a));
  else if (sort === "random") {
    for (let i = unique.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [unique[i], unique[j]] = [unique[j], unique[i]];
    }
  }
  return unique.join("\n");
}

export default function DuplicateLinesPage() {
  const [input, setInput] = useState("");
  const [sort, setSort] = useState<SortOption>("none");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const run = useCallback(() => {
    setOutput(processLines(input, sort));
  }, [input, sort]);

  const copy = useCallback(() => {
    if (!output) return;
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [output]);

  useEffect(() => {
    document.title = "Duplicate line remover — AI Upscaler";
    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, []);

  const lineCount = input ? input.split(/\r?\n/).length : 0;
  const uniqueCount = output ? output.split(/\r?\n/).length : 0;

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
          Duplicate line remover
        </h1>
        <p className="text-muted-foreground mb-6">
          Paste a list (one item per line). Remove duplicates and optionally sort A–Z, Z–A, or random.
        </p>
        <div className="space-y-4 max-w-2xl">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Lines
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste one item per line..."
              rows={10}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground font-mono text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-muted-foreground">Sort after dedup:</span>
            {(["none", "a-z", "z-a", "random"] as const).map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setSort(opt)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                  sort === opt
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {opt === "none" ? "None" : opt === "a-z" ? "A–Z" : opt === "z-a" ? "Z–A" : "Random"}
              </button>
            ))}
          </div>
          <Button type="button" variant="primary" onClick={run}>
            Remove duplicates
          </Button>
          {output !== "" && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {lineCount} → {uniqueCount} lines
              </p>
              <pre className="w-full max-h-[300px] overflow-auto rounded-xl border border-input bg-background px-3 py-2 text-foreground font-mono text-sm whitespace-pre-wrap break-words">
                {output}
              </pre>
              <Button type="button" variant="secondary" onClick={copy}>
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
