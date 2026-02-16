import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Upscaler",
  description: "Upscale your images with AI",
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
          <Navbar />
          <div className="relative z-10 min-h-screen pt-14">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
