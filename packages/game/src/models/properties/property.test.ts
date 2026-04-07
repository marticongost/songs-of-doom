import { describe, expect, it } from 'vitest';
import { Rule } from './rule';

// ─── Property.is ──────────────────────────────────────────────────────────────

describe('Property.is', () => {
	it('returns true when compared to itself', () => {
		const property = new Rule({ title: { en: 'A' } });
		expect(property.is(property)).toBe(true);
	});

	it('returns false when compared to a different property', () => {
		const a = new Rule({ title: { en: 'A' } });
		const b = new Rule({ title: { en: 'B' } });
		expect(a.is(b)).toBe(false);
	});
});
