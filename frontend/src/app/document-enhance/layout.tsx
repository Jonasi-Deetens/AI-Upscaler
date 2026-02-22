import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Document scanner — AI Upscaler",
  description: "Clean up photos of documents: deskew, denoise, and binarize.",
};

export default function DocumentEnhanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
