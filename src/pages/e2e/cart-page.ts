import { type Page, type Locator } from "@playwright/test";
import { BasePage } from "./base-page";

export class CartPage extends BasePage {
    public readonly pageTitle: Locator;

    constructor(page: Page) {
        super(page);
        // ELITE: Using a more specific and robust locator for the cart title.
        // Hepsiburada checkout flow sometimes has variations in role mapping.
        this.pageTitle = page.locator("h1").filter({ hasText: "Sepetim" }).first();
    }
}
