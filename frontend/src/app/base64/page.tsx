"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function Base64Page() {
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const run = useCallback(() => {
    setError(null);
    if (!input.trim()) {
      setOutput("");
      return;
    }
    try {
      const raw = input.replace(/\s/g, "");
      if (mode === "encode") {
        setOutput(btoa(unescape(encodeURIComponent(input))));
      } else {
        try {
          setOutput(decodeURIComponent(escape(atob(raw))));
        } catch {
          setOutput(atob(raw));
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid input");
      setOutput("");
    }
  }, [mode, input]);

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
        <h1 className="text-3xl font-bold text-foreground mb-6">Base64</h1>
        <p className="text-muted-foreground mb-6">
          Encode or decode text to/from Base64.
        </p>
        <div className="space-y-4">
          <div className="flex gap-4">
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
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === "encode" ? "Text to encode…" : "Base64 to decode…"}
            className="w-full min-h-[120px] rounded-xl border border-input bg-background px-3 py-2 text-foreground font-mono text-sm"
          />
          <Button type="button" variant="cta" onClick={run}>
            {mode === "encode" ? "Encode" : "Decode"}
          </Button>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {output && (
            <div className="space-y-2">
              <textarea
                readOnly
                value={output}
                className="w-full min-h-[120px] rounded-xl border border-input bg-background px-3 py-2 text-foreground font-mono text-sm"
              />
              <Button type="button" variant="secondary" onClick={copy}>
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
