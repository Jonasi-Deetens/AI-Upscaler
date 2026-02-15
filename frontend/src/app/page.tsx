import Link from "next/link";
import { JobList } from "@/components/JobList";

export default function Home() {
  return (
    <main className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-20 sm:py-28">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-neutral-900 dark:text-white mb-5">
          AI Upscaler
        </h1>
        <p className="text-lg text-neutral-600 dark:text-zinc-400 max-w-2xl mb-10">
          Upscale your images with AI. Choose Standard (Real-ESRGAN) for best
          general results, or Detailed (SwinIR) for sharper details. Support for
          2× and 4× scaling.
        </p>
        <div className="flex flex-wrap gap-4 mb-16">
          <Link
            href="/upload"
            className="gradient-ai inline-flex items-center justify-center rounded-xl px-8 py-4 text-base font-semibold text-white shadow-lg shadow-violet-200/50 dark:shadow-violet-500/30 hover:shadow-violet-300/50 dark:hover:shadow-violet-500/40 transition-all duration-200"
          >
            Upload images
          </Link>
        </div>
        <JobList />
        <section className="rounded-2xl bg-white/70 dark:bg-zinc-800/60 backdrop-blur-sm border border-white/80 dark:border-zinc-700/80 p-6 shadow-sm max-w-2xl">
          <h2 className="text-lg font-semibold text-neutral-800 dark:text-zinc-100 mb-2">
            Limits
          </h2>
          <p className="text-sm text-neutral-600 dark:text-zinc-400">
            Max 10 files per batch, 50 MB per file, 16 megapixels per image.
            Results expire after 1 hour.
          </p>
        </section>
      </div>
    </main>
  );
}
