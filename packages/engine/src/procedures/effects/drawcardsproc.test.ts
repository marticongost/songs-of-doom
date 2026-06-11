import { mock } from '@songsofdoom/common/test-utils';
import type { DrawCardsEffect } from '@songsofdoom/game';
import { describe, expect, it } from 'vitest';
import { ComputeStep } from '../../core/steps';
import type { MutableGameState, ReadonlyGameState } from '../../state/gamestate';
import type { MutablePlayerState } from '../../state/playerstate';
import { drawCardsEffectProc, type DrawCardsEffectState } from './drawcardsproc';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeState(effect: DrawCardsEffect, game: ReadonlyGameState): DrawCardsEffectState {
	return { effect, game, status: 'ongoing' } as DrawCardsEffectState;
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('drawCardsEffectProc', () => {
	const drawStep = drawCardsEffectProc.steps.draw as ComputeStep<DrawCardsEffectState>;

	describe('draw step', () => {
		it('makes the active player draw the evaluated amount of cards', () => {
			const effect = mock<DrawCardsEffect>({ amount: 3 });
			const activePlayer = mock<MutablePlayerState>();

			const game = mock<ReadonlyGameState>();
			game.mutate.mockImplementation((cb: (game: MutableGameState) => void) => {
				const mutableGame = mock<MutableGameState>({
					requireActivePlayer: () => activePlayer,
					evaluateScalar: () => 3
				});
				cb(mutableGame);
				return game;
			});

			drawStep.logic(makeState(effect, game));

			expect(activePlayer.drawFromDeck).toHaveBeenCalledWith(expect.anything(), 3);
		});

		it('evaluates scalar expressions on the mutable game state', () => {
			const effect = mock<DrawCardsEffect>({ amount: 2 });
			const activePlayer = mock<MutablePlayerState>();
			let capturedMutableGame: MutableGameState | undefined;

			const game = mock<ReadonlyGameState>();
			game.mutate.mockImplementation((cb: (game: MutableGameState) => void) => {
				const mutableGame = mock<MutableGameState>({
					requireActivePlayer: () => activePlayer,
					evaluateScalar: () => 2
				});
				capturedMutableGame = mutableGame;
				cb(mutableGame);
				return game;
			});

			drawStep.logic(makeState(effect, game));

			expect(capturedMutableGame!.evaluateScalar).toHaveBeenCalledWith(effect.amount);
			expect(activePlayer.drawFromDeck).toHaveBeenCalledWith(expect.anything(), 2);
		});

		it('returns the mutated game state', () => {
			const effect = mock<DrawCardsEffect>({ amount: 1 });
			const mutatedGame = mock<ReadonlyGameState>();

			const game = mock<ReadonlyGameState>();
			game.mutate.mockReturnValue(mutatedGame);

			const result = drawStep.logic(makeState(effect, game));

			expect(result!.game).toBe(mutatedGame);
		});
	});
});
