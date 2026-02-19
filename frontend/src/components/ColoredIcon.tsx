"use client";

import type { LucideIcon } from "lucide-react";

function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

/** Icon color variants with distinct light/dark mode values for visibility. */
export const ICON_COLORS = {
  violet: "text-violet-600 dark:text-violet-400",
  emerald: "text-emerald-600 dark:text-emerald-400",
  blue: "text-blue-600 dark:text-blue-400",
  orange: "text-orange-600 dark:text-orange-400",
  amber: "text-amber-600 dark:text-amber-400",
  cyan: "text-cyan-600 dark:text-cyan-400",
  indigo: "text-indigo-600 dark:text-indigo-400",
  rose: "text-rose-600 dark:text-rose-400",
  teal: "text-teal-600 dark:text-teal-400",
  zinc: "text-zinc-600 dark:text-zinc-400",
  primary: "text-primary",
} as const;

export type IconColor = keyof typeof ICON_COLORS;

interface ColoredIconProps {
  icon: LucideIcon;
  color?: IconColor;
  className?: string;
  size?: number;
}

export function ColoredIcon({
  icon: Icon,
  color = "primary",
  className,
  size = 24,
}: ColoredIconProps) {
  return (
    <Icon
      size={size}
      className={cn("shrink-0", ICON_COLORS[color], className)}
      aria-hidden
    />
  );
}
