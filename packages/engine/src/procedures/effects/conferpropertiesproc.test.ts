import { mock } from '@songsofdoom/common/test-utils';
import type { ConferPropertiesEffect, Property } from '@songsofdoom/game';
import { describe, expect, it } from 'vitest';
import { ComputeStep } from '../../core/steps';
import type { MutableCardState } from '../../state/cardstate';
import type { MutableGameState, ReadonlyGameState } from '../../state/gamestate';
import {
	conferPropertiesEffectProc,
	type ConferPropertiesEffectState
} from './conferpropertiesproc';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeState(
	effect: ConferPropertiesEffect,
	game: ReadonlyGameState
): ConferPropertiesEffectState {
	return { effect, game, status: 'ongoing' } as ConferPropertiesEffectState;
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('conferPropertiesEffectProc', () => {
	const mutateStep = conferPropertiesEffectProc.steps
		.mutate as ComputeStep<ConferPropertiesEffectState>;

	describe('mutate step', () => {
		it('calls addProperty on the target for each property in the effect', () => {
			const property1 = mock<Property>();
			const property2 = mock<Property>();
			const effect = mock<ConferPropertiesEffect>({ properties: [property1, property2] });
			const targetEntity = mock<MutableCardState>();

			const game = mock<ReadonlyGameState>();
			game.mutate.mockImplementation((cb) => {
				const mutableGame = mock<MutableGameState>({ requireTarget: () => targetEntity });
				cb(mutableGame);
				return game;
			});

			mutateStep.logic(makeState(effect, game));

			expect(targetEntity.addProperty).toHaveBeenCalledWith(property1);
			expect(targetEntity.addProperty).toHaveBeenCalledWith(property2);
		});

		it('returns the mutated game state', () => {
			const effect = mock<ConferPropertiesEffect>({ properties: [] });
			const mutatedGame = mock<ReadonlyGameState>();
			const game = mock<ReadonlyGameState>();
			game.mutate.mockReturnValue(mutatedGame);

			const result = mutateStep.logic(makeState(effect, game));

			expect(result!.game).toBe(mutatedGame);
		});
	});
});
