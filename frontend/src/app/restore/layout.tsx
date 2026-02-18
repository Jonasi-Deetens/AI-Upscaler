import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Restore & colorize — AI Upscaler",
  description: "Restore old or damaged photos and add color to black-and-white images with AI.",
};

export default function RestoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
