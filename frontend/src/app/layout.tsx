import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Geist } from "next/font/google";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { AppSearchProvider } from "@/providers/AppSearchProvider";
import { Navbar } from "@/components/Navbar";
import { ApiBanner } from "@/components/ApiBanner";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

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
      <body className={`${geist.className} font-sans antialiased min-h-screen`}>
        <ThemeProvider>
          <AppSearchProvider>
            <ApiBanner />
            <div className="relative z-10 flex h-[100dvh] max-h-screen flex-col overflow-hidden">
              <Navbar />
              <div className="flex-1 min-h-0 overflow-auto pt-28 sm:pt-14">
                <ErrorBoundary>{children}</ErrorBoundary>
              </div>
              <footer className="shrink-0 border-t border-border bg-muted/50 py-3 text-center text-sm text-muted-foreground">
              AI Upscaler — Image tools
              {" · "}
              <Link href="/jobs" className="text-accent-solid hover:underline">Jobs</Link>
              </footer>
            </div>
          </AppSearchProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
