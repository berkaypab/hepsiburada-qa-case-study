import { test, expect } from "./fixtures/pages-fixture";

/**
 * ELITE TIP: Aria Snapshots (v1.50+)
 * Instead of checking individual elements, we snapshot the entire accessibility tree.
 * This is the most "Strict" and robust way to test complex UI sections.
 */
test.describe("Hepsiburada — Scenario 6: ARIA and Role Coverage", () => {
    test("Should verify Home Page sections accessibility structure", async ({ page, homePage }) => {
        // Navigation is now manual because the fixture is lazy
        await page.goto("/", { waitUntil: "domcontentloaded" });

        // We target a specific section via homePage instance
        const footer = homePage.page.locator("footer");

        // Elite Tip: On very long pages (11000px+), scrolling ensures the
        // Accessibility Tree is fully computed and stable.
        await footer.scrollIntoViewIfNeeded();

        // Elite-Level: Verify the structure of the footer using a REAL ARIA snapshot
        // Captured with high-precision (headings vs text) from live production.
        await expect(footer).toMatchAriaSnapshot(`
        - contentinfo:
          - heading "Kurumsal" [level=4]
          - list:
            - listitem: [link "Hakkımızda"]
            - listitem: [link "İş Ortaklarımız"]
            - listitem: [link "Yatırımcı ilişkileri"]
            - listitem: [link "Müşteri Hizmetleri"]
            - listitem: [link "Kariyer"]
            - listitem: [link "Kişisel Verilerin Korunması"]
            - listitem: [link "Bilgi Güvenliği Politikası"]
            - listitem: [link "Güvenli Alışveriş Kılavuzu"]
            - listitem: [link "İş Sağlığı ve Güvenliği Çevre Politikamız"]
            - listitem: [link "İletişim"]
          - heading "Hepsiburada" [level=4]
          - list:
            - listitem: [link "Hayatburada Blog"]
            - listitem: [link "Satıcı Olmak İstiyorum"]
            - listitem: [link "Hepsipay İşyeri Olmak İstiyorum"]
            - listitem: [link "Tedarikçi Davranış Kuralları"]
            - listitem: [link "Girişimci Kadınlara Teknoloji Gücü"]
            - listitem: [link "Teslimat Noktası Olmak İstiyorum"]
            - listitem: [link "Ödeme Seçenekleri"]
            - listitem: [link "Banka Kampanyaları"]
            - listitem: [link "İşlem Rehberi"]
          - heading "Bizi Takip Edin" [level=4]
          - list:
            - listitem: [link "Instagram"]
            - listitem: [link "Youtube"]
            - listitem: [link "TikTok"]
            - listitem: [link "Facebook"]
            - listitem: [link "X"]
            - listitem: [link "Linkedin"]
            - listitem: [link "Pinterest"]
          - heading "Mobil Uygulamalar" [level=4]
          - link "APP STORE'dan İNDİREBİLİRSİNİZ"
          - link "GOOGLE PLAY'dan İNDİREBİLİRSİNİZ"
          - link "APP GALLERY'den İNDİREBİLİRSİNİZ"
      `);
    });
});
