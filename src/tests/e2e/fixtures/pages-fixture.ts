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

		// Katman 1 — context.route() (Playwright Fixtures API: context)
		// page.route() sadece mevcut sekmeyi kapsar; context.route() tüm sekmeleri kapsar
		// Yeni sekmeler açılsa da (popup, diğer satıcı vb.) consent intercept geçerli olur
		await context.route("**/consent/**", async (route) => {
			await route.continue();
		});

		// Katman 2 — locatorHandler (banner yine de görünürse tıkla)
		// noWaitAfter: true → aksiyon bloklanmaz; times: 3 → sonsuz döngü önlenir
		await page.addLocatorHandler(
			page.locator("#onetrust-accept-btn-handler"),
			async () => {
				await page
					.locator("#onetrust-accept-btn-handler")
					.click({ timeout: 3000 })
					.catch((e: unknown) => {
						// Sadece TimeoutError beklenen bir durum — diğerini fırlat
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
