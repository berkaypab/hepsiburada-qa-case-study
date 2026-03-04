import { Page, expect } from "@playwright/test";

export class HeaderComponent {
	public readonly page: Page;

	constructor(page: Page) {
		this.page = page;
	}

	async search(term: string): Promise<void> {
		// We use toPass to retry the entire interaction sequence. 
		// This handles "Hydration" issues where the Enter key might be ignored if the page 
		// hasn't finished attaching JS listeners to the search input.
		await expect(async () => {
			// 1. Click the search wrapper to trigger the modal/overlay
			await this.page.locator('[role="search"]').click();

			// 2. Select the ACTIVE search input (the one in the modal)
			const activeSearchInput = this.page.getByPlaceholder(/Ürün, kategori veya marka ara/i).last();
			await activeSearchInput.waitFor({ state: "visible", timeout: 5000 });

			// 3. Clear and type. 
			await activeSearchInput.clear();
			await activeSearchInput.pressSequentially(term, { delay: 30 });

			// 4. Trigger search via Enter key
			await activeSearchInput.press("Enter");

			// 5. Verify navigation to the results page
			// If this fails, toPass will retry the whole block from step 1.
			await expect(this.page).toHaveURL(/(\/ara\?q=|s\?k=)/, { timeout: 7000 });
		}).toPass({
			intervals: [1000, 2000],
			timeout: 20000
		});
	}
}
