"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

type Base = 10 | 16 | 2 | 8;

function parseValue(raw: string, base: Base): number | null {
  const s = raw.trim().toLowerCase();
  if (!s) return null;
  if (base === 16 && /^[0-9a-f]+$/.test(s.replace(/^0x/, ""))) {
    return parseInt(s.replace(/^0x/, ""), 16);
  }
  if (base === 2 && /^[01]+$/.test(s.replace(/^0b/, ""))) {
    return parseInt(s.replace(/^0b/, ""), 2);
  }
  if (base === 8 && /^[0-7]+$/.test(s.replace(/^0o/, ""))) {
    return parseInt(s.replace(/^0o/, ""), 8);
  }
  if (base === 10 && /^-?[0-9]+$/.test(s)) {
    return parseInt(s, 10);
  }
  return null;
}

function formatValue(n: number, base: Base): string {
  if (Number.isNaN(n) || !Number.isFinite(n)) return "";
  if (base === 16) return (n >>> 0).toString(16);
  if (base === 2) return (n >>> 0).toString(2);
  if (base === 8) return (n >>> 0).toString(8);
  return String(n);
}

export default function NumberBasePage() {
  const [dec, setDec] = useState("");
  const [hex, setHex] = useState("");
  const [bin, setBin] = useState("");
  const [oct, setOct] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const syncFrom = useCallback(
    (base: Base, value: string) => {
      const n = parseValue(value, base);
      if (n !== null) {
        setDec(formatValue(n, 10));
        setHex(formatValue(n, 16));
        setBin(formatValue(n, 2));
        setOct(formatValue(n, 8));
      }
    },
    []
  );

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
        <h1 className="text-3xl font-bold text-foreground mb-6">Number base converter</h1>
        <p className="text-muted-foreground mb-6">
          Convert between decimal, hex, binary, and octal. Edit any field to update the others.
        </p>
        <div className="space-y-4 rounded-2xl bg-card border border-border p-5">
          {[
            { id: "dec" as const, label: "Decimal", value: dec, setValue: setDec, base: 10 as Base, placeholder: "0" },
            { id: "hex" as const, label: "Hex", value: hex, setValue: setHex, base: 16 as Base, placeholder: "0" },
            { id: "bin" as const, label: "Binary", value: bin, setValue: setBin, base: 2 as Base, placeholder: "0" },
            { id: "oct" as const, label: "Octal", value: oct, setValue: setOct, base: 8 as Base, placeholder: "0" },
          ].map(({ id, label, value, setValue, base, placeholder }) => (
            <div key={id} className="flex flex-wrap items-center gap-2">
              <span className="w-16 text-sm text-muted-foreground">{label}</span>
              <input
                type="text"
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                  syncFrom(base, e.target.value);
                }}
                placeholder={placeholder}
                className="flex-1 min-w-[120px] rounded-lg border border-input bg-background px-3 py-2 text-foreground font-mono"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => copy(id, value)}
                disabled={!value}
              >
                {copied === id ? "Copied" : "Copy"}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
