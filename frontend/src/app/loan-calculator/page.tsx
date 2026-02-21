"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function LoanCalculatorPage() {
  const [principal, setPrincipal] = useState("");
  const [annualRate, setAnnualRate] = useState("");
  const [years, setYears] = useState("");
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const p = parseFloat(principal);
    const r = parseFloat(annualRate) / 100 / 12;
    const n = parseFloat(years) * 12;
    if (Number.isNaN(p) || p <= 0 || Number.isNaN(n) || n <= 0) return null;
    if (r < 0) return null;
    let emi: number;
    if (r === 0) emi = p / n;
    else emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const total = emi * n;
    const interest = total - p;
    return { emi, total, interest };
  }, [principal, annualRate, years]);

  const copy = useCallback(() => {
    if (!result) return;
    const text = `EMI: $${result.emi.toFixed(2)}\nTotal: $${result.total.toFixed(2)}\nInterest: $${result.interest.toFixed(2)}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [result]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-5 py-12">
        <Link href="/" className="text-primary text-sm font-medium hover:underline inline-block mb-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded">
          ← Back
        </Link>
        <h1 className="text-3xl font-bold text-foreground mb-6">Loan / EMI calculator</h1>
        <p className="text-muted-foreground mb-6">
          Principal, annual interest %, and term in years → monthly payment, total payment, total interest.
        </p>
        <div className="space-y-4 max-w-md">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">Principal ($)</label>
            <input type="number" min="0" step="100" value={principal} onChange={(e) => setPrincipal(e.target.value)} placeholder="200000" className="w-full rounded-xl border border-input bg-background px-3 py-2 text-foreground" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">Annual interest (%)</label>
            <input type="number" min="0" step="0.1" value={annualRate} onChange={(e) => setAnnualRate(e.target.value)} placeholder="5.5" className="w-full rounded-xl border border-input bg-background px-3 py-2 text-foreground" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">Term (years)</label>
            <input type="number" min="1" value={years} onChange={(e) => setYears(e.target.value)} placeholder="30" className="w-full rounded-xl border border-input bg-background px-3 py-2 text-foreground" />
          </div>
          {result && (
            <div className="rounded-xl border border-input bg-muted/30 p-4 space-y-2">
              <p className="text-foreground">Monthly payment (EMI): <span className="font-mono">${result.emi.toFixed(2)}</span></p>
              <p className="text-foreground">Total payment: <span className="font-mono">${result.total.toFixed(2)}</span></p>
              <p className="text-foreground">Total interest: <span className="font-mono">${result.interest.toFixed(2)}</span></p>
              <Button type="button" variant="secondary" onClick={copy}>{copied ? "Copied" : "Copy"}</Button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
