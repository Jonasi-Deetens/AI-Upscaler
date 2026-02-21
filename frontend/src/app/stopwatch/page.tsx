"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { formatTimeStopwatch } from "@/lib/formatTime";

const DEFAULT_TITLE = "AI Upscaler";

export default function StopwatchPage() {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);
  const accumulatedRef = useRef(0);

  useEffect(() => {
    if (!running) return;
    startTimeRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      setElapsed(
        accumulatedRef.current + Math.floor((Date.now() - startTimeRef.current) / 1000)
      );
    }, 100);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const start = useCallback(() => setRunning(true), []);
  const pause = useCallback(() => {
    setRunning(false);
    accumulatedRef.current =
      accumulatedRef.current + Math.floor((Date.now() - startTimeRef.current) / 1000);
    setElapsed(accumulatedRef.current);
  }, []);
  const lap = useCallback(() => {
    if (elapsed > 0) setLaps((prev) => [...prev, elapsed]);
  }, [elapsed]);
  const reset = useCallback(() => {
    setRunning(false);
    setElapsed(0);
    setLaps([]);
    accumulatedRef.current = 0;
  }, []);

  useEffect(() => {
    document.title = "Stopwatch — AI Upscaler";
    return () => { document.title = DEFAULT_TITLE; };
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-5 py-12">
        <Link href="/" className="text-primary text-sm font-medium hover:underline inline-block mb-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded">
          ← Back
        </Link>
        <h1 className="text-3xl font-bold text-foreground mb-6">Stopwatch</h1>
        <p className="text-muted-foreground mb-6">Count up with laps. Start, pause, lap, or reset.</p>
        <div className="space-y-4 max-w-md">
          <p className="text-4xl font-mono text-foreground tabular-nums" aria-live="polite">
            {formatTimeStopwatch(elapsed)}
          </p>
          <div className="flex gap-2 flex-wrap">
            {running ? (
              <>
                <Button type="button" variant="secondary" onClick={pause}>Pause</Button>
                <Button type="button" variant="ghost" onClick={lap}>Lap</Button>
              </>
            ) : (
              <Button type="button" variant="primary" onClick={start}>Start</Button>
            )}
            <Button type="button" variant="ghost" onClick={reset}>Reset</Button>
          </div>
          {laps.length > 0 && (
            <div className="rounded-xl border border-input bg-background p-3">
              <p className="text-sm font-medium text-foreground mb-2">Laps</p>
              <ul className="space-y-1 font-mono text-sm text-foreground">
                {laps.map((sec, i) => (
                  <li key={i}>Lap {i + 1}: {formatTimeStopwatch(sec)}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
