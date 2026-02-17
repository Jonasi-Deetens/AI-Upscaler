"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { FileDropzone } from "@/components/FileDropzone";
import { RadioGroup } from "@/components/ui/RadioGroup";
import { Toggle } from "@/components/ui/Toggle";
import { uploadJobsWithProgress, getQueueStats, isApiError, type ApiError } from "@/lib/api";
import type { UpscaleMethod } from "@/lib/types";

function uploadErrorMessage(err: unknown): { text: string; requestId?: string } {
  if (isApiError(err)) {
    const apiErr = err as ApiError;
    if (apiErr.status === 429) {
      return { text: "Rate limited. Try again in a few minutes." };
    }
    if (apiErr.status === 400) {
      const m = apiErr.message.toLowerCase();
      if (m.includes("too many files") || m.includes("too many uploads")) {
        return { text: "Too many files. Please upload fewer at once." };
      }
      if (m.includes("exceeds") || m.includes("mb") || m.includes("megapixel")) {
        return { text: "A file is too large. Check size and megapixel limits." };
      }
      return { text: apiErr.message };
    }
    if (apiErr.status >= 500) {
      return {
        text: "Something went wrong. Please try again.",
        requestId: apiErr.requestId,
      };
    }
    return { text: apiErr.message, requestId: apiErr.requestId };
  }
  return {
    text: err instanceof Error ? err.message : "Upload failed",
  };
}

type PresetId = "photo" | "anime" | "document" | "custom";

const PRESETS: Array<{
  id: PresetId;
  label: string;
  scale: 2 | 4;
  method: UpscaleMethod;
  denoiseFirst: boolean;
  faceEnhance: boolean;
}> = [
  { id: "photo", label: "Photo", scale: 4, method: "real_esrgan", denoiseFirst: false, faceEnhance: true },
  { id: "anime", label: "Anime", scale: 4, method: "real_esrgan_anime", denoiseFirst: false, faceEnhance: false },
  { id: "document", label: "Document", scale: 4, method: "swinir", denoiseFirst: true, faceEnhance: false },
  { id: "custom", label: "Custom", scale: 4, method: "real_esrgan", denoiseFirst: false, faceEnhance: false },
];

const scaleOptions = [
  { value: "2" as const, label: "2×" },
  { value: "4" as const, label: "4×" },
];

const methodOptions = [
  { value: "real_esrgan" as UpscaleMethod, label: "Standard (Real-ESRGAN)" },
  { value: "real_esrgan_anime" as UpscaleMethod, label: "Anime (Real-ESRGAN)" },
  { value: "esrgan" as UpscaleMethod, label: "Original ESRGAN (RRDB)" },
  { value: "swinir" as UpscaleMethod, label: "Detailed (SwinIR)" },
  { value: "background_remove" as UpscaleMethod, label: "Remove background" },
];

export default function UploadPage() {
  const router = useRouter();
  const [preset, setPreset] = useState<PresetId>("photo");
  const [files, setFiles] = useState<File[]>([]);
  const [scale, setScale] = useState<2 | 4>(4);
  const [method, setMethod] = useState<UpscaleMethod>("real_esrgan");
  const [denoiseFirst, setDenoiseFirst] = useState(false);
  const [faceEnhance, setFaceEnhance] = useState(true);
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

  const applyPreset = useCallback((id: PresetId) => {
    setPreset(id);
    if (id === "custom") return;
    const p = PRESETS.find((x) => x.id === id);
    if (p) {
      setScale(p.scale);
      setMethod(p.method);
      setDenoiseFirst(p.denoiseFirst);
      setFaceEnhance(p.faceEnhance);
    }
  }, []);

  const isUpscale = method !== "background_remove";
  const submitScale: 1 | 2 | 4 = method === "background_remove" ? 1 : scale;
  const showCustomControls = preset === "custom";

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
          scale: submitScale,
          method,
          denoise_first: denoiseFirst,
          face_enhance: faceEnhance,
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
          Upload images
        </h1>
        {(queueStats.queued > 0 || queueStats.processing > 0) && (
          <p className="mb-4 text-sm text-neutral-500 dark:text-zinc-400">
            {queueStats.queued} in queue, {queueStats.processing} processing. Jobs may take a bit when the queue is busy.
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <FileDropzone
            onFilesSelected={handleFilesSelected}
            maxFiles={10}
            className="mb-4"
          />
          <div className="">
            <Toggle
              label="Preset"
              options={PRESETS.map((p) => ({ value: p.id, label: p.label }))}
              value={preset}
              onChange={(id) => applyPreset(id)}
            />
          </div>
          {showCustomControls && (
            <>
              {isUpscale && (
                <div className="rounded-2xl bg-white/70 dark:bg-zinc-800/60 backdrop-blur-sm border border-white/80 dark:border-zinc-700/80 p-5 shadow-sm">
                  <RadioGroup
                    name="scale"
                    label="Scale"
                    options={scaleOptions as { value: "2" | "4"; label: string }[]}
                    value={String(scale) as "2" | "4"}
                    onChange={(v) => setScale(Number(v) as 2 | 4)}
                  />
                </div>
              )}
              <div className="rounded-2xl bg-white/70 dark:bg-zinc-800/60 backdrop-blur-sm border border-white/80 dark:border-zinc-700/80 p-5 shadow-sm">
                <RadioGroup
                  name="method"
                  label="Method"
                  options={methodOptions}
                  value={method}
                  onChange={setMethod}
                />
              </div>
              <div className="rounded-2xl bg-white/70 dark:bg-zinc-800/60 backdrop-blur-sm border border-white/80 dark:border-zinc-700/80 p-5 shadow-sm space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={denoiseFirst}
                    onChange={(e) => setDenoiseFirst(e.target.checked)}
                    className="rounded border-neutral-300 dark:border-zinc-600"
                  />
                  <span className="text-sm font-medium text-neutral-800 dark:text-zinc-200">
                    Denoise first
                  </span>
                </label>
                {isUpscale && (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={faceEnhance}
                      onChange={(e) => setFaceEnhance(e.target.checked)}
                      className="rounded border-neutral-300 dark:border-zinc-600"
                    />
                    <span className="text-sm font-medium text-neutral-800 dark:text-zinc-200">
                      Face enhance (GFPGAN)
                    </span>
                  </label>
                )}
              </div>
            </>
          )}
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
                    onClick={() => {
                      navigator.clipboard.writeText(errorRequestId);
                    }}
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
              : isUpscale
                ? "Upload and process"
                : "Upload and remove background"}
          </Button>
        </form>
      </div>
    </main>
  );
}
