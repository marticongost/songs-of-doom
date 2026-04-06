import { mock } from '@songsofdoom/common/test-utils';
import { describe, expect, it } from 'vitest';
import type { BooleanExpression, BooleanExpressionType } from '../expressions';
import type { GameGraph, GameNode } from '../game/gamegraph';
import type { ReadonlyGameState } from '../game/gamestate';
import type { Effect } from './effect';
import { ConditionalEffect, conditional } from './conditional';

// ─── ConditionalEffect construction ───────────────────────────────────────────

describe('ConditionalEffect construction', () => {
	it('conditional(cases) creates a ConditionalEffect with no default', () => {
		const condition = mock<BooleanExpression>();
		const effect = conditional([{ condition, effects: [] }]);
		expect(effect).toBeInstanceOf(ConditionalEffect);
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

// ─── ConditionalEffect.elseIf ─────────────────────────────────────────────────

describe('ConditionalEffect.elseIf', () => {
	it('returns a new ConditionalEffect with the added case appended', () => {
		const condition1 = mock<BooleanExpression>();
		const condition2 = mock<BooleanExpression>();
		const effect2 = mock<Effect>();
		const original = conditional([{ condition: condition1, effects: [] }]);

		const result = original.elseIf(condition2, effect2);

		expect(result).toBeInstanceOf(ConditionalEffect);
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

// ─── ConditionalEffect.orElse ─────────────────────────────────────────────────

describe('ConditionalEffect.orElse', () => {
	it('returns a new ConditionalEffect with the given default effects', () => {
		const condition = mock<BooleanExpression>();
		const defaultEffect = mock<Effect>();
		const original = conditional([{ condition, effects: [] }]);

		const result = original.orElse(defaultEffect);

		expect(result).toBeInstanceOf(ConditionalEffect);
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

// ─── ConditionalEffect.trigger ────────────────────────────────────────────────

function makeGraph(evaluate: (condition: BooleanExpressionType) => boolean): GameGraph {
	const state = mock<ReadonlyGameState>({ evaluate: evaluate as ReadonlyGameState['evaluate'] });
	return mock<GameGraph>({ current: mock<GameNode>({ state }) });
}

describe('ConditionalEffect.trigger', () => {
	it('triggers case effects when the condition is true', async () => {
		const condition = mock<BooleanExpression>();
		const caseEffect = mock<Effect>();
		const graph = makeGraph(() => true);

		await conditional([{ condition, effects: [caseEffect] }]).trigger(graph);

		expect(caseEffect.trigger).toHaveBeenCalledWith(graph);
	});

	it('does not trigger default effects when the condition is true', async () => {
		const condition = mock<BooleanExpression>();
		const defaultEffect = mock<Effect>();
		const graph = makeGraph(() => true);

		await conditional([{ condition, effects: [] }], [defaultEffect]).trigger(graph);

		expect(defaultEffect.trigger).not.toHaveBeenCalled();
	});

	it('triggers default effects when the condition is false', async () => {
		const condition = mock<BooleanExpression>();
		const defaultEffect = mock<Effect>();
		const graph = makeGraph(() => false);

		await conditional([{ condition, effects: [] }], [defaultEffect]).trigger(graph);

		expect(defaultEffect.trigger).toHaveBeenCalledWith(graph);
	});

	it('does not trigger anything when the condition is false and there is no default', async () => {
		const condition = mock<BooleanExpression>();
		const caseEffect = mock<Effect>();
		const graph = makeGraph(() => false);

		await conditional([{ condition, effects: [caseEffect] }]).trigger(graph);

		expect(caseEffect.trigger).not.toHaveBeenCalled();
	});

	it('evaluates each case independently', async () => {
		const conditionTrue = mock<BooleanExpression>();
		const conditionFalse = mock<BooleanExpression>();
		const trueEffect = mock<Effect>();
		const falseEffect = mock<Effect>();
		const graph = makeGraph((expr) => expr === conditionTrue);

		await conditional([
			{ condition: conditionTrue, effects: [trueEffect] },
			{ condition: conditionFalse, effects: [falseEffect] }
		]).trigger(graph);

		expect(trueEffect.trigger).toHaveBeenCalledWith(graph);
		expect(falseEffect.trigger).not.toHaveBeenCalled();
	});
});
