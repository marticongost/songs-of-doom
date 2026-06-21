import type { SaveTargetToVariableEffect } from '@songsofdoom/game';
import { instructions } from '../../core/instructions';
import { ProcedureId } from '../../core/procedureid';
import type { EffectProcedureState } from '../core/triggereffect';

export type SaveTargetToVariableEffectState = EffectProcedureState<SaveTargetToVariableEffect>;

const { define } = instructions<SaveTargetToVariableEffectState>();

export const saveTargetToVariableEffectProc = define({
	id: ProcedureId.SaveTargetToVariableEffect,
	steps: {
		compute: (state) => state
	}
});
