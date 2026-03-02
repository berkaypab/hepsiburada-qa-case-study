export function normalizeText(text: string): string {
	return text.toLowerCase().replace(/\s+/g, " ").trim();
}

export function formatPriceString(raw: string): string {
	return raw.replace(/,00/g, "").trim();
}
