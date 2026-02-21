"use client";

import { useMemo } from "react";
import { ToolCard } from "@/components/ToolCard";
import { useAppSearch } from "@/providers/AppSearchProvider";
import type { HubTool, HubToolCategory } from "@/lib/tools";
import { CATEGORY_ORDER } from "@/lib/tools";
import { cn } from "@/lib/utils";
import { useMobile } from "@/hooks/useMobile";

const CATEGORY_LABELS: Record<HubToolCategory, string> = {
  image: "Image",
  conversion: "Conversion",
  calculators: "Calculators",
  health: "Health",
  seo: "SEO & sharing",
  pdf: "PDF",
  text: "Text",
  dev: "Dev & security",
  fun: "Fun & random",
  productivity: "Productivity",
  other: "Other",
};

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

function groupByCategory(tools: HubTool[]): Map<HubToolCategory, HubTool[]> {
  const map = new Map<HubToolCategory, HubTool[]>();
  for (const tool of tools) {
    const list = map.get(tool.category) ?? [];
    list.push(tool);
    map.set(tool.category, list);
  }
  return map;
}

export function HomeApps({ tools }: HomeAppsProps) {
  const { query } = useAppSearch();
  const filtered = useMemo(() => filterTools(tools, query), [tools, query]);
  const byCategory = useMemo(() => groupByCategory(filtered), [filtered]);
  const isMobile = useMobile();

  return (
    <section className="max-w-6xl h-full w-full flex flex-col">
      {CATEGORY_ORDER.map((category) => {
        const categoryTools = byCategory.get(category);
        if (!categoryTools?.length) return null;
        return (
          <div
            key={category}
            className={cn(isMobile ? "pt-2" : "pt-8")}
          >
            <h2 className="text-sm font-semibold text-accent-solid uppercase tracking-wider pb-4 border-b border-border">
              {CATEGORY_LABELS[category]}
            </h2>
            <ul
              className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 last:mb-8"
              aria-label={`${CATEGORY_LABELS[category]} apps`}
            >
              {categoryTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </ul>
          </div>
        );
      })}
      {filtered.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          No apps match &quot;{query}&quot;.
        </p>
      )}
    </section>
  );
}
