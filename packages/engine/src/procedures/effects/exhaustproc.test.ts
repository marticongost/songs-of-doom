/* eslint-disable @typescript-eslint/no-explicit-any */
import { mock } from '@songsofdoom/common/test-utils';
import { Target, type ExhaustEffect } from '@songsofdoom/game';
import { describe, expect, it } from 'vitest';
import { ComputeStep, DispatchStep } from '../../core/steps';
import type { MutableCardState } from '../../state/cardstate';
import type { MutableGameState, ReadonlyGameState } from '../../state/gamestate';
import type { CardId, EntityId } from '../../state/identifiers';
import { exhaustEffectProc, type ExhaustEffectState } from './exhaustproc';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeState(effect: ExhaustEffect, game: ReadonlyGameState): ExhaustEffectState {
	return { effect, game, status: 'ongoing' } as ExhaustEffectState;
}

function setupMutateGame(
	game: ReadonlyGameState,
	cards: Record<string, MutableCardState>
): ReadonlyGameState {
	const mutatedGame = mock<ReadonlyGameState>();
	(game as any).mutate.mockImplementation((cb: (mutable: MutableGameState) => void) => {
		const mutableGame = mock<MutableGameState>({
			requireCard: (id: string) => {
				const card = cards[id];
				if (!card) throw new Error(`Card ${id} not found`);
				return card;
			}
		} as unknown as MutableGameState);
		cb(mutableGame);
		return mutatedGame;
	});
	return mutatedGame;
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('exhaustEffectProc', () => {
	// ── resolveTarget ────────────────────────────────────────────────────

	describe('resolveTarget step', () => {
		const resolveTargetStep = exhaustEffectProc.steps
			.resolveTargets as DispatchStep<ExhaustEffectState>;

		it('passes effect.target as the target to resolve, with not(exhausted) condition', () => {
			const target = new Target('enemy');
			const effect = mock<ExhaustEffect>({ target } as unknown as ExhaustEffect);
			const game = mock<ReadonlyGameState>({
				determinePossibleTargets: () => ['card1' as EntityId],
				evaluateScalar: () => 1,
				resolveTarget: () => []
			});

			const resultStep = resolveTargetStep.factory(makeState(effect, game));
			expect(resultStep).toBeInstanceOf(ComputeStep);

			// The factory calls determinePossibleTargets with a target that includes not(exhausted)
			expect(game.determinePossibleTargets).toHaveBeenCalled();
			const calledTarget = (game.determinePossibleTargets as any).mock.calls[0][0] as Target;
			expect(calledTarget).toBeInstanceOf(Target);
			expect(calledTarget.condition).toBeDefined();
		});

		it('defaults to current-card when effect has no target', () => {
			const effect = mock<ExhaustEffect>({ target: undefined } as ExhaustEffect);
			const game = mock<ReadonlyGameState>({
				determinePossibleTargets: () => ['card1' as EntityId],
				evaluateScalar: () => 1,
				resolveTarget: () => []
			});

			const resultStep = resolveTargetStep.factory(makeState(effect, game));
			expect(resultStep).toBeInstanceOf(ComputeStep);

			const state = (resultStep as ComputeStep<ExhaustEffectState>).logic(makeState(effect, game));
			expect(state?.targetIds).toEqual(['card1']);
		});

		it('filters out already exhausted cards via satisfying(not(exhausted))', () => {
			const effect = mock<ExhaustEffect>({ target: undefined } as ExhaustEffect);
			const game = mock<ReadonlyGameState>({
				determinePossibleTargets: () => ['card1' as EntityId],
				evaluateScalar: () => 1,
				resolveTarget: () => []
			});

			const resultStep = resolveTargetStep.factory(makeState(effect, game));
			expect(resultStep).toBeInstanceOf(ComputeStep);

			// The condition should be set (not(exhausted)) to filter out exhausted cards
			const calledTarget = (game.determinePossibleTargets as any).mock.calls[0][0] as Target;
			expect(calledTarget.condition).toBeDefined();
		});

		it('saves resolved target IDs to state.targetIds', () => {
			const effect = mock<ExhaustEffect>({ target: undefined } as unknown as ExhaustEffect);
			const game = mock<ReadonlyGameState>({
				determinePossibleTargets: () => ['card1' as EntityId, 'card2' as EntityId],
				evaluateScalar: () => 3,
				resolveTarget: () => []
			});
			const state = makeState(effect, game);

			const resultStep = resolveTargetStep.factory(state);
			expect(resultStep).toBeInstanceOf(ComputeStep);

			const result = (resultStep as ComputeStep<ExhaustEffectState>).logic(state);
			expect(result?.targetIds).toEqual(['card1', 'card2']);
		});

		it('defaults to empty array when no targets are resolved', () => {
			const effect = mock<ExhaustEffect>({ target: undefined } as unknown as ExhaustEffect);
			const game = mock<ReadonlyGameState>({
				determinePossibleTargets: () => [],
				evaluateScalar: () => 1,
				resolveTarget: () => []
			});
			const state = makeState(effect, game);

			const resultStep = resolveTargetStep.factory(state);
			expect(resultStep).toBeInstanceOf(ComputeStep);

			const result = (resultStep as ComputeStep<ExhaustEffectState>).logic(state);
			expect(result?.targetIds).toEqual([]);
		});
	});

	// ── exhaust ──────────────────────────────────────────────────────────

	describe('exhaust step', () => {
		const exhaustStep = exhaustEffectProc.steps.exhaust as ComputeStep<ExhaustEffectState>;

		it('exhausts cards and tracks which ones were exhausted', () => {
			const card1 = mock<MutableCardState>({ id: 'card1' as CardId, exhausted: false });
			const card2 = mock<MutableCardState>({ id: 'card2' as CardId, exhausted: false });
			const effect = mock<ExhaustEffect>();
			const game = mock<ReadonlyGameState>();

			const mutatedGame = setupMutateGame(game, { card1, card2 });

			const state = makeState(effect, game);
			state.targetIds = ['card1', 'card2'] as unknown as CardId[];

			const result = exhaustStep.logic(state);

			expect(card1.exhausted).toBe(true);
			expect(card2.exhausted).toBe(true);
			expect(result!.exhaustedCardIds).toEqual(['card1', 'card2']);
			expect(result!.game).toBe(mutatedGame);
		});

		it('skips cards that are already exhausted', () => {
			const card1 = mock<MutableCardState>({ id: 'card1' as CardId, exhausted: false });
			const card2 = mock<MutableCardState>({ id: 'card2' as CardId, exhausted: true });
			const effect = mock<ExhaustEffect>();
			const game = mock<ReadonlyGameState>();

			const mutatedGame = setupMutateGame(game, { card1, card2 });

			const state = makeState(effect, game);
			state.targetIds = ['card1', 'card2'] as unknown as CardId[];

			const result = exhaustStep.logic(state);

			// card1 was fresh → exhausted
			expect(card1.exhausted).toBe(true);
			// card2 was already exhausted → skipped, not in exhaustedCardIds
			expect(result!.exhaustedCardIds).toEqual(['card1']);
			expect(result!.game).toBe(mutatedGame);
		});

		it('handles empty targetIds gracefully', () => {
			const effect = mock<ExhaustEffect>();
			const game = mock<ReadonlyGameState>();
			const mutatedGame = mock<ReadonlyGameState>();

			game.mutate.mockImplementation((cb: (mutable: MutableGameState) => void) => {
				cb(mock<MutableGameState>({} as unknown as MutableGameState));
				return mutatedGame;
			});

			const state = makeState(effect, game);
			state.targetIds = [];

			const result = exhaustStep.logic(state);

			expect(result!.exhaustedCardIds).toEqual([]);
			expect(result!.game).toBe(mutatedGame);
		});
	});
});
