import type { ModifyGatheredCluesEffect } from '@songsofdoom/game';
import { instructions } from '../../core/instructions';
import { ProcedureId } from '../../core/procedureid';
import type { EffectProcedureState } from '../core/triggereffect';

export type ModifyGatheredCluesEffectState = EffectProcedureState<ModifyGatheredCluesEffect>;

const { define } = instructions<ModifyGatheredCluesEffectState>();

export const modifyGatheredCluesEffectProc = define({
	id: ProcedureId.ModifyGatheredCluesEffect,
	steps: {
		compute: (state) => state
	}
});
