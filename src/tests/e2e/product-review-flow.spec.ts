import { HB_DATA } from "../../shared/mock-data/hb-data";
import { test, expect } from "./fixtures/pages-fixture";
import { TAGS, TIMEOUTS } from "@utils/configuration";

test.describe(
	"Hepsiburada — Scenario 1: Product Review Test",
	{
		annotation: {
			type: "feature",
			description: "Scenario-1: Search → Product Detail → Reviews → Thumbs Up",
		},
	},
	() => {
		test(
			"should thumbs up/down a review and see thank you message",
			{
				tag: [TAGS.REGRESSION, TAGS.CUSTOMER],
				annotation: { type: "scenario", description: "S1: Search→Detail→Reviews→ThumbsUp" },
			},
			async ({ homePage, searchPage, productDetailPage, reviewsPage }) => {
				let selectedProductTitle = "";
				let listingPrice = "";

				await test.step("Navigate to homepage and search for a product", async () => {
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
					).toContainText(partialKey, { ignoreCase: true });
				});

				await test.step("Verify that detail page price matches listing price", async () => {
					const detailPrice = await productDetailPage.getMainPrice();
					if (!listingPrice || !detailPrice) {
						return;
					}

					expect
						.soft(detailPrice, `Listing (${listingPrice} TL) ↔ Detail (${detailPrice} TL) prices do not match`)
						.toBe(listingPrice);
				});

				await test.step("Navigate to Reviews tab and sort by newest", async () => {
					await productDetailPage.clickReviewsTab();
					// PageAssertions: check if URL ends with '-yorumlari' (ReviewsTab navigation verification)
					await expect(homePage.page).toHaveURL(/-yorumlari$/, { timeout: 10000 });

					const hasReviews = await reviewsPage.hasReviews();

					if (!hasReviews) {
						test.skip(true, "No reviews found on this product — skipping test.");
						return;
					}

					await reviewsPage.sortByNewest();
				});

				await test.step("Vote helpful on a review and verify thank you message", async () => {
					await expect(async () => {
						await reviewsPage.clickThumbsUp();
						await expect(reviewsPage.getThankYouMessageLocator()).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
					}).toPass({ timeout: TIMEOUTS.XLARGE });
				});
			},
		);
	},
);
