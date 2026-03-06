import { test, expect } from "./fixtures/pages-fixture";
import { TAGS, TIMEOUTS } from "@utils/configuration";

const searchData = [
    { keyword: "iphone", expectedUrlPattern: /q=iphone/i },
    { keyword: "samsung", expectedUrlPattern: /q=samsung/i },
    { keyword: "macbook", expectedUrlPattern: /q=macbook/i },
];

test.describe(
    "Hepsiburada — Scenario 4: Parameterized Search",
    {
        annotation: {
            type: "feature",
            description: "Scenario-Parameterize: testing search functionality with multiple keywords",
        },
    },
    () => {
        for (const data of searchData) {
            test(
                `Should successfully search for "${data.keyword}"`,
                {
                    tag: [TAGS.REGRESSION, TAGS.CUSTOMER],
                    annotation: {
                        type: "scenario",
                        description: `Searching functionality parameterized with: ${data.keyword}`,
                    },
                },
                async ({ homePage, searchPage, page }) => {
                    await test.step(`Search for keyword: ${data.keyword}`, async () => {
                        await page.goto("/", { waitUntil: "domcontentloaded" });
                        await homePage.header.search(data.keyword);
                    });

                    await test.step(`Verify URL contains the searched keyword: ${data.keyword}`, async () => {
                        // URL should be updated to contain the searched term
                        await expect(page).toHaveURL(data.expectedUrlPattern, { timeout: TIMEOUTS.LARGE });
                    });

                    await test.step("Verify result items are loaded", async () => {
                        // Use soft assertions on the Search Results Page
                        // to validate visibility of title, link, and price for ALL items
                        await searchPage.validateAllListedProducts();
                    });
                },
            );
        }
    },
);
