import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { usePollRecentJobs } from "./usePollRecentJobs";
import * as api from "@/lib/api";

vi.mock("@/lib/api", () => ({
  getRecentJobs: vi.fn(),
}));

describe("usePollRecentJobs", () => {
  const mockGetRecentJobs = vi.mocked(api.getRecentJobs);

  beforeEach(() => {
    vi.useFakeTimers();
    mockGetRecentJobs.mockResolvedValue([
      {
        id: "job-1",
        status: "completed",
        original_filename: "test.png",
        result_key: "r",
        result_url: "http://example.com/r",
        original_url: null,
        thumbnail_url: null,
        scale: 4,
        method: "real_esrgan",
        created_at: "",
        expires_at: "",
        started_at: null,
        finished_at: null,
        error_message: null,
        status_detail: null,
      },
    ]);
    Object.defineProperty(document, "visibilityState", {
      value: "visible",
      writable: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("calls getRecentJobs on mount and updates state", async () => {
    const setJobs = vi.fn();
    renderHook(() => usePollRecentJobs(setJobs));

    await waitFor(() => {
      expect(mockGetRecentJobs).toHaveBeenCalled();
    });
    expect(setJobs).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ id: "job-1", status: "completed" }),
      ])
    );
  });

  it("exposes refetch that calls getRecentJobs again", async () => {
    const setJobs = vi.fn();
    const { result } = renderHook(() => usePollRecentJobs(setJobs));

    await waitFor(() => {
      expect(mockGetRecentJobs).toHaveBeenCalled();
    });
    mockGetRecentJobs.mockClear();
    result.current.refetch();
    await waitFor(() => {
      expect(mockGetRecentJobs).toHaveBeenCalled();
    });
  });
});
