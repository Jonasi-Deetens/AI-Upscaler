"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function AsciiUnicodePage() {
  const [charInput, setCharInput] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [mode, setMode] = useState<"char" | "code">("char");
  const [copied, setCopied] = useState<string | null>(null);

  const codePoint = useMemo(() => {
    if (mode === "char" && charInput) {
      const c = charInput[0];
      return c ? c.codePointAt(0) ?? null : null;
    }
    if (mode === "code" && codeInput.trim()) {
      const s = codeInput.trim().toLowerCase();
      if (/^\d+$/.test(s)) return parseInt(s, 10);
      if (/^0x[0-9a-f]+$/.test(s) || /^[0-9a-f]+h?$/.test(s)) {
        const hex = s.replace(/^0x|h$/g, "");
        return parseInt(hex, 16);
      }
      if (/^u\+?[0-9a-f]+$/i.test(s)) return parseInt(s.replace(/^u\+?/i, ""), 16);
      return null;
    }
    return null;
  }, [mode, charInput, codeInput]);

  const character = useMemo(() => {
    if (codePoint === null || codePoint < 0 || codePoint > 0x10ffff) return null;
    return String.fromCodePoint(codePoint);
  }, [codePoint]);

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
        <h1 className="text-3xl font-bold text-foreground mb-6">ASCII / Unicode lookup</h1>
        <p className="text-muted-foreground mb-6">
          Convert between character and code point (decimal, hex, U+hex).
        </p>
        <div className="space-y-6 rounded-2xl bg-card border border-border p-5">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Character → Code</label>
            <input
              type="text"
              value={charInput}
              onChange={(e) => {
                setCharInput(e.target.value);
                setMode("char");
              }}
              placeholder="Enter a character"
              maxLength={2}
              className="w-full max-w-[200px] rounded-lg border border-input bg-background px-3 py-2 text-foreground text-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Code → Character (decimal, 0xhex, or U+hex)</label>
            <input
              type="text"
              value={codeInput}
              onChange={(e) => {
                setCodeInput(e.target.value);
                setMode("code");
              }}
              placeholder="e.g. 65, 0x41, U+0041"
              className="w-full max-w-[280px] rounded-lg border border-input bg-background px-3 py-2 text-foreground font-mono"
            />
          </div>
          {codePoint !== null && (
            <div className="space-y-2 pt-2 border-t border-border">
              <p className="text-sm text-muted-foreground">Result</p>
              <div className="flex flex-wrap gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Character</span>
                  <p className="text-xl font-mono">
                    {character ?? "—"}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="ml-2"
                      onClick={() => character && copy("char", character)}
                    >
                      {copied === "char" ? "Copied" : "Copy"}
                    </Button>
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Code point (decimal)</span>
                  <p className="text-xl font-mono">{codePoint}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Code point (hex)</span>
                  <p className="text-xl font-mono">
                    U+{codePoint.toString(16).toUpperCase().padStart(4, "0")}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="ml-2"
                      onClick={() => copy("hex", "U+" + codePoint.toString(16).toUpperCase().padStart(4, "0"))}
                    >
                      {copied === "hex" ? "Copied" : "Copy"}
                    </Button>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
