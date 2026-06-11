import { mock } from '@songsofdoom/common/test-utils';
import type { ConditionalEffect, Effect } from '@songsofdoom/game';
import { describe, expect, it } from 'vitest';
import { CallStep, ForEachStep } from '../../core/steps';
import type { ReadonlyGameState } from '../../state/gamestate';
import type { EffectProcedureState } from '../core/triggereffect';
import { conditionalEffectProc, type ConditionalEffectState } from './conditionalproc';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeState(effect: ConditionalEffect, game: ReadonlyGameState): ConditionalEffectState {
	return { effect, game, status: 'ongoing' } as ConditionalEffectState;
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('conditionalEffectProc', () => {
	const forEachStep = conditionalEffectProc.steps.triggerEffects as ForEachStep<
		ConditionalEffectState,
		'currentEffect'
	>;

	// ── triggerEffects.items ──────────────────────────────────────────────

	describe('triggerEffects.items', () => {
		it('returns an empty array when there are no cases or defaults', () => {
			const effect = mock<ConditionalEffect>({ cases: [], default: undefined });
			const game = mock<ReadonlyGameState>();

			expect(forEachStep.items(makeState(effect, game))).toEqual([]);
		});

		it('returns the effects of the first matching case', () => {
			const matched = [mock<Effect>(), mock<Effect>()];
			const effect = mock<ConditionalEffect>({
				cases: [{ condition: true, effects: matched }],
				default: undefined
			});
			const game = mock<ReadonlyGameState>({
				evaluateBoolean: (_expr) => true
			});
			expect(forEachStep.items(makeState(effect, game))).toBe(matched);
		});

		it('skips non-matching cases and returns the first that matches', () => {
			const matched = [mock<Effect>()];
			const effect = mock<ConditionalEffect>({
				cases: [
					{ condition: false, effects: [mock<Effect>()] },
					{ condition: true, effects: matched }
				]
			});
			const game = mock<ReadonlyGameState>();
			game.evaluateBoolean.mockImplementation((expr) => expr === true);

			expect(forEachStep.items(makeState(effect, game))).toBe(matched);
		});

		it('falls back to default effects when no case matches', () => {
			const defaultEffects = [mock<Effect>(), mock<Effect>()];
			const effect = mock<ConditionalEffect>({
				cases: [{ condition: false, effects: [mock<Effect>()] }],
				default: defaultEffects
			});
			const game = mock<ReadonlyGameState>({ evaluateBoolean: (_expr) => false });

			expect(forEachStep.items(makeState(effect, game))).toBe(defaultEffects);
		});

		it('returns an empty array when no case matches and there is no default', () => {
			const effect = mock<ConditionalEffect>({
				cases: [{ condition: false, effects: [mock<Effect>()] }],
				default: undefined
			});
			const game = mock<ReadonlyGameState>({ evaluateBoolean: (_expr) => false });

			expect(forEachStep.items(makeState(effect, game))).toEqual([]);
		});
	});

	// ── triggerEffects body step ──────────────────────────────────────────

	describe('triggerEffects body step', () => {
		const callStep = forEachStep.steps.triggerEffect as CallStep<
			ConditionalEffectState,
			EffectProcedureState
		>;

		it('passes currentEffect as the effect parameter', () => {
			const effect = mock<Effect>();
			const state = makeState(mock<ConditionalEffect>(), mock<ReadonlyGameState>());
			state.currentEffect = effect;

			const params = callStep.parameters(state);
			expect(params.effect).toBe(effect);
		});
	});
});
