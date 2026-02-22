import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fix blurry photos — AI Upscaler",
  description: "AI deblur for motion-blurred or shaky photos.",
};

export default function DeblurLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
