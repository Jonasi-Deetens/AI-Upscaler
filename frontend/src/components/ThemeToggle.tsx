"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ColoredIcon } from "@/components/ColoredIcon";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <span
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-muted/60"
        aria-hidden
      />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      type="button"
      variant="roundPlain"
      size="sm"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="rounded-xl backdrop-blur-sm"
    >
      {isDark ? (
        <ColoredIcon icon={Sun} color="amber" size={20} />
      ) : (
        <ColoredIcon icon={Moon} color="indigo" size={20} />
      )}
    </Button>
  );
}
