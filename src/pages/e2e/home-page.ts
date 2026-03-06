import { Page, Locator } from "@playwright/test";
import { BasePage } from "./base-page";

export class HomePage extends BasePage {
    public readonly showcaseHeader: Locator;
    public readonly genericProductCard: Locator;

    constructor(page: Page) {
        super(page);
        this.showcaseHeader = page.getByText(/Günün Fırsatları|Süper Fiyat|Sana Özel/i).first();
        this.genericProductCard = page.locator('a[href*="-p-HBCV"]').first();
    }
}
