import { Page, expect, Locator } from "@playwright/test";
import { BasePage } from "./base-page";
import { formatPriceString } from "shared/utils";

export class ProductCardComponent {
	readonly container: Locator;
	readonly title: Locator;
	readonly link: Locator;
	readonly price: Locator;
	readonly badge: Locator;
	readonly estimatedArrival: Locator;
	readonly favoriteButton: Locator;
	readonly variantsCount: Locator;
	readonly rating: Locator;
	readonly addToCartButton: Locator;

	constructor(container: Locator) {
		this.container = container;

		this.title = container.locator('[data-test-id^="title-"]');
		this.link = container.getByRole("link").first();
		this.price = container.locator('[data-test-id^="final-price-"]');
		this.badge = container.locator('[data-test-id^="badge-image-"]');
		this.estimatedArrival = container.locator('[data-test-id^="ead-"]');
		this.favoriteButton = container.locator('[data-test-id^="add-to-favorite-button-"]');
		this.variantsCount = container.locator('[data-test-id^="variants-count-"]');
		this.rating = container.locator('[data-test-id^="rating-"]');
		this.addToCartButton = container.locator('[data-test-id^="add-to-cart-button-"]');
	}

	async getTitle(): Promise<string> {
		const titleText = await this.title.innerText();
		return titleText.trim();
	}

	async getHref(): Promise<string> {
		return (await this.link.getAttribute("href")) ?? "";
	}

	async getPrice(): Promise<string> {
		const priceText = await this.price.innerText();
		return formatPriceString(priceText.trim());
	}
}

export class SearchResultsPage extends BasePage {
	private readonly productListItems: Locator;

	constructor(page: Page) {
		super(page);
		this.productListItems = this.page.locator("li").filter({ has: this.page.locator('[data-test-id^="title-"]') });
	}

	async selectRandomProduct(): Promise<{ title: string; price: string; newPage: Page }> {
		const { title, price, link } = await this.findValidProductCard();

		// Multi-Tab Handling: Capture the new tab that opens when clicking a product
		// We use Promise.all to avoid race conditions between the click and the event listener
		const [newPage] = await Promise.all([
			this.page.context().waitForEvent("page"),
			link.click()
		]);

		// Wait for the PDP URL pattern instead of a generic loadState —
		// more specific and aligns with Playwright's recommendation to
		// await a concrete condition rather than a load event.
		await newPage.waitForURL(/hepsiburada\.com\/.*-p(m)?-/i, { timeout: 15000 });

		return { title, price, newPage };
	}

	private async findValidProductCard(): Promise<{ title: string; price: string; link: Locator }> {
		let validData: { title: string; price: string; link: Locator } | undefined;

		await this.productListItems.first().waitFor({ state: "visible", timeout: 30000 });

		await expect(async () => {
			const cardLocator = await this.getRandomLocator(this.productListItems);
			const productCard = new ProductCardComponent(cardLocator);

			validData = {
				title: await productCard.getTitle(),
				price: await productCard.getPrice(),
				link: productCard.link
			};
		}).toPass({ timeout: 15000, intervals: [500, 1000] });

		if (!validData) throw new Error("No valid product card found.");
		return validData;
	}


}
