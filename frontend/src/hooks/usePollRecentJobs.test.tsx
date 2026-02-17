import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { usePollRecentJobs } from "./usePollRecentJobs";
import * as api from "@/lib/api";

vi.mock("@/lib/api", () => ({
  getRecentJobs: vi.fn(),
}));

const mockJob = {
  id: "job-1",
  status: "completed" as const,
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
};

describe("usePollRecentJobs", () => {
  const mockGetRecentJobs = vi.mocked(api.getRecentJobs);

  beforeEach(() => {
    mockGetRecentJobs.mockResolvedValue([mockJob]);
    Object.defineProperty(document, "visibilityState", {
      value: "visible",
      writable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("calls getRecentJobs on mount and updates state", async () => {
    const setJobs = vi.fn();
    renderHook(() => usePollRecentJobs(setJobs));

    await waitFor(
      () => {
        expect(mockGetRecentJobs).toHaveBeenCalled();
      },
      { timeout: 3000 }
    );
    expect(setJobs).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ id: "job-1", status: "completed" }),
      ])
    );
  });

  it("exposes refetch that calls getRecentJobs again", async () => {
    const setJobs = vi.fn();
    const { result } = renderHook(() => usePollRecentJobs(setJobs));

    await waitFor(
      () => {
        expect(mockGetRecentJobs).toHaveBeenCalled();
      },
      { timeout: 3000 }
    );
    mockGetRecentJobs.mockClear();
    result.current.refetch();
    await waitFor(
      () => {
        expect(mockGetRecentJobs).toHaveBeenCalled();
      },
      { timeout: 3000 }
    );
  });
});
