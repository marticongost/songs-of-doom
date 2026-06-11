import type { ConditionalEffect, Effect } from '@songsofdoom/game';
import { instructions } from '../../core/instructions';
import { ProcedureId } from '../../core/procedureid';
import type { EffectProcedureState } from '../core/triggereffect';

export interface ConditionalEffectState extends EffectProcedureState<ConditionalEffect> {
	/**
	 * The current effect being triggered (set by the forEach loop).
	 */
	currentEffect?: Effect;
}

const { define, forEach, triggerEffect } = instructions<ConditionalEffectState>();

export const conditionalEffectProc = define({
	id: ProcedureId.ConditionalEffect,
	steps: {
		triggerEffects: forEach({
			name: 'currentEffect',
			items: (state) => {
				// Evaluate cases in order; first match wins.
				for (const c of state.effect.cases) {
					if (state.game.evaluateBoolean(c.condition)) {
						return c.effects;
					}
				}
				// Fall back to default effects if present.
				return state.effect.default ?? [];
			},
			steps: {
				triggerEffect: triggerEffect({ effect: (state) => state.currentEffect! })
			}
		})
	}
});
