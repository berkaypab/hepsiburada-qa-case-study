export enum TAGS {
    REGRESSION = "@regression",
    SMOKE = "@smoke",
    CUSTOMER = "@customer",
}

export const TIMEOUTS = {
    SMALL: 1000,
    MEDIUM: 2000,
    LARGE: 10000,
    XLARGE: 20000,
    XXLARGE: 30000,
};

export const REPORT_CONFIG = {
    DIR: "reports",
    JIRA_PAYLOAD_FILE: "failed-tests-jira-payload.json",
};
