import { mock } from '@songsofdoom/common/test-utils';
import { Target, type ExhaustEffect } from '@songsofdoom/game';
import { describe, expect, it } from 'vitest';
import { CallStep, ComputeStep } from '../../core/steps';
import type { MutableCardState } from '../../state/cardstate';
import type { MutableGameState, ReadonlyGameState } from '../../state/gamestate';
import type { CardId } from '../../state/identifiers';
import type { ResolveTargetState } from '../core/resolvetarget';
import { exhaustEffectProc, type ExhaustEffectState } from './exhaustproc';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeState(effect: ExhaustEffect, game: ReadonlyGameState): ExhaustEffectState {
	return { effect, game, status: 'ongoing' } as ExhaustEffectState;
}

function setupMutateGame(game: ReadonlyGameState, cards: Record<string, MutableCardState>): void {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	(game as any).mutate.mockImplementation((cb: (mutable: MutableGameState) => void) => {
		const mutableGame = mock<MutableGameState>({
			requireCard: (id: string) => {
				const card = cards[id];
				if (!card) throw new Error(`Card ${id} not found`);
				return card;
			}
		} as unknown as MutableGameState);
		cb(mutableGame);
		return game;
	});
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('exhaustEffectProc', () => {
	// ── resolveTarget ────────────────────────────────────────────────────

	describe('resolveTarget step', () => {
		const resolveTargetStep = exhaustEffectProc.steps.resolveTargets as CallStep<
			ExhaustEffectState,
			ResolveTargetState
		>;

		it('passes effect.target as the target to resolve, with not(exhausted) condition', () => {
			const target = new Target('enemy');
			const effect = mock<ExhaustEffect>({ target } as unknown as ExhaustEffect);
			const game = mock<ReadonlyGameState>();

			const params = resolveTargetStep.parameters(makeState(effect, game));

			// The target retains the original type but gains a not(exhausted) condition
			expect(params.target).toBeInstanceOf(Target);
			expect((params.target as Target).type).toEqual(new Set(['enemy']));
			expect((params.target as Target).condition).toBeDefined();
		});

		it('defaults to current-card when effect has no target', () => {
			const effect = mock<ExhaustEffect>({ target: undefined } as ExhaustEffect);
			const game = mock<ReadonlyGameState>();

			const params = resolveTargetStep.parameters(makeState(effect, game));

			expect(params.target).toBeInstanceOf(Target);
			expect((params.target as Target).type).toEqual(new Set(['current-card']));
		});

		it('filters out already exhausted cards via satisfying(not(exhausted))', () => {
			const effect = mock<ExhaustEffect>({ target: undefined } as ExhaustEffect);
			const game = mock<ReadonlyGameState>();

			const params = resolveTargetStep.parameters(makeState(effect, game));

			// The condition should be set (not(exhausted)) to filter out exhausted cards
			expect((params.target as Target).condition).toBeDefined();
		});

		it('saves resolved target IDs to state.targetIds', () => {
			const effect = mock<ExhaustEffect>();
			const game = mock<ReadonlyGameState>();
			const state = makeState(effect, game);

			const result = resolveTargetStep.then(state, {
				resolvedTargetIds: ['card1', 'card2']
			} as unknown as ResolveTargetState);

			expect(result.targetIds).toEqual(['card1', 'card2']);
		});

		it('defaults to empty array when no targets are resolved', () => {
			const effect = mock<ExhaustEffect>();
			const game = mock<ReadonlyGameState>();
			const state = makeState(effect, game);

			const result = resolveTargetStep.then(state, {} as unknown as ResolveTargetState);

			expect(result.targetIds).toEqual([]);
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

			setupMutateGame(game, { card1, card2 });

			const state = makeState(effect, game);
			state.targetIds = ['card1', 'card2'] as unknown as CardId[];

			const result = exhaustStep.logic(state);

			expect(card1.exhausted).toBe(true);
			expect(card2.exhausted).toBe(true);
			expect(result!.exhaustedCardIds).toEqual(['card1', 'card2']);
		});

		it('skips cards that are already exhausted', () => {
			const card1 = mock<MutableCardState>({ id: 'card1' as CardId, exhausted: false });
			const card2 = mock<MutableCardState>({ id: 'card2' as CardId, exhausted: true });
			const effect = mock<ExhaustEffect>();
			const game = mock<ReadonlyGameState>();

			setupMutateGame(game, { card1, card2 });

			const state = makeState(effect, game);
			state.targetIds = ['card1', 'card2'] as unknown as CardId[];

			const result = exhaustStep.logic(state);

			// card1 was fresh → exhausted
			expect(card1.exhausted).toBe(true);
			// card2 was already exhausted → skipped, not in exhaustedCardIds
			expect(result!.exhaustedCardIds).toEqual(['card1']);
		});

		it('handles empty targetIds gracefully', () => {
			const effect = mock<ExhaustEffect>();
			const game = mock<ReadonlyGameState>();

			game.mutate.mockImplementation((cb: (mutable: MutableGameState) => void) => {
				cb(mock<MutableGameState>({} as unknown as MutableGameState));
				return game;
			});

			const state = makeState(effect, game);
			state.targetIds = [];

			const result = exhaustStep.logic(state);

			expect(result!.exhaustedCardIds).toEqual([]);
		});
	});
});
