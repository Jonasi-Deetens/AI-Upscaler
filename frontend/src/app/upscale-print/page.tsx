"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { FileDropzone } from "@/components/FileDropzone";
import { RadioGroup } from "@/components/ui/RadioGroup";
import { uploadJobsWithProgress, getQueueStats } from "@/lib/api";
import { uploadErrorMessage } from "@/lib/uploadErrors";

const PAPER_OPTIONS = [
  { value: "A4", label: "A4 (210 × 297 mm)" },
  { value: "A3", label: "A3 (297 × 420 mm)" },
  { value: "custom", label: "Custom (mm)" },
];

export default function UpscalePrintPage() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [paperPreset, setPaperPreset] = useState<"A4" | "A3" | "custom">("A4");
  const [widthMm, setWidthMm] = useState(210);
  const [heightMm, setHeightMm] = useState(297);
  const [dpi, setDpi] = useState(300);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorRequestId, setErrorRequestId] = useState<string | null>(null);
  const [queueStats, setQueueStats] = useState({ queued: 0, processing: 0 });
  const submittingRef = useRef(false);

  useEffect(() => {
    const fetchStats = () => {
      getQueueStats().then(setQueueStats).catch(() => {});
    };
    fetchStats();
    const t = setInterval(fetchStats, 12000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (paperPreset === "A4") {
      setWidthMm(210);
      setHeightMm(297);
    } else if (paperPreset === "A3") {
      setWidthMm(297);
      setHeightMm(420);
    }
  }, [paperPreset]);

  const handleFilesSelected = useCallback((newFiles: File[]) => {
    setFiles(newFiles);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current) return;
    if (files.length === 0) {
      setError("Select at least one image");
      return;
    }
    setError(null);
    setErrorRequestId(null);
    submittingRef.current = true;
    setLoading(true);
    setUploadProgress(0);
    const options: Record<string, number | string> =
      paperPreset === "custom"
        ? { width_mm: widthMm, height_mm: heightMm, dpi }
        : { paper_preset: paperPreset, dpi };
    try {
      const { job_ids } = await uploadJobsWithProgress(
        files,
        {
          scale: 1,
          method: "upscale_print",
          options,
        },
        (percent) => setUploadProgress(percent)
      );
      setUploadProgress(100);
      router.push(`/jobs?ids=${job_ids.join(",")}&justUploaded=1`);
    } catch (err) {
      const { text, requestId } = uploadErrorMessage(err);
      setError(text);
      setErrorRequestId(requestId ?? null);
      submittingRef.current = false;
    } finally {
      setLoading(false);
      setUploadProgress(null);
    }
  };

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
          Upscale for print
        </h1>
        <p className="text-muted-foreground mb-6">
          Get a print-ready image at your chosen paper size and DPI (e.g. A4 at 300 DPI).
        </p>
        {(queueStats.queued > 0 || queueStats.processing > 0) && (
          <p className="mb-4 text-sm text-muted-foreground">
            {queueStats.queued} in queue, {queueStats.processing} processing.
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <FileDropzone
            onFilesSelected={handleFilesSelected}
            maxFiles={10}
            className="mb-4"
          />
          <div>
            <p className="text-sm font-medium mb-2">Paper size</p>
            <RadioGroup
              value={paperPreset}
              onValueChange={(v) => setPaperPreset(v as "A4" | "A3" | "custom")}
              options={PAPER_OPTIONS}
            />
          </div>
          {paperPreset === "custom" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="width_mm" className="text-sm font-medium block mb-1">
                  Width (mm)
                </label>
                <input
                  id="width_mm"
                  type="number"
                  min={1}
                  max={2000}
                  value={widthMm}
                  onChange={(e) => setWidthMm(Number(e.target.value) || 210)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label htmlFor="height_mm" className="text-sm font-medium block mb-1">
                  Height (mm)
                </label>
                <input
                  id="height_mm"
                  type="number"
                  min={1}
                  max={2000}
                  value={heightMm}
                  onChange={(e) => setHeightMm(Number(e.target.value) || 297)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>
          )}
          <div>
            <label htmlFor="dpi" className="text-sm font-medium block mb-1">
              DPI (72–600)
            </label>
            <input
              id="dpi"
              type="number"
              min={72}
              max={600}
              value={dpi}
              onChange={(e) => setDpi(Number(e.target.value) || 300)}
              className="w-full max-w-xs rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
          {uploadProgress != null && (
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary transition-[width] duration-200"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
          {error && (
            <div className="rounded-xl border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm">
              <p className="text-destructive">{error}</p>
              {errorRequestId && (
                <div className="mt-2 flex items-center gap-2">
                  <code className="rounded bg-destructive/20 px-2 py-1 text-xs text-destructive font-mono">
                    {errorRequestId}
                  </code>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    destructive
                    onClick={() => navigator.clipboard.writeText(errorRequestId!)}
                    className="text-xs"
                  >
                    Copy request ID
                  </Button>
                </div>
              )}
            </div>
          )}
          <Button
            type="submit"
            variant="cta"
            size="lg"
            disabled={loading || files.length === 0}
            className="w-full rounded-xl"
          >
            {loading
              ? uploadProgress != null
                ? `Uploading… ${uploadProgress}%`
                : "Uploading…"
              : "Upscale for print"}
          </Button>
        </form>
      </div>
    </main>
  );
}
