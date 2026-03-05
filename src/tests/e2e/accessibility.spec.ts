import { test, expect } from "./fixtures/pages-fixture";
import AxeBuilder from "@axe-core/playwright";
import { TAGS } from "@utils/configuration";

test.describe(
	"Accessibility (a11y) Scenarios",
	{
		annotation: {
			type: "feature",
			description: "Automated accessibility scans using axe-core to ensure WCAG compliance on key pages",
		},
	},
	() => {
		test(
			"Key pages should not have any automatically detectable accessibility violations",
			{
				tag: [TAGS.REGRESSION, TAGS.CUSTOMER],
			},
			async ({ page, productSetup }) => {
				// 1. Homepage Accessibility Scan
				await test.step("Scan Homepage for Accessibility", async () => {
					// Explicitly navigate to the homepage since the homePage fixture was removed to satisfy linter
					await page.goto("/", { waitUntil: "domcontentloaded" });

					const results = await new AxeBuilder({ page }).analyze();

					await test.info().attach("homepage-accessibility-results", {
						body: JSON.stringify(results.violations, null, 2),
						contentType: "application/json",
					});

					// Use soft assertions so that the test continues to scan the other pages even if homepage fails
					expect.soft(results.violations).toEqual([]);
				});

				// 2. Search and Product Detail Page (PDP) Scan
				const { pdp } = await productSetup("iphone");

				await test.step("Scan Product Detail Page Accessibility", async () => {
					// Give product page some time to stabilize
					await pdp.page.waitForLoadState("domcontentloaded");

					const pdpResults = await new AxeBuilder({ page: pdp.page }).analyze();

					await test.info().attach("pdp-accessibility-results", {
						body: JSON.stringify(pdpResults.violations, null, 2),
						contentType: "application/json",
					});

					expect.soft(pdpResults.violations).toEqual([]);
				});

				// 3. Cart Page Scan
				await test.step("Scan Cart Page Accessibility", async () => {
					// Add product to cart and explicitly navigate to the cart page
					await pdp.addToCart();
					await pdp.page.goto("/sepet", { waitUntil: "domcontentloaded" });

					const cartResults = await new AxeBuilder({ page: pdp.page }).analyze();

					await test.info().attach("cart-accessibility-results", {
						body: JSON.stringify(cartResults.violations, null, 2),
						contentType: "application/json",
					});

					expect.soft(cartResults.violations).toEqual([]);
				});
			},
		);
	},
);
