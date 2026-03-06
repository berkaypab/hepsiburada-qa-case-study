import { COLORS, ICONS } from "./utils";

const ESC = {
    cursorShow: "\x1b[?25h",
    cursorHide: "\x1b[?25l",
    cursorSave: "\x1b[s",
    cursorRestore: "\x1b[u",
    scrollRegion: (top: number, bottom: number) => `\x1b[${top};${bottom}r`,
    scrollReset: "\x1b[r",
    moveTo: (row: number, col: number) => `\x1b[${row};${col}H`,
    clearLine: "\x1b[K",
    clearBelow: "\x1b[J",
    reverseVideo: "\x1b[7m",
    reverseVideoOff: "\x1b[27m",
};

export class TerminalStatus {
    private frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
    private interval: NodeJS.Timeout | null = null;
    private resizeHandler: (() => void) | null = null;
    private currentFrame = 0;
    private text = "";
    private progress = 0;
    private total = 0;
    private isPaused = false;
    private isHidden = false;
    private activeWorkers = new Map<number, string>();
    private footerHeight = 4; // Total height of our sticky footer

    public showCursor() {
        process.stdout.write(ESC.cursorShow);
    }
    public hideCursor() {
        process.stdout.write(ESC.cursorHide);
    }
    public setCursorStyle(style: number) {
        process.stdout.write(`\x1b[${style} q`);
    }

    start(text: string, total: number) {
        if (!process.stdout.isTTY) return;
        this.text = text;
        this.total = total;
        this.isPaused = false;
        this.hideCursor();

        this.setupScrollingRegion();

        if (this.interval) return;

        // Implementation of terminal resize handling to maintain footer position
        this.resizeHandler = () => {
            this.setupScrollingRegion();
            this.render();
        };
        process.stdout.on("resize", this.resizeHandler);

        this.interval = setInterval(() => {
            if (this.isPaused || this.isHidden) return;
            this.render();
        }, 80);
    }

    private setupScrollingRegion() {
        if (!process.stdout.isTTY) return;
        const rows = process.stdout.rows || 24;
        // Reset scrolling region first to ensure we start clean
        process.stdout.write(ESC.scrollReset);
        // Lock the top lines, leave footerHeight at bottom
        process.stdout.write(ESC.scrollRegion(1, rows - this.footerHeight));
        // Move cursor to the last allowed line in scroll region
        process.stdout.write(ESC.moveTo(rows - this.footerHeight, 1));
    }

    toggleVisibility() {
        this.isHidden = !this.isHidden;
        if (this.isHidden) {
            process.stdout.write(`\r${ESC.clearLine}`);
        } else {
            this.render();
        }
    }

    update(text: string, completed: number) {
        this.text = text;
        this.progress = Math.min(completed, this.total);
    }

    updateWorker(index: number, title: string) {
        this.activeWorkers.set(index, title);
    }

    clearWorker(index: number) {
        this.activeWorkers.delete(index);
    }

    private render() {
        if (this.isHidden) return;

        const frame = this.frames[this.currentFrame];
        const columns = process.stdout.columns || 80;
        const rows = process.stdout.rows || 24;

        // 1. Save and move to footer area
        process.stdout.write(ESC.cursorSave); // Save current cursor

        let output = "";
        // Start drawing from footer line (rows - footerHeight + 1)
        output += ESC.moveTo(rows - this.footerHeight + 1, 1);
        output += `${COLORS.grey}──────────────────────────────────────────────────────────────────────${COLORS.reset}\n`;

        // 2. Main Progress Bar line
        const percentage = Math.floor((this.progress / (this.total || 1)) * 100);
        const bar = this.generateProgressBar(20);
        const staticContentLength = 30;
        const maxTextLength = Math.max(columns - staticContentLength - 10, 10);
        const truncatedText =
            this.text.length > maxTextLength ? this.text.substring(0, maxTextLength - 3) + "..." : this.text;

        output += `${ESC.clearLine}${COLORS.cyan}${frame}${COLORS.reset} ${bar} ${COLORS.bright}${percentage}%${COLORS.reset} | ${this.progress}/${this.total} | ${COLORS.dim}${truncatedText}${COLORS.reset}\n`;

        // 3. Worker Dashboard line (collapsed to single line for space)
        output += ESC.clearLine;
        if (this.activeWorkers.size > 0) {
            const activeCount = this.activeWorkers.size;
            output += ` ${COLORS.purple}${ICONS.play} ${activeCount} Worker(s) Active: ${COLORS.dim}`;
            const workers = Array.from(this.activeWorkers.entries()).slice(0, 3);
            output += workers
                .map(([index, title]) => {
                    const shortTitle = title.length > 15 ? title.substring(0, 12) + "..." : title;
                    return `[W${index}: ${shortTitle}]`;
                })
                .join(" ");
            if (this.activeWorkers.size > 3) output += ` ...`;
            output += `${COLORS.reset}`;
        }
        output += `\n`;

        // 4. Hotkeys Legend (Claude Style)
        output += `${ESC.clearLine} ${ESC.reverseVideo} hotkeys ${ESC.reverseVideoOff} ${COLORS.dim}[v] Verbose | [l] Logs | [s] Status | [q] Quit${COLORS.reset}`;

        process.stdout.write(output);
        process.stdout.write(ESC.cursorRestore); // Restore cursor

        this.currentFrame = (this.currentFrame + 1) % this.frames.length;
    }

    private generateProgressBar(width: number): string {
        const ratio = Math.min(Math.max(this.progress / (this.total || 1), 0), 1);
        const filledLength = Math.round(ratio * width);
        const emptyLength = Math.max(width - filledLength, 0);
        return `[${COLORS.green}${"█".repeat(filledLength)}${COLORS.reset}${COLORS.dim}${"░".repeat(emptyLength)}${COLORS.reset}]`;
    }

    pause() {
        this.isPaused = true;
        // No need to clear lines as footer is absolutely positioned
    }

    resume() {
        this.isPaused = false;
        if (this.interval && !this.isPaused) this.render();
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }

        if (this.resizeHandler) {
            process.stdout.removeListener("resize", this.resizeHandler);
            this.resizeHandler = null;
        }

        // Reset Scrolling Region
        process.stdout.write(ESC.scrollReset);
        // Move to the position where footer was to clear it and stay there
        const rows = process.stdout.rows || 24;
        process.stdout.write(`${ESC.moveTo(rows - this.footerHeight + 1, 1)}${ESC.clearBelow}`);

        this.showCursor();
        this.setCursorStyle(0);
    }
}
