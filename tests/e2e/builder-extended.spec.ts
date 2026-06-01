import { test, expect } from "@playwright/test";

test("recommended listener card is visible", async ({ page }) => {
  await page.goto("/builder");
  await expect(page.getByText(/Listener command/i)).toBeVisible();
  await expect(page.getByText(/rlwrap|netcat|Netcat/i).first()).toBeVisible();
});

test("payload picker dialog opens", async ({ page }) => {
  await page.goto("/builder");
  await page.getByRole("button", { name: /2 Technique/i }).click();
  await page.getByRole("combobox", { name: "Technique" }).click();
  await expect(
    page.getByRole("heading", { name: /Choose technique/i }),
  ).toBeVisible();
});

test("share URL restores LPORT", async ({ page }) => {
  await page.goto(
    "/builder?template=python3-socket&lhost=10.0.0.1&lport=9001&shell=%2Fbin%2Fbash&obfuscation=none",
  );
  await expect(
    page.getByRole("heading", { name: /Reverse Shell Builder/i }),
  ).toBeVisible();
  await expect(page.getByLabel(/^Port$/i)).toHaveValue("9001");
});

test("copy command shows toast", async ({ page }) => {
  await page.goto("/builder");
  await page
    .getByRole("button", { name: /Copy Command/i })
    .first()
    .click();
  await expect(
    page.locator("[data-sonner-toast]").getByText(/Copied to clipboard/i),
  ).toBeVisible();
});
