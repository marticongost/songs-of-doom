import type { TransformFocusEffect } from '@songsofdoom/game';
import { instructions } from '../../core/instructions';
import { ProcedureId } from '../../core/procedureid';
import type { EffectProcedureState } from '../core/triggereffect';

export type TransformFocusEffectState = EffectProcedureState<TransformFocusEffect>;

const { define } = instructions<TransformFocusEffectState>();

export const transformFocusEffectProc = define({
	id: ProcedureId.TransformFocusEffect,
	steps: {
		compute: (state) => state
	}
});
