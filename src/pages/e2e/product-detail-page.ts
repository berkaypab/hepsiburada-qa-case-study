import { Page, Locator } from "@playwright/test";
import { BasePage } from "./base-page";
import { formatPriceString } from "shared/utils";

export class OtherSellerComponent {
	readonly container: Locator;
	readonly price: Locator;
	readonly actionButton: Locator;

	constructor(container: Locator) {
		this.container = container;
		this.price = container.getByTestId("price-current-price").first();
		this.actionButton = container.getByRole("button").first();
	}

	async getPriceText(): Promise<string> {
		const priceText = await this.price.innerText();
		return formatPriceString(priceText.trim());
	}

	async clickActionButton(): Promise<void> {
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

		this.productTitleLocator = page.getByRole("heading", { level: 1 }).first();

		const defaultPriceLoc = page.getByTestId("default-price").locator("span").first();
		const checkoutPriceLoc = page.getByTestId("checkout-price").locator("div").filter({ hasText: /TL/i }).first();

		this.mainPriceEl = defaultPriceLoc.or(checkoutPriceLoc);

		this.addToCartButton = page.getByRole("button", { name: /Sepete Ekle/i }).first();

		this.otherSellersSection = page.getByTestId("other-merchants").first();

		// Each other seller row: direct div children within the `other-merchants` section
		this.otherSellerRows = this.otherSellersSection.locator("> div > div");
	}

	async getMainPrice(): Promise<string> {
		const raw = await this.mainPriceEl.innerText();
		return formatPriceString(raw.trim());
	}

	async clickReviewsTab(): Promise<void> {
		// UI-Driven Navigation: Click the reviews link/tab instead of modifying URL
		// Using the locator provided in the HTML snippet
		const reviewsLink = this.page.getByTestId("has-review").getByRole("link").first();

		await reviewsLink.click();

		// Wait for the reviews page to stabilize
		await this.page.waitForLoadState("domcontentloaded");
	}

	async getOtherSellersCount(): Promise<number> {
		return await this.otherSellersSection.count();
	}

	/** Compares the main product price with the visible top 2 other sellers and returns the cheapest seller's index (-1 = main product is cheapest). */
	async getCheapestOtherSellerIndex(mainPrice: string): Promise<number> {
		const rowCount = await this.otherSellerRows.count();
		if (rowCount === 0) return -1;

		let cheapestPrice = mainPrice;
		let cheapestIdx = -1;

		for (let i = 0; i < Math.min(rowCount, 2); i++) {
			const seller = new OtherSellerComponent(this.otherSellerRows.nth(i));
			const price = await seller.getPriceText();
			if (price && price < cheapestPrice) {
				cheapestPrice = price;
				cheapestIdx = i;
			}
		}

		return cheapestIdx;
	}

	async navigateToOtherSeller(index: number): Promise<void> {
		const rowLocator = this.otherSellerRows.nth(index);
		const sellerComponent = new OtherSellerComponent(rowLocator);
		await sellerComponent.clickActionButton();
	}

	async addToCart(): Promise<void> {
		await this.addToCartButton.click();
	}

	getAddToCartButtonLocator(): Locator {
		return this.addToCartButton;
	}
}
