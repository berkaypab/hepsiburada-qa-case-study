import { defineConfig, devices } from "@playwright/test";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, ".env") });

export default defineConfig({
	testDir: "./src",

	/** Test artifact çıktıları (screenshots, videos, traces) */
	outputDir: "test-results",

	/** E2E test için toplam süre sınırı (Lokalde heavy flow'lar için 60s, CI'da 10 dakika) */
	globalTimeout: process.env.CI ? 600_000 : 0,

	timeout: 60000,
	fullyParallel: true,

	/** CI'da test.only bırakılmışsa build başarısız olsun */
	forbidOnly: !!process.env.CI,

	/** CI'da başarısız testleri 2 kez daha dene */
	retries: process.env.CI ? 2 : 0,

	/** CI'da paralel koşumu kısıtla, lokalde ise CPU/Network darboğazını önlemek için max 2 worker kullanıyoruz */
	workers: process.env.CI ? 1 : 1,

	reporter: process.env.CI
		? [
				["list"],
				[
					"html",
					{ outputFolder: process.env.PLAYWRIGHT_HTML_REPORT_DIR || "reports/playwright-report", open: "never" },
				],
			]
		: [
				["line"],
				[
					"html",
					{ outputFolder: process.env.PLAYWRIGHT_HTML_REPORT_DIR || "reports/playwright-report", open: "never" },
				],
			],

	use: {
		viewport: { width: 1280, height: 720 },
		actionTimeout: 15000,
		navigationTimeout: 30000,
		screenshot: "only-on-failure",
		trace: "retain-on-failure",
		video: "retain-on-failure",
		testIdAttribute: "data-test-id",
	},

	expect: {
		timeout: 10_000,
	},

	projects: [
		{
			name: "api",
			testMatch: /.*api\/.*\.spec\.ts/,
			use: {
				baseURL: process.env.SWAGGER_API_BASE_URL,
			},
		},

		// ── Chromium (DISABLED DUE TO BOT PROTECTION)
		/*
		{
			name: "chromium",
			testMatch: /.*ui\/.*\.spec\.ts/,
			use: {
				...devices["Desktop Chrome"],
			},
		},
		*/

		// ── Firefox
		{
			name: "firefox",
			testMatch: /.*ui\/.*\.spec\.ts/,
			use: {
				...devices["Desktop Firefox"],
			},
		},

		// ── WebKit (Safari)
		{
			name: "webkit",
			testMatch: /.*ui\/.*\.spec\.ts/,
			use: {
				...devices["Desktop Safari"],
			},
		},

		// Mobile viewport testleri
		// { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] }, dependencies: ['setup'] },
		// { name: 'Mobile Safari', use: { ...devices['iPhone 12'] }, dependencies: ['setup'] },
	],
});
