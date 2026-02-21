"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

type ViewMode = "side-by-side" | "unified";

interface DiffLine {
  type: "a" | "b" | "both";
  contentA: string;
  contentB: string;
}

function computeLineDiff(linesA: string[], linesB: string[]): DiffLine[] {
  const out: DiffLine[] = [];
  let i = 0;
  let j = 0;
  while (i < linesA.length || j < linesB.length) {
    const a = linesA[i];
    const b = linesB[j];
    if (i < linesA.length && j < linesB.length && a === b) {
      out.push({ type: "both", contentA: a, contentB: b });
      i++;
      j++;
    } else if (j < linesB.length && (i >= linesA.length || !linesA.slice(i).includes(b))) {
      out.push({ type: "b", contentA: "", contentB: b });
      j++;
    } else if (i < linesA.length) {
      out.push({ type: "a", contentA: a, contentB: "" });
      i++;
    } else {
      out.push({ type: "b", contentA: "", contentB: b });
      j++;
    }
  }
  return out;
}

function DiffView({
  lines,
  mode,
}: {
  lines: DiffLine[];
  mode: ViewMode;
}) {
  if (mode === "side-by-side") {
    return (
      <div className="grid grid-cols-2 gap-2 overflow-auto rounded-xl border border-input">
        <div className="min-w-0 bg-background">
          {lines.map((l, i) => (
            <div
              key={`a-${i}`}
              className={`px-2 py-0.5 font-mono text-sm border-b border-border/50 ${
                l.type === "a"
                  ? "bg-destructive/15 text-destructive"
                  : l.type === "both"
                    ? "text-foreground"
                    : "bg-muted/30 text-muted-foreground"
              }`}
            >
              {l.contentA || "\u00a0"}
            </div>
          ))}
        </div>
        <div className="min-w-0 bg-background">
          {lines.map((l, i) => (
            <div
              key={`b-${i}`}
              className={`px-2 py-0.5 font-mono text-sm border-b border-border/50 ${
                l.type === "b"
                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                  : l.type === "both"
                    ? "text-foreground"
                    : "bg-muted/30 text-muted-foreground"
              }`}
            >
              {l.contentB || "\u00a0"}
            </div>
          ))}
        </div>
      </div>
    );
  }
  return (
    <pre className="w-full min-h-[200px] overflow-auto rounded-xl border border-input bg-background px-3 py-2 font-mono text-sm whitespace-pre">
      {lines.map((l, i) => {
        if (l.type === "a")
          return (
            <span key={i} className="block bg-destructive/15 text-destructive">
              - {l.contentA}
            </span>
          );
        if (l.type === "b")
          return (
            <span
              key={i}
              className="block bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
            >
              + {l.contentB}
            </span>
          );
        return (
          <span key={i} className="block text-foreground">
            {"  "}
            {l.contentA}
          </span>
        );
      })}
    </pre>
  );
}

export default function DiffPage() {
  const [textA, setTextA] = useState("");
  const [textB, setTextB] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("side-by-side");

  const linesA = useMemo(
    () => (textA ? textA.split("\n") : []),
    [textA]
  );
  const linesB = useMemo(
    () => (textB ? textB.split("\n") : []),
    [textB]
  );
  const diffLines = useMemo(
    () => computeLineDiff(linesA, linesB),
    [linesA, linesB]
  );

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-5 py-12">
        <Link
          href="/"
          className="text-primary text-sm font-medium hover:underline inline-block mb-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
        >
          ← Back
        </Link>
        <h1 className="text-3xl font-bold text-foreground mb-6">Diff</h1>
        <p className="text-muted-foreground mb-6">
          Compare two texts. Red = only in A, green = only in B.
        </p>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Text A
              </label>
              <textarea
                value={textA}
                onChange={(e) => setTextA(e.target.value)}
                placeholder="First text…"
                className="w-full min-h-[160px] rounded-xl border border-input bg-background px-3 py-2 text-foreground font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Text B
              </label>
              <textarea
                value={textB}
                onChange={(e) => setTextB(e.target.value)}
                placeholder="Second text…"
                className="w-full min-h-[160px] rounded-xl border border-input bg-background px-3 py-2 text-foreground font-mono text-sm"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="view"
                checked={viewMode === "side-by-side"}
                onChange={() => setViewMode("side-by-side")}
                className="border-input"
              />
              <span className="text-sm text-foreground">Side by side</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="view"
                checked={viewMode === "unified"}
                onChange={() => setViewMode("unified")}
                className="border-input"
              />
              <span className="text-sm text-foreground">Unified</span>
            </label>
          </div>
          {(textA || textB) && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Diff
              </label>
              <DiffView lines={diffLines} mode={viewMode} />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
