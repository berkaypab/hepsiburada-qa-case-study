import { HB_DATA } from "../../shared/mock-data/hb-data";
import { test, expect } from "./fixtures/pages-fixture";
import { TAGS, TIMEOUTS } from "@utils/configuration";

/**
 * @fileoverview Scenario 1: Product Review Test
 * Validates the core community interaction layer. Given a searched product,
 * navigates to the reviews section, handles dynamic "no reviews" states,
 * and verifies that a user can successfully upvote a helpful review.
 */

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
					// Make sure we're on the reviews tab
					await expect(pdp.page).toHaveURL(/-yorumlari$/, { timeout: 10000 });

					const hasReviews = await reviews.hasReviews();

					if (!hasReviews) {
						// eslint-disable-next-line playwright/no-skipped-test -- runtime conditional skip, not a forgotten static skip
						test.skip(true, "No reviews found on this product — skipping test.");
						return;
					}

					await reviews.sortByNewest();
				});

				await test.step("Thumbs up a review and wait for thank you message", async () => {
					await expect(async () => {
						await reviews.clickThumbsUp();
						await expect(reviews.getThankYouMessageLocator()).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
					}).toPass({ timeout: TIMEOUTS.XLARGE });
				});
			},
		);
	},
);
