import type { DiscardEffect } from '@songsofdoom/game';
import { instructions } from '../../core/instructions';
import { ProcedureId } from '../../core/procedureid';
import type { EffectProcedureState } from '../core/triggereffect';

export type DiscardEffectState = EffectProcedureState<DiscardEffect>;

const { define, mutateGameState } = instructions<DiscardEffectState>();

export const discardEffectProc = define({
	id: ProcedureId.DiscardEffect,
	steps: {
		discard: mutateGameState((_state, game) => {
			const card = game.requireActiveCard();
			card.moveToTopOfDiscardPile(game);
		})
	}
});
