"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

function escapeJs(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t")
    .replace(/"/g, '\\"')
    .replace(/'/g, "\\'");
}

function unescapeJs(s: string): string {
  try {
    const wrapped = '"' + s.replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"';
    return JSON.parse(wrapped) as string;
  } catch {
    return s.replace(/\\(.)/g, (_, c) => {
      if (c === "n") return "\n";
      if (c === "r") return "\r";
      if (c === "t") return "\t";
      return c;
    });
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function unescapeHtml(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

export default function EscapeUnescapePage() {
  const [mode, setMode] = useState<"escape" | "unescape">("escape");
  const [subMode, setSubMode] = useState<"js" | "html">("js");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const run = useCallback(() => {
    if (mode === "escape") {
      setOutput(subMode === "js" ? escapeJs(input) : escapeHtml(input));
    } else {
      setOutput(subMode === "js" ? unescapeJs(input) : unescapeHtml(input));
    }
  }, [mode, subMode, input]);

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
        <Link href="/" className="text-primary text-sm font-medium hover:underline inline-block mb-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded">
          ← Back
        </Link>
        <h1 className="text-3xl font-bold text-foreground mb-6">Escape / unescape</h1>
        <p className="text-muted-foreground mb-6">
          Escape or unescape for JavaScript (backslash) or HTML (entities).
        </p>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="mode" checked={mode === "escape"} onChange={() => setMode("escape")} className="border-input" />
              <span className="text-sm text-foreground">Escape</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="mode" checked={mode === "unescape"} onChange={() => setMode("unescape")} className="border-input" />
              <span className="text-sm text-foreground">Unescape</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="sub" checked={subMode === "js"} onChange={() => setSubMode("js")} className="border-input" />
              <span className="text-sm text-foreground">JavaScript</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="sub" checked={subMode === "html"} onChange={() => setSubMode("html")} className="border-input" />
              <span className="text-sm text-foreground">HTML</span>
            </label>
          </div>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Input…" className="w-full min-h-[120px] rounded-xl border border-input bg-background px-3 py-2 text-foreground font-mono text-sm" />
          <Button type="button" variant="cta" onClick={run}>Convert</Button>
          {output && (
            <div className="space-y-2">
              <textarea readOnly value={output} className="w-full min-h-[120px] rounded-xl border border-input bg-background px-3 py-2 text-foreground font-mono text-sm" />
              <Button type="button" variant="secondary" onClick={copy}>{copied ? "Copied" : "Copy"}</Button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
