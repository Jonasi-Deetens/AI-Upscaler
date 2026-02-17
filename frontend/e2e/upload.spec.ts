import { test, expect } from "@playwright/test";

test.describe("Upload flow", () => {
  test("upload page has form and links to home", async ({ page }) => {
    await page.goto("/upload");
    await expect(page.getByRole("heading", { name: /upload images/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /back/i })).toHaveAttribute("href", "/");
  });

  test("submit with file redirects to jobs with ids in URL", async ({ page }) => {
    await page.goto("/upload");
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: "test.png",
      mimeType: "image/png",
      buffer: Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
        "base64"
      ),
    });
    await page.getByRole("button", { name: /upload and process/i }).click();
    await expect(page).toHaveURL(/\/jobs\?ids=/);
  });
});
