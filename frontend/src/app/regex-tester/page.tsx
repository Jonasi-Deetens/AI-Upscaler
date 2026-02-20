"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";

export default function RegexTesterPage() {
  const [pattern, setPattern] = useState("");
  const [testString, setTestString] = useState("");
  const [flags, setFlags] = useState("g");
  const [error, setError] = useState<string | null>(null);

  const result = useMemo(() => {
    setError(null);
    if (!pattern.trim()) return null;
    try {
      const re = new RegExp(pattern, flags);
      const matches: RegExpExecArray[] = [];
      let m: RegExpExecArray | null;
      const re2 = new RegExp(pattern, flags);
      while ((m = re2.exec(testString)) !== null) {
        matches.push([...m] as RegExpExecArray);
        if (!re.global) break;
      }
      return { regex: re, matches };
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid regex");
      return null;
    }
  }, [pattern, testString, flags]);

  const toggleFlag = useCallback((f: string) => {
    setFlags((prev) =>
      prev.includes(f) ? prev.replace(f, "") : prev + f
    );
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
        <h1 className="text-3xl font-bold text-foreground mb-6">Regex tester</h1>
        <p className="text-muted-foreground mb-6">
          Test a regular expression against a string. See matches and groups.
        </p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Pattern
            </label>
            <input
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="e.g. \w+@\w+\.\w+"
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-foreground font-mono"
            />
          </div>
          <div className="flex gap-4">
            {["g", "i", "m"].map((f) => (
              <label key={f} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={flags.includes(f)}
                  onChange={() => toggleFlag(f)}
                  className="rounded border-input"
                />
                <span className="text-sm text-foreground">{f}</span>
              </label>
            ))}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Test string
            </label>
            <textarea
              value={testString}
              onChange={(e) => setTestString(e.target.value)}
              placeholder="Text to test…"
              className="w-full min-h-[120px] rounded-xl border border-input bg-background px-3 py-2 text-foreground font-mono text-sm"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {result && !error && (
            <div className="rounded-2xl bg-card border border-border p-5 shadow-sm space-y-2">
              <p className="text-sm text-muted-foreground">
                Matches: {result.matches.length}
              </p>
              {result.matches.length > 0 ? (
                <ul className="list-disc list-inside space-y-1 font-mono text-sm text-foreground">
                  {result.matches.map((m, i) => (
                    <li key={i}>
                      {m[0]}
                      {m.length > 1 && ` → groups: ${m.slice(1).join(", ")}`}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No matches.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
