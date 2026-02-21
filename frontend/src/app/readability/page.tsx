"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

function countSyllables(word: string): number {
  const w = word.toLowerCase().replace(/\W/g, "");
  if (w.length <= 3) return 1;
  let count = 0;
  const vowels = "aeiouy";
  let prevVowel = false;
  for (let i = 0; i < w.length; i++) {
    const isVowel = vowels.includes(w[i]);
    if (isVowel && !prevVowel) count++;
    prevVowel = isVowel;
  }
  if (w.endsWith("e") && count > 1) count--;
  return Math.max(1, count);
}

function fleschReadingEase(sentences: number, words: number, syllables: number): number {
  if (sentences === 0 || words === 0) return 0;
  return 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
}

function scoreLabel(score: number): string {
  if (score >= 90) return "Very easy";
  if (score >= 80) return "Easy";
  if (score >= 70) return "Fairly easy";
  if (score >= 60) return "Standard";
  if (score >= 50) return "Fairly difficult";
  if (score >= 30) return "Difficult";
  return "Very difficult";
}

export default function ReadabilityPage() {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => {
    const trimmed = text.trim();
    if (!trimmed) return null;
    const sentences = trimmed.split(/[.!?]+/).filter(Boolean).length || 1;
    const wordList = trimmed.split(/\s+/).filter(Boolean);
    const words = wordList.length;
    const syllables = wordList.reduce((acc, w) => acc + countSyllables(w), 0);
    const score = fleschReadingEase(sentences, words, syllables);
    return { sentences, words, syllables, score, label: scoreLabel(score) };
  }, [text]);

  const copy = useCallback(() => {
    if (!stats) return;
    const line = `Flesch Reading Ease: ${stats.score.toFixed(1)} — ${stats.label}`;
    navigator.clipboard.writeText(line).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [stats]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-5 py-12">
        <Link href="/" className="text-primary text-sm font-medium hover:underline inline-block mb-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded">
          ← Back
        </Link>
        <h1 className="text-3xl font-bold text-foreground mb-6">Readability</h1>
        <p className="text-muted-foreground mb-6">
          Paste text to get Flesch Reading Ease score and a short label (easy / standard / difficult).
        </p>
        <div className="space-y-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste or type here…"
            className="w-full min-h-[200px] rounded-xl border border-input bg-background px-3 py-2 text-foreground font-mono text-sm"
          />
          {stats && (
            <div className="rounded-xl border border-input bg-muted/30 p-4 space-y-2">
              <p className="text-foreground">Sentences: {stats.sentences} · Words: {stats.words} · Syllables: {stats.syllables}</p>
              <p className="text-foreground font-mono text-lg">Flesch Reading Ease: {stats.score.toFixed(1)} — {stats.label}</p>
              <Button type="button" variant="secondary" onClick={copy}>{copied ? "Copied" : "Copy"}</Button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
