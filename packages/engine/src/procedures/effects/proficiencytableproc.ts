import type { ProficiencyTableEffect } from '@songsofdoom/game';
import { instructions } from '../../core/instructions';
import { ProcedureId } from '../../core/procedureid';
import type { EffectProcedureState } from '../core/triggereffect';

export type ProficiencyTableEffectState = EffectProcedureState<ProficiencyTableEffect>;

const { define } = instructions<ProficiencyTableEffectState>();

export const proficiencyTableEffectProc = define({
	id: ProcedureId.ProficiencyTableEffect,
	steps: {
		compute: (state) => state
	}
});
