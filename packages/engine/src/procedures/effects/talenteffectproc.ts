import type { TalentEffect } from '@songsofdoom/game';
import { instructions } from '../../core/instructions';
import { ProcedureId } from '../../core/procedureid';
import type { EffectProcedureState } from '../core/triggereffect';

export type TalentEffectState = EffectProcedureState<TalentEffect>;

const { define } = instructions<TalentEffectState>();

export const talentEffectProc = define({
	id: ProcedureId.TalentEffect,
	steps: {
		compute: (state) => state
	}
});
