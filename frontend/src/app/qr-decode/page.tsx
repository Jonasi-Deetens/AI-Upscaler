"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import jsQR from "jsqr";

const DEFAULT_TITLE = "AI Upscaler";

function getImageDataFromFile(file: File): Promise<{ data: Uint8ClampedArray; width: number; height: number } | null> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        resolve(null);
        return;
      }
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve({
        data: imageData.data,
        width: imageData.width,
        height: imageData.height,
      });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    img.src = url;
  });
}

function getImageDataFromDataUrl(dataUrl: string): Promise<{ data: Uint8ClampedArray; width: number; height: number } | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(null);
        return;
      }
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      resolve({
        data: imageData.data,
        width: imageData.width,
        height: imageData.height,
      });
    };
    img.onerror = () => resolve(null);
    img.src = dataUrl;
  });
}

export default function QrDecodePage() {
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pastedUrl, setPastedUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const decodeFromImageData = useCallback(
    (data: Uint8ClampedArray, width: number, height: number) => {
      const qr = jsQR(data, width, height, { inversionAttempts: "attemptBoth" });
      if (qr) {
        setResult(qr.data);
        setError(null);
      } else {
        setResult(null);
        setError("No QR code found in image.");
      }
    },
    []
  );

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setError(null);
      setResult(null);
      if (!file.type.startsWith("image/")) {
        setError("Please choose an image file.");
        return;
      }
      getImageDataFromFile(file).then((img) => {
        if (img) decodeFromImageData(img.data, img.width, img.height);
        else setError("Could not read image.");
      });
      e.target.value = "";
    },
    [decodeFromImageData]
  );

  const decodeFromPaste = useCallback(() => {
    const trimmed = pastedUrl.trim();
    if (!trimmed) {
      setError("Paste a data URL (data:image/...;base64,...).");
      return;
    }
    if (!trimmed.startsWith("data:image/")) {
      setError("Not a valid image data URL.");
      return;
    }
    setError(null);
    setResult(null);
    getImageDataFromDataUrl(trimmed).then((img) => {
      if (img) decodeFromImageData(img.data, img.width, img.height);
      else setError("Could not decode image.");
    });
  }, [pastedUrl, decodeFromImageData]);

  useEffect(() => {
    document.title = "QR code decoder — AI Upscaler";
    return () => { document.title = DEFAULT_TITLE; };
  }, []);

  const copy = useCallback(() => {
    if (!result) return;
    navigator.clipboard.writeText(result).then(() => {});
  }, [result]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-5 py-12">
        <Link href="/" className="text-primary text-sm font-medium hover:underline inline-block mb-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded">
          ← Back
        </Link>
        <h1 className="text-3xl font-bold text-foreground mb-6">QR code decoder</h1>
        <p className="text-muted-foreground mb-6">Upload an image or paste a data URL. Decode the first QR code found.</p>
        <div className="space-y-4 max-w-xl">
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={onFileChange}
              className="block w-full text-sm text-foreground file:mr-2 file:rounded file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-primary-foreground"
            />
          </div>
          <div className="text-sm text-muted-foreground">or paste image data URL</div>
          <div>
            <textarea
              value={pastedUrl}
              onChange={(e) => setPastedUrl(e.target.value)}
              placeholder="data:image/png;base64,..."
              rows={2}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground font-mono text-sm"
            />
            <Button type="button" variant="secondary" onClick={decodeFromPaste} className="mt-2">
              Decode from URL
            </Button>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {result !== null && (
            <div className="space-y-2 rounded-xl border border-input bg-background p-3">
              <p className="text-sm font-medium text-foreground">Decoded</p>
              <pre className="whitespace-pre-wrap break-all font-mono text-sm text-foreground">{result}</pre>
              <Button type="button" variant="secondary" size="sm" onClick={copy}>
                Copy
              </Button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
