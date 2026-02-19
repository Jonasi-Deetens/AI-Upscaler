/**
 * Hub tools: each has an icon (React node), title, description, and route.
 */

export interface HubTool {
  id: string;
  href: string;
  title: string;
  description: string;
  icon: "upscale" | "remove-bg" | "convert" | "compress" | "restore" | "resize" | "rotate-flip" | "crop" | "strip-metadata" | "denoise" | "blur-sharpen" | "brightness-contrast" | "watermark" | "rename" | "jobs";
}

export const HUB_TOOLS: HubTool[] = [
  { id: "upscale", href: "/upscale", title: "Upscale", description: "2× or 4× with AI.", icon: "upscale" },
  { id: "remove-bg", href: "/remove-bg", title: "Remove BG", description: "Transparent PNG.", icon: "remove-bg" },
  { id: "convert", href: "/convert", title: "Convert", description: "WebP, PNG, JPEG.", icon: "convert" },
  { id: "compress", href: "/compress", title: "Compress", description: "Smaller files, WebP or JPEG.", icon: "compress" },
  { id: "restore", href: "/restore", title: "Restore & colorize", description: "Restore and colorize old photos.", icon: "restore" },
  { id: "resize", href: "/resize", title: "Resize", description: "Max width/height, fit inside or exact.", icon: "resize" },
  { id: "rotate-flip", href: "/rotate-flip", title: "Rotate & flip", description: "90° rotate, horizontal or vertical flip.", icon: "rotate-flip" },
  { id: "crop", href: "/crop", title: "Crop", description: "Crop by x, y, width, height.", icon: "crop" },
  { id: "strip-metadata", href: "/strip-metadata", title: "Strip metadata", description: "Remove EXIF and metadata.", icon: "strip-metadata" },
  { id: "denoise", href: "/denoise", title: "Denoise", description: "Reduce image noise (AI-free).", icon: "denoise" },
  { id: "blur-sharpen", href: "/blur-sharpen", title: "Blur / Sharpen", description: "Gaussian blur or unsharp mask.", icon: "blur-sharpen" },
  { id: "brightness-contrast", href: "/brightness-contrast", title: "Brightness & contrast", description: "Adjust brightness and contrast.", icon: "brightness-contrast" },
  { id: "watermark", href: "/watermark", title: "Watermark", description: "Add text overlay.", icon: "watermark" },
  { id: "rename", href: "/rename", title: "Rename", description: "Add prefix to filenames.", icon: "rename" },
  { id: "jobs", href: "/jobs", title: "Jobs", description: "Status & downloads.", icon: "jobs" },
];
