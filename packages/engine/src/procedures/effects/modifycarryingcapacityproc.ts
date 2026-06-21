import type { ModifyCarryingCapacityEffect } from '@songsofdoom/game';
import { instructions } from '../../core/instructions';
import { ProcedureId } from '../../core/procedureid';
import type { EffectProcedureState } from '../core/triggereffect';

export type ModifyCarryingCapacityEffectState = EffectProcedureState<ModifyCarryingCapacityEffect>;

const { define } = instructions<ModifyCarryingCapacityEffectState>();

export const modifyCarryingCapacityEffectProc = define({
	id: ProcedureId.ModifyCarryingCapacityEffect,
	steps: {
		compute: (state) => state
	}
});
