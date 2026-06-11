import { mock } from '@songsofdoom/common/test-utils';
import { Target, type DiscardFromHandEffect } from '@songsofdoom/game';
import { describe, expect, it } from 'vitest';
import { CallStep, ComputeStep, ForEachStep } from '../../core/steps';
import type { MutableCardState } from '../../state/cardstate';
import type { MutableGameState, ReadonlyGameState } from '../../state/gamestate';
import type { ResolveTargetState } from '../core/resolvetarget';
import { discardFromHandEffectProc, type DiscardFromHandEffectState } from './discardfromhandproc';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeState(
	effect: DiscardFromHandEffect,
	game: ReadonlyGameState
): DiscardFromHandEffectState {
	return { effect, game, status: 'ongoing' } as DiscardFromHandEffectState;
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('discardFromHandEffectProc', () => {
	// ── resolvePlayers ────────────────────────────────────────────────────

	describe('resolvePlayers step', () => {
		const resolvePlayersStep = discardFromHandEffectProc.steps.resolvePlayers as CallStep<
			DiscardFromHandEffectState,
			ResolveTargetState
		>;

		it('passes effect.players as the target when defined', () => {
			const playersTarget = new Target('player');
			const effect = mock<DiscardFromHandEffect>({ players: playersTarget });
			const game = mock<ReadonlyGameState>();

			const params = resolvePlayersStep.parameters(makeState(effect, game));

			expect(params.target).toBe(playersTarget);
		});

		it('defaults to active-player when players is undefined', () => {
			const effect = mock<DiscardFromHandEffect>({ players: undefined });
			const game = mock<ReadonlyGameState>();

			const params = resolvePlayersStep.parameters(makeState(effect, game));

			expect(params.target).toBeInstanceOf(Target);
		});

		it('saves resolvedTargetIds to state.playerIds, defaulting to empty array', () => {
			const effect = mock<DiscardFromHandEffect>();
			const game = mock<ReadonlyGameState>();
			const state = makeState(effect, game);

			const withIds = resolvePlayersStep.then(state, {
				resolvedTargetIds: ['plr1', 'plr2']
			} as unknown as ResolveTargetState);
			expect(withIds.playerIds).toEqual(['plr1', 'plr2']);

			const withoutIds = resolvePlayersStep.then(state, {} as unknown as ResolveTargetState);
			expect(withoutIds.playerIds).toEqual([]);
		});
	});

	// ── processPlayers ────────────────────────────────────────────────────

	describe('processPlayers forEach step', () => {
		const forEachStep = discardFromHandEffectProc.steps.processPlayers as ForEachStep<
			DiscardFromHandEffectState,
			'playerId'
		>;

		describe('items', () => {
			it('returns state.playerIds', () => {
				const effect = mock<DiscardFromHandEffect>();
				const game = mock<ReadonlyGameState>();
				const state = makeState(effect, game);
				state.playerIds = ['plr1', 'plr2'];

				expect(forEachStep.items(state)).toEqual(['plr1', 'plr2']);
			});
		});

		// ── chooseCards body step ─────────────────────────────────────────

		describe('chooseCards resolve target step', () => {
			const chooseCardsStep = forEachStep.steps.chooseCards as CallStep<
				DiscardFromHandEffectState,
				ResolveTargetState
			>;

			it('passes effect.cards as the target', () => {
				const cardsTarget = new Target('skill');
				const effect = mock<DiscardFromHandEffect>({ cards: cardsTarget });
				const game = mock<ReadonlyGameState>();

				const params = chooseCardsStep.parameters(makeState(effect, game));

				expect(params.target).toBe(cardsTarget);
			});

			it('saves resolvedTargetIds to state.selectedCardIds, defaulting to empty array', () => {
				const effect = mock<DiscardFromHandEffect>();
				const game = mock<ReadonlyGameState>();
				const state = makeState(effect, game);

				const withIds = chooseCardsStep.then(state, {
					resolvedTargetIds: ['skl1', 'skl2']
				} as unknown as ResolveTargetState);
				expect(withIds.selectedCardIds).toEqual(['skl1', 'skl2']);

				const withoutIds = chooseCardsStep.then(state, {} as unknown as ResolveTargetState);
				expect(withoutIds.selectedCardIds).toEqual([]);
			});
		});

		// ── discardCards body step ────────────────────────────────────────

		describe('discardCards mutate step', () => {
			const mutateStep = forEachStep.steps.discardCards as ComputeStep<DiscardFromHandEffectState>;

			it('moves each selected card to the top of its discard pile', () => {
				const card1 = mock<MutableCardState>();
				const card2 = mock<MutableCardState>();
				const effect = mock<DiscardFromHandEffect>();

				const game = mock<ReadonlyGameState>();
				game.mutate.mockImplementation((cb: (game: MutableGameState) => void) => {
					const mutableGame = mock<MutableGameState>();
					// requireCard has overloaded signatures; use any to bypass
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					(mutableGame as any).requireCard.mockImplementation((id: string) =>
						id === 'skl1' ? card1 : card2
					);
					cb(mutableGame);
					return game;
				});

				const state = makeState(effect, game);
				state.selectedCardIds = ['skl1', 'skl2'];

				mutateStep.logic(state);

				expect(card1.moveToTopOfDiscardPile).toHaveBeenCalled();
				expect(card2.moveToTopOfDiscardPile).toHaveBeenCalled();
			});

			it('returns the mutated game state', () => {
				const effect = mock<DiscardFromHandEffect>();
				const mutatedGame = mock<ReadonlyGameState>();

				const game = mock<ReadonlyGameState>();
				game.mutate.mockReturnValue(mutatedGame);

				const state = makeState(effect, game);
				state.selectedCardIds = [];

				const result = mutateStep.logic(state);

				expect(result!.game).toBe(mutatedGame);
			});
		});
	});
});
