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

		this.title = container.locator('[data-test-id^="title-"]').first();
		this.link = container.getByRole("link").first();
		this.price = container.locator('[data-test-id^="final-price-"]').first();
		this.badge = container.locator('[data-test-id^="badge-image-"]').first();
		this.estimatedArrival = container.locator('[data-test-id^="ead-"]').first();
		this.favoriteButton = container.locator('[data-test-id^="add-to-favorite-button-"]').first();
		this.variantsCount = container.locator('[data-test-id^="variants-count-"]').first();
		this.rating = container.locator('[data-test-id^="rating-"]').first();
		this.addToCartButton = container.locator('[data-test-id^="add-to-cart-button-"]').first();
	}

	async getTitle(): Promise<string> {
		return (await this.title.textContent())?.trim() ?? "";
	}

	async getHref(): Promise<string> {
		return (await this.link.getAttribute("href")) ?? "";
	}

	async getPrice(): Promise<string> {
		if (await this.price.isVisible()) {
			const priceText = (await this.price.textContent())?.trim() ?? "";
			return formatPriceString(priceText);
		}
		return "";
	}
}

export class SearchResultsPage extends BasePage {
	private readonly productListItems: Locator;

	constructor(page: Page) {
		super(page);
		this.productListItems = this.page.locator("li").filter({ has: this.page.locator('[data-test-id^="title-"]') });
	}

	async selectRandomProduct(): Promise<{ title: string; price: string }> {
		const { title, href, price } = await this.findValidProductCard();
		await this.navigateToProduct(href);

		return { title, price };
	}

	private async findValidProductCard(): Promise<{ title: string; href: string; price: string }> {
		let validData: { title: string; href: string; price: string } | undefined;

		await this.productListItems.first().waitFor({ state: "visible", timeout: 30000 });

		await expect(async () => {
			const cardLocator = await this.getRandomLocator(this.productListItems);
			const productCard = new ProductCardComponent(cardLocator);
			validData = {
				title: await productCard.getTitle(),
				href: await productCard.getHref(),
				price: await productCard.getPrice(),
			};

			expect(validData.title).toBeTruthy();
			expect(validData.href).toBeTruthy();
			expect(validData.price).toBeTruthy();
		}).toPass({ timeout: 15000, intervals: [500, 1000] });

		if (!validData) throw new Error("Geçerli bir ürün kartı bulunamadı.");
		return validData;
	}

	private async navigateToProduct(href: string): Promise<void> {
		const baseUrl = process.env.HB_BASE_URL;
		const finalUrl = href.startsWith("http") ? href : `${baseUrl}${href}`;

		await this.page.goto(finalUrl, { waitUntil: "domcontentloaded" });
	}
}
