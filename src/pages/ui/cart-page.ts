import { expect } from "@playwright/test";
import { BasePage } from "./base-page";
export class CartPage extends BasePage {
	async getCartCount(): Promise<number> {
		return await this.header.getCartItemCount();
	}

	async expectCartCountIncreased(countBefore: number): Promise<void> {
		const expected = countBefore + 1;
		const currentCount = await this.getCartCount();

		expect(currentCount, `Sepet adedi ${countBefore}'dan ${expected} veya üzerine yükselmedi`).toBeGreaterThanOrEqual(
			expected,
		);
	}
}
