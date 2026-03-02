import { HB_DATA } from "../../shared/mock-data/hb-data";
import { test, expect } from "./fixtures/pages-fixture";
import { TAGS, TIMEOUTS } from "@utils/configuration";
test.describe(
	"Hepsiburada — Senaryo 2: Diğer Satıcılar Fiyat Karşılaştırma",
	{
		annotation: {
			type: "feature",
			description: "Senaryo-2: Diğer satıcı fiyat karşılaştırması ve sepete ekleme",
		},
	},
	() => {
		test(
			"iphone arama → rastgele ürün → fiyat karşılaştır → en ucuzu sepete ekle",
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

				await test.step("Ana sayfayı aç ve 'iphone' ara", async () => {
					await homePage.header.search(HB_DATA.SEARCH_TERM);
				});

				await test.step("Arama listesinden rastgele bir ürün seç ve listing fiyatını al", async () => {
					const result = await searchPage.selectRandomProduct();
					selectedProductTitle = result.title;
					listingPrice = result.price;
				});

				await test.step("Ürün detay sayfasını doğrula (başlık eşleşmesi)", async () => {
					const partialKey = selectedProductTitle.split(" ").slice(0, 3).join(" ");

					await expect(
						productDetailPage.productTitleLocator,
						`Sayfa başlığı beklenen "${partialKey}" kelimelerini içermiyor`,
					).toContainText(partialKey);
				});

				await test.step("Listing fiyatı ile detay sayfası fiyatı eşleşiyor mu?", async () => {
					const detailPrice = await productDetailPage.getMainPrice();
					if (!listingPrice || !detailPrice) {
						return;
					}

					await expect
						.soft(detailPrice, `Listing (${listingPrice}) ↔ Detay (${detailPrice}) birbirinden farklı`)
						.toBe(listingPrice);
				});

				await test.step("Diğer satıcıları fiyatlarla karşılaştır", async () => {
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

				await test.step("Sepete ekle", async () => {
					await expect(productDetailPage.getAddToCartButtonLocator()).toBeEnabled({ timeout: TIMEOUTS.LARGE });
					await productDetailPage.addToCart();
				});
			},
		);
	},
);
