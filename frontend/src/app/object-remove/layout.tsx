import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI object removal — AI Upscaler",
  description: "Remove objects or people from photos using AI (LaMa). Upload image and mask.",
};

export default function ObjectRemoveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
