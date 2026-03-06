import {
    Reporter,
    FullConfig,
    Suite,
    TestCase,
    TestResult,
    FullResult,
    TestStep,
    TestError,
} from "@playwright/test/reporter";
import { TerminalStatus } from "./terminal-status";
import { ConsoleLogger } from "./console-logger";
import { PersistenceManager } from "./persistence-manager";
import { InputManager } from "./input-manager";
import { FailedTestMetadata, ReporterStats } from "./utils";

export class CustomReporter implements Reporter {
    private status = new TerminalStatus();
    private logger = new ConsoleLogger(this.status);
    private persistence = new PersistenceManager();
    private failedTests: Array<FailedTestMetadata> = [];
    private stats: ReporterStats = {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        startTime: 0,
        completed: 0,
    };
    private input = new InputManager(
        () => this.logger.toggleVerbose(),
        () => this.logger.togglePassing(),
        () => this.status.toggleVisibility(),
        () => {
            this.status.stop();
            this.input.stop();
        },
    );

    onBegin(_config: FullConfig, suite: Suite) {
        this.stats.total = suite.allTests().length;
        this.stats.startTime = Date.now();
        this.logger.logHeader(this.stats.total);
        this.status.start(`Initializing...`, this.stats.total);
        this.input.start();

        // Safety guard: ensure the terminal is restored even if the process exits unexpectedly
        process.on("exit", () => {
            this.status.stop();
        });
    }

    printsToStdio(): boolean {
        return true;
    }

    onError(error: TestError): void {
        this.status.stop();
        this.logger.logGlobalError(error);
    }

    onTestBegin(test: TestCase, result: TestResult) {
        this.status.updateWorker(result.workerIndex, test.title);
        this.status.update(`Running: ${test.title}...`, this.stats.completed);
    }

    onStepBegin(_test: TestCase, _result: TestResult, step: TestStep) {
        if (step.category === "test.step") {
            this.logger.logStep(step.title);
        }
    }

    onTestEnd(test: TestCase, result: TestResult) {
        const project = test.parent.project()?.name || "default";
        const status = result.status;
        const isRetry = test.results.length > 1;
        const isLastRetry = test.results.length === test.retries + 1;
        const isFinal = status === "passed" || status === "skipped" || isLastRetry;

        // Stats should only count unique tests for the final summary to avoid math errors (e.g. 7+2=9 while total is 8)
        if (isFinal) {
            this.stats.completed++;
            if (status === "passed") this.stats.passed++;
            else if (status === "skipped") this.stats.skipped++;
            else {
                this.stats.failed++;
                this.failedTests.push({
                    title: test.title,
                    project: project,
                    duration: result.duration,
                    error: result.error?.stack || result.error?.message || "Unknown error occurred",
                    location: `${test.location.file}:${test.location.line}`,
                    attachments: result.attachments.map((att) => ({
                        name: att.name,
                        path: att.path,
                        contentType: att.contentType,
                    })),
                });
            }
        }

        this.status.clearWorker(result.workerIndex);

        const trace = result.attachments.find((a) => a.name === "trace");

        // Log everything, but mark retries
        const logTitle = isRetry ? `${test.title} (Retry #${test.results.length - 1})` : test.title;
        this.logger.logTestResult(status, project, logTitle, result.duration, result.error?.message, trace?.path);

        // Update progress bar only on final result for a test
        if (isFinal) {
            const percentage = Math.floor((this.stats.completed / this.stats.total) * 100);
            this.status.update(
                `${this.stats.completed < this.stats.total ? `Progress: ${percentage}%` : "Finalizing reports..."}`,
                this.stats.completed,
            );
        }
    }

    onEnd(result: FullResult) {
        this.status.stop();
        this.status.setCursorStyle(2); // Steady Block on finish
        this.input.stop();
        const totalDuration = ((Date.now() - this.stats.startTime) / 1000).toFixed(2);
        this.logger.logSummary(result.status, this.stats, totalDuration);

        if (this.failedTests.length > 0) {
            this.persistence.saveJiraPayload(this.stats, this.failedTests);
        }
    }
}

export default CustomReporter;
