"use client";

import { useCallback, useState, useEffect, useMemo, useRef } from "react";
import { Button } from "@/components/ui/Button";
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
  // fileKey is derived from previews; listing previews here would re-run when dimensions resolve and cause a loop
  // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: react to file identity, not preview object refs
  }, [showPreview, fileKey]);

  const isImageOnly = accept === "image/*" || !accept;

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const raw = Array.from(e.dataTransfer.files);
      const items = isImageOnly
        ? raw.filter((f) => f.type.startsWith("image/"))
        : raw;
      setFiles(items.slice(0, maxFiles));
    },
    [maxFiles, setFiles, isImageOnly]
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
      const raw = Array.from(e.target.files ?? []);
      const items = isImageOnly
        ? raw.filter((f) => f.type.startsWith("image/"))
        : raw;
      setFiles(items.slice(0, maxFiles));
    },
    [maxFiles, setFiles, isImageOnly]
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
            ? "border-primary bg-accent/50 shadow-inner"
            : "border-input bg-muted/50 backdrop-blur-sm hover:border-primary/50 hover:bg-muted"
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
        <p className="text-sm text-muted-foreground text-center px-4">
          {isImageOnly
            ? `Drag and drop images here, or click to select (max ${maxFiles} files)`
            : `Drag and drop files here, or click to select (max ${maxFiles} files)`}
        </p>
      </label>
      {listItems.length > 0 && (
        <ul className="mt-3 space-y-3 text-sm rounded-xl bg-card border border-border p-3">
          {listItems.map((item, i) => (
            <li
              key={`${item.file.name}-${i}`}
              className="flex items-center gap-3 text-foreground"
            >
              {showPreview && item.previewUrl ? (
                <div className="h-12 w-12 shrink-0 rounded-lg overflow-hidden bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element -- blob URL from createObjectURL */}
                  <img
                    src={item.previewUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : null}
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{item.file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(item.size)}
                  {item.dimensions
                    ? ` · ${item.dimensions.w}×${item.dimensions.h}`
                    : ""}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                destructive
                onClick={() => removeFile(i)}
                className="shrink-0"
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
