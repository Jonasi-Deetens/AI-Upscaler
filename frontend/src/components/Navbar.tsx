"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";

const SECTIONS = [
  { id: "recent-jobs", label: "Recent jobs" },
  { id: "how-it-works", label: "How it works" },
  { id: "methods", label: "Methods" },
  { id: "workflow", label: "Workflow" },
  { id: "limits", label: "Limits" },
  { id: "cta", label: "Upload" },
] as const;

export function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <header
      className="fixed left-0 right-0 top-0 z-40 border-b border-neutral-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md"
      role="banner"
    >
      <nav
        className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3"
        aria-label="Main"
      >
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-white hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
        >
          AI Upscaler
        </Link>
        <div className="flex items-center gap-2">
        <ul className="flex flex-wrap items-center justify-end gap-1 sm:gap-2">
          {isHome ? (
            SECTIONS.map(({ id, label }) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className="rounded-full px-3 py-2 text-sm font-medium text-neutral-600 dark:text-zinc-400 hover:bg-neutral-100 dark:hover:bg-zinc-800 hover:text-neutral-900 dark:hover:text-zinc-200 transition-colors"
                >
                  {label}
                </a>
              </li>
            ))
          ) : (
            <>
              <li>
                <Link
                  href="/#recent-jobs"
                  className="rounded-full px-3 py-2 text-sm font-medium text-neutral-600 dark:text-zinc-400 hover:bg-neutral-100 dark:hover:bg-zinc-800 hover:text-neutral-900 dark:hover:text-zinc-200 transition-colors"
                >
                  Recent jobs
                </Link>
              </li>
              <li>
                <Link
                  href="/upload"
                  className="rounded-full px-3 py-2 text-sm font-medium text-neutral-600 dark:text-zinc-400 hover:bg-neutral-100 dark:hover:bg-zinc-800 hover:text-neutral-900 dark:hover:text-zinc-200 transition-colors"
                >
                  Upload
                </Link>
              </li>
            </>
          )}
        </ul>
        <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
