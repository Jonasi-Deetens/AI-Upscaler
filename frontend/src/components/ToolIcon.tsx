"use client";

import type { LucideIcon } from "lucide-react";
import {
  Maximize2,
  Scan,
  FileType,
  Shrink,
  Sparkles,
  Move,
  RotateCw,
  Crop,
  FileX,
  Wand2,
  ClipboardList,
  Focus,
  Sun,
  Type,
  FilePen,
} from "lucide-react";
import { ColoredIcon, type IconColor } from "@/components/ColoredIcon";

export type ToolIconId =
  | "upscale"
  | "remove-bg"
  | "convert"
  | "compress"
  | "restore"
  | "resize"
  | "rotate-flip"
  | "crop"
  | "strip-metadata"
  | "denoise"
  | "blur-sharpen"
  | "brightness-contrast"
  | "watermark"
  | "rename"
  | "jobs";

const TOOL_ICONS: Record<ToolIconId, { icon: LucideIcon; color: IconColor }> = {
  upscale: { icon: Maximize2, color: "violet" },
  "remove-bg": { icon: Scan, color: "emerald" },
  convert: { icon: FileType, color: "blue" },
  compress: { icon: Shrink, color: "orange" },
  restore: { icon: Sparkles, color: "amber" },
  resize: { icon: Move, color: "cyan" },
  "rotate-flip": { icon: RotateCw, color: "indigo" },
  crop: { icon: Crop, color: "rose" },
  "strip-metadata": { icon: FileX, color: "zinc" },
  denoise: { icon: Wand2, color: "teal" },
  "blur-sharpen": { icon: Focus, color: "indigo" },
  "brightness-contrast": { icon: Sun, color: "amber" },
  watermark: { icon: Type, color: "blue" },
  rename: { icon: FilePen, color: "zinc" },
  jobs: { icon: ClipboardList, color: "primary" },
};

interface ToolIconProps {
  icon: ToolIconId;
  className?: string;
}

export function ToolIcon({ icon, className }: ToolIconProps) {
  const { icon: Icon, color } = TOOL_ICONS[icon];
  return <ColoredIcon icon={Icon} color={color} className={className} size={24} />;
}
