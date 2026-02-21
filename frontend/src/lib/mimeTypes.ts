export const MIME_BY_EXTENSION: Record<string, string> = {
  pdf: "application/pdf",
  zip: "application/zip",
  json: "application/json",
  xml: "application/xml",
  html: "text/html",
  htm: "text/html",
  css: "text/css",
  js: "application/javascript",
  mjs: "application/javascript",
  txt: "text/plain",
  svg: "image/svg+xml",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  ico: "image/x-icon",
  mp4: "video/mp4",
  webm: "video/webm",
  mp3: "audio/mpeg",
  wav: "audio/wav",
  ogg: "audio/ogg",
  woff: "font/woff",
  woff2: "font/woff2",
  ttf: "font/ttf",
  otf: "font/otf",
  csv: "text/csv",
  yaml: "text/yaml",
  yml: "text/yaml",
  md: "text/markdown",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  rtf: "application/rtf",
  wasm: "application/wasm",
};

export function getMimeType(input: string): string | null {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) return null;
  let ext = trimmed;
  if (ext.startsWith(".")) ext = ext.slice(1);
  else if (ext.includes(".")) ext = ext.split(".").pop() ?? "";
  return MIME_BY_EXTENSION[ext] ?? null;
}
