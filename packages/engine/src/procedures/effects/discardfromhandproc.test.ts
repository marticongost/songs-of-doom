import { mock } from '@songsofdoom/common/test-utils';
import { Target, type DiscardFromHandEffect } from '@songsofdoom/game';
import { describe, expect, it } from 'vitest';
import { ComputeStep, DispatchStep, ForEachStep } from '../../core/steps';
import type { MutableCardState } from '../../state/cardstate';
import type { MutableGameState, ReadonlyGameState } from '../../state/gamestate';
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
		const resolvePlayersStep = discardFromHandEffectProc.steps
			.resolvePlayers as DispatchStep<DiscardFromHandEffectState>;

		it('resolves players using effect.players', () => {
			const playersTarget = new Target('player');
			const effect = mock<DiscardFromHandEffect>({ players: playersTarget });
			const game = mock<ReadonlyGameState>({
				determinePossibleTargets: () => ['plr1'],
				evaluateScalar: () => 1
			});
			const state = makeState(effect, game);

			const resultStep = resolvePlayersStep.factory(state);
			expect(resultStep).toBeInstanceOf(ComputeStep);

			expect(game.determinePossibleTargets).toHaveBeenCalled();
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const calledTarget = (game.determinePossibleTargets as any).mock.calls[0][0] as Target;
			expect(calledTarget).toBe(playersTarget);

			const result = (resultStep as ComputeStep<DiscardFromHandEffectState>).logic(state);
			expect(result!.playerIds).toEqual(['plr1']);
		});

		it('defaults to active-player when players is undefined', () => {
			const effect = mock<DiscardFromHandEffect>({ players: undefined });
			const game = mock<ReadonlyGameState>({
				determinePossibleTargets: () => ['plr1'],
				evaluateScalar: () => 1
			});
			const state = makeState(effect, game);

			resolvePlayersStep.factory(state);
			expect(game.determinePossibleTargets).toHaveBeenCalled();
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const calledTarget = (game.determinePossibleTargets as any).mock.calls[0][0] as Target;
			expect(calledTarget).toBeInstanceOf(Target);
		});

		it('saves an empty array when no players match', () => {
			const effect = mock<DiscardFromHandEffect>();
			const game = mock<ReadonlyGameState>({
				determinePossibleTargets: () => [],
				evaluateScalar: () => 1
			});
			const state = makeState(effect, game);

			const resultStep = resolvePlayersStep.factory(state);
			expect(resultStep).toBeInstanceOf(ComputeStep);

			const result = (resultStep as ComputeStep<DiscardFromHandEffectState>).logic(state);
			expect(result!.playerIds).toEqual([]);
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
			const chooseCardsStep = forEachStep.steps
				.chooseCards as DispatchStep<DiscardFromHandEffectState>;

			it('resolves cards using effect.cards', () => {
				const cardsTarget = new Target('skill');
				const effect = mock<DiscardFromHandEffect>({ cards: cardsTarget });
				const game = mock<ReadonlyGameState>({
					determinePossibleTargets: () => ['skl1'],
					evaluateScalar: () => 1
				});
				const state = makeState(effect, game);

				chooseCardsStep.factory(state);
				expect(game.determinePossibleTargets).toHaveBeenCalled();
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const calledTarget = (game.determinePossibleTargets as any).mock.calls[0][0] as Target;
				expect(calledTarget).toBe(cardsTarget);
			});

			it('saves resolved IDs to state.selectedCardIds', () => {
				const effect = mock<DiscardFromHandEffect>();
				const game = mock<ReadonlyGameState>({
					determinePossibleTargets: () => ['skl1', 'skl2'],
					evaluateScalar: () => 3
				});
				const state = makeState(effect, game);

				const resultStep = chooseCardsStep.factory(state);
				expect(resultStep).toBeInstanceOf(ComputeStep);

				const result = (resultStep as ComputeStep<DiscardFromHandEffectState>).logic(state);
				expect(result!.selectedCardIds).toEqual(['skl1', 'skl2']);
			});

			it('saves an empty array when no cards match', () => {
				const effect = mock<DiscardFromHandEffect>();
				const game = mock<ReadonlyGameState>({
					determinePossibleTargets: () => [],
					evaluateScalar: () => 1
				});
				const state = makeState(effect, game);

				const resultStep = chooseCardsStep.factory(state);
				expect(resultStep).toBeInstanceOf(ComputeStep);

				const result = (resultStep as ComputeStep<DiscardFromHandEffectState>).logic(state);
				expect(result!.selectedCardIds).toEqual([]);
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
