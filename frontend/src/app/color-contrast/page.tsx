"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";

function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.replace(/^#/, "").match(/^([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/);
  if (!m) return null;
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
}

function relativeLuminance(hex: string): number | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  const [r, g, b] = rgb.map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7162 * g + 0.0722 * b;
}

function contrastRatio(hex1: string, hex2: string): number | null {
  const L1 = relativeLuminance(hex1);
  const L2 = relativeLuminance(hex2);
  if (L1 == null || L2 == null) return null;
  const [light, dark] = L1 >= L2 ? [L1, L2] : [L2, L1];
  return (light + 0.05) / (dark + 0.05);
}

const WCAG_AA_NORMAL = 4.5;
const WCAG_AA_LARGE = 3;
const WCAG_AAA_NORMAL = 7;
const WCAG_AAA_LARGE = 4.5;

export default function ColorContrastPage() {
  const [fg, setFg] = useState("#000000");
  const [bg, setBg] = useState("#ffffff");
  const [fgText, setFgText] = useState("#000000");
  const [bgText, setBgText] = useState("#ffffff");

  const ratio = useMemo(() => {
    const r = contrastRatio(fg, bg);
    return r != null ? Math.round(r * 100) / 100 : null;
  }, [fg, bg]);

  const pass = useMemo(() => {
    if (ratio == null) return null;
    return {
      aaNormal: ratio >= WCAG_AA_NORMAL,
      aaLarge: ratio >= WCAG_AA_LARGE,
      aaaNormal: ratio >= WCAG_AAA_NORMAL,
      aaaLarge: ratio >= WCAG_AAA_LARGE,
    };
  }, [ratio]);

  const syncFg = useCallback((value: string) => {
    setFg(value);
    if (/^#[0-9a-fA-F]{6}$/.test(value)) setFgText(value);
  }, []);
  const syncBg = useCallback((value: string) => {
    setBg(value);
    if (/^#[0-9a-fA-F]{6}$/.test(value)) setBgText(value);
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
        <h1 className="text-3xl font-bold text-foreground mb-6">Color contrast checker</h1>
        <p className="text-muted-foreground mb-6">
          Two colors → contrast ratio and WCAG AA/AAA pass/fail (normal and large text).
        </p>
        <div className="space-y-6">
          <div className="flex flex-wrap gap-6 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Foreground</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={fg}
                  onChange={(e) => syncFg(e.target.value)}
                  className="h-10 w-14 rounded border border-input cursor-pointer"
                />
                <input
                  type="text"
                  value={fgText}
                  onChange={(e) => setFgText(e.target.value)}
                  onBlur={() => /^#[0-9a-fA-F]{6}$/.test(fgText) && syncFg(fgText)}
                  className="w-28 rounded-xl border border-input bg-background px-2 py-1.5 text-foreground font-mono text-sm"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Background</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={bg}
                  onChange={(e) => syncBg(e.target.value)}
                  className="h-10 w-14 rounded border border-input cursor-pointer"
                />
                <input
                  type="text"
                  value={bgText}
                  onChange={(e) => setBgText(e.target.value)}
                  onBlur={() => /^#[0-9a-fA-F]{6}$/.test(bgText) && syncBg(bgText)}
                  className="w-28 rounded-xl border border-input bg-background px-2 py-1.5 text-foreground font-mono text-sm"
                />
              </div>
            </div>
          </div>
          <div
            className="rounded-xl border border-input p-6 flex items-center justify-center gap-4"
            style={{ backgroundColor: bg }}
          >
            <span style={{ color: fg }} className="text-lg font-medium">
              Sample text
            </span>
            <span style={{ color: fg }} className="text-2xl font-medium">
              Large text
            </span>
          </div>
          {ratio != null && (
            <div className="space-y-2">
              <p className="text-foreground font-medium">
                Contrast ratio: <span className="font-mono">{ratio}:1</span>
              </p>
              {pass && (
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>
                    WCAG AA normal (4.5:1): {pass.aaNormal ? "✓ Pass" : "✗ Fail"}
                  </li>
                  <li>
                    WCAG AA large (3:1): {pass.aaLarge ? "✓ Pass" : "✗ Fail"}
                  </li>
                  <li>
                    WCAG AAA normal (7:1): {pass.aaaNormal ? "✓ Pass" : "✗ Fail"}
                  </li>
                  <li>
                    WCAG AAA large (4.5:1): {pass.aaaLarge ? "✓ Pass" : "✗ Fail"}
                  </li>
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
