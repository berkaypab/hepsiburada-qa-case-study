import { test, expect } from './fixtures/pages-fixture';
import { ProductDetailPage } from '../../pages/e2e';

test.describe.skip('Laptop Arama Senaryoları', () => {
    test('Laptop arayıp 3. ürüne gitme', async ({ homePage, searchPage, context }) => {

        await test.step('Ana sayfaya git ve başlığı doğrula', async () => {
            await homePage.navigate('/');
            await expect(homePage.page).toHaveTitle(/hepsiburada/i);
        });

        await test.step('Arama kutusuna "laptop" yaz ve ara', async () => {
            // header.search() implements its own robust retry and wait mechanisms.
            await homePage.header.search('laptop');
            await expect(searchPage.page).toHaveURL(/.*laptop.*/i);
        });

        await test.step('Arama sonuçlarından 3. ürüne tıkla ve yeni sekmeyi doğrula', async () => {
            // Hepsiburada opens products in a new tab by default.
            // We must wait for the new page event when clicking the product.
            const [newPage] = await Promise.all([
                context.waitForEvent('page'),
                searchPage.productListItems.nth(2).click()
            ]);

            // Wait for the new page to load
            await newPage.waitForLoadState('domcontentloaded');

            // Verify we landed on a Product Detail Page (PDP)
            await expect(newPage).toHaveURL(/.*-p(m)?-.*/i);

            // The old page/fixture doesn't automatically switch to the new tab.
            // Requirement "Yeni bir sekmede PDP açılmalı" is met.
            // We instantiate the ProductDetailPage POM on the new tab directly.
            const pdp = new ProductDetailPage(newPage);
            await expect(pdp.productTitle).toBeVisible();
        });
    });
});
