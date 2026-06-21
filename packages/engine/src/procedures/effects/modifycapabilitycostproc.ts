import type { ModifyCapabilityCostEffect } from '@songsofdoom/game';
import { instructions } from '../../core/instructions';
import { ProcedureId } from '../../core/procedureid';
import type { EffectProcedureState } from '../core/triggereffect';

export type ModifyCapabilityCostEffectState = EffectProcedureState<ModifyCapabilityCostEffect>;

const { define } = instructions<ModifyCapabilityCostEffectState>();

export const modifyCapabilityCostEffectProc = define({
	id: ProcedureId.ModifyCapabilityCostEffect,
	steps: {
		compute: (state) => state
	}
});
