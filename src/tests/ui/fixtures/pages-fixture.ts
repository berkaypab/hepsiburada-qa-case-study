import { test as base } from "@playwright/test";
import { HomePage, SearchResultsPage, ProductDetailPage, ReviewsPage, CartPage } from "pages/ui";
type PagesFixture = {
	homePage: HomePage;
	searchPage: SearchResultsPage;
	productDetailPage: ProductDetailPage;
	reviewsPage: ReviewsPage;
	cartPage: CartPage;
};

export const test = base.extend<PagesFixture>({
	homePage: async ({ page }, use) => {
		const baseUrl = process.env.HB_BASE_URL;
		if (!baseUrl) throw new Error("HB_BASE_URL environment variable is missing!");

		// Global Playwright Locator Handler for Cookie Banners
		await page.addLocatorHandler(
			page.locator("#onetrust-accept-btn-handler"),
			async () => {
				await page
					.locator("#onetrust-accept-btn-handler")
					.click({ timeout: 3000 })
					.catch(() => {});
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
