"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

function bmiCategory(bmi: number): string {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Overweight";
  return "Obese";
}

export default function BmiPage() {
  const [metric, setMetric] = useState(true);
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [feet, setFeet] = useState("");
  const [inches, setInches] = useState("");
  const [weightLb, setWeightLb] = useState("");
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    let h: number;
    let w: number;
    if (metric) {
      const cm = parseFloat(heightCm);
      const kg = parseFloat(weightKg);
      if (Number.isNaN(cm) || cm <= 0 || Number.isNaN(kg) || kg <= 0) return null;
      h = cm / 100;
      w = kg;
    } else {
      const ft = parseFloat(feet) || 0;
      const inVal = parseFloat(inches) || 0;
      const lb = parseFloat(weightLb);
      if (Number.isNaN(lb) || lb <= 0) return null;
      h = (ft * 12 + inVal) * 0.0254;
      w = lb * 0.453592;
    }
    const bmi = w / (h * h);
    return { bmi, category: bmiCategory(bmi) };
  }, [metric, heightCm, weightKg, feet, inches, weightLb]);

  const copy = useCallback(() => {
    if (!result) return;
    const text = `BMI: ${result.bmi.toFixed(1)} — ${result.category}`;
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
        <h1 className="text-3xl font-bold text-foreground mb-6">BMI calculator</h1>
        <p className="text-muted-foreground mb-6">
          Enter height and weight to get your BMI and category (Underweight / Normal / Overweight / Obese).
        </p>
        <div className="space-y-4 max-w-md">
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" checked={metric} onChange={() => setMetric(true)} className="border-input" />
              <span className="text-sm text-foreground">Metric</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" checked={!metric} onChange={() => setMetric(false)} className="border-input" />
              <span className="text-sm text-foreground">Imperial</span>
            </label>
          </div>
          {metric ? (
            <>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Height (cm)</label>
                <input type="number" min="1" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} placeholder="170" className="w-full rounded-xl border border-input bg-background px-3 py-2 text-foreground" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Weight (kg)</label>
                <input type="number" min="0.1" step="0.1" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} placeholder="70" className="w-full rounded-xl border border-input bg-background px-3 py-2 text-foreground" />
              </div>
            </>
          ) : (
            <>
              <div className="flex gap-2">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">Feet</label>
                  <input type="number" min="0" value={feet} onChange={(e) => setFeet(e.target.value)} placeholder="5" className="w-full rounded-xl border border-input bg-background px-3 py-2 text-foreground" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">Inches</label>
                  <input type="number" min="0" max="11" value={inches} onChange={(e) => setInches(e.target.value)} placeholder="10" className="w-full rounded-xl border border-input bg-background px-3 py-2 text-foreground" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Weight (lb)</label>
                <input type="number" min="0.1" step="0.1" value={weightLb} onChange={(e) => setWeightLb(e.target.value)} placeholder="154" className="w-full rounded-xl border border-input bg-background px-3 py-2 text-foreground" />
              </div>
            </>
          )}
          {result && (
            <div className="rounded-xl border border-input bg-muted/30 p-4 space-y-2">
              <p className="text-foreground font-mono text-lg">BMI: {result.bmi.toFixed(1)}</p>
              <p className="text-foreground">{result.category}</p>
              <Button type="button" variant="secondary" onClick={copy}>{copied ? "Copied" : "Copy"}</Button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
