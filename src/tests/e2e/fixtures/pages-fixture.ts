import { test as base, errors } from "@playwright/test";
import { HomePage, SearchResultsPage, ProductDetailPage, ReviewsPage, CartPage } from "pages/e2e";
type PagesFixture = {
	homePage: HomePage;
	searchPage: SearchResultsPage;
	productDetailPage: ProductDetailPage;
	reviewsPage: ReviewsPage;
	cartPage: CartPage;
	productSetup: (term: string) => Promise<{
		page: import("@playwright/test").Page;
		pdp: ProductDetailPage;
		reviews: ReviewsPage;
		title: string;
		price: string;
	}>;
};

export const test = base.extend<PagesFixture>({
	homePage: async ({ page, context }, use) => {
		await context.route(
			/google-analytics|googletagmanager|hotjar|insider|facebook|doubleclick|segment/,
			async (route) => {
				await route.abort();
			},
		);

		await context.route("**/consent/**", async (route) => {
			await route.continue();
		});

		// Layer 2 — locatorHandler (click the banner if it still appears)
		// noWaitAfter: true → action is not blocked; times: 3 → prevents infinite loops
		await page.addLocatorHandler(
			page.locator("#onetrust-accept-btn-handler"),
			async () => {
				await page
					.locator("#onetrust-accept-btn-handler")
					.click({ timeout: 3000 })
					.catch((e: unknown) => {
						// Only TimeoutError is expected — re-throw others
						if (!(e instanceof errors.TimeoutError)) throw e;
					});
			},
			{ noWaitAfter: true, times: 3 },
		);

		await page.goto("/", {
			waitUntil: "domcontentloaded",
		});
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
	 * Runs the full product browsing setup (search → pick product → verify price).
	 * Each step is wrapped in `base.step()` so the HTML report shows exactly which step failed.
	 *
	 * @param term - The keyword to search for (e.g. HB_DATA.SEARCH_TERM).
	 * @returns Initialized POM objects and extracted title/price from the opened PDP tab.
	 */
	productSetup: [
		async ({ homePage, searchPage }, use) => {
			const setup = async (term: string) => {
				// Step 1 — Search
				await base.step(`[Setup] Search for "${term}"`, async () => {
					await homePage.header.search(term);
				});

				// Step 2 — Pick a random product from the listing page
				const result = await base.step("[Setup] Select random product from search results", async () => {
					return await searchPage.selectRandomProduct();
				});

				const newPage = result.newPage;

				// Re-initialize POMs on the new tab using the already-imported classes directly
				const pdp = new ProductDetailPage(newPage);
				const reviews = new ReviewsPage(newPage);

				// Step 3 — Verify we landed on a valid PDP
				await base.step("[Setup] Verify PDP URL and title", async () => {
					await base.expect(newPage).toHaveURL(/hepsiburada\.com\/.*-p(m)?-/i, { timeout: 10000 });
					const partialKey = result.title.split(" ").slice(0, 3).join(" ");
					await base.expect(pdp.productTitleLocator).toContainText(partialKey, { ignoreCase: true });
				});

				// Step 4 — Soft-assert price consistency between listing and PDP
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
