import type { HealEffect } from '@songsofdoom/game';
import { instructions } from '../../core/instructions';
import { ProcedureId } from '../../core/procedureid';
import type { EntityId } from '../../state/identifiers';
import type { EffectProcedureState } from '../core/triggereffect';

export interface HealEffectState extends EffectProcedureState<HealEffect> {
	targetId?: EntityId;
}

const { define, requireSingleTarget, mutateGameState } = instructions<HealEffectState>();

export const healEffectProc = define({
	id: ProcedureId.HealEffect,
	steps: {
		resolveTarget: requireSingleTarget(
			(state) => state.effect.target ?? 'current-subject',
			'targetId'
		),
		applyHealing: mutateGameState((state, game) => {
			const amount = game.evaluateScalar(state.effect.amount);
			const target = game.requireEntityState(state.targetId!) as {
				physicalTrauma: number;
			};
			const actualAmount = Math.min(amount, target.physicalTrauma);
			target.physicalTrauma -= actualAmount;
		})
	}
});
