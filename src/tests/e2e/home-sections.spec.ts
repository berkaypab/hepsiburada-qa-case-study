// spec: specs/home-sections.md
// seed: src/seed.spec.ts

import { test, expect } from "./fixtures/pages-fixture";

test.describe("Verifying Homepage Sections", () => {
	test("Verify main sections and products", async ({ page }) => {
		// 1. Navigate to the homepage (https://www.hepsiburada.com/)
		// (This step is automatically handled by the homePage fixture mounting the baseURL)

		// 2. Verify that the homepage search box is visible
		await expect(page.getByPlaceholder(/Ürün, kategori veya marka ara/i).first()).toBeVisible({ timeout: 15000 });

		// 3. Verify that the product showcase/recommendation sections are visible
		// Hepsiburada homepage always contains "Süper Fiyat" or "Günün Fırsatları" or general product headers
		const showcaseHeader = page.getByText(/Günün Fırsatları|Süper Fiyat|Sana Özel/i).first();
		await expect(showcaseHeader).toBeVisible({ timeout: 15000 });

		// 4. Verify that at least one product card is loaded and visible within the sections
		// Look for the generic link inside a product list or just any product image
		const productCardLink = page.locator('a[href*="-p-HBCV"]').first();
		await expect(productCardLink).toBeVisible({ timeout: 15000 });
	});
});
