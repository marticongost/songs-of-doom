import type { ModifyDamageEffect } from '@songsofdoom/game';
import { instructions } from '../../core/instructions';
import { ProcedureId } from '../../core/procedureid';
import type { EffectProcedureState } from '../core/triggereffect';

export type ModifyDamageEffectState = EffectProcedureState<ModifyDamageEffect>;

const { define } = instructions<ModifyDamageEffectState>();

export const modifyDamageEffectProc = define({
	id: ProcedureId.ModifyDamageEffect,
	steps: {
		compute: (state) => state
	}
});
