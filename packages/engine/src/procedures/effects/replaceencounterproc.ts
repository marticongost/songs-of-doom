import type { ReplaceEncounterEffect } from '@songsofdoom/game';
import { instructions } from '../../core/instructions';
import { ProcedureId } from '../../core/procedureid';
import type { EffectProcedureState } from '../core/triggereffect';

export type ReplaceEncounterEffectState = EffectProcedureState<ReplaceEncounterEffect>;

const { define } = instructions<ReplaceEncounterEffectState>();

export const replaceEncounterEffectProc = define({
	id: ProcedureId.ReplaceEncounterEffect,
	steps: {
		compute: (state) => state
	}
});
