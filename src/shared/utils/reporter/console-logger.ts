import { COLORS, ICONS, terminalLink, ReporterStats } from "./utils";
import { TerminalStatus } from "./terminal-status";
import { TestError } from "@playwright/test/reporter";

export class ConsoleLogger {
    private isTerminal = process.stdout.isTTY;
    public isVerbose = false;
    public showPassing = true;

    constructor(private status: TerminalStatus) { }

    public toggleVerbose() {
        this.isVerbose = !this.isVerbose;
        this.write(
            `${COLORS.purple}${ICONS.warn}  Verbose Mode: ${this.isVerbose ? "ENABLED" : "DISABLED"}${COLORS.reset}`,
        );
    }

    public togglePassing() {
        this.showPassing = !this.showPassing;
        this.write(
            `${COLORS.purple}${ICONS.warn}  Only showing failures: ${!this.showPassing ? "YES" : "NO"}${COLORS.reset}`,
        );
    }

    private write(message: string) {
        this.status.pause();
        console.log(message);
        this.status.resume();
    }

    logHeader(total: number) {
        const header =
            `\n${COLORS.purple}${COLORS.bright}${ICONS.rocket}  TEST SUITE STARTING${COLORS.reset} ${COLORS.dim}— ${total} tests found${COLORS.reset}\n` +
            `${COLORS.grey}   Env: ${this.isTerminal ? "Local (TTY)" : "CI (Non-TTY)"}${COLORS.reset}\n`;
        this.write(header);
    }

    logGlobalError(error: TestError) {
        const msg =
            `\n${COLORS.red}${ICONS.cross}  GLOBAL ERROR ENCOUNTERED:${COLORS.reset}\n` +
            `   ${COLORS.red}${error.message || error.value}${COLORS.reset}\n`;
        this.write(msg);
    }

    logStep(title: string) {
        if (this.isTerminal && this.isVerbose) {
            const indent = " ".repeat(title.split(">").length * 2);
            this.write(`${indent}${COLORS.cyan}${ICONS.step} ${COLORS.dim}Step:${COLORS.reset} ${title} `);
        }
    }

    logTestResult(
        status: string,
        project: string,
        title: string,
        duration: number,
        error?: string,
        tracePath?: string,
    ) {
        if (status === "passed" && !this.showPassing) return;

        const durationStr = `${duration}ms`;
        const projectTag = `[${project}]`.padEnd(10);
        let msg = "";

        if (status === "passed") {
            msg = `${COLORS.green}${ICONS.check} PASS ${COLORS.reset} ${COLORS.dim}${projectTag}${COLORS.reset} ${title} ${COLORS.dim}(${durationStr})${COLORS.reset}`;
        } else if (status === "skipped") {
            msg = `${COLORS.yellow}${ICONS.skip} SKIP ${COLORS.reset} ${COLORS.dim}${projectTag}${COLORS.reset} ${title}`;
        } else {
            msg = `${COLORS.red}${ICONS.cross} FAIL ${COLORS.reset} ${COLORS.dim}${projectTag}${COLORS.reset} ${COLORS.bright}${title}${COLORS.reset} ${COLORS.dim}(${durationStr})${COLORS.reset}`;
            if (error) {
                const errorLines = error.split("\n");
                msg += `\n   ${COLORS.red}│${COLORS.reset} ${COLORS.dim}Error:${COLORS.reset} ${errorLines[0]}`;
                if (errorLines.length > 1) {
                    msg += `\n   ${COLORS.red}│${COLORS.reset} ${COLORS.dim}${errorLines[1].trim()}${COLORS.reset}`;
                }
            }
            if (tracePath) {
                msg += `\n   ${COLORS.red}│${COLORS.reset} ${COLORS.dim}${ICONS.link} Trace:${COLORS.reset} ${terminalLink("Open Trace Viewer", tracePath)}`;
            }
        }
        this.write(msg);
    }

    logSummary(status: string, stats: ReporterStats, duration: string) {
        const successRate = ((stats.passed / (stats.total || 1)) * 100).toFixed(1);
        const statusColor =
            status === "passed"
                ? COLORS.green
                : status === "failed" || status === "timedOut"
                    ? COLORS.red
                    : COLORS.yellow;
        const rateColor =
            parseFloat(successRate) > 90 ? COLORS.green : parseFloat(successRate) > 70 ? COLORS.yellow : COLORS.red;

        const border = `${COLORS.grey}──────────────────────────────────────────────────────────────────────${COLORS.reset}`;

        let summary =
            `\n${border}\n` +
            ` ${COLORS.bright}${ICONS.flag}  RUN COMPLETED  ${COLORS.reset}${COLORS.grey}│${COLORS.reset} Status: ${statusColor}${status.toUpperCase()}${COLORS.reset}\n` +
            `${border}\n` +
            `  ${COLORS.green}${stats.passed} Passed${COLORS.reset}  ${COLORS.grey}│${COLORS.reset}  ${COLORS.red}${stats.failed} Failed${COLORS.reset}  ${COLORS.grey}│${COLORS.reset}  ${COLORS.yellow}${stats.skipped} Skipped${COLORS.reset}  ${COLORS.grey}│${COLORS.reset}  ${stats.total} Total\n` +
            `  Duration: ${COLORS.blue}${duration}s${COLORS.reset}  ${COLORS.grey}│${COLORS.reset}  Success Rate: ${rateColor}${successRate}%${COLORS.reset}\n`;

        if (stats.failed === 0) {
            summary += ` ${COLORS.green}${ICONS.check}${COLORS.reset}  ${COLORS.green}${COLORS.bright}ALL VERIFICATIONS COMPLETED SUCCESSFULLY${COLORS.reset}\n`;
        }

        summary += `\n ${COLORS.dim}To open last HTML report run:${COLORS.reset}\n`;
        summary += ` ${COLORS.cyan}npx playwright show-report reports/playwright-report${COLORS.reset}\n`;

        this.write(summary);
    }
}
