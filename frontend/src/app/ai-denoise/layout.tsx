import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI denoise — AI Upscaler",
  description: "Photo-grade AI noise reduction for low-light and high-ISO images.",
};

export default function AiDenoiseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
