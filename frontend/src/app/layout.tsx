import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { Navbar } from "@/components/Navbar";
import { ApiBanner } from "@/components/ApiBanner";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Upscaler",
  description: "Upscale your images with AI. Clean, fast, no sign-up. Real-ESRGAN, SwinIR, 2× and 4×.",
  openGraph: {
    title: "AI Upscaler",
    description: "Upscale your images with AI. Clean, fast, no sign-up.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Upscaler",
    description: "Upscale your images with AI. Clean, fast, no sign-up.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.className} min-h-screen text-neutral-800 dark:text-zinc-200`}>
        <ThemeProvider>
          <ApiBanner />
          <Navbar />
          <div className="relative z-10 min-h-screen pt-14">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
