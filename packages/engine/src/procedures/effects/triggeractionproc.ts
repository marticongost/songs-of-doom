import type { TriggerActionEffect } from '@songsofdoom/game';
import { instructions } from '../../core/instructions';
import { ProcedureId } from '../../core/procedureid';
import type { EffectProcedureState } from '../core/triggereffect';

export type TriggerActionEffectState = EffectProcedureState<TriggerActionEffect>;

const { define } = instructions<TriggerActionEffectState>();

export const triggerActionEffectProc = define({
	id: ProcedureId.TriggerActionEffect,
	steps: {
		compute: (state) => state
	}
});
