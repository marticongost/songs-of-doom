import type { ChaseEffect } from '@songsofdoom/game';
import { instructions } from '../../core/instructions';
import { ProcedureId } from '../../core/procedureid';
import type { EffectProcedureState } from '../core/triggereffect';

export type ChaseEffectState = EffectProcedureState<ChaseEffect>;

const { define } = instructions<ChaseEffectState>();

export const chaseEffectProc = define({
	id: ProcedureId.ChaseEffect,
	steps: {
		compute: (state) => state
	}
});
