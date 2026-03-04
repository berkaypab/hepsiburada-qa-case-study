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
	/** 
	 * Encapsulated flow: Search -> Select Random Product -> Verify PDP
	 * Reducing boilerplate in spec files by handling the multi-tab logic and basic assertions here.
	 */
	productSetup: [async ({ homePage, searchPage, productDetailPage, reviewsPage }, use) => {
		const setup = async (term: string) => {
			return await base.step(`Product Setup: ${term}`, async () => {
				// 1. Search
				await homePage.header.search(term);

				// 2. Select Product & Capture New Tab
				const result = await searchPage.selectRandomProduct();
				const newPage = result.newPage;

				// 3. Re-initialize POMs for the new tab
				const pdp: ProductDetailPage = new (productDetailPage.constructor as any)(newPage);
				const reviews: ReviewsPage = new (reviewsPage.constructor as any)(newPage);

				// 4. Basic Assertions (URL & Title)
				await base.expect(newPage).toHaveURL(/hepsiburada\.com\/.*-p(m)?-/i, { timeout: 10000 });

				const partialKey = result.title.split(" ").slice(0, 3).join(" ");
				await base.expect(pdp.productTitleLocator).toContainText(partialKey, { ignoreCase: true });

				// 5. Price Verification (Soft Assertion)
				const detailPrice = await pdp.getMainPrice();
				if (result.price && detailPrice) {
					base.expect.soft(detailPrice).toBe(result.price);
				}

				return {
					page: newPage,
					pdp,
					reviews,
					title: result.title,
					price: result.price
				};
			});
		};

		await use(setup);
	}, { box: true }],
});

export { expect } from "@playwright/test";
