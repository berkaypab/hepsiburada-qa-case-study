import { test, expect } from "./fixtures/pages-fixture";
import { TAGS } from "@utils/configuration";
import { CartPage } from "pages/e2e";

/**
 * @fileoverview Accessibility (a11y) Scenarios
 * Standardized WCAG 2.1/2.2 compliance scans using axe-core.
 *
 * @note Automated scans typically detect ~57% of digital accessibility issues.
 * Manual verification with screen readers and keyboard-only navigation is still required.
 */
test.describe.skip("Hepsiburada — Scenario 5: Accessibility Compliance", () => {
	test.describe.configure({ mode: "parallel" });

	test(
		"Should verify homepage is WCAG compliant",
		{ tag: [TAGS.REGRESSION, "@slow"] },
		async ({ page, homePage, makeAxeBuilder }) => {
			// Navigation is now manual because the fixture is lazy
			await page.goto("/", { waitUntil: "domcontentloaded" });
			// Use a specific locator instead of networkidle
			await expect(homePage.header.searchBox).toBeVisible({ timeout: 15000 });

			const results = await makeAxeBuilder(page).analyze();

			await test.info().attach("homepage-a11y-violations", {
				body: JSON.stringify(results.violations, null, 2),
				contentType: "application/json",
			});

			expect.soft(results.violations, "Homepage has WCAG violations").toEqual([]);
		},
	);

	test(
		"Should verify Product Detail Page (PDP) is WCAG compliant",
		{ tag: [TAGS.REGRESSION, "@slow"] },
		async ({ productSetup, makeAxeBuilder }) => {
			const { pdp, page } = await productSetup("iphone");
			// Use PDP specific locator instead of networkidle
			await expect(pdp.productTitle).toBeVisible({ timeout: 15000 });

			const results = await makeAxeBuilder(page).analyze();

			await test.info().attach("pdp-a11y-violations", {
				body: JSON.stringify(results.violations, null, 2),
				contentType: "application/json",
			});

			expect.soft(results.violations, "PDP has WCAG violations").toEqual([]);
		},
	);

	test(
		"Should verify Cart Page is WCAG compliant",
		{ tag: [TAGS.REGRESSION, "@slow"] },
		async ({ productSetup, makeAxeBuilder }) => {
			const { pdp, page } = await productSetup("iphone");
			await pdp.addToCart();
			await page.goto("/sepet", { waitUntil: "domcontentloaded" });

			// ELITE: POM-based wait instead of inline locator or networkidle.
			const cartPage = new CartPage(page);
			await expect(cartPage.pageTitle).toBeVisible({ timeout: 15000 });

			const results = await makeAxeBuilder(page).analyze();

			await test.info().attach("cart-a11y-violations", {
				body: JSON.stringify(results.violations, null, 2),
				contentType: "application/json",
			});

			expect.soft(results.violations, "Cart Page has WCAG violations").toEqual([]);
		},
	);
});
