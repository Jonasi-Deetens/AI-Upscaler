"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { FileDropzone } from "@/components/FileDropzone";
import { RadioGroup } from "@/components/ui/RadioGroup";
import { Toggle } from "@/components/ui/Toggle";
import { uploadJobsWithProgress, getQueueStats } from "@/lib/api";
import { uploadErrorMessage } from "@/lib/uploadErrors";
import type { UpscaleMethod } from "@/lib/types";

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
];

export default function UpscalePage() {
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
          scale,
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
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-5 py-12">
        <Link
          href="/"
          className="text-primary text-sm font-medium hover:underline inline-block mb-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
        >
          ← Back
        </Link>
        <h1 className="text-3xl font-bold text-foreground mb-6">
          Upscale images
        </h1>
        {(queueStats.queued > 0 || queueStats.processing > 0) && (
          <p className="mb-4 text-sm text-muted-foreground">
            {queueStats.queued} in queue, {queueStats.processing} processing. Jobs may take a bit when the queue is busy.
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <FileDropzone
            onFilesSelected={handleFilesSelected}
            maxFiles={10}
            className="mb-4"
          />
          <div>
            <Toggle<PresetId>
              label="Preset"
              options={PRESETS.map((p) => ({ value: p.id, label: p.label }))}
              value={preset}
              onChange={applyPreset}
            />
          </div>
          {showCustomControls && (
            <>
              <div className="rounded-2xl bg-card border border-border p-5 shadow-sm">
                <RadioGroup
                  name="scale"
                  label="Scale"
                  options={scaleOptions as { value: "2" | "4"; label: string }[]}
                  value={String(scale) as "2" | "4"}
                  onChange={(v) => setScale(Number(v) as 2 | 4)}
                />
              </div>
              <div className="rounded-2xl bg-card border border-border p-5 shadow-sm">
                <RadioGroup
                  name="method"
                  label="Method"
                  options={methodOptions}
                  value={method}
                  onChange={setMethod}
                />
              </div>
              <div className="rounded-2xl bg-card border border-border p-5 shadow-sm space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={denoiseFirst}
                    onChange={(e) => setDenoiseFirst(e.target.checked)}
                    className="rounded border-input"
                  />
                  <span className="text-sm font-medium text-foreground">
                    Denoise first
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={faceEnhance}
                    onChange={(e) => setFaceEnhance(e.target.checked)}
                    className="rounded border-input"
                  />
                  <span className="text-sm font-medium text-foreground">
                    Face enhance (GFPGAN)
                  </span>
                </label>
              </div>
            </>
          )}
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
              : "Upload and process"}
          </Button>
        </form>
      </div>
    </main>
  );
}
