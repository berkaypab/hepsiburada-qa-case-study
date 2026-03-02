import { HB_DATA } from "../../shared/mock-data/hb-data";
import { test, expect } from "./fixtures/pages-fixture";
import { TAGS, TIMEOUTS } from "@utils/configuration";
test.describe(
	"Hepsiburada — Scenario 2: Other Sellers Price Comparison",
	{
		annotation: {
			type: "feature",
			description: "Scenario-2: Other seller price comparison and adding to cart",
		},
	},
	() => {
		test(
			"iphone search → random product → compare price → add cheapest to cart",
			{
				tag: [TAGS.REGRESSION, TAGS.CUSTOMER],
				annotation: {
					type: "scenario",
					description: "S2: Listing→Detail→OtherSellers→Cart flow",
				},
			},
			async ({ homePage, searchPage, productDetailPage }) => {
				let selectedProductTitle = "";
				let listingPrice = "";

				await test.step("Navigate to homepage and search for 'iphone'", async () => {
					await homePage.header.search(HB_DATA.SEARCH_TERM);
				});

				await test.step("Select a random product from search results and capture listing price", async () => {
					const result = await searchPage.selectRandomProduct();
					selectedProductTitle = result.title;
					listingPrice = result.price;
					// PageAssertions: check if product detail page is reached (URL validation)
					// Hepsiburada URLs may contain "-p-" or "-pm-"
					await expect(homePage.page).toHaveURL(/hepsiburada\.com\/.*-p(m)?-/i, { timeout: 10000 });
				});

				await test.step("Verify product detail page opens successfully", async () => {
					const partialKey = selectedProductTitle.split(" ").slice(0, 3).join(" ");

					await expect(
						productDetailPage.productTitleLocator,
						`Page title does not contain the expected words: "${partialKey}"`,
					).toContainText(partialKey);
				});

				await test.step("Verify that detail page price matches listing price", async () => {
					const detailPrice = await productDetailPage.getMainPrice();
					if (!listingPrice || !detailPrice) {
						return;
					}

					await expect
						.soft(detailPrice, `Listing (${listingPrice}) ↔ Detail (${detailPrice}) prices do not match`)
						.toBe(listingPrice);
				});

				await test.step("Compare prices with other sellers and select the cheapest option", async () => {
					const otherSellersCount = await productDetailPage.getOtherSellersCount();

					if (otherSellersCount > 0) {
						const mainPrice = await productDetailPage.getMainPrice();
						if (!mainPrice) return;

						const cheapestIdx = await productDetailPage.getCheapestOtherSellerIndex(mainPrice);

						if (cheapestIdx !== -1) {
							await productDetailPage.navigateToOtherSeller(cheapestIdx);
						}
					}
				});

				await test.step("Add the selected product to cart", async () => {
					await expect(productDetailPage.getAddToCartButtonLocator()).toBeEnabled({ timeout: TIMEOUTS.LARGE });
					await productDetailPage.addToCart();
				});
			},
		);
	},
);
