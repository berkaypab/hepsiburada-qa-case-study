import { Page, expect, Locator } from "@playwright/test";
import { TIMEOUTS } from "@utils/configuration";

export class HeaderComponent {
	public readonly page: Page;

	private readonly searchContainer: Locator;
	private readonly searchInput: Locator;

	private readonly accountMenuButton: Locator;
	private readonly loginLink: Locator;

	private readonly cartBadge: Locator;

	constructor(page: Page) {
		this.page = page;

		this.searchContainer = this.page.getByRole("search");
		this.searchInput = this.page.getByTestId("search-bar-input").first();

		this.accountMenuButton = this.page.locator("#myAccount");
		this.loginLink = this.page.getByRole("link", { name: "Giriş Yap" });
		this.cartBadge = this.page.locator("#cartItemCount");
	}

	async search(term: string): Promise<void> {
		await expect(async () => {
			await this.searchContainer.click();
			await this.searchInput.clear();
			await this.searchInput.pressSequentially(term, { delay: 100 });
			await expect(this.searchInput).toHaveValue(term, { timeout: TIMEOUTS.SMALL });
		}).toPass({ timeout: TIMEOUTS.XXLARGE, intervals: [500, 1000, 2000] });

		await this.searchInput.press("Enter");
	}

	async navigateToLogin(): Promise<void> {
		await this.accountMenuButton.hover();
		await this.loginLink.waitFor({ state: "visible", timeout: TIMEOUTS.SMALL });
		const href = await this.loginLink.getAttribute("href");
		if (href) {
			await this.page.goto(href);
		}
	}

	async getCartItemCount(): Promise<number> {
		const isVisible = await this.cartBadge.isVisible();
		if (!isVisible) return 0;
		const text = (await this.cartBadge.textContent()) ?? "0";
		return parseInt(text.trim(), 10) || 0;
	}

	async expectCartItemCount(expected: number): Promise<void> {
		await expect(this.cartBadge).toHaveText(String(expected));
	}
}
