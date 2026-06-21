import type { DefendEffect } from '@songsofdoom/game';
import { instructions } from '../../core/instructions';
import { ProcedureId } from '../../core/procedureid';
import type { EffectProcedureState } from '../core/triggereffect';

export type DefendEffectState = EffectProcedureState<DefendEffect>;

const { define } = instructions<DefendEffectState>();

export const defendEffectProc = define({
	id: ProcedureId.DefendEffect,
	steps: {
		compute: (state) => state
	}
});
