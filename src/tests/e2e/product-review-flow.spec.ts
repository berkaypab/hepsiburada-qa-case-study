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
			async ({ productSetup }) => {
				const { pdp, reviews } = await productSetup(HB_DATA.SEARCH_TERM);

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
