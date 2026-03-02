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

		// Sort dropdown trigger: "Varsayılan" text — stable across all browsers
		const sortTrigger = this.page
			.locator("[class*='Sort-module']")
			.getByText(/^Varsayılan$/)
			.first();

		// toPass() with retry: retries the whole sequence in case of cookie banner or DOM re-renders
		// scrollIntoViewIfNeeded() IS NOT USED — click() already handles auto-scrolling (Playwright docs)
		// An explicit scrollIntoViewIfNeeded() call could lead to stale element errors after a DOM re-render
		await expect(async () => {
			await sortTrigger.waitFor({ state: "visible", timeout: TIMEOUTS.LARGE });
			await sortTrigger.click();
			await this.sortNewestOption.waitFor({ state: "visible", timeout: TIMEOUTS.LARGE });
			await this.sortNewestOption.click();
		}).toPass({ timeout: TIMEOUTS.XXLARGE });

		// Wait until thumbs-up buttons render after sorting
		// Only TimeoutError is suppressed — other errors are re-thrown (playwright.errors API)
		await this.thumbsUpButton
			.waitFor({ state: "visible", timeout: TIMEOUTS.LARGE })
			.catch((e: unknown) => {
				if (!(e instanceof errors.TimeoutError)) throw e;
			});
	}

	async clickThumbsUp(): Promise<void> {
		// Scroll into viewport -> triggers intersection observer for rendering
		await this.thumbsUpButton.scrollIntoViewIfNeeded();
		await this.thumbsUpButton.waitFor({ state: "visible", timeout: TIMEOUTS.LARGE });
		await this.thumbsUpButton.click();
	}

	getThankYouMessageLocator(): Locator {
		return this.thankYouMessage;
	}
}
