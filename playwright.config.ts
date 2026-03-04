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

	// Limit the number of failures on CI to save resources
	maxFailures: process.env.CI ? 10 : undefined,

	/** CI'da test.only bırakılmışsa build başarısız olsun */
	forbidOnly: !!process.env.CI,

	// Retries dynamically set by TEST_ENV: production needs immediate fail, staging/dev can retry
	retries: process.env.TEST_ENV === "production" ? 0 : 2,

	workers: process.env.CI ? 1 : undefined,

	reporter: process.env.CI
		? [
			["github"],
			["list"],
			[
				"html",
				{ outputFolder: process.env.PLAYWRIGHT_HTML_REPORT_DIR || "reports/playwright-report", open: "never" },
			],
			["./src/shared/utils/custom-reporter.ts"],
		]
		: [
			[
				"html",
				{ outputFolder: process.env.PLAYWRIGHT_HTML_REPORT_DIR || "reports/playwright-report", open: "never" },
			],
			["./src/shared/utils/custom-reporter.ts"],
		],

	use: {
		screenshot: "only-on-failure",
		trace: process.env.CI ? "on-first-retry" : "retain-on-failure",
		video: process.env.CI ? "on-first-retry" : "retain-on-failure",
		testIdAttribute: "data-test-id",
		// baseURL is dynamically set based on the environment variable
		baseURL:
			process.env.TEST_ENV === "staging"
				? "https://staging.hepsiburada.com"
				: "https://www.hepsiburada.com", // Default to production
	},

	expect: {
		timeout: 10_000,
	},

	projects: [
		{
			name: "setup",
			testMatch: /.*\.setup\.ts/,
			use: {
				...devices["Desktop Chrome"],
			},
		},

		{
			name: "api",
			testMatch: /.*api\/.*\.spec\.ts/,
			use: {
				baseURL: "https://generator.swagger.io",
			},
			dependencies: ["setup"],
		},

		// ── Web Browsers Matrix
		{
			name: "chrome",
			testMatch: /.*e2e\/.*\.spec\.ts/,
			use: {
				...devices["Desktop Chrome"],
				channel: "chrome", // Native Google Chrome
			},
			dependencies: ["setup"],
		},
		{
			name: "firefox",
			testMatch: /.*e2e\/.*\.spec\.ts/,
			use: {
				...devices["Desktop Firefox"],
			},
			dependencies: ["setup"],
		},
		{
			name: "webkit", // Safari Engine
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
