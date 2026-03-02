import { Page, expect, Locator } from "@playwright/test";
import { BasePage } from "./base-page";
import { TIMEOUTS } from "@utils/configuration";

const TEXT_CONSTANTS = {
	HELPFUL_REVIEW: "Bu değerlendirme faydalı mı?",
	THANK_YOU_MSG: "Teşekkür Ederiz.",
	SORT_NEWEST_REGEX: /En yeni değerlendirme/i,
};

export class ReviewCardComponent {
	readonly container: Locator;
	readonly thumbsUpButton: Locator;
	readonly thumbsDownButton: Locator;
	readonly thankYouMessage: Locator;

	constructor(container: Locator) {
		this.container = container;

		const thumbsUpClass = container.locator(".thumbsUp").first().locator("xpath=../..");
		const thumbsDownClass = container.locator(".thumbsDown").first().locator("xpath=../..");

		const fallbackThumbsUp = container
			.locator("div")
			.filter({ hasText: /^0$|^[1-9][0-9]*$/ })
			.nth(0);
		const fallbackThumbsDown = container
			.locator("div")
			.filter({ hasText: /^0$|^[1-9][0-9]*$/ })
			.nth(1);

		this.thumbsUpButton = thumbsUpClass.or(fallbackThumbsUp);
		this.thumbsDownButton = thumbsDownClass.or(fallbackThumbsDown);
		this.thankYouMessage = container.getByText(TEXT_CONSTANTS.THANK_YOU_MSG, { exact: true });
	}

	async clickThumbsUp(): Promise<void> {
		await this.thumbsUpButton.scrollIntoViewIfNeeded();
		await this.thumbsUpButton.click();
	}

	async clickThumbsDown(): Promise<void> {
		await this.thumbsDownButton.scrollIntoViewIfNeeded();
		await this.thumbsDownButton.click();
	}

	async expectThankYouMessage(): Promise<void> {
		await expect(this.thankYouMessage).toBeVisible({ timeout: 2000 });
	}
}

export class ReviewsPage extends BasePage {
	private readonly sortButton: Locator;
	private readonly sortNewestOption: Locator;
	private readonly reviewCards: Locator;

	constructor(page: Page) {
		super(page);
		this.sortButton = this.page
			.locator("[class*='hermes-Sort-module']")
			.filter({ hasText: /^Varsayılan$/ })
			.first();
		this.sortNewestOption = this.page.getByText(TEXT_CONSTANTS.SORT_NEWEST_REGEX);
		this.reviewCards = this.page.locator("[class*='reviewCard'], [class*='ReviewCard']");
	}

	private getFirstValidReviewCard(): ReviewCardComponent {
		const firstReviewCardLocator = this.reviewCards.filter({ hasText: TEXT_CONSTANTS.HELPFUL_REVIEW }).first();
		return new ReviewCardComponent(firstReviewCardLocator);
	}

	async hasReviews() {
		return (await this.reviewCards.count()) > 0;
	}

	async sortByNewest() {
		await this.page.keyboard.press("End");

		await this.sortButton.waitFor({ state: "visible", timeout: TIMEOUTS.LARGE });

		await this.sortButton.scrollIntoViewIfNeeded();

		await expect(async () => {
			await this.sortButton.click();
			await expect(this.sortNewestOption).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
		}).toPass({ timeout: TIMEOUTS.XLARGE });

		await this.sortNewestOption.click();
	}

	async clickThumbsUp() {
		const card = this.getFirstValidReviewCard();

		await expect(async () => {
			await card.clickThumbsUp();
			await card.expectThankYouMessage();
		}).toPass({ timeout: TIMEOUTS.XLARGE });
	}

	async clickThumbsDown() {
		const card = this.getFirstValidReviewCard();

		await expect(async () => {
			await card.clickThumbsDown();
		}).toPass({ timeout: TIMEOUTS.LARGE });
	}

	async expectThankYouMessage() {
		const card = this.getFirstValidReviewCard();
		await card.expectThankYouMessage();
	}
}
