import type { SanityLossEffect } from '@songsofdoom/game';
import { instructions } from '../../core/instructions';
import { ProcedureId } from '../../core/procedureid';
import type { EffectProcedureState } from '../core/triggereffect';

export type SanityLossEffectState = EffectProcedureState<SanityLossEffect>;

const { define } = instructions<SanityLossEffectState>();

export const sanityLossEffectProc = define({
	id: ProcedureId.SanityLossEffect,
	steps: {
		compute: (state) => state
	}
});
