"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

const DEFAULT_TITLE = "AI Upscaler";

const ANSWERS = [
  "Yes",
  "No",
  "Maybe",
  "Definitely",
  "Definitely not",
  "Ask again later",
  "Cannot predict now",
  "Outlook good",
  "Outlook not so good",
  "Reply hazy, try again",
  "Signs point to yes",
  "Very doubtful",
  "Without a doubt",
  "Yes, definitely",
  "You may rely on it",
];

export default function YesNoPage() {
  const [answer, setAnswer] = useState<string | null>(null);
  const [question, setQuestion] = useState("");

  useEffect(() => {
    document.title = "Yes / No 8-ball — AI Upscaler";
    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, []);

  const shake = useCallback(() => {
    setAnswer(ANSWERS[Math.floor(Math.random() * ANSWERS.length)] ?? "Yes");
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
        <h1 className="text-3xl font-bold text-foreground mb-6">
          Yes / No 8-ball
        </h1>
        <p className="text-muted-foreground mb-6">
          One button — get a random answer. Optional: type a question for fun.
        </p>
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Question (optional)
            </label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Will it work?"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground"
            />
          </div>
          <Button type="button" variant="cta" onClick={shake}>
            Shake
          </Button>
          {answer !== null && (
            <p className="text-xl font-medium text-foreground" aria-live="polite">
              {answer}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
