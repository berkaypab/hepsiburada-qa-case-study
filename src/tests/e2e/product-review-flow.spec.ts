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
				let pdp: typeof productDetailPage;
				let reviews: typeof reviewsPage;
				let selectedProductTitle = "";
				let listingPrice = "";

				await test.step("Navigate to homepage and search for a product", async () => {
					await homePage.header.search(HB_DATA.SEARCH_TERM);
				});

				await test.step("Select a random product from search results and capture listing price", async () => {
					const result = await searchPage.selectRandomProduct();
					selectedProductTitle = result.title;
					listingPrice = result.price;

					// Re-initialize POMs for the NEW tab
					const newPage = result.newPage;
					pdp = new (productDetailPage.constructor as any)(newPage);
					reviews = new (reviewsPage.constructor as any)(newPage);

					// PageAssertions: check if product detail page is reached (URL validation) on the NEW page
					await expect(newPage).toHaveURL(/hepsiburada\.com\/.*-p(m)?-/i, { timeout: 10000 });
				});

				await test.step("Verify product detail page opens successfully", async () => {
					const partialKey = selectedProductTitle.split(" ").slice(0, 3).join(" ");

					await expect(
						pdp.productTitleLocator,
						`Page title does not contain the expected words: "${partialKey}"`,
					).toContainText(partialKey, { ignoreCase: true });
				});

				await test.step("Verify that detail page price matches listing price", async () => {
					const detailPrice = await pdp.getMainPrice();
					if (!listingPrice || !detailPrice) {
						return;
					}

					expect
						.soft(detailPrice, `Listing (${listingPrice} TL) ↔ Detail (${detailPrice} TL) prices do not match`)
						.toBe(listingPrice);
				});

				await test.step("Navigate to Reviews tab and sort by newest", async () => {
					await pdp.clickReviewsTab();
					// PageAssertions: check if URL ends with '-yorumlari' (ReviewsTab navigation verification)
					await expect(pdp.page).toHaveURL(/-yorumlari$/, { timeout: 10000 });

					const hasReviews = await reviews.hasReviews();

					if (!hasReviews) {
						test.skip(true, "No reviews found on this product — skipping test.");
						return;
					}

					await reviews.sortByNewest();
				});

				await test.step("Vote helpful on a review and verify thank you message", async () => {
					await expect(async () => {
						await reviews.clickThumbsUp();
						await expect(reviews.getThankYouMessageLocator()).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
					}).toPass({ timeout: TIMEOUTS.XLARGE });
				});
			},
		);
	},
);
