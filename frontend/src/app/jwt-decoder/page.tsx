"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

function base64UrlDecode(str: string): string {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = base64.length % 4;
  const padded = pad ? base64 + "=".repeat(4 - pad) : base64;
  try {
    return decodeURIComponent(
      atob(padded)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
  } catch {
    return "";
  }
}

export default function JwtDecoderPage() {
  const [token, setToken] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const parts = token.trim().split(".");
  let header: object | null = null;
  let payload: object | null = null;
  let error: string | null = null;
  if (parts.length >= 2) {
    try {
      header = JSON.parse(base64UrlDecode(parts[0])) as object;
    } catch {
      error = "Invalid header";
    }
    try {
      payload = JSON.parse(base64UrlDecode(parts[1])) as object;
    } catch {
      if (!error) error = "Invalid payload";
      payload = null;
    }
  } else if (token.trim()) {
    error = "JWT must have at least 2 parts (header.payload)";
  }

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
        <h1 className="text-3xl font-bold text-foreground mb-6">JWT decoder</h1>
        <p className="text-muted-foreground mb-6">
          Paste a JWT to view header and payload. Read-only; signature is not verified.
        </p>
        <div className="space-y-4">
          <textarea
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0…"
            className="w-full min-h-[100px] rounded-xl border border-input bg-background px-3 py-2 text-foreground font-mono text-sm"
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          {(header !== null || payload !== null) && (
            <div className="space-y-4 rounded-2xl bg-card border border-border p-5">
              {header !== null && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">Header</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => copy("header", JSON.stringify(header, null, 2))}
                    >
                      {copied === "header" ? "Copied" : "Copy"}
                    </Button>
                  </div>
                  <pre className="w-full overflow-auto rounded-lg border border-input bg-background px-3 py-2 text-foreground font-mono text-sm">
                    {JSON.stringify(header, null, 2)}
                  </pre>
                </div>
              )}
              {payload !== null && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">Payload</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => copy("payload", JSON.stringify(payload, null, 2))}
                    >
                      {copied === "payload" ? "Copied" : "Copy"}
                    </Button>
                  </div>
                  <pre className="w-full overflow-auto rounded-lg border border-input bg-background px-3 py-2 text-foreground font-mono text-sm">
                    {JSON.stringify(payload, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
