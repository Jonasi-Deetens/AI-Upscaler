"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = hex.replace(/^#/, "").match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (!m) return null;
  return {
    r: parseInt(m[1], 16),
    g: parseInt(m[2], 16),
    b: parseInt(m[3], 16),
  };
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      default:
        h = ((r - g) / d + 4) / 6;
    }
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function normalizeHex(str: string): string {
  const m = str.replace(/^#/, "").match(/^([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
  if (!m) return "#000000";
  let hex = m[1];
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  return "#" + hex.toLowerCase();
}

export default function ColorPickerPage() {
  const [hex, setHex] = useState("#3b82f6");
  const [copied, setCopied] = useState<string | null>(null);

  const normalizedHex = useMemo(() => normalizeHex(hex), [hex]);
  const rgb = useMemo(() => hexToRgb(normalizedHex), [normalizedHex]);
  const hsl = useMemo(
    () => (rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : null),
    [rgb]
  );

  const copy = useCallback((label: string, value: string) => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    });
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
        <h1 className="text-3xl font-bold text-foreground mb-6">Color picker</h1>
        <p className="text-muted-foreground mb-6">
          Pick a color and copy hex, RGB, or HSL.
        </p>
        <div className="space-y-6">
          <div className="rounded-2xl bg-card border border-border p-5 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <input
                type="color"
                value={normalizedHex}
                onChange={(e) => setHex(e.target.value)}
                className="w-14 h-14 rounded-lg cursor-pointer border border-input"
              />
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Hex
                </label>
                <input
                  type="text"
                  value={hex}
                  onChange={(e) => setHex(e.target.value)}
                  className="rounded-lg border border-input bg-background px-3 py-2 text-foreground font-mono w-28"
                />
              </div>
            </div>
            {rgb && (
              <div className="flex flex-wrap gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">RGB</span>
                  <p className="font-mono text-foreground">
                    rgb({rgb.r}, {rgb.g}, {rgb.b})
                  </p>
                </div>
                {hsl && (
                  <div>
                    <span className="text-sm text-muted-foreground">HSL</span>
                    <p className="font-mono text-foreground">
                      hsl({hsl.h}, {hsl.s}%, {hsl.l}%)
                    </p>
                  </div>
                )}
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => copy("hex", normalizedHex)}
              >
                {copied === "hex" ? "Copied" : "Copy hex"}
              </Button>
              {rgb && (
                <>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      copy("rgb", `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`)
                    }
                  >
                    {copied === "rgb" ? "Copied" : "Copy RGB"}
                  </Button>
                  {hsl && (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        copy(
                          "hsl",
                          `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`
                        )
                      }
                    >
                      {copied === "hsl" ? "Copied" : "Copy HSL"}
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
          <div
            className="rounded-xl border border-border h-24 w-full"
            style={{ backgroundColor: normalizedHex }}
          />
        </div>
      </div>
    </main>
  );
}
