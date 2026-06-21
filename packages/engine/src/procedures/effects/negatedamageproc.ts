import type { NegateDamageEffect } from '@songsofdoom/game';
import { instructions } from '../../core/instructions';
import { ProcedureId } from '../../core/procedureid';
import type { EffectProcedureState } from '../core/triggereffect';

export type NegateDamageEffectState = EffectProcedureState<NegateDamageEffect>;

const { define } = instructions<NegateDamageEffectState>();

export const negateDamageEffectProc = define({
	id: ProcedureId.NegateDamageEffect,
	steps: {
		compute: (state) => state
	}
});
