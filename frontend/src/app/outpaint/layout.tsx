import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI expand image — AI Upscaler",
  description: "Extend image borders with AI outpainting.",
};

export default function OutpaintLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
