import type { InvestigateEffect } from '@songsofdoom/game';
import { instructions } from '../../core/instructions';
import { ProcedureId } from '../../core/procedureid';
import type { EffectProcedureState } from '../core/triggereffect';

export type InvestigateEffectState = EffectProcedureState<InvestigateEffect>;

const { define } = instructions<InvestigateEffectState>();

export const investigateEffectProc = define({
	id: ProcedureId.InvestigateEffect,
	steps: {
		compute: (state) => state
	}
});
