import type { ModifyRollEffect } from '@songsofdoom/game';
import { instructions } from '../../core/instructions';
import { ProcedureId } from '../../core/procedureid';
import type { EffectProcedureState } from '../core/triggereffect';

export type ModifyRollEffectState = EffectProcedureState<ModifyRollEffect>;

const { define } = instructions<ModifyRollEffectState>();

export const modifyRollEffectProc = define({
	id: ProcedureId.ModifyRollEffect,
	steps: {
		compute: (state) => state
	}
});
