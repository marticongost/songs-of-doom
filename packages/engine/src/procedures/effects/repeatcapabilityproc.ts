import type { RepeatCapabilityEffect } from '@songsofdoom/game';
import { instructions } from '../../core/instructions';
import { ProcedureId } from '../../core/procedureid';
import type { EffectProcedureState } from '../core/triggereffect';

export type RepeatCapabilityEffectState = EffectProcedureState<RepeatCapabilityEffect>;

const { define } = instructions<RepeatCapabilityEffectState>();

export const repeatCapabilityEffectProc = define({
	id: ProcedureId.RepeatCapabilityEffect,
	steps: {
		compute: (state) => state
	}
});
