import { Reporter, FullConfig, Suite, TestCase, TestResult, FullResult, TestStep } from "@playwright/test/reporter";
import * as fs from "fs";
import * as path from "path";

/**
 * Custom Playwright Reporter
 * 
 * Goal:
 * 1. Log test steps in a cleaner and hierarchical way in the console.
 * 2. Collect all FAILED tests after the run and produce a clean JSON (failed-tests-jira-payload.json)
 *    that can be used for external systems (e.g., Jira Bug Tracker).
 */
class CustomReporter implements Reporter {
    private failedTests: Array<{ title: string; duration: number; error?: string; location: string }> = [];

    onBegin(_config: FullConfig, suite: Suite) {
        console.log(`\n🚀 Test Run Starting: Total ${suite.allTests().length} tests found.\n`);
    }

    onTestBegin(test: TestCase) {
        console.log(`▶ STARTED: [${test.parent.project()?.name}] > ${test.title}`);
    }

    onStepBegin(_test: TestCase, _result: TestResult, step: TestStep) {
        // Log only main 'test.step' calls (filter out internal locators, etc.)
        if (step.category === "test.step") {
            console.log(`  ↳ Step: ${step.title}`);
        }
    }

    onTestEnd(test: TestCase, result: TestResult) {
        if (result.status === "passed") {
            console.log(`✅ PASSED: [${test.parent.project()?.name}] > ${test.title} (${result.duration}ms)\n`);
        } else if (result.status === "skipped") {
            console.log(`⏭️ SKIPPED: [${test.parent.project()?.name}] > ${test.title}\n`);
        } else if (result.status === "failed" || result.status === "timedOut") {
            console.log(`❌ FAILED: [${test.parent.project()?.name}] > ${test.title} (${result.duration}ms)`);
            if (result.error?.message) {
                console.log(`   Error: ${result.error.message.split("\n")[0]}\n`); // Log the first line
            }

            // Collect failed tests as a payload
            this.failedTests.push({
                title: test.title,
                duration: result.duration,
                error: result.error?.stack || result.error?.message || "Unknown error occurred",
                location: `${test.location.file}:${test.location.line}`,
            });
        }
    }

    onEnd(result: FullResult) {
        console.log(`\n🏁 Test Run Completed. Status: ${result.status.toUpperCase()}`);

        if (this.failedTests.length > 0) {
            console.log(`\n⚠️ Found ${this.failedTests.length} failed test(s). Saving Jira payload as JSON...`);

            const reportsDir = path.join(process.cwd(), "reports");
            if (!fs.existsSync(reportsDir)) {
                fs.mkdirSync(reportsDir, { recursive: true });
            }

            const payloadPath = path.join(reportsDir, "failed-tests-jira-payload.json");
            fs.writeFileSync(payloadPath, JSON.stringify({ failedTests: this.failedTests }, null, 2), "utf-8");

            console.log(`💾 Payload successfully generated: ${payloadPath}`);
        } else {
            console.log(`🎉 Success! No failed tests found.`);
        }
    }
}

export default CustomReporter;
