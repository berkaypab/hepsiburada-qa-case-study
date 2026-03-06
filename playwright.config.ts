import { defineConfig, devices } from "@playwright/test";
import * as dotenv from "dotenv";
import * as path from "path";
import { fileURLToPath } from "url";

// Fix for __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, ".env") });

export default defineConfig({
	testDir: "./src",

	/** Test artifact çıktıları (screenshots, videos, traces) */
	outputDir: "test-results",
	snapshotPathTemplate: "{testDir}/__snapshots__/{testFilePath}/{projectName}/{arg}{ext}",

	/** E2E test için toplam süre sınırı (Lokalde heavy flow'lar için 60s, CI'da 10 dakika) */
	globalTimeout: process.env.CI ? 600_000 : 0,

	timeout: 60000,
	fullyParallel: true,

	/** Test raporu ve CI analizi için ekstra metadatalar */
	metadata: {
		project: "Hepsiburada QA Case Study",
		author: "Berkay",
		purpose: "Technical Interview Assignment",
	},

	/** .gitignore'daki dizinleri test armalarından dışla (Playwright default) */
	respectGitIgnore: true,

	// Limit the number of failures on CI to save resources
	maxFailures: process.env.CI ? 10 : undefined,

	/** CI'da test.only bırakılmışsa build başarısız olsun */
	forbidOnly: !!process.env.CI,

	// Retries: 2 for CI stability, 1 for local diagnostics without excessive loops
	retries: process.env.CI ? 2 : 0,

	workers: process.env.CI ? 1 : undefined,

	reporter: process.env.CI
		? [
			["github"],
			["list"],
			[
				"html",
				{
					outputFolder: process.env.PLAYWRIGHT_HTML_REPORT_DIR || "reports/playwright-report",
					open: "never",
				},
			],
			["./src/shared/utils/custom-reporter.ts"],
		]
		: [
			[
				"html",
				{
					outputFolder: process.env.PLAYWRIGHT_HTML_REPORT_DIR || "reports/playwright-report",
					open: "never",
				},
			],
			["./src/shared/utils/custom-reporter.ts"],
		],

	use: {
		screenshot: "only-on-failure",
		trace: process.env.CI ? "on-first-retry" : "retain-on-failure",
		video: process.env.CI ? "on-first-retry" : "off",
		testIdAttribute: "data-test-id",
		baseURL: "https://www.hepsiburada.com",

		// Locale and Timezone configuration to ensure tests running on US-based CI servers
		// format currencies (₺), dates, and strings identically to local Turkish developer machines.
		locale: "tr-TR",
		timezoneId: "Europe/Istanbul",

		// Maximum time each custom action (like click or fill) can take.
		// Bounding this avoids a single hanging click consuming the full 60s global timeout.
		actionTimeout: 15_000,
		navigationTimeout: 30_000,
	},

	expect: {
		timeout: 10_000,
		toHaveScreenshot: {
			maxDiffPixelRatio: 0.1,
		},
	},

	projects: [
		{
			name: "api",
			testMatch: /.*api\/.*\.spec\.ts/,
			use: {
				baseURL: "https://generator.swagger.io",
			},
		},

		// ── Seed project for Playwright Test Agents (Planner / Generator bootstrap)
		{
			name: "seed",
			testMatch: /.*seed\.spec\.ts/,
			use: {
				...devices["Desktop Chrome"],
				channel: "chrome",
			},
		},

		// ── Web Browsers Matrix
		{
			name: "chrome",
			testMatch: /.*e2e\/.*\.spec\.ts/,
			use: {
				...devices["Desktop Chrome"],
				channel: "chrome", // Native Google Chrome
			},
		},
		{
			name: "firefox",
			testMatch: /.*e2e\/.*\.spec\.ts/,
			use: {
				...devices["Desktop Firefox"],
			},
		},
		{
			name: "webkit", // Safari Engine
			testMatch: /.*e2e\/.*\.spec\.ts/,
			use: {
				...devices["Desktop Safari"],
			},
		},

		// Mobile viewport testleri
		// { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
		// { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } },
	],
});
