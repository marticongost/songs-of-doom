import type { ChangeStatsEffect } from '@songsofdoom/game';
import { instructions } from '../../core/instructions';
import { ProcedureId } from '../../core/procedureid';
import type { EffectProcedureState } from '../core/triggereffect';

export type ChangeStatsEffectState = EffectProcedureState<ChangeStatsEffect>;

const { define } = instructions<ChangeStatsEffectState>();

export const changeStatsEffectProc = define({
	id: ProcedureId.ChangeStatsEffect,
	steps: {
		compute: (state) => state
	}
});
