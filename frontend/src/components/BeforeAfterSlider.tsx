"use client";

import { useCallback, useRef, useState } from "react";

const DEFAULT_BEFORE =
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=30";
const DEFAULT_AFTER =
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=90";

type BeforeAfterSliderProps = {
  beforeSrc?: string;
  afterSrc?: string;
  beforeAlt?: string;
  afterAlt?: string;
  className?: string;
};

export function BeforeAfterSlider({
  beforeSrc = DEFAULT_BEFORE,
  afterSrc = DEFAULT_AFTER,
  beforeAlt = "Before upscale",
  afterAlt = "After upscale",
  className = "",
}: BeforeAfterSliderProps) {
  const [position, setPosition] = useState(20);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback(
    (clientX: number) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = clientX - rect.left;
      const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setPosition(pct);
    },
    []
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      handleMove(e.clientX);
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    },
    [handleMove]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (e.buttons !== 1) return;
      handleMove(e.clientX);
    },
    [handleMove]
  );

  return (
    <div
      ref={containerRef}
      className={`relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-lg dark:shadow-white/10 ${className}`}
      onPointerMove={onPointerMove}
      onPointerLeave={() => {}}
    >
      <div className="absolute inset-0 overflow-hidden rounded-2xl">
        {/* After (full, underneath) – upscaled result on the right */}
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element -- before/after URLs are dynamic (API or blob) */}
          <img
            src={afterSrc}
            alt={afterAlt}
            className="h-full w-full object-cover"
          />
        </div>
        {/* Before (clipped to left) – original on the left */}
        <div
          className="absolute inset-0 z-10"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- before/after URLs are dynamic (API or blob) */}
          <img
            src={beforeSrc}
            alt={beforeAlt}
            className="h-full w-full object-cover"
          />
        </div>
        {/* Slider line + handle */}
        <div
          className="absolute top-0 bottom-0 z-20 w-1 -translate-x-1/2 cursor-ew-resize select-none rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
          style={{ left: `${position}%` }}
          onPointerDown={onPointerDown}
          role="slider"
          aria-valuenow={position}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Compare before and after"
          tabIndex={0}
          onKeyDown={(e) => {
            const step = e.shiftKey ? 10 : 5;
            if (e.key === "ArrowLeft")
              setPosition((p) => Math.max(0, p - step));
            if (e.key === "ArrowRight")
              setPosition((p) => Math.min(100, p + step));
          }}
        >
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 bg-white/90 dark:bg-white/20 shadow-sm z-0" />
          <div className="absolute left-1/2 top-1/2 h-12 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white dark:bg-zinc-900 shadow-lg border border-neutral-200 dark:border-zinc-600 flex items-center justify-center z-10">
            <span className="text-neutral-400 dark:text-zinc-500 text-xs font-medium">
              ⟷
            </span>
          </div>
        </div>
        {/* Labels */}
        <span 
          className="absolute left-3 top-3 z-30 rounded-md bg-black/50 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm"
          style={{ visibility: position < 5 ? "hidden" : "visible" }}
        >
          Before
        </span>
        <span
          className="absolute right-3 top-3 z-30 rounded-md bg-black/50 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm"
          style={{ visibility: position < 95 ? "visible" : "hidden" }}
        >
          After
        </span>
      </div>
    </div>
  );
}
