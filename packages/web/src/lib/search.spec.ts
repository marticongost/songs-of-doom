import { describe, it, expect } from 'vitest';
import { normalizeForSearch, matchesAllTerms, parseSearchQuery, filterByTitle } from './search';

describe('normalizeForSearch', () => {
	it('converts to lowercase', () => {
		expect(normalizeForSearch('Hello World')).toBe('hello world');
	});

	it('removes accents from Spanish/Catalan characters', () => {
		expect(normalizeForSearch('acción')).toBe('accion');
		expect(normalizeForSearch('experiència')).toBe('experiencia');
		expect(normalizeForSearch('niño')).toBe('nino');
	});

	it('handles combined accents and case', () => {
		expect(normalizeForSearch('Experiència')).toBe('experiencia');
		expect(normalizeForSearch('ACCIÓN')).toBe('accion');
	});
});

describe('parseSearchQuery', () => {
	it('returns empty array for empty input', () => {
		expect(parseSearchQuery('')).toEqual([]);
		expect(parseSearchQuery('   ')).toEqual([]);
	});

	it('splits on whitespace and normalizes', () => {
		expect(parseSearchQuery('Hello World')).toEqual(['hello', 'world']);
	});

	it('handles multiple spaces', () => {
		expect(parseSearchQuery('one   two    three')).toEqual(['one', 'two', 'three']);
	});

	it('normalizes accented terms', () => {
		expect(parseSearchQuery('acción rápida')).toEqual(['accion', 'rapida']);
	});
});

describe('matchesAllTerms', () => {
	it('returns true when all terms are present', () => {
		expect(matchesAllTerms('Hello wonderful world', ['hello', 'world'])).toBe(true);
	});

	it('returns false when any term is missing', () => {
		expect(matchesAllTerms('Hello world', ['hello', 'missing'])).toBe(false);
	});

	it('matches regardless of order', () => {
		expect(matchesAllTerms('world hello', ['hello', 'world'])).toBe(true);
	});

	it('handles accent-normalized matching', () => {
		expect(matchesAllTerms('Experiència de combat', ['experiencia'])).toBe(true);
	});

	it('returns true for empty terms array', () => {
		expect(matchesAllTerms('anything', [])).toBe(true);
	});
});

describe('filterByTitle', () => {
	const items = [
		{ title: { ca: 'Guerrer', es: 'Guerrero', en: 'Warrior' } },
		{ title: { ca: 'Màgia arcana', es: 'Magia arcana', en: 'Arcane magic' } },
		{ title: { ca: 'Acció ràpida', es: 'Acción rápida', en: 'Quick action' } }
	];

	it('returns all items for empty query', () => {
		expect(filterByTitle(items, '', 'ca')).toEqual(items);
	});

	it('filters by single term', () => {
		const result = filterByTitle(items, 'guerrer', 'ca');
		expect(result).toHaveLength(1);
		expect(result[0].title.ca).toBe('Guerrer');
	});

	it('matches with accent-insensitive search', () => {
		const result = filterByTitle(items, 'accio', 'ca');
		expect(result).toHaveLength(1);
		expect(result[0].title.ca).toBe('Acció ràpida');
	});

	it('filters by multiple terms (all must match)', () => {
		const result = filterByTitle(items, 'magia arcana', 'ca');
		expect(result).toHaveLength(1);
		expect(result[0].title.ca).toBe('Màgia arcana');
	});

	it('respects locale', () => {
		const result = filterByTitle(items, 'warrior', 'en');
		expect(result).toHaveLength(1);
		expect(result[0].title.en).toBe('Warrior');
	});
});
