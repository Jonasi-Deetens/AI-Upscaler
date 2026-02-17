import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Upload images — AI Upscaler",
  description: "Upload images to upscale with AI. Choose scale, method, and options.",
};

export default function UploadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
