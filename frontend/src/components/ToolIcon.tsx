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
  FileDown,
  FileImage,
  CaseUpper,
  RemoveFormatting,
  Link,
  GitCompare,
  Replace,
  FileCode,
  Table2,
  Code,
  Shield,
  Gauge,
  Smartphone,
  Ruler,
  DollarSign,
  Info,
  Shuffle,
  Smile,
  MessageCircleQuestionMark,
  Timer,
  TimerReset,
  StickyNote,
  Link2,
  ListOrdered,
  ImagePlus,
  ImageDown,
  ScanLine,
  ScanText,
  Globe,
  Unlock,
  Lock,
  Trash2,
  User,
  Receipt,
  Activity,
  Flame,
  Tag,
  Calendar,
  CalendarDays,
  Percent,
  Banknote,
  FileQuestion,
  HardDrive,
  Signal,
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
  | "compress-pdf"
  | "pdf-to-images"
  | "pdf-metadata"
  | "pdf-rotate"
  | "pdf-reorder"
  | "pdf-unlock"
  | "pdf-protect"
  | "pdf-remove-pages"
  | "pdf-extract-images"
  | "lorem-ipsum"
  | "json-xml"
  | "roman-numerals"
  | "fake-data-generator"
  | "color-contrast"
  | "color-picker"
  | "json-formatter"
  | "base64"
  | "uuid-generator"
  | "regex-tester"
  | "timestamp-converter"
  | "hash"
  | "markdown-preview"
  | "random-picker"
  | "heic-to-jpg"
  | "case-converter"
  | "remove-spaces"
  | "slug-generator"
  | "diff"
  | "find-replace"
  | "yaml-json"
  | "csv-json"
  | "html-encode"
  | "jwt-decoder"
  | "cron-explainer"
  | "number-base"
  | "ascii-unicode"
  | "url-parser"
  | "password-strength"
  | "otp-generator"
  | "unit-converter"
  | "currency-converter"
  | "timezone-converter"
  | "svg-to-png"
  | "favicon-generator"
  | "image-metadata"
  | "random-number"
  | "meme-text"
  | "yes-no"
  | "pomodoro"
  | "countdown"
  | "notepad"
  | "url-encode"
  | "duplicate-lines"
  | "stopwatch"
  | "base64-image"
  | "qr-decode"
  | "ocr"
  | "tip-calculator"
  | "bmi"
  | "calorie-calculator"
  | "meta-tags"
  | "age-calculator"
  | "date-difference"
  | "escape-unescape"
  | "percentage-calculator"
  | "http-status"
  | "loan-calculator"
  | "mime-type"
  | "file-size"
  | "readability"
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
  "compress-pdf": { icon: FileDown, color: "rose" },
  "pdf-to-images": { icon: FileImage, color: "cyan" },
  "pdf-metadata": { icon: Info, color: "zinc" },
  "pdf-rotate": { icon: RotateCw, color: "indigo" },
  "pdf-reorder": { icon: ListOrdered, color: "teal" },
  "pdf-unlock": { icon: Unlock, color: "emerald" },
  "pdf-protect": { icon: Lock, color: "rose" },
  "pdf-remove-pages": { icon: Trash2, color: "orange" },
  "pdf-extract-images": { icon: ImageDown, color: "cyan" },
  "lorem-ipsum": { icon: Quote, color: "zinc" },
  "json-xml": { icon: FileCode, color: "amber" },
  "roman-numerals": { icon: Hash, color: "violet" },
  "fake-data-generator": { icon: User, color: "teal" },
  "color-contrast": { icon: Contrast, color: "rose" },
  "color-picker": { icon: Pipette, color: "rose" },
  "json-formatter": { icon: Braces, color: "amber" },
  base64: { icon: Binary, color: "indigo" },
  "uuid-generator": { icon: FingerprintPattern, color: "teal" },
  "regex-tester": { icon: Regex, color: "violet" },
  "timestamp-converter": { icon: Clock, color: "cyan" },
  hash: { icon: Hash, color: "orange" },
  "markdown-preview": { icon: BookOpen, color: "blue" },
  "random-picker": { icon: Dices, color: "emerald" },
  "heic-to-jpg": { icon: FileImage, color: "orange" },
  "case-converter": { icon: CaseUpper, color: "violet" },
  "remove-spaces": { icon: RemoveFormatting, color: "zinc" },
  "slug-generator": { icon: Link, color: "cyan" },
  diff: { icon: GitCompare, color: "amber" },
  "find-replace": { icon: Replace, color: "teal" },
  "yaml-json": { icon: FileCode, color: "amber" },
  "csv-json": { icon: Table2, color: "cyan" },
  "html-encode": { icon: Code, color: "orange" },
  "jwt-decoder": { icon: Shield, color: "violet" },
  "cron-explainer": { icon: Clock, color: "zinc" },
  "number-base": { icon: Binary, color: "indigo" },
  "ascii-unicode": { icon: Type, color: "blue" },
  "url-parser": { icon: Link, color: "teal" },
  "password-strength": { icon: Gauge, color: "emerald" },
  "otp-generator": { icon: Smartphone, color: "rose" },
  "unit-converter": { icon: Ruler, color: "cyan" },
  "currency-converter": { icon: DollarSign, color: "emerald" },
  "timezone-converter": { icon: Globe, color: "cyan" },
  "svg-to-png": { icon: FileImage, color: "violet" },
  "favicon-generator": { icon: Image, color: "amber" },
  "image-metadata": { icon: Info, color: "zinc" },
  "random-number": { icon: Shuffle, color: "violet" },
  "meme-text": { icon: Smile, color: "amber" },
  "yes-no": { icon: MessageCircleQuestionMark, color: "indigo" },
  pomodoro: { icon: Timer, color: "rose" },
  countdown: { icon: TimerReset, color: "cyan" },
  notepad: { icon: StickyNote, color: "emerald" },
  "url-encode": { icon: Link2, color: "teal" },
  "duplicate-lines": { icon: ListOrdered, color: "violet" },
  stopwatch: { icon: Clock, color: "amber" },
  "base64-image": { icon: ImagePlus, color: "blue" },
  "qr-decode": { icon: ScanLine, color: "zinc" },
  ocr: { icon: ScanText, color: "teal" },
  "tip-calculator": { icon: Receipt, color: "emerald" },
  bmi: { icon: Activity, color: "teal" },
  "calorie-calculator": { icon: Flame, color: "orange" },
  "meta-tags": { icon: Tag, color: "violet" },
  "age-calculator": { icon: Calendar, color: "cyan" },
  "date-difference": { icon: CalendarDays, color: "indigo" },
  "escape-unescape": { icon: Code, color: "zinc" },
  "percentage-calculator": { icon: Percent, color: "amber" },
  "http-status": { icon: Signal, color: "blue" },
  "loan-calculator": { icon: Banknote, color: "emerald" },
  "mime-type": { icon: FileQuestion, color: "orange" },
  "file-size": { icon: HardDrive, color: "zinc" },
  readability: { icon: BookOpen, color: "blue" },
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
