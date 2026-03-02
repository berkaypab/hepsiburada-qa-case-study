import { HB_DATA } from "../../shared/mock-data/hb-data";
import { test, expect } from "./fixtures/pages-fixture";
import { TAGS, TIMEOUTS } from "@utils/configuration";

test.describe(
	"Hepsiburada — Senaryo 1: Ürün Değlendirme Testi",
	{
		annotation: {
			type: "feature",
			description: "Senaryo-1: Arama → Ürün Detay → Yorumlar → Thumbs Up",
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

				await test.step("Search for a product", async () => {
					await homePage.header.search(HB_DATA.SEARCH_TERM);
				});

				await test.step("Collect product list into array and select a random product", async () => {
					const result = await searchPage.selectRandomProduct();
					selectedProductTitle = result.title;
					listingPrice = result.price;
				});

				await test.step("Verify detail page product matches the selected listing product", async () => {
					const partialKey = selectedProductTitle.split(" ").slice(0, 3).join(" ");

					await expect(
						productDetailPage.productTitleLocator,
						`Sayfa başlığı beklenen "${partialKey}" kelimelerini içermiyor`,
					).toContainText(partialKey, { ignoreCase: true });
				});

				await test.step("Listing fiyatı ile detay sayfası fiyatı eşleşiyor mu?", async () => {
					const detailPrice = await productDetailPage.getMainPrice();
					if (!listingPrice || !detailPrice) {
						return;
					}

					expect
						.soft(detailPrice, `Listing (${listingPrice} TL) ↔ Detay (${detailPrice} TL) eşleşmiyor`)
						.toBe(listingPrice);
				});

				await test.step("Navigate to Reviews tab and sort by newest", async () => {
					await productDetailPage.clickReviewsTab();
					const hasReviews = await reviewsPage.hasReviews();

					if (!hasReviews) {
						test.skip(true, "No reviews found on this product — skipping test.");
						return;
					}

					await reviewsPage.sortByNewest();
				});

				await test.step("Click thumbsUp and verify thank you message", async () => {
					await expect(async () => {
						await reviewsPage.clickThumbsUp();
						await expect(reviewsPage.getThankYouMessageLocator()).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
					}).toPass({ timeout: TIMEOUTS.XLARGE });
				});
			},
		);
	},
);
