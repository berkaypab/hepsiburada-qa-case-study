import { HB_DATA } from "../../shared/mock-data/hb-data";
import { test, expect } from "./fixtures/pages-fixture";
import { TAGS, TIMEOUTS } from "@utils/configuration";

/**
 * @fileoverview Scenario 2: Other Sellers Price Comparison
 * Verifies that a user can successfully search for a product, land on its PDP,
 * compare its price against other sellers in the buy-box, pick the cheapest one,
 * and add it to the cart.
 */

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
			async ({ productSetup }) => {
				const { pdp } = await productSetup(HB_DATA.SEARCH_TERM);

				await test.step("Check other sellers and pick the cheapest", async () => {
					const otherSellersCount = await pdp.getOtherSellersCount();

					if (otherSellersCount > 0) {
						const mainPriceStr = await pdp.getMainPrice();
						if (!mainPriceStr) return;

						const priceFormatted = mainPriceStr.replace(/\./g, "").replace(",", ".");
						const mainPrice = parseFloat(priceFormatted);

						const cheapestIdx = await pdp.getCheapestOtherSellerIndex(mainPrice);

						if (cheapestIdx !== -1) {
							await pdp.navigateToOtherSeller(cheapestIdx);
						}
					}
				});

				await test.step("Add the selected product to cart", async () => {
					await expect(pdp.getAddToCartButtonLocator()).toBeEnabled({ timeout: TIMEOUTS.LARGE });
					await pdp.addToCart();
				});
			},
		);
	},
);
