"use client";

import { useCallback, useState, useEffect, useMemo, useRef } from "react";
import { getImageDimensions, formatFileSize } from "@/lib/imageUtils";

interface FileDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  maxFiles?: number;
  /** When true, show thumbnails, size, and dimensions for each file. */
  showPreview?: boolean;
  className?: string;
}

interface FilePreview {
  file: File;
  previewUrl: string;
  dimensions: { w: number; h: number } | null;
  size: number;
}

export function FileDropzone({
  onFilesSelected,
  accept = "image/*",
  maxFiles = 10,
  showPreview = true,
  className = "",
}: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<FilePreview[]>([]);

  const buildPreviews = useCallback((files: File[]): FilePreview[] => {
    return files.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      dimensions: null,
      size: file.size,
    }));
  }, []);

  const setFiles = useCallback(
    (next: File[]) => {
      setPreviews((prev) => {
        prev.forEach((p) => URL.revokeObjectURL(p.previewUrl));
        return [];
      });
      setSelectedFiles(next);
      onFilesSelected(next);
      if (next.length > 0 && showPreview) {
        setPreviews(buildPreviews(next));
      }
    },
    [onFilesSelected, showPreview, buildPreviews]
  );

  const previewsRef = useRef<FilePreview[]>([]);
  previewsRef.current = previews;
  useEffect(() => {
    return () => {
      previewsRef.current.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    };
  }, []);

  const fileKey = useMemo(
    () => previews.map((p) => `${p.file.name}-${p.file.size}`).join("|"),
    [previews]
  );

  useEffect(() => {
    if (!showPreview || previews.length === 0) return;
    let cancelled = false;
    const resolveDimensions = async () => {
      const next = await Promise.all(
        previews.map(async (p) => {
          try {
            const dims = await getImageDimensions(p.file);
            return { ...p, dimensions: dims };
          } catch {
            return { ...p, dimensions: null };
          }
        })
      );
      if (!cancelled) setPreviews(next);
    };
    resolveDimensions();
    return () => {
      cancelled = true;
    };
  }, [showPreview, fileKey]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const items = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith("image/")
      );
      setFiles(items.slice(0, maxFiles));
    },
    [maxFiles, setFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const items = Array.from(e.target.files ?? []).filter((f) =>
        f.type.startsWith("image/")
      );
      setFiles(items.slice(0, maxFiles));
    },
    [maxFiles, setFiles]
  );

  const removeFile = useCallback(
    (index: number) => {
      const next = selectedFiles.filter((_, i) => i !== index);
      const toRevoke = previews[index]?.previewUrl;
      if (toRevoke) URL.revokeObjectURL(toRevoke);
      setPreviews((p) => p.filter((_, i) => i !== index));
      setSelectedFiles(next);
      onFilesSelected(next);
    },
    [selectedFiles, previews, onFilesSelected]
  );

  const listItems = showPreview && previews.length > 0 ? previews : selectedFiles.map((f) => ({ file: f, previewUrl: "", dimensions: null as { w: number; h: number } | null, size: f.size }));

  return (
    <div className={className}>
      <label
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          flex flex-col items-center justify-center w-full min-h-[220px] rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200
          ${isDragging
            ? "border-violet-400 dark:border-violet-500 bg-gradient-to-br from-violet-50/80 to-fuchsia-50/80 dark:from-violet-950/50 dark:to-fuchsia-950/40 shadow-inner"
            : "border-neutral-200 dark:border-zinc-600 bg-white/60 dark:bg-zinc-800/50 backdrop-blur-sm hover:border-violet-200 dark:hover:border-violet-500/60 hover:bg-white/80 dark:hover:bg-zinc-800/70"
          }
        `}
      >
        <input
          type="file"
          accept={accept}
          multiple
          onChange={handleChange}
          className="hidden"
        />
        <p className="text-sm text-neutral-500 dark:text-zinc-400 text-center px-4">
          Drag and drop images here, or click to select (max {maxFiles} files)
        </p>
      </label>
      {listItems.length > 0 && (
        <ul className="mt-3 space-y-3 text-sm rounded-xl bg-white/60 dark:bg-zinc-800/50 backdrop-blur-sm border border-white/80 dark:border-zinc-700/80 p-3">
          {listItems.map((item, i) => (
            <li
              key={`${item.file.name}-${i}`}
              className="flex items-center gap-3 text-neutral-700 dark:text-zinc-300"
            >
              {showPreview && item.previewUrl ? (
                <div className="h-12 w-12 shrink-0 rounded-lg overflow-hidden bg-neutral-200 dark:bg-zinc-700">
                  <img
                    src={item.previewUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : null}
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{item.file.name}</p>
                <p className="text-xs text-neutral-500 dark:text-zinc-400">
                  {formatFileSize(item.size)}
                  {item.dimensions
                    ? ` · ${item.dimensions.w}×${item.dimensions.h}`
                    : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="shrink-0 text-rose-500 dark:text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 font-medium"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
