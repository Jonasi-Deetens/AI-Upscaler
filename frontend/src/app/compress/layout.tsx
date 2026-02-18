import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compress — AI Upscaler",
  description: "Reduce image file size with WebP or JPEG at your chosen quality.",
};

export default function CompressLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
