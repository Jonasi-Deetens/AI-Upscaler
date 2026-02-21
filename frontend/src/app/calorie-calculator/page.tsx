"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

// Mifflin–St Jeor BMR
function bmrMifflin(sex: "m" | "f", age: number, weightKg: number, heightCm: number): number {
  if (sex === "m") return 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  return 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
}

const ACTIVITY: { label: string; mult: number }[] = [
  { label: "Sedentary (little or no exercise)", mult: 1.2 },
  { label: "Light (1–3 days/week)", mult: 1.375 },
  { label: "Moderate (3–5 days/week)", mult: 1.55 },
  { label: "Active (6–7 days/week)", mult: 1.725 },
  { label: "Very active (intense daily)", mult: 1.9 },
];

export default function CalorieCalculatorPage() {
  const [sex, setSex] = useState<"m" | "f">("m");
  const [age, setAge] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [activityIndex, setActivityIndex] = useState(0);

  const result = useMemo(() => {
    const a = parseInt(age, 10);
    const w = parseFloat(weightKg);
    const h = parseFloat(heightCm);
    if (Number.isNaN(a) || a < 1 || a > 120 || Number.isNaN(w) || w <= 0 || Number.isNaN(h) || h <= 0) return null;
    const bmr = bmrMifflin(sex, a, w, h);
    const mult = ACTIVITY[activityIndex]?.mult ?? 1.2;
    const daily = Math.round(bmr * mult);
    return { bmr: Math.round(bmr), daily };
  }, [sex, age, weightKg, heightCm, activityIndex]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-5 py-12">
        <Link href="/" className="text-primary text-sm font-medium hover:underline inline-block mb-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded">
          ← Back
        </Link>
        <h1 className="text-3xl font-bold text-foreground mb-6">Calorie calculator</h1>
        <p className="text-muted-foreground mb-6">
          BMR (Mifflin–St Jeor) and estimated daily calories to maintain weight based on activity level.
        </p>
        <div className="space-y-4 max-w-md">
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" checked={sex === "m"} onChange={() => setSex("m")} className="border-input" />
              <span className="text-sm text-foreground">Male</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" checked={sex === "f"} onChange={() => setSex("f")} className="border-input" />
              <span className="text-sm text-foreground">Female</span>
            </label>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">Age (years)</label>
            <input type="number" min="1" max="120" value={age} onChange={(e) => setAge(e.target.value)} placeholder="30" className="w-full rounded-xl border border-input bg-background px-3 py-2 text-foreground" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">Weight (kg)</label>
            <input type="number" min="0.1" step="0.1" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} placeholder="70" className="w-full rounded-xl border border-input bg-background px-3 py-2 text-foreground" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">Height (cm)</label>
            <input type="number" min="1" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} placeholder="170" className="w-full rounded-xl border border-input bg-background px-3 py-2 text-foreground" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">Activity level</label>
            <select value={activityIndex} onChange={(e) => setActivityIndex(parseInt(e.target.value, 10))} className="w-full rounded-xl border border-input bg-background px-3 py-2 text-foreground">
              {ACTIVITY.map((a, i) => (
                <option key={i} value={i}>{a.label}</option>
              ))}
            </select>
          </div>
          {result && (
            <div className="rounded-xl border border-input bg-muted/30 p-4 space-y-2">
              <p className="text-foreground">BMR: <span className="font-mono">{result.bmr}</span> kcal/day</p>
              <p className="text-foreground">Est. daily to maintain: <span className="font-mono">{result.daily}</span> kcal</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
