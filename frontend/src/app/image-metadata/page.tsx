"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import * as exifr from "exifr";

export default function ImageMetadataPage() {
  const [file, setFile] = useState<File | null>(null);
  const [meta, setMeta] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setError(null);
    setMeta(null);
    setLoading(true);
    exifr
      .parse(f)
      .then((data) => {
        setMeta(data ? (data as Record<string, unknown>) : null);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to read metadata");
        setMeta(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const format = file?.name ? file.name.split(".").pop()?.toUpperCase() ?? file.type : null;
  const dimensions = meta && "width" in meta && "height" in meta ? `${meta.width} × ${meta.height}` : null;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-5 py-12">
        <Link
          href="/"
          className="text-primary text-sm font-medium hover:underline inline-block mb-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
        >
          ← Back
        </Link>
        <h1 className="text-3xl font-bold text-foreground mb-6">Image metadata</h1>
        <p className="text-muted-foreground mb-6">
          Upload an image to view EXIF, dimensions, and format. Read-only; nothing is sent to a server.
        </p>
        <div className="space-y-6 rounded-2xl bg-card border border-border p-5">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Image file</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFile}
              className="w-full max-w-md rounded-lg border border-input bg-background px-3 py-2 text-foreground file:mr-2 file:rounded file:border-0 file:bg-primary file:px-3 file:py-1 file:text-primary-foreground"
            />
          </div>
          {loading && <p className="text-sm text-muted-foreground">Reading…</p>}
          {error && <p className="text-sm text-destructive">{error}</p>}
          {(file || meta) && !loading && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {file && (
                  <>
                    <div>
                      <span className="text-sm text-muted-foreground">Filename</span>
                      <p className="font-mono text-foreground">{file.name}</p>
                    </div>
                    {format && (
                      <div>
                        <span className="text-sm text-muted-foreground">Format</span>
                        <p className="font-mono text-foreground">{format}</p>
                      </div>
                    )}
                    {dimensions && (
                      <div>
                        <span className="text-sm text-muted-foreground">Dimensions</span>
                        <p className="font-mono text-foreground">{dimensions}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-sm text-muted-foreground">Size</span>
                      <p className="font-mono text-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                    </div>
                  </>
                )}
              </div>
              {meta && Object.keys(meta).length > 0 && (
                <div>
                  <span className="text-sm font-medium text-foreground">EXIF / metadata</span>
                  <pre className="mt-2 w-full overflow-auto rounded-lg border border-input bg-background px-3 py-2 text-foreground font-mono text-sm max-h-[400px]">
                    {JSON.stringify(meta, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
