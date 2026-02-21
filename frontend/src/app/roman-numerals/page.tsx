"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

const ROMAN_VALUES: [number, string][] = [
  [1000, "M"],
  [900, "CM"],
  [500, "D"],
  [400, "CD"],
  [100, "C"],
  [90, "XC"],
  [50, "L"],
  [40, "XL"],
  [10, "X"],
  [9, "IX"],
  [5, "V"],
  [4, "IV"],
  [1, "I"],
];

function numberToRoman(n: number): string {
  if (n < 1 || n > 3999 || n !== Math.floor(n)) return "";
  let out = "";
  let x = n;
  for (const [val, sym] of ROMAN_VALUES) {
    while (x >= val) {
      out += sym;
      x -= val;
    }
  }
  return out;
}

const ROMAN_PAIRS = [
  "CM", "CD", "XC", "XL", "IX", "IV",
  "M", "D", "C", "L", "X", "V", "I",
];
const ROMAN_MAP: Record<string, number> = {
  M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90,
  L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1,
};

function romanToNumber(s: string): number | null {
  const raw = s.trim().toUpperCase().replace(/\s/g, "");
  if (!raw) return null;
  let n = 0;
  let i = 0;
  while (i < raw.length) {
    let found = false;
    for (const pair of ROMAN_PAIRS) {
      if (raw.slice(i, i + pair.length) === pair) {
        n += ROMAN_MAP[pair];
        i += pair.length;
        found = true;
        break;
      }
    }
    if (!found) return null;
  }
  return n;
}

export default function RomanNumeralsPage() {
  const [mode, setMode] = useState<"to-roman" | "to-number">("to-roman");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const run = useCallback(() => {
    setError(null);
    const raw = input.trim();
    if (!raw) {
      setOutput("");
      return;
    }
    if (mode === "to-roman") {
      const n = parseInt(raw, 10);
      if (Number.isNaN(n) || n < 1 || n > 3999) {
        setError("Enter an integer between 1 and 3999");
        setOutput("");
        return;
      }
      setOutput(numberToRoman(n));
    } else {
      const n = romanToNumber(raw);
      if (n === null) {
        setError("Invalid Roman numeral");
        setOutput("");
        return;
      }
      setOutput(String(n));
    }
  }, [mode, input]);

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
        <h1 className="text-3xl font-bold text-foreground mb-6">Roman numerals</h1>
        <p className="text-muted-foreground mb-6">
          Convert between numbers and Roman numerals (e.g. 2024 ↔ MMXXIV). 1–3999 only.
        </p>
        <div className="space-y-4">
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="mode"
                checked={mode === "to-roman"}
                onChange={() => setMode("to-roman")}
                className="border-input"
              />
              <span className="text-sm text-foreground">Number → Roman</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="mode"
                checked={mode === "to-number"}
                onChange={() => setMode("to-number")}
                className="border-input"
              />
              <span className="text-sm text-foreground">Roman → Number</span>
            </label>
          </div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === "to-roman" ? "e.g. 2024" : "e.g. MMXXIV"}
            className="w-full rounded-xl border border-input bg-background px-3 py-2 text-foreground font-mono text-sm"
          />
          <Button type="button" variant="cta" onClick={run}>
            Convert
          </Button>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {output && (
            <div className="space-y-2">
              <p className="text-foreground font-mono text-lg">{output}</p>
              <Button type="button" variant="secondary" onClick={copy}>
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
