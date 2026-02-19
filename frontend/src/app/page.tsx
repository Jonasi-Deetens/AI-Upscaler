import type { Metadata } from "next";
import { HomeApps } from "@/components/HomeApps";
import { HUB_TOOLS } from "@/lib/tools";

export const metadata: Metadata = {
  title: "AI Upscaler — Image tools",
  description: "Upscale, remove background, convert format. No sign-up.",
};

export default function Home() {
  return (
    <main className="h-full flex flex-col items-center justify-center px-4 sm:px-5 overflow-auto py-4">
      <HomeApps tools={HUB_TOOLS} />
    </main>
  );
}
