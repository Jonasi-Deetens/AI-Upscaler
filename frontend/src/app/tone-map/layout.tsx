import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tone mapping — AI Upscaler",
  description: "Balance exposure with Reinhard tone mapping.",
};

export default function ToneMapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
