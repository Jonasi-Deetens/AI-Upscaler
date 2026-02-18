"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";

const PAGES: { href: string; label: string }[] = [
  { href: "/", label: "Tools" },
  { href: "/upscale", label: "Upscale" },
  { href: "/remove-bg", label: "Remove BG" },
  { href: "/convert", label: "Convert" },
  { href: "/jobs", label: "Jobs" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header
      className="fixed left-0 right-0 top-0 z-40 h-14 border-b border-neutral-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md"
      role="banner"
    >
      <nav
        className="mx-auto flex h-full max-w-6xl items-center justify-between gap-4 px-5"
        aria-label="Main"
      >
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-white hover:text-violet-600 dark:hover:text-violet-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 rounded-md"
        >
          AI Upscaler
        </Link>
        <div className="flex items-center gap-2">
          <ul className="flex flex-wrap items-center justify-end gap-1 sm:gap-2">
            {PAGES.map(({ href, label }) => {
              const isActive =
                href === "/"
                  ? pathname === "/"
                  : pathname === href || pathname.startsWith(href + "/");
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={`rounded-full px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 ${
                      isActive
                        ? "bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300"
                        : "text-neutral-600 dark:text-zinc-400 hover:bg-neutral-100 dark:hover:bg-zinc-800 hover:text-neutral-900 dark:hover:text-zinc-200"
                    }`}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
