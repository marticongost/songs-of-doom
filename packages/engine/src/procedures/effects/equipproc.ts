import type { EquipEffect } from '@songsofdoom/game';
import { instructions } from '../../core/instructions';
import { ProcedureId } from '../../core/procedureid';
import type { EffectProcedureState } from '../core/triggereffect';

export type EquipEffectState = EffectProcedureState<EquipEffect>;

const { define } = instructions<EquipEffectState>();

export const equipEffectProc = define({
	id: ProcedureId.EquipEffect,
	steps: {
		compute: (state) => state
	}
});
