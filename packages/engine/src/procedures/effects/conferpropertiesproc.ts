import type { ConferPropertiesEffect } from '@songsofdoom/game';
import { instructions } from '../../core/instructions';
import { ProcedureId } from '../../core/procedureid';
import type { EffectProcedureState } from '../core/triggereffect';

export type ConferPropertiesEffectState = EffectProcedureState<ConferPropertiesEffect>;

const { define, mutateGameState } = instructions<ConferPropertiesEffectState>();

export const conferPropertiesEffectProc = define({
	id: ProcedureId.ConferPropertiesEffect,
	steps: {
		mutate: mutateGameState((state, game) => {
			const target = game.requireTarget();
			for (const conferedProperty of state.effect.properties) {
				target.addProperty(conferedProperty);
			}
		})
	}
});
