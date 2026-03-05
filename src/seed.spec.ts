import { test } from './tests/e2e/fixtures/pages-fixture';

test.describe('Seed test for AI Generation', () => {
  test('seed', async ({ homePage: _homePage, searchPage: _searchPage, productDetailPage: _productDetailPage }) => {
    // AI Ajanları bu dosyayı referans alarak kendi testlerini yukarıdaki fixture'ları kullanarak üretecekler.
  });
});
