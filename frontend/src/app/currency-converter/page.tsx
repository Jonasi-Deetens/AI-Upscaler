"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { getCurrencyRates, type CurrencyRates } from "@/lib/api";

const COMMON = ["USD", "EUR", "GBP", "JPY", "CHF", "CAD", "AUD", "CNY", "INR", "MXN"];

export default function CurrencyConverterPage() {
  const [rates, setRates] = useState<CurrencyRates | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [base, setBase] = useState("USD");
  const [amount, setAmount] = useState("1");
  const [fromCur, setFromCur] = useState("USD");
  const [toCur, setToCur] = useState("EUR");

  useEffect(() => {
    setLoading(true);
    setError(null);
    getCurrencyRates(base)
      .then(setRates)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load rates"))
      .finally(() => setLoading(false));
  }, [base]);

  const result = useMemo(() => {
    if (!rates?.rates) return null;
    const num = parseFloat(amount.replace(/,/g, "."));
    if (Number.isNaN(num)) return null;
    const fromRate = rates.rates[fromCur] ?? 0;
    const toRate = rates.rates[toCur] ?? 0;
    if (fromRate === 0) return null;
    return (num * toRate) / fromRate;
  }, [rates, amount, fromCur, toCur]);

  const currencies = useMemo(() => {
    if (!rates?.rates) return COMMON;
    return [...new Set([...COMMON, ...Object.keys(rates.rates)])].sort();
  }, [rates]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-5 py-12">
        <Link
          href="/"
          className="text-primary text-sm font-medium hover:underline inline-block mb-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
        >
          ← Back
        </Link>
        <h1 className="text-3xl font-bold text-foreground mb-6">Currency converter</h1>
        <p className="text-muted-foreground mb-6">
          Live exchange rates via API (Frankfurter). Choose base currency to load rates.
        </p>
        <div className="space-y-6 rounded-2xl bg-card border border-border p-5">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Base currency (load rates)</label>
            <select
              value={base}
              onChange={(e) => setBase(e.target.value)}
              className="rounded-lg border border-input bg-background px-3 py-2 text-foreground"
            >
              {COMMON.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          {loading && <p className="text-sm text-muted-foreground">Loading rates…</p>}
          {error && <p className="text-sm text-destructive">{error}</p>}
          {rates && (
            <>
              <p className="text-sm text-muted-foreground">Rates as of {rates.date}</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Amount</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="1"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">From</label>
                  <select
                    value={fromCur}
                    onChange={(e) => setFromCur(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground"
                  >
                    {currencies.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">To</label>
                  <select
                    value={toCur}
                    onChange={(e) => setToCur(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground"
                  >
                    {currencies.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              {result != null && (
                <p className="text-lg font-semibold text-foreground">
                  {Number(amount) || 0} {fromCur} = {result.toLocaleString(undefined, { maximumFractionDigits: 6 })} {toCur}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
