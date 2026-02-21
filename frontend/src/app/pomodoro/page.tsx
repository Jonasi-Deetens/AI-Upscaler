"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { formatTime } from "@/lib/formatTime";

const WORK_SEC = 25 * 60;
const BREAK_SEC = 5 * 60;

const DEFAULT_TITLE = "AI Upscaler";

export default function PomodoroPage() {
  const [phase, setPhase] = useState<"work" | "break">("work");
  const [remaining, setRemaining] = useState(WORK_SEC);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  useEffect(() => {
    document.title = "Pomodoro — AI Upscaler";
    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, []);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          const nextPhase = phaseRef.current === "work" ? "break" : "work";
          setPhase(nextPhase);
          return nextPhase === "work" ? WORK_SEC : BREAK_SEC;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const start = useCallback(() => setRunning(true), []);
  const pause = useCallback(() => setRunning(false), []);
  const reset = useCallback(() => {
    setRunning(false);
    setPhase("work");
    setRemaining(WORK_SEC);
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
        <h1 className="text-3xl font-bold text-foreground mb-6">Pomodoro</h1>
        <p className="text-muted-foreground mb-6">
          25 min work, 5 min break. Start, pause, or reset.
        </p>
        <div className="space-y-4 max-w-md">
          <p className="text-sm font-medium text-foreground">
            {phase === "work" ? "Work" : "Break"}
          </p>
          <p className="text-4xl font-mono text-foreground">
            {formatTime(remaining)}
          </p>
          <div className="flex gap-2">
            {running ? (
              <Button type="button" variant="secondary" onClick={pause}>
                Pause
              </Button>
            ) : (
              <Button type="button" variant="cta" onClick={start}>
                Start
              </Button>
            )}
            <Button type="button" variant="ghost" onClick={reset}>
              Reset
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
