"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { FileDropzone } from "@/components/FileDropzone";
import { uploadJobsWithProgress, getQueueStats } from "@/lib/api";
import { uploadErrorMessage } from "@/lib/uploadErrors";

const ASPECT_PRESETS = [
  { label: "Original", value: "" },
  { label: "1:1", value: "1" },
  { label: "16:9", value: "1.778" },
  { label: "9:16", value: "0.5625" },
  { label: "4:3", value: "1.333" },
  { label: "3:4", value: "0.75" },
  { label: "3:2", value: "1.5" },
  { label: "2:3", value: "0.667" },
];

export default function SmartCropPage() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [aspectRatio, setAspectRatio] = useState("");
  const [mode, setMode] = useState<"center" | "saliency">("saliency");
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
    const opts: Record<string, unknown> = { mode };
    if (width > 0) opts.width = width;
    if (height > 0) opts.height = height;
    if (aspectRatio) {
      const ratio = parseFloat(aspectRatio);
      if (!Number.isNaN(ratio) && ratio >= 0.1 && ratio <= 10) {
        opts.aspect_ratio = ratio;
      }
    }
    if (width === 0 && height === 0 && !aspectRatio) {
      setError("Set width/height or choose an aspect ratio");
      return;
    }
    setError(null);
    setErrorRequestId(null);
    submittingRef.current = true;
    setLoading(true);
    setUploadProgress(0);
    try {
      const { job_ids } = await uploadJobsWithProgress(
        files,
        { scale: 1, method: "smart_crop", options: opts },
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
        <h1 className="text-3xl font-bold text-foreground mb-6">Smart crop</h1>
        <p className="text-muted-foreground mb-6">
          Crop to a target size or aspect ratio while keeping the important region in frame (center or saliency-based).
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
          <div className="rounded-2xl bg-card border border-border p-5 shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Target width (0 = keep)
              </label>
              <input
                type="number"
                min={0}
                value={width}
                onChange={(e) => setWidth(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Target height (0 = keep)
              </label>
              <input
                type="number"
                min={0}
                value={height}
                onChange={(e) => setHeight(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Or aspect ratio (width/height)
              </label>
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground"
              >
                {ASPECT_PRESETS.map((p) => (
                  <option key={p.label} value={p.value}>
                    {p.label || "—"}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Crop mode
              </label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as "center" | "saliency")}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground"
              >
                <option value="saliency">Saliency (keep interesting region)</option>
                <option value="center">Center</option>
              </select>
            </div>
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
              : "Smart crop"}
          </Button>
        </form>
      </div>
    </main>
  );
}
