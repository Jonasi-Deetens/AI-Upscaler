"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

const LOREM_WORDS = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
  "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
  "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud",
  "exercitation", "ullamco", "laboris", "nisi", "aliquip", "ex", "ea", "commodo",
  "consequat", "duis", "aute", "irure", "in", "reprehenderit", "voluptate",
  "velit", "esse", "cillum", "fugiat", "nulla", "pariatur", "excepteur", "sint",
  "occaecat", "cupidatat", "non", "proident", "sunt", "culpa", "qui", "officia",
  "deserunt", "mollit", "anim", "id", "est", "laborum",
];

function randomWord(): string {
  return LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)];
}

function randomSentence(min: number, max: number): string {
  const n = min + Math.floor(Math.random() * (max - min + 1));
  const words = Array.from({ length: n }, randomWord);
  words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
  return words.join(" ") + ".";
}

function randomParagraph(sentences: number): string {
  return Array.from({ length: sentences }, () =>
    randomSentence(5, 15)
  ).join(" ");
}

export default function LoremIpsumPage() {
  const [mode, setMode] = useState<"paragraphs" | "sentences" | "words">("paragraphs");
  const [count, setCount] = useState(3);
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const generate = useCallback(() => {
    if (mode === "words") {
      setOutput(
        Array.from({ length: count }, randomWord).join(" ")
      );
    } else if (mode === "sentences") {
      setOutput(
        Array.from({ length: count }, () => randomSentence(5, 15)).join(" ")
      );
    } else {
      setOutput(
        Array.from({ length: count }, () => randomParagraph(4)).join("\n\n")
      );
    }
    setCopied(false);
  }, [mode, count]);

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
        <h1 className="text-3xl font-bold text-foreground mb-6">Lorem ipsum</h1>
        <p className="text-muted-foreground mb-6">
          Generate placeholder text: paragraphs, sentences, or words.
        </p>
        <div className="space-y-6">
          <div className="rounded-2xl bg-card border border-border p-5 shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Type
              </label>
              <select
                value={mode}
                onChange={(e) =>
                  setMode(e.target.value as "paragraphs" | "sentences" | "words")
                }
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground"
              >
                <option value="paragraphs">Paragraphs</option>
                <option value="sentences">Sentences</option>
                <option value="words">Words</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Count (1–20)
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={count}
                onChange={(e) =>
                  setCount(
                    Math.min(20, Math.max(1, parseInt(e.target.value, 10) || 1))
                  )
                }
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground"
              />
            </div>
          </div>
          <Button type="button" variant="cta" onClick={generate}>
            Generate
          </Button>
          {output && (
            <div className="space-y-3">
              <textarea
                readOnly
                value={output}
                className="w-full min-h-[200px] rounded-xl border border-input bg-background px-3 py-2 text-foreground text-sm"
              />
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
