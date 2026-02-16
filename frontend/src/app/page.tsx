import Link from "next/link";
import { JobList } from "@/components/JobList";
import { BeforeAfterSlider } from "@/components/BeforeAfterSlider";

const HERO_OPTIONS = [
  "2× & 4×",
  "Standard",
  "Anime",
  "SwinIR",
  "Denoise",
  "Face enhance",
  "BG remove",
];

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero: comparison above title, then title left + job list right */}
      <section className="section-hero min-h-screen flex flex-col gap-4 px-5 py-12 lg:py-16 max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10 lg:gap-16 flex-1 min-h-0">
          <div className="flex flex-col justify-center lg:max-w-md">
            <span className="inline-flex w-fit items-center rounded-full bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 dark:from-violet-400/15 dark:to-fuchsia-400/15 border border-violet-200/60 dark:border-violet-500/30 px-3 py-1 text-xs font-medium text-violet-700 dark:text-violet-300 mb-5">
              AI-powered upscaling
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-neutral-900 dark:text-white mb-4">
              AI Upscaler
            </h1>
            <p className="text-lg sm:text-xl text-neutral-500 dark:text-zinc-400 font-light tracking-tight mb-6">
              Upscale any image. Clean, fast, no sign-up.
            </p>
            <ul className="flex flex-wrap gap-2 mb-10" aria-label="Features">
              {HERO_OPTIONS.map((label) => (
                <li key={label}>
                  <span className="inline-flex items-center rounded-full border border-neutral-200 dark:border-zinc-600 bg-neutral-50/80 dark:bg-zinc-800/80 px-3 py-1 text-xs font-medium text-neutral-600 dark:text-zinc-400">
                    {label}
                  </span>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/upload"
                className="gradient-ai inline-flex items-center justify-center rounded-full text-white px-8 py-4 text-base font-medium hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-violet-200/50 dark:shadow-violet-500/30"
              >
                Get started
              </Link>
              <Link
                href="/jobs"
                className="btn-ai-secondary inline-flex active:scale-[0.98] transition-transform"
              >
                <span className="btn-ai-secondary-inner">
                  <span>View all</span>
                </span>
              </Link>
            </div>
          </div>
          <div className="shrink-0 w-full max-w-xl min-h-[450px]">
            <BeforeAfterSlider />
          </div>
        </div>
        <a
          href="#recent-jobs"
          className="bounce-arrow mx-auto mt-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-neutral-200 dark:border-zinc-600 bg-white/80 dark:bg-zinc-800/80 text-neutral-500 dark:text-zinc-400 hover:border-neutral-300 dark:hover:border-zinc-500 hover:text-neutral-700 dark:hover:text-zinc-300 transition-colors"
          aria-label="Scroll to next section"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </a>
      </section>

      {/* Job list */}
      <section id="recent-jobs" className="max-w-6xl mx-auto px-5 py-16 sm:py-24 scroll-mt-24">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900 dark:text-white mb-3">
          Recent jobs.
        </h2>
        <div className="flex-1 lg:max-w-[380px] lg:min-w-[300px] min-h-0 flex flex-col">
          <JobList />
        </div>
      </section>

      {/* What it does */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-5 py-16 sm:py-24 border-t border-neutral-200/80 dark:border-zinc-800/80 scroll-mt-24">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900 dark:text-white mb-3">
          Better resolution, automatically.
        </h2>
        <p className="text-lg text-neutral-500 dark:text-zinc-400 leading-relaxed">
          Upload a photo or illustration. Choose 2× or 4× scale and the method that fits—general purpose, anime, or extra detail. You get a higher-resolution image in minutes, with no watermark and no account required.
        </p>
      </section>

      {/* Methods */}
      <section id="methods" className="max-w-6xl mx-auto px-5 py-16 sm:py-24 border-t border-neutral-200/80 dark:border-zinc-800/80 scroll-mt-24">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900 dark:text-white mb-8">
          Built for different needs.
        </h2>
        <ul className="space-y-6">
          {[
            {
              title: "Standard",
              desc: "Best for photos and mixed content. Real-ESRGAN, tuned for real-world images.",
            },
            {
              title: "Anime",
              desc: "Optimized for anime and illustrations. Same engine, different training.",
            },
            {
              title: "Detailed",
              desc: "SwinIR for sharper fine detail when you need maximum clarity.",
            },
            {
              title: "Remove background",
              desc: "One-click background removal. Output is a transparent PNG.",
            },
          ].map((item) => (
            <li key={item.title} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4">
              <span className="text-base font-medium text-neutral-900 dark:text-white shrink-0 sm:w-36">
                {item.title}
              </span>
              <span className="text-neutral-500 dark:text-zinc-400 text-sm sm:text-base leading-relaxed">
                {item.desc}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Optional steps */}
      <section id="workflow" className="max-w-6xl mx-auto px-5 py-16 sm:py-24 border-t border-neutral-200/80 dark:border-zinc-800/80 scroll-mt-24">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900 dark:text-white mb-8">
          Simple workflow.
        </h2>
        <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            "Upload one or more images (up to 10 per batch).",
            "Pick scale and method. Optionally enable denoise or face enhance.",
            "Processing runs in the background. Refresh to see status.",
            "Download the result before it expires (1 hour).",
          ].map((step, i) => (
            <li
              key={i}
              className="flex flex-col rounded-xl border border-neutral-200/80 dark:border-zinc-700/80 bg-white dark:bg-zinc-800/60 px-5 py-4 shadow-sm shadow-neutral-200/50 dark:shadow-none"
            >
              <span
                className="mb-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/15 to-fuchsia-500/15 dark:from-violet-400/20 dark:to-fuchsia-400/20 text-sm font-semibold text-violet-600 dark:text-violet-400"
                aria-hidden
              >
                {i + 1}
              </span>
              <p className="text-[15px] leading-relaxed text-neutral-600 dark:text-zinc-400">
                {step}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* Limits */}
      <section id="limits" className="max-w-6xl mx-auto px-5 py-16 sm:py-24 border-t border-neutral-200/80 dark:border-zinc-800/80 scroll-mt-24">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900 dark:text-white mb-3">
          Limits.
        </h2>
        <p className="text-neutral-500 dark:text-zinc-400 leading-relaxed">
          Max 10 files per batch, 50 MB per file, 16 megapixels per image. Results are available for 1 hour after completion.
        </p>
      </section>

      {/* CTA */}
      <section id="cta" className="max-w-6xl mx-auto px-5 pb-24 sm:pb-32 border-t border-neutral-200/80 dark:border-zinc-800/80 pt-16 sm:pt-24 scroll-mt-24">
        <div className="flex justify-center">
          <Link
            href="/upload"
            className="gradient-ai inline-flex items-center justify-center rounded-full text-white px-8 py-4 text-base font-medium hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-violet-200/50 dark:shadow-violet-500/30"
          >
            Upload images
          </Link>
        </div>
      </section>
    </main>
  );
}
