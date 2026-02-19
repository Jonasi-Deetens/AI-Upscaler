"use client";

import { useMemo } from "react";
import { ToolCard } from "@/components/ToolCard";
import { useAppSearch } from "@/providers/AppSearchProvider";
import type { HubTool } from "@/lib/tools";

interface HomeAppsProps {
  tools: HubTool[];
}

function filterTools(tools: HubTool[], query: string): HubTool[] {
  const q = query.trim().toLowerCase();
  if (!q) return tools;
  return tools.filter(
    (t) =>
      t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
  );
}

export function HomeApps({ tools }: HomeAppsProps) {
  const { query } = useAppSearch();
  const filtered = useMemo(() => filterTools(tools, query), [tools, query]);

  return (
    <section className="max-w-6xl h-full w-full flex flex-col gap-4">
      <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3" aria-label="Apps">
        {filtered.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </ul>
      {filtered.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          No apps match &quot;{query}&quot;.
        </p>
      )}
    </section>
  );
}
