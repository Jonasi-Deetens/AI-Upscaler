/**
 * Hub tools: each has an icon (React node), title, description, and route.
 */

export interface HubTool {
  id: string;
  href: string;
  title: string;
  description: string;
  icon: "upscale" | "remove-bg" | "convert" | "jobs";
}

export const HUB_TOOLS: HubTool[] = [
  { id: "upscale", href: "/upscale", title: "Upscale", description: "2× or 4× with AI.", icon: "upscale" },
  { id: "remove-bg", href: "/remove-bg", title: "Remove BG", description: "Transparent PNG.", icon: "remove-bg" },
  { id: "convert", href: "/convert", title: "Convert", description: "WebP, PNG, JPEG.", icon: "convert" },
  { id: "jobs", href: "/jobs", title: "Jobs", description: "Status & downloads.", icon: "jobs" },
];
