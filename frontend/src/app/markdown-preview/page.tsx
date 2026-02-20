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
          Write markdown and see the rendered result. Use a blank line for a new paragraph; end a line with two spaces + Enter for a line break.
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
            <div className="markdown-preview min-h-[400px] rounded-xl border border-input bg-card p-4 text-foreground text-[15px] leading-relaxed [&_h1]:mt-4 [&_h1]:mb-2 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:first:mt-0 [&_h2]:mt-5 [&_h2]:mb-2 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:first:mt-0 [&_h3]:mt-4 [&_h3]:mb-1.5 [&_h3]:text-lg [&_h3]:font-semibold [&_p]:mb-3 [&_ul]:mb-3 [&_ul]:pl-6 [&_ul]:list-disc [&_ol]:mb-3 [&_ol]:pl-6 [&_ol]:list-decimal [&_li]:mb-0.5 [&_code]:rounded [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-sm [&_a]:text-primary [&_a]:underline [&_strong]:font-semibold">
              <ReactMarkdown>{source}</ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
