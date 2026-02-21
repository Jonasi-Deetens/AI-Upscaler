"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

const DEFAULT_TITLE = "AI Upscaler";

function extractBase64AndMime(input: string): { data: string; mime: string } | null {
  const trimmed = input.trim();
  const dataUrlMatch = trimmed.match(/^data:([^;]+);base64,(.+)$/);
  if (dataUrlMatch) {
    return { data: dataUrlMatch[2], mime: dataUrlMatch[1] };
  }
  if (/^[A-Za-z0-9+/=]+$/.test(trimmed.replace(/\s/g, ""))) {
    return { data: trimmed.replace(/\s/g, ""), mime: "image/png" };
  }
  return null;
}

export default function Base64ImagePage() {
  const [input, setInput] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [detectedMime, setDetectedMime] = useState<string>("");

  const parse = useCallback(() => {
    setError(null);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    if (!input.trim()) return;

    const extracted = extractBase64AndMime(input);
    if (!extracted) {
      setError("Paste a data URL (data:image/...;base64,...) or raw base64.");
      return;
    }

    try {
      const binary = atob(extracted.data);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const blob = new Blob([bytes], { type: extracted.mime });
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setDetectedMime(extracted.mime);
    } catch {
      setError("Invalid base64 or unsupported format.");
    }
  }, [input]);

  const download = useCallback(() => {
    if (!previewUrl) return;
    const ext = detectedMime.includes("png") ? "png" : detectedMime.includes("jpeg") || detectedMime.includes("jpg") ? "jpg" : "bin";
    const a = document.createElement("a");
    a.href = previewUrl;
    a.download = `image.${ext}`;
    a.click();
  }, [previewUrl, detectedMime]);

  const previewUrlRef = useRef<string | null>(null);
  previewUrlRef.current = previewUrl;

  useEffect(() => {
    document.title = "Base64 image decoder — AI Upscaler";
    return () => {
      document.title = DEFAULT_TITLE;
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
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
          Base64 image decoder
        </h1>
        <p className="text-muted-foreground mb-6">
          Paste a data URL or raw base64 image string. Preview and download.
        </p>
        <div className="space-y-4 max-w-2xl">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Data URL or base64
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="data:image/png;base64,iVBORw0KGgo..."
              rows={4}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground font-mono text-sm"
            />
          </div>
          <Button type="button" variant="cta" onClick={parse}>
            Decode & preview
          </Button>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          {previewUrl && (
            <div className="space-y-2">
              <img
                src={previewUrl}
                alt="Decoded"
                className="max-h-[400px] max-w-full rounded-lg border border-input object-contain"
              />
              <Button type="button" variant="secondary" onClick={download}>
                Download image
              </Button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
