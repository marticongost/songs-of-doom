import { mock } from '@songsofdoom/common/test-utils';
import type { HealEffect } from '@songsofdoom/game';
import { describe, expect, it } from 'vitest';
import { CallStep, ComputeStep } from '../../core/steps';
import type { MutableGameState, ReadonlyGameState } from '../../state/gamestate';
import type { MutablePlayerState } from '../../state/playerstate';
import type { ResolveTargetState } from '../core/resolvetarget';
import { healEffectProc, type HealEffectState } from './healproc';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeState(effect: HealEffect, game: ReadonlyGameState): HealEffectState {
	return { effect, game, status: 'ongoing' } as HealEffectState;
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('healEffectProc', () => {
	const resolveTargetStep = healEffectProc.steps.resolveTarget as CallStep<
		HealEffectState,
		ResolveTargetState
	>;
	const applyHealingStep = healEffectProc.steps.applyHealing as ComputeStep<HealEffectState>;

	describe('resolveTarget step', () => {
		it('stores the resolved target ID in state.targetId', () => {
			const effect = mock<HealEffect>({ target: undefined });
			const game = mock<ReadonlyGameState>();
			const state = makeState(effect, game);
			const resolveTargetState = mock<ResolveTargetState>({ resolvedTargetIds: ['crt1'] });

			const result = resolveTargetStep.then(state, resolveTargetState);

			expect(result.targetId).toBe('crt1');
		});

		it('throws when no targets are resolved', () => {
			const effect = mock<HealEffect>({ target: undefined });
			const game = mock<ReadonlyGameState>();
			const state = makeState(effect, game);
			const resolveTargetState = mock<ResolveTargetState>({ resolvedTargetIds: [] });

			expect(() => resolveTargetStep.then(state, resolveTargetState)).toThrow(
				'Expected exactly one target'
			);
		});

		it('throws when more than one target is resolved', () => {
			const effect = mock<HealEffect>({ target: undefined });
			const game = mock<ReadonlyGameState>();
			const state = makeState(effect, game);
			const resolveTargetState = mock<ResolveTargetState>({ resolvedTargetIds: ['crt1', 'crt2'] });

			expect(() => resolveTargetStep.then(state, resolveTargetState)).toThrow(
				'Expected exactly one target'
			);
		});
	});

	describe('applyHealing step', () => {
		it('reduces physicalTrauma by the evaluated amount', () => {
			const effect = mock<HealEffect>({ amount: 3 });
			const game = mock<ReadonlyGameState>();
			const entity = mock<MutablePlayerState>({
				physicalTrauma: 5
			});

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(game as any).mutate.mockImplementation((cb: (mutable: MutableGameState) => void) => {
				const mutableGame = mock<MutableGameState>({
					evaluateScalar: () => 3
				});
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				(mutableGame as any).requireEntityState.mockImplementation((id: string) => {
					if (id === 'plr1') return entity;
					throw new Error(`Unexpected entity ID: ${id}`);
				});
				cb(mutableGame);
				return game;
			});

			const state: HealEffectState = {
				...makeState(effect, game),
				targetId: 'plr1'
			};

			applyHealingStep.logic(state);

			expect(entity.physicalTrauma).toBe(2);
		});

		it('does not reduce physicalTrauma below zero', () => {
			const effect = mock<HealEffect>({ amount: 10 });
			const game = mock<ReadonlyGameState>();
			const entity = { physicalTrauma: 5 };

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(game as any).mutate.mockImplementation((cb: (mutable: MutableGameState) => void) => {
				const mutableGame = mock<MutableGameState>({
					evaluateScalar: () => 10
				});
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				(mutableGame as any).requireEntityState.mockReturnValue(entity);
				cb(mutableGame);
				return game;
			});

			const state: HealEffectState = {
				...makeState(effect, game),
				targetId: 'crt1'
			};

			applyHealingStep.logic(state);

			expect(entity.physicalTrauma).toBe(0);
		});

		it('returns the mutated game state', () => {
			const effect = mock<HealEffect>({ amount: 2 });
			const mutatedGame = mock<ReadonlyGameState>();
			const game = mock<ReadonlyGameState>();
			game.mutate.mockReturnValue(mutatedGame);

			const state: HealEffectState = {
				...makeState(effect, game),
				targetId: 'crt1'
			};

			const result = applyHealingStep.logic(state);

			expect(result!.game).toBe(mutatedGame);
		});
	});
});
