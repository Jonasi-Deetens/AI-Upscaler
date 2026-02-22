/**
 * Hub tools: each has an icon (React node), title, description, route, and category.
 */

export type HubToolCategory =
  | "image"
  | "conversion"
  | "calculators"
  | "health"
  | "seo"
  | "pdf"
  | "text"
  | "dev"
  | "fun"
  | "productivity"
  | "other";

export interface HubTool {
  id: string;
  href: string;
  title: string;
  description: string;
  icon: "upscale" | "remove-bg" | "convert" | "compress" | "restore" | "resize" | "rotate-flip" | "crop" | "strip-metadata" | "denoise" | "blur-sharpen" | "brightness-contrast" | "watermark" | "rename" | "auto-levels" | "saturation" | "color-balance" | "filters" | "border" | "collage" | "image-to-pdf" | "vignette" | "tilt-shift" | "pixelate" | "smart-crop" | "background-blur" | "inpaint" | "object-remove" | "deblur" | "document-enhance" | "ai-denoise" | "upscale-print" | "outpaint" | "background-replace" | "hdr-merge" | "tone-map" | "word-counter" | "password-generator" | "qr-code" | "pdf-merge-split" | "compress-pdf" | "pdf-to-images" | "pdf-metadata" | "pdf-rotate" | "pdf-reorder" | "pdf-unlock" | "pdf-protect" | "pdf-remove-pages" | "pdf-extract-images" | "heic-to-jpg" | "case-converter" | "remove-spaces" | "slug-generator" | "diff" | "find-replace" | "lorem-ipsum" | "color-picker" | "json-formatter" | "base64" | "uuid-generator" | "regex-tester" | "timestamp-converter" | "hash" | "markdown-preview" | "random-picker" | "yaml-json" | "csv-json" | "json-xml" | "html-encode" | "jwt-decoder" | "cron-explainer" | "number-base" | "ascii-unicode" | "url-parser" | "password-strength" | "otp-generator" | "unit-converter" | "currency-converter" | "timezone-converter" | "svg-to-png" | "favicon-generator" | "image-metadata" | "random-number" | "meme-text" | "yes-no" | "pomodoro" | "countdown" | "notepad" | "url-encode" | "duplicate-lines" | "stopwatch" | "base64-image" | "qr-decode" | "ocr" | "roman-numerals" | "fake-data-generator" | "color-contrast" | "tip-calculator" | "bmi" | "calorie-calculator" | "meta-tags" | "age-calculator" | "date-difference" | "escape-unescape" | "percentage-calculator" | "http-status" | "loan-calculator" | "mime-type" | "file-size" | "readability" | "jobs";
  category: HubToolCategory;
}

export const CATEGORY_ORDER: HubToolCategory[] = [
  "image",
  "conversion",
  "calculators",
  "health",
  "seo",
  "pdf",
  "text",
  "dev",
  "fun",
  "productivity",
  "other",
];

export const HUB_TOOLS: HubTool[] = [
  { id: "upscale", href: "/upscale", title: "Upscale", description: "2× or 4× with AI.", icon: "upscale", category: "image" },
  { id: "remove-bg", href: "/remove-bg", title: "Remove BG", description: "Transparent PNG.", icon: "remove-bg", category: "image" },
  { id: "convert", href: "/convert", title: "Convert", description: "WebP, PNG, JPEG.", icon: "convert", category: "image" },
  { id: "compress", href: "/compress", title: "Compress", description: "Smaller files, WebP or JPEG.", icon: "compress", category: "image" },
  { id: "restore", href: "/restore", title: "Restore & colorize", description: "Restore and colorize old photos.", icon: "restore", category: "image" },
  { id: "resize", href: "/resize", title: "Resize", description: "Max width/height, fit inside or exact.", icon: "resize", category: "image" },
  { id: "rotate-flip", href: "/rotate-flip", title: "Rotate & flip", description: "90° rotate, horizontal or vertical flip.", icon: "rotate-flip", category: "image" },
  { id: "crop", href: "/crop", title: "Crop", description: "Crop by x, y, width, height.", icon: "crop", category: "image" },
  { id: "strip-metadata", href: "/strip-metadata", title: "Strip metadata", description: "Remove EXIF and metadata.", icon: "strip-metadata", category: "image" },
  { id: "denoise", href: "/denoise", title: "Denoise", description: "Reduce image noise (AI-free).", icon: "denoise", category: "image" },
  { id: "blur-sharpen", href: "/blur-sharpen", title: "Blur / Sharpen", description: "Gaussian blur or unsharp mask.", icon: "blur-sharpen", category: "image" },
  { id: "brightness-contrast", href: "/brightness-contrast", title: "Brightness & contrast", description: "Adjust brightness and contrast.", icon: "brightness-contrast", category: "image" },
  { id: "watermark", href: "/watermark", title: "Watermark", description: "Add text overlay.", icon: "watermark", category: "image" },
  { id: "rename", href: "/rename", title: "Rename", description: "Add prefix to filenames.", icon: "rename", category: "image" },
  { id: "auto-levels", href: "/auto-levels", title: "Auto levels", description: "One-click histogram stretch or equalize.", icon: "auto-levels", category: "image" },
  { id: "saturation", href: "/saturation", title: "Saturation", description: "Adjust saturation and vibrance.", icon: "saturation", category: "image" },
  { id: "color-balance", href: "/color-balance", title: "Color balance", description: "R, G, B sliders.", icon: "color-balance", category: "image" },
  { id: "filters", href: "/filters", title: "Filters", description: "Grayscale, sepia, vintage presets.", icon: "filters", category: "image" },
  { id: "border", href: "/border", title: "Border", description: "Add padding or frame.", icon: "border", category: "image" },
  { id: "collage", href: "/collage", title: "Collage", description: "Grid layout from multiple images.", icon: "collage", category: "image" },
  { id: "image-to-pdf", href: "/image-to-pdf", title: "Image to PDF", description: "Combine images into one PDF.", icon: "image-to-pdf", category: "pdf" },
  { id: "vignette", href: "/vignette", title: "Vignette", description: "Darken corners with radial falloff.", icon: "vignette", category: "image" },
  { id: "tilt-shift", href: "/tilt-shift", title: "Tilt-shift", description: "Fake miniature with gradient blur.", icon: "tilt-shift", category: "image" },
  { id: "pixelate", href: "/pixelate", title: "Pixelate", description: "Mosaic effect or privacy blur.", icon: "pixelate", category: "image" },
  { id: "smart-crop", href: "/smart-crop", title: "Smart crop", description: "Crop to ratio keeping important region.", icon: "smart-crop", category: "image" },
  { id: "background-blur", href: "/background-blur", title: "Portrait blur", description: "Blur background, keep subject sharp.", icon: "background-blur", category: "image" },
  { id: "inpaint", href: "/inpaint", title: "Inpaint", description: "Content-aware fill from a mask.", icon: "inpaint", category: "image" },
  { id: "object-remove", href: "/object-remove", title: "Object remove", description: "AI object removal from mask (LaMa).", icon: "object-remove", category: "image" },
  { id: "deblur", href: "/deblur", title: "Fix blurry photos", description: "AI deblur for motion blur.", icon: "deblur", category: "image" },
  { id: "document-enhance", href: "/document-enhance", title: "Document scanner", description: "Deskew, denoise, binarize.", icon: "document-enhance", category: "image" },
  { id: "ai-denoise", href: "/ai-denoise", title: "AI denoise", description: "Low-light / high-ISO noise reduction.", icon: "ai-denoise", category: "image" },
  { id: "upscale-print", href: "/upscale-print", title: "Upscale for print", description: "Print-ready at A4/A3 and DPI.", icon: "upscale-print", category: "image" },
  { id: "outpaint", href: "/outpaint", title: "AI expand image", description: "Outpainting: extend borders.", icon: "outpaint", category: "image" },
  { id: "background-replace", href: "/background-replace", title: "Replace background", description: "Subject onto new background.", icon: "background-replace", category: "image" },
  { id: "hdr-merge", href: "/hdr-merge", title: "HDR merge", description: "Combine bracketed exposures.", icon: "hdr-merge", category: "image" },
  { id: "tone-map", href: "/tone-map", title: "Tone mapping", description: "Balance exposure (Reinhard).", icon: "tone-map", category: "image" },
  { id: "word-counter", href: "/word-counter", title: "Word counter", description: "Words, characters, reading time.", icon: "word-counter", category: "text" },
  { id: "password-generator", href: "/password-generator", title: "Password generator", description: "Strong random passwords.", icon: "password-generator", category: "dev" },
  { id: "fake-data-generator", href: "/fake-data", title: "Fake data generator", description: "Generate fake names, emails, addresses for testing.", icon: "fake-data-generator", category: "dev" },
  { id: "color-contrast", href: "/color-contrast", title: "Color contrast", description: "WCAG contrast ratio and pass/fail for two colors.", icon: "color-contrast", category: "dev" },
  { id: "qr-code", href: "/qr-code", title: "QR code", description: "Generate QR from text or URL.", icon: "qr-code", category: "image" },
  { id: "pdf-merge-split", href: "/pdf-merge-split", title: "PDF merge/split", description: "Merge PDFs or split by pages.", icon: "pdf-merge-split", category: "pdf" },
  { id: "lorem-ipsum", href: "/lorem-ipsum", title: "Lorem ipsum", description: "Placeholder text generator.", icon: "lorem-ipsum", category: "text" },
  { id: "color-picker", href: "/color-picker", title: "Color picker", description: "Hex, RGB, HSL and copy.", icon: "color-picker", category: "fun" },
  { id: "json-formatter", href: "/json-formatter", title: "JSON formatter", description: "Format, minify, validate.", icon: "json-formatter", category: "text" },
  { id: "base64", href: "/base64", title: "Base64", description: "Encode or decode text.", icon: "base64", category: "text" },
  { id: "uuid-generator", href: "/uuid-generator", title: "UUID generator", description: "Generate UUID v4.", icon: "uuid-generator", category: "dev" },
  { id: "regex-tester", href: "/regex-tester", title: "Regex tester", description: "Test regex and see matches.", icon: "regex-tester", category: "dev" },
  { id: "timestamp-converter", href: "/timestamp-converter", title: "Timestamp", description: "Unix and date conversion.", icon: "timestamp-converter", category: "conversion" },
  { id: "hash", href: "/hash", title: "Hash", description: "SHA-256 and SHA-512.", icon: "hash", category: "dev" },
  { id: "markdown-preview", href: "/markdown-preview", title: "Markdown preview", description: "Render markdown live.", icon: "markdown-preview", category: "text" },
  { id: "random-picker", href: "/random-picker", title: "Random picker", description: "Pick from list or roll dice.", icon: "random-picker", category: "fun" },
  { id: "compress-pdf", href: "/compress-pdf", title: "Compress PDF", description: "Reduce PDF file size.", icon: "compress-pdf", category: "pdf" },
  { id: "pdf-to-images", href: "/pdf-to-images", title: "PDF to images", description: "Extract each page as PNG or JPEG.", icon: "pdf-to-images", category: "pdf" },
  { id: "pdf-metadata", href: "/pdf-metadata", title: "PDF metadata", description: "View or strip PDF metadata.", icon: "pdf-metadata", category: "pdf" },
  { id: "pdf-rotate", href: "/pdf-rotate", title: "PDF rotate", description: "Rotate selected pages 90°.", icon: "pdf-rotate", category: "pdf" },
  { id: "pdf-reorder", href: "/pdf-reorder", title: "PDF reorder", description: "Reorder pages by drag-and-drop.", icon: "pdf-reorder", category: "pdf" },
  { id: "pdf-unlock", href: "/pdf-unlock", title: "PDF unlock", description: "Remove password from PDFs.", icon: "pdf-unlock", category: "pdf" },
  { id: "pdf-protect", href: "/pdf-protect", title: "PDF protect", description: "Add password protection to PDFs.", icon: "pdf-protect", category: "pdf" },
  { id: "pdf-remove-pages", href: "/pdf-remove-pages", title: "PDF remove pages", description: "Delete selected pages from a PDF.", icon: "pdf-remove-pages", category: "pdf" },
  { id: "pdf-extract-images", href: "/pdf-extract-images", title: "PDF extract images", description: "Extract embedded images from PDFs into a ZIP.", icon: "pdf-extract-images", category: "pdf" },
  { id: "heic-to-jpg", href: "/heic-to-jpg", title: "HEIC to JPG", description: "Convert HEIC/HEIF to JPEG.", icon: "heic-to-jpg", category: "conversion" },
  { id: "case-converter", href: "/case-converter", title: "Case converter", description: "UPPER, lower, Title, camelCase, kebab, snake.", icon: "case-converter", category: "text" },
  { id: "remove-spaces", href: "/remove-spaces", title: "Remove spaces", description: "Trim and collapse spaces and newlines.", icon: "remove-spaces", category: "text" },
  { id: "slug-generator", href: "/slug-generator", title: "Slug generator", description: "Turn text into URL-friendly slugs.", icon: "slug-generator", category: "seo" },
  { id: "diff", href: "/diff", title: "Diff", description: "Compare two texts side-by-side.", icon: "diff", category: "text" },
  { id: "find-replace", href: "/find-replace", title: "Find & replace", description: "Find and replace in text.", icon: "find-replace", category: "text" },
  { id: "yaml-json", href: "/yaml-json", title: "YAML ↔ JSON", description: "Convert YAML to JSON or JSON to YAML.", icon: "yaml-json", category: "text" },
  { id: "csv-json", href: "/csv-json", title: "CSV ↔ JSON", description: "Convert CSV to JSON or JSON to CSV.", icon: "csv-json", category: "text" },
  { id: "json-xml", href: "/json-xml", title: "JSON ↔ XML", description: "Convert JSON to XML or XML to JSON.", icon: "json-xml", category: "text" },
  { id: "html-encode", href: "/html-encode", title: "HTML encode/decode", description: "Encode or decode HTML entities.", icon: "html-encode", category: "text" },
  { id: "jwt-decoder", href: "/jwt-decoder", title: "JWT decoder", description: "Decode JWT header and payload (read-only).", icon: "jwt-decoder", category: "dev" },
  { id: "cron-explainer", href: "/cron-explainer", title: "Cron explainer", description: "What does this cron expression do?", icon: "cron-explainer", category: "dev" },
  { id: "number-base", href: "/number-base", title: "Number base", description: "Convert between dec, hex, bin, oct.", icon: "number-base", category: "conversion" },
  { id: "ascii-unicode", href: "/ascii-unicode", title: "ASCII / Unicode", description: "Character ↔ code point lookup.", icon: "ascii-unicode", category: "text" },
  { id: "url-parser", href: "/url-parser", title: "URL parser", description: "Split URL into scheme, host, path, query.", icon: "url-parser", category: "text" },
  { id: "password-strength", href: "/password-strength", title: "Password strength", description: "Score and short feedback.", icon: "password-strength", category: "dev" },
  { id: "otp-generator", href: "/otp-generator", title: "OTP / 2FA", description: "Time-based 6-digit code (TOTP).", icon: "otp-generator", category: "dev" },
  { id: "unit-converter", href: "/unit-converter", title: "Unit converter", description: "Length, weight, temperature.", icon: "unit-converter", category: "conversion" },
  { id: "currency-converter", href: "/currency-converter", title: "Currency", description: "Convert with live exchange rates (API).", icon: "currency-converter", category: "conversion" },
  { id: "timezone-converter", href: "/timezone-converter", title: "Timezone converter", description: "Convert time between timezones.", icon: "timezone-converter", category: "conversion" },
  { id: "file-size", href: "/file-size", title: "File size converter", description: "Bytes, KB, MB, GB, TB (1024-based).", icon: "file-size", category: "conversion" },
  { id: "tip-calculator", href: "/tip-calculator", title: "Tip calculator", description: "Bill, tip %, split — tip and total.", icon: "tip-calculator", category: "calculators" },
  { id: "bmi", href: "/bmi", title: "BMI calculator", description: "Height and weight → BMI and category.", icon: "bmi", category: "health" },
  { id: "calorie-calculator", href: "/calorie-calculator", title: "Calorie calculator", description: "BMR and daily calories to maintain.", icon: "calorie-calculator", category: "health" },
  { id: "meta-tags", href: "/meta-tags", title: "Meta tag / OG generator", description: "Meta, Open Graph, Twitter Card HTML.", icon: "meta-tags", category: "seo" },
  { id: "age-calculator", href: "/age-calculator", title: "Age calculator", description: "Birth date → age in years, months, days.", icon: "age-calculator", category: "calculators" },
  { id: "date-difference", href: "/date-difference", title: "Date difference", description: "Two dates → years, months, days, total days.", icon: "date-difference", category: "calculators" },
  { id: "percentage-calculator", href: "/percentage-calculator", title: "Percentage calculator", description: "X% of Y, X is what % of Y, increase/decrease.", icon: "percentage-calculator", category: "calculators" },
  { id: "loan-calculator", href: "/loan-calculator", title: "Loan / EMI calculator", description: "Principal, rate, term → monthly payment.", icon: "loan-calculator", category: "calculators" },
  { id: "escape-unescape", href: "/escape-unescape", title: "Escape / unescape", description: "JavaScript or HTML escape/unescape.", icon: "escape-unescape", category: "dev" },
  { id: "http-status", href: "/http-status", title: "HTTP status lookup", description: "Code or name → meaning and description.", icon: "http-status", category: "dev" },
  { id: "mime-type", href: "/mime-type", title: "MIME type lookup", description: "Extension or filename → MIME type.", icon: "mime-type", category: "dev" },
  { id: "readability", href: "/readability", title: "Readability", description: "Flesch Reading Ease score for pasted text.", icon: "readability", category: "text" },
  { id: "svg-to-png", href: "/svg-to-png", title: "SVG to PNG", description: "Convert SVG to PNG.", icon: "svg-to-png", category: "image" },
  { id: "favicon-generator", href: "/favicon-generator", title: "Favicon generator", description: "Upload image → favicon.ico sizes.", icon: "favicon-generator", category: "image" },
  { id: "image-metadata", href: "/image-metadata", title: "Image metadata", description: "EXIF, dimensions, format (read-only).", icon: "image-metadata", category: "image" },
  { id: "random-number", href: "/random-number", title: "Random number", description: "Min/max, integer or float.", icon: "random-number", category: "fun" },
  { id: "roman-numerals", href: "/roman-numerals", title: "Roman numerals", description: "Convert number ↔ Roman (e.g. 2024 ↔ MMXXIV).", icon: "roman-numerals", category: "fun" },
  { id: "meme-text", href: "/meme-text", title: "Meme text", description: "Mocking SpongeBob alternating case.", icon: "meme-text", category: "fun" },
  { id: "yes-no", href: "/yes-no", title: "Yes / No 8-ball", description: "One button, random answer.", icon: "yes-no", category: "fun" },
  { id: "pomodoro", href: "/pomodoro", title: "Pomodoro", description: "25 min work, 5 min break.", icon: "pomodoro", category: "productivity" },
  { id: "countdown", href: "/countdown", title: "Countdown", description: "Set minutes, count down.", icon: "countdown", category: "productivity" },
  { id: "notepad", href: "/notepad", title: "Notepad", description: "One persistent note (localStorage).", icon: "notepad", category: "productivity" },
  { id: "url-encode", href: "/url-encode", title: "URL encode/decode", description: "Percent-encode or decode query strings.", icon: "url-encode", category: "text" },
  { id: "duplicate-lines", href: "/duplicate-lines", title: "Duplicate line remover", description: "Remove duplicates, optional sort.", icon: "duplicate-lines", category: "productivity" },
  { id: "stopwatch", href: "/stopwatch", title: "Stopwatch", description: "Count up with laps.", icon: "stopwatch", category: "productivity" },
  { id: "base64-image", href: "/base64-image", title: "Base64 image decoder", description: "Paste data URL → preview and download.", icon: "base64-image", category: "image" },
  { id: "qr-decode", href: "/qr-decode", title: "QR code decoder", description: "Upload or paste image → decode QR.", icon: "qr-decode", category: "image" },
  { id: "ocr", href: "/ocr", title: "OCR", description: "Image or PDF → extracted text.", icon: "ocr", category: "image" },
  { id: "jobs", href: "/jobs", title: "Jobs", description: "Status & downloads.", icon: "jobs", category: "other" },
];
