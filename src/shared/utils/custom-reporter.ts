import { Reporter, FullConfig, Suite, TestCase, TestResult, FullResult, TestStep, TestError } from "@playwright/test/reporter";
import * as fs from "fs";
import * as path from "path";

const COLORS = {
	reset: "\x1b[0m",
	bright: "\x1b[1m",
	green: "\x1b[32m",
	red: "\x1b[31m",
	blue: "\x1b[34m",
	yellow: "\x1b[33m",
	cyan: "\x1b[36m",
	magenta: "\x1b[35m",
};

const ICONS = {
	play: "▶",
	check: "✅",
	cross: "❌",
	skip: "⏭️",
	warn: "⚠️",
	rocket: "🚀",
	flag: "🏁",
	save: "💾",
	step: "↳",
};

interface FailedTestMetadata {
	title: string;
	project: string;
	duration: number;
	error?: string;
	location: string;
	attachments: Array<{ name: string; path?: string; contentType: string }>;
}

/**
 * Custom Playwright Reporter - Perfect Seviye
 *
 * Features:
 * 1. ANSI Colored Console Output
 * 2. Hierarchical Step Logging
 * 3. Rich JSON Payload for Jira/External (including screenshots/traces)
 * 4. Executive Summary at the end
 */
class CustomReporter implements Reporter {
	private failedTests: Array<FailedTestMetadata> = [];
	private stats = {
		total: 0,
		passed: 0,
		failed: 0,
		skipped: 0,
		startTime: 0,
	};

	onBegin(_config: FullConfig, suite: Suite) {
		this.stats.total = suite.allTests().length;
		this.stats.startTime = Date.now();
		console.log(
			`\n${COLORS.bright}${ICONS.rocket}  Test Suite Starting | Total: ${this.stats.total} tests${COLORS.reset}\n`,
		);
	}

	printsToStdio(): boolean {
		return true; // We heavily use console.log, so we inform Playwright we print to stdio.
	}

	onError(error: TestError): void {
		console.log(`\n${COLORS.red}${ICONS.cross}  GLOBAL ERROR ENCOUNTERED:${COLORS.reset}`);
		console.log(`   ${COLORS.red}${error.message || error.value}${COLORS.reset}\n`);
	}
	onTestBegin(test: TestCase) {
		const project = test.parent.project()?.name || "default";
		console.log(
			`${COLORS.blue}${ICONS.play}  STARTED:${COLORS.reset} [${COLORS.magenta}${project}${COLORS.reset}] > ${test.title}`,
		);
	}

	onStepBegin(_test: TestCase, _result: TestResult, step: TestStep) {
		if (step.category === "test.step") {
			const indent = " ".repeat(step.title.split(">").length * 2);
			console.log(`${indent}${COLORS.cyan}${ICONS.step} Step:${COLORS.reset} ${step.title} `);
		}
	}

	onTestEnd(test: TestCase, result: TestResult) {
		const project = test.parent.project()?.name || "default";
		const duration = `${result.duration} ms`;

		if (result.status === "passed") {
			this.stats.passed++;
			console.log(
				`${COLORS.green}${ICONS.check} PASSED:${COLORS.reset} [${project}] > ${test.title} (${COLORS.yellow}${duration}${COLORS.reset}) \n`,
			);
		} else if (result.status === "skipped") {
			this.stats.skipped++;
			console.log(`${COLORS.yellow}${ICONS.skip} SKIPPED:${COLORS.reset} [${project}] > ${test.title} \n`);
		} else if (result.status === "failed" || result.status === "timedOut") {
			this.stats.failed++;
			console.log(
				`${COLORS.red}${ICONS.cross} FAILED:${COLORS.reset} [${project}] > ${test.title} (${COLORS.yellow}${duration}${COLORS.reset})`,
			);

			if (result.error?.message) {
				console.log(`   ${COLORS.red} Error:${COLORS.reset} ${result.error.message.split("\n")[0]} \n`);
			}

			// Collect failed tests as a rich payload
			this.failedTests.push({
				title: test.title,
				project: project,
				duration: result.duration,
				error: result.error?.stack || result.error?.message || "Unknown error occurred",
				location: `${test.location.file}:${test.location.line} `,
				attachments: result.attachments.map((att) => ({
					name: att.name,
					path: att.path,
					contentType: att.contentType,
				})),
			});
		}
	}

	onEnd(result: FullResult) {
		const totalDuration = ((Date.now() - this.stats.startTime) / 1000).toFixed(2);
		const successRate = ((this.stats.passed / (this.stats.total || 1)) * 100).toFixed(1);

		console.log(
			`\n${COLORS.bright}${ICONS.flag}  Test Run Completed | Status: ${this.getStatusColor(result.status)}${result.status.toUpperCase()}${COLORS.reset} `,
		);
		console.log(
			`${COLORS.bright}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${COLORS.reset} `,
		);
		console.log(
			`  Tests:    ${COLORS.green}${this.stats.passed} Passed${COLORS.reset} | ${COLORS.red}${this.stats.failed} Failed${COLORS.reset} | ${COLORS.yellow}${this.stats.skipped} Skipped${COLORS.reset} | ${this.stats.total} Total`,
		);
		console.log(
			`  Duration: ${COLORS.yellow}${totalDuration}s${COLORS.reset} | Success Rate: ${this.getRateColor(successRate)}${successRate}% ${COLORS.reset} `,
		);
		console.log(
			`${COLORS.bright}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${COLORS.reset} \n`,
		);

		if (this.failedTests.length > 0) {
			this.saveJiraPayload();
		} else {
			console.log(`🎉  ${COLORS.green}${COLORS.bright}PERFECT RUN! EVERYTHING PASSED.${COLORS.reset} \n`);
		}
	}

	private getStatusColor(status: string): string {
		switch (status) {
			case "passed":
				return COLORS.green;
			case "failed":
			case "timedOut":
				return COLORS.red;
			default:
				return COLORS.yellow;
		}
	}

	private getRateColor(rate: string): string {
		const r = parseFloat(rate);
		if (r > 90) return COLORS.green;
		if (r > 70) return COLORS.yellow;
		return COLORS.red;
	}

	private saveJiraPayload() {
		console.log(`${ICONS.warn}  ${COLORS.yellow}Found failures.Generating Jira - ready JSON payload...${COLORS.reset} `);

		const reportsDir = path.join(process.cwd(), "reports");
		if (!fs.existsSync(reportsDir)) {
			fs.mkdirSync(reportsDir, { recursive: true });
		}

		const payloadPath = path.join(reportsDir, "failed-tests-jira-payload.json");
		const payload = {
			runInfo: {
				timestamp: new Date().toISOString(),
				stats: this.stats,
			},
			failedTests: this.failedTests,
		};

		fs.writeFileSync(payloadPath, JSON.stringify(payload, null, 2), "utf-8");
		console.log(`${ICONS.save}  ${COLORS.cyan}Payload saved to:${COLORS.reset} ${payloadPath} \n`);
	}
}

export default CustomReporter;
