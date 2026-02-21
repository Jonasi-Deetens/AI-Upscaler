"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

const DEFAULT_TITLE = "AI Upscaler";

export default function UrlEncodePage() {
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [usePlusForSpace, setUsePlusForSpace] = useState(false);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const run = useCallback(() => {
    setError(null);
    if (!input) {
      setOutput("");
      return;
    }
    try {
      if (mode === "encode") {
        const encoded = usePlusForSpace
          ? input.split(" ").map(encodeURIComponent).join("+")
          : encodeURIComponent(input);
        setOutput(encoded);
      } else {
        const normalized = usePlusForSpace ? input.replace(/\+/g, " ") : input;
        setOutput(decodeURIComponent(normalized));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid input");
      setOutput("");
    }
  }, [mode, input, usePlusForSpace]);

  const copy = useCallback(() => {
    if (!output) return;
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [output]);

  useEffect(() => {
    document.title = "URL encode/decode — AI Upscaler";
    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, []);

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
          URL encode / decode
        </h1>
        <p className="text-muted-foreground mb-6">
          Percent-encode for query strings or decode back. Option: use + for space (form encoding).
        </p>
        <div className="space-y-4 max-w-2xl">
          <div className="flex gap-4 flex-wrap">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="mode"
                checked={mode === "encode"}
                onChange={() => setMode("encode")}
                className="border-input"
              />
              <span className="text-sm text-foreground">Encode</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="mode"
                checked={mode === "decode"}
                onChange={() => setMode("decode")}
                className="border-input"
              />
              <span className="text-sm text-foreground">Decode</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={usePlusForSpace}
                onChange={(e) => setUsePlusForSpace(e.target.checked)}
                className="border-input"
              />
              <span className="text-sm text-foreground">Use + for space</span>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              {mode === "encode" ? "Text" : "Encoded string"}
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={mode === "encode" ? "hello world" : "hello%20world"}
              rows={3}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground font-mono text-sm"
            />
          </div>
          <Button type="button" variant="cta" onClick={run}>
            {mode === "encode" ? "Encode" : "Decode"}
          </Button>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          {output && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Result
              </label>
              <pre className="w-full max-h-[200px] overflow-auto rounded-xl border border-input bg-background px-3 py-2 text-foreground font-mono text-sm whitespace-pre-wrap break-all">
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
