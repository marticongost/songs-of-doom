import type { RemoveChargesEffect } from '@songsofdoom/game';
import { instructions } from '../../core/instructions';
import { ProcedureId } from '../../core/procedureid';
import type { EffectProcedureState } from '../core/triggereffect';

export type RemoveChargesEffectState = EffectProcedureState<RemoveChargesEffect>;

const { define } = instructions<RemoveChargesEffectState>();

export const removeChargesEffectProc = define({
	id: ProcedureId.RemoveChargesEffect,
	steps: {
		compute: (state) => state
	}
});
