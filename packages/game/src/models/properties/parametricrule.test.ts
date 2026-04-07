import { describe, expect, it } from 'vitest';
import { ParametricRule } from './parametricrule';

// ─── ParametricRuleInstance.is ────────────────────────────────────────────────

describe('ParametricRuleInstance.is', () => {
	it('returns true when compared to the underlying rule', () => {
		const rule = new ParametricRule<number>({ title: { en: 'A' } });
		const instance = rule.with(3);
		expect(instance.is(rule)).toBe(true);
	});

	it('returns false when compared to a different rule', () => {
		const rule = new ParametricRule<number>({ title: { en: 'A' } });
		const other = new ParametricRule<number>({ title: { en: 'B' } });
		const instance = rule.with(3);
		expect(instance.is(other)).toBe(false);
	});

	it('returns false when compared to the instance itself', () => {
		const rule = new ParametricRule<number>({ title: { en: 'A' } });
		const instance = rule.with(3);
		expect(instance.is(instance)).toBe(false);
	});
});
