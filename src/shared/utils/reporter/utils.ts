import * as path from "path";

const noColor = "NO_COLOR" in process.env || process.env.TERM === "dumb";

export const COLORS = noColor
    ? {
        reset: "",
        bright: "",
        dim: "",
        purple: "",
        cyan: "",
        green: "",
        red: "",
        yellow: "",
        blue: "",
        magenta: "",
        grey: "",
    }
    : {
        reset: "\x1b[0m",
        bright: "\x1b[1m",
        dim: "\x1b[2m",
        purple: "\x1b[38;5;141m",
        cyan: "\x1b[38;5;81m",
        green: "\x1b[38;5;114m",
        red: "\x1b[38;5;203m",
        yellow: "\x1b[38;5;221m",
        blue: "\x1b[38;5;111m",
        magenta: "\x1b[38;5;176m",
        grey: "\x1b[38;5;244m",
    };

export const ICONS = {
    play: "▸",
    check: "✔",
    cross: "✘",
    skip: "↷",
    warn: "‼",
    rocket: "◆",
    flag: "■",
    save: "💾",
    step: "›",
    link: "↗",
};

export interface FailedTestMetadata {
    title: string;
    project: string;
    duration: number;
    error?: string;
    location: string;
    attachments: Array<{ name: string; path?: string; contentType: string }>;
}

export interface ReporterStats {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    startTime: number;
    completed: number;
}

export const terminalLink = (text: string, filePath: string) => {
    const url = `file://${path.resolve(filePath)}`;
    const supportsHyperlinks =
        process.stdout.isTTY && !process.env.CI && process.env.TERM_PROGRAM !== "Apple_Terminal";

    if (supportsHyperlinks) {
        return `\u001b]8;;${url}\u001b\\${text}\u001b]8;;\u001b\\`;
    }
    return `${text} (${url})`;
};
