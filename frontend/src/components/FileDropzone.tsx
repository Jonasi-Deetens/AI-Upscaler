"use client";

import { useCallback, useState } from "react";

interface FileDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  maxFiles?: number;
  className?: string;
}

export function FileDropzone({
  onFilesSelected,
  accept = "image/*",
  maxFiles = 10,
  className = "",
}: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const items = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith("image/")
      );
      const next = items.slice(0, maxFiles);
      setSelectedFiles(next);
      onFilesSelected(next);
    },
    [maxFiles, onFilesSelected]
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
      const next = items.slice(0, maxFiles);
      setSelectedFiles(next);
      onFilesSelected(next);
    },
    [maxFiles, onFilesSelected]
  );

  const removeFile = useCallback(
    (index: number) => {
      const next = selectedFiles.filter((_, i) => i !== index);
      setSelectedFiles(next);
      onFilesSelected(next);
    },
    [selectedFiles, onFilesSelected]
  );

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
      {selectedFiles.length > 0 && (
        <ul className="mt-3 space-y-2 text-sm rounded-xl bg-white/60 dark:bg-zinc-800/50 backdrop-blur-sm border border-white/80 dark:border-zinc-700/80 p-3">
          {selectedFiles.map((f, i) => (
            <li
              key={`${f.name}-${i}`}
              className="flex items-center justify-between text-neutral-700 dark:text-zinc-300"
            >
              <span className="truncate">{f.name}</span>
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="ml-2 text-rose-500 dark:text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 font-medium"
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
