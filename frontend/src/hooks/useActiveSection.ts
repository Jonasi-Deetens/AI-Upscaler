"use client";

import { useEffect, useState } from "react";

const SECTION_IDS = [
  "recent-jobs",
  "how-it-works",
  "methods",
  "workflow",
  "limits",
  "cta",
] as const;

export type SectionId = (typeof SECTION_IDS)[number];

export function useActiveSection(): SectionId | null {
  const [activeId, setActiveId] = useState<SectionId | null>(null);

  useEffect(() => {
    let cancelled = false;
    const observer = new IntersectionObserver(
      (entries) => {
        if (cancelled) return;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const id = entry.target.id as SectionId;
          if (SECTION_IDS.includes(id)) {
            setActiveId(id);
            break;
          }
        }
      },
      {
        rootMargin: "-80px 0px -60% 0px",
        threshold: 0,
      }
    );

    const setup = () => {
      for (const id of SECTION_IDS) {
        const el = document.getElementById(id);
        if (el) observer.observe(el);
      }
    };

    // Defer so home page sections are in the DOM (layout mounts before page content)
    const t = setTimeout(setup, 0);
    return () => {
      cancelled = true;
      clearTimeout(t);
      observer.disconnect();
    };
  }, []);

  return activeId;
}
