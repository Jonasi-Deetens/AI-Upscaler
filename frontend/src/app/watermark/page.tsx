"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { FileDropzone } from "@/components/FileDropzone";
import { uploadJobsWithProgress, getQueueStats } from "@/lib/api";
import { uploadErrorMessage } from "@/lib/uploadErrors";

const POSITION_OPTIONS: { value: string; label: string }[] = [
  { value: "center", label: "Center" },
  { value: "top_left", label: "Top left" },
  { value: "top_right", label: "Top right" },
  { value: "bottom_left", label: "Bottom left" },
  { value: "bottom_right", label: "Bottom right" },
];

export default function WatermarkPage() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [text, setText] = useState("");
  const [position, setPosition] = useState("center");
  const [opacity, setOpacity] = useState(80);
  const [fontSize, setFontSize] = useState(36);
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
    if (!text.trim()) {
      setError("Enter watermark text");
      return;
    }
    setError(null);
    setErrorRequestId(null);
    submittingRef.current = true;
    setLoading(true);
    setUploadProgress(0);
    try {
      const options = {
        text: text.trim(),
        position,
        opacity,
        font_size: fontSize,
      };
      const { job_ids } = await uploadJobsWithProgress(
        files,
        { scale: 1, method: "watermark", options },
        (percent) => setUploadProgress(percent)
      );
      setUploadProgress(100);
      router.push(`/jobs?ids=${job_ids.join(",")}&justUploaded=1`);
    } catch (err) {
      const { text: errText, requestId } = uploadErrorMessage(err);
      setError(errText);
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
          Watermark
        </h1>
        <p className="text-muted-foreground mb-6">
          Add a text overlay to your images. Choose position, opacity, and font size.
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
                Watermark text
              </label>
              <input
                type="text"
                placeholder="e.g. © Your name"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Position
              </label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground"
              >
                {POSITION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Opacity (0–100)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={opacity}
                  onChange={(e) => setOpacity(parseInt(e.target.value, 10))}
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground w-8">{opacity}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Font size (12–120)
              </label>
              <input
                type="number"
                min={12}
                max={120}
                value={fontSize}
                onChange={(e) => setFontSize(Math.min(120, Math.max(12, parseInt(e.target.value, 10) || 36)))}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground"
              />
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
            disabled={loading || files.length === 0 || !text.trim()}
            className="w-full rounded-xl"
          >
            {loading
              ? uploadProgress != null
                ? `Uploading… ${uploadProgress}%`
                : "Uploading…"
              : "Add watermark"}
          </Button>
        </form>
      </div>
    </main>
  );
}
