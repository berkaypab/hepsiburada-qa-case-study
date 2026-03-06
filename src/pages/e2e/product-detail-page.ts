import { Page, Locator } from "@playwright/test";
import { BasePage } from "./base-page";
import { formatPriceString, parseTurkishPrice } from "shared/utils";

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
        await this.price.waitFor({ state: "visible", timeout: 10000 });
        const priceText = await this.price.innerText();
        return formatPriceString(priceText.trim());
    }

    async clickActionButton(): Promise<void> {
        await this.actionButton.click();
    }
}

export class ProductDetailPage extends BasePage {
    public readonly productTitle: Locator;
    public readonly mainPrice: Locator;
    public readonly addToCartButton: Locator;
    public readonly otherSellersSection: Locator;
    public readonly otherSellerRows: Locator;

    constructor(page: Page) {
        super(page);

        this.productTitle = page.getByRole("heading", { level: 1 }).first();

        const defaultPriceLoc = page.getByTestId("default-price").locator("span").first();
        const checkoutPriceLoc = page.getByTestId("checkout-price").locator("div").filter({ hasText: /TL/i }).first();

        this.mainPrice = defaultPriceLoc.or(checkoutPriceLoc);

        this.addToCartButton = page.getByRole("button", { name: /Sepete Ekle/i }).first();

        this.otherSellersSection = page.getByTestId("other-merchants").first();

        // Each other seller row: direct div children within the `other-merchants` section
        this.otherSellerRows = this.otherSellersSection.locator("> div > div");
    }

    async getMainPrice(): Promise<string> {
        await this.mainPrice.waitFor({ state: "visible", timeout: 10000 });
        const raw = await this.mainPrice.innerText();
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
        // We wait briefly to see if the section appears, as "Other Sellers" can be dynamic
        await this.otherSellersSection.waitFor({ state: "attached", timeout: 5000 }).catch(() => {});
        return await this.otherSellerRows.count();
    }

    /**
     * Iterates through all "Other Sellers" listed on the PDP.
     * Compares each seller's price against the provided main price.
     *
     * @param mainPrice - The price of the product sold by Hepsiburada/default seller.
     * @returns The zero-based index of the cheapest seller, or -1 if none are cheaper.
     */
    async getCheapestOtherSellerIndex(mainPrice: number): Promise<number> {
        const rowCount = await this.otherSellerRows.count();
        if (rowCount === 0) return -1;

        let cheapestIdx = -1;
        let cheapestPrice = mainPrice;

        const checks = Math.min(2, rowCount);

        for (let i = 0; i < checks; i++) {
            const seller = new OtherSellerComponent(this.otherSellerRows.nth(i));
            const priceStr = await seller.getPriceText();
            const price = parseTurkishPrice(priceStr);

            if (price && price < cheapestPrice) {
                cheapestIdx = i;
                cheapestPrice = price;
            }
        }

        return cheapestIdx;
    }

    async navigateToOtherSeller(index: number): Promise<void> {
        const rowLocator = this.otherSellerRows.nth(index);
        const sellerComponent = new OtherSellerComponent(rowLocator);
        await sellerComponent.clickActionButton();
    }

    /**
     * Discovers the "Add to Cart" button (waiting for dynamic visibility/delays) and clicks it.
     * Returns immediately after the click action. Wait for the confirmation toast
     * separately if needed.
     */
    async addToCart(): Promise<void> {
        await this.addToCartButton.click();
    }
}
