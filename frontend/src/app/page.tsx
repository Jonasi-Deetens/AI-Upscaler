import type { Metadata } from "next";
import Link from "next/link";
import { JobList } from "@/components/JobList";
import { ToolCard } from "@/components/ToolCard";
import { HUB_TOOLS } from "@/lib/tools";

export const metadata: Metadata = {
  title: "AI Upscaler — Image tools",
  description: "Upscale, remove background, convert format. No sign-up.",
};

export default function Home() {
  return (
    <main className="min-h-screen">
      <section className="max-w-6xl mx-auto px-4 sm:px-5 py-8">
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-white mb-5">
          Apps
        </h1>
        <ul className="grid grid-cols-2 sm:grid-cols-4 gap-3" aria-label="Apps">
          {HUB_TOOLS.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </ul>
      </section>

      <section id="recent-jobs" className="border-t border-neutral-200 dark:border-zinc-800 scroll-mt-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-5 py-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-neutral-800 dark:text-zinc-200">
              Recent jobs
            </h2>
            <Link href="/jobs" className="text-xs text-violet-600 dark:text-violet-400 hover:underline">
              View all
            </Link>
          </div>
          <div className="rounded-lg border border-neutral-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 p-3 max-w-md">
            <JobList />
          </div>
        </div>
      </section>
    </main>
  );
}
