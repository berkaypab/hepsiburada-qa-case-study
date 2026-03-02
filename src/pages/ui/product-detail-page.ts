import { Page, expect, Locator } from "@playwright/test";
import { BasePage } from "./base-page";
import { TIMEOUTS } from "@utils/configuration";
import { formatPriceString } from "shared/utils";

export class OtherSellerComponent {
	readonly container: Locator;
	readonly merchantName: Locator;
	readonly merchantRating: Locator;
	readonly shipmentText: Locator;
	readonly price: Locator;
	readonly actionButton: Locator;

	constructor(container: Locator) {
		this.container = container;
		this.merchantName = container.getByTestId("merchant-name").first();
		this.merchantRating = container.getByTestId("merchant-rating").first();
		this.shipmentText = container.getByTestId("shipment-text").first();
		this.price = container.getByTestId("price-current-price").first();
		this.actionButton = container.getByRole("button").first();
	}

	async getPriceText(): Promise<string> {
		if (await this.price.isVisible()) {
			const priceText = (await this.price.textContent())?.trim() ?? "";
			return formatPriceString(priceText);
		}
		return "";
	}

	async clickActionButton(): Promise<void> {
		await this.actionButton.scrollIntoViewIfNeeded();
		await this.actionButton.click();
	}
}

export class ProductDetailPage extends BasePage {
	public readonly productTitleLocator;

	private readonly mainPriceEl;

	private readonly addToCartButton;

	private readonly otherSellersSection;

	private readonly otherSellerRows;

	constructor(page: Page) {
		super(page);

		this.productTitleLocator = page.getByTestId("title").first();

		const defaultPriceLoc = page.getByTestId("default-price").locator("span").first();
		const checkoutPriceLoc = page.getByTestId("checkout-price").locator("div").filter({ hasText: /TL/i }).first();

		this.mainPriceEl = defaultPriceLoc.or(checkoutPriceLoc);

		this.addToCartButton = page.getByTestId("addToCart").first();

		this.otherSellersSection = page.getByTestId("other-merchants").first();

		this.otherSellerRows = this.otherSellersSection.getByTestId("other-merchants").first().locator("> div");
	}

	async getProductTitle(): Promise<string> {
		await this.productTitleLocator.waitFor({ state: "visible", timeout: TIMEOUTS.LARGE });
		return (await this.productTitleLocator.textContent())?.trim() ?? "";
	}

	async getMainPrice(): Promise<string> {
		await this.mainPriceEl.waitFor({ state: "visible", timeout: TIMEOUTS.LARGE });
		const raw = (await this.mainPriceEl.textContent())?.trim() ?? "";
		return formatPriceString(raw);
	}

	async clickReviewsTab(): Promise<void> {
		const cleanUrl = this.page
			.url()
			.split("?")[0]
			.replace(/-yorumlari$/, "");
		const targetUrl = `${cleanUrl}-yorumlari`;

		await expect(async () => {
			await this.page.goto(targetUrl, { waitUntil: "domcontentloaded", timeout: TIMEOUTS.LARGE });
			expect(this.page.url()).toContain("-yorumlari");
		}).toPass({ timeout: TIMEOUTS.XLARGE });
	}

	async hasOtherSellers(): Promise<boolean> {
		const count = await this.otherSellersSection.count();
		return count > 0;
	}

	async goToCheapestOtherSellerIfCheaper(): Promise<boolean> {
		const mainPrice = (await this.mainPriceEl.textContent())?.trim() ?? "";

		if (!mainPrice) return false;

		const { minOtherPrice, cheapestIdx } = await this.getCheapestOtherSeller();
		if (cheapestIdx === -1 || mainPrice <= minOtherPrice) return false;

		return await this.navigateToOtherSeller(cheapestIdx);
	}

	private async getCheapestOtherSeller(): Promise<{ minOtherPrice: string; cheapestIdx: number }> {
		const rowCount = await this.otherSellerRows.count();
		if (rowCount === 0) return { minOtherPrice: "", cheapestIdx: -1 };

		const maxItemsToCompare = Math.min(rowCount, 2);

		let minOtherPrice = "";
		let cheapestIdx = -1;

		for (let i = 0; i < maxItemsToCompare; i++) {
			const rowLocator = this.otherSellerRows.nth(i);
			const sellerComponent = new OtherSellerComponent(rowLocator);
			const price = await sellerComponent.getPriceText();

			if (!minOtherPrice || (price && price < minOtherPrice)) {
				minOtherPrice = price;
				cheapestIdx = i;
			}
		}

		return { minOtherPrice, cheapestIdx };
	}

	private async navigateToOtherSeller(index: number): Promise<boolean> {
		const rowLocator = this.otherSellerRows.nth(index);
		const sellerComponent = new OtherSellerComponent(rowLocator);

		await sellerComponent.clickActionButton();

		await expect(this.page).toHaveURL(/magaza=/, { timeout: TIMEOUTS.LARGE });
		return true;
	}

	async addToCart(): Promise<void> {
		await this.addToCartButton.scrollIntoViewIfNeeded();
		await this.addToCartButton.waitFor({ state: "visible", timeout: TIMEOUTS.LARGE });
		await expect(this.addToCartButton).toBeEnabled({ timeout: TIMEOUTS.LARGE });
		await this.addToCartButton.click();
	}
}
