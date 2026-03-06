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
    public readonly productListItems: Locator;

    constructor(page: Page) {
        super(page);
        // ELITE: Hepsiburada uses id="i0", id="i1" etc. for real products.
        // Ads and Carousels use the same classes but have NO ID or different IDs.
        this.productListItems = this.page.locator('li[id^="i"]');
    }

    /**
     * Scans the current search results and intelligently picks a product card.
     * Handles the new tab (target="_blank") behavior gracefully.
     *
     * @returns The extracted product title, price, and the newly opened Page object.
     */
    async selectRandomProduct(): Promise<{ title: string; price: string; newPage: Page }> {
        const { title, price, link } = await this.findValidProductCard();

        // Multi-Tab Handling: Capture the new tab that opens when clicking a product
        // We use Promise.all to avoid race conditions between the click and the event listener
        const [newPage] = await Promise.all([this.page.context().waitForEvent("page"), link.click()]);

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
                link: productCard.link,
            };
        }).toPass({ timeout: 15000, intervals: [500, 1000] });

        if (!validData) throw new Error("No valid product card found.");
        return validData;
    }
    async validateAllListedProducts(): Promise<void> {
        await this.productListItems.first().waitFor({ state: "visible", timeout: 30000 });

        // ELITE: In dynamic pages with auto-loading ads, the count can shift.
        const initialCount = await this.productListItems.count();
        // Limit to first 24 to avoid infinite loops and keep test duration reasonable.
        const limit = Math.min(initialCount, 24);

        for (let i = 0; i < limit; i++) {
            // We use base.step to make the report clearer on which product failed.
            await expect(async () => {
                const item = this.productListItems.nth(i);

                // ELITE: Wait for the product container to be stable and attached before interacting.
                // This prevents "Element is not attached to the DOM" errors during scroll.
                await expect(item).toBeVisible({ timeout: 10000 });
                await item.scrollIntoViewIfNeeded();

                const productCard = new ProductCardComponent(item);

                // Soft assertions ensure the test does not break immediately if one product has missing info.
                await expect
                    .soft(productCard.title, `Product ${i + 1} title should be visible`)
                    .toBeVisible({ timeout: 5000 });
                await expect
                    .soft(productCard.link, `Product ${i + 1} link should be visible`)
                    .toBeVisible({ timeout: 5000 });
                await expect
                    .soft(productCard.price, `Product ${i + 1} price should be visible`)
                    .toBeVisible({ timeout: 5000 });
            }).toPass({ timeout: 15000, intervals: [500, 1000] });
        }
    }
}
