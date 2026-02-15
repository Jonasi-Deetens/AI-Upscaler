"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FileDropzone } from "@/components/FileDropzone";
import { RadioGroup } from "@/components/ui/RadioGroup";
import { uploadJobs } from "@/lib/api";
import type { UploadOptions, UpscaleMethod } from "@/lib/types";

const scaleOptions = [
  { value: "2" as const, label: "2×" },
  { value: "4" as const, label: "4×" },
];

const methodOptions = [
  { value: "real_esrgan" as UpscaleMethod, label: "Standard (Real-ESRGAN)" },
  { value: "swinir" as UpscaleMethod, label: "Detailed (SwinIR)" },
];

export default function UploadPage() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [scale, setScale] = useState<2 | 4>(4);
  const [method, setMethod] = useState<UpscaleMethod>("real_esrgan");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelected = useCallback((newFiles: File[]) => {
    setFiles(newFiles);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) {
      setError("Select at least one image");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const { job_ids } = await uploadJobs(files, { scale, method });
      router.push(`/jobs?ids=${job_ids.join(",")}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
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
            <RadioGroup
              name="scale"
              label="Scale"
              options={scaleOptions as { value: "2" | "4"; label: string }[]}
              value={String(scale) as "2" | "4"}
              onChange={(v) => setScale(Number(v) as 2 | 4)}
            />
          </div>
          <div className="rounded-2xl bg-white/70 dark:bg-zinc-800/60 backdrop-blur-sm border border-white/80 dark:border-zinc-700/80 p-5 shadow-sm">
            <RadioGroup
              name="method"
              label="Method"
              options={methodOptions}
              value={method}
              onChange={setMethod}
            />
          </div>
          {error && (
            <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading || files.length === 0}
            className="gradient-ai w-full rounded-xl px-4 py-4 font-semibold text-white shadow-lg shadow-violet-200/50 dark:shadow-violet-500/30 hover:shadow-violet-300/50 dark:hover:shadow-violet-500/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200"
          >
            {loading ? "Uploading…" : "Upload and upscale"}
          </button>
        </form>
      </div>
    </main>
  );
}
