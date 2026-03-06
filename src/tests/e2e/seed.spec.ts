/**
 * SEED TEST — DO NOT DELETE
 *
 * This file is used by the Playwright Test Agent (Planner & Generator) as a bootstrap reference.
 * It demonstrates:
 *  1. How to import the shared `test` object from project fixtures
 *  2. Which custom fixtures are available (homePage, searchPage, productDetailPage, cartPage)
 *  3. That the `setupContext` fixture auto-handles:
 *     - Cookie/GDPR banner dismissal (#onetrust-accept-btn-handler)
 *     - Analytics/tracker blocking (Google Analytics, Hotjar, etc.)
 *
 * Agent instructions:
 *  - Always import from './tests/e2e/fixtures/pages-fixture' (not '@playwright/test')
 *  - Always reference this file as the seed in your test plan prompts
 *  - baseURL is already configured to https://www.hepsiburada.com in playwright.config.ts
 */
import { test, expect } from './fixtures/pages-fixture';

test.describe('Seed — Hepsiburada Environment Bootstrap', () => {
  test('seed: homepage loads and fixtures are available', async ({ page, homePage, searchPage: _searchPage, productDetailPage: _productDetailPage, cartPage: _cartPage }) => {
    // Step 1: Navigate to homepage (cookie banner will be auto-dismissed by setupContext fixture)
    await homePage.navigate('/');

    // Step 2: Verify the page loaded successfully
    await expect(page).toHaveTitle(/hepsiburada/i);

    // Step 3: Verify that the header search box is available (shows site is fully loaded)
    await expect(homePage.header.searchBox).toBeVisible();

    // ── From here, generated tests can build upon these fixtures:
    //
    // homePage.header.search(term)          → search for a product
    // searchPage.selectRandomProduct()      → pick a random result → returns { newPage, title, price }
    // productDetailPage.getMainPrice()      → get displayed price on PDP
    // productDetailPage.addToCartButton     → add to cart
    // cartPage (on /sepet page)             → verify cart contents
    //
    // All page objects extend BasePage which provides:
    //   .navigate(url)
    //   .header (HeaderComponent)
    //   .footer (FooterComponent)
    //   .getRandomLocator(locatorList, maxLimit?)
  });
});
