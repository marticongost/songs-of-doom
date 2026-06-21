import type { PayEffect } from '@songsofdoom/game';
import { instructions } from '../../core/instructions';
import { ProcedureId } from '../../core/procedureid';
import type { EffectProcedureState } from '../core/triggereffect';

export type PayEffectState = EffectProcedureState<PayEffect>;

const { define } = instructions<PayEffectState>();

export const payEffectProc = define({
	id: ProcedureId.PayEffect,
	steps: {
		compute: (state) => state
	}
});
