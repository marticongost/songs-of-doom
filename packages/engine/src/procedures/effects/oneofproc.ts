import type { OneOfEffect } from '@songsofdoom/game';
import { instructions } from '../../core/instructions';
import { ProcedureId } from '../../core/procedureid';
import type { EffectProcedureState } from '../core/triggereffect';

export type OneOfEffectState = EffectProcedureState<OneOfEffect>;

const { define } = instructions<OneOfEffectState>();

export const oneOfEffectProc = define({
	id: ProcedureId.OneOfEffect,
	steps: {
		compute: (state) => state
	}
});
