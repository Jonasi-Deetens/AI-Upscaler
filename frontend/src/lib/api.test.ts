import { describe, it, expect, beforeEach } from "vitest";
import {
  getApiBase,
  parseApiError,
  normalizeJob,
} from "./api";

describe("parseApiError", () => {
  it("returns string detail", () => {
    expect(parseApiError({ detail: "Too many files" }, "Fallback")).toBe(
      "Too many files"
    );
  });

  it("returns joined array of msg", () => {
    expect(
      parseApiError(
        { detail: [{ msg: "Error 1" }, { msg: "Error 2" }] },
        "Fallback"
      )
    ).toBe("Error 1. Error 2");
  });

  it("returns fallback when detail is missing", () => {
    expect(parseApiError({}, "Fallback")).toBe("Fallback");
  });

  it("returns fallback when detail is empty array", () => {
    expect(parseApiError({ detail: [] }, "Fallback")).toBe("Fallback");
  });
});

describe("getApiBase", () => {
  const orig = process.env.NEXT_PUBLIC_API_URL;

  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_API_URL;
  });

  it("returns empty string when NEXT_PUBLIC_API_URL is not set", () => {
    expect(getApiBase()).toBe("");
  });

  it("returns URL without trailing slash when set", () => {
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:8000/";
    expect(getApiBase()).toBe("http://localhost:8000");
  });

  beforeEach(() => {
    if (orig !== undefined) process.env.NEXT_PUBLIC_API_URL = orig;
  });
});

describe("normalizeJob", () => {
  it("normalizes full job object", () => {
    const raw = {
      id: "abc-123",
      status: "completed",
      original_filename: "test.png",
      result_key: "results/abc",
      result_url: "http://api/jobs/abc/download",
      original_url: "http://api/jobs/abc/original",
      thumbnail_url: "http://api/jobs/abc/thumbnail",
      scale: 4,
      method: "real_esrgan",
      created_at: "2025-01-01T00:00:00",
      expires_at: "2025-01-01T01:00:00",
      started_at: "2025-01-01T00:01:00",
      finished_at: "2025-01-01T00:05:00",
      error_message: null,
      status_detail: null,
    };
    const job = normalizeJob(raw);
    expect(job.id).toBe("abc-123");
    expect(job.status).toBe("completed");
    expect(job.original_filename).toBe("test.png");
    expect(job.result_key).toBe("results/abc");
    expect(job.result_url).toBe("http://api/jobs/abc/download");
    expect(job.scale).toBe(4);
    expect(job.method).toBe("real_esrgan");
    expect(job.started_at).toBe("2025-01-01T00:01:00");
    expect(job.error_message).toBe(null);
  });

  it("handles minimal object with defaults", () => {
    const job = normalizeJob({});
    expect(job.id).toBe("");
    expect(job.status).toBe("");
    expect(job.original_filename).toBe("");
    expect(job.result_key).toBe(null);
    expect(job.result_url).toBe(null);
    expect(job.scale).toBe(4);
    expect(job.method).toBe("real_esrgan");
    expect(job.created_at).toBe("");
    expect(job.expires_at).toBe("");
    expect(job.started_at).toBe(null);
    expect(job.finished_at).toBe(null);
    expect(job.error_message).toBe(null);
    expect(job.status_detail).toBe(null);
  });
});
