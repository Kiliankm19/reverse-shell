import { test, expect } from "@playwright/test";

test("marketing landing links to builder", async ({ page }) => {
  await page.goto("/reverseshell");
  await expect(
    page.getByRole("heading", { name: /reverseshell/i }),
  ).toBeVisible();
  await Promise.all([
    page.waitForURL((url) => new URL(url).pathname === "/"),
    page.getByRole("link", { name: /Launch Builder/i }).click(),
  ]);
  await expect(
    page.getByRole("heading", { name: /Reverse Shell Builder/i }),
  ).toBeVisible();
});
