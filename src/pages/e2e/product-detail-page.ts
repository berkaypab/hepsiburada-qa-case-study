import { Page, Locator } from "@playwright/test";
import { BasePage } from "./base-page";
import { TIMEOUTS } from "@utils/configuration";
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

		// Each other seller row: direct div children within the `other-merchants` section
		this.otherSellerRows = this.otherSellersSection.locator("> div > div");
	}

	async getMainPrice(): Promise<string> {
		const raw = (await this.mainPriceEl.textContent())?.trim() ?? "";
		return formatPriceString(raw);
	}

	async clickReviewsTab(): Promise<void> {
		const cleanUrl = this.page
			.url()
			.split("?")[0]
			.replace(/-yorumlari$/, "");
		const targetUrl = `${cleanUrl}-yorumlari`;

		// 'commit' -> resolves Firefox NS_BINDING_ABORTED issue (Playwright GitHub #20749)
		// Resolves as soon as the HTML stream starts, before Firefox aborts the connection
		await this.page.goto(targetUrl, { waitUntil: "commit", timeout: TIMEOUTS.LARGE });
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
		await this.addToCartButton.scrollIntoViewIfNeeded();
		await this.addToCartButton.click();
	}

	getAddToCartButtonLocator(): Locator {
		return this.addToCartButton;
	}
}
