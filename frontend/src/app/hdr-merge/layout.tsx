import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HDR merge — AI Upscaler",
  description: "Combine bracketed exposures into one balanced image.",
};

export default function HdrMergeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
