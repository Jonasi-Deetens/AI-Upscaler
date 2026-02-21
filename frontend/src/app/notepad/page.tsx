"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";

const STORAGE_KEY = "notepad-content";
const DEBOUNCE_MS = 400;
const SAVED_MESSAGE_MS = 2000;

export default function NotepadPage() {
  const [content, setContent] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState<null | "saving" | "saved">(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedMessageRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasUserEditedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      setContent(saved ?? "");
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (savedMessageRef.current) clearTimeout(savedMessageRef.current);
    if (hasUserEditedRef.current) setSaveStatus("saving");
    debounceRef.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, content);
        if (hasUserEditedRef.current) setSaveStatus("saved");
        savedMessageRef.current = setTimeout(() => {
          setSaveStatus(null);
          savedMessageRef.current = null;
        }, SAVED_MESSAGE_MS);
      } finally {
        debounceRef.current = null;
      }
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (savedMessageRef.current) clearTimeout(savedMessageRef.current);
    };
  }, [content, loaded]);

  useEffect(() => {
    document.title = "Notepad — AI Upscaler";
    return () => {
      document.title = "AI Upscaler";
    };
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      hasUserEditedRef.current = true;
      setContent(e.target.value);
    },
    []
  );

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-5 py-12">
        <Link
          href="/"
          className="text-primary text-sm font-medium hover:underline inline-block mb-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
        >
          ← Back
        </Link>
        <h1 className="text-3xl font-bold text-foreground mb-6">Notepad</h1>
        <p className="text-muted-foreground mb-6">
          One persistent note. Saved in this browser (localStorage).
        </p>
        <div className="max-w-2xl space-y-2">
          {saveStatus && (
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {saveStatus === "saving" ? "Saving…" : "Saved"}
            </p>
          )}
          <textarea
            aria-label="Notepad content"
            value={content}
            onChange={handleChange}
            placeholder={loaded ? "Type your note..." : "Loading…"}
            disabled={!loaded}
            rows={16}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground font-mono text-sm resize-y min-h-[200px] disabled:opacity-70"
          />
        </div>
      </div>
    </main>
  );
}
