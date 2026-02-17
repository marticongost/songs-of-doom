import {
	requireLocalisedField,
	type Locale,
	type LocalisedText
} from '@songsofdoom/common/localisation';

/**
 * Normalizes text for search comparison by:
 * 1. Converting to lowercase
 * 2. Removing diacritical marks (accents)
 */
export function normalizeForSearch(text: string): string {
	return text
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '');
}

/**
 * Parses a search query into normalized terms.
 * Splits on whitespace and normalizes each term.
 */
export function parseSearchQuery(query: string): string[] {
	const trimmed = query.trim();
	if (!trimmed) return [];
	return trimmed.split(/\s+/).map(normalizeForSearch);
}

/**
 * Checks if all search terms are present in the target text.
 * Terms can appear in any order.
 */
export function matchesAllTerms(target: string, terms: string[]): boolean {
	const normalizedTarget = normalizeForSearch(target);
	return terms.every((term) => normalizedTarget.includes(term));
}

/**
 * Filters items by matching their localized title against search terms.
 */
export function filterByTitle<T extends { title: LocalisedText }>(
	items: T[],
	query: string,
	locale: Locale
): T[] {
	const terms = parseSearchQuery(query);
	if (terms.length === 0) return items;

	return items.filter((item) => {
		const title = requireLocalisedField(item, 'title', locale);
		return matchesAllTerms(title, terms);
	});
}
