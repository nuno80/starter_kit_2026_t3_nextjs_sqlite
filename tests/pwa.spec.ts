import { test, expect } from "@playwright/test";

/**
 * PWA smoke tests.
 *
 * Important caveat: the service worker is disabled in development (see the `disable` option in
 * next.config.js) to avoid caching issues while iterating. Our webServer runs `pnpm dev` (see
 * playwright.config.ts), so `/sw.js` will 404 there - the service-worker test below detects this
 * and skips itself with an explanatory annotation rather than failing. To actually exercise the
 * service worker, run against a production build instead:
 *
 *   pnpm build && pnpm start
 *   pnpm exec playwright test tests/pwa.spec.ts
 */

test.describe("PWA", () => {
  test("manifest.webmanifest is served and has the required fields", async ({
    request,
  }) => {
    const res = await request.get("/manifest.webmanifest");
    expect(res.ok()).toBeTruthy();

    const contentType = res.headers()["content-type"] ?? "";
    expect(contentType).toContain("manifest");

    const manifest = await res.json();

    expect(typeof manifest.name).toBe("string");
    expect(manifest.name.length).toBeGreaterThan(0);
    expect(typeof manifest.short_name).toBe("string");
    expect(manifest.start_url).toBe("/");
    expect(manifest.display).toBe("standalone");

    expect(Array.isArray(manifest.icons)).toBe(true);
    expect(manifest.icons.length).toBeGreaterThan(0);
    for (const icon of manifest.icons) {
      expect(icon.src).toEqual(expect.any(String));
      expect(icon.sizes).toEqual(expect.any(String));
      expect(icon.type).toEqual(expect.any(String));
    }

    // At least one maskable icon (Android adaptive icons) is expected among the set.
    const hasMaskable = manifest.icons.some(
      (icon: { purpose?: string }) => icon.purpose === "maskable",
    );
    expect(hasMaskable).toBe(true);
  });

  test("offline fallback page renders its own content directly", async ({
    page,
  }) => {
    // We navigate to it directly rather than actually going offline + triggering the SW
    // fallback, since the SW is disabled in dev (see file header). This still verifies the
    // fallback page itself is a working route with the right copy.
    await page.goto("/~offline");
    await expect(
      page.getByRole("heading", { name: "Sei offline" }),
    ).toBeVisible();
    await expect(
      page.getByText("Controlla la tua connessione a internet e riprova."),
    ).toBeVisible();
  });

  test("service worker is registered and reachable (production builds only)", async ({
    page,
    request,
  }) => {
    const swResponse = await request.get("/sw.js");

    test.skip(
      !swResponse.ok(),
      "Service worker is disabled in dev (next.config.js `disable` option) - run " +
        "`pnpm build && pnpm start` to exercise this check.",
    );

    const body = await swResponse.text();
    expect(body.length).toBeGreaterThan(0);

    await page.goto("/");
    const hasRegistration = await page.evaluate(async () => {
      if (!("serviceWorker" in navigator)) return false;
      const registration = await navigator.serviceWorker.getRegistration();
      return !!registration;
    });
    expect(hasRegistration).toBe(true);
  });
});
