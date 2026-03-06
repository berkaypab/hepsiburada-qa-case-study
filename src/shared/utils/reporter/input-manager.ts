import { COLORS } from "./utils";

export class InputManager {
    constructor(
        private onVerbose: () => void,
        private onLogs: () => void,
        private onStatus: () => void,
        private onExit: () => void,
    ) {}

    start() {
        if (!process.stdin.isTTY) return;

        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.setEncoding("utf8");

        process.stdin.on("data", (key: string) => {
            if (key === "\u0003" || key === "q") {
                this.onExit();
                process.stdout.write(`\n${COLORS.yellow}Interrupted by user. Cleaning up...${COLORS.reset}\n`);
                process.kill(process.pid, "SIGINT");
            }

            switch (key.toLowerCase()) {
                case "v":
                    this.onVerbose();
                    break;
                case "l":
                    this.onLogs();
                    break;
                case "s":
                    this.onStatus();
                    break;
            }
        });
    }

    stop() {
        if (!process.stdin.isTTY) return;
        process.stdin.setRawMode(false);
        process.stdin.pause();
    }
}
