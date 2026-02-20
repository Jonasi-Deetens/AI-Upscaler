"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

const DICE = [4, 6, 8, 12, 20] as const;

export default function RandomPickerPage() {
  const [mode, setMode] = useState<"picker" | "dice">("picker");
  const [listText, setListText] = useState("");
  const [pickCount, setPickCount] = useState(1);
  const [picked, setPicked] = useState<string[]>([]);
  const [die, setDie] = useState<number>(6);
  const [rollResult, setRollResult] = useState<number | null>(null);

  const list = listText
    .split(/\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  const pick = useCallback(() => {
    if (list.length === 0) {
      setPicked([]);
      return;
    }
    const n = Math.min(pickCount, list.length);
    const shuffled = [...list].sort(() => Math.random() - 0.5);
    setPicked(shuffled.slice(0, n));
  }, [list, pickCount]);

  const roll = useCallback(() => {
    setRollResult(1 + Math.floor(Math.random() * die));
  }, [die]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-5 py-12">
        <Link
          href="/"
          className="text-primary text-sm font-medium hover:underline inline-block mb-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
        >
          ← Back
        </Link>
        <h1 className="text-3xl font-bold text-foreground mb-6">
          Random picker & dice
        </h1>
        <p className="text-muted-foreground mb-6">
          Pick random item(s) from a list, or roll a die.
        </p>
        <div className="flex gap-4 mb-6">
          <button
            type="button"
            onClick={() => setMode("picker")}
            className={`rounded-lg px-3 py-2 text-sm font-medium ${
              mode === "picker"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Random picker
          </button>
          <button
            type="button"
            onClick={() => setMode("dice")}
            className={`rounded-lg px-3 py-2 text-sm font-medium ${
              mode === "dice"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Dice
          </button>
        </div>
        {mode === "picker" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                One item per line
              </label>
              <textarea
                value={listText}
                onChange={(e) => setListText(e.target.value)}
                placeholder="Apple\nBanana\nCherry"
                className="w-full min-h-[160px] rounded-xl border border-input bg-background px-3 py-2 text-foreground text-sm"
              />
            </div>
            <div className="flex items-center gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Pick
                </label>
                <input
                  type="number"
                  min={1}
                  max={list.length || 1}
                  value={pickCount}
                  onChange={(e) =>
                    setPickCount(
                      Math.max(
                        1,
                        Math.min(
                          list.length || 1,
                          parseInt(e.target.value, 10) || 1
                        )
                      )
                    )
                  }
                  className="w-20 rounded-lg border border-input bg-background px-3 py-2 text-foreground"
                />
              </div>
              <Button type="button" variant="cta" onClick={pick}>
                Pick
              </Button>
            </div>
            {picked.length > 0 && (
              <div className="rounded-2xl bg-card border border-border p-5 shadow-sm">
                <p className="text-sm text-muted-foreground mb-2">Result</p>
                <ul className="list-disc list-inside text-foreground">
                  {picked.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        {mode === "dice" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Die
              </label>
              <select
                value={die}
                onChange={(e) => setDie(Number(e.target.value))}
                className="rounded-lg border border-input bg-background px-3 py-2 text-foreground"
              >
                {DICE.map((d) => (
                  <option key={d} value={d}>
                    d{d}
                  </option>
                ))}
              </select>
            </div>
            <Button type="button" variant="cta" onClick={roll}>
              Roll
            </Button>
            {rollResult != null && (
              <div className="rounded-2xl bg-card border border-border p-5 shadow-sm">
                <p className="text-sm text-muted-foreground mb-1">Result</p>
                <p className="text-3xl font-bold text-foreground">
                  {rollResult}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
