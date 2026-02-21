"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { getMimeType } from "@/lib/mimeTypes";

export default function MimeTypePage() {
  const [input, setInput] = useState("");
  const mime = useMemo(() => getMimeType(input), [input]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-5 py-12">
        <Link href="/" className="text-primary text-sm font-medium hover:underline inline-block mb-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded">
          ← Back
        </Link>
        <h1 className="text-3xl font-bold text-foreground mb-6">MIME type lookup</h1>
        <p className="text-muted-foreground mb-6">
          Enter a file extension (e.g. .pdf) or filename to get the MIME type.
        </p>
        <div className="space-y-4 max-w-md">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder=".pdf or document.pdf"
            className="w-full rounded-xl border border-input bg-background px-3 py-2 text-foreground"
          />
          {input.trim() && (
            <div className="rounded-xl border border-input bg-muted/30 p-4">
              <p className="text-foreground font-mono">{mime ?? "Unknown"}</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
