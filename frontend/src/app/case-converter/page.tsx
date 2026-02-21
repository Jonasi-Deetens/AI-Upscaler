"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

type CaseType =
  | "upper"
  | "lower"
  | "title"
  | "camel"
  | "kebab"
  | "snake";

function toCase(text: string, type: CaseType): string {
  const trimmed = text.trim();
  if (!trimmed) return "";

  switch (type) {
    case "upper":
      return trimmed.toUpperCase();
    case "lower":
      return trimmed.toLowerCase();
    case "title":
      return trimmed
        .toLowerCase()
        .replace(/(?:^|\s)\w/g, (c) => c.toUpperCase());
    case "camel": {
      const words = trimmed
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .split(/\s+/)
        .filter(Boolean);
      return words.length
        ? words[0] +
            words
              .slice(1)
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join("")
        : "";
    }
    case "kebab":
      return trimmed
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
    case "snake":
      return trimmed
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .replace(/\s+/g, "_")
        .replace(/_+/g, "_");
    default:
      return trimmed;
  }
}

const CASE_OPTIONS: { value: CaseType; label: string }[] = [
  { value: "upper", label: "UPPERCASE" },
  { value: "lower", label: "lowercase" },
  { value: "title", label: "Title Case" },
  { value: "camel", label: "camelCase" },
  { value: "kebab", label: "kebab-case" },
  { value: "snake", label: "snake_case" },
];

export default function CaseConverterPage() {
  const [text, setText] = useState("");
  const [caseType, setCaseType] = useState<CaseType>("lower");
  const [copied, setCopied] = useState(false);

  const output = toCase(text, caseType);

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
        <h1 className="text-3xl font-bold text-foreground mb-6">
          Case converter
        </h1>
        <p className="text-muted-foreground mb-6">
          Convert text to UPPER, lower, Title Case, camelCase, kebab-case, or
          snake_case.
        </p>
        <div className="space-y-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste or type here…"
            className="w-full min-h-[140px] rounded-xl border border-input bg-background px-3 py-2 text-foreground font-mono text-sm"
          />
          <div className="flex flex-wrap gap-2">
            {CASE_OPTIONS.map((opt) => (
              <Button
                key={opt.value}
                type="button"
                variant={caseType === opt.value ? "cta" : "secondary"}
                onClick={() => setCaseType(opt.value)}
              >
                {opt.label}
              </Button>
            ))}
          </div>
          {output && (
            <div className="space-y-2">
              <pre className="w-full min-h-[80px] rounded-xl border border-input bg-background px-3 py-2 text-foreground font-mono text-sm overflow-auto whitespace-pre-wrap break-words">
                {output}
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
