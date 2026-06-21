import type { ModifyConcentrationEffect } from '@songsofdoom/game';
import { instructions } from '../../core/instructions';
import { ProcedureId } from '../../core/procedureid';
import type { EffectProcedureState } from '../core/triggereffect';

export type ModifyConcentrationEffectState = EffectProcedureState<ModifyConcentrationEffect>;

const { define } = instructions<ModifyConcentrationEffectState>();

export const modifyConcentrationEffectProc = define({
	id: ProcedureId.ModifyConcentrationEffect,
	steps: {
		compute: (state) => state
	}
});
