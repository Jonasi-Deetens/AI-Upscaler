"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SearchBar } from "@/components/SearchBar";
import { ColoredIcon } from "@/components/ColoredIcon";
import { useMobile } from "@/hooks/useMobile";
import { useAppSearch } from "@/providers/AppSearchProvider";

const PAGES: { href: string; label: string }[] = [
  { href: "/", label: "Apps" },
  { href: "/jobs", label: "Jobs" },
];

export function Navbar() {
  const pathname = usePathname();
  const isMobile = useMobile();
  const { query, setQuery } = useAppSearch();
  const [menuOpen, setMenuOpen] = useState(false);
  const isHome = pathname === "/";

  const navLinks = PAGES.map(({ href, label }) => {
    const isActive =
      href === "/"
        ? pathname === "/"
        : pathname === href || pathname.startsWith(href + "/");
    return (
      <li key={href}>
        <Link
          href={href}
          onClick={() => isMobile && setMenuOpen(false)}
          className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
            isActive
              ? "bg-accent-gradient-nav text-white"
              : "text-muted-foreground hover:bg-accent-gradient-nav hover:text-white"
          }`}
        >
          {label}
        </Link>
      </li>
    );
  });

  return (
    <header
      className="fixed left-0 right-0 top-0 z-40 border-b border-border bg-background/95 backdrop-blur"
        role="banner"
      >
        <div className="mx-auto flex max-w-6xl w-full flex-col px-4 sm:px-5">
          <nav
            className="flex h-14 flex-shrink-0 items-center justify-between gap-3 sm:gap-4 w-full"
            aria-label="Main"
          >
            <Link
              href="/"
              className="text-lg font-semibold tracking-tight text-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md shrink-0"
            >
              AI Upscaler
            </Link>

            {isHome && !isMobile && (
              <SearchBar
                value={query}
                onChange={setQuery}
                placeholder="Search apps…"
                className="w-full min-w-0 max-w-[24rem]"
              />
            )}

            {isMobile ? (
              <div className="flex items-center gap-1 ml-auto">
                <ThemeToggle />
                <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                aria-expanded={menuOpen}
                aria-controls="mobile-nav"
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                className="rounded-lg p-2 text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {menuOpen ? (
                  <ColoredIcon icon={X} color="primary" size={24} />
                ) : (
                  <ColoredIcon icon={Menu} color="primary" size={24} />
                )}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <ul className="flex flex-wrap items-center justify-end gap-1 sm:gap-2">
                {navLinks}
              </ul>
              <ThemeToggle />
            </div>
          )}
          </nav>

          {isMobile && isHome && (
            <div className="flex shrink-0 pb-3 pt-0">
              <SearchBar
                value={query}
                onChange={setQuery}
                placeholder="Search apps…"
                className="w-full max-w-none"
              />
            </div>
          )}

        {isMobile && (
          <div
            id="mobile-nav"
            role="dialog"
            aria-label="Navigation"
            className={`border-t border-border bg-background overflow-hidden transition-[max-height,opacity] duration-200 ${
              menuOpen ? "max-h-48 opacity-100" : "max-h-0 opacity-0 pointer-events-none"
            }`}
          >
            <ul className="flex flex-col py-2">
              {navLinks}
            </ul>
          </div>
        )}
        </div>
      </header>
  );
}
