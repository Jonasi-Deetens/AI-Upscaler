"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function UrlParserPage() {
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const parsed = useMemo(() => {
    const s = input.trim();
    if (!s) return null;
    try {
      const url = new URL(s.startsWith("http") ? s : "https://" + s);
      return {
        scheme: url.protocol.replace(":", ""),
        host: url.hostname,
        port: url.port || null,
        pathname: url.pathname,
        search: url.search || null,
        hash: url.hash || null,
        full: url.href,
      };
    } catch {
      return null;
    }
  }, [input]);

  const copy = useCallback((label: string, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    });
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
        <h1 className="text-3xl font-bold text-foreground mb-6">URL parser</h1>
        <p className="text-muted-foreground mb-6">
          Paste a URL to see scheme, host, path, query string, and fragment.
        </p>
        <div className="space-y-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="https://example.com/path?q=1#section"
            className="w-full rounded-xl border border-input bg-background px-3 py-2 text-foreground font-mono"
          />
          {input.trim() && !parsed && (
            <p className="text-sm text-destructive">Invalid URL</p>
          )}
          {parsed && (
            <div className="space-y-3 rounded-2xl bg-card border border-border p-5">
              {[
                { key: "scheme", label: "Scheme", value: parsed.scheme },
                { key: "host", label: "Host", value: parsed.host },
                ...(parsed.port ? [{ key: "port", label: "Port", value: parsed.port }] : []),
                { key: "pathname", label: "Path", value: parsed.pathname },
                ...(parsed.search ? [{ key: "search", label: "Query", value: parsed.search }] : []),
                ...(parsed.hash ? [{ key: "hash", label: "Fragment", value: parsed.hash }] : []),
              ].map(({ key, label, value }) => (
                <div key={key} className="flex flex-wrap items-center gap-2">
                  <span className="w-20 text-sm text-muted-foreground">{label}</span>
                  <code className="flex-1 min-w-0 rounded bg-muted px-2 py-1 text-sm font-mono break-all">
                    {value}
                  </code>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => copy(key, value)}
                  >
                    {copied === key ? "Copied" : "Copy"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
