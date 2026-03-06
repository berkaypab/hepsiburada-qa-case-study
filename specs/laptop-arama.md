# Test Plan: Laptop Arama ve 3. Ürüne Tıklama

## Overview
Bu test planı, Hepsiburada ana sayfasından "laptop" araması yapılmasını ve arama sonuçlarındaki 3. ürüne tıklanarak ürün detay sayfasına (PDP) gidilmesini doğrular.

## Suites

### Suite: Laptop Arama Senaryoları
**Seed File**: `src/tests/e2e/seed.spec.ts`

#### Test: Laptop arayıp 3. ürüne gitme
**File**: `src/tests/e2e/laptop-search.spec.ts`

**Steps**:
1. **Perform**: `homePage` fixture'ını kullanarak ana sayfaya git (`navigate('/')`).
   **Expect**: Sayfa başlığında Hepsiburada kelimesi geçmelidir.
2. **Perform**: `homePage.header.searchBox` içine "laptop" kelimesini yaz ve arama butonuna bas (`homePage.header.search('laptop')`).
   **Expect**: Arama sonuç sayfası açılmalı ve URL'de "laptop" kelimesi geçmelidir.
3. **Perform**: Arama sonuç listesindeki (`searchPage.productList.productItem`) kartlardan 3. olanı seç (`nth(2)`) ve tıkla.
   **Expect**: Yeni bir sekmede/sayfada Ürün Detay Sayfası (PDP) açılmalı ve başlık bilgileri gelmelidir.
