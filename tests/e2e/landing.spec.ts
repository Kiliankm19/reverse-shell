import { test, expect } from "@playwright/test";

test("home page is the builder", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Reverse Shell Builder/i }),
  ).toBeVisible();
  await expect(page.getByText("Target profile", { exact: true })).toBeVisible();
});
