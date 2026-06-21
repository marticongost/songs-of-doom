/* eslint-disable @typescript-eslint/no-explicit-any */
import { mock } from '@songsofdoom/common/test-utils';
import type { AddChargesEffect } from '@songsofdoom/game';
import { describe, expect, it } from 'vitest';
import { ComputeStep, DispatchStep } from '../../core/steps';
import type { MutableCardState } from '../../state/cardstate';
import type { MutableGameState, ReadonlyGameState } from '../../state/gamestate';
import type { CardId, EntityId } from '../../state/identifiers';
import { addChargesEffectProc, type AddChargesEffectState } from './addchargesproc';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeState(effect: AddChargesEffect, game: ReadonlyGameState): AddChargesEffectState {
	return { effect, game, status: 'ongoing' } as AddChargesEffectState;
}

function setupMutateGame(
	game: ReadonlyGameState,
	cards: Record<string, MutableCardState>,
	mutatedGame?: ReadonlyGameState
): ReadonlyGameState {
	const resultGame = mutatedGame ?? mock<ReadonlyGameState>();
	(game as any).mutate.mockImplementation((cb: (mutable: MutableGameState) => void) => {
		const mutableGame = mock<MutableGameState>({
			requireCard: (id: string) => {
				const card = cards[id];
				if (!card) throw new Error(`Card ${id} not found`);
				return card;
			}
		} as unknown as MutableGameState);
		cb(mutableGame);
		return resultGame;
	});
	return resultGame;
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('addChargesEffectProc', () => {
	// ── resolveTargets ────────────────────────────────────────────────────

	describe('resolveTargets step', () => {
		const resolveTargetsStep = addChargesEffectProc.steps
			.resolveTargets as DispatchStep<AddChargesEffectState>;

		it('defaults to current-card when effect has no target', () => {
			const effect = mock<AddChargesEffect>({ target: undefined } as unknown as AddChargesEffect);
			const game = mock<ReadonlyGameState>({
				determinePossibleTargets: () => ['card1'] as unknown as EntityId[],
				evaluateScalar: () => 1,
				resolveTarget: () => []
			});

			const resultStep = resolveTargetsStep.factory(makeState(effect, game));
			expect(resultStep).toBeInstanceOf(ComputeStep);

			const state = makeState(effect, game);
			const result = (resultStep as ComputeStep<AddChargesEffectState>).logic(state);
			expect(result?.targetIds).toEqual(['card1'] as unknown as CardId[]);
		});

		it('saves resolved target IDs to state.targetIds', () => {
			const effect = mock<AddChargesEffect>({ target: undefined } as unknown as AddChargesEffect);
			const game = mock<ReadonlyGameState>({
				determinePossibleTargets: () => ['card1', 'card2'] as unknown as EntityId[],
				evaluateScalar: () => 2,
				resolveTarget: () => []
			});

			const resultStep = resolveTargetsStep.factory(makeState(effect, game));
			expect(resultStep).toBeInstanceOf(ComputeStep);

			const state = makeState(effect, game);
			const result = (resultStep as ComputeStep<AddChargesEffectState>).logic(state);
			expect(result?.targetIds).toEqual(['card1', 'card2'] as unknown as CardId[]);
		});

		it('saves empty array when no targets are resolved', () => {
			const effect = mock<AddChargesEffect>({ target: undefined } as unknown as AddChargesEffect);
			const game = mock<ReadonlyGameState>({
				determinePossibleTargets: () => [] as unknown as EntityId[],
				evaluateScalar: () => 1,
				resolveTarget: () => []
			});

			const resultStep = resolveTargetsStep.factory(makeState(effect, game));
			expect(resultStep).toBeInstanceOf(ComputeStep);

			const state = makeState(effect, game);
			const result = (resultStep as ComputeStep<AddChargesEffectState>).logic(state);
			expect(result?.targetIds).toEqual([]);
		});
	});

	// ── addCharges ────────────────────────────────────────────────────────

	describe('addCharges step', () => {
		const addChargesStep = addChargesEffectProc.steps
			.addCharges as ComputeStep<AddChargesEffectState>;

		it('adds charges to a card up to maxCharges', () => {
			const card = mock<MutableCardState>({
				id: 'card1' as CardId,
				charges: 1,
				card: { maxCharges: 3 } as any
			});
			const effect = mock<AddChargesEffect>({ amount: 2 } as unknown as AddChargesEffect);
			const game = mock<ReadonlyGameState>({
				evaluateScalar: () => 2
			});
			(game as any).mutate.mockImplementation((cb: (mutable: MutableGameState) => void) => {
				const mutableGame = mock<MutableGameState>({
					requireCard: () => card
				} as unknown as MutableGameState);
				cb(mutableGame);
				return game;
			});

			const state = makeState(effect, game);
			state.targetIds = ['card1'] as unknown as CardId[];

			const result = addChargesStep.logic(state);

			expect(game.evaluateScalar).toHaveBeenCalledWith(2);
			expect(card.charges).toBe(3); // 1 + min(2, 2) = 3
			expect(result!.addedCharges!.get('card1' as CardId)).toBe(2);
		});

		it('caps added charges at maxCharges', () => {
			const card = mock<MutableCardState>({
				id: 'card1' as CardId,
				charges: 2,
				card: { maxCharges: 3 } as any
			});
			const effect = mock<AddChargesEffect>({ amount: 5 } as unknown as AddChargesEffect);
			const game = mock<ReadonlyGameState>({
				evaluateScalar: () => 5
			});

			(game as any).mutate.mockImplementation((cb: (mutable: MutableGameState) => void) => {
				const mutableGame = mock<MutableGameState>({
					requireCard: () => card
				} as unknown as MutableGameState);
				cb(mutableGame);
				return game;
			});

			const state = makeState(effect, game);
			state.targetIds = ['card1'] as unknown as CardId[];

			const result = addChargesStep.logic(state);

			expect(card.charges).toBe(3); // capped at maxCharges
			expect(result!.addedCharges!.get('card1' as CardId)).toBe(1); // only 1 charge could be added
		});

		it('recharges fully when amount is "max"', () => {
			const card = mock<MutableCardState>({
				id: 'card1' as CardId,
				charges: 0,
				card: { maxCharges: 3 } as any
			});
			const effect = mock<AddChargesEffect>({ amount: 'max' } as unknown as AddChargesEffect);
			const game = mock<ReadonlyGameState>();

			(game as any).mutate.mockImplementation((cb: (mutable: MutableGameState) => void) => {
				const mutableGame = mock<MutableGameState>({
					requireCard: () => card
				} as unknown as MutableGameState);
				cb(mutableGame);
				return game;
			});

			const state = makeState(effect, game);
			state.targetIds = ['card1'] as unknown as CardId[];

			const result = addChargesStep.logic(state);

			expect(card.charges).toBe(3); // fully recharged
			expect(result!.addedCharges!.get('card1' as CardId)).toBe(3);
		});

		it('adds zero charges when card is already at maxCharges', () => {
			const card = mock<MutableCardState>({
				id: 'card1' as CardId,
				charges: 3,
				card: { maxCharges: 3 } as any
			});
			const effect = mock<AddChargesEffect>({ amount: 2 } as unknown as AddChargesEffect);
			const game = mock<ReadonlyGameState>({
				evaluateScalar: () => 2
			});

			(game as any).mutate.mockImplementation((cb: (mutable: MutableGameState) => void) => {
				const mutableGame = mock<MutableGameState>({
					requireCard: () => card
				} as unknown as MutableGameState);
				cb(mutableGame);
				return game;
			});

			const state = makeState(effect, game);
			state.targetIds = ['card1'] as unknown as CardId[];

			const result = addChargesStep.logic(state);

			expect(card.charges).toBe(3); // unchanged
			expect(result!.addedCharges!.get('card1' as CardId)).toBe(0);
		});

		it('adds charges to multiple cards', () => {
			const card1 = mock<MutableCardState>({
				id: 'card1' as CardId,
				charges: 1,
				card: { maxCharges: 3 } as any
			});
			const card2 = mock<MutableCardState>({
				id: 'card2' as CardId,
				charges: 0,
				card: { maxCharges: 2 } as any
			});
			const effect = mock<AddChargesEffect>({ amount: 2 } as unknown as AddChargesEffect);
			const game = mock<ReadonlyGameState>({
				evaluateScalar: () => 2
			});

			setupMutateGame(game, { card1, card2 });

			const state = makeState(effect, game);
			state.targetIds = ['card1', 'card2'] as unknown as CardId[];

			const result = addChargesStep.logic(state);

			expect(card1.charges).toBe(3); // 1 + min(2, 2) = 3
			expect(card2.charges).toBe(2); // 0 + min(2, 2) = 2
			expect(result!.addedCharges!.get('card1' as CardId)).toBe(2);
			expect(result!.addedCharges!.get('card2' as CardId)).toBe(2);
		});

		it('handles empty targetIds gracefully', () => {
			const effect = mock<AddChargesEffect>({ amount: 2 } as unknown as AddChargesEffect);
			const game = mock<ReadonlyGameState>({
				evaluateScalar: () => 2
			});

			game.mutate.mockImplementation((cb: (mutable: MutableGameState) => void) => {
				cb(mock<MutableGameState>({} as unknown as MutableGameState));
				return game;
			});

			const state = makeState(effect, game);
			state.targetIds = [];

			const result = addChargesStep.logic(state);

			expect(result!.addedCharges!.isEmpty()).toBe(true);
		});

		it('evaluates scalar expressions on the game state', () => {
			const card = mock<MutableCardState>({
				id: 'card1' as CardId,
				charges: 0,
				card: { maxCharges: 5 } as any
			});
			const scalarExpr = {};
			const effect = mock<AddChargesEffect>({
				amount: scalarExpr
			} as unknown as AddChargesEffect);
			const game = mock<ReadonlyGameState>({
				evaluateScalar: () => 3
			});

			(game as any).mutate.mockImplementation((cb: (mutable: MutableGameState) => void) => {
				const mutableGame = mock<MutableGameState>({
					requireCard: () => card
				} as unknown as MutableGameState);
				cb(mutableGame);
				return game;
			});

			const state = makeState(effect, game);
			state.targetIds = ['card1'] as unknown as CardId[];

			addChargesStep.logic(state);

			expect(game.evaluateScalar).toHaveBeenCalledWith(scalarExpr);
		});
	});
});
