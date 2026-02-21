"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function FindReplacePage() {
  const [text, setText] = useState("");
  const [find, setFind] = useState("");
  const [replace, setReplace] = useState("");
  const [replaceAll, setReplaceAll] = useState(true);
  const [copied, setCopied] = useState(false);

  const result = replaceAll
    ? find
      ? text.split(find).join(replace)
      : text
    : find
      ? text.replace(find, replace)
      : text;

  const copy = useCallback(() => {
    if (!result) return;
    navigator.clipboard.writeText(result).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [result]);

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
          Find & replace
        </h1>
        <p className="text-muted-foreground mb-6">
          Paste text, enter find and replace strings, then copy the result.
        </p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Text
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your text…"
              className="w-full min-h-[140px] rounded-xl border border-input bg-background px-3 py-2 text-foreground font-mono text-sm"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Find
              </label>
              <input
                type="text"
                value={find}
                onChange={(e) => setFind(e.target.value)}
                placeholder="Search for…"
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-foreground font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Replace with
              </label>
              <input
                type="text"
                value={replace}
                onChange={(e) => setReplace(e.target.value)}
                placeholder="Replace with…"
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-foreground font-mono"
              />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={replaceAll}
              onChange={(e) => setReplaceAll(e.target.checked)}
              className="border-input rounded"
            />
            <span className="text-sm text-foreground">Replace all</span>
          </label>
          {text && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Result
              </label>
              <textarea
                readOnly
                value={result}
                className="w-full min-h-[140px] rounded-xl border border-input bg-background px-3 py-2 text-foreground font-mono text-sm"
              />
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
