"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

const WPM = 200;

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).filter(Boolean).length;
}

export default function WordCounterPage() {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);

  const words = countWords(text);
  const chars = text.length;
  const charsNoSpaces = text.replace(/\s/g, "").length;
  const bytesUtf8 = new TextEncoder().encode(text).length;
  const lines = text ? text.split(/\n/).length : 0;
  const readingMinutes = Math.ceil(words / WPM) || 0;

  const copy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [text]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-5 py-12">
        <Link
          href="/"
          className="text-primary text-sm font-medium hover:underline inline-block mb-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
        >
          ← Back
        </Link>
        <h1 className="text-3xl font-bold text-foreground mb-6">Word counter</h1>
        <p className="text-muted-foreground mb-6">
          Paste text to see word count, characters, bytes (UTF-8), and reading time (~{WPM} wpm).
        </p>
        <div className="space-y-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste or type here…"
            className="w-full min-h-[200px] rounded-xl border border-input bg-background px-3 py-2 text-foreground font-mono text-sm"
          />
          <div className="rounded-2xl bg-card border border-border p-5 shadow-sm flex flex-wrap gap-6">
            <div>
              <span className="text-sm text-muted-foreground">Words</span>
              <p className="text-xl font-semibold text-foreground">{words}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Characters</span>
              <p className="text-xl font-semibold text-foreground">{chars}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Characters (no spaces)</span>
              <p className="text-xl font-semibold text-foreground">{charsNoSpaces}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Bytes (UTF-8)</span>
              <p className="text-xl font-semibold text-foreground">{bytesUtf8}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Lines</span>
              <p className="text-xl font-semibold text-foreground">{lines}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Reading time</span>
              <p className="text-xl font-semibold text-foreground">
                {readingMinutes} min
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={copy}
            disabled={!text}
          >
            {copied ? "Copied" : "Copy text"}
          </Button>
        </div>
      </div>
    </main>
  );
}
