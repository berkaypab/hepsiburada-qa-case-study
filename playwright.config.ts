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

	/** Test raporu ve CI analizi için ekstra metadatalar */
	metadata: {
		environment: process.env.CI ? "ci" : "local",
	},

	/** .gitignore'daki dizinleri test armalarından dışla (Playwright default) */
	respectGitIgnore: true,

	/** CI'da test.only bırakılmışsa build başarısız olsun */
	forbidOnly: !!process.env.CI,

	/** CI'da başarısız testleri 2 kez daha dene */
	retries: process.env.CI ? 2 : 0,

	/** CI'da paralel koşumu kısıtla (bot protection), lokalde Playwright otomatik optimize eder */
	workers: process.env.CI ? 1 : undefined,

	reporter: process.env.CI
		? [
			["list"],
			["html", { outputFolder: process.env.PLAYWRIGHT_HTML_REPORT_DIR || "reports/playwright-report", open: "never" }],
			["./src/shared/utils/custom-reporter.ts"],
		]
		: [
			["html", { outputFolder: process.env.PLAYWRIGHT_HTML_REPORT_DIR || "reports/playwright-report", open: "never" }],
			["./src/shared/utils/custom-reporter.ts"],
		],

	use: {
		viewport: { width: 1280, height: 720 },
		screenshot: "only-on-failure",
		trace: process.env.CI ? "on-first-retry" : "retain-on-failure",
		video: process.env.CI ? "on-first-retry" : "retain-on-failure",
		testIdAttribute: "data-test-id",
	},

	expect: {
		timeout: 10_000,
	},

	projects: [
		{
			name: "setup",
			testMatch: /.*\.setup\.ts/,
			use: {
				...devices["Desktop Firefox"],
			},
		},

		{
			name: "api",
			testMatch: /.*api\/.*\.spec\.ts/,
			use: {
				baseURL: process.env.SWAGGER_API_BASE_URL,
			},
			dependencies: ["setup"],
		},

		/*// ── Chromium (Base Engine)
		{
			name: "chromium",
			testMatch: /.*e2e\/.*\.spec\.ts/,
			use: {
				...devices["Desktop Chrome"],
			},
			dependencies: ["setup"],
		},*/

		// ── Native Google Chrome (Branded)
		{
			name: "chrome",
			testMatch: /.*e2e\/.*\.spec\.ts/,
			use: {
				...devices["Desktop Chrome"],
				channel: "chrome", // Specifying channel uses the actual Google Chrome installed on the user's machine
			},
			dependencies: ["setup"],
		},

		// ── Firefox
		{
			name: "firefox",
			testMatch: /.*e2e\/.*\.spec\.ts/,
			use: {
				...devices["Desktop Firefox"],
			},
			dependencies: ["setup"],
		},

		// ── WebKit (Safari)
		{
			name: "webkit",
			testMatch: /.*e2e\/.*\.spec\.ts/,
			use: {
				...devices["Desktop Safari"],
			},
			dependencies: ["setup"],
		},

		// Mobile viewport testleri
		// { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] }, dependencies: ['setup'] },
		// { name: 'Mobile Safari', use: { ...devices['iPhone 12'] }, dependencies: ['setup'] },
	],
});
