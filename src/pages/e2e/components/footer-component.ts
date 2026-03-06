import { Page, Locator } from "@playwright/test";

export class FooterComponent {
    public readonly page: Page;

    public readonly socialMediaLinks: Locator;
    public readonly mobileAppLinks: Locator;

    constructor(page: Page) {
        this.page = page;

        this.socialMediaLinks = this.page.locator(".footer__link--social");
        this.mobileAppLinks = this.page.locator(".footer__box--app");
    }

    async navigateTo(linkName: string): Promise<void> {
        const targetLink = this.page.getByRole("link", { name: linkName, exact: true });
        await targetLink.click();
    }

    async clickSocialMediaIcon(platformName: string): Promise<void> {
        const iconLink = this.socialMediaLinks.filter({ hasText: platformName }).first();
        await iconLink.click();
    }

    private getMobileAppLink(storeName: "APP STORE" | "GOOGLE PLAY" | "APP GALLERY"): Locator {
        return this.mobileAppLinks.filter({ hasText: storeName }).first();
    }

    async downloadAppFrom(storeName: "APP STORE" | "GOOGLE PLAY" | "APP GALLERY"): Promise<void> {
        const appLink = this.getMobileAppLink(storeName);
        await appLink.click();
    }
}
