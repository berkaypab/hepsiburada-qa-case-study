import * as fs from "fs";
import * as path from "path";
import { REPORT_CONFIG } from "../configuration";
import { COLORS, ICONS, terminalLink, FailedTestMetadata, ReporterStats } from "./utils";

export class PersistenceManager {
    saveJiraPayload(stats: ReporterStats, failedTests: FailedTestMetadata[]) {
        const reportsDir = path.join(process.cwd(), REPORT_CONFIG.DIR);
        if (!fs.existsSync(reportsDir)) {
            fs.mkdirSync(reportsDir, { recursive: true });
        }

        const payloadPath = path.join(reportsDir, REPORT_CONFIG.JIRA_PAYLOAD_FILE);
        const payload = {
            runInfo: { timestamp: new Date().toISOString(), stats },
            failedTests,
        };

        fs.writeFileSync(payloadPath, JSON.stringify(payload, null, 2), "utf-8");
        console.log(
            `${ICONS.warn}  ${COLORS.yellow}Found failures. Payload saved to:${COLORS.reset} ${terminalLink(payloadPath, payloadPath)} \n`,
        );
    }
}
