import { Page, Locator } from "@playwright/test";
import { TIMEOUTS } from "@utils/configuration";

export class FooterComponent {
	public readonly page: Page;


	private readonly socialMediaLinks: Locator;
	private readonly mobileAppLinks: Locator;

	constructor(page: Page) {
		this.page = page;

		this.socialMediaLinks = this.page.locator(".footer__link--social");
		this.mobileAppLinks = this.page.locator(".footer__box--app");
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

}
