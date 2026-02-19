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
    <li className="flex flex-col items-center rounded-xl bg-card transition-colors">
      <Button asChild variant="iconTile" size="md" className="mb-3">
        <Link href={tool.href}>
          <ToolIcon icon={tool.icon} className="size-6" />
        </Link>
      </Button>
      <h3 className="text-center text-sm font-semibold text-card-foreground">
        {tool.title}
      </h3>
      <p className="text-center text-xs text-muted-foreground mt-0.5">
        {tool.description}
      </p>
    </li>
  );
}
