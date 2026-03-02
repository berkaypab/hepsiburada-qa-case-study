import { Page, expect, Locator } from "@playwright/test";
import { TIMEOUTS } from "@utils/configuration";

export class FooterComponent {
	public readonly page: Page;

	private readonly corporateLinks: Locator;
	private readonly hepsiburadaLinks: Locator;
	private readonly socialMediaLinks: Locator;
	private readonly mobileAppLinks: Locator;

	constructor(page: Page) {
		this.page = page;

		this.corporateLinks = this.getFooterColumnByTitle("Kurumsal");
		this.hepsiburadaLinks = this.getFooterColumnByTitle("Hepsiburada");

		this.socialMediaLinks = this.page.locator(".footer__link--social");
		this.mobileAppLinks = this.page.locator(".footer__box--app");
	}

	private getFooterColumnByTitle(title: string): Locator {
		return this.page
			.locator(".footer__column")
			.filter({ has: this.page.locator("h4.footer__title", { hasText: title }) });
	}

	async navigateTo(linkName: string): Promise<void> {
		const targetLink = this.page.getByRole("link", { name: linkName, exact: true });

		await targetLink.scrollIntoViewIfNeeded();
		await targetLink.waitFor({ state: "visible", timeout: TIMEOUTS.SMALL });
		await targetLink.click();
	}

	async clickSocialMediaIcon(platformName: string): Promise<void> {
		const iconLink = this.socialMediaLinks.filter({ hasText: platformName }).first();

		await iconLink.scrollIntoViewIfNeeded();
		await iconLink.waitFor({ state: "visible", timeout: TIMEOUTS.SMALL });
		await iconLink.click();
	}

	private getMobileAppLink(storeName: "APP STORE" | "GOOGLE PLAY" | "APP GALLERY"): Locator {
		return this.mobileAppLinks.filter({ hasText: storeName }).first();
	}

	async downloadAppFrom(storeName: "APP STORE" | "GOOGLE PLAY" | "APP GALLERY"): Promise<void> {
		const appLink = this.getMobileAppLink(storeName);
		await appLink.scrollIntoViewIfNeeded();
		await appLink.waitFor({ state: "visible", timeout: TIMEOUTS.SMALL });
		await appLink.click();
	}

	async expectFooterIsVisible(): Promise<void> {
		await Promise.all([
			expect(this.corporateLinks).toBeVisible({ timeout: TIMEOUTS.MEDIUM }),
			expect(this.hepsiburadaLinks).toBeVisible({ timeout: TIMEOUTS.MEDIUM }),
			expect(this.socialMediaLinks.first()).toBeVisible({ timeout: TIMEOUTS.MEDIUM }),
			expect(this.mobileAppLinks.first()).toBeVisible({ timeout: TIMEOUTS.MEDIUM }),
		]);
	}
}
