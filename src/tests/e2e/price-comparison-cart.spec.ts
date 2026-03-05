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
			async ({ productSetup }) => {
				const { pdp } = await productSetup(HB_DATA.SEARCH_TERM);

				await test.step("Compare prices with other sellers and select the cheapest option", async () => {
					const otherSellersCount = await pdp.getOtherSellersCount();

					if (otherSellersCount > 0) {
						const mainPrice = await pdp.getMainPrice();
						if (!mainPrice) return;

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
