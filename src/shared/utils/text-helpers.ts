export function normalizeText(text: string): string {
    return text.toLowerCase().replace(/\s+/g, " ").trim();
}

export function formatPriceString(raw: string): string {
    return raw.replace(/,00/g, "").trim();
}

/**
 * Parses a Turkish formatted price string (e.g., "1.250,50 TL" or "500,00") into a JavaScript number.
 * Handles thousands separator (.) and decimal comma (,).
 */
export function parseTurkishPrice(raw: string): number {
    if (!raw) return 0;
    // Remove currency, thousands separator, and replace decimal comma with point
    const cleaned = raw
        .replace(/[^\d,]/g, "") // Keep only digits and decimal comma
        .replace(/,/g, "."); // Replace comma with point for parseFloat
    return parseFloat(cleaned) || 0;
}
