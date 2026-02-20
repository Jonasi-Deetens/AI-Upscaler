"use client";

import { useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

const DEFAULT = `## Hello

- List item one
- List item two

**Bold** and *italic*.

\`code\` and [link](https://example.com).
`;

export default function MarkdownPreviewPage() {
  const [source, setSource] = useState(DEFAULT);

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
          Markdown preview
        </h1>
        <p className="text-muted-foreground mb-6">
          Write markdown and see the rendered result.
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Source
            </label>
            <textarea
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full min-h-[400px] rounded-xl border border-input bg-background px-3 py-2 text-foreground font-mono text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Preview
            </label>
            <div className="min-h-[400px] rounded-xl border border-input bg-card p-4 text-foreground prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{source}</ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
