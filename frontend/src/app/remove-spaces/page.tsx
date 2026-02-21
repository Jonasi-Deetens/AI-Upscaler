"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

function trimAndCollapse(
  text: string,
  collapseNewlinesTo: "single" | "double" | "none"
): string {
  let out = text.trim();
  out = out.replace(/[ \t]+/g, " ");
  if (collapseNewlinesTo === "single") {
    out = out.replace(/\n{2,}/g, "\n");
  } else if (collapseNewlinesTo === "double") {
    out = out.replace(/\n{3,}/g, "\n\n");
  }
  return out;
}

export default function RemoveSpacesPage() {
  const [text, setText] = useState("");
  const [newlineMode, setNewlineMode] = useState<"single" | "double" | "none">(
    "single"
  );
  const [copied, setCopied] = useState(false);

  const output = trimAndCollapse(text, newlineMode);

  const copy = useCallback(() => {
    if (!output) return;
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [output]);

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
          Remove extra spaces
        </h1>
        <p className="text-muted-foreground mb-6">
          Trim and collapse runs of spaces and newlines.
        </p>
        <div className="space-y-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste text with extra spaces or line breaks…"
            className="w-full min-h-[180px] rounded-xl border border-input bg-background px-3 py-2 text-foreground font-mono text-sm"
          />
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Newlines:
            </span>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="nl"
                checked={newlineMode === "single"}
                onChange={() => setNewlineMode("single")}
                className="border-input"
              />
              <span className="text-sm text-foreground">Single</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="nl"
                checked={newlineMode === "double"}
                onChange={() => setNewlineMode("double")}
                className="border-input"
              />
              <span className="text-sm text-foreground">Double (paragraphs)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="nl"
                checked={newlineMode === "none"}
                onChange={() => setNewlineMode("none")}
                className="border-input"
              />
              <span className="text-sm text-foreground">Keep all</span>
            </label>
          </div>
          {output && (
            <div className="space-y-2">
              <textarea
                readOnly
                value={output}
                className="w-full min-h-[180px] rounded-xl border border-input bg-background px-3 py-2 text-foreground font-mono text-sm"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={copy}
              >
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
