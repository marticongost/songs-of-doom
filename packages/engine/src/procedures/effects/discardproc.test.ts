import { mock } from '@songsofdoom/common/test-utils';
import type { DiscardEffect } from '@songsofdoom/game';
import { describe, expect, it } from 'vitest';
import { ComputeStep } from '../../core/steps';
import type { MutableCardState } from '../../state/cardstate';
import type { MutableGameState, ReadonlyGameState } from '../../state/gamestate';
import { discardEffectProc, type DiscardEffectState } from './discardproc';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeState(effect: DiscardEffect, game: ReadonlyGameState): DiscardEffectState {
	return { effect, game, status: 'ongoing' } as DiscardEffectState;
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('discardEffectProc', () => {
	const discardStep = discardEffectProc.steps.discard as ComputeStep<DiscardEffectState>;

	describe('discard step', () => {
		it('moves the active card to the top of its discard pile', () => {
			const effect = mock<DiscardEffect>();
			const activeCard = mock<MutableCardState>();

			const game = mock<ReadonlyGameState>();
			game.mutate.mockImplementation((cb: (game: MutableGameState) => void) => {
				const mutableGame = mock<MutableGameState>({ requireActiveCard: () => activeCard });
				cb(mutableGame);
				return game;
			});

			discardStep.logic(makeState(effect, game));

			expect(activeCard.moveToTopOfDiscardPile).toHaveBeenCalledWith(expect.anything());
		});

		it('returns the mutated game state', () => {
			const effect = mock<DiscardEffect>();
			const mutatedGame = mock<ReadonlyGameState>();

			const game = mock<ReadonlyGameState>();
			game.mutate.mockReturnValue(mutatedGame);

			const result = discardStep.logic(makeState(effect, game));

			expect(result!.game).toBe(mutatedGame);
		});
	});
});
