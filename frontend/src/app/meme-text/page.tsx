"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

const DEFAULT_TITLE = "AI Upscaler";

function toMockingCase(text: string): string {
  return text
    .split("")
    .map((c, i) => (i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()))
    .join("");
}

export default function MemeTextPage() {
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.title = "Meme text — AI Upscaler";
    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, []);

  const output = toMockingCase(input);

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
          Meme text (Mocking SpongeBob)
        </h1>
        <p className="text-muted-foreground mb-6">
          Turn text into alternating case — lIkE tHiS.
        </p>
        <div className="space-y-4 max-w-xl">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Text
            </label>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type something..."
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground"
            />
          </div>
          {output && (
            <div className="space-y-2">
              <pre className="w-full max-h-[200px] overflow-auto rounded-xl border border-input bg-background px-3 py-2 text-foreground font-medium text-sm whitespace-pre-wrap break-words">
                {output}
              </pre>
              <div className="flex items-center gap-2">
                <Button type="button" variant="secondary" size="sm" onClick={copy}>
                  {copied ? "Copied" : "Copy"}
                </Button>
                {copied && (
                  <span className="sr-only" aria-live="polite">Copied to clipboard</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
