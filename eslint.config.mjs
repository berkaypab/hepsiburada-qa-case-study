// eslint.config.mjs
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import prettierPlugin from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";
import pluginPlaywright from "eslint-plugin-playwright";

export default [
	{
		files: ["**/*.spec.ts", "**/*.setup.ts"],
		...pluginPlaywright.configs["flat/recommended"],
		rules: {
			...pluginPlaywright.configs["flat/recommended"].rules,
			"playwright/no-commented-out-tests": "error",
			"playwright/no-duplicate-hooks": "error",
			"playwright/no-conditional-in-test": "warn",
			"playwright/no-skipped-test": "warn",
		},
	},
	{
		files: ["**/*.ts"],
		ignores: ["node_modules/**", "test-results/**", "playwright-report/**", "./vs/**"],
		languageOptions: {
			parser: tsparser,
			sourceType: "module",
			parserOptions: {
				project: "./tsconfig.json",
			},
		},

		plugins: {
			"@typescript-eslint": tseslint,
			prettier: prettierPlugin,
		},

		rules: {
			...tseslint.configs.recommended.rules,
			...prettierConfig.rules,
			"@typescript-eslint/no-unused-vars": "warn",
			"@typescript-eslint/no-explicit-any": "warn",
			"no-console": "warn",
			semi: ["error", "always"],
			quotes: ["error", "double", { avoidEscape: true }],
			"prettier/prettier": "error",
			"@typescript-eslint/no-floating-promises": "error",
			"@typescript-eslint/no-misused-promises": "error",
		},
	},
	// Custom reporter needs console.log to print to stdio — this is the documented
	// Playwright reporter pattern (see: test-reporters-js.md). Disable no-console for this file only.
	{
		files: ["src/shared/utils/custom-reporter.ts"],
		rules: {
			"no-console": "off",
		},
	},
];
