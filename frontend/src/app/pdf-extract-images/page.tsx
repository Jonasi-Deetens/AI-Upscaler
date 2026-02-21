"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { FileDropzone } from "@/components/FileDropzone";
import { uploadJobsWithProgress, getQueueStats } from "@/lib/api";
import { uploadErrorMessage } from "@/lib/uploadErrors";

export default function PdfExtractImagesPage() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
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
      setError("Select at least one PDF");
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
        { scale: 1, method: "pdf_extract_images", options: {} },
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
          Extract images from PDF
        </h1>
        <p className="text-muted-foreground mb-6">
          Upload PDFs to extract all embedded images into a ZIP. One job per file; download the ZIP from Jobs.
        </p>
        {(queueStats.queued > 0 || queueStats.processing > 0) && (
          <p className="mb-4 text-sm text-muted-foreground">
            {queueStats.queued} in queue, {queueStats.processing} processing.
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <FileDropzone
            onFilesSelected={handleFilesSelected}
            accept=".pdf,application/pdf"
            showPreview={false}
            maxFiles={10}
            className="mb-4"
          />
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
              : "Upload and extract"}
          </Button>
        </form>
      </div>
    </main>
  );
}
