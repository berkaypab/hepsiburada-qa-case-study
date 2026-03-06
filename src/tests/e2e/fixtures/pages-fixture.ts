import { test as base, errors, type Page } from "@playwright/test";
import { HomePage, SearchResultsPage, ProductDetailPage, ReviewsPage, CartPage } from "pages/e2e";
import AxeBuilder from "@axe-core/playwright";
import type { PagesFixture } from "./types";

export const test = base.extend<PagesFixture>({
	/**
	 * Single atomic auto-fixture to handle context-level routing and page-level handlers.
	 * Merging these ensures guaranteed execution order and prevents "Target page closed" errors.
	 */
	setupContext: [
		async ({ context, page }, use) => {
			// 1. Global Route Interception (Block Analytics/Trackers)
			await context.route(
				/google-analytics|googletagmanager|hotjar|insider|facebook|doubleclick|segment/,
				async (route) => {
					await route.abort();
				},
			);

			// Ensure consent/other necessary routes continue
			await context.route("**/consent/**", async (route) => {
				await route.continue();
			});

			// 2. Global Cookie Banner Handler
			await page.addLocatorHandler(
				page.locator("#onetrust-accept-btn-handler"),
				async () => {
					await page
						.locator("#onetrust-accept-btn-handler")
						.click({ timeout: 3000 })
						.catch((e: unknown) => {
							if (!(e instanceof errors.TimeoutError)) throw e;
						});
				},
				{ noWaitAfter: true, times: 3 },
			);

			await use();
		},
		{ auto: true },
	],

	homePage: async ({ page }, use) => {
		// ELITE: Fixture is now lazy. Navigation responsibility is moved to the test or helper.
		await use(new HomePage(page));
	},

	searchPage: async ({ page }, use) => {
		await use(new SearchResultsPage(page));
	},

	productDetailPage: async ({ page }, use) => {
		await use(new ProductDetailPage(page));
	},

	reviewsPage: async ({ page }, use) => {
		await use(new ReviewsPage(page));
	},

	cartPage: async ({ page }, use) => {
		await use(new CartPage(page));
	},

	/**
	 * Factory fixture for AxeBuilder.
	 * FIXED: Now accepts a targetPage parameter to support multi-tab/tab-specific scans.
	 */
	makeAxeBuilder: async ({ }, use) => {
		const makeAxeBuilder = (targetPage: Page) =>
			new AxeBuilder({ page: targetPage })
				.withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
				.exclude("#reco-container")
				.exclude("iframe");

		await use(makeAxeBuilder);
	},

	/**
	 * Atomic fixture for search + product selection.
	 * ELITE: Smaller, single-responsibility fixture that can be reused in different scenarios.
	 */
	searchAndPickProduct: [
		async ({ homePage, searchPage }, use) => {
			const fn = async (term: string) => {
				await base.step(`[Setup] Search and Pick product for "${term}"`, async () => {
					await homePage.navigate("/");
					await homePage.header.search(term);
				});
				return await searchPage.selectRandomProduct();
			};
			await use(fn);
		},
		{ box: true },
	],

	/**
	 * High-level setup flow.
	 * ELITE: Now uses the smaller `searchAndPickProduct` fixture.
	 */
	productSetup: [
		async ({ searchAndPickProduct }, use) => {
			const setup = async (term: string) => {
				const result = await searchAndPickProduct(term);
				const newPage = result.newPage;

				// Re-initialize POMs on the new tab
				const pdp = new ProductDetailPage(newPage);
				const reviews = new ReviewsPage(newPage);

				// Step 3 — Verify we landed on a valid PDP
				await base.step("[Setup] Verify PDP URL and title", async () => {
					await base.expect(newPage).toHaveURL(/hepsiburada\.com\/.*-p(m)?-/i, { timeout: 10000 });
					const partialKey = result.title.split(" ").slice(0, 3).join(" ");
					await base.expect(pdp.productTitle).toContainText(partialKey, { ignoreCase: true });
				});

				// Step 4 — Soft-assert price consistency
				await base.step("[Setup] Verify price consistency (soft)", async () => {
					const detailPrice = await pdp.getMainPrice();
					if (result.price && detailPrice) {
						base.expect.soft(detailPrice).toBe(result.price);
					}
				});

				return {
					page: newPage,
					pdp,
					reviews,
					title: result.title,
					price: result.price,
				};
			};

			await use(setup);
		},
		{ box: true },
	],
});

export { expect } from "@playwright/test";
