/**
 * Turn upload/API errors into a user-facing message and optional request ID.
 * Backend 500 responses include "error" and "detail"; we show "error" when present.
 */
export function uploadErrorMessage(err: unknown): { text: string; requestId: string | null } {
  if (err instanceof Error) {
    const msg = err.message;
    try {
      const parsed = JSON.parse(msg) as {
        detail?: string | Array<{ msg?: string }>;
        error?: string;
        request_id?: string;
      };
      // Prefer backend's "error" (real exception message) for 500s
      if (typeof parsed.error === "string" && parsed.error.trim()) {
        return { text: parsed.error, requestId: parsed.request_id ?? null };
      }
      const text =
        typeof parsed.detail === "string"
          ? parsed.detail
          : Array.isArray(parsed.detail)
            ? parsed.detail.map((d) => d?.msg ?? String(d)).join(". ")
            : msg;
      return { text, requestId: parsed.request_id ?? null };
    } catch {
      return { text: msg || "Upload failed. Please try again.", requestId: null };
    }
  }
  return { text: "Upload failed. Please try again.", requestId: null };
}
