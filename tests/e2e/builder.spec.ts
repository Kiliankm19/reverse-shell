import { test, expect } from "@playwright/test";

test("builder loads with payload controls", async ({ page }) => {
  await page.goto("/en/builder");
  await expect(
    page.getByRole("heading", { name: /Reverse Shell Builder/i }),
  ).toBeVisible();
  await expect(page.getByText("LHOST")).toBeVisible();
});
