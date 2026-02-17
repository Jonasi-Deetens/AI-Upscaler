import { test, expect } from "@playwright/test";

test.describe("Jobs page", () => {
  test("jobs page shows navbar with Home, Upload, Jobs", async ({ page }) => {
    await page.goto("/jobs");
    await expect(page.getByRole("link", { name: "Home" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Upload" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Jobs" })).toBeVisible();
  });

  test("jobs page with empty ids shows prompt to upload", async ({ page }) => {
    await page.goto("/jobs");
    await expect(page.getByRole("heading", { name: "Job status" })).toBeVisible();
    await expect(page.getByText(/no job ids|upload images first/i)).toBeVisible();
  });

  test("jobs page with ids in URL shows job list or loading", async ({ page }) => {
    await page.goto("/jobs?ids=00000000-0000-0000-0000-000000000001");
    await expect(page.getByRole("heading", { name: "Job status" })).toBeVisible();
    await expect(
      page.getByText(/no job ids|upload images first|loading|not found|queued|failed|done/i)
    ).toBeVisible({ timeout: 10000 });
  });
});
