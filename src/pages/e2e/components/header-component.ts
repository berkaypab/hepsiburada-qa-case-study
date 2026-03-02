import { Page } from "@playwright/test";

export class HeaderComponent {
	public readonly page: Page;

	constructor(page: Page) {
		this.page = page;
	}

	async search(term: string): Promise<void> {
		const baseUrl = process.env.HB_BASE_URL ?? "https://www.hepsiburada.com";
		const searchUrl = `${baseUrl}/ara?q=${encodeURIComponent(term)}`;
		await this.page.goto(searchUrl, { waitUntil: "domcontentloaded" });
	}
}
