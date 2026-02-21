"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

// Length: base metre
const LENGTH: Record<string, number> = {
  m: 1,
  km: 1000,
  cm: 0.01,
  mm: 0.001,
  mi: 1609.344,
  yd: 0.9144,
  ft: 0.3048,
  in: 0.0254,
};

// Weight: base kilogram
const WEIGHT: Record<string, number> = {
  kg: 1,
  g: 0.001,
  mg: 0.000001,
  lb: 0.45359237,
  oz: 0.028349523125,
  st: 6.35029318,
};

// Temperature: conversions are linear offsets
function tempToCelsius(value: number, unit: string): number {
  if (unit === "C") return value;
  if (unit === "F") return (value - 32) * (5 / 9);
  if (unit === "K") return value - 273.15;
  return value;
}
function celsiusToTemp(c: number, unit: string): number {
  if (unit === "C") return c;
  if (unit === "F") return c * (9 / 5) + 32;
  if (unit === "K") return c + 273.15;
  return c;
}

type Category = "length" | "weight" | "temperature";

const CATEGORIES: { id: Category; label: string; units: string[] }[] = [
  { id: "length", label: "Length", units: ["m", "km", "cm", "mm", "mi", "yd", "ft", "in"] },
  { id: "weight", label: "Weight", units: ["kg", "g", "mg", "lb", "oz", "st"] },
  { id: "temperature", label: "Temperature", units: ["C", "F", "K"] },
];

export default function UnitConverterPage() {
  const [category, setCategory] = useState<Category>("length");
  const [fromUnit, setFromUnit] = useState("m");
  const [toUnit, setToUnit] = useState("ft");
  const [fromValue, setFromValue] = useState("");

  const result = useMemo(() => {
    const num = parseFloat(fromValue.replace(/,/g, "."));
    if (fromValue.trim() === "" || Number.isNaN(num)) return null;
    const cat = CATEGORIES.find((c) => c.id === category)!;
    if (!cat.units.includes(fromUnit) || !cat.units.includes(toUnit)) return null;
    if (category === "temperature") {
      const c = tempToCelsius(num, fromUnit);
      return celsiusToTemp(c, toUnit);
    }
    if (category === "length") {
      const base = num * (LENGTH[fromUnit] ?? 1);
      return base / (LENGTH[toUnit] ?? 1);
    }
    if (category === "weight") {
      const base = num * (WEIGHT[fromUnit] ?? 1);
      return base / (WEIGHT[toUnit] ?? 1);
    }
    return null;
  }, [category, fromUnit, toUnit, fromValue]);

  const cur = CATEGORIES.find((c) => c.id === category)!;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-5 py-12">
        <Link
          href="/"
          className="text-primary text-sm font-medium hover:underline inline-block mb-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
        >
          ← Back
        </Link>
        <h1 className="text-3xl font-bold text-foreground mb-6">Unit converter</h1>
        <p className="text-muted-foreground mb-6">
          Length, weight, and temperature. Correct conversion factors; client-only.
        </p>
        <div className="space-y-6 rounded-2xl bg-card border border-border p-5">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setCategory(c.id);
                  setFromUnit(c.units[0]!);
                  setToUnit(c.units[1] ?? c.units[0]!);
                }}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                  category === c.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">From</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  inputMode="decimal"
                  value={fromValue}
                  onChange={(e) => setFromValue(e.target.value)}
                  placeholder="0"
                  className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-foreground"
                />
                <select
                  value={fromUnit}
                  onChange={(e) => setFromUnit(e.target.value)}
                  className="rounded-lg border border-input bg-background px-3 py-2 text-foreground min-w-[4rem]"
                >
                  {cur.units.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">To</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={result != null ? String(result) : ""}
                  placeholder="—"
                  className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-foreground opacity-90"
                />
                <select
                  value={toUnit}
                  onChange={(e) => setToUnit(e.target.value)}
                  className="rounded-lg border border-input bg-background px-3 py-2 text-foreground min-w-[4rem]"
                >
                  {cur.units.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
