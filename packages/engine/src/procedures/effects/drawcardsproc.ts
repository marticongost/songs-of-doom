import type { DrawCardsEffect } from '@songsofdoom/game';
import { instructions } from '../../core/instructions';
import { ProcedureId } from '../../core/procedureid';
import type { EffectProcedureState } from '../core/triggereffect';

export type DrawCardsEffectState = EffectProcedureState<DrawCardsEffect>;

const { define, mutateGameState } = instructions<DrawCardsEffectState>();

export const drawCardsEffectProc = define({
	id: ProcedureId.DrawCardsEffect,
	steps: {
		draw: mutateGameState((state, game) => {
			const player = game.requireActivePlayer();
			const amount = game.evaluateScalar(state.effect.amount);
			player.drawFromDeck(game, amount);
		})
	}
});
