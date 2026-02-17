import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Job status — AI Upscaler",
  description: "Track your upscale jobs and download results.",
};

export default function JobsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
