"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

async function sha256(text: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(text);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function sha512(text: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(text);
  const hash = await crypto.subtle.digest("SHA-512", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export default function HashPage() {
  const [input, setInput] = useState("");
  const [sha256Hash, setSha256Hash] = useState("");
  const [sha512Hash, setSha512Hash] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (!input) {
      setSha256Hash("");
      setSha512Hash("");
      return;
    }
    let cancelled = false;
    Promise.all([sha256(input), sha512(input)]).then(([h256, h512]) => {
      if (!cancelled) {
        setSha256Hash(h256);
        setSha512Hash(h512);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [input]);

  const copy = useCallback((label: string, value: string) => {
    navigator.clipboard.writeText(value).then(() => {
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
        <h1 className="text-3xl font-bold text-foreground mb-6">Hash</h1>
        <p className="text-muted-foreground mb-6">
          SHA-256 and SHA-512 (hex) via Web Crypto API.
        </p>
        <div className="space-y-4">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Text to hash…"
            className="w-full min-h-[100px] rounded-xl border border-input bg-background px-3 py-2 text-foreground font-mono text-sm"
          />
          {(sha256Hash || sha512Hash) && (
            <div className="rounded-2xl bg-card border border-border p-5 shadow-sm space-y-4">
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-sm font-medium text-foreground">
                    SHA-256
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => copy("sha256", sha256Hash)}
                  >
                    {copied === "sha256" ? "Copied" : "Copy"}
                  </Button>
                </div>
                <p className="font-mono text-sm text-foreground break-all">
                  {sha256Hash}
                </p>
              </div>
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-sm font-medium text-foreground">
                    SHA-512
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => copy("sha512", sha512Hash)}
                  >
                    {copied === "sha512" ? "Copied" : "Copy"}
                  </Button>
                </div>
                <p className="font-mono text-sm text-foreground break-all">
                  {sha512Hash}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
