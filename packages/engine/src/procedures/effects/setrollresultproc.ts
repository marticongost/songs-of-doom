import type { SetRollResultEffect } from '@songsofdoom/game';
import { instructions } from '../../core/instructions';
import { ProcedureId } from '../../core/procedureid';
import type { EffectProcedureState } from '../core/triggereffect';

export type SetRollResultEffectState = EffectProcedureState<SetRollResultEffect>;

const { define } = instructions<SetRollResultEffectState>();

export const setRollResultEffectProc = define({
	id: ProcedureId.SetRollResultEffect,
	steps: {
		compute: (state) => state
	}
});
