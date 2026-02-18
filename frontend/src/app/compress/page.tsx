"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { FileDropzone } from "@/components/FileDropzone";
import { RadioGroup } from "@/components/ui/RadioGroup";
import { uploadJobsWithProgress, getQueueStats } from "@/lib/api";
import { uploadErrorMessage } from "@/lib/uploadErrors";

type CompressFormat = "webp" | "jpeg";

const FORMAT_OPTIONS: { value: CompressFormat; label: string }[] = [
  { value: "webp", label: "WebP" },
  { value: "jpeg", label: "JPEG" },
];

export default function CompressPage() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [targetFormat, setTargetFormat] = useState<CompressFormat>("webp");
  const [quality, setQuality] = useState(85);
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
    setError(null);
    setErrorRequestId(null);
    submittingRef.current = true;
    setLoading(true);
    setUploadProgress(0);
    try {
      const { job_ids } = await uploadJobsWithProgress(
        files,
        {
          scale: 1,
          method: "compress",
          target_format: targetFormat,
          quality,
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
    <main className="min-h-screen">
      <div className="max-w-6xl mx-auto px-5 py-12">
        <Link
          href="/"
          className="gradient-ai-text text-sm font-medium hover:opacity-90 inline-block mb-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 rounded"
        >
          ← Back
        </Link>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-6">
          Compress images
        </h1>
        <p className="text-neutral-600 dark:text-zinc-400 mb-6">
          Reduce file size by encoding as WebP or JPEG at your chosen quality (1–100).
        </p>
        {(queueStats.queued > 0 || queueStats.processing > 0) && (
          <p className="mb-4 text-sm text-neutral-500 dark:text-zinc-400">
            {queueStats.queued} in queue, {queueStats.processing} processing.
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <FileDropzone
            onFilesSelected={handleFilesSelected}
            maxFiles={10}
            className="mb-4"
          />
          <div className="rounded-2xl bg-white/70 dark:bg-zinc-800/60 backdrop-blur-sm border border-white/80 dark:border-zinc-700/80 p-5 shadow-sm">
            <RadioGroup
              name="format"
              label="Output format"
              options={FORMAT_OPTIONS}
              value={targetFormat}
              onChange={(v) => setTargetFormat(v as CompressFormat)}
            />
          </div>
          <div className="rounded-2xl bg-white/70 dark:bg-zinc-800/60 backdrop-blur-sm border border-white/80 dark:border-zinc-700/80 p-5 shadow-sm">
            <label className="block text-sm font-medium text-neutral-800 dark:text-zinc-200 mb-2">
              Quality (1–100)
            </label>
            <input
              type="number"
              min={1}
              max={100}
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value) || 85)}
              className="w-full rounded-lg border border-neutral-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-3 py-2 text-neutral-900 dark:text-zinc-100"
            />
            <p className="mt-1 text-xs text-neutral-500 dark:text-zinc-400">
              Higher = better quality, larger file. 80–90 is a good balance.
            </p>
          </div>
          {uploadProgress != null && (
            <div className="h-2 w-full rounded-full bg-neutral-200 dark:bg-zinc-700 overflow-hidden">
              <div
                className="h-full bg-violet-500 dark:bg-violet-600 transition-[width] duration-200"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
          {error && (
            <div className="rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/20 px-4 py-3 text-sm">
              <p className="text-rose-700 dark:text-rose-300">{error}</p>
              {errorRequestId && (
                <div className="mt-2 flex items-center gap-2">
                  <code className="rounded bg-rose-100 dark:bg-rose-900/50 px-2 py-1 text-xs text-rose-800 dark:text-rose-200 font-mono">
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
              : "Compress"}
          </Button>
        </form>
      </div>
    </main>
  );
}
