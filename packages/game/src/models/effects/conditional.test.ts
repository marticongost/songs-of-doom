import { mock } from '@songsofdoom/common/test-utils';
import { describe, expect, it } from 'vitest';
import type { BooleanExpression } from '../expressions';
import { conditional } from './conditional';
import type { Effect } from './effect';

describe('ConditionalEffect construction', () => {
	it('conditional(cases) creates a ConditionalEffect with no default', () => {
		const condition = mock<BooleanExpression>();
		const effect = conditional([{ condition, effects: [] }]);
		expect(effect.cases).toHaveLength(1);
		expect(effect.default).toBeUndefined();
	});

	it('conditional(cases, defaultEffects) sets the default effects', () => {
		const condition = mock<BooleanExpression>();
		const defaultEffect = mock<Effect>();
		const effect = conditional([{ condition, effects: [] }], [defaultEffect]);
		expect(effect.default).toEqual([defaultEffect]);
	});

	it('conditional(props) accepts ConditionalEffectProps', () => {
		const condition = mock<BooleanExpression>();
		const defaultEffect = mock<Effect>();
		const effect = conditional({ cases: [{ condition, effects: [] }], default: [defaultEffect] });
		expect(effect.cases).toHaveLength(1);
		expect(effect.default).toEqual([defaultEffect]);
	});
});

describe('ConditionalEffect.elseIf', () => {
	it('returns a new ConditionalEffect with the added case appended', () => {
		const condition1 = mock<BooleanExpression>();
		const condition2 = mock<BooleanExpression>();
		const effect2 = mock<Effect>();
		const original = conditional([{ condition: condition1, effects: [] }]);

		const result = original.elseIf(condition2, effect2);

		expect(result).not.toBe(original);
		expect(result.cases).toHaveLength(2);
		expect(result.cases[1]).toEqual({ condition: condition2, effects: [effect2] });
	});

	it('preserves the existing default', () => {
		const condition = mock<BooleanExpression>();
		const defaultEffect = mock<Effect>();
		const original = conditional([{ condition, effects: [] }], [defaultEffect]);

		const result = original.elseIf(mock<BooleanExpression>(), mock<Effect>());

		expect(result.default).toEqual([defaultEffect]);
	});
});

describe('ConditionalEffect.orElse', () => {
	it('returns a new ConditionalEffect with the given default effects', () => {
		const condition = mock<BooleanExpression>();
		const defaultEffect = mock<Effect>();
		const original = conditional([{ condition, effects: [] }]);

		const result = original.orElse(defaultEffect);

		expect(result.default).toEqual([defaultEffect]);
	});

	it('appends to existing default effects', () => {
		const condition = mock<BooleanExpression>();
		const effect1 = mock<Effect>();
		const effect2 = mock<Effect>();
		const original = conditional([{ condition, effects: [] }], [effect1]);

		const result = original.orElse(effect2);

		expect(result.default).toEqual([effect1, effect2]);
	});
});
