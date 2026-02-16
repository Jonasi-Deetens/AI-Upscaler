"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FileDropzone } from "@/components/FileDropzone";
import { RadioGroup } from "@/components/ui/RadioGroup";
import { uploadJobs } from "@/lib/api";
import type { UploadOptions, UpscaleMethod } from "@/lib/types";

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
  const [error, setError] = useState<string | null>(null);
  const submittingRef = useRef(false);

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
    submittingRef.current = true;
    setLoading(true);
    try {
      const { job_ids } = await uploadJobs(files, {
        scale: submitScale,
        method,
        denoise_first: denoiseFirst,
        face_enhance: faceEnhance,
      });
      router.push(`/jobs?ids=${job_ids.join(",")}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      submittingRef.current = false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link
          href="/"
          className="gradient-ai-text text-sm font-medium hover:opacity-90 inline-block mb-8"
        >
          ← Back
        </Link>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-6">
          Upload images
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <FileDropzone
            onFilesSelected={handleFilesSelected}
            maxFiles={10}
            className="mb-4"
          />
          <div className="rounded-2xl bg-white/70 dark:bg-zinc-800/60 backdrop-blur-sm border border-white/80 dark:border-zinc-700/80 p-5 shadow-sm">
            <p className="text-sm font-medium text-neutral-800 dark:text-zinc-200 mb-3">Preset</p>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => applyPreset(p.id)}
                  className={`rounded-full px-4 py-2 text-sm font-medium border ${
                    preset === p.id
                      ? "gradient-ai border text-white shadow-md shadow-violet-200/50 dark:shadow-violet-500/30"
                      : "border-neutral-200 dark:border-zinc-600 text-neutral-600 dark:text-zinc-400 hover:bg-neutral-100 dark:hover:bg-zinc-700"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
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
          {error && (
            <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading || files.length === 0}
            className="gradient-ai w-full rounded-xl px-4 py-4 font-semibold text-white shadow-lg shadow-violet-200/50 dark:shadow-violet-500/30 hover:shadow-violet-300/50 dark:hover:shadow-violet-500/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200"
          >
            {loading ? "Uploading…" : isUpscale ? "Upload and process" : "Upload and remove background"}
          </button>
        </form>
      </div>
    </main>
  );
}
