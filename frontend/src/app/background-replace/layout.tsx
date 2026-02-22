import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Replace background — AI Upscaler",
  description: "Put subject onto a new background image.",
};

export default function BackgroundReplaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
