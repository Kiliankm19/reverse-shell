import { test, expect } from "@playwright/test";

test("builder loads with payload controls", async ({ page }) => {
  await page.goto("/builder");
  await expect(
    page.getByRole("heading", { name: /Reverse Shell Builder/i }),
  ).toBeVisible();
  await expect(page.getByText("Target profile", { exact: true })).toBeVisible();
  await expect(page.getByLabel(/^Port$/i)).toBeVisible();
});

test("obfuscation dropdown renders IFS label without i18n errors", async ({
  page,
}) => {
  await page.goto("/builder");
  await page.getByRole("button", { name: /2 Technique/i }).click();
  await page
    .locator("summary")
    .filter({ hasText: /Obfuscation/i })
    .click();
  await page
    .getByRole("combobox")
    .filter({ hasText: /None|Plain command/i })
    .click();
  await expect(
    page.getByRole("option", { name: /Bash .*IFS.*Replace spaces/i }),
  ).toBeVisible();
});
