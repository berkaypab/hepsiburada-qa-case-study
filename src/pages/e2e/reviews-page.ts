import { Page, Locator, expect, errors } from "@playwright/test";
import { BasePage } from "./base-page";
import { TIMEOUTS } from "@utils/configuration";

const TEXT_CONSTANTS = {
	THANK_YOU_MSG: "Teşekkür Ederiz.",
	SORT_NEWEST_REGEX: /En yeni değerlendirme/i,
};

export class ReviewsPage extends BasePage {
	private readonly sortNewestOption: Locator;
	private readonly thumbsUpButton: Locator;
	private readonly thankYouMessage: Locator;

	constructor(page: Page) {
		super(page);
		this.sortNewestOption = this.page.getByText(TEXT_CONSTANTS.SORT_NEWEST_REGEX);
		this.thumbsUpButton = this.page.locator("[class*='thumbsUp']").first();
		this.thankYouMessage = this.page.getByText(TEXT_CONSTANTS.THANK_YOU_MSG, { exact: true }).first();
	}

	async hasReviews(): Promise<boolean> {
		return (await this.page.locator("[class*='thumbsUp']").count()) > 0;
	}

	async sortByNewest(): Promise<void> {
		await this.page.keyboard.press("End");

		// Sort dropdown trigger: "Varsayılan" metni — tüm tarayıcılarda stabil
		const sortTrigger = this.page
			.locator("[class*='Sort-module']")
			.getByText(/^Varsayılan$/)
			.first();

		// toPass() ile retry: cookie banner veya DOM re-render durumunda tüm diziyi yeniden dener
		// scrollIntoViewIfNeeded() KULLANILMIYOR — click() zaten otomatik scroll yapar (Playwright docs)
		// Ayrı bir scrollIntoViewIfNeeded() çağrısı, DOM re-render'dan sonra stale element hatasına yol açar
		await expect(async () => {
			await sortTrigger.waitFor({ state: "visible", timeout: TIMEOUTS.LARGE });
			await sortTrigger.click();
			await this.sortNewestOption.waitFor({ state: "visible", timeout: TIMEOUTS.LARGE });
			await this.sortNewestOption.click();
		}).toPass({ timeout: TIMEOUTS.XXLARGE });

		// Sort sonrası thumbs butonları render olana kadar bekle
		// Sadece TimeoutError susturulur — diğer hatalar yine fırlatılır (playwright.errors API)
		await this.thumbsUpButton
			.waitFor({ state: "visible", timeout: TIMEOUTS.LARGE })
			.catch((e: unknown) => {
				if (!(e instanceof errors.TimeoutError)) throw e;
			});
	}

	async clickThumbsUp(): Promise<void> {
		// Scroll ile viewport'a getir → intersection observer ile render olur
		await this.thumbsUpButton.scrollIntoViewIfNeeded();
		await this.thumbsUpButton.waitFor({ state: "visible", timeout: TIMEOUTS.LARGE });
		await this.thumbsUpButton.click();
	}

	getThankYouMessageLocator(): Locator {
		return this.thankYouMessage;
	}
}
