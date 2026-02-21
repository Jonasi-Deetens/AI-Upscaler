"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { formatTime } from "@/lib/formatTime";

const DEFAULT_TITLE = "AI Upscaler";

export default function CountdownPage() {
  const [minutes, setMinutes] = useState(5);
  const [seconds, setSeconds] = useState(0);
  const [remaining, setRemaining] = useState(5 * 60);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    document.title = "Countdown — AI Upscaler";
    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, []);

  const totalSec = minutes * 60 + seconds;

  const start = useCallback(() => {
    setDone(false);
    setRemaining(totalSec);
    setRunning(true);
  }, [totalSec]);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          setRunning(false);
          setDone(true);
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const pause = useCallback(() => setRunning(false), []);
  const reset = useCallback(() => {
    setRunning(false);
    setDone(false);
    setRemaining(totalSec);
  }, [totalSec]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-5 py-12">
        <Link
          href="/"
          className="text-primary text-sm font-medium hover:underline inline-block mb-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
        >
          ← Back
        </Link>
        <h1 className="text-3xl font-bold text-foreground mb-6">Countdown</h1>
        <p className="text-muted-foreground mb-6">
          Set minutes and seconds, then count down to zero.
        </p>
        <div className="space-y-4 max-w-md">
          {!running && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Minutes
                </label>
                <input
                  type="number"
                  min={0}
                  value={minutes}
                  onChange={(e) => setMinutes(Math.max(0, Number(e.target.value)))}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Seconds
                </label>
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={seconds}
                  onChange={(e) =>
                    setSeconds(Math.min(59, Math.max(0, Number(e.target.value))))
                  }
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground"
                />
              </div>
            </div>
          )}
          <p className="text-4xl font-mono text-foreground">
            {formatTime(running ? remaining : totalSec)}
          </p>
          {done && (
            <p className="text-lg font-medium text-foreground">Time’s up!</p>
          )}
          <div className="flex gap-2">
            {running ? (
              <Button type="button" variant="secondary" onClick={pause}>
                Pause
              </Button>
            ) : (
              <Button type="button" variant="primary" onClick={start} disabled={totalSec <= 0}>
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
