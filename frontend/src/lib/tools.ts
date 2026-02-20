/**
 * Hub tools: each has an icon (React node), title, description, and route.
 */

export interface HubTool {
  id: string;
  href: string;
  title: string;
  description: string;
  icon: "upscale" | "remove-bg" | "convert" | "compress" | "restore" | "resize" | "rotate-flip" | "crop" | "strip-metadata" | "denoise" | "blur-sharpen" | "brightness-contrast" | "watermark" | "rename" | "auto-levels" | "saturation" | "color-balance" | "filters" | "border" | "collage" | "image-to-pdf" | "vignette" | "tilt-shift" | "pixelate" | "smart-crop" | "background-blur" | "inpaint" | "word-counter" | "password-generator" | "qr-code" | "pdf-merge-split" | "lorem-ipsum" | "color-picker" | "json-formatter" | "base64" | "uuid-generator" | "regex-tester" | "timestamp-converter" | "hash" | "markdown-preview" | "random-picker" | "jobs";
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
  { id: "auto-levels", href: "/auto-levels", title: "Auto levels", description: "One-click histogram stretch or equalize.", icon: "auto-levels" },
  { id: "saturation", href: "/saturation", title: "Saturation", description: "Adjust saturation and vibrance.", icon: "saturation" },
  { id: "color-balance", href: "/color-balance", title: "Color balance", description: "R, G, B sliders.", icon: "color-balance" },
  { id: "filters", href: "/filters", title: "Filters", description: "Grayscale, sepia, vintage presets.", icon: "filters" },
  { id: "border", href: "/border", title: "Border", description: "Add padding or frame.", icon: "border" },
  { id: "collage", href: "/collage", title: "Collage", description: "Grid layout from multiple images.", icon: "collage" },
  { id: "image-to-pdf", href: "/image-to-pdf", title: "Image to PDF", description: "Combine images into one PDF.", icon: "image-to-pdf" },
  { id: "vignette", href: "/vignette", title: "Vignette", description: "Darken corners with radial falloff.", icon: "vignette" },
  { id: "tilt-shift", href: "/tilt-shift", title: "Tilt-shift", description: "Fake miniature with gradient blur.", icon: "tilt-shift" },
  { id: "pixelate", href: "/pixelate", title: "Pixelate", description: "Mosaic effect or privacy blur.", icon: "pixelate" },
  { id: "smart-crop", href: "/smart-crop", title: "Smart crop", description: "Crop to ratio keeping important region.", icon: "smart-crop" },
  { id: "background-blur", href: "/background-blur", title: "Portrait blur", description: "Blur background, keep subject sharp.", icon: "background-blur" },
  { id: "inpaint", href: "/inpaint", title: "Inpaint", description: "Content-aware fill from a mask.", icon: "inpaint" },
  { id: "word-counter", href: "/word-counter", title: "Word counter", description: "Words, characters, reading time.", icon: "word-counter" },
  { id: "password-generator", href: "/password-generator", title: "Password generator", description: "Strong random passwords.", icon: "password-generator" },
  { id: "qr-code", href: "/qr-code", title: "QR code", description: "Generate QR from text or URL.", icon: "qr-code" },
  { id: "pdf-merge-split", href: "/pdf-merge-split", title: "PDF merge/split", description: "Merge PDFs or split by pages.", icon: "pdf-merge-split" },
  { id: "lorem-ipsum", href: "/lorem-ipsum", title: "Lorem ipsum", description: "Placeholder text generator.", icon: "lorem-ipsum" },
  { id: "color-picker", href: "/color-picker", title: "Color picker", description: "Hex, RGB, HSL and copy.", icon: "color-picker" },
  { id: "json-formatter", href: "/json-formatter", title: "JSON formatter", description: "Format, minify, validate.", icon: "json-formatter" },
  { id: "base64", href: "/base64", title: "Base64", description: "Encode or decode text.", icon: "base64" },
  { id: "uuid-generator", href: "/uuid-generator", title: "UUID generator", description: "Generate UUID v4.", icon: "uuid-generator" },
  { id: "regex-tester", href: "/regex-tester", title: "Regex tester", description: "Test regex and see matches.", icon: "regex-tester" },
  { id: "timestamp-converter", href: "/timestamp-converter", title: "Timestamp", description: "Unix and date conversion.", icon: "timestamp-converter" },
  { id: "hash", href: "/hash", title: "Hash", description: "SHA-256 and SHA-512.", icon: "hash" },
  { id: "markdown-preview", href: "/markdown-preview", title: "Markdown preview", description: "Render markdown live.", icon: "markdown-preview" },
  { id: "random-picker", href: "/random-picker", title: "Random picker", description: "Pick from list or roll dice.", icon: "random-picker" },
  { id: "jobs", href: "/jobs", title: "Jobs", description: "Status & downloads.", icon: "jobs" },
];
