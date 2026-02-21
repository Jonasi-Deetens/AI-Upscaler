"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

function toSlug(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function SlugGeneratorPage() {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);

  const slug = useMemo(() => toSlug(text), [text]);

  const copy = useCallback(() => {
    if (!slug) return;
    navigator.clipboard.writeText(slug).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [slug]);

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
          Slug generator
        </h1>
        <p className="text-muted-foreground mb-6">
          Turn a title or phrase into a URL-friendly slug (lowercase, hyphens,
          no special characters).
        </p>
        <div className="space-y-4">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="My Title or Phrase"
            className="w-full rounded-xl border border-input bg-background px-3 py-2 text-foreground text-lg"
          />
          {slug && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Slug</p>
              <pre className="w-full rounded-xl border border-input bg-background px-3 py-2 text-foreground font-mono text-sm overflow-auto">
                {slug}
              </pre>
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
