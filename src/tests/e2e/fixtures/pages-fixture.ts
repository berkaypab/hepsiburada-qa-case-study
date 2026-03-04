import { test as base, errors } from "@playwright/test";
import { HomePage, SearchResultsPage, ProductDetailPage, ReviewsPage, CartPage } from "pages/e2e";
type PagesFixture = {
	homePage: HomePage;
	searchPage: SearchResultsPage;
	productDetailPage: ProductDetailPage;
	reviewsPage: ReviewsPage;
	cartPage: CartPage;
};

export const test = base.extend<PagesFixture>({
	homePage: async ({ page, context }, use) => {
		const baseUrl = process.env.HB_BASE_URL;
		if (!baseUrl) throw new Error("HB_BASE_URL environment variable is missing!");

		// Layer 1 — context.route() (Playwright Fixtures API: context)
		// Global Network Interception: Block ads, trackers, and telemetry to speed up tests
		// Using regex for common patterns found in Hepsiburada (Google Analytics, Insider, Hotjar, etc.)
		await context.route(/google-analytics|googletagmanager|hotjar|insider|facebook|doubleclick|segment/, async (route) => {
			await route.abort();
		});

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

		await page.goto(baseUrl, {
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
});

export { expect } from "@playwright/test";
