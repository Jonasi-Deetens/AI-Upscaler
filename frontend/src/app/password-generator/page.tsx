"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWER = "abcdefghijklmnopqrstuvwxyz";
const NUMBERS = "0123456789";
const SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>?";

function generatePassword(
  length: number,
  opts: { upper: boolean; lower: boolean; numbers: boolean; symbols: boolean }
): string {
  let pool = "";
  if (opts.lower) pool += LOWER;
  if (opts.upper) pool += UPPER;
  if (opts.numbers) pool += NUMBERS;
  if (opts.symbols) pool += SYMBOLS;
  if (!pool) pool = LOWER;
  const arr = new Uint32Array(length);
  crypto.getRandomValues(arr);
  return Array.from(arr, (n) => pool[n % pool.length]).join("");
}

export default function PasswordGeneratorPage() {
  const [length, setLength] = useState(16);
  const [upper, setUpper] = useState(true);
  const [lower, setLower] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);

  const generate = useCallback(() => {
    setPassword(
      generatePassword(length, { upper, lower, numbers, symbols })
    );
    setCopied(false);
  }, [length, upper, lower, numbers, symbols]);

  const copy = useCallback(() => {
    if (!password) return;
    navigator.clipboard.writeText(password).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [password]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-5 py-12">
        <Link
          href="/"
          className="text-primary text-sm font-medium hover:underline inline-block mb-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
        >
          ← Back
        </Link>
        <h1 className="text-3xl font-bold text-foreground mb-6">Password generator</h1>
        <p className="text-muted-foreground mb-6">
          Generate a random password. Choose length and character types.
        </p>
        <div className="space-y-6">
          <div className="rounded-2xl bg-card border border-border p-5 shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Length (8–64)
              </label>
              <input
                type="number"
                min={8}
                max={64}
                value={length}
                onChange={(e) =>
                  setLength(
                    Math.min(64, Math.max(8, parseInt(e.target.value, 10) || 8))
                  )
                }
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground"
              />
            </div>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={upper}
                  onChange={(e) => setUpper(e.target.checked)}
                  className="rounded border-input"
                />
                <span className="text-sm text-foreground">Uppercase</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={lower}
                  onChange={(e) => setLower(e.target.checked)}
                  className="rounded border-input"
                />
                <span className="text-sm text-foreground">Lowercase</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={numbers}
                  onChange={(e) => setNumbers(e.target.checked)}
                  className="rounded border-input"
                />
                <span className="text-sm text-foreground">Numbers</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={symbols}
                  onChange={(e) => setSymbols(e.target.checked)}
                  className="rounded border-input"
                />
                <span className="text-sm text-foreground">Symbols</span>
              </label>
            </div>
          </div>
          <Button type="button" variant="cta" onClick={generate}>
            Generate
          </Button>
          {password && (
            <div className="rounded-2xl bg-card border border-border p-5 shadow-sm space-y-3">
              <p className="text-sm text-muted-foreground">Generated password</p>
              <p className="font-mono text-foreground break-all select-all">
                {password}
              </p>
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
