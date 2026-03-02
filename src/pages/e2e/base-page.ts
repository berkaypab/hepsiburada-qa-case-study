import { Locator, Page } from "@playwright/test";
import { HeaderComponent } from "./components/header-component";
import { FooterComponent } from "./components/footer-component";
import { TIMEOUTS } from "@utils/configuration";

export class BasePage {
	readonly page: Page;
	public readonly header: HeaderComponent;
	public readonly footer: FooterComponent;

	constructor(page: Page) {
		this.page = page;
		this.header = new HeaderComponent(page);
		this.footer = new FooterComponent(page);
	}

	async navigate(url: string) {
		await this.page.goto(url, { waitUntil: "domcontentloaded" });
	}

	async getRandomLocator(locatorList: Locator, maxLimit?: number): Promise<Locator> {
		await locatorList.first().waitFor({ state: "visible", timeout: TIMEOUTS.XXLARGE });
		const count = await locatorList.count();
		if (count === 0) throw new Error("No items found in the list to select randomly.");

		const limit = maxLimit ? Math.min(count, maxLimit) : count;
		const randomIndex = Math.floor(Math.random() * limit);
		return locatorList.nth(randomIndex);
	}
}
