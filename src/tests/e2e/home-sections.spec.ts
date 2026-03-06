// spec: specs/home-sections.md
// seed: src/seed.spec.ts

import { test, expect } from "./fixtures/pages-fixture";

test.describe("Hepsiburada — Scenario 3: Homepage Sections", () => {
    test("Should verify main sections and products", async ({ page, homePage }) => {
        // 1. Navigation is now manual because the fixture is lazy
        await page.goto("/", { waitUntil: "domcontentloaded" });

        // 2. Verify that the homepage search box is visible via the Header component
        await expect(homePage.header.searchBox).toBeVisible({ timeout: 15000 });

        // 3. Verify that the product showcase/recommendation sections are visible via POM
        await expect(homePage.showcaseHeader).toBeVisible({ timeout: 15000 });

        // 4. Verify that at least one product card is loaded and visible within the sections via POM
        await expect(homePage.genericProductCard).toBeVisible({ timeout: 15000 });
    });
});
