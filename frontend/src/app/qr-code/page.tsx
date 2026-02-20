"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import QRCode from "qrcode";

export default function QrCodePage() {
  const [input, setInput] = useState("");
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    if (!input.trim()) {
      setDataUrl(null);
      return;
    }
    QRCode.toDataURL(input, { width: 256, margin: 2 })
      .then(setDataUrl)
      .catch((e: Error) => setError(e.message));
  }, [input]);

  const download = useCallback(() => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "qrcode.png";
    a.click();
  }, [dataUrl]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-5 py-12">
        <Link
          href="/"
          className="text-primary text-sm font-medium hover:underline inline-block mb-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
        >
          ← Back
        </Link>
        <h1 className="text-3xl font-bold text-foreground mb-6">QR code</h1>
        <p className="text-muted-foreground mb-6">
          Enter text or a URL to generate a QR code. Download as PNG.
        </p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Text or URL
            </label>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="https://example.com"
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-foreground"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {dataUrl && (
            <div className="rounded-2xl bg-card border border-border p-5 shadow-sm inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={dataUrl}
                alt="QR code"
                className="rounded-lg"
                width={256}
                height={256}
              />
              <div className="mt-3">
                <Button type="button" variant="secondary" onClick={download}>
                  Download PNG
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
