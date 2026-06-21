import type { GoTowardsEffect } from '@songsofdoom/game';
import { instructions } from '../../core/instructions';
import { ProcedureId } from '../../core/procedureid';
import type { EffectProcedureState } from '../core/triggereffect';

export type GoTowardsEffectState = EffectProcedureState<GoTowardsEffect>;

const { define } = instructions<GoTowardsEffectState>();

export const goTowardsEffectProc = define({
	id: ProcedureId.GoTowardsEffect,
	steps: {
		compute: (state) => state
	}
});
