import { describe, expect, it } from 'vitest';
import { ParametricRule, ScalarRule } from './parametricrule';

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

// ─── ParametricRuleInstance.merge ────────────────────────────────────────────

describe('ParametricRuleInstance.merge', () => {
	it('merges params using the underlying rule', () => {
		const rule = new ParametricRule<{ a?: number; b?: string }>({ title: { en: 'A' } });
		const instance = rule.with({ a: 1 });
		const other = rule.with({ b: 'x' });

		const merged = instance.merge(other);

		expect(merged).not.toBe(instance);
		expect(merged).not.toBe(other);
		expect(merged.rule).toBe(rule);
		expect(merged.params).toEqual({ a: 1, b: 'x' });
	});

	it('throws when merging instances from different rules', () => {
		const ruleA = new ParametricRule<number>({ title: { en: 'A' } });
		const ruleB = new ParametricRule<number>({ title: { en: 'B' } });

		expect(() => ruleA.with(1).merge(ruleB.with(2))).toThrow(
			'Cannot merge rules of different types'
		);
	});
});

// ─── ScalarRule.merge ────────────────────────────────────────────────────────

describe('ScalarRule.merge', () => {
	it('adds numeric scalar values', () => {
		const rule = new ScalarRule({ title: { en: 'A' } });

		const merged = rule.with({ value: 2 }).merge(rule.with({ value: 3 }));

		expect(merged.rule).toBe(rule);
		expect(merged.params.value).toBe(5);
	});

	it('keeps additive identity when merging with zero', () => {
		const rule = new ScalarRule({ title: { en: 'A' } });

		const merged = rule.with({ value: 0 }).merge(rule.with({ value: 7 }));

		expect(merged.params.value).toBe(7);
	});
});
