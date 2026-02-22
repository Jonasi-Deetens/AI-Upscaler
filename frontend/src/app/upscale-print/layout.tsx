import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Upscale for print — AI Upscaler",
  description: "Get print-ready images at A4, A3, or custom size and DPI.",
};

export default function UpscalePrintLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
