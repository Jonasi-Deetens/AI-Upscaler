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
  Contrast,
  Palette,
  SlidersHorizontal,
  Image,
  Square,
  LayoutGrid,
  FileText,
  Circle,
  Camera,
  Grid3x3,
  ScanLine,
  CircleUser,
  Paintbrush,
  Key,
  QrCode,
  FileStack,
  Quote,
  Pipette,
  Braces,
  Binary,
  FingerprintPattern,
  Regex,
  Clock,
  Hash,
  BookOpen,
  Dices,
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
  | "auto-levels"
  | "saturation"
  | "color-balance"
  | "filters"
  | "border"
  | "collage"
  | "image-to-pdf"
  | "vignette"
  | "tilt-shift"
  | "pixelate"
  | "smart-crop"
  | "background-blur"
  | "inpaint"
  | "word-counter"
  | "password-generator"
  | "qr-code"
  | "pdf-merge-split"
  | "lorem-ipsum"
  | "color-picker"
  | "json-formatter"
  | "base64"
  | "uuid-generator"
  | "regex-tester"
  | "timestamp-converter"
  | "hash"
  | "markdown-preview"
  | "random-picker"
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
  "auto-levels": { icon: Contrast, color: "cyan" },
  saturation: { icon: Palette, color: "amber" },
  "color-balance": { icon: SlidersHorizontal, color: "rose" },
  filters: { icon: Image, color: "zinc" },
  border: { icon: Square, color: "indigo" },
  collage: { icon: LayoutGrid, color: "emerald" },
  "image-to-pdf": { icon: FileText, color: "orange" },
  vignette: { icon: Circle, color: "zinc" },
  "tilt-shift": { icon: Camera, color: "indigo" },
  pixelate: { icon: Grid3x3, color: "rose" },
  "smart-crop": { icon: ScanLine, color: "cyan" },
  "background-blur": { icon: CircleUser, color: "emerald" },
  inpaint: { icon: Paintbrush, color: "amber" },
  "word-counter": { icon: FileText, color: "blue" },
  "password-generator": { icon: Key, color: "emerald" },
  "qr-code": { icon: QrCode, color: "zinc" },
  "pdf-merge-split": { icon: FileStack, color: "rose" },
  "lorem-ipsum": { icon: Quote, color: "zinc" },
  "color-picker": { icon: Pipette, color: "rose" },
  "json-formatter": { icon: Braces, color: "amber" },
  base64: { icon: Binary, color: "indigo" },
  "uuid-generator": { icon: FingerprintPattern, color: "teal" },
  "regex-tester": { icon: Regex, color: "violet" },
  "timestamp-converter": { icon: Clock, color: "cyan" },
  hash: { icon: Hash, color: "orange" },
  "markdown-preview": { icon: BookOpen, color: "blue" },
  "random-picker": { icon: Dices, color: "emerald" },
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
