import { test, expect } from "@playwright/test";
import path from "node:path";

test("preset search filters built-in collections", async ({ page }) => {
  await page.goto("/collections");
  await expect(
    page.getByRole("heading", { name: /Ready-to-use reverse shells/i }),
  ).toBeVisible();
  await page
    .getByPlaceholder(/Search by name, platform, technique/i)
    .fill("bind");
  await expect(page.getByText(/bind shell/i).first()).toBeVisible();
});

test("load preset navigates to builder with template", async ({ page }) => {
  await page.goto("/collections");
  const loadButton = page.getByRole("button", { name: /^Load$/i }).first();
  await loadButton.click();
  await page.waitForURL((url) => new URL(url).pathname === "/builder");
  await expect(
    page.getByRole("heading", { name: /Reverse Shell Builder/i }),
  ).toBeVisible();
});

test("rename saved collection", async ({ page }) => {
  await page.goto("/builder");
  await page
    .getByRole("button", { name: /Copy Command/i })
    .first()
    .click();
  await page.getByRole("button", { name: /Save workflow/i }).click();
  await page.getByLabel(/Collection name/i).fill("E2E rename me");
  await page.getByRole("button", { name: /Save copy/i }).click();
  await expect(
    page.locator("[data-sonner-toast]").getByText(/saved/i),
  ).toBeVisible();

  await page.goto("/collections");
  await page
    .getByRole("button", { name: /^Rename$/i })
    .first()
    .click();
  await page.getByTestId("collection-rename-input").fill("Renamed in e2e");
  await page.getByRole("button", { name: /Save name/i }).click();
  await expect(
    page.locator("[data-sonner-toast]").getByText(/renamed/i),
  ).toBeVisible();
  await expect(page.getByText("Renamed in e2e")).toBeVisible();
});

test("import JSON with duplicate IDs shows duplicate toast", async ({
  page,
}) => {
  const fixturePath = path.join(
    process.cwd(),
    "tests/fixtures/collections-duplicate.json",
  );
  await page.goto("/collections");
  await page.getByRole("button", { name: /Import JSON/i }).click();
  await page.locator('input[type="file"]').setInputFiles(fixturePath);
  await page.getByRole("button", { name: /Confirm import/i }).click();
  await expect(
    page.locator("[data-sonner-toast]").getByText(/Imported 1 collections/i),
  ).toBeVisible();

  await page.getByRole("button", { name: /Import JSON/i }).click();
  await page.locator('input[type="file"]').setInputFiles(fixturePath);
  await page.getByRole("button", { name: /Confirm import/i }).click();
  await expect(
    page.locator("[data-sonner-toast]").getByText(/duplicate IDs reassigned/i),
  ).toBeVisible();
});
