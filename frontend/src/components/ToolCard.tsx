"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ToolIcon } from "@/components/ToolIcon";
import type { HubTool } from "@/lib/tools";

interface ToolCardProps {
  tool: HubTool;
}

export function ToolCard({ tool }: ToolCardProps) {
  return (
    <li className="flex flex-col items-center rounded-lg p-5">
      <Button asChild variant="iconTile" size="md" className="mb-3">
        <Link href={tool.href}>
          <span
            className="absolute inset-0 bg-gradient-to-br from-violet-500 via-fuchsia-500 to-orange-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-active:opacity-100"
            aria-hidden
          />
          <ToolIcon icon={tool.icon} className="relative z-10 size-6" />
        </Link>
      </Button>
      <h3 className="text-center text-sm font-semibold text-neutral-900 dark:text-white">
        {tool.title}
      </h3>
      <p className="text-center text-xs text-neutral-500 dark:text-zinc-400 mt-0.5">
        {tool.description}
      </p>
    </li>
  );
}
