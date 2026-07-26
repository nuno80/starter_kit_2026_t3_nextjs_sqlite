import { test, expect } from "@playwright/test";

test.describe("Landing Page and Demo App Bridge Seams", () => {
  test("clicking 'Apri la Demo App' transitions to /posts and renders SQLite workspace", async ({ page }) => {
    await page.goto("/");
    await page.locator("section#quickstart").getByRole("link", { name: /Apri la Demo App/i }).click();
    await expect(page).toHaveURL(/\/posts$/);
    await expect(page.getByRole("heading", { name: /interactive crud workspace/i })).toBeVisible();
  });

  test("clicking language globe selector toggles copy between IT and EN without page reload", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /dalla clonazione alla produzione/i })).toBeVisible();

    const langBtn = page.getByRole("button", { name: /toggle language/i });
    await langBtn.click();
    await page.getByRole("button", { name: "English" }).click();

    await expect(page.getByRole("heading", { name: /from cloning to production/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /dalla clonazione alla produzione/i })).not.toBeVisible();
  });

  test("clicking 'Accedi' in navbar opens Better-Auth login overlay without navigating away", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("nav-login-btn").click();

    await expect(page.getByTestId("auth-overlay")).toBeVisible();
    await expect(page.getByRole("heading", { name: /crea un account|bentornato/i })).toBeVisible();
    await expect(page).toHaveURL("http://localhost:3000/");
  });
});
